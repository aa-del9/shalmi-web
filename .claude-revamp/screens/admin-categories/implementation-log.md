# Admin · Categories — Implementation Log

> **Phase:** 5 — Batch 2 — Screen 1
> **Date started:** 2026-05-02
> **Slug:** `admin-categories`
> **Route:** `/admin/categories`
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop `A0BZZx`, Mobile `IVbBD`
> **Spec source:** `screens/admin-categories/gap-analysis.md` (all answers binding)

## Plan

### Schema / type changes (IN_SCOPE per gap-analysis)

- Add `categories.iconKey text` (NULL allowed) per Q5 STUBBED.
- Add `categories.isActive boolean NOT NULL DEFAULT true` per Q9 STUBBED.
  Storefront `GET /api/categories` adds `WHERE isActive = true`.
- New Drizzle migration `0006_admin_categories_icon_active.sql`.

### API / server-action changes

- Promote admin list to `GET /api/admin/categories` with
  `?page=&limit=&q=&sort=&dir=&status=` mirroring `/api/admin/vendors`.
- `POST /api/admin/categories` accepts `iconKey` + `isActive` (optional).
- `PATCH /api/admin/categories/[id]` accepts `iconKey` + `isActive`.
- `GET /api/categories` adds `WHERE isActive = true`.
- `useCategoriesQuery` (storefront) untouched.
- New `useAdminCategoriesQuery` for admin list with params.

### Files to create (screen-local molecules)

All under `apps/web/src/modules/admin/admin-categories/`:

- `components/categories-list-card/index.tsx` — card-wrapped table list.
- `components/category-row/index.tsx` — single row (icon swatch + name +
  slug-meta + status stamp + pencil action).
- `components/category-icon-swatch/index.tsx` — 40×40 green-bg /
  amber-bg pill rendering a Lucide icon.
- `components/categories-filters/index.tsx` — status tabs + search +
  sort dropdown (filters card).
- `components/categories-pagination/index.tsx` — Showing X–Y of Z +
  Previous / Next.
- `components/category-edit-panel/index.tsx` — desktop right-side
  panel and the inner form body.
- `components/category-edit-sheet/index.tsx` — mobile Sheet wrapper
  that re-renders the same panel body.
- `components/category-icon-picker/index.tsx` — curated lucide icon
  picker block (large preview + grid of choices).
- `constants/category-icons.ts` — curated lucide icon-name → Component
  map. The 10 glyphs visible in the Pencil row list are the seed set
  plus a few catalog-typical extras.
- `hooks/use-admin-categories-query/index.ts` — new admin query.

Shared chrome (foundation pass):

- `apps/web/src/modules/admin/admin-layout/admin-breadcrumb/index.tsx`
  — visual-only breadcrumb (per Q2 STUBBED).
- Edit `admin-sidebar.constants.ts` to use `{ section, items }[]` shape
  with OVERVIEW / CATALOG / OPERATIONS sections (per Q26 STUBBED).
- Edit `admin-sidebar/index.tsx` to render section eyebrows.

### Files to edit

- `packages/database/src/schema/categories.ts` — add columns.
- `packages/database/migrations/0006_admin_categories_icon_active.sql`
  — new migration.
- `packages/database/migrations/meta/_journal.json` + `0006_snapshot.json`.
- `apps/web/src/app/api/categories/route.ts` — `WHERE isActive = true`.
- `apps/web/src/app/api/admin/categories/route.ts` — add GET (admin
  list with params) + extend POST.
- `apps/web/src/app/api/admin/categories/[id]/route.ts` — extend
  PATCH for new fields.
- `apps/web/src/modules/admin/admin-categories/schemas/index.ts` —
  extend Zod schemas.
- `apps/web/src/modules/admin/admin-categories/index.tsx` — full
  rewrite to split-pane composition.
- `apps/web/src/modules/admin/admin-categories/components/categories-page-header/index.tsx`
  — sentence case "Add category" + Export CSV no-op outline button.
