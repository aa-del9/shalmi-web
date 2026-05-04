# Vendor · Dashboard — Gap Analysis

> **Phase:** Pre-implementation read-only gap analysis.
> **Date produced:** 2026-05-02
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop `VqlnC`, Mobile `L95K24`.
> **Existing route:** `/vendor/dashboard` — `apps/web/src/app/vendor/dashboard/page.tsx` (a static placeholder per `01-codebase-map.md` Q5).
> **Related artifacts:**
> - `01-codebase-map.md` — existing code surface.
> - `02-design-inventory.md` — Pencil tokens + components.
> - `04-design-system-implementation-log.md` — what's already retoken-built (`Stamp`, `Card`, `Button`, etc.).
> - `screens/vendor-portal.md` — Pencil-side notes for vendor screens.
> - `features/vendor-payouts/surface-map.md` — payout-pending tile, callout, ledger entry.
> - `features/status-stamps/surface-map.md`, `features/weight-gauge/surface-map.md`, `features/pack-pricing/surface-map.md` — adjacent design-system features (referenced by status pills here).
>
> Per CLAUDE.md, every NEW_FIELD / REMOVED_FIELD / NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE / COPY_CHANGE / AMBIGUOUS row in §2 becomes a numbered question in §5. No code is proposed.

---

## 1. Layout & structure

### 1.1 Vendor shell — desktop (`VqlnC`)

Two-row, two-column shell (top bar at top, sidebar + main below).

- **Top bar `lYBSQ`** — full-width, `ink` fill, `padding [10,32]`, `space_between`. Left cluster `dqHN7`: round white `S` mark (28²) + "Shalmi Mart" (sans 14/700 white) + `·` separator + "Vendor" (sans 13/500 `#FFFFFFCC`) + rotated (`+1°`) `VENDOR` mono badge in a 1.5px `#FFFFFF66`-stroked pill. Right cluster `vLfZd`: bell icon button (36² container, lucide `bell`, white) + user pill `B2NfRi` (round 99, fill `#FFFFFF14`, padding [4,12,4,4]): green-2 32² avatar with initials `SB`, then small two-line user text block (name + chevron-implied subline) — the inner text was `…` in the layout snapshot. Height 60.
- **Body `CsQn4`** — full width 1440, height ~1503. Two children:
  - **Sidebar `O3kVa`** — 240w, `white` fill, 1px right hairline `rule`, padding `[16,12,24,12]`, gap 4, vertical layout. Four sections, five nav items (per Pencil; Q14 of `features/vendor-payouts/surface-map.md` confirms this is the canonical 5-row baseline):
    - `OVERVIEW` (mono eyebrow) → `Dashboard` (active; lucide `layout-dashboard`, paper-2 fill, ink 14/700)
    - `CATALOG` → `Products` (lucide `package`, ink-2 14/600)
    - `OPERATIONS` → `Orders` (lucide `shopping-bag`, ink-2 14/600) with right-aligned amber pill badge `8` (mono 11/700 white, fill amber, radius 99); → `Ledger` (lucide `book-open`, ink-2 14/600)
    - `ACCOUNT` → `Settings` (lucide `settings`, ink-2 14/600)
  - **Main `Xf6Eg`** — 1200w, padding `40/48/80/48` (top/right/bottom/left), gap 32. Five blocks, vertical:
    1. `Header oep3B` (height 85)
    2. `KPI row JS8se` (height 156)
    3. `Sales chart wQbeg` (height 380)
    4. `TwoCol NhWQW` (height 538)
    5. `Payouts callout h73sFW` (height 96)

#### Header (`oep3B`) detail

- Layout `space_between`, `alignItems:end`. Left vertical block `QJkM8` (gap 6):
  - Eyebrow `L4tBk` — `MONDAY · 28 APRIL · GUJRANWALA` (mono 11/700, fill `amber`, ls 0.16).
  - Title `RD8DY` — `Saleem Brothers Wholesale` (sans 32/600, fill `ink`, ls -0.02).
  - Subtitle `QS7ah` — `Your shop at a glance — orders, stock, payouts.` (sans 14, fill `ink-2`).
- Right cluster `J0fNQj` (gap 12):
  - `o7THDA` filter pill — `padding [10,16]`, radius 8, white fill, 1px `rule` border. lucide `calendar` 16² (`ink-2`) + "This month" sans 13/600 `ink-2`.
  - `VeWne` CTA — radius 8, fill `green-2`, `padding [10,16]`. lucide `plus` 16² (white) + "Add product" sans 13/700 white.

#### KPI row (`JS8se`) detail — 4 cards, gap 16, all `width:fill_container`

All cards: radius 12, padding 24, vertical layout, gap 14.
- **`k1` Orders Today** — `white` fill, 1px `rule`. Eyebrow `ORDERS TODAY` mono 11/700 `ink-3`. Value `12` mono 36/700 `ink`. Pill `S3qEc` (radius 99, fill `amber-bg`, padding [2,8]) — `8 NEW · 4 PACKED` mono 10/700 `amber`.
- **`k2` Revenue MTD** — `white` fill, 1px `rule`. Eyebrow `REVENUE · MTD`. Value `₨ 4,86,300` mono 30/700. Pill `hyf45` (radius 99, fill `green-bg`, padding [2,8]) — lucide `trending-up` 11² + `+14% vs last month` mono 10/700 `green-700`.
- **`k3` Active Listings** — `white` fill, 1px `rule`. Eyebrow `ACTIVE LISTINGS`. Value `47` mono 36/700. Pill `fegTX` (radius 99, fill `red-bg`) — `3 LOW STOCK` mono 10/700 `red`.
- **`k4` Payout Pending** — **`ink` fill, 1px `ink` stroke** (inverse). Eyebrow `PAYOUT · PENDING` mono 11/700 fill `#FFFFFF99`. Value `₨ 1,12,500` mono 30/700 white. Pill `DzmUa` (radius 99, fill `#FFFFFF14`) — lucide `hourglass` 11² white + `RELEASES FRI · 2 MAY` mono 10/700 white.

#### Sales chart (`wQbeg`) detail — single white card, radius 12, padding 28

- Header row `Mog0h` (`space_between`, `alignItems:end`):
  - Left `UAGeG` (vertical, gap 6): eyebrow `REVENUE · LAST 7 DAYS` mono 11/700 `ink-3`; value `₨ 1,38,420` mono 28/700 `ink`; sub `Daily average ₨ 19,774 · best day Saturday` sans 12 `ink-3`.
  - Right `chZZN` segmented control (gap 8) — three pills `seg1/seg2/seg3` with radius 6, padding `[8,12]`. `seg1` is the active state (fill `paper-2`); `seg2`/`seg3` are inactive (no fill drawn). Inner text/labels for the three segments are `7D` / `30D` / `90D` per `screens/vendor-portal.md` §dashboard, but only `seg1`'s active fill is drawn — the labels themselves are children that the snapshot abbreviated to `…`. *(See AMBIGUOUS Q5 below.)*
- Bars row `TWwDX` — height 220, `justifyContent: space_between`, gap 18, `alignItems: end`. Seven equal-width columns (`c1`–`c7`), each a vertical layout containing a `cornerRadius:4` rectangle (`fill_container` width) of varying height + a 10/700 mono day label below:
  - `c1` TUE 96h paper-3 / ink-3 label
  - `c2` WED 120h paper-3 / ink-3 label
  - `c3` THU 108h paper-3 / ink-3 label
  - `c4` FRI 138h paper-3 / ink-3 label
  - `c5` SAT 172h **`green-2`** fill, label `green-700`
  - `c6` SUN 64h paper-3 / ink-3 label
  - `c7` MON 128h **`ink`** fill, label `ink` (today highlight)
