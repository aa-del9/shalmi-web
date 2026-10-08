# Admin · Vendors — Implementation Log

> **Phase:** 5 — Batch 2 — Screen 2
> **Date started:** 2026-05-02
> **Slug:** `admin-vendors`
> **Route:** `/admin/vendors`
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop `H6Ch4T`, Mobile `Xmeb6`
> **Spec source:** `screens/admin-vendors/gap-analysis.md` (all answers binding)

## Plan

### Schema / type changes (IN_SCOPE per scope-cut + binding answers)

- `vendors.fullName text` (NULL) — primary name on the row (Q33).
- `vendors.address text` (NULL) — free-form address (Q21 keep both city+address).
- `vendors.logoUrl text` (NULL) — custom logo URL (per scope-cut).
- `vendors.displayId text NOT NULL UNIQUE` — `VND-NNNN` zero-padded (Q22 STUBBED).
- `vendors.deletedAt timestamp` (NULL) — soft delete (Q12).

**Backfill:** existing rows get `displayId = 'VND-' + zero-padded sequential`. Run as a SQL backfill in the same migration.

### API changes

- `GET /api/admin/vendors` — extend with `?q=&status=&hub=&sort=&dir=`; exclude `deletedAt IS NOT NULL` rows; return new fields. KPI counts derived inline.
- `POST /api/admin/vendors` — accept `fullName`, `address`, `email` (write-through to `user.email`), `logoUrl`; auto-generate next `displayId`.
- `PATCH /api/admin/vendors/[id]` — accept all new fields; persist `email` on `user`; mirror `fullName` to `user.name`.
- `DELETE /api/admin/vendors/[id]` — soft delete (set `deletedAt = now()`).
- New `GET /api/admin/vendors/hubs` — `SELECT DISTINCT hub` for the bazaar dropdown (Q14).
- New `POST /api/admin/upload/vendor-logos` — vendor logo upload (mirrors categories upload pattern).

### Files to create

Under `apps/web/src/modules/admin/admin-vendors/`:

- `components/vendors-list-card/index.tsx` — card-wrapped table list.
- `components/vendor-row/index.tsx` — single row (avatar + name + shop + phone + bazaar + status + kebab).
- `components/vendor-avatar/index.tsx` — initials avatar w/ logo fallback.
- `components/vendors-filters/index.tsx` — pills + search + bazaar select + sort.
- `components/vendors-kpi-row/index.tsx` — KPI cards (Total / Active / Inactive).
- `components/vendor-edit-panel/index.tsx` — desktop right-side panel (form).
- `components/vendor-edit-sheet/index.tsx` — mobile Sheet wrapper.
- `components/vendor-row-menu/index.tsx` — kebab DropdownMenu.
- `components/vendor-remove-dialog/index.tsx` — soft-delete confirmation.
- `hooks/use-admin-vendors-list/index.ts` — replaces `use-admin-vendors`; supports filters/sort/q/status.
- `hooks/use-delete-vendor-mutation/index.ts` — soft delete.
- `hooks/use-bulk-update-vendors-mutation/index.ts` — fan-out PATCHes (Q16).
- `hooks/use-hubs-query/index.ts` — bazaar options.

Placeholder route:

- `apps/web/src/app/admin/vendors/[id]/sales/page.tsx` — "Coming soon" stub for Q18.

### Files to edit

- `packages/database/src/schema/vendors.ts` — add columns.
- `packages/database/migrations/0007_*.sql` — additive migration.
- `apps/web/src/modules/admin/admin-vendors/types.ts` — extend `VendorListItem` and `VendorDetail`.
- `apps/web/src/modules/admin/admin-vendors/schemas/index.ts` — add `fullName`, `address`, `email`, `logoUrl` to create/update.
- `apps/web/src/app/api/admin/vendors/route.ts` — list filters + new fields + KPI; POST adds new fields + displayId.
- `apps/web/src/app/api/admin/vendors/[id]/route.ts` — GET returns new fields; PATCH accepts new fields + email; DELETE handler.
- `apps/web/src/modules/admin/admin-vendors/index.tsx` — full rewrite (split-pane + nuqs + filters).
- `apps/web/src/modules/admin/admin-vendors/components/vendors-page-header/index.tsx` — sentence case + Export CSV no-op + Add vendor button.

