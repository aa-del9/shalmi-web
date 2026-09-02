-- Vendor payouts schema migration (Batch 4 — vendor-dashboard).
-- Lands `payout_runs` table + `vendors.deactivatedAt` for the
-- KPI 4 / payouts callout / vendor-ledger surfaces.

-- 1. vendors: deactivatedAt nullable -----------------------------------------
ALTER TABLE "vendors" ADD COLUMN "deactivated_at" timestamp;--> statement-breakpoint

-- 2. payout_runs --------------------------------------------------------------
CREATE TABLE "payout_runs" (
  "id" text PRIMARY KEY NOT NULL,
  "vendor_id" text NOT NULL,
  "week_start" date NOT NULL,
  "week_end" date NOT NULL,
  "paid_on" timestamp,
  "txn_id" text,
  "completed_orders_count" integer DEFAULT 0 NOT NULL,
  "gross_amount_cents" integer DEFAULT 0 NOT NULL,
  "returns_amount_cents" integer DEFAULT 0 NOT NULL,
  "mnp_reimbursement_cents" integer DEFAULT 0 NOT NULL,
  "net_amount_cents" integer DEFAULT 0 NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "payout_runs"
  ADD CONSTRAINT "payout_runs_vendor_id_vendors_id_fk"
  FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id")
  ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payout_runs_vendor_idx" ON "payout_runs" ("vendor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payout_runs_vendor_week_idx" ON "payout_runs" ("vendor_id", "week_start");
