-- Pack-pricing schema migration (Batch 3 — buyer-product).
-- Replaces the legacy band-tier model with discrete pack tiers.

-- 1. products: rename + add pack-pricing columns -------------------------------
ALTER TABLE "products" RENAME COLUMN "weight_grams" TO "pack_weight_grams";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "pack_size" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "unit_weight_grams" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "unit_label" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "pack_mrp_cents" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "pack_wholesale_price_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price_per_unit_cents" integer;--> statement-breakpoint

-- 2. order_items: snapshot pack-info for stable receipts/reorder --------------
ALTER TABLE "order_items" ADD COLUMN "pack_size_at_purchase" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "price_per_unit_at_purchase" integer;--> statement-breakpoint

-- 3. orders: optional rider notes ---------------------------------------------
ALTER TABLE "orders" ADD COLUMN "rider_notes" text;--> statement-breakpoint

-- 4. Drop legacy product_price_tiers (band model) -----------------------------
DROP TABLE IF EXISTS "product_price_tiers";--> statement-breakpoint

-- 5. Create product_pack_tiers (discrete pack-qty -> per-pack price) ----------
CREATE TABLE "product_pack_tiers" (
  "id" text PRIMARY KEY NOT NULL,
  "product_id" text NOT NULL,
  "pack_qty" integer NOT NULL,
  "price_per_pack_cents" integer NOT NULL,
  "badge" text,
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "product_pack_tiers"
  ADD CONSTRAINT "product_pack_tiers_product_id_products_id_fk"
  FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
  ON DELETE cascade ON UPDATE no action;
