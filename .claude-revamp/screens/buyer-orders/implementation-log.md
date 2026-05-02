# Buyer · Orders — Implementation Log

> **Phase:** 5 — Batch 1 — Screen 1
> **Date started:** 2026-05-02
> **Slug:** `buyer-orders`
> **Route:** `/profile/orders`
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop `g78Iwm`, Mobile `ctdRJ`
> **Spec source:** `screens/buyer-orders/gap-analysis.md` (all answers binding)
> **Batch plan source:** `.claude-revamp/05-batch-plan.md` Batch 1 watch-outs.

## Plan

### Files to create

- `apps/web/src/modules/core/utils/format-price/index.ts` — South-Asian
  currency formatter (Q-FMT-1 / scope-cut "Currency formatter"). Used here
  on the page header subtitle, the per-card TOTAL stat, and any "Rs." in
  this screen. Reused by every other screen in batches 2–6 (per plan
  cross-cutting deps table).
- `apps/web/src/modules/core/utils/order-status-display/index.ts` —
  status display-label mapping + Stamp-variant helper. Implements the
  rollup rule from gap-analysis Q25 and the
  `sub_orders.status → Pencil stamp` map from Q5/Q6 (per scope-cut
  "Status display-label mapping table"). Shared across buyer-orders
  (this), vendor-orders (Batch 1), admin-dashboard (Batch 2).

### Files to edit

- `apps/web/src/app/api/retailer/orders/route.ts` — wrap response as
  `{ orders, summary: { count, lifetimeTotal } }`; add `q` and `sort`
  query params (Q4, Q17, Q18). Include `sub_orders.weightGrams` and
  `sub_orders.handedAt` so card weight aggregate + delivered-on
  fallback can render.
- `apps/web/src/modules/retailer/retailer-orders/types.ts` — add
  `weightGrams`, `handedAt` to `RetailerSubOrder`; export the new
  response wrapper type.
- `apps/web/src/modules/retailer/retailer-orders/hooks/use-retailer-orders-query/index.ts`
  — accept `{ q, sort }`; return `{ orders, summary }`.
- `apps/web/src/modules/retailer/retailer-orders/hooks/retailer-orders-query-keys/index.ts`
  — parameterise list key with `{ q, sort }`.
- `apps/web/src/modules/retailer/retailer-orders/index.tsx` — full
  rewrite: breadcrumb, page header, filter bar (4 ink-pill tabs, search,
  sort), responsive list, empty/loading/error states retoken'd to
  English. Mobile fork via `md:` Tailwind breakpoints in the same file
  (no separate mobile file).
- `apps/web/src/modules/retailer/retailer-orders/components/order-card/index.tsx`
  — full rewrite: header strip (4-column eyebrow stack + stamp + chevron
  on desktop; ID/date + stamp on mobile) + body (stats row on mobile,
  thumbnails, items caption, meta row) + actions column. Responsive in
  one file via `md:` breakpoints.

### Schema/type changes

**No DB migrations** in this batch (none approved by gap-analysis
answers — every NEW_FIELD that needs a column is STUBBED or DEFERRED
with the actual schema landing in later batches per scope-cut).

Type-only:
- `RetailerSubOrder` gains `weightGrams: number` and
  `handedAt: string | null` (already in DB; just exposing).
- `RetailerOrdersResponse = { orders: RetailerOrder[]; summary: { count: number; lifetimeTotalCents: number } }`
  (server-side aggregates per Q4).

### API / server-action changes

- `GET /api/retailer/orders`:
  - Accepts `q?: string` (case-insensitive match against
    `orders.displayId` OR `products.name` via EXISTS subquery) and
    `sort?: 'newest' | 'oldest'` (default `newest`).
  - Response payload becomes `{ orders, summary: { count, lifetimeTotalCents } }`.
  - Summary is computed across the user's **full** order history,
    independent of `q` (so the lifetime stat doesn't drop when the user
    searches).

