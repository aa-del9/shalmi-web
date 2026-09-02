-- WhatsApp + MCP build (phase 2 schema).
--
-- Additive only:
--   * `user` gains nullable WhatsApp first/last seen timestamps.
--   * Three new tables back the worker (conversations, messages, idempotency).
--
-- `user.phone_number` already carries a UNIQUE constraint
-- (`user_phone_number_unique`) from migration 0000, so phone uniqueness is
-- enforced at the DB level — nothing to add here.

ALTER TABLE "user" ADD COLUMN "whatsapp_first_seen_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "whatsapp_last_seen_at" timestamp;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "whatsapp_conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"user_id" text,
	"role" text DEFAULT 'vendor' NOT NULL,
	"recent_turns" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"pending_action" jsonb,
	"state" text DEFAULT 'idle' NOT NULL,
	"state_data" jsonb,
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "whatsapp_conversations_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "whatsapp_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"user_id" text,
	"direction" text NOT NULL,
	"meta_message_id" text,
	"body" text,
	"message_type" text DEFAULT 'text' NOT NULL,
	"parsed_intent" jsonb,
	"tool_calls" jsonb,
	"tool_results" jsonb,
	"llm_input_tokens" integer,
	"llm_output_tokens" integer,
	"latency_ms" integer,
	"error" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "whatsapp_messages_phone_idx" ON "whatsapp_messages" USING btree ("phone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "whatsapp_messages_meta_message_id_idx" ON "whatsapp_messages" USING btree ("meta_message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "whatsapp_messages_created_at_idx" ON "whatsapp_messages" USING btree ("created_at");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "whatsapp_idempotency" (
	"key" text PRIMARY KEY NOT NULL,
	"tool_name" text NOT NULL,
	"result" jsonb NOT NULL,
	"expires_at" timestamp NOT NULL
);
