# Gap Analysis — Vendor · Products

> **Phase:** Phase 4 screen revamp · gap analysis (read-only)
> **Date produced:** 2026-05-02
> **Pencil source:** `H7jii` (Desktop) / `tXG16` (Mobile) in `Pencil-Design/Shalmi`
> **Existing code source:** `apps/web/src/app/vendor/products/**`, `apps/web/src/modules/vendor/vendor-products/**`, `apps/web/src/app/api/vendor/products/**`, `packages/database/src/schema/products.ts`, `packages/schemas/src/catalog/product.ts`
> **Prerequisite reads:** `01-codebase-map.md`, `02-design-inventory.md` (esp. Q11 / Q12), `03-token-migration.md`, `04-design-system-implementation-log.md`, `screens/vendor-portal.md`

This is a discovery document. It identifies differences between the Pencil
designs and the existing implementation; it does not propose code. Per
CLAUDE.md, every implied-but-not-spec'd field, copy change, interaction, or
state becomes an open question (§5).

---

## 1. Layout & structure

### 1.1 Routing — collapse confirmed (per 02 §7 Q11)

**Pencil:** A single scrollable page contains the list AND the add/edit form.

**Existing code:** Three routes:
- `/vendor/products` — list (`apps/web/src/app/vendor/products/page.tsx` → `VendorProducts`)
- `/vendor/products/new` — bare wrapper around `AddProductForm`
- `/vendor/products/[id]/edit` — bare wrapper around `AddProductForm` prefilled

**Decision (already taken in 02 Q11):** collapse to a single route. The form
is visible only when (a) the user clicks "Add product" (empty form) or (b)
the user selects a product from the list (form prefilled with that product
in edit mode). Otherwise the form area is hidden / collapsed below the list.

**Implications for this gap analysis:**
- Both the Pencil "Add product" CTAs (desktop header `Add product`, mobile
  hero `+ Add`) become triggers that *reveal* the form section in-page,
  not navigation to a different URL.
- Each row's pencil/edit affordance (desktop ellipsis + pencil icon column;
  mobile ellipsis on each card) becomes the "select product" trigger.
- `/vendor/products/new` and `/vendor/products/[id]/edit` route files and
  the `getVendorProductEditPath()` helper become unused. (Removal is a
  Phase-implementation decision, not part of this analysis.)

### 1.2 Desktop layout (`H7jii`)

Pencil structure (1440w frame; main content area `P5bEr` is 1200w with
padding `[40, 48, 80, 48]`, gap 28):

1. **Top bar** (`vGjG0`, ink chrome — already documented in `vendor-portal.md`).
2. **Sidebar** (`ZyTbI`, 240w white — already documented).
3. **Main content** (vertical stack, gap 28):
   1. `czvPX` — Header (eyebrow + title + subtitle on left; `Import CSV`
      outline button + `Add product` green button on right).
   2. `oE8R2` — Stats segments (4-cell white card, internal `right:1`
      hairline dividers between cells, no shadow).
   3. `QuHOI` — Product table card (white, 1px rule, radius 12). Internal:
      filter bar → header row → 8 product rows → footer w/ paginator.
   4. `aMzDx` — Add-product title block (only visible in add/edit context).
   5. `Q01kX` — Add-product form card (only visible in add/edit context).
   6. `CH35C` — Add-product footer card (only visible in add/edit context).

Existing desktop layout (`apps/web/src/modules/vendor/vendor-products/index.tsx`):
- `<div class="space-y-6">` containing `ProductListPageHeader` and
  `ProductTable`. No stats segments. No filter bar inside the table card.
  No paginator. The form lives on a different route.

### 1.3 Mobile layout (`tXG16`)

Pencil structure (420w frame, vertical stack):

1. `N9Zo5` — App bar (ink, page title + bell + avatar).
2. `VGVaJ` — Hero card (paper bg, bottom hairline): eyebrow (`CATALOG · 47
   ACTIVE`) + `Your products` H1 + compact `+ Add` green button + 44h
   search input. Padding `[20,16,16,16]`, gap 12.
3. `B7sK9` — Filter chip row (4 chips: `All 54` / `Active 47` / `Low stock
   3` / `Drafts`). Padding `[14,16,4,16]`, gap 8.
4. `DKN8C` — Product list (6 cards). Padding `[14,16,18,16]`, gap 12.
5. `m35oBN` — Add product section (only visible in add/edit context):
   `QniXJ` mapTitle + `fwlBS` Form card + `sBEVo` button stack
   (Submit / Save as draft / Cancel).
6. `lSsjh` — Bottom tab bar (Dashboard / Products / Orders / Ledger / More).

Existing mobile layout: same React tree as desktop (no responsive design
specific to mobile). The vendor layout shell (`vendor-layout`) renders the
sidebar inline — not a bottom tab bar.

### 1.4 List ↔ form coexistence on the same page

Pencil draws both list and form simultaneously. Per 02 Q11 the runtime UI
shows only one at a time (form gated on Add or row-select).

The Pencil header section (`czvPX`) stays visible at all times; the
Add-product title (`aMzDx` / `QniXJ`) replaces or appears below the table
+ stats card when the form is open. The exact toggle/transition is
**not** drawn — see open question.

---

## 2. Element-by-element diff

The `category` column uses these labels (per task spec):
`VISUAL_ONLY`, `COPY_CHANGE`, `NEW_FIELD`, `REMOVED_FIELD`, `NEW_INTERACTION`,
`CHANGED_INTERACTION`, `NEW_STATE`, `AMBIGUOUS`.

### 2.1 Page chrome / shell

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Desktop top bar (`vGjG0`, ink, "Vendor" badge, dark search 320w, bell, avatar+name+chevron) | `VendorSidebar` shell only — no top bar at all today | Whole top-bar pattern is new chrome. Out of scope for this gap analysis (covered by chrome revamp); listed for completeness. | NEW_INTERACTION |
| Desktop sidebar 240w white with sectioned nav (`OVERVIEW / CATALOG / OPERATIONS / ACCOUNT`) and Products active row using `paper-2` fill | `vendor-layout` sidebar (existing) | Sidebar revamp scope, not this screen. Listed for awareness — Products row gets the `paper-2` active fill per Pencil §3.7 and amber `8` badge on Orders row. | VISUAL_ONLY |
| Mobile bottom tab bar (`lSsjh`) — 5 tabs Dashboard / Products / Orders / Ledger / More | None today | Brand-new mobile chrome (already flagged in `02-design-inventory.md` §6 / Q19). Listed for context; out of scope here. | NEW_INTERACTION |