- `apps/web/src/modules/admin/admin-categories/components/categories-table/index.tsx`
  — replaced by `categories-list-card` (delete legacy file? keep but
  remove only call-site — see Stop conditions; deletion needs grep
  first).
- `apps/web/src/modules/admin/admin-categories/components/category-dialog/index.tsx`
  — replaced by panel; keep file as legacy (not imported anywhere
  after rewrite). Will delete only after grep confirms.
- `apps/web/src/modules/common/queries/categories/types.ts` — add
  `iconKey` and `isActive` to `CategoryListItem`.
- `apps/web/src/modules/admin/admin-layout/admin-sidebar/admin-sidebar.constants.ts`
  — sectioned shape.
- `apps/web/src/modules/admin/admin-layout/admin-sidebar/index.tsx`
  — render section eyebrows.
- `apps/web/src/modules/admin/admin-layout/index.tsx` — slot in
  breadcrumb component above main content.

### New molecules introduced (screen-local only)

All under `modules/admin/admin-categories/components/` (above). No new
shared `@repo/ui` primitives.

The breadcrumb lives under `modules/admin/admin-layout/` because it
applies to all admin screens (Q26 STUBBED) and is consumed via a
context-derived label. It's not a `@repo/ui` primitive.

### Navigation entry points

REVAMP, not new. Sidebar `Categories` item still routes to
`/admin/categories`; sectioning the sidebar groups it under CATALOG.

### Spec adherence — questions to satisfy

| Q | Answer | Implementation target |
|---|---|---|
| 1 | DEFERRED — drop live counts; static copy | `categories-page-header/index.tsx` keeps descriptive copy |
| 2 | STUBBED — visual-only breadcrumb | `admin-layout/admin-breadcrumb/index.tsx` |
| 3 | Full-row click opens panel | `category-row/index.tsx` row onClick |
| 4 | Same panel in empty/create mode | `category-edit-panel/index.tsx` (selectedId === null → create mode) |
| 5 | STUBBED — iconKey + imageUrl kept | schema + `category-icon-swatch` + `category-icon-picker` |
| 6 | DEFERRED — description hidden | not rendered in panel |
| 7 | DEFERRED — parent hidden | not rendered in panel |
| 8 | DEFERRED — sort hidden | column + field hidden |
| 9 | STUBBED — isActive added; storefront filtered | schema + `/api/categories` filter + status toggle |
| 10 | DEFERRED — audit hidden | not rendered |
| 11 | DEFERRED — products/vendors columns hidden | not rendered |
| 12 | New `GET /api/admin/categories` with params | `/api/admin/categories/route.ts` GET handler |
| 13 | DEFERRED — trash + Remove hidden | actions cell shows pencil only |
| 14a | DEFERRED — Reorder hidden | header CTA hidden |
| 14b | Mobile uses Sheet | `category-edit-sheet/index.tsx` |
| 15 | DEFERRED — Export CSV no-op + toast | `categories-page-header/index.tsx` toast on click |
| 16 | DEFERRED — KPI row hidden | not rendered |
| 17 | DEFERRED — bulk select hidden | no checkboxes |
| 18 | Sentence case button labels | "Add category", "Save changes", "Export CSV" |
| 19 | DEFERRED — slug read-only | input `readOnly` + URL preview |
| 20 | DEFERRED — trash + ellipsis hidden | not rendered |
| 21 | Intentional — image swatch + created in panel (but audit hidden) | row has no Created column; panel has no audit (Q10) |
| 22 | STUBBED — storefront `WHERE isActive = true` | `/api/categories` route + `getCachedCategories` |
| 23 | STUBBED — ACTIVE/INACTIVE only | `Stamp` `success` / `critical` |
| 24 | Extract from existing skeleton/empty/error | reuse existing skeleton retoken'd |
| 25 | DEFERRED — audit hidden in both modes | panel has no audit block |
| 26 | STUBBED — CATALOG section eyebrow | sidebar constants + sectioned sidebar |

