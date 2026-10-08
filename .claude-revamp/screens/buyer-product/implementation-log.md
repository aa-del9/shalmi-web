# Implementation Log — Buyer · Product Detail Page (PDP)

> **Phase:** 5 — Implementation
> **Batch:** 3 (storefront purchase flow). Owns the pack-pricing schema migration.
> **Date started:** 2026-05-03
> **Spec sources (binding):** `.claude-revamp/screens/buyer-product/gap-analysis.md`, `.claude-revamp/features/pack-pricing/surface-map.md`, `.claude-revamp/06-scope-cut.md`.

## Step A — Plan

### Schema/type changes (approved in gap-analysis)

- **`products` table** (`packages/database/src/schema/products.ts`):
  - Rename `weight_grams` → `pack_weight_grams` (per-pack net weight in grams, per gap-analysis Q29).
  - Add `pack_size int not null default 1` — units per pack (per surface-map Q13).
  - Add `pack_mrp_cents int` (nullable) — strikethrough MRP, optional (per Q5).
  - Add `pack_wholesale_price_cents int not null default 0` — base wholesale price (per surface-map §3.2).
  - Add `unit_weight_grams int` (nullable) — per-unit weight in grams (per surface-map Q4).
  - Add `price_per_unit_cents int` (nullable) — stored "Per unit: Rs. X.XX" caption value (per Q7).
  - Add `unit_label text` (nullable) — "unit" / "carton" noun for receipts/eyebrows (per surface-map Q12).
- **DROP `product_price_tiers` table** (per Q11). Replace with new `product_pack_tiers`:
  - `id text pk`, `product_id text fk`, `pack_qty int not null`, `price_per_pack_cents int not null`, `badge text` ('save'|'best'|null per Q10), `is_default boolean not null default false` (per Q12), timestamps.
- **`order_items`** (`packages/database/src/schema/order-items.ts`): add `pack_size_at_purchase int not null default 1`, `price_per_unit_at_purchase int` (nullable). Per surface-map Q11.
- **`orders`** (`packages/database/src/schema/orders.ts`): add `rider_notes text` nullable (max 500 chars validated at API). Per checkout gap-analysis Q3.
- **NOTE — explicitly NOT added** (per binding gap-analysis answers):
  - `orders.taxCents` — buyer-checkout Q6 answer: GST DEFERRED. UI hides the row.
  - Delivery tier table/constants — buyer-cart Q19 + buyer-checkout Q5 answers: STUBBED → "Calculated at checkout" placeholder.
  - Wishlist tables — buyer-product Q14/Q26 STUBBED no-op.

### Files to create

- `packages/database/migrations/0009_*.sql` (Drizzle-generated migration).
- `packages/database/src/schema/product-pack-tiers.ts` — new pack tiers table + relations.
- `packages/schemas/src/catalog/product-pack-tiers.ts` — new Zod schemas (replaces `product-price-tiers.ts`).
- `apps/web/src/modules/cart/utils/pack-pricing.ts` — pack-tier resolver + display helpers (per-unit caption, save-pill computation, pack-eyebrow string).
- `apps/web/src/modules/cart/components/pdp/bundle-selector.tsx` — bundle cards molecule (PDP-local).
- `apps/web/src/modules/cart/components/pdp/pdp-breadcrumb.tsx` — PDP breadcrumb molecule (uses new `@repo/ui/components/breadcrumb`).
- `apps/web/src/modules/cart/components/pdp/pdp-spec-section.tsx` — spec section molecule.
- `apps/web/src/modules/cart/components/pdp/pdp-delivery-card.tsx` — delivery card molecule.
- `apps/web/src/modules/cart/components/pdp/pdp-mobile-sticky-bar.tsx` — mobile sticky add-to-cart molecule.
- `apps/web/src/modules/cart/components/pdp/pdp-ymal-rail.tsx` — YMAL rail molecule.
- `apps/web/src/modules/cart/hooks/use-related-products-query.ts` — React Query hook for YMAL.
- `apps/web/src/app/api/products/[slug]/related/route.ts` — YMAL endpoint (same primary category, exclude self, take=8 per Q21).
- `packages/ui/src/components/breadcrumb.tsx` — shadcn breadcrumb primitive (Pencil-tokenized).

