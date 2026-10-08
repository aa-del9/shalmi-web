# Buyer · Reorder — Implementation Log

> **Batch:** 5
> **Date started:** 2026-05-03
> **Slug:** buyer-reorder
> **Pencil source:** `NNw2K` (desktop), `tbXvv` (mobile)
> **Route:** new sub-route `/profile/orders/[id]/reorder` (RetailerOrderDetail at `/profile/orders/[id]` is preserved per Q4 of 02-design-inventory).

## Plan

### Files to create

- `apps/web/src/modules/cart/utils/delivery-tiers.ts` — constants module with the four-tier table (per gap-analysis Q6 STUBBED IN_SCOPE). Exports `DELIVERY_TIERS`, `resolveDeliveryTier(weightGrams)`, `findNextTier(currentTier)`.
- `apps/web/src/app/(storefront)/profile/orders/[id]/reorder/page.tsx` — Client-component sub-route that mounts the new `RetailerReorder` feature.
- `apps/web/src/modules/retailer/retailer-reorder/index.tsx` — top-level feature client component.
- `apps/web/src/modules/retailer/retailer-reorder/types.ts` — `ReorderDraftRow`, the local-edit shape.
- `apps/web/src/modules/retailer/retailer-reorder/hooks/use-reorder-draft.ts` — `useReducer` hook for draft state.
- `apps/web/src/modules/retailer/retailer-reorder/components/page-header/index.tsx` — eyebrow + title + description (Q2/Q3/Q4).
- `apps/web/src/modules/retailer/retailer-reorder/components/breadcrumb/index.tsx` — breadcrumb (Q1, reuses `@repo/ui/components/breadcrumb`).
- `apps/web/src/modules/retailer/retailer-reorder/components/weight-gauge/index.tsx` — gauge card (Q6).
- `apps/web/src/modules/retailer/retailer-reorder/components/help-banner/index.tsx` — amber callout (Q7).
- `apps/web/src/modules/retailer/retailer-reorder/components/items-toolbar/index.tsx` — `N items · M quantity changes` + Select all (Q9/Q10).
- `apps/web/src/modules/retailer/retailer-reorder/components/items-list/index.tsx` — flat list wrapper (Q11).
- `apps/web/src/modules/retailer/retailer-reorder/components/line-item-row/index.tsx` — desktop + mobile composition; checkbox / thumb / title / stepper / total / stock label / X (Q12–Q20, Q43).
- `apps/web/src/modules/retailer/retailer-reorder/components/quantity-stepper/index.tsx` — 36h/32h three-cell stepper.
- `apps/web/src/modules/retailer/retailer-reorder/components/receipt/index.tsx` — Subtotal / Delivery (tier) / Total (Q21–Q26). GST DEFERRED (Q25 — scope-cut).
- `apps/web/src/modules/retailer/retailer-reorder/components/comparison-card/index.tsx` — VS. ORIGINAL ORDER (Q28/Q29).
- `apps/web/src/modules/retailer/retailer-reorder/components/cta-stack/index.tsx` — primary green CTA + delivery info pill (Q31, Q32 DEFERRED, Q33).
- `apps/web/src/modules/retailer/retailer-reorder/components/sticky-bar/index.tsx` — mobile-only sticky bottom bar (Q34).
- `apps/web/src/modules/retailer/retailer-reorder/components/states.tsx` — Skeleton/error/empty states (Q39/Q40/Q41).
- `apps/web/src/modules/retailer/retailer-reorder/utils/format.ts` — eyebrow date formatter (UPPERCASE month per Q4).

### Files to edit

- `apps/web/src/app/api/retailer/orders/[id]/route.ts` — extend SELECT to also return per-item `slug`, `vendorId`, `vendorName`, `packSize`, `packWeightGrams`, `unitLabel`, `stock`, `lowStockThreshold`, `pricePerUnitCents`, `packMrpCents`, plus the active `packTiers` for each product (so the reorder screen can compute live totals + push to cart-store).
- `apps/web/src/modules/retailer/retailer-order-detail/types.ts` — extend `OrderDetailItem` with the new optional fields.
- `apps/web/src/modules/retailer/retailer-orders/components/order-card/index.tsx` — wire the per-card "Reorder" CTA at desktop + mobile pointing to `/profile/orders/[id]/reorder`. Existing "View details" is unchanged.
- `apps/web/src/modules/cart/components/cart-summary/index.tsx` — replace the "Calculated at checkout" placeholder with the live tier-based delivery + Total. Cart needed this anyway per Batch 3 watch-out; the constants module unblocks it.

