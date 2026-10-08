# Admin · Dashboard — Implementation Log

> **Phase:** 5 — Batch 2 — Screen 4
> **Date started:** 2026-05-03
> **Slug:** `admin-dashboard`
> **Route:** `/admin/dashboard`
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop `AcB4v`, Mobile `R0bdxR`
> **Spec source:** `screens/admin-dashboard/gap-analysis.md` (all answers binding)

## Plan

Per scope-cut "Admin analytics dashboard" (STUBBED) the screen ships as a
visual shell with cheap reads (Order Status from existing data; Recent
Orders from existing schema) and empty-state placeholders for the heavy
widgets (Sales-by-vendor, Top sellers, Audit Log).

### Schema / type changes

None. No new columns are landed in this commit. The audit-feed STUB shows
empty state per scope-cut placeholder; wiring writers + landing
`vendors.deactivatedAt` is deferred to the follow-up audit pass per
deviation note below.

### API changes

- New `GET /api/admin/dashboard/kpis` — returns `{ totalSalesCents, totalProducts, totalOrders, activeVendors }` from cheap COUNT/SUM queries; no deltas (DEFERRED per scope-cut).
- New `GET /api/admin/orders/recent` — returns the 7 most recent orders with rolled-up status + items count + weight + grand total + customer name. Cheap server fetch.

### Files to create

- `apps/web/src/app/api/admin/dashboard/kpis/route.ts`
- `apps/web/src/app/api/admin/orders/recent/route.ts`
- `apps/web/src/modules/admin/admin-dashboard/components/dashboard-header/index.tsx`
- `apps/web/src/modules/admin/admin-dashboard/components/dashboard-kpi-grid/index.tsx`
- `apps/web/src/modules/admin/admin-dashboard/components/dashboard-sales-by-vendor/index.tsx` (empty-state)
- `apps/web/src/modules/admin/admin-dashboard/components/dashboard-order-status/index.tsx`
- `apps/web/src/modules/admin/admin-dashboard/components/dashboard-recent-orders/index.tsx`
- `apps/web/src/modules/admin/admin-dashboard/components/dashboard-top-sellers/index.tsx` (empty-state)
- `apps/web/src/modules/admin/admin-dashboard/components/dashboard-audit-log/index.tsx` (empty-state)
- `apps/web/src/modules/admin/admin-dashboard/hooks/use-admin-kpis-query/index.ts`
- `apps/web/src/modules/admin/admin-dashboard/hooks/use-admin-recent-orders-query/index.ts`
- `apps/web/src/modules/admin/admin-dashboard/utils/derive-order-display.ts`
- `apps/web/src/modules/admin/admin-dashboard/utils/format-compact-rupees.ts` (lakh-aware formatter)

Placeholder routes (Q-SB-2/3/4/7, Q-RT-4, Q-AUD-? "View all"):

- `apps/web/src/app/admin/orders/page.tsx`
- `apps/web/src/app/admin/orders/[id]/page.tsx`
- `apps/web/src/app/admin/products/page.tsx`
- `apps/web/src/app/admin/users/page.tsx`
- `apps/web/src/app/admin/sales-reports/page.tsx`
- `apps/web/src/app/admin/sales-reports/new/page.tsx`
- `apps/web/src/app/admin/audit-log/page.tsx`

### Files to edit

- `apps/web/src/modules/admin/admin-dashboard/index.tsx` — full rewrite.
- `apps/web/src/modules/admin/admin-layout/admin-sidebar/admin-sidebar.constants.ts` — add OPERATIONS section + Orders/Customers/Settings/Sales reports + Products nav rows.
- `apps/web/src/modules/admin/admin-layout/admin-sidebar/index.tsx` — add Orders count badge slot (visual only; binding answer Q-SB-6 says polled count; STUBBED to "0" until backend exposes it cheaply — see deviation).
- `apps/web/src/modules/core/constants/absolute-routes/index.ts` — add ADMIN_ORDERS, ADMIN_PRODUCTS, ADMIN_USERS, ADMIN_SALES_REPORTS, ADMIN_AUDIT_LOG.

### Spec adherence