### Files to edit

- `packages/database/src/schema/products.ts` — rename + add columns.
- `packages/database/src/schema/order-items.ts` — add snapshot columns.
- `packages/database/src/schema/orders.ts` — add riderNotes.
- `packages/database/src/schema/relations.ts` — swap `productPriceTiers` → `productPackTiers`.
- `packages/database/src/schema/index.ts` — re-export new pack-tiers schema.
- `packages/database/src/seed-products.ts` — update seed data shape.
- `packages/schemas/src/catalog/product.ts` — swap tier schema; add new product fields.
- `packages/schemas/src/catalog/product-price-tiers.ts` — DELETE (replaced).
- `packages/schemas/src/catalog/index.ts` — update exports.
- `packages/schemas/src/orders/checkout.ts` — add `riderNotes` field (optional, max 500).
- `apps/web/src/modules/cart/types.ts` — replace `priceTiers` with `packTiers` + pack metadata + add `vendorName` + `selectedPackQty` for cart line.
- `apps/web/src/modules/cart/utils/resolve-price.ts` — pack-tier lookup (replaces band-lookup); export new helpers OR delete and route consumers to `pack-pricing.ts`.
- `apps/web/src/modules/cart/utils/get-product-by-slug.ts` — query new pack tiers + new product columns + primary category.
- `apps/web/src/modules/cart/stores/cart-store.ts` — bump persist version (`version: 2`); collapse same-product adds; carry `selectedPackQty` and `vendorName`.
- `apps/web/src/modules/cart/components/product-detail/index.tsx` — full PDP rewrite (bundle selector, price block, breadcrumb, spec, delivery, mobile sticky bar, YMAL).
- `apps/web/src/modules/cart/components/cart-item-row/index.tsx` — pack eyebrow, vendor name, segmented qty selector, x-icon remove, mobile/desktop layouts.
- `apps/web/src/modules/cart/components/cart-summary/index.tsx` — Subtotal / Delivery (Calculated at checkout) / TOTAL only; receipt-style paper-2 card; "Place order" CTA below it.
- `apps/web/src/modules/cart/components/quantity-selector/index.tsx` — restyle to single segmented frame.
- `apps/web/src/app/(storefront)/cart/page.tsx` — title "Your cart · N items"; clear-cart inline; remove "Continue Shopping"; add mobile sticky bar.
- `apps/web/src/app/(storefront)/products/[slug]/page.tsx` — pass primary category for breadcrumb; widen container.
- `apps/web/src/app/(storefront)/checkout/page.tsx` — step indicator; numbered eyebrows; rider notes textarea; payment selector (3 cards, COD only); receipt summary moved into right card; sticky mobile bar; "Place order" CTA.
- `apps/web/src/modules/checkout/components/delivery-address-section/index.tsx` — radio-led cards, DEFAULT stamp, removed manage-link, "+ Use a new address" opens AddressDialog (no inline manual form).
- `apps/web/src/modules/checkout/schemas/index.ts` — drop manual form schema (route to dialog).
- `apps/web/src/app/api/products/[slug]/route.ts` — emit new product shape.
- `apps/web/src/app/api/categories/[id]/products/route.ts` — emit pack metadata.
- `apps/web/src/app/api/vendor/products/route.ts` — accept new shape; emit new shape.
- `apps/web/src/app/api/vendor/products/[id]/route.ts` — same.
- `apps/web/src/app/api/checkout/route.ts` — pack-tier price resolution; accept riderNotes; persist to `orders.riderNotes`; snapshot pack info into `order_items`.
- `apps/web/src/modules/storefront/utils/get-best-prices-products.ts` + `get-super-saver-products.ts` — adapt to new schema (rename + use packWholesalePriceCents as "lowest" for now).
- `apps/web/src/modules/storefront/types.ts` — new product shape.
- `apps/web/src/modules/storefront/components/product-card/index.tsx` — minimal compat shim (existing storefront cards keep working).
- `apps/web/src/modules/storefront/components/home/prod1-card/index.tsx` — minimal compat: pack eyebrow uses new `pack_size` + `pack_weight_grams`.
- `apps/web/src/modules/vendor/vendor-products/types/index.ts` — new shape.
- `apps/web/src/modules/vendor/vendor-products/modules/add-product/{add-product-form,use-add-product-form,utils,constants}` — pack-pricing form (minimum-compat; visual revamp deferred to Batch 4 vendor-products).
- `apps/web/src/modules/vendor/vendor-products/components/product-table/index.tsx` — adapt to renamed `weightGrams` → `packWeightGrams`.

