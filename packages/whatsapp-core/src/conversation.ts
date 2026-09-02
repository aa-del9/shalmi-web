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

export const AWAITING_CONFIRMATION_STATE = 'awaiting_confirmation';
export const CONFIRMATION_TTL_MS = 5 * 60 * 1000;
export const MAX_INVALID_CONFIRMATION_REPLIES = 3;

export interface PendingAction {
  toolName: string;
  input: Record<string, unknown>;
  preview: Record<string, unknown>;
  language: 'en' | 'ur-roman';
  expiresAt: string;
  invalidAttempts: number;
}

export async function setPendingAction(input: {
  conversationId: string;
  action: PendingAction;
}): Promise<void> {
  await db
    .update(whatsappConversations)
    .set({
      pendingAction: input.action,
      state: AWAITING_CONFIRMATION_STATE,
      stateData: { startedAt: new Date().toISOString() },
      updatedAt: sql`now()`,
    })
    .where(eq(whatsappConversations.id, input.conversationId));
}

export async function bumpInvalidAttempts(input: {
  conversationId: string;
  action: PendingAction;
}): Promise<void> {
  const next: PendingAction = {
    ...input.action,
    invalidAttempts: input.action.invalidAttempts + 1,
  };
  await db
    .update(whatsappConversations)
    .set({
      pendingAction: next,
      updatedAt: sql`now()`,
    })
    .where(eq(whatsappConversations.id, input.conversationId));
}

export function coercePendingAction(value: unknown): PendingAction | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (
    typeof v.toolName !== 'string' ||
    typeof v.expiresAt !== 'string' ||
    typeof v.input !== 'object' ||
    v.input === null ||
    typeof v.preview !== 'object' ||
    v.preview === null
  ) {
    return null;
  }
  const language = v.language === 'ur-roman' ? 'ur-roman' : 'en';
  const invalidAttempts =
    typeof v.invalidAttempts === 'number' && Number.isFinite(v.invalidAttempts)
      ? v.invalidAttempts
      : 0;
  return {
    toolName: v.toolName,
    input: v.input as Record<string, unknown>,
    preview: v.preview as Record<string, unknown>,
    language,
    expiresAt: v.expiresAt,
    invalidAttempts,
  };
}

const YES_TOKENS = new Set([
  'yes',
  'y',
  'ok',
  'okay',
  'confirm',
  'confirmed',
  'sure',
  'yep',
  'yeah',
  'han',
  'haan',
  'haanji',
  'hanji',
  'ji',
  'jee',
  'jihan',
  'jihaan',
  'jeehan',
  'jeehaan',
  'theek',
  'theekhai',
  'sahi',
  'kardo',
  'krdo',
  'kardein',
]);

const NO_TOKENS = new Set([
  'no',
  'n',
  'nope',
  'cancel',
  'cancelled',
  'stop',
  'nahi',
  'nahin',
  'nai',
  'na',
  'mat',
  'matkaro',
  'rehnedo',
  'rukk',
  'ruko',
]);

/** Strip whitespace, punctuation, lowercase, collapse internal spaces. */
function canon(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export type ConfirmationParse = 'yes' | 'no' | 'invalid';

export function parseConfirmationReply(text: string): ConfirmationParse {
  const c = canon(text);
  if (c.length === 0) return 'invalid';

  // Single-token short-circuit
  const collapsed = c.replace(/\s+/g, '');
  if (YES_TOKENS.has(collapsed)) return 'yes';
  if (NO_TOKENS.has(collapsed)) return 'no';

  const tokens = c.split(' ');
  for (const t of tokens) {
    if (NO_TOKENS.has(t)) return 'no';
  }
  for (const t of tokens) {
    if (YES_TOKENS.has(t)) return 'yes';
  }
  return 'invalid';
}

const ROMAN_URDU_HINTS = [
  'kya',
  'kar',
  'kr',
  'do',
  'dein',
  'kardo',
  'krdo',
  'kardein',
  'krdein',
  'ka',
  'ki',
  'ke',
  'mein',
  'main',
  'ko',
  'se',
  'pe',
  'par',
  'aur',
  'kitne',
  'kitna',
  'kitni',
  'kya',
  'hai',
  'hain',
  'tha',
  'thi',
  'thay',
  'aaye',
  'aaya',
  'aayi',
  'jao',
  'jaye',
  'jaayein',
  'mat',
  'nahi',
  'nahin',
  'han',
  'haan',
  'ji',
  'mera',
  'meri',
  'mere',
  'apna',
  'apni',
  'apne',
  'wala',
  'wali',
  'lay',
  'lo',
  'lagao',
  'rakho',
  'set',
  'price',
  'stock',
];

export function detectLanguage(text: string): 'en' | 'ur-roman' {
  const c = canon(text);
  if (c.length === 0) return 'en';
  const tokens = c.split(' ');
  for (const t of tokens) {
    if (ROMAN_URDU_HINTS.includes(t)) return 'ur-roman';
  }
  return 'en';
}

export function isExpired(action: PendingAction, now: Date = new Date()): boolean {
  const expiresAt = Date.parse(action.expiresAt);
  if (Number.isNaN(expiresAt)) return true;
  return expiresAt <= now.getTime();
}