### 2.2 Page header

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Eyebrow `CATALOG · 47 ACTIVE` (mono 11/700, amber, letter-spacing 0.16) | None | Eyebrow is a new copy element that surfaces an "active products" count to the vendor. | NEW_FIELD / COPY_CHANGE |
| Title `Your products` (sans 32/600, ink, letter-spacing -0.02) | `My Products` (`text-2xl font-semibold`) | Copy: "Your" vs "My". Size change is design-system retoken (visual). | COPY_CHANGE |
| Subtitle `Edit prices, stock and visibility — changes go live immediately.` (sans 14, ink-2) | `Manage your product catalog and pricing tiers.` (`text-sm text-muted-foreground`) | Different copy and a different promise (Pencil claims "live immediately"; existing code currently re-validates the slug on save and may go through admin review per Pencil's add-product subtitle "appears in your catalog after admin approval"). | COPY_CHANGE / AMBIGUOUS |
| Header right: outline `Import CSV` button (white fill, ink-2, 1px rule, lucide `upload`, sans 13/600) | None | New CTA. No existing endpoint, no parser, no schema. | NEW_INTERACTION |
| Header right: green `Add product` button (green-2 fill, white, lucide `plus`, sans 13/700, radius 8) | Green `Add Product` button linking to `/vendor/products/new` | Copy: lower-cased `Add product` vs `Add Product`. Behavior changes per Q11: opens inline form instead of navigating. | COPY_CHANGE / CHANGED_INTERACTION |

### 2.3 Stats segments (4-cell card)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| `ALL PRODUCTS / 54` cell on `paper-2` highlight (mono 11/700 ink-3 eyebrow, mono 24/700 ink number) | None | New surface — surfaces total count. | NEW_FIELD |
| `ACTIVE / 47` cell (green-700 number) | None | New surface — surfaces active-product count. Requires a "status" concept that does not exist in DB. | NEW_FIELD |
| `LOW STOCK / 3` cell (red number) | None | New surface — surfaces low-stock-product count. Requires a "low-stock threshold" per product (or per vendor). | NEW_FIELD |
| `DRAFTS / 4` cell (ink-2 number) | None | New surface — surfaces draft-product count. Requires a "draft" status. | NEW_FIELD |
| Acting on a stats cell (click → filter table?) | None | Pencil shows static cells; not drawn as tappable. | AMBIGUOUS |

### 2.4 Product table — filter bar

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| 320w search input `Search products, SKU, brand…` (paper fill, 1px rule, lucide `search`, sans 13) | None | New control — table search. | NEW_INTERACTION |
| `All categories` dropdown (white, 1px rule, lucide `chevron-down`) | None | New control — category filter. | NEW_INTERACTION |
| `Status: any` dropdown | None | New control — status filter. Requires a status taxonomy. | NEW_INTERACTION |
| `Sort: newest` dropdown w/ `arrow-up-down` icon | API returns rows ordered by `desc(products.createdAt)` — implicit "newest first" with no UI to change it | Sort control exposed to user. | NEW_INTERACTION |

### 2.5 Product table — header row

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Header label `PRODUCT` (mono 11/700 ink-3, w380) | `Product` (default table-head style) | Visual + width change; copy uppercased mono. | VISUAL_ONLY |
| Header label `SKU` (w120) | None | New column. | NEW_FIELD |
| Header label `CATEGORY` (w140) | `Categories` (plural) | Singular vs plural; current code shows multiple categories with hover-card; Pencil row shows a single category string (e.g. `Tea & Beverages`). | COPY_CHANGE / CHANGED_INTERACTION |
| Header label `PRICE · PKR` (w120) | None | New column. Pricing currently lives only on price-tier rows in the form, not on the list. | NEW_FIELD |
| Header label `STOCK` (w90) | `Stock` (w20 in code = 80px) | Visual retoken; semantics unchanged. | VISUAL_ONLY |
| Header label `STATUS` (w120) | None | New column. | NEW_FIELD |
| Header label `ACTIONS` (right-aligned) | `Actions` (w80) | Visual + alignment change. Pencil shows 2 icon buttons; existing has a single `Edit` button. | VISUAL_ONLY / CHANGED_INTERACTION |
| (No `WEIGHT` column) | `Weight` (w24) — shows `{weightGrams}g` | Pencil omits weight from the table. Net weight still appears as a form field, but the list column is gone. | REMOVED_FIELD |
| (No `IMAGES` column) | `Images` (w20) — shows `{images.length}` | Pencil omits image count. Image is shown as the 48² thumbnail in the PRODUCT cell, not a separate column. | REMOVED_FIELD |

### 2.6 Product table — row body

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| 48² thumbnail in PRODUCT cell (paper-2 placeholder fill, 1px rule, radius 8) | None at row level — `images.length` count instead | Need a list-row thumbnail. | NEW_FIELD (visual surfacing of `products.images[0]`) |
| Product name (sans 13/600, ink) | Name (`font-medium`, default text size) | Visual retoken. | VISUAL_ONLY |
| Product **tagline** under name (sans 11, ink-3) — e.g. `Premium basmati rice · 5kg pack` | None | Pencil rows include a short tagline below the product name. There is no `tagline` / `description` / `subtitle` column on `products`. | NEW_FIELD |
| `SKU-8924` (mono 12/600, ink-2) | None | SKU is per-product, not in DB today. | NEW_FIELD |
| Category (single string `Grains & Pulses`) | `ProductCategoriesCell` — hover-card listing all category names | Pencil rows show one category. M2M relation in code allows N. | CHANGED_INTERACTION / AMBIGUOUS |
| Price `₨ 2,180` (mono 13/700 ink, "—" + ink-3 if draft) | None | List price column — displays a **single** price per product. Today `products` has no scalar price; pricing lives on `product_price_tiers`. (And per 02 Q12 the model migrates to "packs", which also does not have a single base price by default.) | NEW_FIELD |
| Stock cell — number colored: `red` if low, `ink` if active, `—` ink-3 for draft | `{product.stock}` plain integer | Coloring driven by status (low / active / draft). Requires the same status concept and the low-stock threshold. | CHANGED_INTERACTION |
| Status pill cell: `LOW STOCK` (red-bg / red text) / `ACTIVE` (green-bg / green-700 text) / `DRAFT` (paper-2 / ink-2 text). All mono 9/700 letter-spacing 0.12, radius 99 (pill), padding `[2,8]`. | None | New visual + new data field (status). Visually a small pill (not the rotated `Stamp` atom — see Q below). | NEW_FIELD / NEW_INTERACTION |
| Actions cell: 2 icon buttons (lucide `pencil` + lucide `ellipsis`), each radius 6, 1px rule, padding 6 | Single outline `Edit` button with `pencil` icon + text label | Two affordances vs one. Pencil's `pencil` icon-only button replaces the labeled Edit button. The `ellipsis` opens a row context menu (drawn but not specified). | CHANGED_INTERACTION / NEW_INTERACTION |

### 2.7 Product table — footer / paginator

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Footer label `Showing 1–8 of 54 products` (sans 12, ink-3) | None | New copy/state. | NEW_FIELD |
| Paginator: `chevron-left` button (1px rule, radius 6) + numbered pills `1` (active, ink fill, white text) `2` `3` + `chevron-right` button | None — `useVendorProductsQuery` fetches the full vendor product list with no pagination | New control + new query semantics (page size, page number). | NEW_INTERACTION |

### 2.8 Add-product title block (`aMzDx` / `QniXJ`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Eyebrow `NEW PRODUCT · DRAFT` (mono 11/700 green-700, letter-spacing 0.16) | None | New eyebrow. Implies new products are auto-saved as DRAFT. | NEW_FIELD / NEW_STATE |
| Title `Add a new product` (sans 28/800, ink) | `Add New Product` (h1 `text-2xl`, on `/new`) / `Edit Product` (on `/edit`) | Copy/casing change. The edit-mode title is not drawn separately in the Pencil pass — see Q below. | COPY_CHANGE / AMBIGUOUS |
| Subtitle `Fill these details, then save. The product appears in your catalog after admin approval.` | None | New copy. Implies an admin-approval gate that the existing code does **not** enforce — POST to `/api/vendor/products` directly creates a row visible to buyers (no approval workflow). | COPY_CHANGE / NEW_STATE |

### 2.9 Add-product form — left column / image upload (`Weyba`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Eyebrow `PRODUCT IMAGES` (mono 11/700 ink-3) | `Product images` field label (sans, default size) | Copy + style retoken. | COPY_CHANGE |
| Upload zone 200h, paper-2 surrounding card, white fill upload area, 1.5px rule-2 dashed-look stroke (drawn solid in Pencil), lucide `image-up` 36px ink-3 + `Drop a photo here or tap to upload` (sans 14/700) + helper `PNG, JPG · max 4 MB · 1000×1000 recommended` (mono 11) | `ImageUpload` component (existing reusable, posts to `/api/vendor/upload`) | Visual treatment redesigned; constraints (4 MB cap, 1000×1000 recommendation, PNG/JPG-only) are new copy and new validation. Existing upload route accepts whatever the multer/Supabase pipeline allows. | COPY_CHANGE / NEW_FIELD |
| 4 thumbnail slots in a row (`apThumbs`), first selected (ink stroke, paper-3 fill), others empty white | After upload, thumbnails render via `ProductImageThumbnail` (X button to remove). Multiple uploads supported. | Pencil shows an explicit 4-slot grid with one "primary" slot selected. The "primary image" concept is not in the existing schema — `products.images` is an array (jsonb) with no flag. | NEW_FIELD / NEW_INTERACTION |
| Amber tip card (`apTip` / `mapTip`): info icon + `Buyers see this image in the catalog. Use a clean, well-lit shot of the carton or pack.` (sans 12/600, amber, lineHeight 1.5) | None | Helper microcopy. | NEW_FIELD |

### 2.10 Add-product form — right column / fields (`Kovm4`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| `apF1` Product name field — label `Product name` + red mono `Required` indicator + input "Lays Family Pack · Carton of 30" + helper `Use the brand + variant + pack size. Buyers search this exact text.` | `Product name` (`FieldLabel` + `Input`) — no required marker, no helper microcopy | Required-marker visual + helper copy are new. Validation already requires name (Zod `min(3).max(255)`). | COPY_CHANGE / VISUAL_ONLY |
| `apF2` SKU field — label `SKU` + input `LFP-30` + auto pill (`Auto`, sparkles icon, paper-2 chip) | None | New field. Auto-pill suggests an auto-generation affordance (slug-like) that does not exist. | NEW_FIELD / NEW_INTERACTION |
| `apF3` Brand field — label `Brand` + input "Lays" | None | New field. | NEW_FIELD |
| `apF4` Category field — label `Category` + select with category icon swatch (paper-2 → green-bg) and lucide `cookie` icon for "Snacks" + chevron | Categories field — multi-select via Checkbox grid | Pencil shows a **single-select** dropdown with a category icon. Existing model is M2M (`product_categories`). | CHANGED_INTERACTION / REMOVED_FIELD (multi-select) |
| `apF5` Pack size (units) field — label `Pack size (units)` + input `30` (mono, integer) | None | New field — units per pack. Per 02 Q12 the model is moving from tier-based to pack-based pricing. | NEW_FIELD |
| `apF6` Net weight field — label `Net weight` + input `4.5` (mono, decimal — units presumably kg or product-specific) | `Weight (grams)` field — integer grams via `weightGrams: z.number().int().positive()` | Copy "Net weight" vs "Weight (grams)"; Pencil shows `4.5` which is decimal. Unit (kg? grams? lbs?) not labelled. | COPY_CHANGE / CHANGED_INTERACTION / AMBIGUOUS |
| `apPriceSec` Pricing card — eyebrow `PRICING` + helper `Buyers see the wholesale price` | None (existing form has "Pricing tiers" section header) | Copy + structural change — pricing now lives in a paper-2 card. | VISUAL_ONLY / COPY_CHANGE |
| `apF7` MRP (Rs.) field — label + input `3,200` (mono, sans-700) | None | New field — manufacturer's retail price. | NEW_FIELD |
| `apF8` Wholesale price (Rs.) field — label + input `2,640` (mono, primary, ink stroke 1.5px) | None — closest is the per-tier `price` field | Single scalar wholesale price replaces the variable tier list. Per 02 Q12, schema moves to packs. | NEW_FIELD / REMOVED_FIELD (tier model) |
| `apBundleHd` Bundle pricing block — title `Bundle pricing (optional)` + helper `Reward buyers who order more cartons — give a small per-unit discount.` | "Pricing tiers" header | Copy + framing change. | COPY_CHANGE |
| `apBd1`/`apBd2`/`apBd3` Bundle tier cards — `BUY 6 / 2,580 / −2.3%`, `BUY 12 / 2,510 / −4.9%` (selected, ink fill), `BUY 24 / 2,420 / −8.3%`. Each card is mono 9/700 eyebrow + mono 13/700 price + mono 10/600 percentage. | `Pricing tiers` field array — `{ minQty, maxQty (nullable), price }` rows with Add/Remove and Zod validation (`minQty`+1 chain, prices strictly decreasing) | Per 02 Q12: tier model becomes pack model. Each card represents a discrete pack quantity (6 / 12 / 24) with its own price; per-unit discount is a derived display vs the wholesale price. The existing min-qty/max-qty/range concept is gone; existing `productPriceTiers` table layout no longer fits. | CHANGED_INTERACTION / NEW_FIELD / REMOVED_FIELD |
| `apBdAdd` "Add tier" button (paper-2 fill, 1.5px rule-2, plus icon, sans 11/600) | "Add Pricing Tier" button (secondary variant) | Copy + visual change. | COPY_CHANGE / VISUAL_ONLY |
| `apF9` Stock count field — label `Stock count` + input `60` + helper `cartons` (mono 11 ink-3) | `Stock` field — integer | Copy change ("Stock count" vs "Stock"). Suffix label `cartons` is new. The unit (`cartons`) implies stock is measured in cartons, not units; existing `products.stock` is an unscaled integer. | COPY_CHANGE / NEW_FIELD / AMBIGUOUS |
| `apF10` Low-stock alert field — label `Low-stock alert` + input `10` + helper `alert at` | None | New field — per-product low-stock threshold. Drives the LOW STOCK pill on the list and the `LOW STOCK 3` segment. | NEW_FIELD |
| `apF11` Restock lead time field — label `Restock lead time` + input `3` + helper `days` | None | New field. | NEW_FIELD |
| `apStat` Visibility toggle — title `Visibility` + subtitle `Drafts stay hidden until you mark them active` + segmented `ACTIVE` / `DRAFT` (DRAFT selected on this frame, ink fill / white text) | None | New control. Implies a `status: 'active' \| 'draft'` field on `products`. | NEW_FIELD / NEW_INTERACTION / NEW_STATE |

### 2.11 Add-product footer card (`CH35C`) / mobile button stack (`sBEVo`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Footer left: `info` icon + `Saved automatically as draft. Submit when ready.` (ink-3 sans 13) | None | New microcopy. Implies autosave behavior that does **not** exist (form only persists on explicit submit). | NEW_INTERACTION / NEW_STATE / COPY_CHANGE |
| Footer right: `Cancel` button (1.5px rule-2, ink, sans 14/600) | None — existing form has only the submit button; cancel = navigate back | New explicit Cancel button. With Q11 collapse to one route, "Cancel" closes the form rather than navigating. | NEW_INTERACTION |
| Footer right: `Save as draft` button (white fill, 1.5px rule-2, ink, sans 14/600) | None | New action — save as draft without submitting. Matches the `DRAFT` visibility default. | NEW_INTERACTION / NEW_STATE |
| Footer right: `Submit for approval` green button (green-2 fill, white, lucide `check`, sans 14/700) | `Create product` / `Update product` button (default green) | Copy change ("Submit for approval"). Implies an approval workflow with a non-active intermediate status (e.g. `pending_review`). The existing API immediately makes the product visible to buyers. | COPY_CHANGE / NEW_INTERACTION / NEW_STATE |
| Mobile: vertical button stack (Submit at top, Save as draft + Cancel side-by-side below) | Same form, no Cancel/Draft | Same content as desktop, different stacking. | VISUAL_ONLY (within the new buttons set) |

### 2.12 Mobile-specific elements

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Hero card — eyebrow + H1 + small `+ Add` button + 44h search | Same desktop component re-used | New mobile-only layout pattern. | VISUAL_ONLY (search itself = NEW_INTERACTION, see 2.4) |
| Chip row — `All 54` (ink active), `Active 47`, `Low stock 3` (red bg/red text/red stroke), `Drafts` (white) | None | New control. Same status taxonomy as desktop status filter. | NEW_INTERACTION |
| Product list cards (60² thumb + name + `SKU · ₨price` middle row + status pill bottom + ellipsis on right) | None — desktop table rendered on mobile too | New mobile pattern. Status pill on mobile uses different copy than desktop: `6 LEFT · LOW`, `2 LEFT · LOW`, `DRAFT · NOT LIVE` — vs desktop `LOW STOCK` / `DRAFT`. | NEW_INTERACTION / COPY_CHANGE |
| (No paginator drawn on mobile) | None | Pencil mobile shows 6 cards stacked vertically with no paginator or "load more". Whether this is finite (top 6) or infinite-scroll is not specified. | AMBIGUOUS |
| (No `Import CSV` button drawn on mobile) | None | Either intentionally desktop-only or just not drawn. | AMBIGUOUS |

---

## 3. Schema / type implications

This section enumerates schema/type/API changes implied by §2 rows in
`NEW_FIELD` / `REMOVED_FIELD` / `NEW_INTERACTION` / `NEW_STATE` categories.
Nothing here is proposed for implementation — it is a reference list for
the open questions in §5 to disambiguate.

### 3.1 Pack-based pricing model (per 02 Q12)

**Affected tables / schemas:**
- `packages/database/src/schema/products.ts` — currently has no scalar
  price; needs a `wholesalePriceCents` (and possibly `mrpCents`) column.
- `packages/database/src/schema/product-price-tiers.ts` — current shape
  (`minQty`, `maxQty`, `priceCents`) is a **range** model; the design is
  a **discrete pack-size** model. This table either gets renamed/replaced
  (e.g. `product_packs(id, productId, units, priceCents)`) or its columns
  change (drop `maxQty`; rename `minQty`→`units`). A migration is required.
- `packages/schemas/src/catalog/product.ts` — `createProductSchema` /
  `updateProductSchema` need new top-level fields (see below) and the
  embedded `tiers` validation (`createProductPriceTiersSchema`) becomes a
  pack-array validation (no decreasing-price-with-no-gaps; instead unique
  `units`, `priceCents` strictly decreasing as `units` increases is a
  reasonable invariant — but **not** spec'd by Pencil; flagged in Q11).
- `packages/schemas/src/catalog/product-price-tiers.ts` — likely deleted
  or reworked as `product-packs.ts`.
- API routes: `POST /api/vendor/products`, `PATCH /api/vendor/products/[id]`
  consume the new schema. The transactional insert/update (which today
  inserts into `product_price_tiers`) needs to switch to the new table.
- Hooks `useCreateProductMutation`, `useUpdateProductMutation`,
  `useVendorProductQuery` consume the new shape.
- `AddProductForm` field array (`tiers`) becomes `packs`; `useFieldArray`
  semantics change (each pack is independent, not a chained range).
- The buyer PDP (out of scope here but noted in 02 §6) consumes packs.
- Cart line-item schema `packages/schemas/src/cart/line-item.ts` may need
  to record which pack a buyer picked.

**New product-level price fields:**
- `mrp` (Rs.) — `apF7`. Likely `mrpCents: integer`.
- `wholesalePrice` (Rs.) — `apF8`. Likely `wholesalePriceCents: integer`.
- These appear in `products` schema, not on the pack table.

### 3.2 Product status taxonomy (per 02 Q11 indirectly + screens/vendor-portal.md Q2)

Pencil surfaces three product statuses and one stats segment:
- `ACTIVE` — green-bg pill, green-700 text
- `LOW STOCK` — red-bg pill, red text
- `DRAFT` — paper-2 pill, ink-2 text
- `ALL PRODUCTS` — meta count

The Visibility toggle exposes `ACTIVE` / `DRAFT` only. `LOW STOCK` is
**derived** (it's a status pill on an active product whose stock is
≤ low-stock threshold).

The add-product subtitle says `appears in your catalog after admin
approval` and the submit button is `Submit for approval`, implying a
fourth status (`pending_review` or similar) that is not pictured as a
list pill. See Q9.

**Affected:**
- `packages/database/src/schema/products.ts` — needs `status` column (enum).
- `packages/schemas/src/catalog/product.ts` — `createProductSchema` likely
  defaults to `draft`; `updateProductSchema` accepts the toggle.
- `apps/web/src/app/api/vendor/products/route.ts` — POST flow may need to
  be split between "save draft" and "submit for approval" (or a single
  endpoint with `status` in body).
- Filter UI consumes `status` enum; list query becomes paginated +
  filterable + sortable.

### 3.3 Per-product fields not in the existing schema

| Field | Pencil source | Suggested type (not yet decided) |
|---|---|---|
| `sku` | `apF2` (with auto-pill suggesting auto-gen) | `text` — unique per vendor? (Q14) |
| `brand` | `apF3` | `text` |
| `tagline` / `subtitle` | row-level under name (e.g. `Premium basmati rice · 5kg pack`) | `text` |
| `packSizeUnits` | `apF5` ("Pack size (units)") | `integer` — but see Q5 — confused with the `apBundles` pack tier `units` |
| `netWeight` | `apF6` ("Net weight"), shows decimal | `numeric(10,2)`? Unit unspecified (Q6) |
| `lowStockThreshold` | `apF10` ("Low-stock alert") | `integer` |
| `restockLeadTimeDays` | `apF11` ("Restock lead time") | `integer` (days) |
| `mrpCents` | `apF7` | `integer` |
| `wholesalePriceCents` | `apF8` | `integer` |
| `status` | `apStat` toggle + admin-approval text | enum `'draft' \| 'active' \| 'pending_review'?` |
| primary-image flag | `apThumbs` first-slot selected | optional — could store `images[0]` as primary |

### 3.4 List query / pagination

- `GET /api/vendor/products` currently returns the full list ordered by
  `desc(createdAt)`. Pencil shows `Showing 1–8 of 54 products` with a
  paginator → query needs `page`, `pageSize` and a `total`.
- Filters: search query string, category id, status, sort.
- `useVendorProductsQuery` + `VendorProductQueryKeys` change to include
  filter params in the key.
- Mobile chip row uses the same status filter; counts (`All 54`, `Active
  47`, `Low stock 3`) are aggregate KPIs likely reused from the stats card
  → either a separate aggregation endpoint (`GET /api/vendor/products/stats`)
  or returned alongside the list payload.

### 3.5 CSV import

- Pencil header has `Import CSV` button; no flow / template / endpoint is
  drawn. Implementation requires:
  - A new endpoint (e.g. `POST /api/vendor/products/import`) that parses
    CSV and either creates products in bulk or returns a preview.
  - A schema for one row of the CSV (which subset of fields).
  - A modal/sheet UI for upload + result display (not drawn in Pencil).
- See Q4.

### 3.6 Image upload constraints

- Pencil upload zone copy reads `PNG, JPG · max 4 MB · 1000×1000 recommended`.
- Existing `POST /api/vendor/upload` route — content-type / size validation
  not inspected in this gap analysis. Constraints in copy may or may not
  match server enforcement.
- A "primary image" flag on the row would influence list-row thumbnail
  selection (Pencil shows the first slot selected). Otherwise `images[0]`
  is implicitly primary.

### 3.7 Approval workflow (per 2.8 / 2.11)

The "Submit for approval" CTA + "appears in your catalog after admin
approval" subtitle imply an admin moderation step. Today there is no
admin product moderation surface in the codebase (no admin route, no
moderation table, no `pending` enum value). See Q9.

### 3.8 Autosave (per 2.11 footer info text)

"Saved automatically as draft" implies background save while editing.
The existing form persists only on submit. See Q10.

---

## 4. Behavior implications

### 4.1 Route consolidation (Q11 already answered — listing affected code)

- `apps/web/src/app/vendor/products/new/page.tsx` — becomes unused.
- `apps/web/src/app/vendor/products/[id]/edit/page.tsx` — becomes unused.
- `apps/web/src/modules/vendor/vendor-products/constants/routes.ts`
  (`getVendorProductEditPath`) — becomes unused.
- `ABSOLUTE_ROUTES.VENDOR_PRODUCTS_NEW` — becomes unused (verify by grep
  before deletion).
- `ProductListPageHeader` — `Add Product` link becomes a button that
  toggles inline form state.
- `ProductTable` row's `Edit` button — becomes a row click / pencil icon
  that toggles inline form state with the selected product id.
- `AddProductForm` — its parent in the new world is the screen page, not
  per-route wrappers. The `useEffect` that resets the form on
  `product?.id` change still works; the form must additionally reset on
  "Add product" (empty defaults) and on "Cancel" (clear).
- `useAddProductForm` — `router.push(ABSOLUTE_ROUTES.VENDOR_PRODUCTS)` at
  the end of submit becomes a state reset / list refresh instead.

### 4.2 Filter / search / sort interactions

- The filter bar on the desktop table card (search + category + status +
  sort) and the chip row + search on mobile both feed the same
  `useVendorProductsQuery`. Choices to make:
  - URL-as-state via `nuqs` (existing pattern in the repo) vs local state.
  - Debouncing for the search input (existing repo has no shared
    debounce utility — verify).
  - The chips on mobile imply that "Drafts" filter excludes active and
    low-stock; so chip selections may be **mutually exclusive** with the
    desktop status dropdown. Or chips could implicitly compose (`All` +
    `Active` count differ by status). Pencil draws them as four discrete
    buttons; only `All` is highlighted. See Q3.

### 4.3 Paginator (desktop)

- Each pagination affordance (1 / 2 / 3, prev/next chevrons) is a click
  target updating `page`. Page size in the design is **8** (footer copy
  `Showing 1–8 of 54 products` and 8 rows drawn).
- Prev chevron is drawn at page 1 — its disabled state is not drawn.
- Mobile has no paginator drawn; whether mobile uses infinite-scroll,
  fixed page size, or "Load more" is not specified. See Q12.

### 4.4 Status filter chips vs status dropdown

- Desktop has both a `Status: any` dropdown (filter bar) and (separately)
  the stats-segments cells. Whether the segments are clickable filter
  shortcuts is not drawn — Pencil shows them as plain text/numbers. See
  Q1.
- Mobile chip row replaces both — there is no "Status: any" dropdown on
  mobile.

### 4.5 Image upload — "primary image" selection

- The 4-thumb strip with the first slot highlighted suggests the user can
  re-order or pick a primary image. Existing `ImageUpload` adds to the
  end of `images[]`; no reorder UI exists.
- See Q15.

### 4.6 Add-product status / approval / autosave

- "Saved automatically as draft" + "Submit for approval" + "Save as draft"
  implies three behaviors:
  - **Autosave** (background) → `PATCH /api/vendor/products/[id]` after
    debounced field changes once the product has been created the first
    time as a draft.
  - **Save as draft** (explicit click) → POST with `status: draft`.
  - **Submit for approval** → PATCH `status: pending_review` (or POST
    with `status: pending_review`).
- The `Cancel` action with unsaved changes is undefined (does it discard
  the autosaved draft? does it revert?). See Q10.

### 4.7 Mobile bottom tab bar coexistence

- Mobile vendor pages show a bottom tab bar (`lSsjh`). Padding-bottom for
  scroll content must reserve tab-bar height (~69px) — but that is a
  layout-level concern owned by the mobile vendor shell, not this screen.

### 4.8 Edit-mode entry on the same page

- On clicking a row's pencil icon (or the `ellipsis` then "Edit" — the
  ellipsis menu is not drawn), the form section reveals with prefilled
  data. The visual transition (collapse/expand, scroll into view) is
  not drawn. See Q13.

### 4.9 Discrete-pack pricing UI

- The `apBundles` row shows three discrete pack cards (BUY 6 / BUY 12 /
  BUY 24) and an `Add tier` slot. Each card shows units, a price, and a
  derived `−X.X%` discount-vs-wholesale.
- No min/max range concept. No first-tier-must-start-at-1 invariant. No
  decreasing-price-strict invariant explicitly drawn (the example *is*
  decreasing, but the design intent is unclear — see Q11).
- Removing a pack tier (drawn `apBundles` shows an Add slot but no remove
  button) is not specified.
- Pack card "selected" state (BUY 12 ink-fill in the example) — is this a
  preview of "selected by default in cart" or just a visual hierarchy
  choice? See Q11.

### 4.10 List-row category cell

- Pencil rows show one category string (e.g. `Tea & Beverages`). Existing
  `product_categories` is M2M — a product can belong to N categories. The
  add-product Category field is also a single-select dropdown in the
  design.
- See Q7.

---

## 5. Open questions for me

Numbered. Each row from §2 with a non-`VISUAL_ONLY` category becomes a
question (questions are grouped by theme to keep the count tractable, but
every diff is captured below).

### 5.1 Page header / chrome

**Q1 — Stats segments interactivity.**

- *Observed in design:* `oE8R2` shows 4 cells (`ALL`, `ACTIVE`,
  `LOW STOCK`, `DRAFTS`) inside a single bordered card. No hover state,
  no link affordance is drawn. The first cell (`ALL`) has a `paper-2`
  background highlight; the others are white.
- *Observed in code:* No equivalent; status concept does not exist.
- *Question:* Are the 4 stats cells purely informational, or are they
  click targets that filter the table to that status?
- *Hypotheses:*
  (a) Static — cells display KPIs only; filtering happens via the
  `Status: any` dropdown on the filter bar.
  (b) Tappable — clicking a cell sets the status filter (the `paper-2`
  highlight on `ALL PRODUCTS` would then represent "currently selected").
  (c) Tappable but visual highlight in the design is the *default*
  visual treatment of the leftmost cell, not a "selected" state.
**Answer:** Tappable — clicking a cell sets the status filter; `paper-2` highlight = currently selected.

**Q2 — Header subtitle copy/promise.**

- *Observed in design:* `Edit prices, stock and visibility — changes go
  live immediately.`
- *Observed in code:* `Manage your product catalog and pricing tiers.`
  + the rest of the design (`Submit for approval`, `appears in your
  catalog after admin approval`) implies an approval gate.
- *Question:* Is the subtitle promise ("changes go live immediately")
  literal — i.e. updates to existing active products bypass review and
  ship to buyers — while only **new** product creation goes through
  admin approval? Or is the copy a placeholder?
- *Hypotheses:*
  (a) Edits to existing approved/active products go live immediately;
  the approval gate is only on first creation (status transitions
  `draft → pending_review → active`).
  (b) Both creation and edits go through review.
  (c) Subtitle is placeholder copy — confirm wording before adopting.
**Answer:** DEFERRED — see 06-scope-cut.md feature: Vendor add-product approval workflow + autosave (draft → pending_review → active). Do not implement this question's scope. UI placeholder: edits go live immediately; "Submit for approval" copy adjusted to "Save product"; subtitle keeps "changes go live immediately".

**Q3 — Mobile chip row vs desktop status dropdown.**

- *Observed in design:* Desktop has a separate `Status: any` dropdown +
  4 stats cells. Mobile has only a chip row with `All 54 / Active 47 /
  Low stock 3 / Drafts`.
- *Observed in code:* No status filter exists.
- *Question:* On desktop, do the chips appear at all, or is the desktop
  filter strictly the dropdown? On mobile, are the chips mutually
  exclusive (selecting `Active` shows only active and disables `Low
  stock`)? Note: a low-stock product is by definition also active.
- *Hypotheses:*
  (a) Desktop: dropdown only. Mobile: chips only. Both filter the same
  status field; "Low stock" is a derived status that excludes `active`
  ones with stock above threshold.
  (b) Mobile chips are mutually exclusive single-select; desktop dropdown
  is single-select.
  (c) Chips are multi-select toggles.
**Answer:** Desktop: dropdown only. Mobile: chips only. Both filter the same `status` field; "Low stock" is a derived status (active + stock ≤ threshold).

### 5.2 Stats cells / counts (NEW_FIELD on each cell)

**Q4 — `Import CSV` flow.**

- *Observed in design:* Outline `Import CSV` button in the desktop
  header (no upload flow, modal, or template drawn).
- *Observed in code:* No endpoint, no parser, no UI.
- *Question:* What's in scope? The button without a flow can't be
  wired.
- *Hypotheses:*
  (a) Out-of-scope this revamp; render the button disabled with a
  tooltip "Coming soon".
  (b) Implement a basic flow (modal with file picker, server-side CSV
  parse with a fixed column set).
  (c) Drop the button entirely from this revamp.
**Answer:** User answer: A4: column surface should be decided based on vendor product form so that all needed fields are populated. add a modal for the upload surface, following design.

### 5.3 Schema (NEW_FIELD per row in §2 → questions)

**Q5 — `Pack size (units)` field semantics vs Bundle pricing tiers.**

- *Observed in design:* `apF5` "Pack size (units)" with value `30`.
  Below, `apBundles` shows `BUY 6 / BUY 12 / BUY 24` cards.
- *Observed in code:* No "pack size" concept; tiers use min/max-qty
  ranges.
- *Question:* Is `Pack size (units)` the **base unit** of one carton
  (e.g. one carton = 30 individual chip bags), and `BUY 6` etc. mean
  "buy 6 cartons"? Or is `Pack size (units)` itself the smallest pack
  the buyer can purchase, and the BUY-N cards are multiples of that
  unit?
- *Hypotheses:*
  (a) Pack size = units inside one wholesale unit (descriptive only);
  BUY-N cards are number of wholesale units ordered together.
  (b) Pack size is the minimum buy quantity; BUY-N tiers are bulk
  discount cards on top.
  (c) Pack size is per-row metadata used only on the buyer PDP and is
  not enforced server-side.
**Answer:** STUBBED — see 06-scope-cut.md feature: Pack-based pricing schema migration (replaces tier-band model). Implement with placeholder: `packSize` is units inside one wholesale unit (descriptive); `BUY-N` cards are number of wholesale units. Add `// TODO(post-v1):` comment at every touch point.

**Q6 — `Net weight` field unit + scale.**

- *Observed in design:* `apF6` "Net weight" with value `4.5` (mono,
  decimal). No unit suffix shown in input; helper text absent.
- *Observed in code:* `weightGrams: integer` with default 500.
- *Question:* What unit is `4.5`? Likely kg (carton net weight). Is the
  database column changing from grams to kg, or is the frontend
  converting kg → g for storage? And is the field still mandatory?
- *Hypotheses:*
  (a) Display kg, store grams (i.e. multiply by 1000 on submit). DB
  column unchanged.
  (b) Switch DB column to `netWeightKg numeric(10,3)` (or grams unchanged
  but UI scales to kg).
  (c) Add a unit selector (kg/g/lbs/oz).
**Answer:** STUBBED — see 06-scope-cut.md feature: Pack-based pricing schema migration (replaces tier-band model). Implement with placeholder: display kg, store grams (multiply by 1000 on submit). DB column unchanged. Add `// TODO(post-v1):` comment at every touch point.

**Q7 — Category model: multi vs single.**

- *Observed in design:* The form shows a single-category dropdown (with
  category icon swatch). The list shows one category per row.
- *Observed in code:* `product_categories` is M2M; the form uses a
  Checkbox grid for multi-select; the list shows a hover-card listing
  all categories.
- *Question:* Are products restricted to one category in the new
  model, or can a product still belong to many but only the "primary"
  one is shown on the list?
- *Hypotheses:*
  (a) Drop the M2M relation; `products.categoryId` is a single FK to
  `categories`. (Migration drops `product_categories`.)
  (b) Keep M2M; designate `products.primaryCategoryId` (FK) for
  list/PDP display; multi-select stays in some other surface (admin?).
  (c) Keep M2M but UI restricts to single-select; first selected
  category becomes the "displayed" one.
**Answer:** Keep M2M; designate `products.primaryCategoryId` for list/PDP display; multi-select retained in admin or vendor form depending on UX. Smallest delta — no destructive migration.

**Q8 — `SKU` autogeneration (`Auto` pill).**

- *Observed in design:* `apF2` SKU input with a `paper-2` pill labeled
  `Auto` (sparkles icon) inside the input on the right.
- *Observed in code:* No SKU field.
- *Question:* What does the `Auto` affordance do? Generate an SKU from
  brand/name/pack-size on first focus? Toggle between auto and manual?
- *Hypotheses:*
  (a) Click `Auto` → server generates a unique SKU (e.g. `LFP-30` from
  Lays Family Pack pack-30). User can still type to override.
  (b) Auto pill is a status badge — the SKU was auto-generated on the
  server when the product draft was created; user has the option to
  edit.
  (c) The pill is purely decorative copy.
**Answer:** STUBBED — see 06-scope-cut.md feature: Vendor product enrichment fields (SKU, brand, tagline, low-stock threshold, restock lead time, packaging unit, MRP). Implement with placeholder: click `Auto` → server generates a unique SKU from brand/name/pack-size; user can override. Add `// TODO(post-v1):` comment at every touch point.

**Q9 — Status taxonomy + approval workflow.**

- *Observed in design:* Toggle exposes only `ACTIVE` / `DRAFT`. Add-form
  subtitle says `appears in your catalog after admin approval` and
  submit copy is `Submit for approval`. Stats cells include
  `LOW STOCK` (derived).
- *Observed in code:* No status field; products are visible the moment
  they're created.
- *Question:* What is the full status taxonomy and the legal transitions?
  Is there an admin moderation surface implied (this revamp does not
  include an admin product page in scope)?
- *Hypotheses:*
  (a) `draft → pending_review → active`, with `pending_review` having no
  list pill (or its own pill we're not yet shown). LOW STOCK is a
  derived display on top of `active`. Toggle in the form moves
  `active ↔ draft` only after first approval; "Submit for approval"
  performs `draft → pending_review`.
  (b) Two real statuses (`draft`, `active`) and `pending_review` is
  faked client-side only — the toggle directly publishes.
  (c) Three statuses and an admin product moderation queue is in scope
  for this revamp (would change Phase plan significantly).
**Answer:** DEFERRED — see 06-scope-cut.md feature: Vendor add-product approval workflow + autosave (draft → pending_review → active). Do not implement this question's scope. UI placeholder: two real statuses (`draft`, `active`); `pending_review` deferred; toggle directly publishes.

**Q10 — Autosave + Save as draft + Cancel + Submit semantics.**

- *Observed in design:* Footer info text `Saved automatically as draft.
  Submit when ready.` + three buttons (Cancel / Save as draft / Submit
  for approval). On mobile, Submit at top, Save-as-draft + Cancel
  side-by-side.
- *Observed in code:* No autosave; one submit button creates or updates.
- *Question:* What is each button's contract?
- *Hypotheses:* (Behavior table — pick one or describe a fourth.)
  (a) **Autosave-first**: editing a new product immediately POSTs a
  `status: draft` row; subsequent field changes PATCH that row. `Save as
  draft` is a no-op visual confirmation. `Submit for approval` PATCHes
  status. `Cancel` discards the unsubmitted draft (deletes the row).
  (b) **Explicit-save**: nothing persists until `Save as draft` or
  `Submit for approval`. The footer copy is aspirational/placeholder.
  `Cancel` discards in-memory changes only.
  (c) **Hybrid**: `Save as draft` and `Submit for approval` are explicit;
  autosave runs only after the first explicit save.
**Answer:** DEFERRED — see 06-scope-cut.md feature: Vendor add-product approval workflow + autosave (draft → pending_review → active). Do not implement this question's scope. UI placeholder: explicit-save — nothing persists until `Save as draft` or `Save product`. `Cancel` discards in-memory changes only. Footer autosave copy hidden.

**Q11 — Pack pricing card semantics.**

- *Observed in design:* Three pack cards `BUY 6 / 2,580 / −2.3%`,
  `BUY 12 / 2,510 / −4.9%` (selected ink fill), `BUY 24 / 2,420 / −8.3%`,
  plus an `Add tier` slot. No remove button. No min-quantity rule.
- *Observed in code:* `productPriceTiers` with min/max-qty range model
  + Zod-enforced "no gaps, prices strictly decreasing".
- *Question:* For the new pack model:
  - Is there a min-pack-count invariant (must offer `BUY 1` or whatever
    the pack-size unit is)? Is it auto-generated from the wholesale
    price (e.g. wholesale price = "BUY 1" implicitly)?
  - Does Pencil require the discount to be monotonically increasing
    with units?
  - Is there a remove affordance per card?
  - The `BUY 12` ink-fill — is it a "selected/recommended" state, a
    visual default, or unrelated?
- *Hypotheses:*
  (a) Wholesale price is `BUY 1` implicit; cards are `units → price`
  rows; vendor adds N cards; no monotonicity validation server-side; the
  ink-fill is purely visual hierarchy.
  (b) Wholesale price is a separate "list price"; the BUY cards are
  a discount ladder validated to be strictly decreasing per-unit;
  ink-fill is a "recommended pack" the vendor pins.
  (c) `BUY N` is a separate `recommended_pack_id` on the product (the
  highlighted card is the recommended one); other cards are alternate
  pack sizes the buyer can pick.
**Answer:** STUBBED — see 06-scope-cut.md feature: Pack-based pricing schema migration (replaces tier-band model). Implement with placeholder: wholesale price is `BUY 1` implicit; cards are `units → price` rows; vendor adds N cards; no monotonicity validation server-side; ink-fill is visual hierarchy only. Add `// TODO(post-v1):` comment at every touch point.

**Q12 — Mobile pagination / load behavior.**

- *Observed in design:* 6 cards drawn; no paginator; no "Load more"
  button.
- *Observed in code:* Single-shot full list query.
- *Question:* What is the load model on mobile?
- *Hypotheses:*
  (a) Infinite scroll fetching pages of 8 (or 6) under the hood.
  (b) Server returns only the top-N most recent (no pagination, capped
  list).
  (c) Fixed first page; user reaches more via desktop only.
**Answer:** Infinite scroll fetching pages of 8 under the hood.

**Q13 — Edit-form transition / Edit-mode title.**

- *Observed in design:* Add and edit share the same Pencil frame. The
  title is `Add a new product`. There is no separate "Edit product"
  variant drawn in this pass.
- *Observed in code:* `Add New Product` (h1, /new) and `Edit Product`
  (h1, /edit) — two different titles.
- *Question:* When the form is in edit mode, what does the title show?
  And: is there a transition (collapse, scroll, drawer, fade) when the
  form is revealed/dismissed?
- *Hypotheses:*
  (a) Title swaps to `Edit · {product name}`; transition is a smooth
  scroll to the form section.
  (b) Title stays `Add a new product` always (Pencil is the canonical
  intent); edit mode is identifiable only by prefilled fields.
  (c) Title becomes `Edit product` and the eyebrow reflects the current
  status (`ACTIVE · LIVE` or `DRAFT · NOT LIVE`).
**Answer:** Title swaps to `Edit · {product name}`; transition is a smooth scroll to the form section.

**Q14 — `SKU` uniqueness scope.**

- *Observed in design:* SKU input with `Auto` pill — single field per
  product, no validation copy drawn.
- *Observed in code:* No SKU; existing uniqueness is on `slug`.
- *Question:* Is `sku` unique globally, unique per vendor, or
  non-unique?
- *Hypotheses:*
  (a) Unique per vendor (a vendor can't have two products with the same
  SKU). Likely the right call.
  (b) Globally unique.
  (c) Non-unique; cosmetic identifier only.
**Answer:** Unique per vendor (a vendor can't have two products with the same SKU). Schema constraint: `UNIQUE (vendor_id, sku)`.

### 5.4 Image upload (NEW_FIELD / NEW_INTERACTION)

**Q15 — 4-slot thumb strip + primary-image flag.**

- *Observed in design:* `apThumbs` shows exactly 4 thumbnail slots — the
  first paper-3 with ink stroke (selected), others empty white. Mobile
  shows only a single upload zone (no slot strip).
- *Observed in code:* `images: jsonb[]` (no max), no primary flag,
  thumbnails render after upload via `ProductImageThumbnail` with X-to-
  remove.
- *Question:* What does the slot strip mean exactly? Is "4" a hard cap
  on images? Is the highlighted slot the "primary" image (used as list
  thumb / cart thumb / PDP hero)? Can the vendor reorder?
- *Hypotheses:*
  (a) Cap at 4. First slot is primary. Reorder via drag.
  (b) No cap; the strip is just a 4-up preview of the first 4 in the
  order they were uploaded; first is implicitly primary.
  (c) 4 named slots (front, back, in-context, ingredient), no reordering.
**Answer:** No cap; the strip is a 4-up preview of the first 4 in upload order; first is implicitly primary. Smallest delta — no schema change.

**Q16 — Upload constraints.**

- *Observed in design:* `PNG, JPG · max 4 MB · 1000×1000 recommended`.
  Mobile: `PNG, JPG · max 4 MB`.
- *Observed in code:* `POST /api/vendor/upload` (not inspected in depth).
- *Question:* Is the existing upload endpoint enforcing PNG/JPG and a
  4 MB cap, or does this revamp need to add validation?
- *Hypotheses:*
  (a) Current endpoint is permissive; the revamp adds size + mime
  validation server-side and matches the copy.
  (b) Current endpoint already enforces; copy is documenting reality.
**Answer:** Revamp adds size + mime validation server-side at `/api/vendor/upload`; matches the copy.

### 5.5 List columns (REMOVED_FIELD on `WEIGHT` and `IMAGES`)

**Q17 — Removed list columns: weight + image count.**

- *Observed in design:* The Pencil desktop table omits weight and image
  count.
- *Observed in code:* Existing table has both.
- *Question:* Are these intentional removals or just not drawn?
- *Hypotheses:*
  (a) Intentional removal — vendor doesn't need weight in the list
  surface; image count is replaced by the 48² thumbnail.
  (b) Hidden behind a "columns" picker we haven't seen drawn.
  (c) Just not drawn; should remain.
**Answer:** Intentional — vendor doesn't need weight in the list; image count replaced by 48² thumbnail.

**Q18 — Single-category list cell vs M2M.**

- *Observed in design:* Each row shows one category as a plain string.
- *Observed in code:* `ProductCategoriesCell` shows multiple via
  hover-card.
- *Question:* If the underlying model stays M2M (Q7 (b)), should the
  list show the primary category only? Or all categories joined? See Q7
  for the upstream decision.
**Answer:** Show `primaryCategoryId` only on the list (per Q7).

### 5.6 Action affordances on each row

**Q19 — `pencil` icon vs `ellipsis` icon — what does each do?**

- *Observed in design:* Two icon-only buttons per row: pencil (edit) +
  ellipsis (menu). The ellipsis menu's contents are not drawn.
- *Observed in code:* Single labeled `Edit` button.
- *Question:* What's in the ellipsis menu?
- *Hypotheses:*
  (a) Duplicate, Archive/Delete, Mark out of stock, View as buyer.
  (b) Status transitions (Submit for approval / Activate / Deactivate)
  not exposed elsewhere.
  (c) The ellipsis is decorative — only the pencil icon is wired to
  open the edit form.
**Answer:** Ellipsis decorative for now; only the pencil icon is wired to open the edit form. Smallest delta.

**Q20 — Mobile ellipsis on each card.**

- *Observed in design:* Mobile cards show only an ellipsis (no pencil).
- *Observed in code:* No mobile design.
- *Question:* Is tapping the card body the "open edit" action and the
  ellipsis is the secondary menu? Or is the ellipsis the only way to
  reach edit on mobile?
- *Hypotheses:*
  (a) Tap card → open edit; ellipsis → menu with Duplicate/Delete/etc.
  (b) Ellipsis-only — opens a sheet menu that has "Edit" as the first
  item.
**Answer:** Tap card body → open edit; ellipsis → secondary menu (currently empty / decorative).

### 5.7 Mobile-only differences

**Q21 — Mobile status pill copy differs from desktop.**

- *Observed in design:* Mobile cards show `6 LEFT · LOW`, `2 LEFT · LOW`,
  `DRAFT · NOT LIVE`. Desktop shows `LOW STOCK`, `ACTIVE`, `DRAFT`.
- *Observed in code:* No status pills at all.
- *Question:* Are these two pill systems intentionally different (mobile
  prioritizes the urgent number-left signal; desktop has a bigger
  surface area for a static label), or should one be canonical for the
  status field and the other a derived presentation?
- *Hypotheses:*
  (a) Same status enum; presentation differs by surface (desktop = label
  only, mobile = label + count when applicable).
  (b) Two presentations for the same data, owned by per-surface code.
  (c) Reconcile to one wording (e.g. `LOW · 6 LEFT`) on both.
**Answer:** Same status enum; presentation differs by surface (desktop = label only, mobile = label + count when applicable). Driven by helpers, not separate fields.

**Q22 — `Drafts` chip on mobile lacks a count, `Low stock` chip color
treatment.**

- *Observed in design:* Mobile chips: `All 54`, `Active 47`, `Low stock
  3` (red bg, red text, red stroke), `Drafts` (no number).
- *Question:* Why does `Drafts` omit a count? And is the red treatment
  on `Low stock` the correct visual for "filter chip" or only for "this
  count exists"?
- *Hypotheses:*
  (a) `Drafts` count is omitted because it can be 0; numbered chips
  show only when > 0.
  (b) Just an oversight — the count should be there.
  (c) `Low stock` red treatment is conditional on count > 0; otherwise
  it falls back to the white treatment.
**Answer:** `Drafts` count omitted when 0; numbered chips show only when > 0. Red treatment on `Low stock` is conditional on count > 0.

### 5.8 Footer / autosave / approval (NEW_INTERACTION + NEW_STATE)

**Q23 — `Cancel` button behavior in single-page mode.**

- *Observed in design:* `Cancel` outline button in the form footer.
- *Observed in code:* No equivalent.
- *Question:* Per Q11 there is only one route. What does Cancel do?
- *Hypotheses:*
  (a) Closes the form; if creating a new draft (autosaved per Q10), the
  draft remains and shows up as DRAFT in the list. If editing existing,
  reverts unsaved field changes.
  (b) Closes form and discards unsaved changes (including any autosave
  side-effects).
  (c) Closes form and prompts the user "Save changes? Discard?".
**Answer:** Closes form and discards unsaved changes (matches Q10 explicit-save model).

### 5.9 Add-product title eyebrow

**Q24 — Eyebrow `NEW PRODUCT · DRAFT` semantics.**

- *Observed in design:* Eyebrow `NEW PRODUCT · DRAFT` on `aMzDx`/`QniXJ`.
- *Observed in code:* No eyebrow at all.
- *Question:* Is the eyebrow dynamic (it reflects the live product
  status, e.g. `NEW PRODUCT · DRAFT` while editing a fresh row, then
  `EDIT PRODUCT · ACTIVE` once approved)? Or static?
- *Hypotheses:*
  (a) Dynamic, status-driven.
  (b) Static for new products only; edit mode hides the eyebrow.
  (c) Static "NEW PRODUCT · DRAFT" always — purely decorative copy.
**Answer:** Dynamic, status-driven (`NEW PRODUCT · DRAFT` for fresh row → `EDIT PRODUCT · ACTIVE` once saved active).

---

(End of gap analysis. Stopping here per instructions — no implementation
follows from this artifact.)

Answers propagated on 2026-05-02 from 06-scope-cut.md + 07-default-proposals.md