### Deviations from plan

- **`drizzle-kit migrate` could not bootstrap on dev DB** because the
  drizzle migrations table was missing — running migrate tried to
  re-create existing tables and failed with `42P07 relation
  "categories" already exists`. Used `pnpm db:push:dev` to apply the
  additive `iconKey` + `isActive` columns directly. The committed
  migration (`0006_slim_redwing.sql`) is correct and will apply
  cleanly on staging/prod where the migrations table is healthy.
- **Legacy `categories-table`, `categories-table-skeleton`, and
  `category-dialog` components deleted** because the only consumer
  was the rewritten screen (verified via grep — no other imports).
  Per CLAUDE.md hard-rule 3 (grep before delete), this is safe.
- **`updateCategoryMutation` invalidates `AdminCategoriesQueryKeys.all`**
  in addition to public `CategoryQueryKeys.all`. This was added with
  the mutation hook update; not a separate behavior change but
  worth noting since the existing hook is now used in two places.
- **Sort dropdown maps to server-side `sort=&dir=` query params** on
  the new admin endpoint, not client-side sort. Q12 binding answer
  said server-side, mirroring `/api/admin/vendors` — this is what
  ships.

## Quality gate

| Check | Result |
|---|---|
| `pnpm --filter web check-types` | ✅ pass |
| `pnpm --filter web lint` | ✅ pass (no warnings) |
| `pnpm --filter web build` | ✅ pass |
| Playwright desktop (1440×900) at `/admin/categories` | ✅ mounts; admin GET 200; row click → edit panel; no console.error |
| Playwright mobile (420×900) at `/admin/categories` | ✅ mounts; row click → Sheet; icon picker save → PATCH 200; no console.error |
| Existing Playwright e2e suite | N/A — repo has no Playwright/Vitest tests |

Smoke method: signed in as admin via phone OTP (`+923000000000`,
any 6-digit code — `verifyOTP` returns true in dev). Verified PATCH
flow saves `iconKey` and the row's icon swatch updates after the
list query refetches.

Screenshots saved:
- `screenshots/desktop.png` — list with empty edit-panel placeholder.
- `screenshots/desktop-edit.png` — list with row selected, edit panel populated.
- `screenshots/mobile.png` — mobile list.
- `screenshots/mobile-edit-sheet.png` — mobile Sheet open over list.
- `screenshots/mobile-after-save.png` — `glass-water` icon saved to Drinks; row swatch updated.

## Spec adherence

`schema/categories.ts` = `packages/database/src/schema/categories.ts`,
`migration` = `packages/database/migrations/0006_slim_redwing.sql`,
`storefront-cat-route` = `apps/web/src/app/api/categories/route.ts`,
`storefront-cat-cached` = `apps/web/src/modules/storefront/utils/get-cached-categories.ts`,
`admin-list-route` = `apps/web/src/app/api/admin/categories/route.ts`,
`admin-id-route` = `apps/web/src/app/api/admin/categories/[id]/route.ts`,
`zod-schemas` = `apps/web/src/modules/admin/admin-categories/schemas/index.ts`,
`shared-cat-types` = `apps/web/src/modules/common/queries/categories/types.ts`,
`admin-screen` = `apps/web/src/modules/admin/admin-categories/index.tsx`,
`page-header` = `.../components/categories-page-header/index.tsx`,
`filters` = `.../components/categories-filters/index.tsx`,
`list-card` = `.../components/categories-list-card/index.tsx`,
`row` = `.../components/category-row/index.tsx`,
`pagination` = `.../components/categories-pagination/index.tsx`,
`edit-panel` = `.../components/category-edit-panel/index.tsx`,
`edit-sheet` = `.../components/category-edit-sheet/index.tsx`,
`icon-picker` = `.../components/category-icon-picker/index.tsx`,
`icon-swatch` = `.../components/category-icon-swatch/index.tsx`,
`icon-set` = `.../constants/category-icons.ts`,
`admin-query-hook` = `.../hooks/use-admin-categories-query/index.ts`,
`breadcrumb` = `apps/web/src/modules/admin/admin-layout/admin-breadcrumb/index.tsx`,
`admin-sidebar-constants` = `apps/web/src/modules/admin/admin-layout/admin-sidebar/admin-sidebar.constants.ts`,
`admin-sidebar` = `apps/web/src/modules/admin/admin-layout/admin-sidebar/index.tsx`.

