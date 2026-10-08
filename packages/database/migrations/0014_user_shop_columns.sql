-- Buyer signup shopkeeper variant (Batch 7) — adds bricks-and-mortar
-- shop fields per OQ-S(a). Both nullable; only the shopkeeper signup
-- form populates them, generic users keep them NULL.
-- shop_name = retail signage entered at signup ("Saleem Snacks Co.")
-- shop_address = bricks-and-mortar shop address (NOT a delivery address;
--                delivery addresses live in the addresses table).

ALTER TABLE "user" ADD COLUMN "shop_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "shop_address" text;