- The chart starts on TUE and ends on MON — i.e., **7 days back from today (today = MON)**, not Mon–Sun. *(See AMBIGUOUS Q6 below.)*

#### TwoCol (`NhWQW`) detail — gap 24

- **Left column `ZZ3MV` Recent orders** — `width:fill_container`, white fill, radius 12, 1px `rule`, vertical layout.
  - Header `C8WFUg` (`space_between`, `padding [20,24]`, bottom 1px `rule`). Left `o5JTst` (vertical, gap 4): eyebrow `RECENT ORDERS` mono 11/700 `ink-3`; title `Last 5 orders today` sans 16/600 `ink`. Right `G5MD3f`: `View all` sans 13/600 `ink` + lucide `arrow-right` 14².
  - Order list `MA7fK` — 5 rows (`r1`–`r5`), each `padding [16,24]`, bottom 1px `rule` (last row `r5` has no bottom rule), `space_between`, gap 12.
    - Each row: left vertical (gap 4) — title sans 14/600 ink (e.g. `Tariq Kiryana Store · Gujranwala`) + sub sans 12 ink-3 (`#SM-2841 · 09:42 AM · 6 items · 21.4 kg`); right vertical (gap 4, `alignItems:end`) — amount mono 14/700 ink (`₨ 18,420`) + status pill (radius 99, padding [2,8], 1px stroke, mono 9/700 ls 0.12). Status variants drawn: `NEW` (amber-bg / amber stroke / amber label, rows 1–2), `PACKED` (white fill / `rule-2` stroke / `ink-2` label, row 3), `DELIVERED` (`green-bg` / `green` stroke / `green-700` label, rows 4–5).
- **Right column `lkz4t`** — `width:380`, vertical layout, gap 24. Two cards:
  - **Low stock card `Wuwxe`** — white fill, radius 12, 1px `rule`.
    - Header `KrKA9` (vertical, gap 6, `padding [20,24,16,24]`, 1px bottom `rule`): row `IfGgp` `space_between` — `LOW STOCK` mono 11/700 red + small pill `lZcEi` (radius 99, fill `red-bg`, padding [2,8]) showing count `3` (mono 11/700 red); below it `Reorder before stock-out` sans 16/600 ink.
    - Three rows (`ls1`–`ls3`), `padding [14,24]`, internal hairline. Each row `space_between`: left vertical — name sans 13/600 ink (`Sufi Daana 5kg`) + sub sans 11 ink-3 (`SKU 8924 · sells ~14/day`); right `6 left` mono 13/700 red.
  - **Top sellers card `voYjy`** — white fill, radius 12, 1px `rule`.
    - Header `foy1l`: eyebrow `TOP SELLERS · 30 DAYS` mono 11/700 ink-3; sub `By units sold` sans 16/600 ink.
    - Four rows (`t1`–`t4`), `padding [14,24]`. Each row `space_between`: left horizontal (gap 12) — rank `01` mono 11/700 ink-3 + name sans 13/600 ink; right `412 units` mono 12/700 ink.

#### Payouts callout (`h73sFW`) detail

- `width:fill_container`, fill `paper-2`, radius 12, 1px `rule`, padding `[24,28]`, gap 24, `space_between`, `alignItems:center`.
- Left `P0imQ` (gap 20): icon container `lOxgv` (round 24, fill `paper-3`, 48² centered) holding lucide `banknote` 24² ink. Then `teIAx` (vertical, gap 4): title `Next payout · ₨ 1,12,500` sans 18/700 ink; body `EOLHH` `Releases Friday, 2 May to your registered Allied Bank account ending 4291.` sans 13 ink-2 (`textGrowth: fixed-width`, width 580).
- Right `j36hK` button — radius 8, white fill, 1.5px `rule-2` stroke, padding `[10,16]`, gap 8 — `View ledger` sans 13/600 + lucide `arrow-right` 14² ink.

### 1.2 Vendor shell — mobile (`L95K24`)

420w, `paper` background, vertical stack, no bottom-tab routing wired today.

- **App bar `uCjM6`** — `ink` fill, `padding [12,16]`, `space_between`. Left `WzTUs`: lucide `menu` 22² white + "Dashboard" sans 16/700 white. Right `D7hvYt`: lucide `bell` 22² white + green-2 round 32² avatar with initials `SB` (sans 11/800 white). Height 56.
- **Hero `X5ldt`** — `paper` fill, `padding [20,16,16,16]`, gap 6, bottom 1px `rule`. Eyebrow `THlF6` `MONDAY · 28 APRIL` mono 11/700 amber (no city — desktop has city, mobile drops it); title `NdGzP` `Saleem Brothers` sans 28/700 ink (no "Wholesale" — desktop has it); subtitle `Ul7UT` `Your shop today — orders, stock, payouts.` sans 13 ink-2. Height 114.
  - Mobile hero **does not have** the "This month" filter pill or the green "Add product" CTA. *(See REMOVED_FIELD-style note Q7.)*
- **KPI grid 2×2** — two horizontal frames `P31wjM` / `mYVo8`, each `padding [16]` outer (translated from x:16 layout), gap 10 between cards, gap 10 between rows.
  - `k1` Orders Today (189w, height 105) — radius 10, **fill `amber-bg`, 1px `amber` stroke** (different from desktop which is white/rule). Eyebrow `ORDERS TODAY` mono 9/700 amber; value `12` mono 28/700 amber; sub `8 NEW · 4 PACKED` mono 9/700 amber.
  - `k2` Revenue MTD (189w, 93h) — white fill, 1px rule, radius 10. Eyebrow `REVENUE · MTD` mono 9/700 ink-3; value `₨ 4,86,300` mono 18/700 ink; sub `+14% vs last month` mono 9/700 green-700.
  - `k3` Active Listings (189w, 105h) — white/rule. Eyebrow `ACTIVE LISTINGS`; value `47` mono 28/700 ink; sub `3 LOW STOCK` mono 9/700 red.
  - `k4` Payout Pending (189w, 93h) — **`ink` fill** (no stroke). Eyebrow `PAYOUT PENDING` (no `·` between words — desktop has `PAYOUT · PENDING`) mono 9/700 `#FFFFFF99`; value `₨ 1,12,500` mono 18/700 white; sub `RELEASES FRI · 2 MAY` mono 9/700 white.
- **Chart `QTldw` / inner `c3VIRr` + `V8ctZu`** — white card, radius 12, 1px rule, padding 18, gap 16.
  - Header (`space_between`, `alignItems:center`): left vertical (gap 4): eyebrow `7 DAYS · REVENUE` mono 10/700 ink-3 (desktop says `REVENUE · LAST 7 DAYS` — different word order); value `₨ 1,38,420` mono 22/700. Right pill `X6S2Ng` (radius 99, fill `green-bg`, padding [3,8]) — lucide `trending-up` 11² + `+14%` mono 10/700 green-700 (desktop pill is inside the KPI row, not the chart card — this is a different placement).
  - Bars `V8ctZu` — height 120, gap 8, `justifyContent: space_between`, `alignItems: end`. Same 7-column layout, single-letter mono 9/700 labels (`T W T F S S M`); SAT bar (`mc5`) is `green-2`; MON bar (`mc7`) is `ink`. Heights are scaled-down versions of desktop (54/68/60/78/96/36/72).
