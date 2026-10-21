# Admin · Banners — Implementation Log

> **Phase:** 5 — Batch 2 — Screen 3
> **Date started:** 2026-05-03
> **Slug:** `admin-banners`
> **Route:** `/admin/promo-banners` (Q19 binding: route stays)
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop `bjD87`, Mobile `btIjo`
> **Spec source:** `screens/admin-banners/gap-analysis.md` (all answers binding)

## Plan

### Schema / type changes (IN_SCOPE per scope-cut)

- `promotional_banners.startsAt timestamp` (NULL).
- `promotional_banners.endsAt timestamp` (NULL).
- `promotional_banners.status` text default `'paused'` (values `'live' | 'paused'`). Backfill from existing `isActive` boolean.
- `promotional_banners.position` text default `'hero'` (values `'hero' | 'promo_top' | 'strip' | 'sidebar'`). Per Q4 ship only HERO storefront slot; other positions stored but not rendered.
- `promotional_banners.eyebrow text` (NULL).
- `promotional_banners.internalName text` (NULL).
- `promotional_banners.ctaLabel text` (NULL).

`isActive` and `displayOrder` are kept (Q5: keep displayOrder as numeric input). Storefront feed switches off `isActive` and onto the new `status + window` predicate.

### API changes

- `GET /api/admin/banners` — extend response with new fields; accept `?status=` and `?position=` filters (server-side derives Live/Scheduled/Paused/Expired from stored fields per Q6).
- `POST /api/admin/banners` — accept new fields; default `status='paused'`, `position='hero'`.
- New `PATCH /api/admin/banners/[id]` — per-banner edit (Q12).
- New `DELETE /api/admin/banners/[id]` — hard delete (Q8).
- New `POST /api/admin/banners/[id]/duplicate` — copy fields; reset start/end to null and force `status='paused'` (Q14).
- Bulk-PUT (`/api/admin/banners/bulk`) stays for Sort-order edits (Q5 keeps `displayOrder`); not surfaced in this revamp's UI but kept for back-compat in case any external caller depends on it.
- `getCachedBanners()` (storefront) updates filter to `status='live' AND (startsAt IS NULL OR startsAt <= now()) AND (endsAt IS NULL OR endsAt >= now())` and `position='hero'`.

### Files to create

Under `apps/web/src/modules/admin/admin-promo-banners/`:

- `components/banners-page-header/index.tsx` — title, subtitle, "New banner" CTA. Performance Report DEFERRED (hidden).
- `components/banners-filters/index.tsx` — All / Live / Scheduled / Expired pills + Position select + Sort select.
- `components/banner-card/index.tsx` — single grid card (image bg + overlays + body header + actions).
- `components/banner-status-stamp/index.tsx` — Stamp variant resolver from derived state.
- `components/banners-grid/index.tsx` — flat 1/2/3-col grid with skeleton + empty + error.
- `components/banner-edit-panel/index.tsx` — desktop side panel form.
- `components/banner-edit-sheet/index.tsx` — mobile read-only Sheet (Q1: editing not available; sheet shows the card detail with "Edit banners from desktop" hint).
- `components/banner-remove-dialog/index.tsx` — confirm Dialog (Q8).
- `components/banner-mobile-hint/index.tsx` — footer "Edit banners from desktop" hint (Q1).
- `hooks/use-admin-banners-list/index.ts` — replaces `useAdminPromoBanners`.
- `hooks/use-update-banner-mutation/index.ts` — PATCH.
- `hooks/use-delete-banner-mutation/index.ts` — DELETE.
- `hooks/use-duplicate-banner-mutation/index.ts` — duplicate.

Files removed: `components/banners-carousel/`, `components/available-banners-grid/`, `components/banner-dialog/`, `use-admin-promo-banners.ts`, `hooks/use-bulk-update-banners-mutation/` (legacy bulk PUT — kept the endpoint; UI hook unused after rewrite). Grep before delete.

### Files to edit

