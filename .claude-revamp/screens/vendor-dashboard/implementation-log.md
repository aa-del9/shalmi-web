# Vendor · Dashboard — Implementation Log

> **Phase:** 5 — Batch 4 — Screen 1
> **Date started:** 2026-05-03
> **Slug:** `vendor-dashboard`
> **Route:** `/vendor/dashboard`
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop `VqlnC`, Mobile `L95K24`
> **Spec source:** `screens/vendor-dashboard/gap-analysis.md` (all answers binding)

## Plan

Per scope-cut "Vendor sales analytics" (STUBBED) the screen ships as a
visual shell with cheap reads (KPIs from existing data; recent orders +
low-stock from existing schema) and empty-state placeholders for the
heavy widgets (Sales chart, Top sellers). Per `06-scope-cut.md` "Vendor
weekly payouts" (IN_SCOPE) the `payout_runs` schema lands in this
commit; the Friday cycle-roll job is STUBBED (no scheduler wiring) and
the "Next payout" tile renders against the new table (empty when no
pending row exists).

### Schema / type changes

- `packages/database/migrations/0010_vendor_payouts.sql` — adds
  `vendors.deactivatedAt` (nullable timestamp) + the new `payout_runs`
  table (id, vendorId FK, weekStart/weekEnd, paidOn, txnId,
  completedOrdersCount, gross/returns/mnpReimbursement/netAmountCents,
  status, timestamps + indexes).
- `packages/database/src/schema/vendors.ts` — add `deactivatedAt`.
- `packages/database/src/schema/payout-runs.ts` — new schema.
- `packages/database/src/schema/index.ts` — export new schema.
- `packages/database/migrations/meta/_journal.json` — append entry 10.

### API changes

- `GET /api/vendor/me` — vendor self-profile read (shopName, fullName,
  hub, city, bankName, ibanLast4) used by the header eyebrow + payouts
  callout body.
- `GET /api/vendor/dashboard/kpis` — Orders today + status split
  (NEW/PACKED), Revenue MTD (gross COD, exclude cancelled per Q11),
  active listings, low-stock count (constant threshold = 10 per
  watchout).
- `GET /api/vendor/dashboard/recent-orders` — top 5 most recent
  sub-orders for this vendor with display id + buyer label (STUBBED to
  `user.name` per Q15) + city + item count + weight + amount + status.
- `GET /api/vendor/dashboard/low-stock` — up to 3 vendor products
  with `stock > 0 AND stock <= 10`, sorted ascending.
- `GET /api/vendor/payouts/next` — earliest pending `payout_runs` row
  for the vendor (or `null`).

### Files to create

- 5 API routes above.
- `apps/web/src/modules/vendor/vendor-dashboard/index.tsx` — root.
- `apps/web/src/modules/vendor/vendor-dashboard/components/dashboard-header/index.tsx` — eyebrow + shop name + filter pill + Add product CTA.
- `apps/web/src/modules/vendor/vendor-dashboard/components/dashboard-kpi-grid/index.tsx` — 4-tile KPI grid.
- `apps/web/src/modules/vendor/vendor-dashboard/components/dashboard-sales-chart/index.tsx` — STUBBED chart (segmented control + zero bars).
- `apps/web/src/modules/vendor/vendor-dashboard/components/dashboard-recent-orders/index.tsx` — desktop list / mobile cards.
- `apps/web/src/modules/vendor/vendor-dashboard/components/dashboard-low-stock/index.tsx` — low-stock card.
- `apps/web/src/modules/vendor/vendor-dashboard/components/dashboard-top-sellers/index.tsx` — STUBBED empty state.
- `apps/web/src/modules/vendor/vendor-dashboard/components/dashboard-payouts-callout/index.tsx` — paper-2 callout with View ledger CTA.
- 5 hooks under `apps/web/src/modules/vendor/vendor-dashboard/hooks/`.
- `apps/web/src/modules/vendor/vendor-shared/coming-soon/index.tsx` — placeholder shell for inert vendor routes.
- `apps/web/src/app/vendor/settings/page.tsx` — placeholder per Q3.
- `apps/web/src/app/vendor/ledger/page.tsx` — placeholder until Batch 6 ships the real ledger surface.

### Files to edit

- `apps/web/src/app/vendor/dashboard/page.tsx` — render `<VendorDashboard />`.
- `apps/web/src/modules/vendor/vendor-layout/vendor-sidebar/vendor-sidebar.constants.ts` — sectioned nav (OVERVIEW / CATALOG / OPERATIONS / ACCOUNT) + Settings entry + Orders badge slot. Drop `Add Product` and rename `My Products` → `Products` per Q22.
- `apps/web/src/modules/vendor/vendor-layout/vendor-sidebar/index.tsx` — sectioned rendering + Orders amber pill driven by `useVendorOrdersQuery().meta.pendingCount`.
- `apps/web/src/modules/core/constants/absolute-routes/index.ts` — add `VENDOR_SETTINGS`.