- **Recent orders section `fwZko`** — gap-stack of header + 3 cards.
  - Header `RY3oC` (`space_between`): left `jCChI` vertical: `RECENT ORDERS` mono 10/700 ink-3 + `Last 3 today` sans 16/700 ink. Right `View all` sans 12/600 ink (no `arrow-right` icon — desktop has it).
  - List `tRXIH` — three cards `o1`/`o2`/`o3`, white fill, radius 10, 1px rule, padding 14, gap 6, vertical.
    - Each card has two rows: top `space_between` — name sans 13/600 ink (`fill_container` fixed-width) + status pill (variant per row); bottom `space_between` — `#SM-… · X items · X kg` sans 11 ink-3 + `₨ X,XXX` mono 13/700 ink.
    - Mobile card status pills omit the inner status text in the snapshot (children abbreviated to `…`); the visible variants are `NEW` (amber-bg/amber stroke), `NEW` (amber-bg/amber stroke), and "neutral" (white fill / rule-2 stroke — implied PACKED). No DELIVERED rows on mobile (desktop has 2). *(See AMBIGUOUS Q8.)*
- **Low stock section `wW36s`** — header + card.
  - Header `IDcKh` `space_between`: left vertical: `LOW STOCK` mono 10/700 red + `Reorder before stock-out` sans 16/700 ink. Right small pill `CH0hI` (radius 99, fill `red-bg`, padding [2,8]) `3` mono 11/700 red.
  - Card `eJjNK` — white, radius 10, 1px rule, three rows (`lsr1`–`lsr3`). Each row `space_between`, padding `[12,14]`, internal bottom hairline. Left vertical (gap 2): name sans 12/600 + sub sans 10 ink-3. Right `X left` mono 12/700 red.
- **Payouts callout `v68Kvy`** — paper-2 fill, radius 12, 1px rule, padding 18, gap 14, vertical (single column on mobile vs. two-col on desktop).
  - `UspQd` top row (gap 12): icon container `D84ab` (round 20, fill paper-3, 40²) with lucide `banknote` 20² ink. Then `m0Gp3` vertical (gap 2, `width:fill_container`): eyebrow `Next payout` mono 10/700 ink-3 (desktop title is `Next payout · ₨ 1,12,500` — mobile splits these); value `₨ 1,12,500` mono 20/700 ink.
  - Body `lZJZ7` `Releases Friday, 2 May to your Allied Bank account ending 4291.` sans 12 ink-2 (drops "registered" present on desktop).
  - Button `loPiC` — `width:fill_container`, justify center, white fill, 1.5px rule-2, radius 8, padding `[10,16]`, gap 8: `View ledger` sans 13/600 ink + lucide `arrow-right` 14² ink.
- **Bottom tab bar `vJBmE`** — white fill, top 1px `rule`, padding `[12,16,18,16]`, `space_between`. Five tabs (`tb1`–`tb5`), each vertical (gap 4): lucide icon 22² + label sans 10 (700 active / 500 inactive).
  - `tb1` Dashboard (active — ink icon + ink 10/700 label)
  - `tb2` Products (ink-3 / 500)
  - `tb3` Orders (ink-3 / 500) — **no badge** drawn on mobile tab bar (desktop sidebar Orders row has the amber `8` badge). *(See AMBIGUOUS Q9.)*
  - `tb4` Ledger (ink-3 / 500)
  - `tb5` More (ink-3 / 500) — out of scope per `02-design-inventory.md` Q19.

### 1.3 Existing code shell

- `apps/web/src/app/vendor/layout.tsx` → `VendorLayout` from `apps/web/src/modules/vendor/vendor-layout/index.tsx`. Renders `SidebarProvider` + `<VendorSidebar />` + `<SidebarInset>` containing a sticky header (`h-14`, `border-b`, `px-4`) with `<SidebarTrigger />`, `<span>Vendor</span>`, and `<LogoutButton />`, plus a `bg-background flex-1 p-4 md:p-6` content well.
- `VendorSidebar` (`apps/web/src/modules/vendor/vendor-layout/vendor-sidebar/index.tsx`) renders one `SidebarGroup` with label `Navigation` and 5 nav items from `VENDOR_NAV_ITEMS`:
  - Dashboard → `/vendor/dashboard`
  - My Products → `/vendor/products`
  - Add Product → `/vendor/products/new`
  - Orders → `/vendor/orders`
  - Ledger → `/vendor/ledger`
- The header brand reads `Shalmi Vendor` (sans semibold) — there's no top bar with `Vendor` badge today.
- `apps/web/src/app/vendor/dashboard/page.tsx` is a server component that renders an `<h1>Vendor Dashboard</h1>` and one `<p>` of placeholder copy (`Use the sidebar to navigate between Dashboard, My Products, Add Product, Orders, and Ledger.`). No layout, no KPIs, no chart, no callouts.
- No mobile bottom tab bar exists anywhere in the vendor app.
- Vendor session does not surface the vendor's `shopName`/`hub`/`bankName` to the layout today (the existing header just shows the literal word "Vendor").

---