| Q | Answer | Satisfied at |
|---|---|---|
| 1 | DEFERRED — drop live counts; static copy | `page-header:18-21` (descriptive copy, no live stats) |
| 2 | STUBBED — visual-only breadcrumb | `breadcrumb` + `admin-screen:108` (`<AdminBreadcrumb trail={['Catalog', 'Categories']} />`) |
| 3 | Full-row click opens panel | `row:30-37` (button onClick → onSelect) |
| 4 | Same panel in empty/create mode | `edit-panel:53-58` + `admin-screen:140-143` (`isCreating` → empty form) |
| 5 | STUBBED — iconKey added; imageUrl kept | `schema/categories.ts:11` + `icon-set` + `icon-picker` + `icon-swatch` |
| 6 | DEFERRED — description hidden | `edit-panel` (no description field rendered) |
| 7 | DEFERRED — parent hidden | `edit-panel` (no parent select rendered) |
| 8 | DEFERRED — sort hidden | `row` (no SORT cell) + `edit-panel` (no sort field) |
| 9 | STUBBED — isActive added; storefront filtered | `schema/categories.ts:12` + `storefront-cat-route:19` (`WHERE isActive = true`) + `storefront-cat-cached:11` |
| 10 | DEFERRED — audit hidden | `edit-panel` (no audit block) |
| 11 | DEFERRED — products/vendors columns hidden | `row` + `list-card` (no PRODUCTS/VENDORS columns) |
| 12 | New `GET /api/admin/categories` with params | `admin-list-route:33-127` (page/limit/q/status/sort/dir) |
| 13 | DEFERRED — trash + Remove hidden | `row` (no trash icon) + `edit-panel` (no Remove button) |
| 14a | DEFERRED — Reorder hidden | `page-header` (no Reorder CTA) |
| 14b | Mobile uses Sheet | `edit-sheet` + `admin-screen:158-167` (`showMobileSheet` controlled by `useIsDesktop`) |
| 15 | DEFERRED — Export CSV no-op + toast | `page-header:25-31` (`toast('Export CSV — coming soon')`) |
| 16 | DEFERRED — KPI row hidden | `admin-screen` (no KPI row rendered) |
| 17 | DEFERRED — bulk select hidden | `row` + `list-card` (no checkboxes) |
| 18 | Sentence case button labels | `page-header:33` ("Add category"), `edit-panel:223` ("Save changes" / "Create category"), `page-header:26` ("Export CSV") |
| 19 | DEFERRED — slug read-only | `edit-panel:198-209` (input `readOnly`) |
| 20 | DEFERRED — trash + ellipsis hidden | `row` (no overflow menu) |
| 21 | Intentional — image swatch + created in panel (audit hidden) | `row:42-45` (icon swatch only, no Created column) |
| 22 | STUBBED — storefront `WHERE isActive = true` | `storefront-cat-route:19` + `storefront-cat-cached:11` |
| 23 | STUBBED — ACTIVE/INACTIVE only | `row:48-50` (`Stamp` `success` / `critical`) |
| 24 | Extract from existing skeleton/empty/error | `list-card:18-32` (skeleton) + `list-card:53-57` (empty) + `list-card:50-52` (error) |
| 25 | DEFERRED — audit hidden in both modes | `edit-panel` (no audit block in either branch) |
| 26 | STUBBED — CATALOG section eyebrow | `admin-sidebar-constants:31-46` (Catalog section) + `admin-sidebar:43-47` (eyebrow render) |