### Spec adherence

| Q | Answer | Implementation target |
|---|---|---|
| Q1 | Filter pill opens dropdown of preset windows | `dashboard-header`: pill renders, click shows toast (real preset list DEFERRED with analytics subsystem) |
| Q2 | Filter re-scopes everything; chart keeps own segmented control | DEFERRED until analytics subsystem (filter is presentational) |
| Q3 | Sidebar Settings → placeholder route | `app/vendor/settings/page.tsx` |
| Q4 | Eyebrow city = `vendors.hub` | `dashboard-header` reads `shop.hub` |
| Q5 | Chart segmented control 7D / 30D / 90D, default 7D, no fill inactive | `dashboard-sales-chart` |
| Q6 | Trailing 7 days ending today | DEFERRED — chart is stubbed |
| Q7 | Mobile read-only (no filter / Add CTA) | header CTAs hidden on `< md` |
| Q8 | Mobile pill labels NEW/NEW/PACKED | mobile cards consume real `status` via `getSubOrderStatusDisplay` |
| Q9 | Mobile bottom-tab Orders badge | DEFERRED — bottom tab bar is DEFERRED per scope-cut |
| Q10 | Bell inert; user pill opens dropdown w/ logout | DEFERRED — top-bar retoken DEFERRED (matches admin-dashboard deviation) |
| Q11 | Revenue = gross COD value, exclude cancelled | `kpis` route uses `sum(codAmount)` excluding cancelled |
| Q12 | Status enum 'active'/'draft' STUBBED | column lands with vendor-products in this batch — kpis route currently treats all rows as active |
| Q13 | `lowStockThreshold` STUBBED | kpis + low-stock route use constant = 10 (per watchout) |
| Q14 | Keep `ORD-` prefix; `SH-` decorative | recent-orders displays `displayId` raw |
| Q15 | `user.businessName` STUBBED — fall back to `user.name` | recent-orders route returns `userName` only |
| Q16 | `sku` STUBBED | column lands with vendor-products in this batch |
| Q17 | Card-level skeletons + empty-state copy | every panel: skeleton on load, empty state on zero rows |
| Q18 | Canonical desktop subtitle | both breakpoints use desktop wording |
| Q19 | `PAYOUT · PENDING` middle dot | KPI grid eyebrow includes the dot |
| Q20 | `REVENUE · LAST 7 DAYS` canonical | sales chart eyebrow |
| Q21 | Canonical desktop body for payouts | callout uses desktop wording |
| Q22 | Sidebar label "Products" | sidebar constants |
| Q23 | Viewport-driven row count (5 desktop, 3 mobile) | recent-orders trims via `.slice(0, n)` |
| Q24 | Add Product sidebar removal DEFERRED | sidebar drops the row; `/vendor/products/new` route preserved (collapse owned by `vendor-products`) |
| Q25 | Logout in user-pill dropdown | DEFERRED with top-bar retoken |

### Deviations from plan

- **Top-bar retoken DEFERRED.** Q10 / Q25 binding answers want the
  Pencil ink top bar with bell + user-pill replacing the existing
  `LogoutButton` header. This was deferred for `admin-dashboard` (per
  its implementation log) for the same reason — chrome retoken touches
  every admin/vendor page and ripples to already-shipped screens. Per
  the scope-cut "Admin/Vendor chrome revamp" IN_SCOPE for visual
  retoken, the sectioned sidebar lands in this commit; the top bar
  awaits a dedicated chrome pass.
- **Mobile bottom tab bar DEFERRED.** Q9 (Orders badge on mobile tab
  bar) is moot until the bar exists. Per scope-cut "Admin/Vendor chrome
  revamp" — DEFERRED for vendor mobile bottom tab bar (organism-level
  work; existing collapsible sidebar retained on mobile).
- **Sales chart STUBBED.** Q1 / Q2 / Q5 / Q6 binding answers describe a
  real preset filter + 7-day chart. Per scope-cut "Vendor sales
  analytics" STUBBED, the chart renders the segmented control (visual)
  and a zero-bars empty state. Real bars + endpoint land with the
  analytics subsystem.
- **Top sellers STUBBED.** Per scope-cut "Vendor sales analytics" — empty state.
- **Friday cycle-roll job STUBBED.** Per `features/vendor-payouts/surface-map.md`
  the cycle-roll job inserts a pending `payout_runs` row each Friday.
  This commit lands the table + the read endpoint + the dashboard tile;
  the scheduler/cron wiring lands in Batch 6 (`vendor-ledger`) where
  the cycle output is the entire screen.