## 2. Element-by-element diff

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Top bar `lYBSQ` (ink, brand mark + "Shalmi Mart · Vendor" + `VENDOR` rotated badge + bell + user pill with avatar) | `vendor-layout/index.tsx` sticky `<header>` (`bg-background`, `<SidebarTrigger />`, plain "Vendor" text, `<LogoutButton />`) | Pencil ink top bar replaces the current light header. New: brand mark, brand wordmark, role badge (rotated), bell icon, user pill with avatar + name. Removed: explicit logout button (Pencil shows no logout — assumed to live inside the user pill / account drawer per `02-design-inventory.md` §3.10, but no flow is drawn here). | NEW_INTERACTION |
| Top bar — `S` round mark (28²) + "Shalmi Mart" wordmark + "Vendor" subtitle + rotated `VENDOR` mono badge | none | Brand mark + role identification not present today. | NEW_FIELD |
| Top bar — bell icon button | none | No notifications surface in the existing app. Pencil draws the icon but **no notifications screen is drawn anywhere** (per `02-design-inventory.md` Q19). Out of scope per Q19, but the icon is present. | NEW_INTERACTION |
| Top bar — user pill (avatar with initials `SB` + name + chevron-implied subline) | `LogoutButton` | Replaces the standalone logout button. Per `02-design-inventory.md` §3.10 the user pill opens an account drawer; the drawer is not drawn for vendor screens. | CHANGED_INTERACTION |
| Sidebar — section eyebrows `OVERVIEW / CATALOG / OPERATIONS / ACCOUNT` (mono 11/700 ink-3, ls 0.12) | `<SidebarGroupLabel>Navigation</SidebarGroupLabel>` (single group) | Four sections vs. current single "Navigation" group. | COPY_CHANGE |
| Sidebar — Dashboard nav item, lucide `layout-dashboard`, sans 14/700 ink, paper-2 active fill | `VENDOR_NAV_ITEMS` Dashboard with `LayoutDashboardIcon`, `text-sidebar-foreground` semantics | Identical entry; visual treatment retoken via design system. | VISUAL_ONLY |
| Sidebar — Products nav item, lucide `package`, sans 14/600 ink-2, label "Products" | Existing entry labeled **"My Products"** with `PackageIcon` | Label change "My Products" → "Products". | COPY_CHANGE |
| Sidebar — (Pencil has no "Add Product" sidebar entry; "Add product" is exposed as the green CTA in the dashboard header) | Existing `Add Product` nav item routes to `/vendor/products/new` | Pencil **removes** the standalone Add Product nav entry; per `02-design-inventory.md` Q11, vendor-products is collapsed to a single scroll page. Add-product is now a header CTA + an empty-state form on the products page. | REMOVED_FIELD |
| Sidebar — Orders nav item, lucide `shopping-bag`, with right-aligned amber pill badge `8` | Existing `Orders` nav with `ShoppingCartIcon`, no badge | Icon swap (`shopping-cart` → `shopping-bag`) and a brand-new "pending orders" badge. The `8` value implies a feed of vendor orders awaiting attention, but no API/derivation rule exists today. | NEW_FIELD |
| Sidebar — Ledger nav item, lucide `book-open`, label "Ledger" | Existing `Ledger` nav with `BookOpenIcon`, route `/vendor/ledger` (no page file exists) | Sidebar entry is preserved verbatim; the destination route is still NEW (per `01-codebase-map.md` Q9). Visual-only on the sidebar itself. | VISUAL_ONLY |
| Sidebar — Settings nav item, lucide `settings`, label "Settings" | none | New entry. No `/vendor/settings` route exists. Pencil does not draw the Vendor Settings screen anywhere in this pass (`02-design-inventory.md` §4.4 lists only Dashboard / Products / Orders / Ledger). | NEW_INTERACTION |
| Header eyebrow — `MONDAY · 28 APRIL · GUJRANWALA` (mono 11/700 amber, ls 0.16) | none (placeholder page) | Brand-new field. Composed of weekday + day-month + city (vendor `hub`?). Nothing in the layout/page surfaces vendor `hub` or `city` today. | NEW_FIELD |
| Header title — `Saleem Brothers Wholesale` (sans 32/600 ink) | `<h1>Vendor Dashboard</h1>` | Title is the vendor's `shopName`, not a literal "Vendor Dashboard". | COPY_CHANGE |
| Header subtitle — `Your shop at a glance — orders, stock, payouts.` (sans 14 ink-2) | placeholder copy `Use the sidebar to navigate…` | Different copy. | COPY_CHANGE |
| Header right — "This month" filter pill (lucide `calendar` + sans 13/600 "This month") | none | New filter affordance. Implied to scope the dashboard data window (KPIs? chart? both?). Behavior not specified. | NEW_INTERACTION |
| Header right — green "Add product" CTA (lucide `plus` + sans 13/700 "Add product") | none on this screen; existing `/vendor/products/new` route reachable from sidebar only | New entry point from the dashboard. Destination presumed to be `/vendor/products/new` (or, per `02-design-inventory.md` Q11, the empty-state form on the consolidated products page). | NEW_INTERACTION |
| KPI `k1` Orders Today — value `12` + amber `8 NEW · 4 PACKED` pill | none | Aggregate of today's vendor orders by status. No endpoint exists. The `NEW` label is not in `sub_orders.status` enum (`pending/packed/handed_to_courier/delivered/cancelled`); per `02-design-inventory.md` Q9, `NEW` is a display-only label mapped from `pending`. | NEW_FIELD |
| KPI `k2` Revenue MTD — value `₨ 4,86,300` + green `+14% vs last month` pill | none | Aggregate revenue month-to-date with a delta vs. previous month. No endpoint or derivation rule today. | NEW_FIELD |
| KPI `k3` Active Listings — value `47` + red `3 LOW STOCK` pill | none | Count of vendor's products with `stock > 0` (or `not draft`?) plus a "low stock" sub-count. `products.stock` exists, but no `lowStockThreshold` and no `draft` flag exist on the schema. | NEW_FIELD |
| KPI `k4` Payout Pending — inverse-ink card with value `₨ 1,12,500` + `RELEASES FRI · 2 MAY` pill | none | New field. Per `features/vendor-payouts/surface-map.md` §3, this requires a `payout_runs` (or aggregated) endpoint with `payout_pending_amount` + `payout_release_date`. None of these exist today. | NEW_FIELD |
| Sales chart eyebrow `REVENUE · LAST 7 DAYS` + value `₨ 1,38,420` + sub `Daily average ₨ 19,774 · best day Saturday` | none | New aggregate. No endpoint. | NEW_FIELD |
| Sales chart segmented control `7D / 30D / 90D` (active = `paper-2` fill) | none | New filter. Three windows. Whether it filters the chart only, or also re-scopes the header KPIs, is not drawn. | NEW_INTERACTION |
| Sales chart bars — 7 bars TUE→MON, MON inked (today), SAT green-2 (best day), others paper-3 | none | New visualization. No charting library is currently a dependency (`recharts` etc. are not listed in `01-codebase-map.md` §1). | NEW_FIELD |
| Recent orders header — `RECENT ORDERS / Last 5 orders today` + `View all` link | none | New panel. Could reuse existing `useVendorOrdersQuery` (`/api/vendor/orders`), but: that endpoint has no "today" filter today, and it returns sub-orders without the buyer-shop name + city composition shown here. | NEW_FIELD |
| Recent orders rows — title `Tariq Kiryana Store · Gujranwala`, sub `#SM-2841 · 09:42 AM · 6 items · 21.4 kg`, amount `₨ 18,420`, status pill (NEW / PACKED / DELIVERED) | none | Fields drawn:<br>• `Tariq Kiryana Store` — buyer's "shop name" (current code only stores `user.name`/`user.phoneNumber`; there is no buyer "shop name" field).<br>• `Gujranwala` — buyer city; available on `addresses.city` (snapshot).<br>• `#SM-2841` — order id format. Current `orders.displayId` uses `ORD-…` per `01-codebase-map.md` §5. **Different prefix.**<br>• `09:42 AM` — order timestamp.<br>• `6 items` — number of order items.<br>• `21.4 kg` — total weight (`sub_orders.weightGrams` exists; a top-level "order weight" does not — but this dashboard scope is the vendor's slice, so per-sub-order weight applies).<br>• `₨ 18,420` — amount (likely `sub_orders.codAmount` or `itemsTotal`).<br>• Status pill — display-only labels (per `02-design-inventory.md` Q9). | NEW_FIELD |
| Low stock card — header `LOW STOCK` + count pill `3` + sub `Reorder before stock-out`; rows `Sufi Daana 5kg / SKU 8924 · sells ~14/day / 6 left` | none | Fields drawn:<br>• product name + SKU + sales-rate + remaining stock.<br>• `SKU 8924` — `products` has no `sku` column; only `slug` exists.<br>• `sells ~14/day` — sales-velocity derived field (would require an analytics aggregation over `order_items`).<br>• `6 left` — `products.stock` exists. The threshold for "low" is undefined in schema. | NEW_FIELD |
| Top sellers card — header `TOP SELLERS · 30 DAYS / By units sold`; rows `01 / Sufi Daana 5kg / 412 units` | none | Aggregate of `order_items.quantity` per product over a 30-day window. No endpoint. | NEW_FIELD |
| Payouts callout — paper-2 banner with banknote icon, title `Next payout · ₨ 1,12,500`, body `Releases Friday, 2 May to your registered Allied Bank account ending 4291.`, `View ledger` outline button | none | Per `features/vendor-payouts/surface-map.md`, this depends on a `vendor_next_payout` endpoint and bank-info source (`vendors.bankName` + masked `iban`). None exist on the vendor side today. The body weaves three fields together — release date, bank name, and last-4 of account number. | NEW_FIELD |
| Mobile app bar — ink, menu icon + "Dashboard" title, bell + green-2 avatar | none | Same comments as desktop top bar; on mobile the brand mark is replaced by a `menu` icon. Title is the page name (`Dashboard`), not the shop name (the shop name appears in the hero below). | NEW_INTERACTION |
| Mobile hero — eyebrow `MONDAY · 28 APRIL` (no city), title `Saleem Brothers` (no "Wholesale"), subtitle `Your shop today — orders, stock, payouts.` (different from desktop "at a glance") | none | Mobile uses different short copy than desktop. | COPY_CHANGE |
| Mobile hero — **omits** the desktop "This month" filter pill and the green "Add product" CTA | (none on either platform today) | Intentional density choice or design churn? | AMBIGUOUS |
| Mobile KPI grid — 2×2 grid of the same four KPIs, with `k1` rendered as **amber-bg/amber-stroke tile** instead of white/rule | none | KPI ordering and content match desktop, but the visual variant differs for `k1`: mobile draws it as a fully amber-tinted tile, desktop renders it white with a small amber pill. | VISUAL_ONLY |
| Mobile chart eyebrow `7 DAYS · REVENUE` (vs desktop `REVENUE · LAST 7 DAYS`) and `+14%` pill placed inside the chart card right-side (vs. desktop where the same delta lives inside the KPI `k2` card) | none | Mobile and desktop use different copy for the same chart eyebrow, and the `+14%` indicator appears in two different places across breakpoints. | COPY_CHANGE |
| Mobile recent orders — `Last 3 today` (vs desktop `Last 5`); 3 cards instead of 5 rows | none | Different row count on mobile. | COPY_CHANGE |
| Mobile recent orders cards omit the `arrow-right` icon next to "View all" | none | Visual-only delta. | VISUAL_ONLY |
| Mobile low stock — same 3 rows but card padding/typography compressed | none | Visual-only delta. | VISUAL_ONLY |
| Mobile payouts callout — vertical layout, title split into eyebrow `Next payout` + value `₨ 1,12,500` (desktop is one combined `Next payout · ₨ 1,12,500`); body drops the word "registered"; CTA is full-width | none | Mobile + copy diff. | COPY_CHANGE |
| Mobile bottom tab bar — Dashboard (active) / Products / Orders / Ledger / More | none — no bottom-tab pattern in code | New chrome surface. Per `02-design-inventory.md` §3.9 + Q19, "More" is out of scope. The Orders tab on the bottom bar **does not** carry the amber `8` badge that the desktop sidebar shows. | NEW_INTERACTION |
| (existing) Sticky header text "Vendor" + `LogoutButton` | (no Pencil counterpart on this screen) | The current sticky header is being replaced by the ink top bar; the standalone `LogoutButton` is implied to move into the user-pill / account drawer (drawer not drawn for vendor — `02-design-inventory.md` §4.4 lists only Buyer · Account drawer). | REMOVED_FIELD |
| (existing) `<SidebarTrigger />` (mobile-collapse trigger from shadcn `Sidebar`) | Pencil mobile uses bottom-tab navigation, not a collapsible side drawer | The desktop sidebar isn't collapsible in Pencil; mobile abandons the sidebar entirely in favor of the bottom tab bar. The sheet-style drawer pattern from shadcn `Sidebar` may no longer be needed for vendor mobile. | CHANGED_INTERACTION |
| (existing) `Add Product` sidebar item → `/vendor/products/new` route | Pencil sidebar drops this; "Add product" lives only as a dashboard CTA | See REMOVED_FIELD above; routing implication is in §4. | CHANGED_INTERACTION |

