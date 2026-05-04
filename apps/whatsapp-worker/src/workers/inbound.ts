/**
 * Inbound consumer.
 *
 * For each `InboundJobPayload` on the inbound queue:
 *   1. Resolve identity by E.164 phone (active users only).
 *   2. Atomically flip the first-contact flag (race-safe, single SQL).
 *   3. Load or create a `whatsapp_conversations` row.
 *   4. Update the inbound `whatsapp_messages` row with `user_id` /
 *      status.
 *   5. Run the Gemini tool-use loop:
 *        - first call → text reply OR a function call;
 *        - if a function call, dispatch via `@repo/mcp-server`'s
 *          registry, then a follow-up Gemini call to fold the tool
 *          result into a natural-language reply.
 *      Tool failures surface as a graceful error message; everything
 *      is captured on the inbound `whatsapp_messages` row
 *      (`tool_calls`, `tool_results`, `llm_input_tokens`,
 *      `llm_output_tokens`, `latency_ms`).
 *   6. Append the user + model turns to the conversation buffer
 *      (capped at the last 6 entries).
 *   7. On first contact, prepend the welcome line so the vendor sees
 *      a single outbound with welcome + answer.
 *   8. Push an outbound job for the reply.
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
  runVendorTurn,
  runVendorFollowupTurn,
  extractUsage,
  firstFunctionCall,
  getVendorSystemPrompt,
  type ConversationRow,
  type ConversationTurnEntry,
  type FunctionCall,
  type FunctionDeclaration,
  type GeminiUsage,
  type InboundJobPayload,
  type InboundMessage,
} from '@repo/whatsapp-core';
import {
  callTool,
  getGeminiToolDeclarations,
  ToolDispatchError,
  type ToolContext,
  type ToolRole,
} from '@repo/mcp-server';
import { INBOUND_QUEUE_NAME, getOutboundQueue, getRedisConnection } from '../queues';

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

async function resolveIdentity(phoneE164: string): Promise<ResolvedIdentity | null> {
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
    .select({ id: whatsappConversations.id, userId: whatsappConversations.userId })
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
  if (patch.llmInputTokens !== undefined) set.llmInputTokens = patch.llmInputTokens;
  if (patch.llmOutputTokens !== undefined) set.llmOutputTokens = patch.llmOutputTokens;
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

interface VendorTurnResult {
  replyText: string;
  toolCallsLog: unknown;
  toolResultsLog: unknown;
  totalUsage: GeminiUsage;
  llmLatencyMs: number;
  errored: boolean;
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

  const fnCall: FunctionCall | null = firstFunctionCall(first);

  logLLMCall({
    phone: opts.phone,
    role: 'vendor',
    model: 'gemini-2.5-flash',
    tokensIn: firstUsage.inputTokens,
    tokensOut: firstUsage.outputTokens,
    toolCallsCount: fnCall ? 1 : 0,
    latencyMs: firstLatency,
    step: 'turn',
  });

  if (!fnCall) {
    const text = (first.text ?? '').trim();
    return {
      replyText: text.length > 0
        ? text
        : "Sorry — I couldn't generate a reply. Please try again.",
      toolCallsLog: null,
      toolResultsLog: null,
      totalUsage,
      llmLatencyMs: firstLatency,
      errored: false,
    };
  }

  toolCallsLog.push({
    name: fnCall.name,
    args: fnCall.args ?? {},
  });

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
  };
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
        // upsertConversation just ran; this should never happen, but
        // surface a graceful failure instead of crashing the consumer.
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

      // Any free-text turn implicitly cancels a stale pending
      // confirmation — Phase 7 will re-enter the state machine when it
      // detects yes/no replies.
      if (conversation.pendingAction || conversation.state !== 'idle') {
        await clearPendingAction({ conversationId: conversation.id });
      }

      const userText = (message.body ?? '').trim();
      if (userText.length === 0) {
        // No text body (image without caption, sticker, etc.). Don't
        // spend tokens — fall back to a friendly nudge.
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

      const tools = getGeminiToolDeclarations('vendor') as unknown as FunctionDeclaration[];
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
        result: 'ok',
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
    console.error(
      `[inbound] job ${job?.id ?? '?'} failed: ${err.message}`
    );
  });

  return worker;
}