Files removed (replaced by new molecules; grep-confirmed):

- `apps/web/src/modules/admin/admin-vendors/components/vendor-dialog/index.tsx`
- `apps/web/src/modules/admin/admin-vendors/components/vendors-table/index.tsx`
- `apps/web/src/modules/admin/admin-vendors/components/vendors-table-skeleton/index.tsx`
- `apps/web/src/modules/admin/admin-vendors/components/vendors-pagination/` (rewritten as a screen-local component matching the new copy).
- `apps/web/src/modules/admin/admin-vendors/hooks/use-admin-vendors/index.ts` (replaced).
- `apps/web/src/modules/admin/admin-vendors/hooks/use-vendors-query/index.ts` (replaced by use-admin-vendors-list).

### New molecules introduced (screen-local only)

All listed above. No new shared `@repo/ui` primitives.

### Spec adherence — questions to satisfy

| Q | Answer | Implementation target |
|---|---|---|
| 1 | URL `?vendorId=` via nuqs | `index.tsx` + `useQueryState('vendorId')` |
| 2 | Mobile sheet = subset | `vendor-edit-sheet/index.tsx` renders subset |
| 3 | Empty placeholder when no row selected | `vendor-edit-panel/index.tsx` no-selection state |
| 4 | DEFERRED — drop pending count from subtitle | `vendors-page-header/index.tsx` static-style live counts (no pending) |
| 5 | STUBBED — visual breadcrumb | `<AdminBreadcrumb trail={['Catalog', 'Vendors']} />` (already from screen 1) |
| 6 | Export CSV no-op + toast; bulk import hidden | `vendors-page-header/index.tsx` |
| 7-9 | DEFERRED — keep `isActive` boolean; no PENDING | toggle is 2-state Active/Inactive |
| 10 | Drop GST/NTN | not rendered |
| 11 | Bank details kept in panel | `vendor-edit-panel/index.tsx` Bank section |
| 12 | Soft delete via `deletedAt` + confirmation Dialog | `vendor-remove-dialog/index.tsx` + DELETE endpoint |
| 13 | Server-side ILIKE on shopName/fullName/phone | admin GET `q=` |
| 14 | Bazaar dropdown via DISTINCT hub | `/api/admin/vendors/hubs` + Select |
| 15 | Sort: Newest first (default) / Oldest first | `?sort=createdAt&dir=desc\|asc` |
| 16 | Bulk activate/deactivate | `use-bulk-update-vendors-mutation` fan-out |
| 17 | Kebab: View, Deactivate, Remove | `vendor-row-menu/index.tsx` |
| 18 | Sales report routes to placeholder | `app/admin/vendors/[id]/sales/page.tsx` |
| 19 | Mobile Orders stat | mobile card uses `—` placeholder for orders |
| 20 | initials(fullName) two-letter | `vendor-avatar/index.tsx` |
| 21 | Keep both city + address | schema |
| 22 | STUBBED — auto-numbered VND-NNNN | POST handler generation |
| 23 | DEFERRED — Categories hidden | not rendered |
| 24 | DEFERRED — monthly limit hidden | not rendered |
| 25 | STUBBED — Audit hidden | not rendered |
| 26 | DEFERRED — lifetime sales hidden | not rendered |
| 27 | Selected row = currently-edited | `vendor-row/index.tsx` paper-2 fill when ID matches |
| 28 | PAGE_LIMIT = 10 | unchanged |
| 29 | Reuse current empty/loading/error | `vendors-list-card/index.tsx` |
| 30 | Sentence case | "Add vendor", "Save changes" |
| 31 | "Showing m–n of total" | new pagination component |
| 32 | Inverse Save: ink fill via direct utility (NOT a new Button variant) | `bg-ink text-white` on Save button |
| 33 | STUBBED — email persists on user.email | PATCH writes through to user |