---

## 3. Schema / type implications

For every NEW_FIELD / REMOVED_FIELD in §2, what schema/type/API changes would the design require? Each item is also restated as a numbered open question in §5.

### 3.1 Top-bar / shell (NEW_FIELD: vendor identity in chrome)

The top bar wants three vendor-identity fields and the mobile app bar wants one:
- `shopName` — already on `vendors` (`packages/database/src/schema/vendors.ts`).
- Vendor avatar / initials — derivable from `user.name` (no `users.image` is being used in the chrome design, just initials).
- "Vendor" role label / `VENDOR` rotated badge — derivable from `user.role`.

Today the vendor layout doesn't fetch the vendor record. The current sticky header just shows the literal string "Vendor". To wire the new top bar, the layout needs to load `vendors` row joined to `user` for the signed-in vendor.

API change: either a new `GET /api/vendor/me` (returning vendor + user fields) or an SSR fetch in the layout via `@repo/database`. Neither exists today.

### 3.2 Sidebar Orders badge (NEW_FIELD: count of pending orders)

The amber `8` next to Orders is a count of "new"/pending orders for this vendor.

- Source: `sub_orders` rows where `vendorId = currentVendorId` AND `status = 'pending'`.
- Cardinality: drawn as a single number; no overflow ("99+") drawn.
- Refresh cadence: not specified. Plausible: per-page render (SSR) or a polling React Query hook.

API change: either include the count in the new `GET /api/vendor/me` payload, or expose `GET /api/vendor/orders/pending-count`. Neither exists.

### 3.3 Sidebar `Settings` entry (NEW_INTERACTION; routing-only schema implication)

The entry routes somewhere, but Pencil doesn't draw a Vendor Settings screen.

- No route file (`/vendor/settings`) exists.
- No constants entry (`ABSOLUTE_ROUTES.VENDOR_SETTINGS`) exists.