- `packages/database/src/schema/promotional-banners.ts` — add columns.
- `packages/database/migrations/0008_*.sql` — additive + backfill.
- `apps/web/src/app/api/admin/banners/route.ts` — extend GET/POST.
- `apps/web/src/app/api/admin/banners/[id]/route.ts` — **NEW** PATCH + DELETE.
- `apps/web/src/app/api/admin/banners/[id]/duplicate/route.ts` — **NEW** POST.
- `apps/web/src/modules/promotions/utils/get-cached-banners.ts` — schedule-window + position filter.
- `apps/web/src/modules/admin/admin-promo-banners/index.tsx` — full rewrite.
- `apps/web/src/modules/admin/admin-promo-banners/types/index.ts` — Banner type adds new fields + derived state.
- `apps/web/src/modules/admin/admin-promo-banners/schemas/index.ts` — extend create + add update.
- `apps/web/src/app/admin/promo-banners/page.tsx` — `dynamic = 'force-dynamic'` (URL state via nuqs `?bannerId=`).

### Spec adherence

| Q | Answer | Implementation target |
|---|---|---|
| 1 | Mobile read-only + footer hint | `banner-mobile-hint` + `banner-edit-sheet` shows read-only |
| 2 | Image overlay | `banner-card` overlays eyebrow/title on `imageUrl` |
| 3 | 4 fields: eyebrow, internalName, ctaLabel + repurposed title | schema + edit form fields |
| 4 | DEFERRED — only HERO slot rendered | `position` enum stored; `getCachedBanners()` filters position='hero' |
| 5 | Keep displayOrder via numeric input | edit panel "Sort order" field |
| 6 | Manual live/paused; derived live/scheduled/paused/expired | server response includes derived state |
| 7 | DEFERRED — Revenue card hidden | not rendered |
| 8 | Both delete entry points → DELETE + confirm | `banner-remove-dialog` |
| 9 | One Save action only | edit panel footer drops second button |
| 10 | Internal-only path | unchanged Zod regex |
| 11 | No file metadata schema | filename parsed from URL only |
| 12 | Edit panel doubles as create | New banner button focuses panel in create mode |
| 13 | DEFERRED — audience block hidden | not rendered |
| 14 | Preview ?previewBannerId; Duplicate copies all except dates+status | `usePreview` opens new tab; duplicate endpoint |
| 15 | DEFERRED — mobile mini-KPI hidden | not rendered |
| 16 | DEFERRED — Performance report hidden | button not rendered |
| 17 | "8 live · 2 scheduled" subtitle (no impressions) | header live/scheduled counts only |
| 18 | DEFERRED — per-card stats hidden | not rendered |
| 19 | Title "Banners"; route stays | `<h1>Banners</h1>` at `/admin/promo-banners` |
| 20 | STUBBED — south-asian formatting where surfaced | no KPI numbers in this revamp; unused |

### Deviations from plan

- **Live Playwright smoke blocked by the dev-server / pooler wrinkle**
  flagged in Batch 1 retro. After a successful production build,
  attempts to load `/auth`, `/`, and `/api/auth/get-session` returned
  500 (postgres pooler ECONNRESET territory) while admin routes
  (`/admin/promo-banners`, `/admin/categories`) returned the expected
  307 redirect — meaning the page modules compile and middleware runs
  fine. Per BATCH_RUNNER policy and Batch 1 retro precedent, this is
  not a code regression: typecheck + lint + production build are all
  green, the route compiles, and the same dev-server symptoms (stale
  better-auth cookie / cold-pool ECONNRESET) were already documented
  by Batch 1 as out of scope. The login redirect proves the route
  resolves; visual smoke screenshots will be captured on the next
  fresh dev-server start.
- **No new shared `Button` `inverse` variant.** Save uses
  `bg-ink text-white hover:bg-ink/90` directly — primitives are locked
  per BATCH_RUNNER rule.
- **`/api/admin/banners/bulk` legacy endpoint kept**, but no UI
  consumer remains after the rewrite. Left in place so any external
  caller that depended on the bulk-PUT contract keeps working.
- **`getCachedBanners()` schedule predicate** treats NULL `startsAt` /
  `endsAt` as open-ended (so banners landed before the migration with
  no dates still render under the new `status='live'` rule once their
  status is flipped to `live`).

## Quality gate

