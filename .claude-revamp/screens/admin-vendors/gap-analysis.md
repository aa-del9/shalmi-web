# Gap Analysis — Admin · Vendors

> **Phase:** Per-screen gap analysis (read-only)
> **Date produced:** 2026-05-02
> **Pencil source:** `Pencil-Design\Shalmi` — Desktop frame `H6Ch4T`, Mobile frame `Xmeb6`
> **Existing route:** `/admin/vendors` → `apps/web/src/app/admin/vendors/page.tsx` → `AdminVendors`
> **Existing module:** `apps/web/src/modules/admin/admin-vendors/`
> **Existing schema:** `packages/database/src/schema/vendors.ts`

This artifact catalogs only the differences. **No code is proposed.** Every
new/removed/changed field, interaction, or piece of copy below becomes a
numbered question in §5. Do not implement until those are answered.

---

## 1. Layout & structure

### Existing (today)
- **Single-page list with modal for edit/create.**
- Layout (`AdminVendors`, `apps/web/src/modules/admin/admin-vendors/index.tsx`):
  1. `VendorsPageHeader` — `<h1>Vendors</h1>` + subtitle "Manage vendors and their catalog." + "Add Vendor" button.
  2. `VendorsTable` — 6-column table (Shop Name / Phone Number / City / Market Hub / Status / Actions). Each row's "Edit" button opens a modal.
  3. `VendorsPagination` — "Page X of Y (N total)" + Previous/Next.
  4. `VendorDialog` — Radix `<Dialog>` (sm:max-w-md) for both create and edit. Loads vendor via `useVendorQuery` when `editingVendorId` is set.
- No KPI tiles, no filters bar, no search, no breadcrumb, no avatar/initial column, no "categories" or "limits" anywhere.
- No bulk-select, no Export CSV, no Bulk import.
- Status is a coloured text label only (`Active` / `Inactive`).

### Pencil (Desktop · `H6Ch4T`)
- **Two-column inline split (`vSplit`)**: data table on the left, **persistent right-side edit panel (`Edit panel`, 460w)** on the right. The dialog is gone.
- Top of main column is a **Breadcrumb** `Admin › Catalog › Vendors` (`Ajlxu/vBC`), then a **header row (`tS6Od/vHd`)** with title `Vendors` (32/800) + subtitle `"64 active · 2 inactive · 12 pending review · 8 new this month"`, right-aligned actions: **Export CSV** (outline), **Bulk import** (outline), **Add vendor** (green-2 primary).
- A **KPI row (`HAc7L/vKpi`)** with 4 stat cards: TOTAL VENDORS (78, with `+8 onboarded this month` trend), ACTIVE (64, green tile), PENDING REVIEW (12, amber tile), INACTIVE (2, red tile).
- A **filters card (`qoyML/vFil`)** with: pill tabs (All 78 / Active 64 / Pending 12 / Inactive 2), `Search by name or shop` field (paper-2 fill, 280w), `Bazaar: All` dropdown, `Sort: Newest first` dropdown.
- A **list card (`FD9R3/vListW`)** with header row + rows + footer:
  - Header columns: checkbox · VENDOR (sortable, arrow-down icon shown) · PHONE · BAZAAR · PRODUCTS · MONTHLY SALES · STATUS · (icon actions column).
  - 8 vendor rows. Row 1 (selected) uses `paper-2` fill; the rest are `white`. Each row: checkbox · circular SB-style initial avatar (green-bg) + Name (sans 14/700) + Shop subline (sans 12 ink-3) · phone (mono 12) · bazaar (sans 12/600) · product count (mono 13/700) · monthly sales (mono 13/700) · status stamp (rotated -1° pill) · pencil + ellipsis-vertical.
  - Footer (paper-2): `"Showing 1–8 of 78 vendors"` (mono) + Previous (outline) / Next (ink primary inverse).
- The persistent **Edit panel (`wujIR`, 460w, white card)** has its own header (paper-2, "Edit vendor" + `"Saleem Bhai · Saleem Snacks Co. · #VND-0142"` (mono 11) + close-X icon button), a long body, and its own footer (paper-2: Remove vendor outline-red on left; Cancel + Save changes on right).
- Edit-panel body sections, top-to-bottom (see §2 for field-level diff):
  1. Avatar card (paper-2): "SB" initial in green-bg circle (64×64) + eyebrow `"VENDOR LOGO"` + `"Initial avatar (auto)"` + helper `"Tap to upload custom logo"`.
  2. Row: Full name | Shop name (Full name has focus-style ink stroke, Shop name has rule-2 stroke).
  3. Address (textarea, 80h).
  4. Row: Phone number | Email.
  5. Row: MarketHub / Bazaar (dropdown) | Vendor ID (read-only paper-2 fill, paper-3 stroke).
  6. Categories handled — pill list with three filled `ink` pills ("Snacks" · "Imported chocolates" · "Confectionery"), each with an `x` icon, plus an outlined `+ Add category` pill.
  7. Status block (paper-2 card): "Status" + helper `"Visible to buyers · receives orders"` + segmented `ACTIVE / INACTIVE` toggle.
  8. Row: GST / NTN | Joined (read-only date with calendar icon, paper-2/paper-3).
  9. Monthly limit (Rs.) input, with helper `"Used Rs. 2,84,000 of Rs. 5,00,000 this month (57%)"`.
  10. Audit meta card (paper-2 + 1px rule): eyebrow `"AUDIT"`, three rows — `Onboarded by Zaid Ahmed · 12 Mar 2024` · `Last edited Zaid Ahmed · 28 Apr 2026` · `Lifetime sales Rs. 84,12,400` (green-700).