This is mostly a routing question (§4) but it does imply at least an `ABSOLUTE_ROUTES.VENDOR_SETTINGS` and a route file (even if it's a stub). See Q3.

### 3.4 Header eyebrow `MONDAY · 28 APRIL · GUJRANWALA` (NEW_FIELD)

Three pieces:
- Weekday — derived from current date (no schema implication).
- Day · Month — derived from current date (no schema implication).
- City — `GUJRANWALA` (uppercased). Source field is ambiguous: `vendors.hub` exists (no description of values) and `vendors.city` exists. **Two candidate fields, design could use either**.

No new column needed; **mapping question only** (Q4).

### 3.5 Header title (COPY_CHANGE: shopName not "Vendor Dashboard")

`vendors.shopName` already exists. Change is presentation-only but it does require the layout/page to fetch the vendor row.

### 3.6 KPI `k1` Orders Today (NEW_FIELD: today's count + status breakdown)

- Total today — count of `sub_orders` for this vendor with `created_at` in today (vendor's local TZ).
- Sub-counts `8 NEW · 4 PACKED` — `pending` and `packed` from `sub_orders.status`.
- "NEW" is a display-only label per `02-design-inventory.md` Q9 (maps from `pending`).

Schema: no migration needed. API: new endpoint `GET /api/vendor/dashboard/kpis` (or per-tile endpoints). Timezone source for "today" is unspecified.

### 3.7 KPI `k2` Revenue MTD + delta (NEW_FIELD)

- MTD revenue — sum over `sub_orders.itemsTotal` (or `sub_orders.codAmount`?) for this vendor in the current month with `status` ∈ ?
- `+14% vs last month` — same-window delta.

**Three field-level ambiguities** (Q11):
- Which money column counts as "revenue" — `itemsTotal` (vendor receives), `codAmount` (customer pays, includes shipping), or vendor net (`itemsTotal + coolieFeeReimbursement`)? `screens/vendor-portal.md` does not specify.
- Which statuses qualify? Most plausibly `delivered` only (matches `vendor_ledger.type=sale_revenue` semantics) — but the breakdown framing in `features/vendor-payouts/surface-map.md` shows a 7-day return window before payout, so MTD might be "net of returns" or "gross including not-yet-eligible".
- "Last month" comparison window — calendar-month vs. trailing 30 days?

Schema: no migration needed. API: new endpoint.

### 3.8 KPI `k3` Active Listings + Low Stock pill (NEW_FIELD)

- `47` Active Listings — count of `products` for this vendor matching some "active" predicate.
- `3 LOW STOCK` — count of products where `stock <= someThreshold`.

**Schema gap (`screens/vendor-portal.md` Open Q1 also flags this):**
- `products` has no `status` enum (no `draft` flag). The Pencil Vendor Products screen draws stamps `ACTIVE / LOW STOCK / DRAFT`, but the schema only has `stock` and `version`.
- `products` has no `lowStockThreshold` (per-product) or any tenant-level low-stock threshold. The "Low stock" count requires either a per-product threshold or a constant.
- No `archived`/`deleted_at` either, so "active" might collapse to "not deleted = all rows", but design draws `54 total` vs `47 active` on the products screen, implying the two differ.

Schema implications (each becomes a question — Q12, Q13):
- Add `products.status text` (enum: `active|draft|archived` etc.)?
- Add `products.lowStockThreshold integer` (or tenant constant)?
- Add `products.deletedAt`?

### 3.9 KPI `k4` Payout Pending (NEW_FIELD)

Per `features/vendor-payouts/surface-map.md` (already user-answered):
- A new `payout_runs` table is needed.
- Fields drawn: `payout_pending_amount`, `payout_release_date` (Friday), `payout_bank_last4` (in callout, not in tile).

`vendors` has `bankName/accountTitle/iban`. The "ending 4291" rendering implies `iban` is masked at display time.

API: new `GET /api/vendor/payouts/next` (already in payouts surface map). No additional schema work beyond what's already in the payouts surface map.

### 3.10 Sales chart series (NEW_FIELD)

- `revenue_last_7_days_total`, `daily_average`, `best_day` (label + computed).
- 7 daily bars (TUE→MON in Pencil — relative to today).
- Segmented filter `7D / 30D / 90D`.

Schema: no migration. API: new endpoint `GET /api/vendor/dashboard/sales-series?range=7d|30d|90d`. Returns daily buckets.

Charting library: `01-codebase-map.md` §1 lists no charting dep. The current bars are simple rects (per `04-design-system-implementation-log.md` "Sales bar chart — defer"). Can be implemented with plain rectangles + flex layout per the existing design-system pattern. **No library required**.

### 3.11 Recent orders rows (NEW_FIELD)

Each row needs:
- buyer "shop name" — there is no `users.shopName` or `users.businessName` today.
- city — available on the order's snapshot `addresses` row (`addresses.city`).
- order display id — `orders.displayId` exists, but format is `ORD-…` not `SM-…` (Pencil prefix).
- created-at time — `sub_orders.createdAt` or `orders.createdAt`.
- item count — `sum(order_items.quantity)` for this sub-order.
- weight — `sub_orders.weightGrams` exists.
- amount — ambiguous: `sub_orders.codAmount` (gross) or `sub_orders.itemsTotal` (vendor view) or `orders.grandTotal` (whole-order). Pencil writes `₨ 18,420` but the source field isn't explicit.
- status — `sub_orders.status` mapped to display label per Q9.

**Schema gaps (Q15):**
- `users.shopName` / "buyer shop name" — does not exist. Could be a new `users.businessName` field, or could be derived from `addresses.title` (current `addresses.title` is something like "Home"/"Office", not a business name), or could come from a different source.
- Display id prefix `SM-` vs `ORD-` (Q14).

API: extend `GET /api/vendor/orders` with a "today" filter, OR new `GET /api/vendor/dashboard/recent-orders`.

### 3.12 Low stock rows (NEW_FIELD)

Each row needs:
- product name — `products.name`.
- SKU — `products` has no `sku` column. Currently `slug` is the unique product identifier. Mapping unclear (Q16).
- sales velocity (`~14/day`) — derived from `order_items.quantity` over a window. No endpoint.
- remaining stock — `products.stock`.
- low-stock threshold — see §3.8.

API: new `GET /api/vendor/dashboard/low-stock` (or part of a single dashboard endpoint).

### 3.13 Top sellers rows (NEW_FIELD)

- rank, product name, units sold over 30 days.
- Source: aggregate `order_items.quantity` joined to `products` (vendor-scoped) over the last 30 days.

API: new endpoint or part of consolidated dashboard endpoint.

### 3.14 Payouts callout (NEW_FIELD)

Per `features/vendor-payouts/surface-map.md`:
- `payout_pending_amount` (already covered above).
- `payout_release_date` (already covered).
- bank info — composed of `vendors.bankName` + masked `iban` (last 4). Pencil writes "Allied Bank account ending 4291" — **but** the ledger frame writes "Meezan Bank · Saleem Bhai" (per `features/vendor-payouts/surface-map.md` Q3, the dashboard/ledger amount+date+bank-name discrepancy is "design churn"). The dashboard text composition is `${bankName} account ending ${last4(iban)}`.

### 3.15 Removed fields (REMOVED_FIELD: implications)

- `LogoutButton` in the sticky header — implied to move into the account drawer / user pill, but no drawer is drawn for vendor screens. Where does logout live now?
- `Add Product` sidebar entry → moved to dashboard CTA. Routing implication only.

---

## 4. Behavior implications

For every NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE in §2, what code changes are implied?

### 4.1 "This month" filter pill (NEW_INTERACTION)

- Pencil draws **one** state (active label "This month"). No dropdown, no menu items, no other states drawn.
- Behavior unspecified: is it click → opens a select / dropdown / popover with options like `Today / This week / This month / Last month / This year`? Or is it a static label? (Q1)
- If interactive, it would re-scope which subset of dashboard data — KPIs only? KPIs + chart + recent orders? Q1.
- API impact: every endpoint listed in §3 would need to accept a `range` parameter.

### 4.2 "Add product" CTA (NEW_INTERACTION)

- Plausible destinations:
  - `/vendor/products/new` (current).
  - `/vendor/products` with the empty-state "add" view per `02-design-inventory.md` Q11 (collapse-to-single-page).
- Per Q11 in `02-design-inventory.md` (already user-answered: "collapse to a single scroll page"), the second is canonical. Routing implication: clicking "Add product" navigates to `/vendor/products` and opens an empty form. The existing `/vendor/products/new` route may be retired.

### 4.3 "View ledger" link (NEW_INTERACTION)

- Routes to `/vendor/ledger`. Per `01-codebase-map.md` Q9, this route has a constant but no page file. Per `features/vendor-payouts/surface-map.md`, the ledger screen is a separate revamp (build order: ledger before dashboard touchpoints).
- Code-path change: dashboard requires a working `/vendor/ledger` destination, otherwise the CTA leads to a 404.

### 4.4 Sales-chart segmented control `7D / 30D / 90D` (NEW_INTERACTION)

- Three states. Active: `paper-2` fill. Inactive: no fill drawn (Q5).
- Selection updates the bars + the eyebrow value + the sub line.
- Whether the chart-window selection also affects the header KPI scope is undrawn.

### 4.5 Recent orders "View all" (NEW_INTERACTION)

- Destination: `/vendor/orders` (existing route). No new code path.

### 4.6 Bottom tab bar navigation (NEW_INTERACTION)

- Routes per tab:
  - `tb1` Dashboard → `/vendor/dashboard`
  - `tb2` Products → `/vendor/products`
  - `tb3` Orders → `/vendor/orders`
  - `tb4` Ledger → `/vendor/ledger`
  - `tb5` More → out of scope (Q19 of `02-design-inventory.md`).
- Active state derivation: `usePathname()` + `startsWith` style match (consistent with current sidebar logic).
- Visibility: mobile only (per `02-design-inventory.md` §3.9). Desktop keeps the sidebar.
- Vendor mobile pages today don't have a bottom tab bar; this would be added in `vendor-layout` and gated by viewport. (Whether responsive container queries or a media query is preferred is a Phase 4 concern, not a gap-analysis decision.)

### 4.7 Top-bar bell icon + user pill (NEW_INTERACTION / CHANGED_INTERACTION)

- Bell — out of scope per Q19 of `02-design-inventory.md`. Q1 here re-asks where it routes (or whether it should not be wired at all in Phase 4).
- User pill — `02-design-inventory.md` §3.10 implies an account drawer, but **no vendor account drawer is drawn**. Today the sticky header has a `LogoutButton`; if the user pill replaces it, where does logout go?

### 4.8 New states implied but not drawn (NEW_STATE)

Pencil draws only the loaded "happy path" of the dashboard. **No** loading skeleton, **no** empty states, **no** error frames are drawn for any of: KPI tiles, chart, recent orders, low stock, top sellers, payouts callout. Behavior is unspecified for:
- A vendor with zero orders today (Q17).
- A vendor with zero low-stock items (Q17).
- A vendor with no completed payouts yet (Q17).
- A vendor with zero products (Q17).
- A network/server error on any panel (Q17).
- A vendor whose bank info isn't configured (Q17).

(`features/vendor-payouts/surface-map.md` Q9 was answered "implement all the empty states" — but for the dashboard, the same answer hasn't been recorded.)

---

## 5. Open questions for me

Numbered. Every NEW_FIELD / REMOVED_FIELD / NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE / COPY_CHANGE / AMBIGUOUS row in §2 is reflected here.

### Shell + chrome

1. **"This month" filter pill** — *Observed:* pill rendered as a single static look in Pencil; no dropdown panel, options list, or alternate states drawn. *Question:* what is the interactive model? Plausible answers:
   - (a) Click opens a dropdown of preset windows (e.g. `Today / This week / This month / Last month / Last 3 months / This year`).
   - (b) It cycles through presets on each click.
   - (c) It's a static label and not interactive (filter scope is fixed).
**Answer:** Click opens a dropdown of preset windows (Today / This week / This month / Last month / This year).

2. **Filter scope** — *Observed:* the "This month" pill sits in the page header; Pencil doesn't show wiring lines. *Question:* which sections does the filter re-scope?
   - (a) Only the KPI row.
   - (b) KPI row + chart + recent orders + low stock + top sellers (everything).
   - (c) Only KPI row, with chart having its own `7D/30D/90D` segmented control.
**Answer:** Re-scopes everything (KPI row + recent orders + low stock + top sellers); chart keeps its own segmented control.

3. **Sidebar `Settings` entry** — *Observed:* a `Settings` row appears in the sidebar (lucide `settings`, "ACCOUNT" section). No Vendor · Settings screen exists in Pencil (`02-design-inventory.md` §4.4 lists only Dashboard / Products / Orders / Ledger). No `/vendor/settings` constant or route exists in code. *Question:* what does the row do?
   - (a) Routes to a new `/vendor/settings` screen that simply isn't in the Pencil pass yet.
   - (b) Opens an account drawer (mirroring buyer's `EYc0L`) — not drawn for vendor.
   - (c) Stub-route only for visual completeness; Phase 4 leaves it inert until designed.
**Answer:** Routes to a placeholder `/vendor/settings` page; ships inert until designed.

4. **Header eyebrow city — `GUJRANWALA`** — *Observed:* uppercased city in the header eyebrow. `vendors` has both `city` and `hub`. *Question:* which field drives the eyebrow?
   - (a) `vendors.city` (vendor's home city).
   - (b) `vendors.hub` (the MNP hub the vendor ships through).
   - (c) Something composed (e.g., shipping today's hub).
**Answer:** `vendors.hub` (the MNP hub, matches the "Gujranwala" sample).

5. **Sales chart segmented control labels & states** — *Observed:* three pills `seg1/seg2/seg3` drawn; only `seg1` has the active `paper-2` fill; the inner labels are children that the layout snapshot abbreviated to `…`. *Question:* (a) confirm the labels are `7D / 30D / 90D` (per `screens/vendor-portal.md`)? (b) Confirm the active state matches `7D` (the eyebrow says "LAST 7 DAYS")? (c) What are the inactive-pill visuals — no fill at all, or `paper-2`-on-hover?
**Answer:** Confirm `7D / 30D / 90D` per `screens/vendor-portal.md`; `7D` is active by default; inactive pills have no fill.

6. **Sales chart day order** — *Observed:* desktop bars run `TUE → MON` and "today" (MON) is highlighted ink. Mobile bars run `T W T F S S M`. *Question:* does the chart always render "last 7 days inclusive of today" (so the rightmost bar is today and shifts daily), or is it "the past calendar week"? Plausible answers:
   - (a) Trailing 7 days ending today.
   - (b) Mon–Sun of the current week.
   - (c) Sun–Sat of the current week.
**Answer:** Trailing 7 days ending today (rightmost bar = today).

7. **Mobile hero drops "This month" + "Add product"** — *Observed:* desktop header has both the filter pill and the green CTA; mobile hero has neither. *Question:* are these intentionally removed on mobile (density), or do they reappear elsewhere on mobile (e.g., in the app bar / a floating action / a sheet)?
   - (a) Intentionally removed; mobile dashboard is read-only with no quick add and no filter.
   - (b) "Add product" is expected to be a FAB or top-bar icon button on mobile (not drawn).
   - (c) The filter pill is folded into the chart's `7D/30D/90D` segmented control on mobile.
**Answer:** Intentionally removed on mobile; mobile dashboard is read-only.

8. **Mobile recent orders pill labels** — *Observed:* card snapshots show pill containers with abbreviated children (`…`). Two pills drawn as `amber-bg/amber stroke` and one as `white/rule-2 stroke`. *Question:* confirm pill text/values: are these `NEW`, `NEW`, `PACKED` (matching the desktop sample copy for the first three rows of the same data set)?
**Answer:** Confirm — first two cards `NEW` (amber), third `PACKED` (neutral).

9. **Mobile bottom-tab `Orders` badge** — *Observed:* desktop sidebar `Orders` row has the amber `8` badge; mobile bottom-tab `Orders` does not draw a badge. *Question:* is the badge intentionally omitted on mobile, or is its absence design churn (i.e., we should also display the badge on the mobile tab)?
**Answer:** Design churn — add the badge on mobile too.

10. **Top bar bell + user-pill behavior** — *Observed:* bell icon and user pill drawn but no menu/sheet drawn. The current sticky header has a standalone `LogoutButton`. *Question:*
    - (a) Bell is a placeholder for a future notifications surface (out of scope per `02-design-inventory.md` Q19) — should it be omitted from Phase 4, or rendered inert?
    - (b) User pill on click — does it open an account drawer (none drawn for vendor), a dropdown menu, or just navigates to `/vendor/settings`?
    - (c) Where does logout move? (Drawer / dropdown menu / Settings screen?)
**Answer:** Bell: DEFERRED — see 06-scope-cut.md (Notifications / bell icon DROPPED in Out-of-scope clarifications). Do not implement this question's scope. UI placeholder: render the bell visually inert; no badge, no surface, no schema. User pill: Opens DropdownMenu; logout moves into it.

### Field semantics

11. **Revenue MTD source** — *Observed:* `₨ 4,86,300` and `+14% vs last month`. *Question:*
    - (a) Which money column counts: `sub_orders.itemsTotal`, `sub_orders.codAmount`, or vendor net (`itemsTotal + coolieFeeReimbursement`)?
    - (b) Which statuses qualify (`delivered` only, all non-`cancelled`, etc.)?
    - (c) "vs last month" — calendar-month-prior or trailing-30-days-prior?
    - (d) Are returns deducted (per `features/vendor-payouts/surface-map.md` Q4 returns ≡ `cancelled`)?
**Answer:** User answer: A11: lets keep the gross order value for now. might change later

12. **Active vs draft products schema gap** — *Observed:* "Active Listings 47" implies a non-active set (drafts/archived). Pencil products screen draws `ACTIVE / LOW STOCK / DRAFT` stamps. `products` has no status column. *Question:*
    - (a) Add `products.status` (`active | draft | archived`)?
    - (b) Is "draft" out of scope for the dashboard count and we should treat all rows as active for now?
    - (c) Or is `active` a derived predicate (e.g. `stock > 0`)?
**Answer:** STUBBED — see 06-scope-cut.md feature: Active vs Draft product status (light version). Implement with placeholder: `products.status enum('active','draft')`. Add `// TODO(post-v1):` comment at every touch point.

13. **Low-stock threshold schema gap** — *Observed:* `3 LOW STOCK` count + `6 left` / `4 left` / `2 left` rows. No threshold column exists. *Question:*
    - (a) Per-product `lowStockThreshold integer` column.
    - (b) Tenant-/system-wide constant (e.g. `<= 10` defines low).
    - (c) Derived from sales velocity (e.g. `<= 7 days of stock at current rate`).
**Answer:** STUBBED — see 06-scope-cut.md feature: Vendor product enrichment fields (SKU, brand, tagline, low-stock threshold, restock lead time, packaging unit, MRP). Implement with placeholder: per-product `lowStockThreshold` integer column. Add `// TODO(post-v1):` comment at every touch point.

14. **Order display id format `SM-…` vs `ORD-…`** — *Observed:* Pencil renders `#SM-2841`. Existing `orders.displayId` uses `ORD-…` (per `01-codebase-map.md` §5). *Question:*
    - (a) Update display-id generator to `SM-…` going forward?
    - (b) Keep `ORD-` and just use a different prefix in the UI?
    - (c) Pencil prefix is decorative and the real id format keeps current.
**Answer:** Keep `ORD-` prefix in DB; `SH-` is visual placeholder. Smallest delta — no migration.

15. **Buyer "shop name" field for recent-orders rows** — *Observed:* row 1 reads `Tariq Kiryana Store · Gujranwala`. There is no `users.shopName` / `users.businessName` today. *Question:* where does this string come from?
    - (a) Add `users.businessName text` (user-supplied at sign-up).
    - (b) Use `addresses.title` (currently meant for "Home" / "Shop" labels — not a business name).
    - (c) Compose from existing `user.name` (drop the "Store" suffix).
**Answer:** STUBBED — see 06-scope-cut.md feature: Buyer business / shop name (`user.businessName`). Implement with placeholder: `user.businessName` field. Add `// TODO(post-v1):` comment at every touch point.

16. **Product SKU field** — *Observed:* low-stock rows show `SKU 8924`. `products` has no `sku` column. *Question:*
    - (a) Add `products.sku text` (unique, distinct from `slug`).
    - (b) Derive a numeric ID from `products.id` (UUID) — won't render as `8924`.
    - (c) `SKU 8924` in Pencil is decorative; show `slug` or sequence id instead.
**Answer:** STUBBED — see 06-scope-cut.md feature: Vendor product enrichment fields (SKU, brand, tagline, low-stock threshold, restock lead time, packaging unit, MRP). Implement with placeholder: `sku` text per product, unique per vendor. Add `// TODO(post-v1):` comment at every touch point.

17. **Empty / loading / error states for the dashboard panels** — *Observed:* none drawn. *Question:* per panel (KPIs, chart, recent orders, low stock, top sellers, payouts callout) — what shape should each take when:
    - vendor has zero data in the relevant window?
    - the API call is in flight?
    - the API call fails?
    Specifically:
    - (a) Whole-card skeleton blocks (using existing `Skeleton` primitive).
    - (b) Per-row skeletons (e.g. 5 ghost rows in Recent orders).
    - (c) Empty-state copy with an action (e.g. "No orders yet — share your shop link").
    - (d) Error toasts + a "Retry" button on the card.
**Answer:** Whole-card `Skeleton` blocks; per-row skeletons in Recent orders; empty-state copy with action; error toast + Retry on the card.

### Copy

18. **Header subtitle** — *Observed:* desktop `Your shop at a glance — orders, stock, payouts.` vs mobile `Your shop today — orders, stock, payouts.`. *Question:* is this an intentional desktop/mobile copy split, or should one canonical sentence ship?
**Answer:** Pick desktop wording canonical ("Your shop at a glance — orders, stock, payouts.") on both breakpoints.

19. **KPI eyebrow `PAYOUT · PENDING` vs `PAYOUT PENDING`** — *Observed:* desktop has the middle dot, mobile drops it. *Question:* canonicalize on which?
**Answer:** Canonicalize on desktop format with the middle dot.

20. **Chart eyebrow `REVENUE · LAST 7 DAYS` vs `7 DAYS · REVENUE`** — *Observed:* desktop and mobile use opposite word orders. *Question:* one canonical eyebrow per breakpoint, or make them consistent?
**Answer:** Canonicalize — `REVENUE · LAST 7 DAYS` on both breakpoints.

21. **Payouts callout body** — *Observed:* desktop says `Releases Friday, 2 May to your registered Allied Bank account ending 4291.`, mobile drops "registered" (`…to your Allied Bank account ending 4291.`). *Question:* canonical body string?
**Answer:** Canonical desktop body ("Releases Friday, 2 May to your registered Allied Bank account ending 4291.").

22. **Sidebar item label "Products" vs current "My Products"** — *Observed:* Pencil sidebar uses "Products"; existing code uses "My Products". *Question:* is "Products" the intended canonical label, or is "My Products" preferred (since the storefront also has a Products surface)?
**Answer:** Adopt "Products" per Pencil.

23. **Recent orders header — desktop `Last 5 orders today` vs mobile `Last 3 today`** — *Observed:* count differs (5 vs 3) and copy differs. *Question:* are these intentional density choices, or should both honor a single rule (e.g. "show up to N, with N derived from viewport")?
**Answer:** Viewport-derived (5 desktop, 3 mobile) — keep the per-breakpoint count.

### Removed elements

24. **`Add Product` sidebar entry removal** — *Observed:* Pencil sidebar has no Add Product entry; `Add product` becomes a header CTA on Dashboard (and a primary CTA on Products page). *Question:* confirm the existing `/vendor/products/new` route should be retired entirely (per `02-design-inventory.md` Q11), and the sidebar entry deleted.
**Answer:** DEFERRED — see 06-scope-cut.md (vendor products route collapse confirmed in 02 §7 Q11). Do not implement this question's scope. UI placeholder: delete sidebar entry; retire `/vendor/products/new` route.

25. **`LogoutButton` in the sticky header** — *Observed:* current vendor layout sticky header has a `LogoutButton`; Pencil top bar replaces the header but doesn't draw an explicit logout affordance. *Question:* where does logout live going forward?
    - (a) Inside the user-pill dropdown / drawer (drawer not drawn for vendor).
    - (b) On a future Vendor · Settings screen.
    - (c) Keep a logout entry in the sidebar (Pencil doesn't draw it).
**Answer:** Moved into user-pill dropdown (matches admin chrome behavior).

---

(End of vendor-dashboard gap analysis. Stopping here per instructions — no implementation.)

Answers propagated on 2026-05-02 from 06-scope-cut.md + 07-default-proposals.md
