/**
 * Inbound consumer.
 *
 * For each `InboundJobPayload` on the inbound queue:
 *   1. Resolve identity by E.164 phone (active users only).
 *   2. Atomically flip the first-contact flag (race-safe, single SQL).
 *   3. Load or create a `whatsapp_conversations` row.
 *   4. Update the inbound `whatsapp_messages` row with `user_id` /
 *      status.
 *   5. **Pre-LLM gate** — if the conversation is in
 *      `awaiting_confirmation`, parse YES/NO/expired/invalid against
 *      the persisted `pending_action` *without* calling Gemini. YES
 *      executes the stored tool via `mcpRegistry.callTool` (which
 *      hits idempotency under the hood), NO cancels.
 *   6. Otherwise run the Gemini tool-use loop:
 *        - first call → text reply OR a function call;
 *        - if a function call:
 *            - if the tool requires confirmation, run its preview
 *              function (read-only), persist `pending_action`, send
 *              a deterministic confirmation message, and stop. The
 *              follow-up Gemini call is intentionally skipped — it
 *              would fight the deterministic prompt.
 *            - else dispatch via the registry, then a follow-up
 *              Gemini call to fold the tool result into a natural-
 *              language reply.
 *      Tool failures surface as a graceful error message; everything
 *      is captured on the inbound `whatsapp_messages` row
 *      (`tool_calls`, `tool_results`, `llm_input_tokens`,
 *      `llm_output_tokens`, `latency_ms`).
 *   7. Append the user + model turns to the conversation buffer
 *      (capped at the last 6 entries).
 *   8. On first contact, prepend the welcome line so the vendor sees
 *      a single outbound with welcome + answer.
 *   9. Push an outbound job for the reply.
 */

import { Worker, type Job } from 'bullmq';
import { and, eq, isNull, sql } from 'drizzle-orm';
import {
  db,
  user,
  vendors,
  whatsappConversations,
  whatsappMessages,
} from '@repo/database';
import {
  e164ToWaapiChatId,
  isE164,
  loadConversation,
  appendTurn,
  clearPendingAction,
  setPendingAction,
  bumpInvalidAttempts,
  coercePendingAction,
  parseConfirmationReply,
  detectLanguage,
  isExpired,
  AWAITING_CONFIRMATION_STATE,
  CONFIRMATION_TTL_MS,
  MAX_INVALID_CONFIRMATION_REPLIES,
  runVendorTurn,
  runVendorFollowupTurn,
  runVendorFollowupTurnMulti,
  extractUsage,
  firstFunctionCall,
  allFunctionCalls,
  getVendorSystemPrompt,
  type ConversationRow,
  type ConversationTurnEntry,
  type FunctionCall,
  type FunctionDeclaration,
  type GeminiUsage,
  type InboundJobPayload,
  type InboundMessage,
  type PendingAction,
} from '@repo/whatsapp-core';
import {
  callTool,
  getGeminiToolDeclarations,
  getTool,
  previewUpdateProductPrice,
  previewUpdateProductStock,
  previewUpdateOrderStatus,
  ToolDispatchError,
  type ToolContext,
  type ToolRole,
} from '@repo/mcp-server';
import {
  buildAppliedReply,
  buildAutoCancelReply,
  buildCancelledReply,
  buildConfirmationPrompt,
  buildExpiredReply,
  buildInvalidNudge,
} from '../confirmation';
import {
  INBOUND_QUEUE_NAME,
  getOutboundQueue,
  getRedisConnection,
} from '../queues';

const UNRECOGNIZED_REPLY =
  "We don't recognize this number. Please contact Shalmi support.";

const NO_VENDOR_REPLY =
  "We recognize you, but you don't have a vendor profile yet. " +
  'Please contact Shalmi support to get set up.';

const TOOL_ERROR_REPLY =
  "Sorry — I couldn't pull that up just now. Please try again in a moment.";

interface ResolvedIdentity {
  userId: string;
  shopName: string | null;
  vendorId: string | null;
}

async function resolveIdentity(
  phoneE164: string
): Promise<ResolvedIdentity | null> {
  const rows = await db
    .select({
      userId: user.id,
      shopName: vendors.shopName,
      vendorId: vendors.id,
      userName: user.name,
    })
    .from(user)
    .leftJoin(vendors, eq(vendors.userId, user.id))
    .where(eq(user.phoneNumber, phoneE164))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return {
    userId: row.userId,
    shopName: row.shopName ?? row.userName ?? null,
    vendorId: row.vendorId,
  };
}