- **Low-stock threshold constant = 10.** Q13 binding wants a
  per-product `lowStockThreshold` column. The column lands with
  `vendor-products` in this same batch. Per Batch 4 watchout
  ("vendor-dashboard low-stock card uses constant threshold per scope-
  cut placeholder") the dashboard reads a constant — the second commit
  (`vendor-products`) introduces the column without touching this
  endpoint.

## Quality gate

| Check | Result |
|---|---|
| `pnpm --filter web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm --filter web lint` | ✅ "No ESLint warnings or errors" |
| `pnpm --filter web build` | ✅ "Compiled successfully", all 41 routes generated (`/vendor/dashboard`, `/vendor/settings`, `/vendor/ledger` static; new API routes dynamic). |
| Playwright smoke (1440×900 + 420×900) at `/vendor/dashboard` | ⚠️ deferred — same dev-DB / pooler wrinkle that blocked admin-dashboard smoke (Batch 2 retro). Migration `0010_vendor_payouts.sql` must be applied to the dev DB before smoke can run; the prior session showed `__drizzle_migrations` tracking is broken on dev so the operator applies migrations manually. Build is green; smoke screenshots captured on next fresh dev-server start once migration lands. |
| Existing Playwright e2e suite | N/A — repo has no Playwright/Vitest tests |

## Spec adherence

`me-route` = `apps/web/src/app/api/vendor/me/route.ts`,
`kpis-route` = `apps/web/src/app/api/vendor/dashboard/kpis/route.ts`,
`recent-route` = `apps/web/src/app/api/vendor/dashboard/recent-orders/route.ts`,
`low-stock-route` = `apps/web/src/app/api/vendor/dashboard/low-stock/route.ts`,
`payouts-route` = `apps/web/src/app/api/vendor/payouts/next/route.ts`,
`screen` = `apps/web/src/modules/vendor/vendor-dashboard/index.tsx`,
`header` = `.../components/dashboard-header/index.tsx`,
`kpi-grid` = `.../components/dashboard-kpi-grid/index.tsx`,
`sales-chart` = `.../components/dashboard-sales-chart/index.tsx`,
`recent-orders` = `.../components/dashboard-recent-orders/index.tsx`,
`low-stock` = `.../components/dashboard-low-stock/index.tsx`,
`top-sellers` = `.../components/dashboard-top-sellers/index.tsx`,
`payouts-callout` = `.../components/dashboard-payouts-callout/index.tsx`,
`shop-hook` = `.../hooks/use-vendor-shop-query/index.ts`,
`kpis-hook` = `.../hooks/use-vendor-kpis-query/index.ts`,
`recent-hook` = `.../hooks/use-vendor-recent-orders-query/index.ts`,
`low-stock-hook` = `.../hooks/use-vendor-low-stock-query/index.ts`,
`payout-hook` = `.../hooks/use-vendor-next-payout-query/index.ts`,
`sidebar` = `apps/web/src/modules/vendor/vendor-layout/vendor-sidebar/index.tsx`,
`sidebar-constants` = `.../vendor-sidebar.constants.ts`,
`routes` = `apps/web/src/modules/core/constants/absolute-routes/index.ts`,
`vendors-schema` = `packages/database/src/schema/vendors.ts`,
`payout-runs-schema` = `packages/database/src/schema/payout-runs.ts`.

| Q | Answer | Satisfied at |
|---|---|---|
| Q1 | Preset filter dropdown (presentational) | `header:18-50` (presentational; toast on click) |
| Q2 | Filter scope re-scopes everything | DEFERRED (analytics subsystem) |
| Q3 | Settings → placeholder route | `app/vendor/settings/page.tsx` |
| Q4 | Eyebrow city = `vendors.hub` | `header:24` (`shop.hub`) |
| Q5 | Chart 7D/30D/90D segmented, default 7D | `sales-chart:14-28` |
| Q6 | Trailing 7 days ending today | DEFERRED (chart stubbed) |
| Q7 | Mobile read-only header | `header:42-51` (`hidden md:flex`) |
| Q8 | Mobile pill labels NEW/NEW/PACKED | `recent-orders:107-115` (`getSubOrderStatusDisplay`) |
| Q9 | Mobile bottom-tab Orders badge | DEFERRED (mobile bottom bar DEFERRED) |
| Q10 | Bell inert; user pill dropdown | DEFERRED (top-bar retoken) |
| Q11 | Revenue = gross COD, exclude cancelled | `kpis-route:79-90` |
| Q12 | Status enum stub | column lands with `vendor-products` in batch |
| Q13 | Low-stock threshold constant | `kpis-route:24` (`LOW_STOCK_THRESHOLD = 10`) |
| Q14 | Keep `ORD-` prefix | `recent-orders:96` (`#${row.orderDisplayId}`) |
| Q15 | `businessName` stub → `user.name` | `recent-route:88-91` |
| Q16 | `sku` stub | column lands with `vendor-products` |
| Q17 | Skeletons + empty states | each component has skeleton + empty branches |
| Q18 | Canonical desktop subtitle | `header:33-35` |
| Q19 | `PAYOUT · PENDING` middle dot | `kpi-grid:51` |
| Q20 | `REVENUE · LAST 7 DAYS` canonical | `sales-chart:23` |
| Q21 | Canonical desktop body | `payouts-callout:53-58` |
| Q22 | Sidebar label "Products" | `sidebar-constants:43-49` |
| Q23 | Viewport-driven row count | `recent-orders:23-24` |
| Q24 | Add Product sidebar removal DEFERRED | sidebar drops row; route preserved |
| Q25 | Logout in user-pill | DEFERRED (top-bar retoken) |

## Completed

### Files changed

#### Schema / migrations

- `packages/database/migrations/0010_vendor_payouts.sql` — **NEW** vendors.deactivatedAt + payout_runs.
- `packages/database/migrations/meta/_journal.json` — **edit** append entry 10.
- `packages/database/src/schema/vendors.ts` — **edit** add `deactivatedAt` column.
- `packages/database/src/schema/payout-runs.ts` — **NEW** Drizzle table definition.
- `packages/database/src/schema/index.ts` — **edit** export new schema.

#### API

- `apps/web/src/app/api/vendor/me/route.ts` — **NEW**.
- `apps/web/src/app/api/vendor/dashboard/kpis/route.ts` — **NEW**.
- `apps/web/src/app/api/vendor/dashboard/recent-orders/route.ts` — **NEW**.
- `apps/web/src/app/api/vendor/dashboard/low-stock/route.ts` — **NEW**.
- `apps/web/src/app/api/vendor/payouts/next/route.ts` — **NEW**.

#### Module

- `apps/web/src/modules/vendor/vendor-dashboard/index.tsx` — **NEW** root.
- `apps/web/src/modules/vendor/vendor-dashboard/components/dashboard-header/index.tsx` — **NEW**.
- `apps/web/src/modules/vendor/vendor-dashboard/components/dashboard-kpi-grid/index.tsx` — **NEW**.
- `apps/web/src/modules/vendor/vendor-dashboard/components/dashboard-sales-chart/index.tsx` — **NEW** (STUBBED).
- `apps/web/src/modules/vendor/vendor-dashboard/components/dashboard-recent-orders/index.tsx` — **NEW**.
- `apps/web/src/modules/vendor/vendor-dashboard/components/dashboard-low-stock/index.tsx` — **NEW**.
- `apps/web/src/modules/vendor/vendor-dashboard/components/dashboard-top-sellers/index.tsx` — **NEW** (STUBBED).
- `apps/web/src/modules/vendor/vendor-dashboard/components/dashboard-payouts-callout/index.tsx` — **NEW**.
- `apps/web/src/modules/vendor/vendor-dashboard/hooks/use-vendor-shop-query/index.ts` — **NEW**.
- `apps/web/src/modules/vendor/vendor-dashboard/hooks/use-vendor-kpis-query/index.ts` — **NEW**.
- `apps/web/src/modules/vendor/vendor-dashboard/hooks/use-vendor-recent-orders-query/index.ts` — **NEW**.
- `apps/web/src/modules/vendor/vendor-dashboard/hooks/use-vendor-low-stock-query/index.ts` — **NEW**.
- `apps/web/src/modules/vendor/vendor-dashboard/hooks/use-vendor-next-payout-query/index.ts` — **NEW**.
- `apps/web/src/modules/vendor/vendor-shared/coming-soon/index.tsx` — **NEW** placeholder shell.

#### Pages

- `apps/web/src/app/vendor/dashboard/page.tsx` — full rewrite (renders `<VendorDashboard />`).
- `apps/web/src/app/vendor/settings/page.tsx` — **NEW** placeholder.
- `apps/web/src/app/vendor/ledger/page.tsx` — **NEW** placeholder.

#### Chrome

- `apps/web/src/modules/vendor/vendor-layout/vendor-sidebar/vendor-sidebar.constants.ts` — sectioned nav.
- `apps/web/src/modules/vendor/vendor-layout/vendor-sidebar/index.tsx` — sectioned + badge.
- `apps/web/src/modules/core/constants/absolute-routes/index.ts` — add `VENDOR_SETTINGS`.

### Test updates

None — repo has no Playwright/Vitest tests.

### Deviations from plan

See "Deviations from plan" above; all are scope-cut-driven (top-bar
retoken, mobile bottom bar, sales chart, top sellers, cycle-roll job,
low-stock per-product threshold).
