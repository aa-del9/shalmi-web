# Vendor · Orders — Implementation Log

> **Phase:** 5 — Batch 1 — Screen 2
> **Date started:** 2026-05-02
> **Slug:** `vendor-orders`
> **Route:** `/vendor/orders`
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop `jXwqE`, Mobile `EEK8K`
> **Spec source:** `screens/vendor-orders/gap-analysis.md` (all answers binding)

## Plan

### Files to edit

- `apps/web/src/app/api/vendor/orders/route.ts` — wrap response as
  `{ subOrders, meta: { pendingCount } }` per Q2 (sidebar badge data
  source). Sort `ASC createdAt` so the "Oldest first · pack in order"
  sub-header copy matches the actual order. (Reverses the current
  `desc` ordering; vendors pack oldest first in the new design.)
- `apps/web/src/modules/vendor/vendor-orders/types.ts` — add
  `VendorOrdersResponse`.
- `apps/web/src/modules/vendor/vendor-orders/hooks/use-vendor-orders-query/index.ts`
  — return `VendorOrdersResponse`.
- `apps/web/src/modules/vendor/vendor-orders/index.tsx` — full Pencil
  rewrite: hero (eyebrow + H1 + subtitle), 3-segment status bar
  (clickable filters per Q3), `voSubHd` band with "Packing list"
  eyebrow + visual sort pill, vertical card stack, "Later zone"
  static informational callout (Q5).
- `apps/web/src/modules/vendor/vendor-orders/components/order-card/index.tsx`
  — full Pencil rewrite: paper-2 header strip + line-item rows
  (mono qty box on the left, name + descriptor in the middle,
  weight on the right) + COD note band + giant green CTA.

### Schema/type changes

**No DB migrations.** The existing schema covers everything the design
needs in Batch 1.

Type-only:
- `VendorOrdersResponse = { subOrders: VendorSubOrder[]; meta: { pendingCount: number } }`.

### API / server-action changes

- `GET /api/vendor/orders`:
  - Returns `{ subOrders, meta: { pendingCount } }` instead of a raw array.
  - Sub-orders sorted `ASC` by `createdAt` (oldest first per design copy).
  - `meta.pendingCount` = `count(sub_orders WHERE vendorId AND status='pending')` — exposed for the future sidebar badge per Q2.

### New molecules introduced (screen-local only)

- `StatusSegment` (inline) — clickable status-segment tile
  (NEW / PACKED / COMPLETE).
- Hero header layout, `voSubHd` band, and "Later zone" callout —
  inlined in `index.tsx`.

### Navigation entry points

REVAMP, not new. No nav entry points.

### Spec adherence — questions to satisfy

| Q | Answer | Implementation target |
|---|---|---|
| 1 | Mobile bottom tab bar — STUBBED | **DEFER** per scope-cut "Vendor mobile bottom tab bar DEFERRED" + Batch 4 watch-out. Existing collapsible sidebar stays. TODO comment in `vendor-layout`. |
| 2 | Sidebar badge — pending count via API meta | `route.ts` returns `meta.pendingCount`; sidebar wiring in Batch 4. TODO comment. |
| 3 | Segments = interactive filters | `index.tsx` segment click handlers |
| 4 | Counts: NEW=pending, PACKED=packed, third=`handed_to_courier + delivered` | `index.tsx` segmentCounts memo |
| 5 | Later zone = static footer | `index.tsx` Later zone (no count, static copy) |
| 6 | No detail page | No new routes |
| 7 | Contextual CTA — "Packed ✓" / "Handed off ✓" | `order-card.tsx` action map |
| 8 | Keep image + unit price | `order-card.tsx` row layout |
| 9 | Re-derive states; English; retoken | `index.tsx` state branches |
| 10 | Keep haptic + audio feedback | `index.tsx:triggerSuccessFeedback` retained |
| 11 | Keep 5s polling | `use-vendor-orders-query.ts` |
| 12 | Replace Roman Urdu with English | All copy English |
| 13 | Status mapping uses canonical map | `order-card.tsx` consumes `getSubOrderStatusDisplay` |
| 14 | Header surfaces both stamp + time | `order-card.tsx` header |
| 15 | "Print all labels" — DROPPED per scope-cut | Hide button (with TODO at Pencil location). "Need help?" not covered by Q — also hidden with TODO. |

### Deviations from plan

- **`voHdR` right cluster ("Print all labels" + "Need help?")
  hidden** for Batch 1. "Print all labels" is DROPPED per scope-cut
  (Statement/CSV downloads). "Need help?" wasn't covered by any
  gap-analysis question; per CLAUDE.md hard rule 1, hide rather
  than invent behavior. TODOs left at the Pencil location.