### API/server-action changes

- `POST /api/checkout` — accept `riderNotes?` in payload; resolve per-pack price from `product_pack_tiers` instead of bands; persist `pack_size_at_purchase` and `price_per_unit_at_purchase` snapshots.
- `GET /api/products/[slug]` — return `packTiers` array + new product fields + primary category for breadcrumb.
- `GET /api/products/[slug]/related` (NEW) — same primary category, exclude self, ordered by stock+createdAt, take 8.
- `GET /api/categories/[id]/products` — return new shape.
- `POST/PATCH /api/vendor/products` — accept new pack-pricing payload.

### New molecules introduced (PDP-screen-local)

PDP-local molecules under `apps/web/src/modules/cart/components/pdp/` — none promoted to `@repo/ui`. Breadcrumb is the one shared primitive (shadcn install — pre-approved by gap-analysis Q1 answer + 06-scope-cut "Admin Catalog sidebar grouping + Breadcrumb component" IN_SCOPE).

## Step B — Implement

Completed in this order:
1. **Schema + migration** — `products` rename `weight_grams → pack_weight_grams`, add `pack_size`, `unit_weight_grams`, `unit_label`, `pack_mrp_cents`, `pack_wholesale_price_cents`, `price_per_unit_cents`. Drop `product_price_tiers`. Create `product_pack_tiers (id, product_id, pack_qty, price_per_pack_cents, badge, is_default, …)`. `order_items` adds `pack_size_at_purchase`, `price_per_unit_at_purchase`. `orders` adds `rider_notes`. Migration `0009_pack_pricing.sql` + journal entry.
2. **Drizzle schema files** updated to mirror migration (rename + new columns + new pack-tiers file + relations swap + index re-export).
3. **Zod schemas** — `packages/schemas/src/catalog/product-pack-tiers.ts` (new), updated `catalog/product.ts` to consume it; deleted `product-price-tiers.ts`. `cart/line-item.ts` adds `selectedPackQty`. `orders/checkout.ts` adds `riderNotes` + `RIDER_NOTES_MAX_LENGTH`.
4. **Cart core** — `types.ts` (PackTier, CartItem with pack metadata + vendorName + selectedPackQty); `pack-pricing.ts` (sortPackTiers / findDefaultTier / resolvePerPackPrice / computeSavings / formatPackWeightCaption / buildPackEyebrow / buildSelectedPackBadge); `resolve-price.ts` thin wrapper (delegates to `formatRupeesFromCents`); `cart-store.ts` rewrite with persist version 2, custom storage that nulls out v1 payloads, collapse-on-add per Q8.
5. **API routes** — `/api/products/[slug]` returns new shape + primaryCategory + vendorName. `/api/products/[slug]/related` (NEW). `/api/categories/[id]/products` joins on `product_pack_tiers`. `/api/vendor/products` (POST + GET) accepts new shape; `/api/vendor/products/[id]` (GET + PATCH) ditto. `/api/checkout` resolves per-pack price from `product_pack_tiers`, accepts `riderNotes` + per-line `selectedPackQty`, snapshots into `order_items`.
6. **Breadcrumb primitive** — `packages/ui/src/components/breadcrumb.tsx` (shadcn-derived, Pencil-tokenized: mono uppercase tracking 0.08em, ink-3 → ink active).
7. **PDP UI** — `product-detail/index.tsx` rewrite: breadcrumb, image gallery (mobile drops thumb strip per Q22), price block with strikethrough MRP + save pill + per-unit caption, BundleSelector molecule, qty stepper + Add-to-cart + Wishlist row (desktop), DeliveryCard + SpecSection molecules, mobile sticky bar molecule, YMAL rail (React Query hook).
8. **Storefront card compat** — `prod1-card` and `product-card` both rewired to use new schema fields + Sonner toast on add (Q17).
9. **Storefront utils + types** updated to query `product_pack_tiers`.
10. **Vendor add-product form (compat)** — pack-size, MRP, wholesale, per-unit, pack-tier `useFieldArray` with badge + isDefault flags. Visual revamp deferred to Batch 4.
11. **Page wrapper** — `/products/[slug]/page.tsx` widened to `max-w-[1360px]`.

