/**
 * Gemini tool-use loop harness — Phase 6 verification.
 *
 * Runs the same LLM + tool dispatch the inbound consumer runs, but
 * against a vendor picked from the DB and without going through waapi
 * or BullMQ. Useful for collecting real token counts and confirming
 * tool dispatch + follow-up text generation work end-to-end before
 * driving the real WhatsApp round-trip.
 *
 * Usage:
 *   env $(grep -v '^#' apps/whatsapp-worker/.env | xargs) \
 *     pnpm --filter whatsapp-worker tsx src/scripts/gemini-loop-harness.ts \
 *       [vendorIdOrPhone]
 */

import { eq } from 'drizzle-orm';
import { db, user, vendors } from '@repo/database';
import {
  runVendorTurn,
  runVendorFollowupTurn,
  extractUsage,
  firstFunctionCall,
  getVendorSystemPrompt,
  type FunctionDeclaration,
} from '@repo/whatsapp-core';
import {
  callTool,
  getGeminiToolDeclarations,
  ToolDispatchError,
  type ToolContext,
} from '@repo/mcp-server';

const DEFAULT_PROMPTS = [
  'show me my orders',
  'kitne pending hain',
  'any products with low stock?',
  "what's the price of the first product in my catalog",
  'help',
];

const PROMPTS = process.env.GEMINI_LOOP_PROMPTS
  ? process.env.GEMINI_LOOP_PROMPTS.split('|').map((s) => s.trim()).filter((s) => s.length > 0)
  : DEFAULT_PROMPTS;

interface VendorRow {
  vendorId: string;
  userId: string;
  phone: string;
  shopName: string;
}

async function pickVendor(arg: string | undefined): Promise<VendorRow> {
  if (arg) {
    const [byId] = await db
      .select({
        vendorId: vendors.id,
        userId: vendors.userId,
        phone: user.phoneNumber,
        shopName: vendors.shopName,
      })
      .from(vendors)
      .innerJoin(user, eq(user.id, vendors.userId))
      .where(eq(vendors.id, arg))
      .limit(1);
    if (byId && byId.phone) {
      return {
        vendorId: byId.vendorId,
        userId: byId.userId,
        phone: byId.phone,
        shopName: byId.shopName,
      };
    }
    const [byPhone] = await db
      .select({
        vendorId: vendors.id,
        userId: vendors.userId,
        phone: user.phoneNumber,
        shopName: vendors.shopName,
      })
      .from(user)
      .innerJoin(vendors, eq(vendors.userId, user.id))
      .where(eq(user.phoneNumber, arg))
      .limit(1);
    if (byPhone && byPhone.phone) {
      return {
        vendorId: byPhone.vendorId,
        userId: byPhone.userId,
        phone: byPhone.phone,
        shopName: byPhone.shopName,
      };
    }
    throw new Error(`No vendor matched "${arg}"`);
  }

  // Fallback: find a vendor with at least one product so the prompts
  // have substance.
  const [first] = await db
    .select({
      vendorId: vendors.id,
      userId: vendors.userId,
      phone: user.phoneNumber,
      shopName: vendors.shopName,
    })
    .from(vendors)
    .innerJoin(user, eq(user.id, vendors.userId))
    .limit(1);
  if (!first || !first.phone) {
    throw new Error('No vendor in DB.');
  }
  return {
    vendorId: first.vendorId,
    userId: first.userId,
    phone: first.phone,
    shopName: first.shopName,
  };
}

async function runOne(prompt: string, vendor: VendorRow): Promise<void> {
  const tools = getGeminiToolDeclarations(
    'vendor'
  ) as unknown as FunctionDeclaration[];
  const system = getVendorSystemPrompt();
  const ctx: ToolContext = {
    role: 'vendor',
    subjectId: vendor.vendorId,
    phone: vendor.phone,
    conversationId: 'gemini-loop-harness',
  };

  process.stdout.write(`\n── ${JSON.stringify(prompt)} ──\n`);

  const t0 = Date.now();
  const first = await runVendorTurn({
    message: prompt,
    conversation: [],
    tools,
    system,
  });
  const firstLatency = Date.now() - t0;
  const u1 = extractUsage(first);

  const fnCall = firstFunctionCall(first);

  process.stdout.write(
    `  turn1: tokens_in=${u1.inputTokens} tokens_out=${u1.outputTokens} ` +
      `latency=${firstLatency}ms ${
        fnCall ? `→ tool_call=${fnCall.name}` : '→ text only'
      }\n`
  );

  if (!fnCall) {
    const text = (first.text ?? '').trim();
    process.stdout.write(`  reply: ${text}\n`);
    process.stdout.write(
      `  totals: tokens_in=${u1.inputTokens} tokens_out=${u1.outputTokens}\n`
    );
    return;
  }

  let toolPayload: Record<string, unknown>;
  try {
    const dispatched = await callTool(
      fnCall.name ?? '',
      fnCall.args ?? {},
      ctx
    );
    toolPayload = { ok: true, data: dispatched };
    const summary = JSON.stringify(dispatched).slice(0, 200);
    process.stdout.write(`  tool ok: ${summary}${summary.length === 200 ? '…' : ''}\n`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code = err instanceof ToolDispatchError ? err.code : 'TOOL_ERROR';
    toolPayload = { ok: false, error: message, code };
    process.stdout.write(`  tool ERR (${code}): ${message}\n`);
  }

  const t1 = Date.now();
  const followup = await runVendorFollowupTurn({
    message: prompt,
    conversation: [],
    tools,
    system,
    functionCall: fnCall,
    functionResult: toolPayload,
  });
  const followupLatency = Date.now() - t1;
  const u2 = extractUsage(followup);
  const finalText = (followup.text ?? '').trim();

  process.stdout.write(
    `  turn2: tokens_in=${u2.inputTokens} tokens_out=${u2.outputTokens} ` +
      `latency=${followupLatency}ms\n`
  );
  process.stdout.write(`  reply: ${finalText}\n`);
  process.stdout.write(
    `  totals: tokens_in=${u1.inputTokens + u2.inputTokens} ` +
      `tokens_out=${u1.outputTokens + u2.outputTokens} ` +
      `latency=${firstLatency + followupLatency}ms\n`
  );
}

async function main(): Promise<void> {
  const arg = process.argv[2];
  const vendor = await pickVendor(arg);
  process.stdout.write(
    `vendor=${vendor.vendorId} shop=${JSON.stringify(vendor.shopName)} ` +
      `phone=${vendor.phone}\n`
  );
  // Free-tier Gemini caps at 5 requests/minute. Each prompt makes
  // up to 2 calls (turn + followup). Pace aggressively between
  // prompts to avoid 429s — sleep ~30s/prompt.
  const PACE_MS = Number(process.env.GEMINI_PACE_MS ?? 30000);
  for (let i = 0; i < PROMPTS.length; i++) {
    const prompt = PROMPTS[i];
    if (!prompt) continue;
    try {
      await runOne(prompt, vendor);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stdout.write(`  ERROR: ${msg}\n`);
    }
    if (i < PROMPTS.length - 1 && PACE_MS > 0) {
      await new Promise((r) => setTimeout(r, PACE_MS));
    }
  }
  process.exit(0);
}

main().catch((err) => {
  process.stderr.write(`harness failed: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