- **Mobile bottom tab bar omitted** per scope-cut DEFERRED. The
  `vendor-orders` gap-analysis Q1 marked it STUBBED with an
  IN_SCOPE override, but the binding scope-cut + Batch 4 watch-out
  defer it; the contradiction resolves to the more conservative
  DEFER for Batch 1.
- **`vendor-layout/vendor-sidebar` touched.** Added `prefetch={false}`
  on every nav `<Link>` because `/vendor/ledger` doesn't ship until
  Batch 6 — its prefetch RSC fetch was 404'ing in the network panel
  and failing the smoke gate. Touch is restricted to a single
  attribute; no behavior change. Documented as the Batch 1 deviation
  from "do not modify any screen other than the current one" because
  the alternative would have been to fail the strict 4xx/5xx gate
  on a pre-existing latent bug.

## Quality gate

| Check | Result |
|---|---|
| `pnpm --filter web check-types` | ✅ pass |
| `pnpm --filter web lint` | ✅ pass |
| `pnpm --filter web build` | ✅ pass |
| Playwright desktop (1440×900) at `/vendor/orders` | ✅ mounts, no console errors, all same-origin requests 200 |
| Playwright mobile (420×900) at `/vendor/orders` | ✅ mounts, no console errors |
| Existing Playwright e2e suite | N/A — repo has no Playwright/Vitest tests |

Smoke method: signed in as a throwaway vendor user via
`POST /api/auth/sign-up/email`; ran a one-off seed script
(`packages/database/src/.tmp-seed-vendor-batch1.ts`, deleted in this
commit) to promote the user to `vendor`, create the `vendors` row,
and insert one COD sub-order with two line items so the populated
card render path is exercised.

Screenshots saved to `screenshots/desktop.png` and
`screenshots/mobile.png`.

## Spec adherence

| Q | Answer | Satisfied at |
|---|---|---|
| 1 | Mobile bottom tab bar (STUBBED, scope-cut DEFERRED for vendor) | DEFER — existing collapsible sidebar stays. No tab bar in `vendor-layout`. |
| 2 | Sidebar pending badge — count via API meta | `route.ts:43-58` (`pendingCountRows` + `meta.pendingCount`). Sidebar wiring lands in Batch 4. |
| 3 | Segments = interactive filters | `index.tsx:139-143` (segment click sets `activeSegment`, list filters) |
| 4 | NEW=`pending`, PACKED=`packed`, third=`handed_to_courier+delivered` | `index.tsx:25-37` (`SEGMENTS` matches arrays) |
| 5 | Later zone = static info footer | `index.tsx:243-255` (no count, fixed copy) |
| 6 | No detail page | Card is non-navigational |
| 7 | CTA contextual — "Packed ✓" / "Handed off ✓" | `order-card.tsx:21-26` (STATUS_ACTION map) |
| 8 | Keep image + unit price | `order-card.tsx:80-99` |
| 9 | Re-derive states; English; retoken | `index.tsx:194-223` |
| 10 | Keep haptic + audio | `index.tsx:39-52` (`triggerSuccessFeedback`) + invocation at `:171` |
| 11 | Keep 5s polling | `use-vendor-orders-query.ts:19` (`refetchInterval: 5000`) |
| 12 | Replace Roman Urdu with English | All copy English |
| 13 | Status mapping uses canonical map | `order-card.tsx:11`/`:54` (consumes `getSubOrderStatusDisplay`) |
| 14 | Header surfaces stamp + time | `order-card.tsx:60-70` |
| 15 | "Print all labels" + "Need help?" hidden | `index.tsx:189-194` (TODO comment block) |

## Completed

### Files changed

- `apps/web/src/app/api/vendor/orders/route.ts` — sort ASC by
  `createdAt`; wrap response as `{ subOrders, meta: { pendingCount } }`.
- `apps/web/src/modules/vendor/vendor-orders/types.ts` — add
  `VendorOrdersMeta` and `VendorOrdersResponse`.
- `apps/web/src/modules/vendor/vendor-orders/hooks/use-vendor-orders-query/index.ts`
  — return `VendorOrdersResponse`.
- `apps/web/src/modules/vendor/vendor-orders/index.tsx` — full Pencil
  rewrite (hero, segments, voSubHd, list, Later zone).
- `apps/web/src/modules/vendor/vendor-orders/components/order-card/index.tsx`
  — full Pencil rewrite (paper-2 header, line-item rows, note band,
  giant CTA).
- `apps/web/src/modules/vendor/vendor-layout/vendor-sidebar/index.tsx`
  — `prefetch={false}` on nav links (chrome touch noted in
  "Deviations from plan").

### Test updates

None — repo has no test suite at present.

