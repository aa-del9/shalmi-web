-- Buyer checkout one-time-addr (Batch 7) — guest checkout enablement.
-- Per OQ-G(b) "guest should not need to signin" — orders.user_id must
-- become nullable, and a new orders.guest_session_id text column carries
-- the cart-store guest identifier for guest orders. At least one of
-- (user_id, guest_session_id) must be set; the constraint is enforced
-- by zod refine in /api/checkout, not by Postgres.

ALTER TABLE "orders" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "guest_session_id" text;
