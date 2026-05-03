import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

/**
 * WhatsApp + MCP build (phase 2 schema).
 *
 * `whatsapp_conversations` — one row per phone the bot has seen. Holds the
 * short-term turn buffer, current state machine position, and any pending
 * confirmation payload (filled in phase 7).
 */
export const whatsappConversations = pgTable('whatsapp_conversations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  phone: text('phone').notNull().unique(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  role: text('role').notNull().default('vendor'),
  recentTurns: jsonb('recent_turns').notNull().default([]),
  pendingAction: jsonb('pending_action'),
  state: text('state').notNull().default('idle'),
  stateData: jsonb('state_data'),
  lastMessageAt: timestamp('last_message_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * `whatsapp_messages` — append-only log of every inbound, outbound, LLM, and
 * tool invocation for a phone. Admins read this to triage unrecognized
 * numbers; the worker reads it to dedup inbound webhook retries.
 */
export const whatsappMessages = pgTable(
  'whatsapp_messages',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    phone: text('phone').notNull(),
    userId: text('user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    direction: text('direction').notNull(),
    metaMessageId: text('meta_message_id'),
    body: text('body'),
    messageType: text('message_type').notNull().default('text'),
    parsedIntent: jsonb('parsed_intent'),
    toolCalls: jsonb('tool_calls'),
    toolResults: jsonb('tool_results'),
    llmInputTokens: integer('llm_input_tokens'),
    llmOutputTokens: integer('llm_output_tokens'),
    latencyMs: integer('latency_ms'),
    error: text('error'),
    status: text('status').notNull().default('pending'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    phoneIdx: index('whatsapp_messages_phone_idx').on(table.phone),
    metaMessageIdIdx: index('whatsapp_messages_meta_message_id_idx').on(
      table.metaMessageId
    ),
    createdAtIdx: index('whatsapp_messages_created_at_idx').on(table.createdAt),
  })
);

/**
 * `whatsapp_idempotency` — short-lived cache of tool-call results keyed by
 * `<phone>:<tool_name>:<input_hash>`. Lets the worker safely retry without
 * double-spending side effects.
 */
export const whatsappIdempotency = pgTable('whatsapp_idempotency', {
  key: text('key').primaryKey(),
  toolName: text('tool_name').notNull(),
  result: jsonb('result').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});