interface FirstContactResult {
  isFirstContact: boolean;
}

async function atomicallyFlipFirstSeen(
  userId: string
): Promise<FirstContactResult> {
  const flipped = await db
    .update(user)
    .set({
      whatsappFirstSeenAt: sql`now()`,
      whatsappLastSeenAt: sql`now()`,
    })
    .where(and(eq(user.id, userId), isNull(user.whatsappFirstSeenAt)))
    .returning({ id: user.id });

  if (flipped.length > 0) {
    return { isFirstContact: true };
  }

  await db
    .update(user)
    .set({ whatsappLastSeenAt: sql`now()` })
    .where(eq(user.id, userId));

  return { isFirstContact: false };
}

async function upsertConversation(
  phoneE164: string,
  userId: string
): Promise<void> {
  const [existing] = await db
    .select({
      id: whatsappConversations.id,
      userId: whatsappConversations.userId,
    })
    .from(whatsappConversations)
    .where(eq(whatsappConversations.phone, phoneE164))
    .limit(1);

  if (!existing) {
    await db
      .insert(whatsappConversations)
      .values({
        phone: phoneE164,
        userId,
        role: 'vendor',
        state: 'idle',
        recentTurns: [],
        lastMessageAt: sql`now()`,
      })
      .onConflictDoUpdate({
        target: whatsappConversations.phone,
        set: {
          userId,
          lastMessageAt: sql`now()`,
          updatedAt: sql`now()`,
        },
      });
    return;
  }

  await db
    .update(whatsappConversations)
    .set({
      userId,
      lastMessageAt: sql`now()`,
      updatedAt: sql`now()`,
    })
    .where(eq(whatsappConversations.id, existing.id));
}

interface InboundUpdate {
  userId: string | null;
  status: string;
  toolCalls?: unknown;
  toolResults?: unknown;
  llmInputTokens?: number;
  llmOutputTokens?: number;
  latencyMs?: number;
  error?: string;
}

async function updateInboundRow(
  metaMessageId: string,
  patch: InboundUpdate
): Promise<void> {
  const set: Record<string, unknown> = {
    userId: patch.userId,
    status: patch.status,
  };
  if (patch.toolCalls !== undefined) set.toolCalls = patch.toolCalls;
  if (patch.toolResults !== undefined) set.toolResults = patch.toolResults;
  if (patch.llmInputTokens !== undefined)
    set.llmInputTokens = patch.llmInputTokens;
  if (patch.llmOutputTokens !== undefined)
    set.llmOutputTokens = patch.llmOutputTokens;
  if (patch.latencyMs !== undefined) set.latencyMs = patch.latencyMs;
  if (patch.error !== undefined) set.error = patch.error.slice(0, 1000);

  await db
    .update(whatsappMessages)
    .set(set)
    .where(eq(whatsappMessages.metaMessageId, metaMessageId));
}

/**
 * Pick the chat-id to send a reply on. See Phase 5 log addendum 2 for
 * the @lid/@c.us split.
 */
function preferredOutboundChatId(message: InboundMessage): string {
  if (isE164(message.phone)) {
    return e164ToWaapiChatId(message.phone);
  }
  return message.chatId;
}

function buildWelcome(shopName: string | null): string {
  const greetingName = shopName?.trim() ? shopName.trim() : 'there';
  return (
    `Hi ${greetingName}, this is Shalmi. You can ask about your orders, ` +
    `update stock and prices, change order status, and more. ` +
    `Type 'help' anytime to see what I can do.`
  );
}

function turnsForLLM(turns: ConversationTurnEntry[]): {
  role: 'user' | 'model';
  content: string;
}[] {
  return turns.map((t) => ({ role: t.role, content: t.content }));
}

function logLLMCall(entry: {
  phone: string;
  role: ToolRole;
  model: string;
  tokensIn: number;
  tokensOut: number;
  toolCallsCount: number;
  latencyMs: number;
  step: 'turn' | 'followup';
}): void {
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      kind: 'llm_call',
      phone: entry.phone,
      role: entry.role,
      model: entry.model,
      step: entry.step,
      tokens_in: entry.tokensIn,
      tokens_out: entry.tokensOut,
      tool_calls_count: entry.toolCallsCount,
      latency_ms: entry.latencyMs,
    })
  );
}