### Schema / type changes

None. Reads from the existing `orders` / `sub_orders` / `order_items` / `products` / `product_pack_tiers` tables. No migrations.

### API / server-action changes

`GET /api/retailer/orders/[id]` payload extension only — additive fields. No new endpoints; cart-store push is purely client-side (`useCartStore.addItem`).

### New molecules introduced (screen-local only)

All under `modules/retailer/retailer-reorder/components/`. No new shared `@repo/ui` primitives. The Callout/StickyBottomBar/Breadcrumb/PageHeader patterns flagged as candidates in the gap-analysis §0 stay screen-local for this batch (per the BATCH_RUNNER rule "no new shared components").

### Approved scope cuts (placeholder UI)

Following gap-analysis answers verbatim:

- **GST 18% row** — DEFERRED. Receipt has Subtotal + Delivery + Total only (matches `cart-summary` placeholder).
- **Save as new list** — DEFERRED. Secondary CTA hidden.
- **Pack-of-N suffix on title + per-unit copy variants + pack weight eyebrow** — STUBBED. Title eyebrow renders `Pack of N` derived from `packSize` if > 1; per-unit copy uses `Rs. X per (unitLabel|pack)`.
- **`same MNP partner` claim** — DEFERRED. Pill renders only the "MNP delivery to {city}" + "Estimated 2–3 days" line.
- **Tracking surface** — STUBBED. Reorder is the only role of `/profile/orders/[id]/reorder`; the existing `/profile/orders/[id]` keeps the parcel-boxes detail.

## Completed

### Files changed

- `apps/web/src/modules/cart/utils/delivery-tiers.ts` (NEW) — 4-tier constants module + `resolveDeliveryTier` + `findNextTier`.
- `apps/web/src/app/api/retailer/orders/[id]/route.ts` — extended SELECT with slug, vendor, packSize, packWeightGrams, unitLabel, pricePerUnitCents, packMrpCents, stock, lowStockThreshold; loads `productPackTiers` + `vendors.shopName`; emits `imageRecord` so cart-store hydration works.
- `apps/web/src/modules/retailer/retailer-order-detail/types.ts` — `OrderDetailItem.product` enriched with the new fields.
- `apps/web/src/modules/retailer/retailer-orders/components/order-card/index.tsx` — primary "Reorder" CTA + secondary "View details" CTA, both desktop and mobile.
- `apps/web/src/modules/cart/components/cart-summary/index.tsx` — tier-based delivery line + true total (replaces "Calculated at checkout" placeholder).
- `apps/web/src/app/(storefront)/profile/orders/[id]/reorder/page.tsx` (NEW) — client route entry.
- `apps/web/src/modules/retailer/retailer-reorder/index.tsx` (NEW) — top-level Reorder feature (data + state composition).
- `apps/web/src/modules/retailer/retailer-reorder/types.ts` (NEW) — `ReorderDraftRow` + `ReorderRowDerived`.
- `apps/web/src/modules/retailer/retailer-reorder/hooks/use-reorder-draft.ts` (NEW) — `useReducer` driving the draft + per-row derived totals + selection logic.
- `apps/web/src/modules/retailer/retailer-reorder/utils/format.ts` (NEW) — uppercase-month eyebrow date formatter.
- `apps/web/src/modules/retailer/retailer-reorder/components/breadcrumb/index.tsx` (NEW).
- `apps/web/src/modules/retailer/retailer-reorder/components/page-header/index.tsx` (NEW).
- `apps/web/src/modules/retailer/retailer-reorder/components/weight-gauge/index.tsx` (NEW).
- `apps/web/src/modules/retailer/retailer-reorder/components/help-banner/index.tsx` (NEW).
- `apps/web/src/modules/retailer/retailer-reorder/components/items-toolbar/index.tsx` (NEW).
- `apps/web/src/modules/retailer/retailer-reorder/components/items-list/index.tsx` (NEW).
- `apps/web/src/modules/retailer/retailer-reorder/components/line-item-row/index.tsx` (NEW).
- `apps/web/src/modules/retailer/retailer-reorder/components/quantity-stepper/index.tsx` (NEW).
- `apps/web/src/modules/retailer/retailer-reorder/components/receipt/index.tsx` (NEW).
- `apps/web/src/modules/retailer/retailer-reorder/components/comparison-card/index.tsx` (NEW).
- `apps/web/src/modules/retailer/retailer-reorder/components/cta-stack/index.tsx` (NEW).
- `apps/web/src/modules/retailer/retailer-reorder/components/sticky-bar/index.tsx` (NEW).
- `apps/web/src/modules/retailer/retailer-reorder/components/states.tsx` (NEW).