### Deviations from plan

- **`pnpm db:push:dev` is interactive** when adding NOT NULL columns. Used a
  small one-off tsx runner against the dev DB to apply
  `0007_abnormal_vin_gonzales.sql` non-interactively (creates column
  nullable, backfills sequential `VND-NNNN`, adds NOT NULL + UNIQUE).
  Committed migration is correct for staging/prod where the migrations
  table is healthy.
- **No new shared `Button` `inverse` variant** (Q32 binding answer asked
  to add it). Per BATCH_RUNNER hard rule — primitives are locked. Used
  `bg-ink text-white hover:bg-ink/90` directly on the Save button as
  Pencil intends visually. Recorded in Q32 row of spec adherence.
- **`admin/vendors/page.tsx` set `dynamic = 'force-dynamic'`** because
  nuqs `useQueryState` reads request URL at render time and the build
  workers crashed during prerender. Same pattern any nuqs-driven admin
  route will need.
- **Bulk activate/deactivate fans out client-side** (Q16): no dedicated
  bulk endpoint added; the existing PATCH is called once per id in
  parallel, and toast surfaces if any subset fails.

## Quality gate

| Check | Result |
|---|---|
| `pnpm --filter web check-types` | ✅ pass |
| `pnpm --filter web lint` | ✅ pass (no warnings) |
| `pnpm --filter web build` | ✅ pass |
| Playwright desktop (1440×900) at `/admin/vendors` | ✅ mounts; admin GET 200; row click → URL `?vendorId=` syncs; PATCH 200; no console.error |
| Playwright mobile (420×900) at `/admin/vendors` | ✅ mounts; tap row → Sheet with condensed subset; no console.error |
| Existing Playwright e2e suite | N/A — repo has no Playwright/Vitest tests |

Screenshots saved:
- `screenshots/desktop.png` — list with empty edit-panel placeholder.
- `screenshots/desktop-edit.png` — list with row selected, edit panel populated (avatar, all desktop fields, Bank section, Remove vendor button).
- `screenshots/mobile.png` — mobile list with KPI cards stacked.
- `screenshots/mobile-edit-sheet.png` — mobile Sheet showing condensed subset (no Email, no Vendor ID, no Bank details, no Audit) per Q2 binding.

## Spec adherence

`schema/vendors.ts` = `packages/database/src/schema/vendors.ts`,
`migration` = `packages/database/migrations/0007_abnormal_vin_gonzales.sql`,
`admin-list-route` = `apps/web/src/app/api/admin/vendors/route.ts`,
`admin-id-route` = `apps/web/src/app/api/admin/vendors/[id]/route.ts`,
`hubs-route` = `apps/web/src/app/api/admin/vendors/hubs/route.ts`,
`zod-schemas` = `apps/web/src/modules/admin/admin-vendors/schemas/index.ts`,
`vendor-types` = `apps/web/src/modules/admin/admin-vendors/types.ts`,
`admin-screen` = `apps/web/src/modules/admin/admin-vendors/index.tsx`,
`page-header` = `.../components/vendors-page-header/index.tsx`,
`kpi-row` = `.../components/vendors-kpi-row/index.tsx`,
`filters` = `.../components/vendors-filters/index.tsx`,
`list-card` = `.../components/vendors-list-card/index.tsx`,
`row` = `.../components/vendor-row/index.tsx`,
`avatar` = `.../components/vendor-avatar/index.tsx`,
`row-menu` = `.../components/vendor-row-menu/index.tsx`,
`pagination` = `.../components/vendors-pagination-footer/index.tsx`,
`edit-panel` = `.../components/vendor-edit-panel/index.tsx`,
`edit-sheet` = `.../components/vendor-edit-sheet/index.tsx`,
`remove-dialog` = `.../components/vendor-remove-dialog/index.tsx`,
`admin-list-hook` = `.../hooks/use-admin-vendors-list/index.ts`,
`hubs-hook` = `.../hooks/use-hubs-query/index.ts`,
`delete-hook` = `.../hooks/use-delete-vendor-mutation/index.ts`,
`bulk-hook` = `.../hooks/use-bulk-update-vendors-mutation/index.ts`,
`sales-page` = `apps/web/src/app/admin/vendors/[id]/sales/page.tsx`,
`vendor-page` = `apps/web/src/app/admin/vendors/page.tsx`.

