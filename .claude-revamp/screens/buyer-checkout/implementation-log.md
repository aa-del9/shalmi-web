# Implementation Log — Buyer · Checkout

> **Phase:** 5 — Implementation
> **Batch:** 3 (storefront purchase flow). Consumes the pack-pricing schema landed in `buyer-product`.
> **Date started:** 2026-05-03
> **Spec sources (binding):** `.claude-revamp/screens/buyer-checkout/gap-analysis.md`, `.claude-revamp/06-scope-cut.md`.

## Step A — Plan

Schema/type changes:
- `orders.riderNotes` (text, nullable, max 500 chars) added in the same migration as the pack-pricing schema (Q3 answer).
- `lineItemSchema` extended with `selectedPackQty` (per-line bundle pick) — needed by checkout payload.
- `checkoutCartPayloadSchema` extended with optional `riderNotes`.

Files edited:
- `apps/web/src/app/(storefront)/checkout/page.tsx` — full rewrite: step indicator (Cart › Checkout › Confirmation, mobile chevron-left → /cart per Q1); 3 numbered sections (Delivery / Rider / Payment); right-column receipt card with item preview (`+ N more` overflow per Q7) + Subtotal / Delivery (Calculated at checkout) / TOTAL; "Place order" CTA with lock icon (Q13); secure-checkout micro-line; mobile sticky CTA bar.
- `apps/web/src/modules/checkout/components/delivery-address-section/index.tsx` — radio-led saved address cards; DEFAULT stamp via `Stamp` primitive (Q11); "Manage addresses" link removed (Q9); manual form removed (Q10); "+ Use a new address" opens existing `AddressDialog` (Q8).
- `apps/web/src/modules/checkout/components/rider-instructions-section/index.tsx` (NEW) — textarea, h120 desktop / h90 mobile, RIDER_NOTES_MAX_LENGTH counter.
- `apps/web/src/modules/checkout/components/payment-selector/index.tsx` (NEW) — 3 cards: COD (selected, RECOMMENDED stamp), JazzCash/EasyPaisa (disabled "Coming soon"), Bank/Card (disabled "Coming soon"); aria-disabled + cursor-not-allowed (Q16).
- `apps/web/src/app/api/checkout/route.ts` — accept `riderNotes` and `selectedPackQty` per line; resolve per-pack price from `product_pack_tiers`; persist `riderNotes` to `orders`; snapshot `packSizeAtPurchase` + `pricePerUnitAtPurchase` into `order_items`.
- `packages/schemas/src/orders/checkout.ts` — `riderNotes` field + `RIDER_NOTES_MAX_LENGTH` export.
- `packages/schemas/src/cart/line-item.ts` — `selectedPackQty` field on each line.

## Step B — Implementation summary

- Q1: display-only step row; mobile chevron always navigates to `/cart`.
- Q2: address cards always show all fields (design abbreviation only).
- Q3: optional `orders.riderNotes` text column (nullable, max 500). Validated in Zod; persisted in handler.
- Q4 (Payment DEFERRED): selector renders 3 cards, only COD enabled, no schema column added; payload still defaults to COD.
- Q5 (Delivery STUBBED): "Calculated at checkout" placeholder; `totalShippingCost: 0` preserved.
- Q6 (GST DEFERRED): row hidden across receipts; `grandTotal = totalItemsCost`.
- Q7: non-interactive `+ N more items` overflow (desktop only).
- Q8: AddressDialog opens on `+ Use a new address`.
- Q9 / Q10: manage-addresses link + manual shipping form both removed.
- Q11: `Stamp variant="success">DEFAULT</Stamp>`.
- Q12: numbered-mono eyebrow scoped to checkout.
- Q13: CTA copy "Place order" (sentence case; lock icon).
- Q14: `· N items` moved to ORDER SUMMARY eyebrow.
- Q15: "Use a new address" verbatim.
- Q16: disabled cards aria-disabled + cursor-not-allowed.
- Q17: product image used when present, lucide `package` glyph fallback.
- Q18: `<Spinner>` retained for page-level loading.
- Q19: in-button spinner + "Placing order…".
- Q20: Sonner toasts for network errors; inline validation toast for missing address.

## Step C — Quality gate

| Check | Status |
|---|---|
| `pnpm --filter web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm --filter web lint` | ✅ no warnings/errors |
| `pnpm --filter web build` | ✅ `/checkout` 7.78 kB |
| Playwright smoke | ⏸ blocked — checkout flow requires PDP → cart with seeded products with new schema; depends on migration 0009 apply. See `screens/buyer-product/STATUS.md`. |

## Step E — Stop note

Same smoke-gate blocker as the rest of Batch 3: pending DB schema migration apply.