### Pencil (Mobile · `Xmeb6`)
- Single-column scroll. Ink top app-bar (`cbT30`).
- **`mvSub` sub-header (`Nle5d`, paper bg, 16px padding):** title "Vendors" 24/800 + subtitle `"78 total · 64 active · 12 pending"` + small green "+ Add" button. Below it: 3 KPI tiles (Active / Pending / Inactive — drops Total Vendors), a search field (paper-2, with `sliders-horizontal` filter icon at right and placeholder `"Search by name, shop or phone"`), and the same pill-tab row.
- **Vendor cards** (`gK27m`-style, white, radius 8, hairline): top row = avatar + Name + Shop subline + ellipsis-vertical; meta row = `map-pin` + bazaar, `phone` + phone (mono); 3-column stat strip with right hairlines (PRODUCTS / MO. SALES / ORDERS — note: ORDERS is shown on mobile only); two action buttons: outline `Edit` and ink-filled `Sales report`.
- **Edit sheet (`B72ukw/Edit sheet`)** — appears as a stacked card lower in the same flow (probably modeled as a bottom sheet / full-screen sheet on mobile). Has header `"Edit Saleem Bhai" + "#VND-0142"` + close button, body with: Name · Shop name · Phone · Address · MarketHub/Bazaar · Status block. Footer = Cancel/Save row + Remove vendor (destructive outline). **Mobile sheet does NOT show:** Email, Vendor ID, Categories, GST/NTN, Joined date, Monthly limit, Audit meta. (Subset of desktop edit panel.)

### Routing impact
- **Existing:** edit/create live in a `<Dialog>` on the same `/admin/vendors` route. Selecting a row sets local state `editingVendorId` + `dialogOpen`. URL never changes.
- **Pencil:** edit lives in a persistent right-hand panel that is part of the page itself. Selecting a row presumably populates the panel; an `Add vendor` button presumably resets it to a blank/create state.
- The Pencil design does **not** show URL/breadcrumb segments per-vendor (the breadcrumb stays `Admin › Catalog › Vendors`, and the panel header reads `#VND-0142` from local state). So this could be implemented either:
  (a) state-only (panel mirrors `editingVendorId` like today, just without a Dialog); or
  (b) URL-driven (e.g. `/admin/vendors/[id]`), to make panel state shareable/refresh-stable.
- See Q1 below.
- Mobile keeps a sheet/overlay pattern but stacks fewer fields than desktop — see Q2 (subset intentional?).

---

## 2. Element-by-element diff

> Categories: **VISUAL_ONLY** = retoken/restyle, no behavior or schema impact ·
> **COPY_CHANGE** = literal label/copy differs · **NEW_FIELD** = exists in design,
> not in DB/schema · **REMOVED_FIELD** = exists in code, not drawn in design ·
> **NEW_INTERACTION** = action implied that has no current handler · **CHANGED_INTERACTION** = same action, different code path implied · **NEW_STATE** = empty/loading/error/etc. that has no current behavior · **AMBIGUOUS** = design and brief disagree, OR cannot be resolved without explicit answer.

### 2.1 Page chrome / headers

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Breadcrumb `Admin › Catalog › Vendors` (`Ajlxu/vBC`) | None | No breadcrumb in code today. Where does "Catalog" come from? | **NEW_INTERACTION** |
| Page title `Vendors` (sans 32/800) | `VendorsPageHeader → <h1>Vendors</h1>` (`text-heading-lg font-semibold`) | Same word, different size/weight token. | VISUAL_ONLY |
| Subtitle `"64 active · 2 inactive · 12 pending review · 8 new this month"` | Subtitle `"Manage vendors and their catalog."` | Different copy and very different intent: design's subtitle is a derived live-stats summary; current is a static description. | **COPY_CHANGE** + **NEW_INTERACTION** |
| Header action: `Export CSV` (outline + download icon) | None | New action. No endpoint exists. | **NEW_INTERACTION** |
| Header action: `Bulk import` (outline + upload icon) | None | New action. No endpoint exists. | **NEW_INTERACTION** |
| Header action: `Add vendor` (green-2 primary, plus icon) | `Add Vendor` button (default) | Copy is `Add vendor` (lowercase v) vs `Add Vendor`. Visual changes covered by token migration. | COPY_CHANGE |

### 2.2 KPI row (`vKpi` desktop) / KPI tiles (`mvKpi` mobile)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Card "TOTAL VENDORS" — `78` mono 32/800, eyebrow `"+8 onboarded this month"` (green) | None | "Total vendors" count exists implicitly in `meta.totalCount`; "onboarded this month" trend does not. | **NEW_INTERACTION** |
| Card "ACTIVE" (green-bg) — `64`, helper `"82.1% of total"` | None | Active count not exposed by current API; `vendors.isActive` exists but no aggregate endpoint. | **NEW_INTERACTION** |
| Card "PENDING REVIEW" (amber-bg) — `12`, helper `"Awaiting verification"` | None | **There is no concept of "pending review" in the schema.** Current `isActive: boolean` only has Active/Inactive. The design implies a third status. | **NEW_FIELD** |
| Card "INACTIVE" (red-bg) — `2`, helper `"Hidden from buyers"` | None | Inactive count not exposed. | **NEW_INTERACTION** |
| Mobile drops "TOTAL VENDORS"; only Active / Pending / Inactive shown | n/a | Confirm tile set is intentional subset on mobile. | AMBIGUOUS |