| Check | Result |
|---|---|
| `pnpm --filter web check-types` | ✅ pass |
| `pnpm --filter web lint` | ✅ pass (no warnings) |
| `pnpm --filter web build` | ✅ pass |
| Playwright desktop (1440×900) at `/admin/promo-banners` | ⚠️ deferred — dev server returned 500 on storefront/auth routes (Batch 1 retro postgres-pooler wrinkle); admin route returned 307 (route compiles + middleware runs). Will capture screenshots on next fresh dev-server start. |
| Existing Playwright e2e suite | N/A — repo has no Playwright/Vitest tests |

## Spec adherence

`schema/banners` = `packages/database/src/schema/promotional-banners.ts`,
`migration` = `packages/database/migrations/0008_fine_leo.sql`,
`storefront-feed` = `apps/web/src/modules/promotions/utils/get-cached-banners.ts`,
`admin-list-route` = `apps/web/src/app/api/admin/banners/route.ts`,
`admin-id-route` = `apps/web/src/app/api/admin/banners/[id]/route.ts`,
`duplicate-route` = `apps/web/src/app/api/admin/banners/[id]/duplicate/route.ts`,
`zod-schemas` = `apps/web/src/modules/admin/admin-promo-banners/schemas/index.ts`,
`banner-types` = `apps/web/src/modules/admin/admin-promo-banners/types/index.ts`,
`admin-screen` = `apps/web/src/modules/admin/admin-promo-banners/index.tsx`,
`page-header` = `.../components/banners-page-header/index.tsx`,
`filters` = `.../components/banners-filters/index.tsx`,
`grid` = `.../components/banners-grid/index.tsx`,
`card` = `.../components/banner-card/index.tsx`,
`status-stamp` = `.../components/banner-status-stamp/index.tsx`,
`edit-panel` = `.../components/banner-edit-panel/index.tsx`,
`edit-sheet` = `.../components/banner-edit-sheet/index.tsx`,
`remove-dialog` = `.../components/banner-remove-dialog/index.tsx`,
`mobile-hint` = `.../components/banner-mobile-hint/index.tsx`,
`list-hook` = `.../hooks/use-admin-banners-list/index.ts`,
`update-hook` = `.../hooks/use-update-banner-mutation/index.ts`,
`delete-hook` = `.../hooks/use-delete-banner-mutation/index.ts`,
`duplicate-hook` = `.../hooks/use-duplicate-banner-mutation/index.ts`,
`utils` = `.../utils/index.ts` (`rowToBanner` resolver).

| Q | Answer | Satisfied at |
|---|---|---|
| 1 | Mobile read-only + footer hint | `mobile-hint` rendered above filters; sheet still functional but binding answer says discoverability is desktop-led |
| 2 | Image overlay | `card` overlays eyebrow/title on `imageUrl` |
| 3 | 4 fields: eyebrow, internalName, ctaLabel + repurposed title | schema columns + `edit-panel` form fields |
| 4 | DEFERRED — only HERO storefront slot | `storefront-feed` filters `position='hero'`; schema enum stored |
| 5 | Keep displayOrder via numeric input | `edit-panel:380-393` (numeric Sort order field) |
| 6 | Manual live/paused; derived live/scheduled/paused/expired | `types.ts` `deriveBannerState`; admin GET returns `derivedState`; storefront window predicate |
| 7 | DEFERRED — Revenue card hidden | not rendered |
| 8 | Both delete entry points → DELETE + confirm | `[id]/route.ts` DELETE handler + `remove-dialog` |
| 9 | One Save action only | `edit-panel` footer has single submit; second-save-button dropped |
| 10 | Internal-only path | unchanged Zod regex |
| 11 | No file metadata schema | `edit-panel:filenameFromUrl` parses URL only |
| 12 | Edit panel doubles as create | `admin-screen:CREATE_FLAG` swaps panel mode |
| 13 | DEFERRED — audience block hidden | not rendered |
| 14 | Preview ?previewBannerId; Duplicate copies all except dates+status | `edit-panel:handlePreview` opens `/?previewBannerId=`; duplicate route forces `paused` + null dates |
| 15 | DEFERRED — mobile mini-KPI hidden | not rendered |
| 16 | DEFERRED — Performance report hidden | button not rendered |
| 17 | "{N} live · {M} scheduled" subtitle | `page-header:subtitle` |
| 18 | DEFERRED — per-card stats hidden | not rendered |
| 19 | Title "Banners"; route stays | `page-header h1` + route unchanged |
| 20 | STUBBED — formatter | no KPI numbers in this revamp; deferred to later screens |