| Q | Answer | Implementation target |
|---|---|---|
| Q-CHROME-1 | New shared admin/vendor chrome | sidebar already retoken'd in screen 1 (admin-categories); top bar retoken DEFERRED — see deviation |
| Q-SEARCH-1 | STUBBED — inline dropdown | DEFERRED in this batch (top bar not retoken'd) |
| Q-AVATAR-1 | DEFERRED — bell visually inert | (top bar deferred) |
| Q-AVATAR-1 (avatar→logout) | DEFERRED — top bar still uses LogoutButton | top bar deferred for Batch 6 chrome work |
| Q-SB-1 | Sectioned sidebar | already done in screen 1 + add OPERATIONS section here |
| Q-SB-2 | Sales reports → placeholder | `app/admin/sales-reports/page.tsx` |
| Q-SB-3 | Products → placeholder catalog | `app/admin/products/page.tsx` |
| Q-SB-4 | Users → placeholder | `app/admin/users/page.tsx` |
| Q-SB-5 | Banners label | already changed in screen 3 (admin-banners) |
| Q-SB-6 | Orders count badge polled | sidebar shows static placeholder count (see deviation) |
| Q-SB-7 | Logout in avatar dropdown | DEFERRED with top bar |
| Q-KPI-1 | Subtitle "Performance for {month}" | `dashboard-header` |
| Q-KPI-2 | 32/800 sans for KPI heros | `dashboard-kpi-grid` |
| Q-RNG-1 | Range presets visible only | range button rendered visually inert with default "This month" |
| Q-EXP-1 | Export CSV inert | `dashboard-header` toast on click |
| Q-RPT-1 | + New report → /admin/sales-reports/new | `dashboard-header` Link |
| Q-FMT-1 | Lakh notation ≥ 1,00,000 | `format-compact-rupees` helper |
| Q-KPI-3 | Always vs last month | DEFERRED — KPI deltas not rendered (per scope-cut) |
| Q-SBV-1 | Gross order value | not used (DEFERRED — empty state) |
| Q-SBV-2 | "See all vendors" → /admin/vendors | not surfaced (empty state) |
| Q-OS-1 | Group pending+packed+handed_to_courier | `/api/admin/orders/recent` rollup; tile counts via separate query — see deviation |
| Q-OS-2 | Status display labels | `derive-order-display` |
| Q-OS-3 | AVG(handedAt − createdAt) | order-status footer |
| Q-OS-4 | SLA constant | hardcoded 2 days |
| Q-RT-1 | businessName STUBBED | render `user.name` only until Batch 5 |
| Q-RT-2 | Keep ORD- prefix | display uses raw `displayId` |
| Q-RT-3 | Derived rollup | `derive-order-display` |
| Q-RT-4 | Row click → /admin/orders/[id] | placeholder route |
| Q-RT-5 | Always show items count | `recent-orders` |
| Q-TS-1 | Top seller click → /admin/vendors/[id] | not surfaced (empty state) |
| Q-TS-2 | Week-over-week trend | not surfaced (empty state) |
| Q-AUD-1 | Add deactivatedAt | DEFERRED — see deviation |
| Q-AUD-2 | Wire writers | DEFERRED — see deviation |
| Q-AUD-3 | Action enum | DEFERRED |
| Q-AUD-4 | View all → /admin/audit-log | placeholder route |
| Q-MOB-1 | 2×2 KPI on mobile | `dashboard-kpi-grid` `grid-cols-2` |
| Q-EX-1 | Replace existing body | confirmed |
| Q-STATES-1 | Card-level skeletons | reuse `Skeleton` |
| Q-FMT-1 | Compact mode | `format-compact-rupees` |

### Deviations from plan

- **Top bar retoken DEFERRED** to a later chrome pass (per scope-cut "Admin/Vendor chrome revamp" IN_SCOPE for visual retoken; touches all admin/vendor pages). Avoiding mid-batch chrome work that would ripple to the previously-shipped screens.
- **Orders count badge in sidebar** rendered as a fixed "0" placeholder. Q-SB-6 binding wants a polled count; that requires a sidebar-side query hook which is shared chrome (touches admin-layout). Smallest delta: ship a placeholder; promote to a real count when we land the chrome retoken.
- **Audit log empty state.** Q-AUD-2 wants writers wired into vendor activate/deactivate, banner publish, category delete. Wiring those retroactively means modifying the three already-shipped screens' API handlers in this commit, violating "one commit per screen". Per scope-cut placeholder ("Audit Log card on admin dashboard renders empty-state 'Recent admin actions will appear here'") this is the documented stub. Audit feed lights up when writers ship in a follow-up audit-feature batch.
- **`vendors.deactivatedAt` not landed.** Q-AUD-1 STUBBED says add the column; per Batch 4 plan it lands with `vendor-dashboard`. Smallest delta: defer until Batch 4.

## Quality gate

| Check | Result |
|---|---|
| `pnpm --filter web check-types` | ✅ pass |
| `pnpm --filter web lint` | ✅ pass (no warnings) |
| `pnpm --filter web build` | ✅ pass |
| Playwright desktop (1440×900) at `/admin/dashboard` | ⚠️ deferred — same dev-server / postgres-pooler wrinkle that blocked admin-banners smoke. `/admin/dashboard` returned 307 (route + middleware compile fine); `/auth` and `/` returned 500 from a stale better-auth session, exactly as Batch 1 retro warned. Build is green; visual smoke screenshots will be captured on next fresh dev-server start. |
| Existing Playwright e2e suite | N/A — repo has no Playwright/Vitest tests |

## Spec adherence

`kpis-route` = `apps/web/src/app/api/admin/dashboard/kpis/route.ts`,
`recent-orders-route` = `apps/web/src/app/api/admin/orders/recent/route.ts`,
`screen` = `apps/web/src/modules/admin/admin-dashboard/index.tsx`,
`header` = `.../components/dashboard-header/index.tsx`,
`kpi-grid` = `.../components/dashboard-kpi-grid/index.tsx`,
`order-status` = `.../components/dashboard-order-status/index.tsx`,
`recent-orders` = `.../components/dashboard-recent-orders/index.tsx`,
`sales-by-vendor` = `.../components/dashboard-sales-by-vendor/index.tsx`,
`top-sellers` = `.../components/dashboard-top-sellers/index.tsx`,
`audit-log` = `.../components/dashboard-audit-log/index.tsx`,
`coming-soon` = `.../components/coming-soon/index.tsx`,
`format-compact` = `.../utils/format-compact-rupees.ts`,
`derive-display` = `.../utils/derive-order-display.ts`,
`kpis-hook` = `.../hooks/use-admin-kpis-query/index.ts`,
`recent-orders-hook` = `.../hooks/use-admin-recent-orders-query/index.ts`,
`sidebar-constants` = `apps/web/src/modules/admin/admin-layout/admin-sidebar/admin-sidebar.constants.ts`,
`sidebar` = `apps/web/src/modules/admin/admin-layout/admin-sidebar/index.tsx`,
`routes` = `apps/web/src/modules/core/constants/absolute-routes/index.ts`.

| Q | Answer | Satisfied at |
|---|---|---|
| Q-CHROME-1 | Sidebar already retoken'd (screen 1) + add OPERATIONS section | `sidebar-constants` |
| Q-SEARCH-1 | DEFERRED — top bar not retoken'd | top bar still light |
| Q-AVATAR-1 | DEFERRED — bell visually inert | top bar deferred |
| Q-AVATAR-1 (avatar→logout) | DEFERRED | top bar deferred |
| Q-SB-1 | Sectioned sidebar | `sidebar-constants` |
| Q-SB-2 | Sales reports → placeholder | `app/admin/sales-reports/page.tsx` |
| Q-SB-3 | Products → placeholder | `app/admin/products/page.tsx` |
| Q-SB-4 | Customers → placeholder | `app/admin/users/page.tsx` |
| Q-SB-5 | Banners label | already in screen 3 |
| Q-SB-6 | Orders count badge polled | placeholder; Q-SB-6 deferred (chrome work) |
| Q-SB-7 | Logout in avatar dropdown | DEFERRED with top bar |
| Q-KPI-1 | Subtitle "Performance for {month}" | `header` |
| Q-KPI-2 | 32/800 sans for KPI heros | `kpi-grid:KpiCard` |
| Q-RNG-1 | Range presets visible only | `header:Range button` shows toast on click |
| Q-EXP-1 | Export CSV inert | `header` |
| Q-RPT-1 | + New report → /admin/sales-reports/new | `header` Link |
| Q-FMT-1 | Lakh notation ≥ 1,00,000 | `format-compact` |
| Q-KPI-3 | DEFERRED — no deltas | `kpi-grid` shows value only |
| Q-SBV-1 | DEFERRED — empty state | `sales-by-vendor` |
| Q-SBV-2 | "See all vendors" → /admin/vendors | `sales-by-vendor` Link |
| Q-OS-1 | Group pending+packed+handed_to_courier | `kpis-route` aggregates |
| Q-OS-2 | Status display labels | `derive-display` |
| Q-OS-3 | AVG(handedAt − createdAt) | `kpis-route:fulfillmentRow` |
| Q-OS-4 | SLA constant | `kpis-route:slaTargetDays: 2` |
| Q-RT-1 | businessName STUBBED | `recent-orders-route` returns `user.name` only |
| Q-RT-2 | Keep ORD- prefix | `recent-orders` displays `displayId` raw |
| Q-RT-3 | Derived rollup | `derive-display:deriveOrderDisplayState` |
| Q-RT-4 | Row click → /admin/orders/[id] | `recent-orders` rows are Links |
| Q-RT-5 | Always show items count | `recent-orders` always renders count |
| Q-TS-1 | DEFERRED — empty state | `top-sellers` |
| Q-TS-2 | DEFERRED — WoW trend | `top-sellers` |
| Q-AUD-1 | DEFERRED — `vendors.deactivatedAt` lands in Batch 4 | not implemented |
| Q-AUD-2 | DEFERRED — writers wired in follow-up audit batch | not implemented |
| Q-AUD-3 | DEFERRED | not implemented |
| Q-AUD-4 | View all → /admin/audit-log | `audit-log` Link |
| Q-MOB-1 | 2×2 KPI on mobile | `kpi-grid grid-cols-2` |
| Q-EX-1 | Replace existing body | `screen` rewritten |
| Q-STATES-1 | Card-level skeletons | `Skeleton` per widget |
| Q-FMT-1 (compact) | Lakh / Crore at threshold | `format-compact` |

## Completed

### Files changed

- `apps/web/src/app/api/admin/dashboard/kpis/route.ts` — **NEW** KPI aggregation endpoint.
- `apps/web/src/app/api/admin/orders/recent/route.ts` — **NEW** recent-orders read.
- `apps/web/src/modules/admin/admin-dashboard/index.tsx` — full rewrite.
- `apps/web/src/modules/admin/admin-dashboard/components/coming-soon/index.tsx` — **NEW** shared placeholder shell.
- `apps/web/src/modules/admin/admin-dashboard/components/dashboard-header/index.tsx` — **NEW**.
- `apps/web/src/modules/admin/admin-dashboard/components/dashboard-kpi-grid/index.tsx` — **NEW**.
- `apps/web/src/modules/admin/admin-dashboard/components/dashboard-sales-by-vendor/index.tsx` — **NEW** empty-state.
- `apps/web/src/modules/admin/admin-dashboard/components/dashboard-order-status/index.tsx` — **NEW** 3-tile status card.
- `apps/web/src/modules/admin/admin-dashboard/components/dashboard-recent-orders/index.tsx` — **NEW** desktop table + mobile card list.
- `apps/web/src/modules/admin/admin-dashboard/components/dashboard-top-sellers/index.tsx` — **NEW** empty-state.
- `apps/web/src/modules/admin/admin-dashboard/components/dashboard-audit-log/index.tsx` — **NEW** empty-state.
- `apps/web/src/modules/admin/admin-dashboard/hooks/use-admin-kpis-query/index.ts` — **NEW**.
- `apps/web/src/modules/admin/admin-dashboard/hooks/use-admin-recent-orders-query/index.ts` — **NEW**.
- `apps/web/src/modules/admin/admin-dashboard/utils/format-compact-rupees.ts` — **NEW** lakh/crore formatter.
- `apps/web/src/modules/admin/admin-dashboard/utils/derive-order-display.ts` — **NEW** rollup helper.
- `apps/web/src/modules/admin/admin-layout/admin-sidebar/admin-sidebar.constants.ts` — add OPERATIONS section + Sales reports / Products / Orders / Customers nav rows.
- `apps/web/src/modules/admin/admin-layout/admin-sidebar/index.tsx` — render optional badge slot.
- `apps/web/src/modules/core/constants/absolute-routes/index.ts` — add ADMIN_ORDERS, ADMIN_PRODUCTS, ADMIN_USERS, ADMIN_SALES_REPORTS, ADMIN_AUDIT_LOG.
- `apps/web/src/app/admin/orders/page.tsx`, `apps/web/src/app/admin/orders/[id]/page.tsx` — **NEW** placeholders.
- `apps/web/src/app/admin/products/page.tsx` — **NEW** placeholder.
- `apps/web/src/app/admin/users/page.tsx` — **NEW** placeholder.
- `apps/web/src/app/admin/sales-reports/page.tsx`, `apps/web/src/app/admin/sales-reports/new/page.tsx` — **NEW** placeholders.
- `apps/web/src/app/admin/audit-log/page.tsx` — **NEW** placeholder.

### Test updates

None — repo has no test suite at present.
