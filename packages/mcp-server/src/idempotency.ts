/**
 * Idempotency middleware for write tools.
 *
 * `wrapWithIdempotency(tool)` returns a tool whose handler:
 *   1. Computes a key as `<phone>:<tool_name>:<hash(input)>`.
 *   2. Looks up `whatsapp_idempotency` for an unexpired row.
 *   3. If found, returns the cached result without re-running the
 *      handler.
 *   4. Otherwise executes the original handler, persists the result
 *      with a 60-second TTL, then returns it.
 *
 * Apply only to write tools: read tools are cheap and benefit from
 * fresh data on every call.
 *
 * The cached row's primary key is `key`, so a same-input retry races
 * to a single `INSERT … ON CONFLICT DO NOTHING` — concurrent retries
 * never double-execute the underlying handler. (The first call
 * actually runs the handler; the second observes the row from step 2
 * once the first call's transaction commits.)
 *
 * Hash is sha256(JSON.stringify(input)) truncated to 16 hex chars —
 * collisions are scoped to the `<phone>:<tool>` namespace so the
 * truncation is acceptable.
 */

import { createHash } from 'node:crypto';
import { and, eq, gt, sql } from 'drizzle-orm';
import { db, whatsappIdempotency } from '@repo/database';
import type { ToolDefinition } from './types';

const TTL_MS = 60_000;

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const parts = keys.map(
    (k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`
  );
  return `{${parts.join(',')}}`;
}

export function buildIdempotencyKey(
  phone: string,
  toolName: string,
  input: unknown
): string {
  const hash = createHash('sha256')
    .update(stableStringify(input))
    .digest('hex')
    .slice(0, 16);
  return `${phone}:${toolName}:${hash}`;
}

async function lookupCached(key: string): Promise<unknown | null> {
  const [row] = await db
    .select({ result: whatsappIdempotency.result })
    .from(whatsappIdempotency)
    .where(
      and(
        eq(whatsappIdempotency.key, key),
        gt(whatsappIdempotency.expiresAt, new Date())
      )
    )
    .limit(1);
  return row ? row.result : null;
}

async function persistResult(
  key: string,
  toolName: string,
  result: unknown
): Promise<void> {
  const expiresAt = new Date(Date.now() + TTL_MS);
  await db
    .insert(whatsappIdempotency)
    .values({
      key,
      toolName,
      result: result as Record<string, unknown>,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: whatsappIdempotency.key,
      set: {
        result: result as Record<string, unknown>,
        expiresAt,
        toolName,
      },
    });
}

/**
 * Best-effort cleanup: drop any expired rows for this tool. Non-fatal
 * — runs alongside the cache write so the table stays small without a
 * dedicated cron.
 */
async function pruneExpired(toolName: string): Promise<void> {
  try {
    await db
      .delete(whatsappIdempotency)
      .where(
        and(
          eq(whatsappIdempotency.toolName, toolName),
          sql`${whatsappIdempotency.expiresAt} <= now()`
        )
      );
  } catch {
    // ignore — cache pruning isn't critical to correctness
  }
}

export function wrapWithIdempotency<I, O>(
  tool: ToolDefinition<I, O>
): ToolDefinition<I, O> {
  const wrapped: ToolDefinition<I, O> = {
    ...tool,
    handler: async (input, ctx) => {
      const key = buildIdempotencyKey(ctx.phone, tool.name, input);
      const cached = await lookupCached(key);
      if (cached !== null) {
        return cached as O;
      }

      const result = await tool.handler(input, ctx);
      await persistResult(key, tool.name, result);
      void pruneExpired(tool.name);
      return result;
    },
  };
  return wrapped;
}
