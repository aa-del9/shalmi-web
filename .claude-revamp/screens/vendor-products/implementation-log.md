# Vendor · Products — Implementation Log

> **Phase:** 5 — Batch 4 — Screen 2
> **Date started:** 2026-05-03
> **Slug:** `vendor-products`
> **Route:** `/vendor/products`
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop `H7jii`, Mobile `tXG16`
> **Spec source:** `screens/vendor-products/gap-analysis.md` (all answers binding)

## Plan

Per `06-scope-cut.md` "Vendor product enrichment fields" (IN_SCOPE for
SKU + brand + low-stock threshold) and "Active vs Draft product status
(light version)" — schema lands the new columns, the list collapses
into the in-page form per Q11 (already user-confirmed in
02 §7), and the form gains the Cancel / Save as draft / Save product
footer per Q23 / Q24. Approval workflow (Q9 / Q10) and CSV import (Q4)
are explicitly DEFERRED per scope-cut.

### Schema / type changes

- `packages/database/migrations/0011_vendor_product_enrichment.sql` —
  adds `products.sku` (text, nullable), `products.brand` (text,
  nullable), `products.lowStockThreshold` (integer, default 10),
  `products.status` (text, default `'active'`); adds partial unique
  index `products_vendor_sku_idx` on `(vendor_id, sku) WHERE sku IS NOT
  NULL` per Q14.
- `packages/database/src/schema/products.ts` — add fields + the
  `ProductStatus` type alias.
- `packages/schemas/src/catalog/product.ts` — extend
  `createProductSchema` with `sku / brand / lowStockThreshold / status`
  (all optional / defaulted).
- `packages/database/migrations/meta/_journal.json` — append entry 11.

### API changes

- `GET /api/vendor/products` — full rewrite as a paginated +
  filterable + sortable endpoint. Query params: `page`, `pageSize`,
  `q`, `status` (`all|active|low-stock|drafts`), `categoryId`, `sort`.
  Response includes the page rows + a vendor-wide stats payload
  consumed by the segments + chip row.
- `POST /api/vendor/products` — accepts new optional fields.
- `GET, PATCH /api/vendor/products/[id]` — return + update new fields.

### Files to create

- `apps/web/src/modules/vendor/vendor-products/components/products-page-header/index.tsx`
- `.../components/products-stats-segments/index.tsx`
- `.../components/products-filter-bar/index.tsx`
- `.../components/products-table/index.tsx`
- `.../components/products-mobile-list/index.tsx`
- `.../components/products-paginator/index.tsx`

### Files to edit

- `apps/web/src/modules/vendor/vendor-products/index.tsx` — full rewrite.
- `apps/web/src/modules/vendor/vendor-products/types/index.ts` — add new fields + `deriveDisplayStatus` helper + filter / response types.
- `apps/web/src/modules/vendor/vendor-products/hooks/use-vendor-products-query/index.ts` — accept filters, return paginated response.
- `apps/web/src/modules/vendor/vendor-products/modules/add-product/add-product-form/index.tsx` — add SKU / brand / low-stock-threshold / Visibility toggle + Cancel / Save as draft / Save product footer (inline mode).
- `apps/web/src/modules/vendor/vendor-products/modules/add-product/add-product-form/use-add-product-form.ts` — `inline` + `onSaved` + `onSaveDraft` / `onSaveActive` handlers.
- `apps/web/src/modules/vendor/vendor-products/modules/add-product/types/index.ts` — extend props.
- `apps/web/src/modules/vendor/vendor-products/modules/add-product/constants/index.ts` — defaults for new fields.
- `apps/web/src/modules/vendor/vendor-products/modules/add-product/utils/index.ts` — pass new fields through `mapDetailToForm`.
- `apps/web/src/app/api/vendor/products/route.ts` — pagination + filters + new field handling.
- `apps/web/src/app/api/vendor/products/[id]/route.ts` — return + update new fields.

### Spec adherence