### 2.3 Filters bar (`vFil` desktop) / mobile filter row

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Pill tabs `All 78 / Active 64 / Pending 12 / Inactive 2` (selected = ink fill) | None | No status filter today. Counts are derived; "Pending" needs the new status (see 2.2 PENDING). | **NEW_INTERACTION** + **NEW_FIELD** |
| Search field `"Search by name or shop"` (desktop), `"Search by name, shop or phone"` (mobile) | None | No search query parameter on `GET /api/admin/vendors`. | **NEW_INTERACTION** |
| Dropdown `"Bazaar: All"` (chevron) | None | No bazaar/hub filter today. (Schema has `vendors.hub`.) | **NEW_INTERACTION** |
| Dropdown `"Sort: Newest first"` (chevron) | None | No client- or server-side sort today. | **NEW_INTERACTION** |
| Mobile search has trailing `sliders-horizontal` (filter) icon | n/a | Implies a separate filter overlay/sheet on mobile. | **NEW_INTERACTION** |

### 2.4 List/table

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Header checkbox `vhcb` (lucide `square`) for select-all | None | Bulk selection is new — but no bulk actions are drawn in the visible header (only Export CSV / Bulk import in page header). What actions does selection enable? | **NEW_INTERACTION** + AMBIGUOUS |
| Per-row checkbox (`vR1cb`) | None | Same. | **NEW_INTERACTION** |
| Column `VENDOR` (with sort arrow-down) — avatar (initials, green-bg ring green-200) + Name (sans 14/700) + Shop name subline (sans 12 ink-3) | Column `Shop Name` (one cell, plain text, font-medium) | Adds avatar + a "name vs shop" two-line distinction. **The design treats vendor's *personal name* (`Saleem Bhai`) as the primary line and shop as the subline** — opposite of current schema where `shopName` is primary. | **NEW_FIELD** (vendor's personal/full name) + VISUAL_ONLY (avatar) |
| Column `PHONE` mono 12 — `+92 300 1234567` | Column `Phone Number` (sans default) | Same data, mono font, different label casing. | COPY_CHANGE |
| Column `BAZAAR` sans 12/600 (e.g. `"Sheedi Chowk"`) | Column `Market Hub` (sans default, e.g. `vendor.marketHub`) | Same data (`vendors.hub`) — column rename. Pencil values look like long bazaar names; existing values seen so far are short hub strings. | COPY_CHANGE |
| Column `PRODUCTS` mono 13/700 (e.g. `"248"`) | None | Per-vendor product count is not surfaced in `GET /api/admin/vendors`. (Could be a JOIN on `products` count.) | **NEW_FIELD** (in API response) + **NEW_INTERACTION** |
| Column `MONTHLY SALES` mono 13/700 (e.g. `"Rs. 2,84,000"`, with `"—"` and `"Rs. 0"` variants) | None | Monthly sales aggregate per vendor. Computable from `sub_orders` but not exposed today. The `—` value (e.g. for new vendors) and `Rs. 0` (for vendor with zero sales) suggest a tri-state: not-applicable / zero / numeric. | **NEW_FIELD** + **NEW_STATE** |
| Column `STATUS` — rotated -1° stamp `ACTIVE` (green) / `PENDING` (amber) / `INACTIVE` (red) | Coloured text `"Active"` / `"Inactive"` (no Pending) | Rotated stamp is the stamp atom (already shipped in `@repo/ui/components/stamp.tsx`). **Pending is a third status** not in current schema. | **NEW_FIELD** (Pending status) + VISUAL_ONLY (stamp) |
| Row actions: pencil icon + ellipsis-vertical | "Edit" outline button | Different affordance: glyph-only icon + a kebab-menu. The menu's contents are not drawn. | **NEW_INTERACTION** + AMBIGUOUS |
| City column (existing) | `Column City` | Not shown in the Pencil table. (Note: schema has `city`, current API/POST hardcodes `'Lahore'` — see Q21.) | **REMOVED_FIELD** |
| Selected/highlighted row uses `paper-2` fill | None | Visual selection state on the row that maps to the open edit panel. | VISUAL_ONLY (state pattern) |
| Footer `"Showing 1–8 of 78 vendors"` (mono) + Previous (outline) + Next (ink primary inverse) | `"Page X of Y (N total)"` (sans) + Previous outline + Next outline | Different copy format; Next is the primary action visually. | COPY_CHANGE |
| First page row count = 8 in design vs `PAGE_LIMIT = 10` in code | `useAdminVendors` `PAGE_LIMIT = 10` | Probably illustrative — but worth confirming. | AMBIGUOUS |