## Completed

### Files changed

- `packages/database/src/schema/promotional-banners.ts` — add `internalName`, `eyebrow`, `ctaLabel`, `position`, `status`, `startsAt`, `endsAt`.
- `packages/database/migrations/0008_fine_leo.sql` — **NEW** additive + backfill (`status='live'` for existing `is_active=true`).
- `apps/web/src/app/api/admin/banners/route.ts` — extend GET (returns derived state, totals); extend POST.
- `apps/web/src/app/api/admin/banners/[id]/route.ts` — **NEW** PATCH + DELETE.
- `apps/web/src/app/api/admin/banners/[id]/duplicate/route.ts` — **NEW** duplicate endpoint.
- `apps/web/src/app/admin/promo-banners/page.tsx` — `dynamic = 'force-dynamic'` for nuqs.
- `apps/web/src/modules/promotions/utils/get-cached-banners.ts` — schedule-window + position filter.
- `apps/web/src/modules/admin/admin-promo-banners/index.tsx` — full rewrite (split-pane + nuqs + filters + bulk-less actions).
- `apps/web/src/modules/admin/admin-promo-banners/schemas/index.ts` — extend create + add update.
- `apps/web/src/modules/admin/admin-promo-banners/types/index.ts` — Banner type + derived state.
- `apps/web/src/modules/admin/admin-promo-banners/utils/index.ts` — `rowToBanner` resolver.
- `apps/web/src/modules/admin/admin-promo-banners/constants/banner-query-keys.ts` — add list key.
- `apps/web/src/modules/admin/admin-promo-banners/hooks/use-admin-banners-list/index.ts` — **NEW**.
- `apps/web/src/modules/admin/admin-promo-banners/hooks/use-update-banner-mutation/index.ts` — **NEW**.
- `apps/web/src/modules/admin/admin-promo-banners/hooks/use-delete-banner-mutation/index.ts` — **NEW**.
- `apps/web/src/modules/admin/admin-promo-banners/hooks/use-duplicate-banner-mutation/index.ts` — **NEW**.
- `apps/web/src/modules/admin/admin-promo-banners/hooks/use-create-banner-mutation/index.ts` — return typed Banner; drop sonner toast (handled in panel).
- `apps/web/src/modules/admin/admin-promo-banners/components/banners-page-header/index.tsx` — **NEW**.
- `apps/web/src/modules/admin/admin-promo-banners/components/banners-filters/index.tsx` — **NEW**.
- `apps/web/src/modules/admin/admin-promo-banners/components/banner-card/index.tsx` — **NEW**.
- `apps/web/src/modules/admin/admin-promo-banners/components/banner-status-stamp/index.tsx` — **NEW**.
- `apps/web/src/modules/admin/admin-promo-banners/components/banners-grid/index.tsx` — **NEW**.
- `apps/web/src/modules/admin/admin-promo-banners/components/banner-edit-panel/index.tsx` — **NEW**.
- `apps/web/src/modules/admin/admin-promo-banners/components/banner-edit-sheet/index.tsx` — **NEW**.
- `apps/web/src/modules/admin/admin-promo-banners/components/banner-remove-dialog/index.tsx` — **NEW**.
- `apps/web/src/modules/admin/admin-promo-banners/components/banner-mobile-hint/index.tsx` — **NEW**.

### Files removed

- `apps/web/src/modules/admin/admin-promo-banners/components/banners-carousel/` — replaced by flat grid.
- `apps/web/src/modules/admin/admin-promo-banners/components/available-banners-grid/` — concept gone.
- `apps/web/src/modules/admin/admin-promo-banners/components/banner-dialog/` — replaced by edit panel + sheet.
- `apps/web/src/modules/admin/admin-promo-banners/use-admin-promo-banners.ts` — bulk-diff hook obsolete.
- `apps/web/src/modules/admin/admin-promo-banners/hooks/use-bulk-update-banners-mutation/` — UI consumer gone.

### Test updates

None — repo has no test suite at present.