/**
 * Run a tool's preview function. Returns a serializable payload that
 * the confirmation message + state row both consume. Throws if the
 * underlying lookup fails (e.g. SKU not found) — the caller should
 * surface a graceful error reply.
 */
async function runPreview(
  toolName: string,
  input: unknown,
  ctx: { subjectId: string }
): Promise<Record<string, unknown>> {
  if (toolName === 'update_product_price') {
    return (await previewUpdateProductPrice(
      input as { productIdOrSku: string; newPrice: number },
      ctx
    )) as unknown as Record<string, unknown>;
  }
  if (toolName === 'update_product_stock') {
    return (await previewUpdateProductStock(
      input as { productIdOrSku: string; newCount: number },
      ctx
    )) as unknown as Record<string, unknown>;
  }
  if (toolName === 'update_order_status') {
    return (await previewUpdateOrderStatus(
      input as { orderId: string; status: 'packed' | 'handed_to_courier' },
      ctx
    )) as unknown as Record<string, unknown>;
  }
  throw new Error(`No preview function registered for tool "${toolName}"`);
}

/**
 * Execute a previously-staged confirmation. Returns the deterministic
 * reply (built from the tool's success result) on success, or a tool
 * error reply on failure.
 */
async function executePendingAction(
  action: PendingAction,
  ctx: ToolContext
): Promise<{ reply: string; toolResult: unknown; error?: string }> {
  try {
    const result = await callTool(action.toolName, action.input, ctx);
    return {
      reply: buildAppliedReply(action, result),
      toolResult: { ok: true, result },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code = err instanceof ToolDispatchError ? err.code : 'TOOL_ERROR';
    return {
      reply: TOOL_ERROR_REPLY,
      toolResult: { ok: false, error: message, code },
      error: message,
    };
  }
}

interface VendorTurnResult {
  replyText: string;
  toolCallsLog: unknown;
  toolResultsLog: unknown;
  totalUsage: GeminiUsage;
  llmLatencyMs: number;
  errored: boolean;
  /**
   * If true, the worker has already enqueued / staged a deterministic
   * confirmation reply and the LLM follow-up should NOT run.
   */
  awaitingConfirmation: boolean;
}

async function runGeminiVendorFlow(opts: {
  message: string;
  conversation: ConversationRow;
  vendorId: string;
  phone: string;
  tools: FunctionDeclaration[];
  system: string;
}): Promise<VendorTurnResult> {
  const ctx: ToolContext = {
    role: 'vendor',
    subjectId: opts.vendorId,
    phone: opts.phone,
    conversationId: opts.conversation.id,
  };

  const conversationForLLM = turnsForLLM(opts.conversation.recentTurns);

  const totalUsage: GeminiUsage = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  };

  const toolCallsLog: unknown[] = [];
  const toolResultsLog: unknown[] = [];

  const t0 = Date.now();
  const first = await runVendorTurn({
    message: opts.message,
    conversation: conversationForLLM,
    tools: opts.tools,
    system: opts.system,
  });
  const firstLatency = Date.now() - t0;
  const firstUsage = extractUsage(first);
  totalUsage.inputTokens += firstUsage.inputTokens;
  totalUsage.outputTokens += firstUsage.outputTokens;
  totalUsage.totalTokens += firstUsage.totalTokens;

  const fnCalls: FunctionCall[] = allFunctionCalls(first);
  const fnCall: FunctionCall | null =
    fnCalls.length > 0 ? (fnCalls[0] ?? null) : firstFunctionCall(first);

  logLLMCall({
    phone: opts.phone,
    role: 'vendor',
    model: 'gemini-2.5-flash',
    tokensIn: firstUsage.inputTokens,
    tokensOut: firstUsage.outputTokens,
    toolCallsCount: fnCalls.length || (fnCall ? 1 : 0),
    latencyMs: firstLatency,
    step: 'turn',
  });

  // Compound read path — Gemini returned 2+ function calls and none
  // require confirmation. Dispatch them in parallel, then fold every
  // result into a single followup. If ANY of the calls is a write
  // tool, fall through to the single-tool path below — chained
  // confirmations are intentionally out of scope.
  if (fnCalls.length > 1) {
    const allReadOnly = fnCalls.every((fc) => {
      const t = getTool(fc.name ?? '');
      return t !== undefined && !t.requiresConfirmation;
    });

    if (allReadOnly) {
      const dispatched = await Promise.all(
        fnCalls.map(async (fc) => {
          const name = fc.name ?? '';
          const args = fc.args ?? {};
          toolCallsLog.push({ name, args });
          try {
            const data = await callTool(name, args, ctx);
            toolResultsLog.push({ name, ok: true, result: data });
            return { ok: true as const, payload: { ok: true, data } };
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            const code =
              err instanceof ToolDispatchError ? err.code : 'TOOL_ERROR';
            toolResultsLog.push({ name, ok: false, error: message, code });
            // eslint-disable-next-line no-console
            console.error(
              JSON.stringify({
                kind: 'tool_error',
                phone: opts.phone,
                tool: name,
                code,
                error: message,
              })
            );
            return {
              ok: false as const,
              payload: { ok: false, error: message, code },
            };
          }
        })
      );

      const t1 = Date.now();
      const followup = await runVendorFollowupTurnMulti({
        message: opts.message,
        conversation: conversationForLLM,
        tools: opts.tools,
        system: opts.system,
        functionCalls: fnCalls,
        functionResults: dispatched.map((d) => d.payload),
      });
      const followupLatency = Date.now() - t1;
      const followupUsage = extractUsage(followup);
      totalUsage.inputTokens += followupUsage.inputTokens;
      totalUsage.outputTokens += followupUsage.outputTokens;
      totalUsage.totalTokens += followupUsage.totalTokens;

      logLLMCall({
        phone: opts.phone,
        role: 'vendor',
        model: 'gemini-2.5-flash',
        tokensIn: followupUsage.inputTokens,
        tokensOut: followupUsage.outputTokens,
        toolCallsCount: 0,
        latencyMs: followupLatency,
        step: 'followup',
      });

      const finalText = (followup.text ?? '').trim();
      const anyErrored = dispatched.some((d) => !d.ok);
      return {
        replyText:
          finalText.length > 0
            ? finalText
            : "Sorry — I couldn't summarize that. Please try again.",
        toolCallsLog,
        toolResultsLog,
        totalUsage,
        llmLatencyMs: firstLatency + followupLatency,
        errored: anyErrored,
        awaitingConfirmation: false,
      };
    }
    // Mixed / write-bearing compound — fall through to single-tool
    // path. The first call wins; subsequent calls are dropped (same
    // pre-compound behavior, intentional for the write surface).
  }

  if (!fnCall) {
    const text = (first.text ?? '').trim();
    return {
      replyText:
        text.length > 0
          ? text
          : "Sorry — I couldn't generate a reply. Please try again.",
      toolCallsLog: null,
      toolResultsLog: null,
      totalUsage,
      llmLatencyMs: firstLatency,
      errored: false,
      awaitingConfirmation: false,
    };
  }

  toolCallsLog.push({
    name: fnCall.name,
    args: fnCall.args ?? {},
  });

  const calledName = fnCall.name ?? '';
  const calledTool = getTool(calledName);

  // Write tool path — stage a confirmation, no follow-up Gemini call.
  if (calledTool?.requiresConfirmation) {
    let preview: Record<string, unknown>;
    try {
      preview = await runPreview(calledName, fnCall.args ?? {}, ctx);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const code = err instanceof ToolDispatchError ? err.code : 'TOOL_ERROR';
      toolResultsLog.push({
        name: calledName,
        ok: false,
        stage: 'preview',
        error: message,
        code,
      });
      // eslint-disable-next-line no-console
      console.error(
        JSON.stringify({
          kind: 'preview_error',
          phone: opts.phone,
          tool: calledName,
          code,
          error: message,
        })
      );
      // Let Gemini turn this into a natural-language error reply.
      const t1 = Date.now();
      const followup = await runVendorFollowupTurn({
        message: opts.message,
        conversation: conversationForLLM,
        tools: opts.tools,
        system: opts.system,
        functionCall: fnCall,
        functionResult: { ok: false, error: message, code },
      });
      const followupLatency = Date.now() - t1;
      const followupUsage = extractUsage(followup);
      totalUsage.inputTokens += followupUsage.inputTokens;
      totalUsage.outputTokens += followupUsage.outputTokens;
      totalUsage.totalTokens += followupUsage.totalTokens;
      logLLMCall({
        phone: opts.phone,
        role: 'vendor',
        model: 'gemini-2.5-flash',
        tokensIn: followupUsage.inputTokens,
        tokensOut: followupUsage.outputTokens,
        toolCallsCount: 0,
        latencyMs: followupLatency,
        step: 'followup',
      });
      const finalText = (followup.text ?? '').trim();
      return {
        replyText: finalText.length > 0 ? finalText : TOOL_ERROR_REPLY,
        toolCallsLog,
        toolResultsLog,
        totalUsage,
        llmLatencyMs: firstLatency + followupLatency,
        errored: true,
        awaitingConfirmation: false,
      };
    }

    const language = detectLanguage(opts.message);
    const action: PendingAction = {
      toolName: calledName,
      input: (fnCall.args ?? {}) as Record<string, unknown>,
      preview,
      language,
      expiresAt: new Date(Date.now() + CONFIRMATION_TTL_MS).toISOString(),
      invalidAttempts: 0,
    };
    await setPendingAction({
      conversationId: opts.conversation.id,
      action,
    });
    toolResultsLog.push({
      name: calledName,
      ok: true,
      stage: 'preview',
      preview,
    });
    return {
      replyText: buildConfirmationPrompt(action),
      toolCallsLog,
      toolResultsLog,
      totalUsage,
      llmLatencyMs: firstLatency,
      errored: false,
      awaitingConfirmation: true,
    };
  }

  // Read tool path — dispatch immediately + follow up.
  let toolResult: Record<string, unknown>;
  let toolErrored = false;
  try {
    const dispatched = await callTool(
      fnCall.name ?? '',
      fnCall.args ?? {},
      ctx
    );
    toolResult = { ok: true, data: dispatched };
    toolResultsLog.push({ name: fnCall.name, ok: true, result: dispatched });
  } catch (err) {
    toolErrored = true;
    const message = err instanceof Error ? err.message : String(err);
    const code = err instanceof ToolDispatchError ? err.code : 'TOOL_ERROR';
    toolResult = { ok: false, error: message, code };
    toolResultsLog.push({
      name: fnCall.name,
      ok: false,
      error: message,
      code,
    });
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        kind: 'tool_error',
        phone: opts.phone,
        tool: fnCall.name,
        code,
        error: message,
      })
    );
  }

  if (toolErrored) {
    return {
      replyText: TOOL_ERROR_REPLY,
      toolCallsLog,
      toolResultsLog,
      totalUsage,
      llmLatencyMs: firstLatency,
      errored: true,
      awaitingConfirmation: false,
    };
  }

  const t1 = Date.now();
  const followup = await runVendorFollowupTurn({
    message: opts.message,
    conversation: conversationForLLM,
    tools: opts.tools,
    system: opts.system,
    functionCall: fnCall,
    functionResult: toolResult,
  });
  const followupLatency = Date.now() - t1;
  const followupUsage = extractUsage(followup);
  totalUsage.inputTokens += followupUsage.inputTokens;
  totalUsage.outputTokens += followupUsage.outputTokens;
  totalUsage.totalTokens += followupUsage.totalTokens;

  logLLMCall({
    phone: opts.phone,
    role: 'vendor',
    model: 'gemini-2.5-flash',
    tokensIn: followupUsage.inputTokens,
    tokensOut: followupUsage.outputTokens,
    toolCallsCount: 0,
    latencyMs: followupLatency,
    step: 'followup',
  });

  const finalText = (followup.text ?? '').trim();
  return {
    replyText:
      finalText.length > 0
        ? finalText
        : "Sorry — I couldn't summarize that. Please try again.",
    toolCallsLog,
    toolResultsLog,
    totalUsage,
    llmLatencyMs: firstLatency + followupLatency,
    errored: false,
    awaitingConfirmation: false,
  };
}