### 2.5 Edit panel — desktop (`wujIR`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Persistent right-side panel (always visible) | `<VendorDialog>` modal | Different surface entirely; see §1 routing impact. | CHANGED_INTERACTION |
| Panel title `"Edit vendor"` + subtitle `"Saleem Bhai · Saleem Snacks Co. · #VND-0142"` | `<DialogTitle>"Edit Vendor"` or `"Add Vendor"` | New subtitle composes 3 fields including a `Vendor ID` (#VND-0142) that doesn't exist on `vendors` today (only the UUID `id`). | COPY_CHANGE + **NEW_FIELD** |
| Avatar card (paper-2) — initials circle + eyebrow `"VENDOR LOGO"` + `"Initial avatar (auto)"` + helper `"Tap to upload custom logo"` | None | New: the system auto-generates an initials avatar; allows custom logo upload. **No `logoUrl` / `imageUrl` column exists on `vendors`.** | **NEW_FIELD** + **NEW_INTERACTION** |
| Field `Full name` (sans 14/600 ink, focus-stroke ink) | None on `vendors`. Current `POST /api/admin/vendors` takes `shopName` and copies it into `user.name`; no separate full name field is editable in the form. | The design treats vendor's personal name as a distinct, primary-sortable field. | **NEW_FIELD** |
| Field `Shop name` | `Shop name` field in dialog | Same. | (no change) |
| Field `Address` (multi-line, 80h) | None. (Schema has `vendors.city` — the design has `Address` instead, and no city.) | Free-form multi-line address. | **NEW_FIELD** |
| Field `Phone number` (mono) | `Phone number` (sans, `placeholder="+923000000000"`, `maxLength={13}`) | Same data. Visual font change covered by token migration. | VISUAL_ONLY |
| Field `Email` | None. `user` table has `email` but the create-vendor form does not populate it. | New field for the vendor edit form. | **NEW_FIELD** |
| Field `MarketHub / Bazaar` (dropdown, chevron) | `Market hub` (free-text Input) | Pencil shows it as a dropdown; current is a plain text input. Implies an enumerated list of hubs. There is no hubs/bazaars table. | CHANGED_INTERACTION + **NEW_FIELD** (a hub catalog) |
| Field `Vendor ID` (read-only, paper-2/paper-3, format `#VND-0142`) | None | Display-only. **Schema only has UUID `id`** (e.g. `crypto.randomUUID()`). The `#VND-NNNN` format is not derivable. | **NEW_FIELD** |
| Field `Categories handled` — pill list of multiple selected categories + `+ Add category` outline pill | None | Per-vendor categories. `categories` table exists, but there is **no vendor↔category join table** (`product_categories` joins products and categories, not vendors). Per Q14 of `02-design-inventory.md` user said add categories. | **NEW_FIELD** |
| Status block: `Status` + helper `"Visible to buyers · receives orders"` + ACTIVE / INACTIVE segmented toggle | `Active` checkbox (`isActive`) | Same boolean, different presentation (segmented control with helper text). The KPI/filter set adds a third status PENDING (see 2.2/2.4). The segmented toggle in the panel only shows two — so PENDING is presumably set elsewhere or is a derived status. | CHANGED_INTERACTION + AMBIGUOUS |
| Field `GST / NTN` (mono input, `"7842310-9"`) | None | **The design draws this field, but the user's answer to Q14 of `02-design-inventory.md` explicitly said `"no GST"`.** Conflict. | **AMBIGUOUS** |
| Field `Joined` (read-only, paper-2/paper-3, e.g. `"12 Mar 2024"`, calendar icon) | None | Display-only computed from `vendors.createdAt`. | **NEW_FIELD** (display only) |
| Field `Monthly limit (Rs.)` + helper `"Used Rs. 2,84,000 of Rs. 5,00,000 this month (57%)"` | None | New numeric field. The helper requires a "used this month" aggregate over vendor's sales. Schema has no limit and no per-month aggregate. | **NEW_FIELD** + **NEW_INTERACTION** |
| Audit meta card: `AUDIT` eyebrow + `Onboarded by` (admin name + date) + `Last edited` (admin name + date) + `Lifetime sales` (green-700 mono) | None | Per-vendor audit. There is an `admin_audit_log` table at the app level, but it's not vendor-specific in the schema and has no FK from `vendors`. | **NEW_FIELD** (or new query) + **NEW_INTERACTION** |
| Bank details (existing — `bankName`, `accountTitle`, `iban`) | `bankDetailsSchema` + 3 inputs in dialog | **Bank details are NOT drawn in the Pencil edit panel.** | **REMOVED_FIELD** |
| Footer `Remove vendor` (destructive outline, red, trash icon) | None (the existing dialog has no delete) | Hard or soft delete? `vendors` has no `deletedAt`. Today there is no DELETE endpoint. | **NEW_INTERACTION** + AMBIGUOUS |
| Footer `Cancel` + `Save changes` (ink primary inverse) | `Cancel` outline + `Save` / `Add Vendor` green primary | The Pencil "Save" button is the **inverse-ink** (Place-order-style) primary, not the green primary CTA used today. (See `Q-BUTTON-1` in `04-design-system-implementation-log.md` — inverse variant deferred.) | VISUAL_ONLY |

### 2.6 Edit sheet — mobile (`B72ukw`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Sheet header `"Edit Saleem Bhai"` + `#VND-0142` + close-X | n/a | Title interpolates the vendor name (vs desktop `"Edit vendor"`). | COPY_CHANGE |
| Fields drawn: Name · Shop name · Phone · Address · MarketHub/Bazaar · Status | Dialog has Phone · Shop name · Market hub · Active · Bank name · Account title · IBAN | Mobile sheet OMITS: Email, Vendor ID, Categories, GST/NTN, Joined, Monthly limit, Audit meta, Avatar card, Bank details. | AMBIGUOUS (intentional subset?) + **REMOVED_FIELD** (bank details, on mobile) |
| Sheet footer: Cancel + Save (ink primary inverse) + Remove vendor (destructive outline) below | Dialog footer: Cancel + Save | Adds Remove. Same primary-style note as desktop. | (covered above) |

### 2.7 Mobile vendor list card (`gK27m`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Stat strip with `PRODUCTS / MO. SALES / ORDERS` | None on mobile (no separate mobile rendering today) | Mobile shows `ORDERS` count which is **not** in the desktop table. | **NEW_FIELD** + AMBIGUOUS |
| Action button `Sales report` (ink primary inverse) per card | None | New affordance. No "sales report" surface exists in code. | **NEW_INTERACTION** |
| Action button `Edit` (outline) per card | "Edit" button | Maps to opening the edit sheet. | (no change) |
| Trailing `ellipsis-vertical` icon at top-right of each card | None | Kebab menu — contents not drawn. | **NEW_INTERACTION** + AMBIGUOUS |

### 2.8 Other / cross-cutting

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Avatar = initials on green-bg | None | Auto-generated; format is first letters of vendor name(s). The exact algorithm (e.g. `"Saleem Bhai"` → `"SB"`) is not specified. | AMBIGUOUS |
| Currency formatting `"Rs. 2,84,000"` (South-Asian grouping) | `Rs.` not currently used in this surface. | Token-migration Q17 confirms `Rs.` + South-Asian grouping. | (covered by token migration) |
| Empty state for table | "No vendors yet." (`text-muted-foreground`, full-row colspan) | Pencil does not draw an empty-state for the table (only filled rows). | **NEW_STATE** (no design ref) |
| Loading state | `<VendorsTableSkeleton>` | Pencil does not draw a loading state. | **NEW_STATE** (no design ref) |
| Error state | Inline error row in the table | Pencil does not draw an error state. | **NEW_STATE** (no design ref) |
| Optimistic vs server validation feedback | Toast pattern via `sonner`; form errors via `<FieldError>` | Pencil does not draw a per-field error state. | **NEW_STATE** (no design ref) |

---

## 3. Schema / type implications

For every NEW_FIELD or REMOVED_FIELD called out above, the implications are:

### 3.1 New persisted fields on `vendors` (or related)

| Field | Type / model implication | Tables / migrations affected |
|---|---|---|
| `fullName` (a.k.a. "Full name") | New column. Today `user.name` is set to `shopName` at create. The design treats personal name as primary. | New column on `vendors` (`full_name text`) **OR** make `vendors.userId.name` the source of truth and stop overloading it with `shopName`. Migration: backfill from `shopName` or leave NULL. |
| `address` (free-form multi-line) | New column. Replaces `city` semantically. | New `address text` column on `vendors`. Decide: keep `city` or drop (REMOVED_FIELD). |
| `email` | Already exists on `user.email` (better-auth). Form needs to write through. | No new column, but POST/PATCH must accept and persist `email` to `user`. Currently neither endpoint touches `user.email`. |
| `logoUrl` (custom uploaded logo) | New column. Avatar is "initials (auto)" by default; helper says "Tap to upload custom logo". | New `logo_url text` (nullable) on `vendors`. New upload endpoint or reuse `/api/admin/upload/...` family. |
| `vendorDisplayId` (`#VND-0142`) | New, sortable, human-friendly id. UUIDs aren't usable. | Either a new `display_id text unique` column (like `orders.displayId`) generated on insert, or computed from a per-vendor sequence. |
| `categories` (per-vendor) | Many-to-many `vendors ↔ categories`. | New join table `vendor_categories(vendorId, categoryId)` (composite PK), mirror of `product_categories`. PATCH/POST need to accept array. |
| `monthlyLimitCents` (Rs. monthly limit) | Numeric. Storing as cents matches the codebase convention (`product_price_tiers.priceCents`, `wallet.balanceCents`, etc.). | New `monthly_limit_cents bigint` (nullable?) on `vendors`. |
| `pending` status (third state) | The current `isActive: boolean` only encodes Active/Inactive. The design's KPI/filter/list adds **PENDING REVIEW**. | Change column from boolean to enum (`status: 'active' \| 'inactive' \| 'pending'`) **OR** add a separate `verifiedAt timestamp` (NULL = pending). Either is a non-trivial migration that will affect the existing GET filter (`isActive`) used everywhere. |

### 3.2 Removed fields

| Field | Currently in… | Implication |
|---|---|---|
| `vendors.city` | DB schema, GET row, PATCH. POST hardcodes `'Lahore'` already. | Pencil shows `Address` instead; `city` is not drawn anywhere on this screen. Remove or repurpose? See Q21. |
| `bankName` / `accountTitle` / `iban` | DB schema, dialog form, `bankDetailsSchema`, POST/PATCH | Pencil edit panel does NOT draw bank details. **DO NOT delete the DB columns** without confirmation — vendor payouts (per `vendor_ledger`, vendor dashboard payout block in Pencil §3, design-inventory) depend on bank details. The fields are likely just moved to a different surface (vendor dashboard or a separate "bank" tab) — see Q15. |

### 3.3 New API/aggregate fields (no DB migration; query-side)

| Field | Where it surfaces | Implication |
|---|---|---|
| `productCount` per vendor | Table column `PRODUCTS` | LEFT JOIN/subquery on `products` count per `vendorId` in `GET /api/admin/vendors`. |
| `monthlySalesCents` per vendor | Table column `MONTHLY SALES` | Aggregate on `sub_orders` for the current calendar month per `vendorId`. May need a windowing definition (calendar-month vs trailing-30-days). |
| `monthlySalesUsedCents` for the limit helper | Edit panel monthly-limit helper text | Same aggregate as above — may be the same value reused. |
| `lifetimeSalesCents` per vendor | Edit panel Audit meta `Lifetime sales` | Sum of all `sub_orders.codCents`/etc. for the vendor. |
| `onboardedBy` / `lastEditedBy` (admin user + timestamp) | Edit panel Audit meta | Requires audit trail. `admin_audit_log` exists but has no `target_type='vendor'` data flow today. |
| `ordersThisMonth` per vendor | Mobile card stat | Aggregate on `sub_orders` for current month. |
| KPI counts (totalVendors, activeVendors, pendingVendors, inactiveVendors, onboardedThisMonth) | KPI row | New aggregate endpoint or response addition. |

### 3.4 Per-screen Zod / TS impacts

- `createVendorSchema` and `updateVendorSchema` in `apps/web/src/modules/admin/admin-vendors/schemas/index.ts` will need the new fields above (and to drop bank details if those move). `bankDetailsSchema` may no longer belong here.
- `VendorListItem` in `apps/web/src/modules/admin/admin-vendors/types.ts` will need: `fullName`, `productCount`, `monthlySalesCents`, `status` (replacing/augmenting `isActive`), avatar/logo source, `vendorDisplayId`, plus any sort/filter fields (createdAt for `Sort: Newest first`).
- `VendorDetail` extends with: `email`, `address`, `logoUrl`, `categoryIds[]`, `monthlyLimitCents`, audit fields.

---

## 4. Behavior implications

For every NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE in §2:

### 4.1 KPIs (vKpi)

- **Source.** No `GET /api/admin/vendors/stats` exists. Either add a new endpoint or return KPIs alongside the existing list (extending `meta`). Status counts depend on the new tri-state status (§3.1 `pending`).
- **Refresh.** Should KPIs invalidate on every create/edit/remove? Today only `VendorQueryKeys.all` is invalidated; KPIs would join that query family (or get their own key).

### 4.2 Filters (vFil)

- **Status tabs** (`All / Active / Pending / Inactive`) — change `useVendorsQuery` to accept a `status` param; `GET /api/admin/vendors` to filter on the status column.
- **Search** — server-side ILIKE on `shopName` / `fullName` / (mobile also `phoneNumber`). New `q=` param.
- **Bazaar dropdown** — new param. Bazaar source list: hardcoded? Or derived from distinct `vendors.hub`? Or a new `hubs` table?
- **Sort dropdown** ("Newest first" implies createdAt DESC default) — new `sort=` param (`createdAt_desc`, `monthlySales_desc`, …). Need confirmation on the visible options (only "Newest first" is drawn).
- All filters are URL-state candidates (`nuqs` is already in the stack).

### 4.3 Selected row + Edit panel state

- **Today** `editingVendorId` is local React state. Pencil's persistent panel could keep this pattern; but URL-driven (`/admin/vendors/[id]`) gives shareable links, page-refresh stability, and breadcrumbs. See Q1.
- **Initial state** — the design always shows a vendor populated. What does the panel show on first load (no row selected)? An empty state? The first row auto-selected? See Q3.
- **Add vendor** — clicking the green primary in `vHd` presumably resets the panel to a blank "create" state. Same panel surface, different submit endpoint. Confirm.

### 4.4 New header actions

- **Export CSV** (`vHdR1`) — endpoint? Streaming response, all rows or filtered set? Format columns?
- **Bulk import** (`vHdR2`) — modal? File picker? Validation? CSV schema?
- Both have no current API surface and no design frame for the import flow that I can see in this screen.

### 4.5 Bulk select

- **Header + per-row checkboxes** — what action(s) does selection unlock? No bulk-action toolbar is drawn. (Today there is no concept of "selected vendors" in the codebase.)

### 4.6 Row "..." kebab menu / pencil icon

- **Pencil icon** — implies opens edit (current "Edit" button equivalent).
- **Ellipsis-vertical** — kebab menu items not drawn. Likely candidates: deactivate / remove / view sales / impersonate. Need explicit list.

### 4.7 Avatar / logo upload

- New upload action ("Tap to upload custom logo"). Mirror of existing `/api/admin/upload/categories` pattern (Supabase Storage). New bucket?
- `logoUrl` is new (§3.1) — and we also need a default fallback rendering for "initial avatar (auto)".

### 4.8 Categories chip editor

- Each pill has an `x` to remove. `+ Add category` opens a picker. Categories sourced from `categories` table. Multi-select autocomplete? New picker component?
- Server payload becomes `categoryIds: string[]`.

### 4.9 Status segmented control (in panel)

- Same boolean it edits today, but rendered as a 2-state segmented control. **Pencil's panel only shows Active / Inactive — Pending appears in the KPI/filter/list but not in this control.** What sets a vendor to Pending? On create? Triggered externally? See Q9.

### 4.10 Monthly limit helper

- The static helper `"Used Rs. 2,84,000 of Rs. 5,00,000 this month (57%)"` requires the live monthly-spend aggregate and the configured limit. Real-time? Cached?

### 4.11 Audit meta

- Requires writes to `admin_audit_log` (or a per-vendor audit history) on every vendor create/edit. `admin_audit_log` exists in schema but is unused in `app/api/admin/vendors/*` today.

### 4.12 Remove vendor

- New DELETE endpoint? Soft delete (`deletedAt`) or hard? What happens to the joined `user` row, the vendor's products, the vendor's existing sub-orders, and `vendor_ledger` rows? See Q12.

### 4.13 New states with no design reference

- The design only draws populated, success-path frames. **Empty list** (no vendors at all), **filtered-empty** (no results matching filter), **loading**, **error** are not drawn — and current behavior is to show inline messages inside the table. Design intent unclear.

---

## 5. Open questions for me

Numbered. Each row in §2 with a non-VISUAL_ONLY category is represented here.

1. **Edit-panel routing.** Today it's a Dialog with local `editingVendorId`. The Pencil persistent panel implies either local state or a per-vendor URL.
   - *Observed:* breadcrumb stays static `Admin › Catalog › Vendors`; panel header shows `#VND-0142`.
   - *Question:* Should the revamp keep panel state local, OR switch to a URL-driven pattern (`/admin/vendors/[id]` or `/admin/vendors?vendorId=...`)?
   - *Hypotheses:*
     a) Local state only (matches current Dialog pattern; breadcrumb stays static).
     b) URL search param via `nuqs` (shareable, refresh-stable, no new route file).
     c) Nested route segment (`/admin/vendors/[id]`, full-page nav).