### Test updates

None — no Playwright e2e specs exercise this route today.

### Spec adherence

| Q | Answer | Implementation pointer |
|---|---|---|
| 1 | Breadcrumb everywhere | `components/breadcrumb/index.tsx` (compact mobile variant). |
| 2 | Title literal | `components/page-header/index.tsx`. |
| 3 | Description verbatim | `components/page-header/index.tsx`. |
| 4 | Uppercase month date | `utils/format.ts`. |
| 5 | Mobile eyebrow drops order id | `components/page-header/index.tsx` `mobile` prop. |
| 6 | Tier table constants module | `apps/web/src/modules/cart/utils/delivery-tiers.ts`. |
| 7 | Help banner compose + hide-at-top + mobile compact | `components/help-banner/index.tsx`. |
| 8 | Mobile legend drops Rs. labels | `components/weight-gauge/index.tsx` mobile branch. |
| 9 | Toolbar copy hide-when-0 | `components/items-toolbar/index.tsx`. |
| 10 | Select all toggles, skips OOS | `hooks/use-reorder-draft.ts` `selectAll/deselectAll`; `index.tsx` `allSelectableSelected`. |
| 11 | Flat list | `components/items-list/index.tsx`. |
| 12 | Generic package thumbnail | `components/line-item-row/index.tsx`. |
| 13 | "Pack of N" suffix from packSize | `components/line-item-row/index.tsx` `buildTitle`. |
| 14 | Pack weight = `packWeightGrams × selectedPackQty` | `components/line-item-row/index.tsx` `buildPackEyebrow`. |
| 15 | Per-unit copy from `unitLabel` | `components/line-item-row/index.tsx` `buildPerUnitCopy`. |
| 16 | Stepper lower=1, X removes | `hooks/use-reorder-draft.ts` `setQuantity` / `decrement`. |
| 17 | Live current pack price | `hooks/use-reorder-draft.ts` `derivedRows`. |
| 18 | Per-product `lowStockThreshold` | `hooks/use-reorder-draft.ts` `isLowStock`. |
| 19 | Bare X, no confirm | `components/line-item-row/index.tsx`. |
| 20 | OOS disables checkbox, X stays | `components/line-item-row/index.tsx` checkbox `disabled` + X button always active. |
| 21 | "ORDER SUMMARY" label | `components/receipt/index.tsx`. |
| 22 | Item-count row desktop only | `components/receipt/index.tsx` `compact` prop. |
| 23 | "Subtotal" rename | `components/receipt/index.tsx`. |
| 24 | "Delivery (10–25 kg)" tier label | `components/receipt/index.tsx`. |
| 25 | GST DEFERRED | `components/receipt/index.tsx` (no GST row). |
| 26 | "Total" label, no COD framing | `components/receipt/index.tsx`. |
| 27 | Wallet refund removed | `components/receipt/index.tsx` (no wallet row). |
| 28 | Comparison desktop only | `index.tsx` `aside.hidden lg:flex`. |
| 29 | Sign + color rule | `components/comparison-card/index.tsx`. |
| 30 | South-Asian grouping | re-uses `formatRupeesFromCents` (en-IN) per Batch 1 formatter. |
| 31 | "Add N items / Select items" CTA | `components/cta-stack/index.tsx`. |
| 32 | Save-as-list DEFERRED | `components/cta-stack/index.tsx` (CTA omitted). |
| 33 | Delivery pill copy | `components/cta-stack/index.tsx`. |
| 34 | Mobile sticky bar minimal | `components/sticky-bar/index.tsx`. |
| 35 | Address card removed | `index.tsx` doesn't render it. |
| 36 | Per-parcel status removed | `index.tsx` flat list. |
| 37 | Reviews removed from this screen | `index.tsx` (no review surface). |
| 38 | Cancellation viz out-of-scope | `index.tsx` (no per-parcel cancellation). |
| 39 | Skeleton rows on loading | `components/states.tsx` `ReorderSkeleton`. |
| 40 | Full-page retry on error | `components/states.tsx` `ReorderError`. |
| 41 | Disabled CTA + "Select items" hint | `components/cta-stack/index.tsx`. |
| 42 | Reorder is the only role; tracking lives on existing detail | `app/(storefront)/profile/orders/[id]/page.tsx` unchanged. |
| 43 | Screen-local `LineItemRow` | `components/line-item-row/index.tsx`. |
| 44 | Inline stock label | `components/line-item-row/index.tsx` `StockLabel`. |
| 45 | Callout primitive — see deviation. |
| 46 | StickyBottomBar primitive — see deviation. |
| 47 | Breadcrumb primitive | reused existing `@repo/ui/components/breadcrumb`. |
| 48 | PageHeader molecule — see deviation. |

