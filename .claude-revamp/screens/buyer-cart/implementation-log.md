# Implementation Log — Buyer · Cart

> **Phase:** 5 — Implementation
> **Batch:** 3 (storefront purchase flow). Consumes the pack-pricing schema landed in `buyer-product`.
> **Date started:** 2026-05-03
> **Spec sources (binding):** `.claude-revamp/screens/buyer-cart/gap-analysis.md`, `.claude-revamp/06-scope-cut.md`.

## Step A — Plan

Files edited:
- `apps/web/src/modules/cart/components/cart-item-row/index.tsx` — pack eyebrow `VENDOR · 1.008 KG · 12 PACK`; segmented qty stepper; per-pack price column (desktop only); `x` lucide remove (desktop only); link only on title.
- `apps/web/src/modules/cart/components/cart-summary/index.tsx` — paper-2 receipt card; Subtotal / Delivery (Calculated at checkout) / TOTAL only (no Items row, no GST per Q9/Q18); three-piece composition (card + standalone CTA + free-delivery caption per Q17).
- `apps/web/src/modules/cart/components/quantity-selector/index.tsx` — single segmented frame with editable centre cell (Q5).
- `apps/web/src/app/(storefront)/cart/page.tsx` — title "Your cart · N items" (mobile drops "items"); inline trash-2 + "Clear cart" desktop only; mobile sticky bottom bar with TOTAL + Checkout CTA; remove "Continue Shopping" CTA per Q15; keep empty state per Q14.

Pack metadata + vendor name plumbed through `apps/web/src/modules/cart/types.ts` and `apps/web/src/modules/cart/stores/cart-store.ts` (snapshot in CartItem per Q2).

## Step B — Implementation summary

- Q1 (pack count): `12 PACK` segment in eyebrow comes from `selectedPackQty`; rendered via `buildSelectedPackBadge` helper; only shown on desktop.
- Q2 (vendor name): snapshotted into `CartItem.vendorName` at add-time.
- Q3 (title): "Your cart · N items" desktop / "Your cart · N" mobile.
- Q4 (weight): per-pack weight from `CartItem.packWeightGrams`, formatted via `formatPackWeightCaption`.
- Q5: typeable centre cell preserved in `QuantitySelector` segmented frame.
- Q6/Q25: image inert, title link kept (no underline).
- Q7: mobile drops per-pack price column + remove icon; remove via qty=0.
- Q8: no clear-cart on mobile.
- Q9 + Q27: Items row dropped from summary.
- Q10 (free-delivery): static caption only (STUBBED).
- Q11 (amber tip): weight-gauge STUBBED → omitted.
- Q12: mobile sticky bar always pinned.
- Q13: existing AuthModal gating preserved on Proceed-to-checkout.
- Q14: empty state kept, restyled with Pencil tokens.
- Q15: Continue Shopping CTA dropped.
- Q16: trash-2 icon + sentence-case "Clear cart" inline (desktop only).
- Q17: receipt-card three-piece composition.
- Q18 (GST DEFERRED): row hidden.
- Q19 + Q20 + Q21 + Q22 (delivery tier STUBBED): "Calculated at checkout" placeholder; no tier resolution; no dynamic label.
- Q23 (per-pack price column): rendered desktop, omitted mobile (resolved via `resolvePerPackPrice`).
- Q24: `x` icon ink-3.
- Q26: same string at both breakpoints, mobile truncates via `line-clamp-2`.

## Step C — Quality gate

| Check | Status |
|---|---|
| `pnpm --filter web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm --filter web lint` | ✅ no warnings/errors |
| `pnpm --filter web build` | ✅ all 40 routes generated; `/cart` 7.61 kB |
| Playwright smoke (cart empty, 1440×900) | ✅ mounts cleanly, no console errors |
| Playwright smoke (cart with items) | ⏸ blocked — requires pack-pricing migration applied to dev DB so add-to-cart from PDP / cards can populate the store with the new shape. See `screens/buyer-product/STATUS.md`. |

## Step E — Stop note

The smoke gate cannot fully pass until the operator applies migration 0009 (see `screens/buyer-product/STATUS.md`). Cart screen code is complete and gates green at the static layer; the populated-cart smoke is pending DB unblock.