2. **Mobile edit-sheet field subset.** Mobile sheet omits Email, Vendor ID, Categories, GST/NTN, Joined, Monthly limit, Audit meta, Avatar card, Bank details — desktop has them all.
   - *Question:* Is the mobile sheet intentionally a subset (fewer fields by design), or is the design just unfinished?
   - *Hypotheses:*
     a) Intentional minimum-viable mobile edit (others editable only on desktop).
     b) Mobile is incomplete; treat as "same fields as desktop, just stacked" when implementing.
     c) Some fields move to a separate "Settings" or "More" sheet on mobile.

3. **Edit-panel default state.** Pencil always draws a populated panel (Saleem Bhai #VND-0142).
   - *Question:* When the page loads with no vendor selected, what does the panel show?
   - *Hypotheses:*
     a) Empty placeholder ("Select a vendor to edit").
     b) Auto-select first row.
     c) Blank "Add vendor" form (the same surface used for create).

4. **Subtitle "64 active · 2 inactive · 12 pending review · 8 new this month" copy & data.**
   - *Observed:* Pencil header subtitle is a live derived string; current code has static `"Manage vendors and their catalog."`.
   - *Question:* Is this subtitle a real component (live counts pulled from a stats endpoint), and is the wording locked?
   - *Hypotheses:*
     a) Live, exact wording locked.
     b) Live, but wording is sample copy and we should pick our own.
     c) Static placeholder; ignore.

