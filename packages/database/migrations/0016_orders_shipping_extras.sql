-- Buyer checkout one-time-addr (Batch 7) — extends the orders snapshot
-- with the new fields the one-time delivery card collects. Both
-- nullable; legacy orders predate the columns and stay NULL.
-- Province values constrained to the 7-element pakistanProvinceEnum
-- (packages/constants/src/geo) at the API boundary.

ALTER TABLE "orders" ADD COLUMN "shipping_postal_code" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_province" text;