## Completed

### Files changed

- `packages/database/src/schema/categories.ts` — add `iconKey` + `isActive`.
- `packages/database/migrations/0006_slim_redwing.sql` — **NEW** additive migration.
- `packages/database/migrations/meta/_journal.json` + `0006_snapshot.json` — drizzle metadata.
- `apps/web/src/app/api/categories/route.ts` — `WHERE isActive = true`; return `iconKey` + `isActive`.
- `apps/web/src/app/api/categories/[id]/route.ts` — return `iconKey` + `isActive`.
- `apps/web/src/app/api/admin/categories/route.ts` — add admin GET (page/limit/q/status/sort/dir); extend POST with `iconKey` + `isActive`.
- `apps/web/src/app/api/admin/categories/[id]/route.ts` — extend PATCH with `iconKey` + `isActive`.
- `apps/web/src/modules/admin/admin-categories/schemas/index.ts` — add `iconKey` + `isActive` to Zod.
- `apps/web/src/modules/admin/admin-categories/index.tsx` — full rewrite: split-pane composition, server-side filter/sort/pagination, mobile Sheet.
- `apps/web/src/modules/admin/admin-categories/components/categories-page-header/index.tsx` — sentence case + Export CSV no-op.
- `apps/web/src/modules/admin/admin-categories/components/category-icon-swatch/index.tsx` — **NEW** 40×40 green-bg pill.
- `apps/web/src/modules/admin/admin-categories/components/category-icon-picker/index.tsx` — **NEW** curated lucide picker.
- `apps/web/src/modules/admin/admin-categories/components/category-row/index.tsx` — **NEW** card-row.
- `apps/web/src/modules/admin/admin-categories/components/categories-list-card/index.tsx` — **NEW** list card + skeleton/empty/error.
- `apps/web/src/modules/admin/admin-categories/components/categories-filters/index.tsx` — **NEW** status tabs + search + sort.
- `apps/web/src/modules/admin/admin-categories/components/categories-pagination/index.tsx` — **NEW** prev/next.
- `apps/web/src/modules/admin/admin-categories/components/category-edit-panel/index.tsx` — **NEW** desktop side panel + form.
- `apps/web/src/modules/admin/admin-categories/components/category-edit-sheet/index.tsx` — **NEW** mobile Sheet wrapper.
- `apps/web/src/modules/admin/admin-categories/constants/category-icons.ts` — **NEW** curated lucide set + resolver.
- `apps/web/src/modules/admin/admin-categories/hooks/use-admin-categories-query/index.ts` — **NEW** admin query hook.
- `apps/web/src/modules/admin/admin-categories/hooks/use-create-category-mutation/index.ts` — invalidate admin list.
- `apps/web/src/modules/admin/admin-categories/hooks/use-update-category-mutation/index.ts` — invalidate admin list.
- `apps/web/src/modules/admin/admin-layout/admin-breadcrumb/index.tsx` — **NEW** visual-only breadcrumb.
- `apps/web/src/modules/admin/admin-layout/admin-sidebar/admin-sidebar.constants.ts` — sectioned `{section, items}[]` shape.
- `apps/web/src/modules/admin/admin-layout/admin-sidebar/index.tsx` — render section eyebrows.
- `apps/web/src/modules/common/queries/categories/types.ts` — add `iconKey` + `isActive`.
- `apps/web/src/modules/storefront/utils/get-cached-categories.ts` — `WHERE isActive = true`.

### Files removed

- `apps/web/src/modules/admin/admin-categories/components/categories-table/` — replaced by `categories-list-card`.
- `apps/web/src/modules/admin/admin-categories/components/categories-table-skeleton/` — replaced by inline skeleton in list card.
- `apps/web/src/modules/admin/admin-categories/components/category-dialog/` — replaced by inline edit panel + sheet.

### Test updates

None — repo has no test suite at present.