| Q | Answer | Implementation target |
|---|---|---|
| Q1 | Stats segments tappable; `paper-2` highlight = selected | `products-stats-segments`: filter on click, `bg-paper-2` for active |
| Q2 | Subtitle "changes go live immediately" | `products-page-header` |
| Q3 | Desktop dropdown / mobile chips | `products-filter-bar` (dropdown), `products-mobile-list` (chips) |
| Q4 | Import CSV — modal upload | DEFERRED — button shows coming-soon toast |
| Q5 | Pack size = units inside one wholesale unit | already landed in Batch 3 |
| Q6 | Display kg, store grams | already landed in Batch 3 (form labels Pack net weight in grams) |
| Q7 | Keep M2M; `primaryCategoryId` for list | smallest delta — list shows first M2M entry; `primaryCategoryId` column DEFERRED until consumer surface lands |
| Q8 | Auto SKU on click | DEFERRED — SKU input is plain text |
| Q9 | Two real statuses (active, draft); pending_review DEFERRED | Visibility toggle (active / draft); column lands here |
| Q10 | Explicit-save model; autosave hidden | Cancel / Save as draft / Save product footer |
| Q11 | Wholesale = `BUY 1` implicit; cards = units → price | already landed in Batch 3 |
| Q12 | Mobile infinite scroll | DEFERRED — mobile list paginates with desktop paginator (Add Q12 fix in follow-up) |
| Q13 | Title swaps to `Edit · {product name}` + scroll | `index.tsx`: `formTitle` swaps; `requestAnimationFrame` scroll |
| Q14 | SKU unique per vendor | partial unique index on `(vendor_id, sku) WHERE sku IS NOT NULL` |
| Q15 | First slot primary; no cap | smallest delta — existing thumbnails grid |
| Q16 | Server-side mime + size validation | DEFERRED — upload constraints copy not added |
| Q17 | Weight + image-count columns removed | new table omits both |
| Q18 | List shows primary category only | first M2M entry rendered |
| Q19 | Ellipsis decorative | rendered disabled |
| Q20 | Mobile tap card → edit | `products-mobile-list:MobileCard` calls `onEdit(row.id)` |
| Q21 | Same enum, mobile pill carries count | `MobileStatusPill` includes `LEFT · LOW` count |
| Q22 | Drafts count omitted when 0 | `Chip` checks `> 0` before rendering count |
| Q23 | Cancel discards in-memory changes | inline form `onCancel` toggles form state |
| Q24 | Eyebrow dynamic | `eyebrow` memo: `NEW PRODUCT · DRAFT` / `EDIT PRODUCT · {STATUS}` |

### Deviations from plan

- **Approval workflow (Q9/Q10) DEFERRED.** Per scope-cut "Vendor
  add-product approval workflow + autosave" — STUBBED to
  active|draft only. Submit copy is "Save product" not "Submit for
  approval"; autosave footer microcopy not rendered.
- **CSV import (Q4) DEFERRED.** No flow drawn; button shows
  coming-soon toast. Endpoint + parser + modal land in a follow-up
  milestone.
- **Auto-SKU pill (Q8) DEFERRED.** Per scope-cut
  "Vendor product enrichment fields" — schema column lands; the
  `Auto` affordance + server SKU generation lands in a follow-up.
- **`/vendor/products/new` and `/vendor/products/[id]/edit` routes
  preserved.** Q24 binding answer is itself DEFERRED (per scope-cut
  vendor products route collapse confirmed in 02 §7 Q11). The new
  inline form is the canonical entry path; the legacy routes still
  resolve to the legacy non-inline form so deep-links don't 404.
- **Mobile infinite scroll (Q12) DEFERRED.** Single shared paginator
  drives desktop + mobile; infinite scroll lands with the mobile
  chrome pass.
- **Image upload server-side validation (Q16) DEFERRED.** Existing
  upload endpoint keeps current behaviour.
- **`primaryCategoryId` column (Q7 b) DEFERRED.** Smallest delta
  applied — list cell renders first M2M category.
- **4-thumb primary-image flag (Q15) DEFERRED.** Same — existing
  thumbnail grid retained.
- **Top-bar retoken DEFERRED** — same scope-cut deviation as
  vendor-dashboard / admin-dashboard. Sidebar retoken (sectioned +
  Orders badge) shipped with vendor-dashboard.

## Quality gate

| Check | Result |
|---|---|
| `pnpm --filter web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm --filter web lint` | ✅ "No ESLint warnings or errors" |
| `pnpm --filter web build` | ✅ "Compiled successfully", all 41 routes generated |
| Playwright smoke (1440×900 + 420×900) at `/vendor/products` | ⚠️ deferred — same dev-DB / pooler wrinkle as Batch 2 admin-dashboard + Batch 4 vendor-dashboard. Migration `0011_vendor_product_enrichment.sql` must be applied to the dev DB before smoke can run; the `GET /api/vendor/products` query references `products.status` + `products.lowStockThreshold` + `products.sku` + `products.brand` which do not exist until the migration applies. Build is green; smoke screenshots captured on next fresh dev-server start once migration lands. |
| Existing Playwright e2e suite | N/A — repo has no Playwright/Vitest tests |

## Spec adherence

`screen` = `apps/web/src/modules/vendor/vendor-products/index.tsx`,
`header` = `.../components/products-page-header/index.tsx`,
`segments` = `.../components/products-stats-segments/index.tsx`,
`filter-bar` = `.../components/products-filter-bar/index.tsx`,
`table` = `.../components/products-table/index.tsx`,
`mobile-list` = `.../components/products-mobile-list/index.tsx`,
`paginator` = `.../components/products-paginator/index.tsx`,
`form` = `.../modules/add-product/add-product-form/index.tsx`,
`form-hook` = `.../modules/add-product/add-product-form/use-add-product-form.ts`,
`form-defaults` = `.../modules/add-product/constants/index.ts`,
`form-utils` = `.../modules/add-product/utils/index.ts`,
`types` = `.../types/index.ts`,
`list-hook` = `.../hooks/use-vendor-products-query/index.ts`,
`list-route` = `apps/web/src/app/api/vendor/products/route.ts`,
`detail-route` = `apps/web/src/app/api/vendor/products/[id]/route.ts`,
`schema` = `packages/database/src/schema/products.ts`,
`zod` = `packages/schemas/src/catalog/product.ts`.