5. **Breadcrumb `Admin › Catalog › Vendors`.**
   - *Observed:* No breadcrumb today; "Catalog" doesn't correspond to any current route segment.
   - *Question:* Should there be a global admin breadcrumb component, and does "Catalog" need to be a real grouping in the sidebar (it isn't currently)?
   - *Hypotheses:*
     a) New global breadcrumb derived from a static admin nav tree (with "Catalog" as a logical group only).
     b) Page-local breadcrumb hardcoded for vendors.
     c) Breadcrumb is decorative — fixed text, no actual links.

6. **Header actions — `Export CSV` and `Bulk import`.**
   - *Observed:* No endpoints exist. No design frames for the import flow are visible on this screen.
   - *Question:* Are these in scope for this revamp? If yes, what is the import flow (upload → validate → confirm)? CSV schema?
   - *Hypotheses:*
     a) In scope; need a follow-up design pass for the import flow.
     b) UI shells only (the buttons are present but route to TODO/disabled states).
     c) Out of scope; remove from the design.

7. **`PENDING REVIEW` as a third vendor status.**
   - *Observed:* Pencil KPI/filter/table-stamp all show Pending; current schema has `isActive: boolean` only.
   - *Question:* Is Pending a real new status, and how is it set?
   - *Hypotheses:*
     a) New enum `vendor_status: 'active' | 'inactive' | 'pending'` (column rename + migration).
     b) Pending = `verifiedAt IS NULL` derived; keep `isActive` as-is.
     c) Pending = a flag in the new audit/admin workflow (e.g. invitation sent but not accepted). Status enum still binary.