interface ConfirmationGateOutcome {
  reply: string;
  result:
    | 'confirmed_yes'
    | 'confirmed_no'
    | 'invalid'
    | 'auto_cancelled'
    | 'expired';
  toolCalls?: unknown;
  toolResults?: unknown;
  error?: string;
}

/**
 * Runs the confirmation state machine. Caller has already established
 * the conversation is in `awaiting_confirmation`. Returns a
 * deterministic reply and a result tag — never calls Gemini.
 */
async function handleAwaitingConfirmation(opts: {
  conversation: ConversationRow;
  action: PendingAction;
  userText: string;
  ctx: ToolContext;
}): Promise<ConfirmationGateOutcome> {
  if (isExpired(opts.action)) {
    await clearPendingAction({ conversationId: opts.conversation.id });
    return { reply: buildExpiredReply(opts.action), result: 'expired' };
  }

  const verdict = parseConfirmationReply(opts.userText);
  if (verdict === 'yes') {
    const exec = await executePendingAction(opts.action, opts.ctx);
    await clearPendingAction({ conversationId: opts.conversation.id });
    return {
      reply: exec.reply,
      result: 'confirmed_yes',
      toolCalls: [{ name: opts.action.toolName, args: opts.action.input }],
      toolResults: [
        {
          name: opts.action.toolName,
          stage: 'execute',
          ...(exec.toolResult as Record<string, unknown>),
        },
      ],
      error: exec.error,
    };
  }
  if (verdict === 'no') {
    await clearPendingAction({ conversationId: opts.conversation.id });
    return {
      reply: buildCancelledReply(opts.action),
      result: 'confirmed_no',
    };
  }

  // Invalid — bump counter and decide whether to nudge or auto-cancel.
  const nextAttempts = opts.action.invalidAttempts + 1;
  if (nextAttempts >= MAX_INVALID_CONFIRMATION_REPLIES) {
    await clearPendingAction({ conversationId: opts.conversation.id });
    return {
      reply: buildAutoCancelReply(opts.action),
      result: 'auto_cancelled',
    };
  }
  await bumpInvalidAttempts({
    conversationId: opts.conversation.id,
    action: opts.action,
  });
  return { reply: buildInvalidNudge(opts.action), result: 'invalid' };
}