## Step C — Quality gate

| Check | Status |
|---|---|
| `pnpm --filter web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm --filter web lint` | ✅ "No ESLint warnings or errors" |
| `pnpm --filter web build` | ✅ all 40 routes; `/products/[slug]` 7.28 kB; `/api/products/[slug]/related` registered |
| Playwright smoke (cart `/cart` empty, 1440×900) | ✅ mounts cleanly, no console errors |
| Playwright smoke (PDP `/products/<slug>`) | ❌ 500 from server-component query (DB missing new columns). See `STATUS.md`. |

`pnpm --filter @repo/database db:migrate:dev` failed because the dev DB has no `__drizzle_migrations` tracking table populated; drizzle-kit attempts re-applying migration 0000 and errors on existing `categories` relation. `db:push:dev` and a hand-rolled SQL apply were both denied (shared-infra safety).

## Step D — Spec adherence

For each binding gap-analysis answer, the file:line that satisfies it:

- **Q1 (Breadcrumb):** `apps/web/src/modules/cart/components/pdp/pdp-breadcrumb.tsx:1`, used at `apps/web/src/modules/cart/components/product-detail/index.tsx:103`. Primary category resolved at `apps/web/src/modules/cart/utils/get-product-by-slug.ts:60-69` (first row by insert order).
- **Q2 (title eyebrow):** computed at `apps/web/src/modules/cart/components/product-detail/index.tsx:75-79`.
- **Q3 (drop bare grams):** `weightGrams` line removed; not rendered in PDP.
- **Q4 (current-bundle total):** `apps/web/src/modules/cart/components/product-detail/index.tsx:159` (`pricePerPackCents` shown directly).
- **Q5 (MRP optional):** `packMrpCents` rendered conditionally at `product-detail/index.tsx:163-167`.
- **Q6 (save pill):** `apps/web/src/modules/cart/utils/pack-pricing.ts:29` (`computeSavings`); rendered at `product-detail/index.tsx:168-172`.
- **Q7 (per-unit caption stored):** `pricePerUnitCents` column on `products`; rendered at `product-detail/index.tsx:175-180`.
- **Q8 (currency formatter):** `apps/web/src/modules/core/utils/format-price/index.ts` already shipped; consumed everywhere via `formatRupeesFromCents`.
- **Q9 (CHOOSE BUNDLE SIZE):** `apps/web/src/modules/cart/components/pdp/bundle-selector.tsx:25-28`.
- **Q10 (badge enum):** `packages/database/src/schema/product-pack-tiers.ts:18-20` (`badge text`); `packages/schemas/src/catalog/product-pack-tiers.ts:11-12`. Selected = ink fill + white text per `bundle-selector.tsx:42-46`.
- **Q11 (drop product_price_tiers):** done in `0009_pack_pricing.sql:24` (`DROP TABLE IF EXISTS product_price_tiers`).
- **Q12 (vendor-pinned default):** `is_default boolean` column on `product_pack_tiers`; resolved by `findDefaultTier` (`pack-pricing.ts:18-21`); used at PDP first paint (`product-detail/index.tsx:69-72`).
- **Q13 (qty stepper unit):** `quantity` is in packs (`product-detail/index.tsx:73`); changing bundle resets to 1 (`product-detail/index.tsx:97-101`).
- **Q14 (wishlist STUBBED):** `handleWishlistClick` toast no-op at `product-detail/index.tsx:111-115`.
- **Q15 (drop stock indicator):** removed from PDP body.
- **Q16 (Out of stock disabled):** `apps/web/src/modules/cart/components/add-to-cart-button/index.tsx:33` and `product-detail/index.tsx:228` (mobile sticky CTA).
- **Q17 (toast on add):** `apps/web/src/modules/cart/components/add-to-cart-button/index.tsx:25` (`toast.success('Added to cart')`).
- **Q18 (delivery card STUBBED):** `apps/web/src/modules/cart/components/pdp/pdp-delivery-card.tsx:9-22`.
- **Q19 (spec section fixed list):** `apps/web/src/modules/cart/components/pdp/pdp-spec-section.tsx`.
- **Q20 (mobile sticky bar):** `apps/web/src/modules/cart/components/pdp/pdp-mobile-sticky-bar.tsx`; rendered at `product-detail/index.tsx:243`. Reserved space at `product-detail/index.tsx:241`.
- **Q21 (YMAL):** `apps/web/src/app/api/products/[slug]/related/route.ts` (same primary category, ne self, take 8). Hook `apps/web/src/modules/cart/hooks/use-related-products-query.ts`. Rendered via `pdp-ymal-rail.tsx`.
- **Q22 (mobile thumbs dropped):** thumb strip is `hidden md:flex` (`product-detail/index.tsx:140`).
- **Q23 ("Qty:" prefix):** removed (no visible label; QuantitySelector has internal `aria-label`).
- **Q24 (drop inline running total):** removed.
- **Q25 (Next.js 404):** preserved via `notFound()` in page wrapper.
- **Q26 (prod1 heart STUBBED):** absent (heart only on PDP, where it is the toast no-op per Q14).
- **Q27 (lang toggle):** chrome (out of PDP scope; existing util-strip continues to render `LanguageToggle` inert).
- **Q28 ("From" prefix removed):** PDP shows current-bundle price only.
- **Q29 (rename `weightGrams` → `packWeightGrams`):** SQL `0009_pack_pricing.sql:5`; schema + every consumer updated.

## Deviations from plan

- **Smoke gate: PDP 500.** The PDP server-component query selects new columns (`pack_weight_grams`, `pack_size`, etc.) that do not yet exist in the dev DB. This is a DB-state issue (migration not yet applied), not a code defect. The cart empty-state smoke at 1440×900 passed with no console errors. STATUS.md flags this for the operator.
- **Vendor add-product form is functional but visually unchanged.** The Pencil revamp of this form (numbered sections, inline tier cards, etc.) is owned by Batch 4 (`vendor-products`). This commit only updates the form's data shape so it can write the new pack-pricing payload — visuals stay legacy.
- **Storefront cards (`prod1-card`, `product-card`) re-skinned only for data-shape compat.** Their visual revamps were partly done in Batch 1 (`prod1-card`) and the rest are out-of-scope here. New schema fields plumbed through; "Added to cart" Sonner toast adopted for consistency with Q17.

## Step D — Commit

`git add` will stage the schema, Zod, breadcrumb, cart core, PDP, storefront/category/vendor compat, and the implementation log. Buyer-cart and buyer-checkout commits follow on the same branch.

