-- Buyer settings (Batch 5) — additive postal/province on addresses
-- and businessName on user. All nullable to avoid backfill issues.

ALTER TABLE "addresses" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "province" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "business_name" text;
