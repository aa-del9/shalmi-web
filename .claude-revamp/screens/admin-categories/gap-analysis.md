# Gap Analysis — Admin · Categories

> **Phase:** Per-screen gap analysis (read-only).
> **Date produced:** 2026-05-02
> **Pencil source:** `Pencil-Design\Shalmi`
> Desktop: `A0BZZx` · Mobile: `IVbBD`
> **Existing route:** `/admin/categories` → `apps/web/src/modules/admin/admin-categories/`
> **DB:** `packages/database/src/schema/categories.ts` — fields: `id`, `name`, `slug`, `imageUrl`, `createdAt`, `updatedAt`. No parent, no sortOrder, no iconKey, no description, no isActive, no audit-by.

This is a discovery document. Per CLAUDE.md, nothing in §2 is silently
"resolved." Every NEW_FIELD / REMOVED_FIELD / NEW_INTERACTION /
CHANGED_INTERACTION / NEW_STATE / COPY_CHANGE / AMBIGUOUS row in §2 is
mirrored as a numbered question in §5.

---

## 1. Layout & structure

The two designs differ structurally — this is the largest single gap.

**Existing (`AdminCategories`):**
- Single-column scroll inside `<SidebarInset>`.
- `CategoriesPageHeader` (title + subtitle + "Add Category" button).
- `CategoriesTable` (name / slug / image / created / Edit-button per row).
- Dialog-based create/edit (`CategoryDialog`) — modal centered, fields:
  Name + Image only.

**Pencil desktop (`A0BZZx`):**
- Same admin shell (top bar `GoNu4` + sidebar `Ivd02`), main column 1120w.
- 5-block stack inside main:
  1. Breadcrumb `cBC` (NBpo7) — `Admin › Catalog › Categories`.
  2. Header `cHd` (v7hM6) — title block on the left, **3 actions on the right**: Export CSV (outline), Reorder (outline), Add category (green primary).
  3. KPI row `cKpi` (MY69M) — **4 KPI cards** (Total / Products / Inactive / Needs review).
  4. Filters card `cFil` (zbz2V) — **status tabs** (All 14 / Active 12 / Inactive 2) + Search + Sort dropdown.
  5. **`cSplit` (Pj4d1)** — two-column row: list-card on the left (`cListW`) + **inline Edit panel on the right** (`Edit panel`, 440w fixed). The edit panel replaces the modal dialog.
- Each row is a **table-style row inside a card** (not a basic shadcn Table). Columns: checkbox · category (icon + name + slug-meta) · PRODUCTS · VENDORS · SORT · STATUS · ACTIONS.
- Status uses the `Stamp` primitive (rotated -1°, mono): ACTIVE / NEEDS REVIEW / INACTIVE.
- List footer (`cListFt`): "Showing 1–10 of 14 categories" + Previous / Next pagination buttons.

**Pencil mobile (`IVbBD`):**
- Mobile admin app bar (`b0ki6Y`) — **dark `ink` strip** with title "Categories" + bell + avatar.
- `mcSub` (al2lQ): page heading + Add button + 3-card KPI row (Total / Active / Review) + search + 3 status pill tabs (All / Active / Inactive).
- List (`W2Nv5x`): vertical card list (one card per category) with icon + name + meta line ("1,420 products · 38 vendors") + per-row Edit + ellipsis-vertical action. Bottom hint (`mcEdHint`): "Tap any category to edit name, slug, icon, parent, sort order or status."
- **No mobile drawer/sheet for edit is drawn** — implication is "tap row → navigate to edit," but the destination screen is not in this Pencil pass. (See Q14.)

**Key structural delta:**
- Modal Dialog → Inline split-pane editing on desktop.
- Plain `<table>` → card-wrapped table-row layout with custom column widths.
- Image upload → Lucide icon picker (`iconKey`).
- 5 columns (name/slug/image/created/actions) → 7 columns (checkbox/category-with-icon-and-meta/products/vendors/sort/status/actions).

---

## 2. Element-by-element diff

Legend for `category`:
`VISUAL_ONLY` · `COPY_CHANGE` · `NEW_FIELD` · `REMOVED_FIELD` ·
`NEW_INTERACTION` · `CHANGED_INTERACTION` · `NEW_STATE` · `AMBIGUOUS`

### 2.1 Page chrome

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Top bar `GoNu4` (ink, "Shalmi Mart · Admin", dark search 320w, bell, avatar) | `apps/web/src/modules/admin/admin-layout/index.tsx` — light header with `SidebarTrigger` + `LogoutButton` only | Different chrome system entirely — tracked at the layout level, not per-screen. Out of scope here; flagging for cross-cutting work. | VISUAL_ONLY |
| Sidebar `Ivd02` (240w white, sectioned eyebrows, paper-2 active row) | `AdminSidebar` (`apps/web/src/modules/admin/admin-layout/components/admin-sidebar/`) | Same comment — chrome, not screen-local. | VISUAL_ONLY |

### 2.2 Breadcrumb (`cBC`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Breadcrumb row: `Admin › Catalog › Categories` (last segment ink/600, others ink-3/normal, lucide `chevron-right` 14px ink-3) | None — there is no breadcrumb in the existing screen | Wholly new pattern for this screen. The "Catalog" middle segment implies a parent grouping that does not exist in the route tree (`/admin/categories` is a top-level admin route, not nested under `/admin/catalog/...`). | NEW_INTERACTION |