8. **Per-row stamp in the table only shows three values (ACTIVE / PENDING / INACTIVE).** The brief & the `Stamp` atom support more variants.
   - *Question:* Confirm exactly these three vendor statuses (no "DELAYED", "AT MNP HUB" in vendor context).
   - *Hypotheses:*
     a) Yes, only 3.
     b) More variants exist (e.g. "SUSPENDED") that aren't drawn here.

9. **Status toggle in the edit panel only shows Active/Inactive.**
   - *Observed:* The KPI/filter/list have Pending, but the panel's segmented control doesn't.
   - *Question:* Where can an admin set Pending? Is it not editable (e.g. system-set on create / set by a separate verification flow)?
   - *Hypotheses:*
     a) Pending is system-set only; the toggle correctly excludes it.
     b) The toggle should be tri-state (3-way segmented) — design omission.
     c) Pending → Active is set by clicking a separate "Approve" CTA elsewhere (not drawn).

10. **GST / NTN field in the edit panel.**
    - *Observed:* The Pencil panel **draws** a `GST / NTN` input with sample value `"7842310-9"`. The user's answer to Q14 of `02-design-inventory.md` said **"no GST"**.
    - *Question:* Direct conflict between the Pencil design and the user's prior answer. Which wins?
    - *Hypotheses:*
      a) Honor the prior answer — drop the field even though it's drawn.
      b) Honor the design — re-introduce GST/NTN as a new column.
      c) Keep the visual slot but rename it to something else (e.g. "Trade license").

11. **Bank details (existing) — bankName / accountTitle / iban — are NOT drawn on the Pencil edit panel.**
    - *Observed:* Today they're editable in the dialog and required (`min(1)`) in `bankDetailsSchema`. The vendor dashboard's payout block (per `02-design-inventory.md` §4.4) needs them.
    - *Question:* Where do bank details live in the new design? Same panel (just not drawn), a separate tab, or only on the vendor's own dashboard?
    - *Hypotheses:*
      a) Moved to vendor self-serve (vendor dashboard / settings); admin no longer edits them.
      b) Separate "Bank" tab inside the same edit panel (not drawn yet).
      c) Just an oversight — keep them in the admin edit panel as today.

12. **`Remove vendor` action in the panel footer.**
    - *Observed:* Trash-2 icon + red destructive-outline button. No DELETE endpoint exists.
    - *Question:* Hard delete or soft delete? What happens to the vendor's `user` row, products, sub-orders, ledger entries?
    - *Hypotheses:*
      a) Soft delete (`deletedAt timestamp`, hidden from list, products/orders preserved).
      b) Hard delete cascading via FK (current `user.id ← vendors.userId` is `ON DELETE CASCADE`).
      c) Deactivate-only (set `status='inactive'`); button label is misleading and should be "Deactivate".

13. **Search query target.**
    - *Observed:* Desktop placeholder `"Search by name or shop"`; mobile `"Search by name, shop or phone"`.
    - *Question:* Confirm exact set of searchable fields on each, and whether server-side ILIKE is acceptable (or is full-text search planned).
    - *Hypotheses:*
      a) Fields per the placeholders, ILIKE, server-side, debounced.
      b) Identical search on desktop and mobile (placeholders are illustrative).
      c) Fuzzy / full-text search (would need pg_trgm or similar).

14. **Bazaar (hub) dropdown — source of options.**
    - *Observed:* `Bazaar: All` chevron, but no list is drawn.
    - *Question:* Where does the option list come from?
    - *Hypotheses:*
      a) `SELECT DISTINCT hub FROM vendors`.
      b) A new `hubs` / `bazaars` table.
      c) Hardcoded enum.