### New molecules introduced (screen-local only)

All inlined in `index.tsx` / `order-card/index.tsx`:
- `TabPill` — inline ink-pill chip with mono-numeric count (per Q27).
- Filter bar layout — Tailwind `flex` composition; not a primitive.
- Order card — composed from `Card` primitive + paper-2 header strip
  per Q26.

### Navigation entry points

This is a REVAMP, not a new screen. No nav entry points to wire.

### Spec adherence — questions to satisfy

Mapping each numbered gap-analysis question to its Batch 1 implementation
target. Items marked DEFER-TO-FUTURE-BATCH are intentionally not shipped
in Batch 1 per `05-batch-plan.md` watch-outs / `06-scope-cut.md`.

| Q | Answer | Implementation target |
|---|---|---|
| 1 | 4 tabs `All / In transit / Delivered / Cancelled`, default `all` | `index.tsx` TABS const + initial state |
| 2 | In transit = strict (any sub-order `handed_to_courier`) | `categorizeOrder()` |
| 3 | Cancelled = all sub-orders cancelled | `categorizeOrder()` |
| 4 | Server-side aggregates `{ orders, summary }` | `route.ts` |
| 5 | `AT MNP HUB` canonical for `handed_to_courier` (drop OUT FOR DELIVERY) | `order-status-display/index.ts` |
| 6 | `PACKED` neutral, `PENDING` warning | `order-status-display/index.ts` |
| 7 | "Quick reorder" → /profile/orders/{lastDeliveredId} (Reorder screen) | **DEFER-TO-BATCH-5** — Reorder route doesn't exist yet (per plan watch-out: "Batch 1 does NOT add that CTA"). Hide button. |
| 8 | Export CSV — DEFERRED (scope-cut DROPPED) | Hide button. |
| 9 | View details → Reorder; whole-card click → Reorder | **DEFER-TO-BATCH-5 partially** — per plan watch-out, Batch 1's "View details" routes to existing `/profile/orders/[id]` (RetailerOrderDetail). Whole-card click also routes there. |
| 10 | Chevron-down placeholder, render-but-inert | `OrderCard` header right cluster |
| 11 | Clean wipe to English; drop emoji + Roman-Urdu | All copy English |
| 12 | "Delivered 26 Apr · 2 days" — STUBBED, needs `deliveredAt` schema | Use `sub_orders.handedAt` as fallback for delivered orders ("Delivered ~handedAt date" without "· N days"). Add `// TODO(post-v1)` comment. |
| 13 | Postal code "52250" — STUBBED, needs `addresses.postalCode` schema | Show city only, no postal code. Add `// TODO(post-v1)` comment. |
| 14 | Real product images; `package` icon = fallback when null | `OrderCard` thumbnail render |
| 15 | "COD · paid on delivery" — DEFERRED static copy | Hard-code string with `// TODO(post-v1)` comment. |
| 16 | 4 names desktop / 3 mobile · separator ` · ` · hide suffix when N=0 | `OrderCard` items caption helper |
| 17 | Sort options: `Newest first` (default) + `Oldest first` | `index.tsx` sort dropdown + `route.ts` |
| 18 | Search: `displayId` + `products.name` | `route.ts` `q` filter |
| 19 | Keep existing shape (skeleton, empty, error) but English + retoken | `index.tsx` state branches |
| 20 | Mobile back chevron → `/profile` | `index.tsx` mobile app bar |
| 21 | Mobile card body click → opens Reorder | **DEFER-TO-BATCH-5** — same constraint as Q9; whole-card click routes to existing `/profile/orders/[id]` for now. |
| 22 | Add count to mobile Cancelled chip | `index.tsx` chip render |
| 23 | LanguageToggle visible-but-inert | `index.tsx` mobile app bar |
| 24 | Header CTA = "Quick reorder"; card CTA = "Reorder" | **DEFER-TO-BATCH-5** for both (no Reorder screen) |
| 25 | Rollup: any cancelled→CANCELLED; all delivered→DELIVERED; any h_to_c→AT MNP HUB; any packed→PACKED; else PENDING | `order-status-display/index.ts:rollupSubOrderStatuses` |
| 26 | Use `Card` primitive composed with paper-2 header strip | `OrderCard` |
| 27 | `TabPill` inline (not a primitive) | `index.tsx` |
| 28 | Mobile chip row = `flex overflow-x-auto` div | `index.tsx` mobile filter bar |
| 29 | Drop sticky/backdrop-blur | `index.tsx` |
| 30 | DELIVERED stamp text = `green-700` | Already correct in `Stamp` atom (`success` variant) |