### 2.3 Header (`cHd`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Title "Categories" (sans 32 / 800 / -0.02ls) | `<h1>Categories` (text-heading-lg / font-semibold) | Size/weight/tracking change driven by Pencil tokens. | VISUAL_ONLY |
| Subtitle "14 categories · 12,840 products listed · last edit 2 days ago" (ink-3, 13/normal) | "Manage product categories. Assign categories when adding or editing products." | Copy is entirely different — Pencil shows **stats-style live meta** (counts + last-edit timestamp), existing copy is a **descriptive instructional paragraph**. | COPY_CHANGE |
| Subtitle data: total category count | (none — string is static) | Requires a count derived from the same query that already powers the table. | NEW_FIELD (display) |
| Subtitle data: total products listed | (none) | Requires aggregating product counts across categories — see §3. | NEW_FIELD |
| Subtitle data: "last edit N days ago" | (none) | Requires a `MAX(updated_at)` or per-category `updatedBy` audit lookup — see §3. | NEW_FIELD |
| Action button "Export CSV" (outline ink, lucide `download`, 13/600) | (none) | Wholly new export action. No `/api/admin/categories/export` endpoint. | NEW_INTERACTION |
| Action button "Reorder" (outline ink, lucide `arrow-down-up`) | (none) | Implies a global-reorder mode (drag-reorder). No reorder endpoint or `sortOrder` column. | NEW_INTERACTION |
| Action button "Add category" (green-2 fill, white text 14/700) | "Add Category" (default green Button) | Copy: capitalization changes "Add Category" → "Add category" (sentence case). Visual: confirmed by Pencil tokens. | COPY_CHANGE |

### 2.4 KPI row (`cKpi`) — 4 cards desktop / 3 cards mobile

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| `ck1` "TOTAL CATEGORIES" — value `14` (mono 32/800) — delta "+2 added this month" with green-700 `arrow-up-right` icon | (none) | New KPI surface. Value is derivable; **delta requires a "created in last 30d" count**. | NEW_FIELD |
| `ck2` "PRODUCTS LISTED" — value `12,840` — delta "+412 this month" (green-700) | (none) | New KPI; aggregate of products across categories + month-over-month delta. | NEW_FIELD |
| `ck3` "INACTIVE CATEGORIES" — value `2`, sublabel "Hidden from buyers" | (none) | New KPI; requires `isActive` field (does not exist) — see §3. | NEW_FIELD |
| `ck4` "NEEDS REVIEW" — value `3`, sublabel "Missing icon or image" (amber stamp/card, fill `#FEF7E0`, stroke amber `#A16207`) | (none) | New KPI; "needs review" semantics undefined — implies derived predicate `iconKey IS NULL OR imageUrl IS NULL`. | NEW_FIELD + AMBIGUOUS |
| Mobile `mcKpi` — 3 cards (TOTAL / ACTIVE / REVIEW) with smaller mono sizes | (none) | Same data, condensed mobile layout. | NEW_FIELD (mobile) |

### 2.5 Filters / tabs (`cFil`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Status tabs: pill-style toggle group `All 14 / Active 12 / Inactive 2`. Selected pill: ink fill, white label, mono count badge. | (none) | New filter axis: status. Requires `isActive` (see §3). Tabs also show **counts inside each pill** — driven by query-side aggregations. | NEW_INTERACTION + NEW_FIELD |
| Search "Search categories" (paper-2 fill, lucide `search`, ink-3 placeholder, 280w) | (none) | New client-side or server-side search over name/slug. Existing `useCategoriesQuery` returns the full list — search would be client-side filter unless an endpoint param is added. | NEW_INTERACTION |
| Sort dropdown "Sort: A → Z" (outline, lucide `arrow-down-up`) | (none) | New sort interaction. Default sort in code is unspecified (see existing GET handler). | NEW_INTERACTION |