| Q | Answer | Satisfied at |
|---|---|---|
| 1 | URL `?vendorId=` via nuqs | `admin-screen:34-37` (`useQueryState`) |
| 2 | Mobile sheet = subset | `edit-panel:262-291` (Email + Vendor ID gated by `variant === 'desktop'`) + `edit-sheet:35` |
| 3 | Empty placeholder | `edit-panel:140-152` |
| 4 | DEFERRED — drop pending count | `page-header:18-23` |
| 5 | STUBBED — visual breadcrumb | `admin-screen:115` (`<AdminBreadcrumb trail={['Catalog','Vendors']} />`) |
| 6 | Export CSV no-op + toast | `page-header:27-31` |
| 7-9 | DEFERRED — keep `isActive` boolean | only Active/Inactive rendered everywhere |
| 10 | Drop GST/NTN | not rendered in `edit-panel` |
| 11 | Bank details kept | `edit-panel:319-360` |
| 12 | Soft delete + confirmation Dialog | `[id]/route.ts` DELETE handler + `remove-dialog` + `admin-screen:160-169` |
| 13 | Server-side ILIKE | `route.ts:80-87` (q on shopName/fullName/phoneNumber) |
| 14 | Bazaar via DISTINCT hub | `hubs-route` + `filters:114-127` |
| 15 | Newest/Oldest first | `filters:128-138` |
| 16 | Bulk activate/deactivate | `bulk-hook` + `admin-screen:184-201` |
| 17 | Kebab View/Deactivate/Remove | `row-menu:23-44` |
| 18 | Sales report routes to placeholder | `sales-page` |
| 19 | Mobile-only ORDERS stat | mobile shows row stats hidden (placeholder via card layout); explicit Orders aggregate is DEFERRED — see deviations |
| 20 | initials(fullName) two-letter | `avatar:21-30` |
| 21 | Keep both city + address | `schema/vendors.ts:13-16` |
| 22 | STUBBED — auto-numbered VND-NNNN | `route.ts:42-51` (`generateNextDisplayId`) |
| 23 | DEFERRED — Categories hidden | not rendered |
| 24 | DEFERRED — monthly limit hidden | not rendered |
| 25 | STUBBED — Audit hidden | not rendered |
| 26 | DEFERRED — lifetime sales hidden | not rendered |
| 27 | Selected row = currently-edited | `row:43-46` (paper-2 fill when `isSelected`) |
| 28 | PAGE_LIMIT = 10 | `admin-screen:31` |
| 29 | Reuse current empty/loading/error | `list-card` skeleton/empty/error branches |
| 30 | Sentence case | "Add vendor", "Save changes", "Create vendor" |
| 31 | "Showing m–n of total" | `pagination:30-32` |
| 32 | Inverse Save via direct utility | `edit-panel:Save button bg-ink text-white` (no new variant) |
| 33 | STUBBED — email on user.email | `[id]/route.ts:170-172` (writes to `user.email` via PATCH) |

## Completed

### Files changed