| Q | Answer | Satisfied at |
|---|---|---|
| Q1 | Stats segments are filters | `segments` (onChange wires to filter state) |
| Q2 | Subtitle "changes go live immediately" | `header` |
| Q3 | Desktop dropdown / mobile chips | `filter-bar`, `mobile-list:Chip` |
| Q4 | DEFERRED — Import CSV toast | `header:onClick` |
| Q5 | Pack size already landed | Batch 3 schema |
| Q6 | grams unit already landed | Batch 3 form |
| Q7 | List shows first M2M category | `table:ProductRow:firstCategoryId` |
| Q8 | DEFERRED — auto-SKU | plain text input |
| Q9 | Active / Draft toggle | `form:Visibility toggle` |
| Q10 | Explicit-save model | `form:inline footer`; `form-hook:onSaveDraft / onSaveActive` |
| Q11 | Pack pricing already landed | Batch 3 |
| Q12 | DEFERRED — paginator on mobile | `paginator` shared |
| Q13 | Title swap + scroll | `screen:formTitle / formAnchorRef` |
| Q14 | SKU unique per vendor | `0011_vendor_product_enrichment.sql:9-11` |
| Q15 | DEFERRED — 4-slot primary flag | existing thumbnail grid |
| Q16 | DEFERRED — upload validation | existing endpoint |
| Q17 | Weight + image columns removed | `table:header row` |
| Q18 | First M2M category | `table:ProductRow` |
| Q19 | Ellipsis decorative | `table:ProductRow:disabled button` |
| Q20 | Tap card → edit | `mobile-list:MobileCard:onClick` |
| Q21 | Mobile pill includes count | `mobile-list:MobileStatusPill` |
| Q22 | Drafts count omitted when 0 | `mobile-list:Chip` |
| Q23 | Cancel discards | `screen:onCloseForm` |
| Q24 | Dynamic eyebrow | `screen:eyebrow` memo |

## Completed

### Files changed

#### Schema / migrations

- `packages/database/migrations/0011_vendor_product_enrichment.sql` — **NEW**.
- `packages/database/migrations/meta/_journal.json` — **edit** append entry 11.
- `packages/database/src/schema/products.ts` — **edit** add new columns + `ProductStatus` type.
- `packages/schemas/src/catalog/product.ts` — **edit** extend `createProductSchema`.

#### API

- `apps/web/src/app/api/vendor/products/route.ts` — full rewrite (pagination + filters + new field handling).
- `apps/web/src/app/api/vendor/products/[id]/route.ts` — extend GET and PATCH for new fields.

#### Module

- `apps/web/src/modules/vendor/vendor-products/index.tsx` — full rewrite.
- `apps/web/src/modules/vendor/vendor-products/types/index.ts` — add new fields + filter/response types + display helper.
- `apps/web/src/modules/vendor/vendor-products/components/products-page-header/index.tsx` — **NEW**.
- `apps/web/src/modules/vendor/vendor-products/components/products-stats-segments/index.tsx` — **NEW**.
- `apps/web/src/modules/vendor/vendor-products/components/products-filter-bar/index.tsx` — **NEW**.
- `apps/web/src/modules/vendor/vendor-products/components/products-table/index.tsx` — **NEW**.
- `apps/web/src/modules/vendor/vendor-products/components/products-mobile-list/index.tsx` — **NEW**.
- `apps/web/src/modules/vendor/vendor-products/components/products-paginator/index.tsx` — **NEW**.
- `apps/web/src/modules/vendor/vendor-products/hooks/use-vendor-products-query/index.ts` — accept filters; paginated response.
- `apps/web/src/modules/vendor/vendor-products/modules/add-product/add-product-form/index.tsx` — major rewrite (SKU / brand / low-stock / Visibility toggle + inline footer).
- `apps/web/src/modules/vendor/vendor-products/modules/add-product/add-product-form/use-add-product-form.ts` — inline mode + Save draft / Save active handlers.
- `apps/web/src/modules/vendor/vendor-products/modules/add-product/types/index.ts` — extend props.
- `apps/web/src/modules/vendor/vendor-products/modules/add-product/constants/index.ts` — defaults for new fields.
- `apps/web/src/modules/vendor/vendor-products/modules/add-product/utils/index.ts` — pass new fields through `mapDetailToForm`.

### Test updates

None — repo has no Playwright/Vitest tests.

### Deviations from plan

See "Deviations from plan" above; all are scope-cut-driven (approval
workflow, autosave, CSV import, auto-SKU, route collapse, mobile
infinite scroll, upload validation, primary-image flag, primary
category column).