export function startInboundWorker(): Worker<InboundJobPayload> {
  const worker = new Worker<InboundJobPayload>(
    INBOUND_QUEUE_NAME,
    async (job: Job<InboundJobPayload>) => {
      const { message } = job.data;
      const identity = await resolveIdentity(message.phone);

      if (!identity) {
        await updateInboundRow(message.metaMessageId, {
          userId: null,
          status: 'processed',
        });
        await getOutboundQueue().add('send', {
          chatId: preferredOutboundChatId(message),
          phone: message.phone,
          body: UNRECOGNIZED_REPLY,
          userId: null,
          inReplyToMessageId: message.metaMessageId,
        });
        return { result: 'unrecognized' };
      }

      const { isFirstContact } = await atomicallyFlipFirstSeen(identity.userId);
      await upsertConversation(message.phone, identity.userId);

      // Recognized but no vendor profile — bail out politely without
      // touching the LLM. (Vendor tools authenticate via subjectId.)
      if (!identity.vendorId) {
        await updateInboundRow(message.metaMessageId, {
          userId: identity.userId,
          status: 'processed',
        });
        const reply = isFirstContact
          ? `${buildWelcome(identity.shopName)}\n\n${NO_VENDOR_REPLY}`
          : NO_VENDOR_REPLY;
        await getOutboundQueue().add('send', {
          chatId: preferredOutboundChatId(message),
          phone: message.phone,
          body: reply,
          userId: identity.userId,
          inReplyToMessageId: message.metaMessageId,
        });
        return { result: 'no_vendor_profile' };
      }

      const conversation = await loadConversation(message.phone);
      if (!conversation) {
        await updateInboundRow(message.metaMessageId, {
          userId: identity.userId,
          status: 'failed',
          error: 'conversation row missing after upsert',
        });
        await getOutboundQueue().add('send', {
          chatId: preferredOutboundChatId(message),
          phone: message.phone,
          body: TOOL_ERROR_REPLY,
          userId: identity.userId,
          inReplyToMessageId: message.metaMessageId,
        });
        return { result: 'conversation_missing' };
      }

      const userText = (message.body ?? '').trim();

      // -------- Pre-LLM gate: awaiting confirmation? --------
      const pending =
        conversation.state === AWAITING_CONFIRMATION_STATE
          ? coercePendingAction(conversation.pendingAction)
          : null;

      if (pending) {
        const ctx: ToolContext = {
          role: 'vendor',
          subjectId: identity.vendorId,
          phone: message.phone,
          conversationId: conversation.id,
        };

        const outcome = await handleAwaitingConfirmation({
          conversation,
          action: pending,
          userText,
          ctx,
        });

        // Persist user turn + bot reply to the conversation buffer
        // — invalid-nudge paths included so the LLM sees the back-
        // and-forth if the user later types something else.
        if (userText.length > 0) {
          await appendTurn({
            conversationId: conversation.id,
            role: 'user',
            content: userText,
          });
        }
        await appendTurn({
          conversationId: conversation.id,
          role: 'model',
          content: outcome.reply,
        });

        await updateInboundRow(message.metaMessageId, {
          userId: identity.userId,
          status:
            outcome.result === 'expired' || outcome.result === 'auto_cancelled'
              ? 'processed'
              : 'processed',
          toolCalls: outcome.toolCalls,
          toolResults: outcome.toolResults,
          error: outcome.error,
        });

        const finalReply = isFirstContact
          ? `${buildWelcome(identity.shopName)}\n\n${outcome.reply}`
          : outcome.reply;

        await getOutboundQueue().add('send', {
          chatId: preferredOutboundChatId(message),
          phone: message.phone,
          body: finalReply,
          userId: identity.userId,
          inReplyToMessageId: message.metaMessageId,
        });

        return { result: outcome.result };
      }

      // -------- Idle path — run Gemini --------

      // Free-text turn implicitly cancels any other lingering state
      // (in case state != idle but pending was unparseable).
      if (conversation.state !== 'idle') {
        await clearPendingAction({ conversationId: conversation.id });
      }

      if (userText.length === 0) {
        await updateInboundRow(message.metaMessageId, {
          userId: identity.userId,
          status: 'processed',
        });
        const reply = isFirstContact
          ? `${buildWelcome(identity.shopName)}\n\nI can only read text right now. Please type your question.`
          : 'I can only read text right now. Please type your question.';
        await getOutboundQueue().add('send', {
          chatId: preferredOutboundChatId(message),
          phone: message.phone,
          body: reply,
          userId: identity.userId,
          inReplyToMessageId: message.metaMessageId,
        });
        return { result: 'non_text' };
      }

      const tools = getGeminiToolDeclarations(
        'vendor'
      ) as unknown as FunctionDeclaration[];
      const system = getVendorSystemPrompt();

      let flow: VendorTurnResult;
      try {
        flow = await runGeminiVendorFlow({
          message: userText,
          conversation,
          vendorId: identity.vendorId,
          phone: message.phone,
          tools,
          system,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        // eslint-disable-next-line no-console
        console.error(
          JSON.stringify({
            kind: 'llm_error',
            phone: message.phone,
            error: errorMsg,
          })
        );
        await updateInboundRow(message.metaMessageId, {
          userId: identity.userId,
          status: 'failed',
          error: errorMsg,
        });
        await getOutboundQueue().add('send', {
          chatId: preferredOutboundChatId(message),
          phone: message.phone,
          body: TOOL_ERROR_REPLY,
          userId: identity.userId,
          inReplyToMessageId: message.metaMessageId,
        });
        return { result: 'llm_error' };
      }

      // Persist user + model turns to the conversation buffer.
      await appendTurn({
        conversationId: conversation.id,
        role: 'user',
        content: userText,
      });
      await appendTurn({
        conversationId: conversation.id,
        role: 'model',
        content: flow.replyText,
      });

      await updateInboundRow(message.metaMessageId, {
        userId: identity.userId,
        status: 'processed',
        toolCalls: flow.toolCallsLog,
        toolResults: flow.toolResultsLog,
        llmInputTokens: flow.totalUsage.inputTokens,
        llmOutputTokens: flow.totalUsage.outputTokens,
        latencyMs: flow.llmLatencyMs,
      });

      const finalReply = isFirstContact
        ? `${buildWelcome(identity.shopName)}\n\n${flow.replyText}`
        : flow.replyText;

      await getOutboundQueue().add('send', {
        chatId: preferredOutboundChatId(message),
        phone: message.phone,
        body: finalReply,
        userId: identity.userId,
        inReplyToMessageId: message.metaMessageId,
      });

      return {
        result: flow.awaitingConfirmation ? 'awaiting_confirmation' : 'ok',
        isFirstContact,
        toolCalls: flow.toolCallsLog,
        tokensIn: flow.totalUsage.inputTokens,
        tokensOut: flow.totalUsage.outputTokens,
        errored: flow.errored,
      };
    },
    {
      connection: getRedisConnection(),
      concurrency: 5,
    }
  );

  worker.on('failed', (job, err) => {
    // eslint-disable-next-line no-console
    console.error(`[inbound] job ${job?.id ?? '?'} failed: ${err.message}`);
  });

  return worker;
}