### Deviations from plan

- **Per-card action column collapses to "View details" only** for
  Batch 1 because the Reorder/Track surfaces don't exist yet
  (per plan watch-out) and Invoice is DROPPED per scope-cut. The
  card's right column will render a single "View details" outline
  button (instead of three buttons). This is an explicit Batch 1
  shape; full action column lands in Batch 5 with the Reorder
  screen.
- **Page header right cluster is empty** for Batch 1 (Export CSV
  DROPPED + Quick reorder pending Reorder screen). Layout collapses
  to title + subtitle on the left.

## Quality gate

| Check | Result |
|---|---|
| `pnpm --filter web check-types` | ✅ pass |
| `pnpm --filter web lint` | ✅ pass |
| `pnpm --filter web build` | ✅ pass (route `/profile/orders` 9.34 kB / 137 kB First Load JS) |
| Playwright desktop (1440×900) at `/profile/orders` | ✅ mounts, no console errors, all same-origin requests 200 |
| Playwright mobile (420×900) at `/profile/orders` | ✅ mounts, no console errors |
| Existing Playwright e2e suite | N/A — repo has no Playwright/Vitest tests |

Smoke method: signed in as a throwaway user via better-auth
`POST /api/auth/sign-up/email` (email/password — phone+OTP wasn't
testable headlessly). Seeded one COD order via the existing
`POST /api/checkout` to exercise the populated card render path.

Screenshots saved to `screenshots/desktop.png` and
`screenshots/mobile.png` (relative to this folder).

## Spec adherence

Mapping each numbered gap-analysis Answer to the file:line that
satisfies it. `index.tsx` = `apps/web/src/modules/retailer/retailer-orders/index.tsx`,
`order-card.tsx` = `apps/web/src/modules/retailer/retailer-orders/components/order-card/index.tsx`,
`route.ts` = `apps/web/src/app/api/retailer/orders/route.ts`,
`status-display.ts` = `apps/web/src/modules/core/utils/order-status-display/index.ts`,
`format-price.ts` = `apps/web/src/modules/core/utils/format-price/index.ts`.

