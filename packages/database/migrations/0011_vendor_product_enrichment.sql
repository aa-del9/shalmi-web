-- Vendor product enrichment (Batch 4 — vendor-products).
-- Lands SKU + brand + low-stock threshold + status enum per scope-cut.

ALTER TABLE "products" ADD COLUMN "sku" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brand" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "low_stock_threshold" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint

-- Per gap-analysis Q14: SKU unique per vendor (NULL allowed pre-backfill).
CREATE UNIQUE INDEX "products_vendor_sku_idx"
  ON "products" ("vendor_id", "sku")
  WHERE "sku" IS NOT NULL;
