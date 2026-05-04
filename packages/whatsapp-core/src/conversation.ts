/**
 * Conversation context helpers for the WhatsApp worker.
 *
 * `recent_turns` is the short-term LLM buffer — the last few user /
 * model turns the worker replays back into Gemini so the assistant has
 * a sense of the immediate thread. Capped to the last 6 entries.
 *
 * `pending_action` is reserved for the Phase 7 confirmation flow —
 * `clearPendingAction` is here so the inbound consumer can reset it
 * once the user takes any free-text turn (any pending confirmation
 * implicitly expires when the conversation moves on).
 */

import { eq, sql } from 'drizzle-orm';
import { db, whatsappConversations } from '@repo/database';

export const MAX_RECENT_TURNS = 6;

export type ConversationRole = 'user' | 'model';

export interface ConversationTurnEntry {
  role: ConversationRole;
  content: string;
  at: string;
}

export interface ConversationRow {
  id: string;
  phone: string;
  userId: string | null;
  role: string;
  recentTurns: ConversationTurnEntry[];
  pendingAction: unknown;
  state: string;
  stateData: unknown;
  lastMessageAt: Date | null;
}

function coerceTurns(value: unknown): ConversationTurnEntry[] {
  if (!Array.isArray(value)) return [];
  const turns: ConversationTurnEntry[] = [];
  for (const entry of value) {
    if (
      entry &&
      typeof entry === 'object' &&
      'role' in entry &&
      'content' in entry
    ) {
      const role = (entry as { role: unknown }).role;
      const content = (entry as { content: unknown }).content;
      const at = (entry as { at?: unknown }).at;
      if (
        (role === 'user' || role === 'model') &&
        typeof content === 'string'
      ) {
        turns.push({
          role,
          content,
          at: typeof at === 'string' ? at : new Date().toISOString(),
        });
      }
    }
  }
  return turns;
}

export async function loadConversation(
  phone: string
): Promise<ConversationRow | null> {
  const [row] = await db
    .select({
      id: whatsappConversations.id,
      phone: whatsappConversations.phone,
      userId: whatsappConversations.userId,
      role: whatsappConversations.role,
      recentTurns: whatsappConversations.recentTurns,
      pendingAction: whatsappConversations.pendingAction,
      state: whatsappConversations.state,
      stateData: whatsappConversations.stateData,
      lastMessageAt: whatsappConversations.lastMessageAt,
    })
    .from(whatsappConversations)
    .where(eq(whatsappConversations.phone, phone))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    phone: row.phone,
    userId: row.userId,
    role: row.role,
    recentTurns: coerceTurns(row.recentTurns),
    pendingAction: row.pendingAction,
    state: row.state,
    stateData: row.stateData,
    lastMessageAt: row.lastMessageAt,
  };
}

export async function appendTurn(input: {
  conversationId: string;
  role: ConversationRole;
  content: string;
}): Promise<void> {
  const [existing] = await db
    .select({ recentTurns: whatsappConversations.recentTurns })
    .from(whatsappConversations)
    .where(eq(whatsappConversations.id, input.conversationId))
    .limit(1);

  if (!existing) return;

  const turns = coerceTurns(existing.recentTurns);
  turns.push({
    role: input.role,
    content: input.content,
    at: new Date().toISOString(),
  });
  const capped =
    turns.length > MAX_RECENT_TURNS
      ? turns.slice(turns.length - MAX_RECENT_TURNS)
      : turns;

  await db
    .update(whatsappConversations)
    .set({
      recentTurns: capped,
      lastMessageAt: sql`now()`,
      updatedAt: sql`now()`,
    })
    .where(eq(whatsappConversations.id, input.conversationId));
}

export async function clearPendingAction(input: {
  conversationId: string;
}): Promise<void> {
  await db
    .update(whatsappConversations)
    .set({
      pendingAction: null,
      stateData: null,
      state: 'idle',
      updatedAt: sql`now()`,
    })
    .where(eq(whatsappConversations.id, input.conversationId));
}