15. **Sort dropdown — supported keys.**
    - *Observed:* Default `"Sort: Newest first"`. No menu drawn.
    - *Question:* Which sort options are supported?
    - *Hypotheses:*
      a) Newest first (default), Oldest first.
      b) Above + Monthly sales high→low + Products high→low + A→Z.
      c) Single fixed sort; dropdown is decorative.

16. **Bulk select / row checkboxes.**
    - *Observed:* Header + per-row checkboxes drawn. No bulk action bar in this frame.
    - *Question:* What bulk actions are supported once a selection is made?
    - *Hypotheses:*
      a) Bulk activate / deactivate.
      b) Bulk export of selected rows.
      c) Selection is decorative for now; revisit later.

17. **Row kebab (`ellipsis-vertical`) menu items.**
    - *Question:* What's in the menu? (`View`, `Open sales report`, `Deactivate`, `Remove`, `Impersonate`?)

18. **Mobile card "Sales report" button.**
    - *Observed:* Ink primary inverse `Sales report` per card. No sales-report screen exists.
    - *Question:* Is sales-report in scope? If yes, link to where?

19. **Mobile card stats include `ORDERS`.**
    - *Observed:* The desktop table does not have an Orders column; the mobile card shows it.
    - *Question:* Should desktop also surface orders, or is mobile genuinely showing a different stat triplet?

20. **Avatar generation algorithm.**
    - *Observed:* Initials `SB` for `Saleem Bhai · Saleem Snacks Co.`.
    - *Question:* Is the rule "first letter of full name + first letter of shop name", or "first two letters of full name"? Consider single-word names and emoji/non-Latin scripts.
    - *Hypotheses:*
      a) `firstCharOf(fullName) + firstCharOf(shopName)`.
      b) `initials(fullName)` (up to 2 letters).
      c) Server-provided.

21. **`vendors.city` — currently in schema; `POST` hardcodes `'Lahore'`; design removes it in favor of `Address`.**
    - *Question:* Drop `city`, keep it as a derived/parsed value, or migrate it into the new `address` text?
    - *Hypotheses:*
      a) Drop column (with backfill into `address`).
      b) Keep both; `city` remains for filtering, `address` is free-form.
      c) Replace `city` with the new `address` and remove the existing column (with caution — see CLAUDE.md hard rule 3).

22. **Vendor display ID format `#VND-NNNN`.**
    - *Question:* Format generation rule (zero-padded sequential? per-year? auto-numbered like `orders.displayId` is `ORD-…`?).

23. **Categories — multi-select source and constraint.**
    - *Observed:* 3 selected categories shown. No max drawn.
    - *Question:* Are categories drawn from the same `categories` table that products use, and is there a max-selected limit?
    - *Hypotheses:*
      a) Same table, unlimited multi-select.
      b) Same table, capped (e.g. 5).
      c) Separate vendor-only category taxonomy.

24. **Monthly limit semantics.**
    - *Observed:* Field `Monthly limit (Rs.)` + helper `"Used Rs. 2,84,000 of Rs. 5,00,000 this month (57%)"`.
    - *Question:* Calendar-month or trailing-30? Used = orders placed, accepted, or delivered? What happens when limit is reached (block new orders, warn, soft-cap)?

25. **Audit "Onboarded by" / "Last edited by".**
    - *Observed:* Names + dates (`Zaid Ahmed · 12 Mar 2024`, `Zaid Ahmed · 28 Apr 2026`).
    - *Question:* These need to be persisted on every create/edit. Use `admin_audit_log`, or add explicit `createdById` / `lastEditedById` columns to `vendors`?

26. **Lifetime sales — monthly limit aggregate window.**
    - *Question:* Sum across all `sub_orders` regardless of status, or only `delivered`?

27. **Selected-row visual on the list.**
    - *Observed:* `paper-2` fill on the row whose vendor is open in the panel.
    - *Question:* Confirm that "selected" is the same concept as "currently being edited in the panel" (not a separate bulk-select highlight).

28. **First-page row count.**
    - *Observed:* Pencil shows 8 rows; current `PAGE_LIMIT = 10`.
    - *Question:* Is 8 the new page size, or just an illustrative count?

29. **Empty / loading / error / form-error states.**
    - *Observed:* Pencil draws only the populated success state.
    - *Question:* Reuse current ad-hoc states (skeleton via `VendorsTableSkeleton`, inline error rows, sonner toasts), or design these explicitly?

30. **Header copy — `Add vendor` (lowercase v) vs current `Add Vendor`.**
    - *Question:* Is the lowercase the new convention, or just stylized in the mock?

31. **Pagination footer copy — `"Showing 1–8 of 78 vendors"` vs `"Page X of Y (N total)"`.**
    - *Question:* Is the new "Showing m–n of total" wording locked, and should the trailing word `vendors` interpolate to whatever entity the table holds (so the same component can be reused)?

32. **`Save changes` button uses ink primary inverse, not the green primary.**
    - *Observed:* Pencil uses the inverse-ink CTA (blocked by `Q-BUTTON-1` from `04-design-system-implementation-log.md`).
    - *Question:* Confirm the inverse variant should be added to `Button` so the panel can use it. (User said in 02-design-inventory Q7 to re-derive from tokens; the variant exists in Pencil §3.1.)

33. **Email field source.**
    - *Observed:* New `Email` field on the panel; `user.email` already exists on the auth user.
    - *Question:* Persist email on `user.email` (single source of truth), and make the form load/save through to `user`? Or store it on `vendors` separately?

---

**Gap analysis written to:** `D:\Moeed 8th Sem\Fyp\Code\shalmi-web\.claude-revamp\screens\admin-vendors\gap-analysis.md`

(End of Admin · Vendors gap analysis. Stopping here per instructions — not starting implementation.)