### Deviations from plan

- **Q45 (Callout), Q46 (StickyBottomBar), Q48 (PageHeader)** — gap-analysis answers proposed building these as `@repo/ui` primitives. BATCH_RUNNER hard-rule "Do not introduce new shared components. Screen-local molecules only." overrides. The components stay inside `modules/retailer/retailer-reorder/` so they can be promoted to `@repo/ui` in a dedicated post-batch primitive pass with cross-screen rollout. The visual specs are unchanged.
- **Cart-summary delivery line (cross-screen edit)** — cart-summary previously rendered "Calculated at checkout" because the tier table didn't exist. Landing the constants module in this batch unblocks cart's gap-analysis Q19 (which was already promoted from STUBBED to IN_SCOPE in scope-cut). Touching cart-summary is technically cross-screen, but the file's TODO points to this exact follow-up. Documented to keep the audit trail honest.

### Quality gate state

| Check | Status |
|---|---|
| `pnpm --filter web check-types` | PASS (exit 0) |
| `pnpm --filter web lint` | PASS ("No ESLint warnings or errors") |
| `pnpm --filter web build` | PASS (41 routes generated, including the new `/profile/orders/[id]/reorder`) |
| Public-page smoke (curl) | `/cart` returns 200 with the new tier-aware Order Summary. `/auth` returns 200. |
| Reorder route smoke (unauthed) | `/profile/orders/[id]/reorder` 307 → `/auth?redirect=...` (matches buyer-checkout Batch-3 partial-smoke pattern). |
| Reorder route smoke (authed) | DEFERRED — same migration-0012 wrinkle as buyer-settings: middleware's `auth.api.getSession()` selects `user.business_name` which the dev DB lacks until the operator applies `0012_buyer_settings.sql`. |

### What unblocks the smoke

Same step as buyer-settings — apply `0012_buyer_settings.sql` to the dev DB. After apply, run:

- `/profile/orders/[id]/reorder` for a seeded order: verify breadcrumb, eyebrow date in `DD MMM YYYY` uppercase, weight gauge with active tier, items list with per-row stock label, comparison card delta sign + color, primary CTA copy "Add N items to cart" + delivery pill.
- Mobile (420×900) viewport: verify compact gauge legend, mobile help banner shorter copy, sticky bottom bar.
- Add-to-cart → `/cart` shows the new lines + tier-based delivery line.