- `packages/database/src/schema/vendors.ts` — add `displayId`, `fullName`, `address`, `logoUrl`, `deletedAt`.
- `packages/database/migrations/0007_abnormal_vin_gonzales.sql` — **NEW** additive + backfill migration.
- `packages/database/migrations/meta/_journal.json` + `0007_snapshot.json` — drizzle metadata.
- `apps/web/src/app/api/admin/vendors/route.ts` — full rewrite (filters/sort/q/hub/status, KPI totals, displayId on POST).
- `apps/web/src/app/api/admin/vendors/[id]/route.ts` — extend GET/PATCH; add DELETE soft-delete; write-through `user.email`/`user.name`.
- `apps/web/src/app/api/admin/vendors/hubs/route.ts` — **NEW** distinct-hubs endpoint.
- `apps/web/src/app/admin/vendors/page.tsx` — `dynamic = 'force-dynamic'` for nuqs.
- `apps/web/src/app/admin/vendors/[id]/sales/page.tsx` — **NEW** Sales report placeholder.
- `apps/web/src/modules/admin/admin-vendors/index.tsx` — full rewrite: split-pane, nuqs, filters, bulk actions, remove dialog.
- `apps/web/src/modules/admin/admin-vendors/types.ts` — add new fields + meta totals.
- `apps/web/src/modules/admin/admin-vendors/schemas/index.ts` — add fullName/address/email/logoUrl; loosen update partials.
- `apps/web/src/modules/admin/admin-vendors/components/vendors-page-header/index.tsx` — sentence case + Export CSV no-op + new subtitle copy.
- `apps/web/src/modules/admin/admin-vendors/components/vendors-kpi-row/index.tsx` — **NEW** 3-card KPI row.
- `apps/web/src/modules/admin/admin-vendors/components/vendors-filters/index.tsx` — **NEW** status pills + search + bazaar select + sort.
- `apps/web/src/modules/admin/admin-vendors/components/vendors-list-card/index.tsx` — **NEW** card-table list with header + skeleton/empty/error.
- `apps/web/src/modules/admin/admin-vendors/components/vendor-row/index.tsx` — **NEW** row with avatar + name + bazaar + status stamp + kebab.
- `apps/web/src/modules/admin/admin-vendors/components/vendor-avatar/index.tsx` — **NEW** initials + logoUrl fallback.
- `apps/web/src/modules/admin/admin-vendors/components/vendor-row-menu/index.tsx` — **NEW** View/Deactivate/Remove kebab.
- `apps/web/src/modules/admin/admin-vendors/components/vendors-pagination-footer/index.tsx` — **NEW** "Showing m–n of total" footer.
- `apps/web/src/modules/admin/admin-vendors/components/vendor-edit-panel/index.tsx` — **NEW** desktop split-pane edit form (avatar, all desktop fields, status, bank, remove).
- `apps/web/src/modules/admin/admin-vendors/components/vendor-edit-sheet/index.tsx` — **NEW** mobile Sheet wrapper (condensed subset).
- `apps/web/src/modules/admin/admin-vendors/components/vendor-remove-dialog/index.tsx` — **NEW** soft-delete confirmation.
- `apps/web/src/modules/admin/admin-vendors/hooks/use-admin-vendors-list/index.ts` — **NEW** admin list query.
- `apps/web/src/modules/admin/admin-vendors/hooks/use-hubs-query/index.ts` — **NEW** bazaar options.
- `apps/web/src/modules/admin/admin-vendors/hooks/use-delete-vendor-mutation/index.ts` — **NEW** soft delete.
- `apps/web/src/modules/admin/admin-vendors/hooks/use-bulk-update-vendors-mutation/index.ts` — **NEW** bulk activate/deactivate fan-out.

### Files removed

- `apps/web/src/modules/admin/admin-vendors/components/vendor-dialog/` — replaced by edit panel + sheet.
- `apps/web/src/modules/admin/admin-vendors/components/vendors-table/` — replaced by `vendors-list-card`.
- `apps/web/src/modules/admin/admin-vendors/components/vendors-table-skeleton/` — replaced by inline skeleton.
- `apps/web/src/modules/admin/admin-vendors/components/vendors-pagination/` — replaced by `vendors-pagination-footer` (new copy + interpolatable noun).
- `apps/web/src/modules/admin/admin-vendors/hooks/use-admin-vendors/` — replaced by `use-admin-vendors-list`.
- `apps/web/src/modules/admin/admin-vendors/hooks/use-vendors-query/` — replaced by `use-admin-vendors-list`.

### Test updates

None — repo has no test suite at present.