### 2.6 Bulk-action / table-header row (`cListHd`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Header bulk-select checkbox (`chcb`) | (none) | Bulk-select is a new pattern in this screen. The actions it triggers are **not drawn** in Pencil. | NEW_INTERACTION + AMBIGUOUS |
| Column header "CATEGORY" (mono 11/700, with `arrow-down` indicating active sort) | "Name" (sans regular) | Copy + style + sort indicator are all new. | COPY_CHANGE + NEW_INTERACTION |
| Column header "PRODUCTS" | (none) | New column — see row below. | NEW_FIELD |
| Column header "VENDORS" | (none) | New column. | NEW_FIELD |
| Column header "SORT" | (none) | New column showing per-row `sortOrder`. | NEW_FIELD |
| Column header "STATUS" | (none) | New column. | NEW_FIELD |
| Column header "ACTIONS" | "Actions" (sans) | Copy is uppercase mono, content differs (see row-action diff below). | COPY_CHANGE |
| Existing column "Slug" | — (Pencil moves slug into the row's secondary line: `drinks · soft drinks, juices, water`) | Slug is no longer its own column — it's the **prefix** of a meta line that also includes a description-fragment. | CHANGED_INTERACTION + NEW_FIELD (description) |
| Existing column "Image" (40x40 thumbnail or em-dash) | — (Pencil replaces image with a 40x40 colored **icon swatch**, lucide glyph rendered onto a green-bg / amber-bg pill) | Replaces uploaded image with a Lucide icon-key. The image upload flow + `imageUrl` field have no Pencil counterpart. | REMOVED_FIELD + NEW_FIELD |
| Existing column "Created" (date) | — | Pencil omits createdAt from the row entirely — it appears only in the Edit panel `cEMeta`. | REMOVED_FIELD (column) |

### 2.7 Table row (`cR1`–`cR10`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Row checkbox `cR1cb` | (none) | Per-row select (paired with header bulk-select). Action target unspecified. | NEW_INTERACTION + AMBIGUOUS |
| Icon swatch (40x40 rounded, green-bg fill `#F0FDF4`, lucide glyph in green-700; **amber tint when "needs review"**) | `<Image>` thumbnail or em-dash | Wholly new icon-key concept. Glyphs observed: `glass-water`, `cookie`, `droplet`, `coffee`, `wheat`, `milk`, `sparkles`, `plug`, `croissant`, `snowflake`. | NEW_FIELD + NEW_STATE |
| Name (sans 14/700) | Name (font-medium) | Visual retoken. | VISUAL_ONLY |
| Meta line "drinks · soft drinks, juices, water" (mono 11, ink-3) | Slug column "drinks" (mono small) | Pencil concatenates `slug · description-fragment`. **Description does not exist** in the current schema. | NEW_FIELD |
| PRODUCTS count "1,420" (mono 14/700, ink) | (none) | Aggregate count of products in this category — see §3. | NEW_FIELD |
| VENDORS count "38" (mono 14/700, ink) | (none) | Aggregate count of distinct vendors with at least one product in this category — see §3. | NEW_FIELD |
| SORT cell "01", "02", … (mono 13, ink-3, fixed-width 80) | (none) | Per-row sortOrder column. The values shown (01–10) imply a 2-digit zero-padded display format. | NEW_FIELD |
| STATUS cell — `Stamp` rotated -1° with one of {ACTIVE green, NEEDS REVIEW amber, INACTIVE red} | (none) | New column; backed by a status field that does not exist (`isActive` boolean, plus a derived "needs review" predicate). | NEW_FIELD + NEW_STATE |
| ACTIONS cell — three lucide icon-buttons: `pencil`, `trash-2` (red), `ellipsis-vertical` | One outline `Edit` button per row | Pencil replaces text "Edit" with an icon set. Adds **trash (delete)** and **overflow menu** — neither exists in code. No DELETE endpoint on `/api/admin/categories/[id]`. The overflow menu's items are not drawn. | CHANGED_INTERACTION + NEW_INTERACTION + AMBIGUOUS |
| Row 1 background `#F5F2E8` (paper-2) — selected/active row | All rows uniform | Pencil shows row 1 with a paper-2 fill, indicating it is the **currently selected row** (mirrored in the Edit panel header "Drinks · 1,420 products"). | NEW_STATE |
| List footer "Showing 1–10 of 14 categories" (mono 12, ink-3) + Previous / Next buttons | (none) | New pagination control. Existing `GET /api/categories` returns the full list (no `?page=`/`?limit=` params). | NEW_INTERACTION + NEW_FIELD (API) |

### 2.8 Edit panel (`Edit panel`, n1kjy) — replaces the dialog

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Panel header `cEHd` — "Edit category" 18/800 + meta "Drinks · 1,420 products" (mono 11, ink-3) + close (32x32 outline-button with `x`) | `DialogTitle` "Edit Category" or "Add Category" + native dialog close (top-right `X`) | Title style differs; subtitle is new. Close button is in panel-header, not floating. Panel is **always-visible** vs dialog being modal. | CHANGED_INTERACTION + NEW_FIELD (subtitle stat) |
| Icon picker block `cEIcon` (zAjNO) — paper-2 fill, large (56x56) icon preview + "CATEGORY ICON / glass-water (Lucide) / Tap to choose a different icon" | `ImageUpload` (Supabase upload to `/api/admin/upload/categories`) | Whole concept differs: design uses **a Lucide icon picker** (the displayed value is the icon's name, e.g. `glass-water`), the code uses **uploaded raster images** stored at a URL. | REMOVED_FIELD (imageUrl) + NEW_FIELD (iconKey) + NEW_INTERACTION (picker) |
| Field `Display name` (cEf1) — labeled input, label sans 13/600 ink-2 | `Field` "Name" + `Input` | Copy: "Name" → "Display name". Implies the slug becomes a separate, possibly auto-derived value. Visual: 1.5px ink stroke (focus state) on the value-shown input — implies the form is rendered focused on this field by default. | COPY_CHANGE |
| Field `Slug` (cEf2) — input + helper text "shalmi.pk/c/drinks" (mono 11, ink-3) | (slug not editable in dialog — generated server-side via `slugForCategory(name)`) | Slug becomes user-editable with a live URL preview. Existing API derives slug server-side and rejects duplicates with 409. | NEW_FIELD (UI editable) + CHANGED_INTERACTION |
| Field `Description` (cEf3) — multiline textarea, 80h | (none) | Wholly new field. | NEW_FIELD |
| Field `Parent category` (cEf4) — Select-style dropdown showing "None (top-level)" + chevron-down | (none) | New self-referencing relationship — see §3 for schema implications. | NEW_FIELD |
| Field `Sort order` (cEf5) — numeric input, value "01" (mono 14/700) | (none) | New numeric column, also surfaced in row's SORT cell. | NEW_FIELD |
| Status block `cEStat` (ZapVW) — paper-2 card with title "Status / Visible to buyers in storefront" + 2-state segmented toggle (Active = ink-filled, Inactive = transparent) | (none) | New status control. Backed by `isActive` (does not exist). | NEW_FIELD |
| Audit block `cEMeta` (T2sap) — paper-2 card with eyebrow "AUDIT" + rows "Created 12 Mar 2024 · Zaid Ahmed" and "Last edited 28 Apr 2026 · Zaid Ahmed" | (none) | New audit display. Existing schema has `createdAt` but **no `createdBy`/`updatedBy` columns** on `categories`. The `admin_audit_log` table exists separately — see §3. | NEW_FIELD |
| Footer `cEFoot` — Remove button (red outline, lucide-less) on left + Cancel + Save changes (ink-fill, white 13/700) on right | Cancel + Save (default green) at bottom-right of dialog | Adds a **Remove** action (DELETE), repositions Cancel/Save, and changes Save's color from green-2 → ink. | NEW_INTERACTION + VISUAL_ONLY |
| Empty state of edit panel (when no row is selected) | n/a (dialog doesn't exist when closed) | Pencil only shows the panel in "category selected for edit" state. The "no selection" state is **not drawn**. | AMBIGUOUS / NEW_STATE |
| "Add category" flow (clicked from `cHdR3`) | Dialog opens with empty form | Pencil does not show the add-category state of this panel — unclear if the flow opens the same panel in empty mode, navigates to a separate route, or opens a modal. | AMBIGUOUS |

### 2.9 Mobile-only deltas (`IVbBD`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| `mcKpi` — 3 KPI cards (Total / Active / Review) | (none) | New mobile KPIs; subset of desktop's 4. | NEW_FIELD (presentation) |
| `mcSer` — search input | (none) | Same as desktop search. | NEW_INTERACTION |
| `mcTabs` — pill tabs (All / Active / Inactive), horizontally scrollable | (none) | Mobile filter pattern. | NEW_INTERACTION |
| `mcr*` row cards — icon + name + meta + edit/ellipsis | (none — current mobile is just the desktop `<table>` overflowing) | Mobile-specific card layout instead of table. | NEW_INTERACTION (mobile) |
| `mcEdHint` "Tap any category to edit name, slug, icon, parent, sort order or status." (paper-2 helper card with `info` icon) | (none) | New helper instruction implying tap-to-edit navigation. **Destination is not drawn.** | AMBIGUOUS |

### 2.10 States not drawn

| state | observed in design? | observed in code? | category |
|---|---|---|---|
| Loading state for the whole page (KPI placeholders, table skeleton) | NOT drawn — Pencil shows fully-populated state | `CategoriesTableSkeleton` exists | NEW_STATE / AMBIGUOUS |
| Empty state ("no categories yet") | NOT drawn | `"No categories yet."` placeholder row | NEW_STATE / AMBIGUOUS |
| Error state for the table | NOT drawn | Inline error message in a single TableCell | NEW_STATE / AMBIGUOUS |
| Form validation errors on the edit panel | NOT drawn | `FieldError` per field in dialog | NEW_STATE / AMBIGUOUS |
| Success/failure toasts after save/delete | NOT drawn | `toast.success(...)` after mutation | NEW_STATE / AMBIGUOUS |
| Hover/focus/disabled on pagination, sort, filter buttons | NOT drawn | Default shadcn states | NEW_STATE / AMBIGUOUS |

---

## 3. Schema / type implications

For every NEW_FIELD or REMOVED_FIELD in §2, the changes that would be needed (no implementation proposed yet — these are surfaces for the open questions in §5).

### 3.1 New columns on `categories`

| Field (proposed) | Type | Backs which Pencil element(s) | Notes / open Qs |
|---|---|---|---|
| `iconKey` | text (NULL allowed?) | Edit panel icon picker; row icon swatch; "needs review = icon missing" KPI | Stored as the lucide icon's **kebab-case name** (`"glass-water"`, `"plug"`). The codebase already uses lucide. Q5. |
| `description` | text (NULL allowed) | Row meta line "drinks · soft drinks, juices, water"; Edit panel "Description" textarea | Length cap not specified. Q6. |
| `parentId` | text → categories.id (self-FK), NULL allowed | Edit panel "Parent category" select; potentially the breadcrumb "Catalog" segment | Self-referencing FK. Cardinality (depth limit) unspecified. Q7. |
| `sortOrder` | integer | Row "SORT" column; Edit panel "Sort order" input; "Reorder" header CTA | Display is 2-digit zero-padded ("01"). Q8. |
| `isActive` | boolean (default true?) | Row STATUS stamp; Edit panel status toggle; "Inactive" tab + KPI; "Hidden from buyers" copy | Q9. |
| `createdBy` / `updatedBy` | text → user.id (NULL allowed?) | Edit panel `cEMeta` audit ("Zaid Ahmed") | OR rely on existing `admin_audit_log` table. Q10. |
| `imageUrl` | (existing — see §3.2) | n/a | Possibly removed. Q5. |

### 3.2 Possibly-removed schema concerns

| Existing | Pencil shows? | Implication |
|---|---|---|
| `categories.imageUrl` | NO — Pencil uses Lucide icon, not raster | Either remove field, keep as legacy/optional, or repurpose as fallback when `iconKey IS NULL`. Per CLAUDE.md hard rule 3 — must grep before deleting. (`/api/admin/upload/categories` and `ImageUpload` component, `getCachedCategories()`, `category-section`, `CategoryProductsGrid` may all read `imageUrl`.) Q5. |
| `POST /api/admin/upload/categories` route + `ImageUpload` for categories | NO | Same as above. |

### 3.3 New API surface implied

| Endpoint / capability | Backs which Pencil element(s) | Q |
|---|---|---|
| Aggregate `productCount` per category (already partially supported by the products↔categories M:N table) | Row PRODUCTS column, KPI "Products listed", header subtitle | Q11 |
| Aggregate `vendorCount` per category (distinct vendors via products) | Row VENDORS column | Q11 |
| `GET /api/admin/categories` (admin-only paginated/filtered/sorted variant) | List card + filters + sort + pagination | Currently only `GET /api/categories` (public, ungated, returns all). Q12 |
| `DELETE /api/admin/categories/[id]` | Row `trash-2` icon + Edit panel "Remove" button | Currently only POST (create) and PATCH (update). Q13 |
| `POST /api/admin/categories/reorder` (or PATCH bulk) | Header "Reorder" CTA | Q14 |
| `GET /api/admin/categories/export` | Header "Export CSV" | Q15 |
| Search/sort/status query params on the list endpoint | Filter card | Q12 |
| KPI aggregations (`totalCount`, `productsListed`, `inactiveCount`, `needsReviewCount`, deltas-this-month) | KPI row | Q16 |
| Bulk-select target action(s) | Header bulk-select checkbox | AMBIGUOUS — undrawn. Q17 |

### 3.4 Schemas (Zod / RHF) impacted

- `createCategorySchema` / `updateCategorySchema` need fields for `iconKey`, `description`, `parentId`, `sortOrder`, `isActive`, possibly removing `imageUrl`. Slug becomes user-editable (validation: `slugSchema` from `@repo/schemas/metadata` already defines kebab-case regex; uniqueness still enforced server-side via 409).

### 3.5 TS types

- `CategoryListItem` (in `apps/web/src/modules/common/queries/categories/types.ts`) needs `productCount`, `vendorCount`, `iconKey`, `description`, `parentId`, `sortOrder`, `isActive`, plus audit fields.
- All public consumers of `getCachedCategories()` (storefront `category-section`, `category-products-grid`, etc.) need to be re-checked once `imageUrl` decision is made (Q5).

---

## 4. Behavior implications

For every NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE in §2.

### 4.1 Modal → Inline split-pane

- `useState` for `dialogOpen` becomes `selectedCategoryId` driving the right-side `Edit panel`.
- "Add category" flow needs a path: open empty edit panel? Modal? Separate route? — Q4.
- The `cR1Cat` row click target: does the entire row open the edit panel, or only the pencil icon? Q3.
- Browser back / deep-link behavior for `/admin/categories?selected=<id>` is not specified. Q3.

### 4.2 KPI sources

- `total` = `categories.length` (already cheap).
- `productsListed` = `SUM(productCount)` — needs SQL aggregate over `product_categories` JOIN `products`.
- `inactive` = depends on `isActive` — does not exist yet.
- `needsReview` = depends on a derived predicate (e.g. `iconKey IS NULL OR description IS NULL`) — undefined. Q16.
- Deltas (`+2 added this month`, `+412 this month`) need a 30-day rolling comparison against `categories.createdAt` and `products.createdAt` — Q16 covers whether these are real or placeholder.

### 4.3 Filter behavior

- Status tabs map to `isActive` (Active = true, Inactive = false, All = no filter). Server-side filter via query param? Client-side filter over the full list? Q12.
- Search: same question — server-side (`?q=`) vs client filter. Q12.
- Sort: server-side `?sort=name|sortOrder|createdAt&dir=asc|desc`, or client-side. Q12.

### 4.4 Reorder mechanics

- Header "Reorder" CTA implies a mode toggle (drag handles appear, Save Order button shown). Pencil **does not draw** this mode — pure inference. Q14.
- Persistence requires `sortOrder` integer + a bulk PATCH endpoint (similar to `PUT /api/admin/banners/bulk` which already exists for promo banners). Q14.

### 4.5 Bulk select

- Header checkbox + per-row checkboxes. **What action it triggers is not drawn.** Plausible candidates: bulk activate/deactivate, bulk delete, bulk export. Q17.

### 4.6 Delete (trash icon + Remove button)

- New DELETE endpoint. Cascading concerns:
  - `product_categories` rows pointing at the category — block? cascade?
  - Storefront caches that include this category (`getCachedCategories()`).
  - Soft delete vs hard delete (no `deletedAt` on `categories`). Q13.
- Confirmation pattern (modal? "Are you sure?" inline?) is **not drawn**. Q13.

### 4.7 Status toggle

- Activate/deactivate flips `isActive`. When set false, storefront should hide the category. The current public `GET /api/categories` returns all categories — needs `WHERE isActive = true` filter for the storefront, and admin needs to see all. Q9.

### 4.8 Slug edit

- Currently slug is server-derived from name via `slugForCategory()`. Pencil's editable slug + URL preview implies user-controlled slug. Migration concern: existing slugs were derived; if a user edits a slug, all previously bookmarked storefront URLs at `/categories/<old-slug>` 404. Need a redirect strategy or "slug history" — not drawn. Q19.

### 4.9 Icon picker

- The picker UI itself is not drawn. Plausible: lucide-picker dropdown (search by name) vs a curated set. Q5.

### 4.10 Pagination

- Server-side: needs `?page=&limit=` on `GET /api/admin/categories` (currently absent). Q12.
- "Showing 1–10 of 14" implies page size 10 and total count returned in response.

### 4.11 Audit display

- "Created … · Zaid Ahmed" — full name display means we either store `createdBy` user.id and JOIN, or query `admin_audit_log` (which already records `adminId`/`action`/`targetType`/`targetId`). Q10.
- "last edit 2 days ago" in the header subtitle implies "time since last category edit globally." Same source. Q10.

### 4.12 Mobile tap-to-edit destination

- `mcEdHint` says "Tap any category to edit." But the mobile edit screen is not drawn anywhere in this Pencil pass. Plausible: navigate to `/admin/categories/[id]/edit`, or open a full-screen Sheet, or just focus the row in the list. Q14.

### 4.13 Export CSV

- Streaming CSV response from a new endpoint. Filter awareness: does Export respect the current tab/search/sort, or always export the full list? Q15.

---

## 5. Open questions

Each row in §2 with a category of NEW_FIELD / REMOVED_FIELD / NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE / COPY_CHANGE / AMBIGUOUS appears here. Numbered for ease of reference.

---

**Q1 — Header subtitle copy & data sources.**
- Observed: Pencil shows "14 categories · 12,840 products listed · last edit 2 days ago" (live stats). Existing copy: "Manage product categories. Assign categories when adding or editing products." (descriptive paragraph).
- Question: Should the subtitle move to the live-stats format permanently, and what is the data source for the "last edit N days ago" — the most recent `categories.updatedAt`, or something more specific (most recent admin_audit_log entry where `targetType = 'category'`)?
- Hypotheses:
  (a) `MAX(categories.updatedAt)` formatted via dayjs `.fromNow()`.
  (b) `MAX(admin_audit_log.createdAt) WHERE targetType='category'`.
  (c) Hardcoded placeholder (just visual filler in the design).

**Answer:** DEFERRED — see 06-scope-cut.md feature: Categories rich model (icon, description, parent, sort order, isActive, audit, slug-edit, aggregates). Do not implement this question's scope. UI placeholder: drop live counts; keep static descriptive copy ("Manage product categories.").

---

**Q2 — Breadcrumb hierarchy.**
- Observed: Pencil shows "Admin › Catalog › Categories" — a `Catalog` parent that does not exist as a route or grouping in code. The route is `/admin/categories`, not `/admin/catalog/categories`.
- Question: Is "Catalog" a real navigation node (do other catalog screens exist or are planned — e.g. Products, Brands), or is it purely a visual breadcrumb label without a clickable destination?
- Hypotheses:
  (a) Visual-only label — non-clickable middle segment.
  (b) Future grouping — sidebar will get a "Catalog" section that contains Categories + (e.g.) Products/Brands.
  (c) Move route to `/admin/catalog/categories`.

**Answer:** STUBBED — see 06-scope-cut.md feature: Admin "Catalog" sidebar grouping + Breadcrumb component. Implement with placeholder: Visual-only label — non-clickable middle "Catalog" segment. No route move. Add `// TODO(post-v1):` comment at every touch point.

---

**Q3 — Selecting a row.**
- Observed: Pencil shows row 1 (`Drinks`) with paper-2 fill while the Edit panel shows "Drinks · 1,420 products" — implying it's the selected row. The pencil icon, the entire row, and double-click are all candidate triggers; only the icon is drawn as an explicit affordance.
- Question: What clicks open the edit panel — the whole row, only the pencil icon, or both? And does the selected category id sync to the URL (deep-linkable / back-button-friendly)?
- Hypotheses:
  (a) Full-row click opens the panel; trash and overflow icons stop propagation.
  (b) Only the pencil icon opens; row click is reserved for bulk-select (checkbox tap).
  (c) Either; URL syncs via `?selected=<id>` (nuqs is already in the stack).

**Answer:** Full-row click opens panel; trash and overflow icons stop propagation. URL not synced.

---

**Q4 — "Add category" flow target.**
- Observed: Pencil shows the Edit panel only in "row selected" state. The "Add category" button (`cHdR3`) is in the header but the empty-form state of the panel is not drawn.
- Question: Where does "Add category" land?
- Hypotheses:
  (a) Same right-side Edit panel, opened in empty/create mode (panel header changes to "New category").
  (b) Modal Dialog (current behavior, retained for create-only).
  (c) Separate route `/admin/categories/new`.

**Answer:** Same right-side Edit panel in empty/create mode; header reads "New category"; on save panel switches to edit mode.

---

**Q5 — Icon picker (NEW_FIELD `iconKey`) vs existing `imageUrl`.**
- Observed: Pencil shows a Lucide icon swatch on every row and an "Icon" picker block in the Edit panel — including the icon's name string ("glass-water (Lucide)"). Existing schema has `imageUrl` (Supabase Storage URL); existing dialog uploads a raster image.
- Question:
  (a) Replace `imageUrl` with `iconKey` (drop image upload entirely)?
  (b) Keep both: `iconKey` for admin/category-list, `imageUrl` for storefront category tile (the storefront `category-section` currently renders `imageUrl`)?
  (c) Migrate existing categories' `imageUrl` to a fallback `iconKey` (auto-pick? seed?) — and is there a curated icon set or is the picker a full Lucide search?

**Answer:** STUBBED — see 06-scope-cut.md feature: Category icons (Lucide map). Implement with placeholder: Keep both — `iconKey` for admin/category-list, `imageUrl` for storefront tile (least destructive). Add `// TODO(post-v1):` comment at every touch point.

---

**Q6 — Description field.**
- Observed: Pencil row shows `slug · description-fragment` (e.g. "drinks · soft drinks, juices, water"); the Edit panel has a multiline description field showing 2 sentences ("Soft drinks, juices, bottled water and energy drinks. Wholesale cartons.").
- Question: Add a `description` text column. Required or optional? Length cap? Markdown or plain text? Used anywhere else (storefront category landing)?
- Hypotheses:
  (a) Optional plain text, ≤140 chars, admin-only.
  (b) Optional, no cap, also displayed at top of `/categories/[slug]` storefront page.
  (c) Required.

**Answer:** DEFERRED — see 06-scope-cut.md feature: Categories rich model (icon, description, parent, sort order, isActive, audit, slug-edit, aggregates). Do not implement this question's scope. UI placeholder: `description` field hidden in edit panel; row body fragment dropped.

---

**Q7 — Parent category (self-referencing FK).**
- Observed: Edit panel has a "Parent category" select with "None (top-level)" as the default. No nested categories visible in the row list (rows are flat 01–10 without indentation).
- Question: Are categories one-level (top-level only with optional parent for grouping) or deep (subcategory trees)? What's the depth limit?
- Hypotheses:
  (a) Single-level: `parentId` exists but UI/storefront only treats it as a tag for grouping in the breadcrumb.
  (b) Two-level (parent → leaf), enforced by the "None (top-level)" copy implying only one tier above.
  (c) Unlimited depth.

**Answer:** DEFERRED — see 06-scope-cut.md feature: Categories rich model (icon, description, parent, sort order, isActive, audit, slug-edit, aggregates). Do not implement this question's scope. UI placeholder: Parent category select hidden in edit panel.

---

**Q8 — Sort order.**
- Observed: Each row shows a 2-digit zero-padded `SORT` value (01–10); Edit panel field is labeled "Sort order" with mono 14/700.
- Question: Integer with manual entry, or auto-managed via the header "Reorder" drag mode? Range / uniqueness? What's shown for new categories (max+1, 0, NULL)?
- Hypotheses:
  (a) Manual integer, no uniqueness (ties broken by name).
  (b) Auto-assigned (`MAX(sortOrder) + 1` on insert), edited only via Reorder mode.
  (c) Both — manual override permitted; Reorder rebalances to a 1..N sequence.

**Answer:** DEFERRED — see 06-scope-cut.md feature: Categories rich model (icon, description, parent, sort order, isActive, audit, slug-edit, aggregates). Do not implement this question's scope. UI placeholder: Sort order column hidden; Sort order field hidden in edit panel.

---

**Q9 — `isActive` field & storefront semantics.**
- Observed: Status stamps ACTIVE / INACTIVE on rows; toggle in Edit panel labeled "Visible to buyers in storefront"; "Inactive" tab + KPI; "NEEDS REVIEW" stamp (separate concept).
- Question: Add `isActive boolean default true`. When false, does the storefront hide the category from `GET /api/categories`, hide its products, or just hide it from category-listings while keeping deep-link `/categories/<slug>` accessible?
- Hypotheses:
  (a) Hide from public list + 404 on `/categories/<slug>`.
  (b) Hide from public list, keep direct slug accessible.
  (c) Soft-hide: still listed, but greyed/labeled in storefront.

**Answer:** STUBBED — see 06-scope-cut.md feature: Categories rich model (icon, description, parent, sort order, isActive, audit, slug-edit, aggregates). Implement with placeholder: Hide from public list, keep direct slug accessible. Smallest behavioral change vs current public feed. Add `// TODO(post-v1):` comment at every touch point.

---

**Q10 — Audit ("created by / last edited by").**
- Observed: Edit panel shows "Created 12 Mar 2024 · Zaid Ahmed" and "Last edited 28 Apr 2026 · Zaid Ahmed".
- Question: Source of admin name?
  (a) New columns `createdBy` / `updatedBy` on `categories` referencing `user.id`, joined to `user.name`.
  (b) Read from existing `admin_audit_log` (`adminId`, `action`, `targetType='category'`, `targetId`) joined to `user`.
  (c) Hardcoded placeholder until audit log is wired.

**Answer:** DEFERRED — see 06-scope-cut.md feature: Admin audit log (writers + viewer feed). Do not implement this question's scope. UI placeholder: Audit block hidden in edit panel.

---

**Q11 — Per-row PRODUCTS / VENDORS counts.**
- Observed: Two new columns showing `productCount` and `vendorCount` per category.
- Question: Computed on every list request (cheap COUNT over `product_categories` + DISTINCT vendor_id JOIN to `products`), or cached/denormalized?
- Hypotheses:
  (a) Live SQL aggregate per request.
  (b) Materialized view or denormalized counter on `categories` updated via triggers/queue.
  (c) Visual placeholder, not real data yet.

**Answer:** DEFERRED — see 06-scope-cut.md feature: Categories rich model (icon, description, parent, sort order, isActive, audit, slug-edit, aggregates). Do not implement this question's scope. UI placeholder: PRODUCTS / VENDORS columns hidden.

---

**Q12 — Admin list endpoint (filtering, sorting, search, pagination).**
- Observed: Pencil filter row + sort dropdown + pagination footer; table shows page 1 of 2 (10 of 14).
- Question:
  - Promote to a separate `GET /api/admin/categories` (admin-only, gated by `requireAdmin`) with `?page=&limit=&q=&sort=&dir=&status=` query params, leaving public `GET /api/categories` untouched?
  - Or extend `GET /api/categories` with optional admin-side params?
  - Server-side filtering vs client-side with `useCategoriesQuery` returning the full list?

**Answer:** Promote to `GET /api/admin/categories` with `?page=&limit=&q=&sort=&dir=&status=` query params, mirroring existing `GET /api/admin/vendors` (`apps/web/src/app/api/admin/vendors/route.ts`). Public `GET /api/categories` stays untouched.

---

**Q13 — Delete (trash icon + Remove button).**
- Observed: Per-row `trash-2` icon (red) and Edit-panel "Remove" button (red outline). No confirmation dialog drawn.
- Question:
  - Add `DELETE /api/admin/categories/[id]`.
  - Hard delete or soft delete (`deletedAt`)?
  - What's the rule when the category has products attached via `product_categories` — block, cascade-detach (keep products, drop link), or refuse with 409?
  - Confirmation UX — modal `Dialog`, inline confirm-prompt, or none?

**Answer:** DEFERRED — see 06-scope-cut.md feature: Categories rich model (icon, description, parent, sort order, isActive, audit, slug-edit, aggregates). Do not implement this question's scope. UI placeholder: Trash + Remove affordances hidden.

---

**Q14 — "Reorder" header CTA + mobile tap-to-edit destination.**
- Observed: "Reorder" button in `cHd` (no drag-mode UI drawn). Mobile shows a hint "Tap any category to edit name, slug, icon, parent, sort order or status." with no destination drawn.
- Question(s):
  - **14a (Reorder):** Toggle drag-mode in-place (rows show drag handles, Save/Cancel appears) — modeled after the existing promo-banners reorder (`useBulkUpdateBannersMutation`)? Or a separate `/admin/categories/reorder` view?
  - **14b (Mobile edit target):** Same right-side Edit panel reused as a full-screen `Sheet`? A separate route `/admin/categories/[id]/edit`? Or expand the row inline?

**Answer:** Q14a — DEFERRED — see 06-scope-cut.md feature: Categories rich model (icon, description, parent, sort order, isActive, audit, slug-edit, aggregates). Do not implement this question's scope. UI placeholder: Hide Reorder button. Q14b — Same right-side Edit panel reused as a full-screen `Sheet` (mirrors buyer-account-drawer mobile pattern).

---

**Q15 — "Export CSV" header CTA.**
- Observed: Outline button with `download` icon.
- Question: Streaming CSV response from a new endpoint. Does export respect the current tab/search filter, or always emit the full set? Which columns are included (e.g. icon name, slug, parent slug, isActive, productCount, vendorCount)?

**Answer:** DEFERRED — see 06-scope-cut.md feature: Statement / CSV downloads (vendor ledger PDFs, admin exports). Do not implement this question's scope. UI placeholder: render visible but click is no-op (toast "Coming soon").

---

**Q16 — KPI definitions and deltas.**
- Observed: KPI cards show counts ("14", "12,840", "2", "3") and deltas ("+2 added this month", "+412 this month").
- Question:
  - "NEEDS REVIEW" predicate — `iconKey IS NULL OR description IS NULL`? Or `imageUrl IS NULL`? Or admin-flagged?
  - "+2 added this month" — `categories.createdAt >= startOfMonth()`? Rolling 30-day? Calendar month?
  - "+412 this month" — products created this month, or products added to a category this month?
  - Should KPI be live-aggregated on every page load, or cached?

**Answer:** DEFERRED — see 06-scope-cut.md feature: Categories rich model (icon, description, parent, sort order, isActive, audit, slug-edit, aggregates). Do not implement this question's scope. UI placeholder: render KPI cards with "—" or hide row.

---

**Q17 — Bulk-select target action.**
- Observed: Header checkbox + per-row checkboxes. **No action UI drawn** for the selected set.
- Question: What does selecting multiple rows enable?
- Hypotheses:
  (a) Bulk activate/deactivate (single `isActive` toggle on the selection).
  (b) Bulk delete.
  (c) Bulk export (subset of CSV).
  (d) Reorder-batch (move all to a sort range).
  (e) Decorative — not wired in v1.

**Answer:** DEFERRED — see 06-scope-cut.md feature: Categories rich model (icon, description, parent, sort order, isActive, audit, slug-edit, aggregates). Do not implement this question's scope. UI placeholder: bulk-select hidden.

---

**Q18 — "Add Category" → "Add category" copy change (sentence vs title case).**
- Observed: Pencil consistently uses sentence case for action labels ("Add category", "Save changes", "Export CSV"). Existing button text is title case ("Add Category").
- Question: Is the design system standardizing on sentence case for all button labels in admin? If so, this affects every admin button across the codebase (`Add Vendor`, `Add Banner`, etc.) — not just this screen.

**Answer:** Adopt sentence case across admin button labels; this is the new convention per Pencil.

---

**Q19 — Slug edit + breaking-change concern.**
- Observed: Pencil shows slug as a user-editable input with live URL preview "shalmi.pk/c/drinks". Existing implementation derives slug from name server-side (`slugForCategory(name)`).
- Question:
  - Allow user-editable slug, with uniqueness still enforced (existing 409)?
  - When a slug changes, do we need a redirect record so old `/categories/<old-slug>` URLs don't 404? (No `category_slug_history` table exists.)
  - Storefront URL is `/categories/<slug>` (per `getCategoryBySlug`); a redirect strategy is missing.

**Answer:** DEFERRED — see 06-scope-cut.md feature: Categories rich model (icon, description, parent, sort order, isActive, audit, slug-edit, aggregates). Do not implement this question's scope. UI placeholder: Slug field stays read-only (server-derived from name); no redirect table.

---

**Q20 — Trash icon + ellipsis-vertical overflow menu.**
- Observed: Action cell has 3 icons: pencil (edit, opens panel), trash-2 (red, delete), ellipsis-vertical (overflow menu).
- Question: What goes inside the overflow menu? It's not drawn.
- Hypotheses:
  (a) Duplicate, View on storefront, Move to parent, Reorder up/down.
  (b) Just View on storefront + Copy slug.
  (c) Only Delete (and trash icon is redundant).

**Answer:** DEFERRED — see 06-scope-cut.md feature: Categories rich model (icon, description, parent, sort order, isActive, audit, slug-edit, aggregates). Do not implement this question's scope. UI placeholder: Trash + ellipsis overflow hidden.

---

**Q21 — Removed columns (Image, Created date).**
- Observed: Pencil omits the row's "Image" column and "Created" column entirely.
- Question: Are these intentional removals (image replaced by icon swatch; created moved into Edit panel `cEMeta`), or should the existing `imageUrl`/`createdAt` continue to be shown somewhere?
- Hypotheses:
  (a) Intentional — fully replaced as drawn.
  (b) Created moves to a tooltip on row hover.
  (c) Image kept as a fallback when `iconKey IS NULL`.

**Answer:** Intentional — image swatch replaces image column; created moves into Edit panel.

---

**Q22 — "Visible to buyers in storefront" copy.**
- Observed: Edit panel status sublabel "Visible to buyers in storefront" — implies inactive categories are hidden from buyers but still managed by admin. Storefront does not currently filter on any active flag.
- Question: Confirm the buyer-side semantics tie exactly to `isActive` (not, e.g., a derived "has products" flag). And confirm the storefront `GET /api/categories` should add `WHERE isActive = true` while admin sees all.

**Answer:** STUBBED — see 06-scope-cut.md feature: Categories rich model (icon, description, parent, sort order, isActive, audit, slug-edit, aggregates). Implement with placeholder: confirm semantics tie exactly; storefront `GET /api/categories` adds `WHERE isActive = true`. Add `// TODO(post-v1):` comment at every touch point.

---

**Q23 — Status stamp values vs DB.**
- Observed: Three stamps used — ACTIVE / NEEDS REVIEW / INACTIVE. Pencil's general stamp inventory (DELIVERED, AT MNP HUB, PACKED, DELAYED, CANCELLED) does not include these category-specific labels — they are screen-local.
- Question: Treat ACTIVE / INACTIVE / NEEDS REVIEW as new screen-local stamp variants on the existing `Stamp` primitive (success / critical / warning intent), or extend the primitive's variant set with category-specific names? Per `02-design-inventory.md` Q9 the user said stamps are display-only mappings — so the visual variants `success`, `critical`, `warning` already cover this. Confirm.

**Answer:** STUBBED — see 06-scope-cut.md feature: Categories rich model (icon, description, parent, sort order, isActive, audit, slug-edit, aggregates). Implement with placeholder: ACTIVE / INACTIVE only; `NEEDS REVIEW` deferred. Use existing `Stamp` primitive `success` and `critical` variants. Add `// TODO(post-v1):` comment at every touch point.

---

**Q24 — Loading / empty / error / form-error states.**
- Observed: None drawn.
- Question: Should I extract per-state guidance from existing code (current skeleton, "No categories yet.", inline error row), retoken to the new design system, and ship as-is? Or is there a Pencil frame for these states elsewhere I should look at?

**Answer:** Extract from existing `CategoriesTableSkeleton`, "No categories yet." copy, inline error row; retoken to design system; ship as-is.

---

**Q25 — Audit panel for "Add" mode.**
- Observed: `cEMeta` audit block is part of the Edit panel — only meaningful for existing categories.
- Question: When the panel is in "Add" mode (Q4), is `cEMeta` hidden, replaced with an empty-state hint, or left visible with placeholders?

**Answer:** DEFERRED — see 06-scope-cut.md feature: Admin audit log (writers + viewer feed). Do not implement this question's scope. UI placeholder: Audit block hidden in edit panel (both Add and Edit modes).

---

**Q26 — "Catalog" sidebar grouping vs current sidebar.**
- Observed: The sidebar (`Ivd02`) in this Pencil frame is the admin-shell sidebar, not part of the screen body. But the breadcrumb implies a `Catalog` section that may need a sidebar group label.
- Question: Out-of-scope for this gap analysis (chrome, not screen) but flagging for cross-cutting work — is the admin sidebar getting a `CATALOG` section header above Categories (and Vendors? Banners?)?

**Answer:** STUBBED — see 06-scope-cut.md feature: Admin "Catalog" / "Operations" sidebar grouping (constants change only). Implement with placeholder: add `CATALOG` section eyebrow. Add `// TODO(post-v1):` comment at every touch point.

---

(End of gap analysis. Per workflow, this file is the only output of this
phase. Stopping here — no implementation.)

Answers propagated on 2026-05-02 from 06-scope-cut.md + 07-default-proposals.md