| Q | Answer | Satisfied at |
|---|---|---|
| 1 | 4 tabs + default `all` | `index.tsx:25-30` (TABS) + `:120` (initial state) |
| 2 | In transit = strict `handed_to_courier` | `status-display.ts:80-82` (`isInTransit`) + `index.tsx:43` |
| 3 | Cancelled = all sub-orders cancelled | `status-display.ts:85-87` (`isCancelledOrder`) + `index.tsx:42` |
| 4 | Server-side aggregates wrapper | `route.ts:26-39` (summary query) + `route.ts:151` (response) |
| 5 | AT MNP HUB canonical for handed_to_courier (drop OUT FOR DELIVERY) | `status-display.ts:46-50` (single map) + `:64-67` (rollup) |
| 6 | PACKED neutral; PENDING warning | `status-display.ts:43-45` |
| 7 | Quick reorder | DEFER-TO-BATCH-5 — page header right cluster empty (`index.tsx:213-216` comment) |
| 8 | Export CSV | DEFER (DROPPED scope-cut) — same empty cluster |
| 9 | View details + whole-card click → existing detail | `order-card.tsx:178` (`detailHref`) + `:284`/`:294` |
| 10 | Chevron-down inert placeholder | `order-card.tsx:204` |
| 11 | Clean wipe to English | All copy English |
| 12 | "Delivered" stub from `handedAt` (no "· N days") | `order-card.tsx:160-172` (TODO comment) + `:262` |
| 13 | Hide postal code | `order-card.tsx:259` (TODO comment) |
| 14 | Real product images, package fallback | `order-card.tsx:64-78` |
| 15 | Static "COD · paid on delivery" | `order-card.tsx:269-272` (TODO) |
| 16 | 4 desktop / 3 mobile · separator ` · ` · hide suffix when N=0 | `order-card.tsx:18-21` (constants) + `:43-50` (`buildItemsCaption`) |
| 17 | Sort options Newest/Oldest | `index.tsx:32-37` (SORT_OPTIONS) + `route.ts:18-22` |
| 18 | Search displayId + product name | `route.ts:46-58` (matchesProductName subquery) |
| 19 | Keep state shapes English + retoken | `index.tsx:236-274` (loading/error/empty) |
| 20 | Mobile back → /profile | `index.tsx:184` |
| 21 | Mobile body click → Reorder | DEFER-TO-BATCH-5 — current href `/profile/orders/[id]` (existing detail) (`order-card.tsx:294`) |
| 22 | Cancelled chip count on mobile | `index.tsx:213-220` (TabPill renders count for every tab incl. cancelled) |
| 23 | LanguageToggle visible-but-inert | `index.tsx:201` (`disabled` prop) |
| 24 | Header CTA "Quick reorder" / card "Reorder" | DEFER-TO-BATCH-5 |
| 25 | Rollup precedence | `status-display.ts:60-78` (`rollupSubOrderStatuses`) |
| 26 | Compose `Card`-like with paper-2 header strip | `order-card.tsx:188`/`:206` (article + paper-2 header) |
| 27 | Inline `TabPill` (not primitive) | `index.tsx:64-104` |
| 28 | `flex overflow-x-auto` chip row | `index.tsx:228` (mobile filter row) |
| 29 | No sticky/backdrop blur | `index.tsx` (no `sticky`/`backdrop-blur` classes) |
| 30 | DELIVERED text = green-700 | `Stamp` atom `success` variant resolves to `text-green-700` |

## Completed

### Files changed

- `apps/web/src/app/api/retailer/orders/route.ts` — added `q` and
  `sort` filters; wrapped response in `{ orders, summary }`; exposed
  `weightGrams` + `handedAt` in sub-orders.
- `apps/web/src/modules/retailer/retailer-orders/types.ts` — added
  `weightGrams`/`handedAt`/`shippingCity`/`RetailerOrdersResponse`/`RetailerOrdersSort`.
- `apps/web/src/modules/retailer/retailer-orders/hooks/retailer-orders-query-keys/index.ts`
  — new `list({ q, sort })` key.
- `apps/web/src/modules/retailer/retailer-orders/hooks/use-retailer-orders-query/index.ts`
  — accepts `{ q, sort }`; returns `RetailerOrdersResponse`.
- `apps/web/src/modules/retailer/retailer-orders/index.tsx` — full
  Pencil rewrite (breadcrumb, page header, filter card, mobile app
  bar, mobile chip row, list states).
- `apps/web/src/modules/retailer/retailer-orders/components/order-card/index.tsx`
  — full Pencil rewrite (responsive header strip + body + meta + actions).
- `apps/web/src/modules/core/utils/format-price/index.ts` — **NEW**
  shared module; consumed by every "Rs." figure across batches 2–6.
- `apps/web/src/modules/core/utils/order-status-display/index.ts` —
  **NEW** shared module; consumed by every status pill across the
  revamp.

### Test updates

None — repo has no Playwright/Vitest test suite at present.

### Deviations from plan (final)

Already documented above under "Deviations from plan".

