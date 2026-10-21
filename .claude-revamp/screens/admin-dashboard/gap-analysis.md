# Phase 4.1 — Admin · Dashboard · Gap Analysis

> **Phase:** Per-screen gap analysis (read-only — no code/design changes).
> **Date produced:** 2026-05-02
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop frame `AcB4v`, Mobile frame `R0bdxR`.
> **Existing route:** `/admin/dashboard` (`apps/web/src/app/admin/dashboard/page.tsx` → `apps/web/src/modules/admin/admin-dashboard/index.tsx`).
> **Existing layout:** `apps/web/src/app/admin/layout.tsx` → `apps/web/src/modules/admin/admin-layout/index.tsx` (+ `admin-sidebar`).
> **Source-of-truth note:** Per `01-codebase-map.md` Open Q4, the existing dashboard body is essentially placeholder copy ("Welcome to Admin… add widgets and stats here"). Almost every Pencil element has **no existing counterpart**.

---

## 1. Layout & structure

### 1.1 Admin shell (top bar + sidebar + main)

**Pencil (desktop, `AcB4v` 1440 × 1865):**

```
┌─ Top Bar (DqXvk) — ink fill, 56h, padding [10,32], justify space-between
│  ├─ Brand cluster (KS1av, gap 10): white-on-ink mark "S" (28×28, radius 14)
│  │   · "Shalmi Mart" wordmark · "·" sep · "Admin" link · ADMIN stamp (rotated 1°)
│  └─ Top right (fbAfG, gap 12): 320w dark search "Search vendors, products, orders…"
│      · bell icon (36×36) · avatar "ZA" green-2 32×32 · "Zaid Ahmed" 13/600 · chev-down
└─ Below top bar (U5eYHl): Sidebar (MNFK5, 240w) + Main (mib0Z, fills remaining)
```

**Pencil sidebar (`MNFK5` 240w, white fill, 1px right `rule`, padding [16,12,24,12], gap 4):**

| Index | Node ID | Type | Label | Icon | Notes |
|---|---|---|---|---|---|
| 1 | `x9aIT` | eyebrow | OVERVIEW | — | mono 11/700, ink-3, padding 8 |
| 2 | `XuraD` | nav | Dashboard | `layout-dashboard` | **Active** — paper-2 fill, ink text 13/700, trailing `chevron-right` |
| 3 | `Wxdq2` | nav | Sales reports | `chart-line` | ink-2 13/600 |
| 4 | `M53gud` | eyebrow | CATALOG | — | padding [12,8,4,8] |
| 5 | `riPzn` | nav | Vendors | `store` | |
| 6 | `tdtJL` | nav | Categories | `folder-tree` | |
| 7 | `zgulf` | nav | Banners | `image` | |
| 8 | `kK1Uu` | nav | Products | `package` | |
| 9 | `xgABs` | eyebrow | OPERATIONS | — | |
| 10 | `aGq43` | nav | Orders | `shopping-bag` | trailing **count badge "24"** (ink fill, mono 10/700 white, radius 10) |
| 11 | `U7w55U` | nav | *(icon only — `users`, no text label drawn)* | `users` | label missing in Pencil; assumed "Users" → see Q-SB-7 |

Total: **3 section eyebrows + 8 nav rows (counted)**. The brief in `02-design-inventory.md` §4.3 said "~11 nav items" — this is items+eyebrows, not pure nav rows.

**Pencil Main (`mib0Z`, vertical layout, gap 24, padding [32, 40, 80, 40]):**

```
1. Breadcrumb (vdFVE)              — Admin › Overview › Dashboard
2. Header (MMe2p)                  — title "Dashboard" 32/800 + sub line · 3 right-side action buttons
3. KPI Grid (fbriM)                — 4 cards in one row, gap 16
4. Two Col Row (h5F5yo)            — Sales by vendor (fill) + Order status (380w)
5. Recent Orders Table (NLL4O)     — sticky paper-2 header + paper-2 column row + 7 data rows
6. Bottom Row (cy06R)              — Top sellers (fill) + Audit log (fill)
```

**Existing admin shell (`modules/admin/admin-layout/index.tsx`):**

- Single light header (NOT ink). 56h-equivalent, `border-border bg-background`, `<SidebarTrigger>` + plain "Admin" `<span>` + `<LogoutButton>` on right.
- No brand mark, no admin stamp, no global search, no notifications bell, no user avatar/name cluster.
- Sidebar (`AdminSidebar`) has **one** `SidebarGroup` labelled "Navigation" with **4 items**: Dashboard, Vendors, Categories, Promo Banners. No section eyebrows; no count badges; no icons match Pencil verbatim (uses `LayoutDashboardIcon`, `StoreIcon`, `TagIcon`, `ImageIcon` — `TagIcon` ≠ Pencil's `folder-tree`; `ImageIcon` matches; the rest match by intent).
- Main content area: `bg-background flex-1 p-4 md:p-6` — no breadcrumb, no header pattern, just a blank container.

### 1.2 Mobile

Pencil mobile (`R0bdxR`, 420 × 2084):
- Ink top bar (`EbRD6`, 56h): `menu` icon + page title left; bell + avatar right. No sidebar (collapsed behind menu).
- Main scroll (`w8UQ4`): title block (`JjTfa`), range/action row (`Odpz1`), 2-up KPI tiles (`ForHQ` — only 2 cards visible, not 4), big card (`L6rlrO`, 417h — likely sales-by-vendor variant), big card (`l5MFo`, 221h — order status), and a vertical stack of 5 sub-frames (`sZYqd`, 957h) which is the recent-orders list as cards + bottom sections.

Existing mobile: same admin layout — `SidebarProvider` collapses, no separate mobile chrome design. Header is light, not ink.

### 1.3 KPI grid + tables (zoom on Pencil)

**KPI Grid (`fbriM`)** — 4 equal-width cards, gap 16. Each card (`dFzEs`, `RVyvo`, `xeesa`, `dA9O5`):
- white fill, `rule` 1px border, radius 8, padding 24, vertical layout, gap 8
- mono eyebrow (11/600/0.12 ls, ink-3): TOTAL SALES / TOTAL ITEMS LISTED / TOTAL ORDERS / ACTIVE VENDORS
- mono numeric (32/800, ink): "Rs. 18.4 L" / "12,840" / "342" / "64"
- delta row (gap 6): up-right or down-right arrow + sans 12/600 colored text
  - k1: green "+12.4% vs last month"
  - k2: green "+412 added this month"
  - k3: green "+8.2% vs last month"
  - k4: amber "−2 deactivated" (down arrow)

**Sales by vendor card (`l7EB5`)** — white, radius 8, rule border, padding 24, gap 16
- Header (`Zjhwr`, justify-between): left = "Sales by vendor" 18/700 + sub "May 2026 · 6 of 64" 12 ink-3; right = "See all vendors" 13/600
- 6 vendor rows (`wtWhA`, gap 14). Each row: top line (name sans 14/600 + amount mono 14/700 right) + bar (24h, paper-2 fill, rule border, radius 4) with absolute-positioned ink-fill rectangle (variable width = % of total) + percent label mono 11/700 right-aligned.
- Vendors shown: Saleem Bhai Snacks (Rs. 2,84,000 · 24%), Hafiz Tea Distributors (Rs. 2,12,400 · 18%), Ehsan Trading (Rs. 1,80,200 · 15%), Tel Wala Bazaar (Rs. 1,45,600 · 12%), Dalda Foods (Rs. 1,12,800 · 10%), "Other vendors (58)" (Rs. 2,52,300 · 21%).

**Order status card (`P5ltSN`)** — white, radius 8, rule border, padding 24, fixed 380w, gap 16
- Header (`TOzFi`): "Order status" 18/700 + "May 2026 · 342 total orders" 13 ink-3
- 3 status tiles (`v1bmmM`, gap 10): each radius 8, padding 16, 1px tinted border, gap 14
  - PENDING: amber-bg fill, amber border, `alarm-clock` icon, "PENDING" eyebrow + "32" 28/800 + "orders" caption
  - DELIVERED: green-bg, green border, `check`, "286"
  - CANCELLED: red-bg, red border, `x`, "24"
- Footer note (`dF212`, 1px top rule, padding-top 12): "Avg fulfillment 1.8 days · SLA target 2 days" mono 11 ink-3 centered

**Recent Orders Table (`NLL4O`)** — white card, radius 8, rule border
- Sticky head (`erY3U`, paper-2, padding [16,20], 1.5px bottom rule-2): "Recent orders" 18/700 left + "View all 342" 13/600 right
- Column headers row (`iipfC`, paper-2, padding [12,20], 1px bottom rule), 7 fill-container columns: ORDER ID, CUSTOMER, ITEMS, WEIGHT, TOTAL, STATUS, PLACED (all mono 11/700/0.08 ls ink-3)
- 7 data rows (`TCLWS`, `CATIm`, `v95DTc`, `X1est`, `aNed4`, `PtIMl`, `esSEN`), padding [14,20], 1px bottom rule per row (0 on last). Each row's columns:
  1. order id #SH-XXXXX (mono 13/700 ink)
  2. customer name 13/600 ink + shop name 11 ink-3 (vertical, gap 2)
  3. items count (mono 13 ink-2)
  4. weight "X.X kg" (mono 13 ink-2)
  5. total "Rs. X" (mono 13/700 ink)
  6. status STAMP (rotated 1°, radius 3, 1.5px stroke, padding [3,8], mono 11/700) — variants seen: DELIVERED (green), OUT FOR DELIVERY (blue), AT MNP HUB (blue), PENDING (amber)
  7. placed date "DD MMM" (mono 12 ink-3)

Sample rows seen: #SH-24891 Tariq Ahmed/Tariq Kiryana (28 / 42.8 kg / Rs.1,16,380 / DELIVERED / 24 Apr); #SH-24890 Imran Saeed/Saeed General (— / 24.6 kg / Rs.78,420 / OUT FOR DELIVERY / 24 Apr); #SH-24889 Bilal Akram/Akram Mart (32 / 51.2 kg / Rs.1,42,800 / AT MNP HUB / 23 Apr); #SH-24887 Rashid Khan/Khan C&C (— / — / Rs.96,840 / DELIVERED / 22 Apr); plus a PENDING/Rs.56,200/23 Apr row.

**Bottom Row (`cy06R`)** — two equal cards, gap 16

- **Top sellers this week (`Yf7Mh`)**: white, radius 8, rule border, padding 24, gap 16
  - Header: "Top sellers this week" 18/700 + "Week of 21–27 Apr 2026" 12 ink-3
  - 5 list rows (`wJ56y`, gap 8). Each row radius 6, padding [10,12], gap 12, fills: row 1 = `paper-3` (highlighted #1), rows 2–5 = `paper-2`
  - Row content: rank "#1" mono 13/800 + vendor name sans 13/600 (fill) + amount mono 13/700 + trend icon (`arrow-up-right` green / `arrow-down-right` red / `minus` ink-3)
  - Vendors: Saleem Bhai Snacks (Rs.84,200 ↑), Hafiz Tea Distributors (Rs.62,400 ↑), Ehsan Trading (Rs.48,800 ↓), Tel Wala Bazaar (Rs.41,600 –), Dalda Foods (Rs.32,200 ↑)

- **Audit log (`UgNE1`)**: white, radius 8, rule border, padding 24, gap 16
  - Header: "Audit log" 18/700 + "Recent admin actions" 12 ink-3
  - 5 entries (`F2Amq`, gap 10). Each entry padding [8,0], 1px bottom rule, gap 12 (horizontal): timestamp (mono 11 ink-3, fixed-content) + action block (vertical, gap 2): action verb sans 13/600 ink + "<actor> · <target>" 11 ink-3
  - Entries: "24 Apr · 14:32 — Approved vendor — Zaid Ahmed · Saleem Bhai Snacks"; "24 Apr · 11:08 — Edited banner — Faiza Akhtar · Eid Promo Banner"; "23 Apr · 18:45 — Removed product — Zaid Ahmed · SKU 8841 (expired)"; "23 Apr · 09:21 — Activated category — Faiza Akhtar · Spices & Masalas"; "22 Apr · 16:02 — Reviewed dispute — Zaid Ahmed · Order #SH-24862"

---

## 2. Element-by-element diff

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| **Top bar** ink fill, 56h, brand mark + wordmark + "Admin" + ADMIN stamp + dark search + bell + avatar + name + chev | Light `<header>` in `admin-layout/index.tsx` — `SidebarTrigger` + plain "Admin" `<span>` + `LogoutButton` | Entire admin chrome is being replaced. Different fill (ink vs background), different content set. | NEW_INTERACTION |
| Brand cluster: 28×28 white-on-ink "S" mark + "Shalmi Mart" 14/700 + sep + "Admin" 13/500 + rotated ADMIN stamp | Not present in admin layout (storefront has `Shalmi` brand, but admin layout shows only word "Admin") | New brand block in admin chrome | NEW_FIELD |
| Global admin search field (320w, dark `#FFFFFF1A`, placeholder "Search vendors, products, orders…") | Not present | New search bar; needs target endpoints (vendors/products/orders) | NEW_INTERACTION |
| Bell icon (36×36) | Not present | Notifications affordance — but per `02-design-inventory.md` Q19 user said "ignore bell icon" | AMBIGUOUS |
| Avatar "ZA" (green-2 32×32, mono 11/800 white initials) + "Zaid Ahmed" 13/600 + chev-down | `LogoutButton` only (no avatar, no name, no menu trigger drawn) | Replacement of logout button with full user-menu trigger | CHANGED_INTERACTION |
| Sidebar — fill `white`, 240w, 1px right `rule`, padding [16,12,24,12], gap 4 | shadcn `Sidebar` (defaults via `packages/ui/src/components/sidebar.tsx`) with `bg-sidebar` (now white per token migration), default widths/padding | Padding & gap differ from primitive defaults; per `04-design-system-implementation-log.md` SidebarHeader/Group paddings noted as differing — confirmed deferred to per-screen sidebar | VISUAL_ONLY |
| Sidebar section eyebrow "OVERVIEW" (mono 11/700/0.12 ls ink-3, padding 8) | One `SidebarGroupLabel` "Navigation" (single group) | Pencil splits nav into 3 sections (OVERVIEW/CATALOG/OPERATIONS); existing has 1 group | NEW_FIELD |
| Sidebar section eyebrow "CATALOG" | (none) | New section grouping | NEW_FIELD |
| Sidebar section eyebrow "OPERATIONS" | (none) | New section grouping | NEW_FIELD |
| Sidebar nav: **Dashboard** (`layout-dashboard`, active = paper-2 fill, ink 13/700, trailing `chevron-right`) | `ADMIN_NAV_ITEMS[0]` Dashboard with `LayoutDashboardIcon` (link to `/admin/dashboard`); active state via `isActive` prop on `SidebarMenuButton` | Active styling differs (Pencil shows trailing chevron-right; existing does not). Icon matches by intent. | VISUAL_ONLY |
| Sidebar nav: **Sales reports** (`chart-line`) | (none) | New nav item; no `/admin/sales-reports` route exists | NEW_FIELD |
| Sidebar nav: **Vendors** (`store`) | `ADMIN_NAV_ITEMS[1]` Vendors with `StoreIcon` → `/admin/vendors` | Match by intent | VISUAL_ONLY |
| Sidebar nav: **Categories** (`folder-tree`) | `ADMIN_NAV_ITEMS[2]` Categories with `TagIcon` → `/admin/categories` | Icon differs (TagIcon vs folder-tree) | VISUAL_ONLY |
| Sidebar nav: **Banners** (`image`) | `ADMIN_NAV_ITEMS[3]` Promo Banners with `ImageIcon` → `/admin/promo-banners` | Pencil label is "Banners", code is "Promo Banners" — same icon | COPY_CHANGE |
| Sidebar nav: **Products** (`package`) | (none) | New admin-side products nav. No `/admin/products` route today (vendor has `/vendor/products`). | NEW_FIELD |
| Sidebar nav: **Orders** (`shopping-bag`) + count badge "24" (ink fill, mono 10/700 white, radius 10) | (none) | New admin-side orders nav. No `/admin/orders` route today. Count badge implies open-orders count fetched on render. | NEW_FIELD |
| Sidebar nav 11 (icon `users` only, **no text label drawn**) | (none) | Pencil truncated/missing label for the last nav row. Likely "Users" or "Customers". | AMBIGUOUS |
| Logout entry point | `LogoutButton` rendered in admin header | Pencil shows no logout in sidebar — likely behind avatar dropdown (per drawer pattern in storefront `EYc0L`). Admin equivalent not drawn. | AMBIGUOUS |
| **Breadcrumb**: "Admin › Overview › Dashboard" (12/500 ink-3, gap 6, with `chevron-right` 14px ink-3 between) | (none) | New element on this screen | NEW_FIELD |
| **Page header** title "Dashboard" 32/800 ink, sub "Performance for May 2026 · last sync 2 min ago" 13 ink-3 | Existing dashboard renders `<h1 className="text-heading-lg font-bold">Dashboard</h1>` + body "Overview of your admin portal." | Title size & weight changes (heading-lg vs 32/800) AND subtitle copy is fully different ("Performance for May 2026 · last sync 2 min ago" vs "Overview of your admin portal.") | COPY_CHANGE |
| Header right: **range button** "Last 30 days" with `calendar` icon + chev-down (white card, rule-2 border, radius 6) | (none) | New control — date range filter that re-queries all KPIs/charts | NEW_INTERACTION |
| Header right: **Export CSV button** with `download` icon (white outline) | (none) | New action — needs export endpoint | NEW_INTERACTION |
| Header right: **"+ New report" button** (green-2 fill, white text 13/700, plus icon) | (none) | New CTA — destination unknown (sales-reports area?) | NEW_INTERACTION |
| **KPI card 1: TOTAL SALES** "Rs. 18.4 L" 32/800 + delta "+12.4% vs last month" green | (none) | New widget; needs sales-aggregation endpoint | NEW_FIELD |
| **KPI card 2: TOTAL ITEMS LISTED** "12,840" + delta "+412 added this month" green | (none) | New widget; needs product-count + month-delta endpoint | NEW_FIELD |
| **KPI card 3: TOTAL ORDERS** "342" + delta "+8.2% vs last month" green | (none) | New widget; needs order-count aggregation | NEW_FIELD |
| **KPI card 4: ACTIVE VENDORS** "64" + delta "−2 deactivated" amber (down arrow) | (none) | New widget; needs vendor-count + delta. Pencil also semantically separates "active" from "deactivated this period". | NEW_FIELD |
| **Sales by vendor card** with 6 ranked rows (5 named + "Other vendors (N)" rollup), per-row bar with % share, "See all vendors" CTA | (none) | New widget; needs vendor-revenue aggregation, share calculation, top-5 + rollup logic | NEW_FIELD |
| Sales-by-vendor "See all vendors" link (no destination drawn) | (none) | Probable navigation to `/admin/vendors` filtered by sales — destination unspecified | NEW_INTERACTION |
| **Order status card** with 3 status tiles (PENDING amber / DELIVERED green / CANCELLED red) showing count per status, plus footer "Avg fulfillment 1.8 days · SLA target 2 days" | (none) | New widget; needs status-bucket counts + fulfillment-time aggregation. Note Pencil has 3 buckets, but `orders.status` in DB is `processing/partially_fulfilled/completed`, and `sub_orders.status` adds `packed/handed_to_courier/delivered/cancelled` — see Q-OS-1. | NEW_FIELD |
| Order-status footer "Avg fulfillment 1.8 days · SLA target 2 days" | (none) | New metric; SLA target is a config value, not a DB field today | NEW_FIELD |
| **Recent Orders Table** white card, sticky paper-2 head, paper-2 column row, 7 data rows, columns: ORDER ID, CUSTOMER, ITEMS, WEIGHT, TOTAL, STATUS, PLACED | (none) | New widget; needs `GET /api/admin/orders?recent=true&limit=7` (no admin orders endpoint exists today) | NEW_FIELD |
| Recent-orders table header CTA "View all 342" | (none) | Implies a future `/admin/orders` route | NEW_INTERACTION |
| Status stamp variants used in this table: DELIVERED, OUT FOR DELIVERY, AT MNP HUB, PENDING | `Stamp` primitive (`packages/ui/src/components/stamp.tsx`) added in Phase 3 with intent variants `success/info/neutral/warning/critical` | DELIVERED→success, OUT FOR DELIVERY→info, AT MNP HUB→info, PENDING→warning. Per 02 Q9, these map onto existing DB statuses (`delivered`, `handed_to_courier`, `pending`). The display label "OUT FOR DELIVERY" differs from "AT MNP HUB" but per inventory both come from status `handed_to_courier` — see Q-OS-2. | AMBIGUOUS |
| Customer cell with 2-line "name + shop" pattern | (none, plus DB schema gap) | `orders.userId` references `user` (which has only `name`, no shop). Shop name appears to come from a related field that doesn't exist on the customer side — see Q-RT-1. | NEW_FIELD |
| Items count column (e.g. "28") | (none, but derivable) | Not stored; derivable as `SUM(order_items.quantity)` for sub_orders of an order | NEW_FIELD |
| Weight column (e.g. "42.8 kg") | (none, partly stored) | `sub_orders.weightGrams` exists per sub-order; needs roll-up to order level. Display unit is kg with one decimal. | NEW_FIELD |
| Total column "Rs. X,XX,XXX" South-Asian grouping | `orders.grandTotal` exists; no formatter today | Per 03 Q17 user chose South-Asian grouping. No util exists. | NEW_FIELD |
| Placed date column "DD MMM" | `orders.createdAt` exists | Display format new | VISUAL_ONLY |
| **Top sellers this week card** with 5 ranked rows (#1 highlighted paper-3), "Week of 21–27 Apr 2026" subtitle, trend arrow per row | (none) | New widget; needs vendor-revenue aggregation by week + WoW trend per vendor | NEW_FIELD |
| Top-seller trend icon (up=green, down=red, flat=ink-3 minus) | (none) | New visual encoding | NEW_FIELD |
| **Audit log card** with 5 recent entries (timestamp + action verb + actor · target) | `admin_audit_log` DB table exists (`packages/database/src/schema/admin-audit-log.ts`) but no API and no UI. | New widget consuming existing schema; needs `GET /api/admin/audit-log?limit=5` endpoint. Display formats: timestamp "DD MMM · HH:MM" mono; action verb derived from `action` column; actor from `adminId` (join `user.name`); target from `targetType` + `targetId` + `metadata`. | NEW_FIELD |
| Audit log entry copy: "Approved vendor", "Edited banner", "Removed product", "Activated category", "Reviewed dispute" | DB column `action` is freeform text — no enum, no current writers visible | Pencil samples imply a controlled vocabulary; needs decision on action taxonomy. | AMBIGUOUS |
| **Mobile** ink top bar (menu + title + bell + avatar) | None — admin layout collapses sidebar via `SidebarProvider`/`SidebarTrigger`, header stays light | Mobile chrome is being replaced (different fill, different content) | NEW_INTERACTION |
| **Mobile** KPI grid shows only 2 tiles in the snapshot (not 4) | (none) | Possibly first-2 cards visible on initial scroll, others below — geometry shows just 2 — see Q-MOB-1 | AMBIGUOUS |
| Existing element: `<LogoutButton>` in admin header | Not drawn anywhere in Pencil admin chrome | Pencil omits the explicit logout button in chrome | REMOVED_FIELD |
| Existing element: `<SidebarTrigger>` (mobile menu toggle) | Pencil mobile top bar shows a `menu` icon (`a2naK`) that maps to the same trigger | Visual differs (in dark bar) but functional intent matches | VISUAL_ONLY |
| Existing element: existing dashboard body copy "Welcome to Admin / Use the sidebar to navigate between Dashboard and Vendors. / This is the main dashboard. Add widgets and stats here." | Not in Pencil | Placeholder is being entirely replaced — but per CLAUDE.md don't assume removals are intentional, see Q-EX-1 | REMOVED_FIELD |

---

## 3. Schema / type implications

For every NEW_FIELD / REMOVED_FIELD row above, what schema/type/API work is implied. **None of these are proposed for implementation here** — this is a discovery list.

### 3.1 KPI sources (4 cards)

No analytics endpoints exist today. Each card needs a server-computed value plus a comparison delta against the chosen range.

| KPI | Required source | New API surface | Schema notes |
|---|---|---|---|
| TOTAL SALES "Rs. 18.4 L" | `SUM(orders.grandTotal)` over the range | `GET /api/admin/analytics/kpis?range=…` returning `{ sales: { value, deltaPct, trend } }` | Existing field. Display unit "L" (lakhs) is South-Asian shorthand — see Q-FMT-1. |
| TOTAL ITEMS LISTED "12,840" | `COUNT(products)` overall + `COUNT(products WHERE createdAt >= rangeStart)` for delta "+412 added this month" | Same KPIs endpoint | Existing fields. Note delta wording is **absolute count**, not %. |
| TOTAL ORDERS "342" | `COUNT(orders)` over the range; delta = % vs prior period | Same KPIs endpoint | Existing field. |
| ACTIVE VENDORS "64" | `COUNT(vendors WHERE isActive = true)` + count of vendors deactivated within range for delta "−2 deactivated" | Same KPIs endpoint | `vendors.isActive` exists. **Need an audit/event source for "deactivated this period"** — `vendors` has no `deactivatedAt` or status-history table. Could be reconstructed from `admin_audit_log` if `action = 'deactivated_vendor'` rows exist, but that vocabulary isn't enforced today — see Q-AUD-1. |

### 3.2 Sales by vendor (6 rows)

| Field | Source | Notes |
|---|---|---|
| Vendor name | `vendors.shopName` (or `user.name` for the bank-side?) — Pencil shows "Saleem Bhai Snacks" which reads like `shopName` | Existing field. |
| Sales total per vendor | `SUM(sub_orders.grandTotal-equivalent)` grouped by `sub_orders.vendorId` over range | `sub_orders` has `weightGrams`, `courierTrackingId`, COD/payout/cost ints (per `01-codebase-map.md` §5). **Need to confirm** which integer column represents vendor revenue (gross sales vs net payout) — see Q-SBV-1. |
| % share | computed = vendor sales / total sales over same range | Derived. |
| "Other vendors (N)" rollup | total sales − sum of top-5 | Derived. N = `COUNT(vendors with sales > 0) − 5`. |
| Range label "May 2026 · 6 of 64" | from header range filter + count of total active vendors | — |
| New endpoint | `GET /api/admin/analytics/sales-by-vendor?range=…&limit=5` | Returns top-N + rollup. |

### 3.3 Order status breakdown (3 tiles)

| Tile | Source mapping | Notes |
|---|---|---|
| PENDING 32 | Likely `COUNT(sub_orders WHERE status IN ('pending','packed','handed_to_courier'))` over range | DB doesn't have a single "pending" status — see Q-OS-1. |
| DELIVERED 286 | `COUNT(sub_orders WHERE status = 'delivered')` | Direct mapping. |
| CANCELLED 24 | `COUNT(sub_orders WHERE status = 'cancelled')` | Direct mapping. |
| Avg fulfillment "1.8 days" | `AVG(sub_orders.handedAt − orders.createdAt)` (or delivered timestamp − created) | `sub_orders.handedAt` exists per `01-codebase-map.md`; no `deliveredAt` field appears in the schema map — see Q-OS-3. |
| SLA target "2 days" | Config constant, **not in DB today** | New config value or new `system_settings` table — see Q-OS-4. |
| New endpoint | `GET /api/admin/analytics/order-status?range=…` | — |

### 3.4 Recent orders aggregation (7 rows)

| Column | Source | Notes |
|---|---|---|
| Order id | `orders.displayId` (e.g. `#SH-24891`) | Existing. Pencil format `#SH-XXXXX`; existing format `ORD-…` (per `01-codebase-map.md`) — see Q-RT-2. |
| Customer name | `orders.userId → user.name` | Existing join. |
| Customer **shop name** | **NOT a customer field today.** `vendors.shopName` exists per vendor user, but the table is `Tariq Ahmed / Tariq Kiryana Store`, suggesting a retailer-side shop name | Existing schema has no retailer-side shop. Either (a) reuse `addresses.title` (b) add `user.shopName` (c) interpret "Tariq Kiryana Store" as the address `title` field. **Material schema question** — see Q-RT-1. |
| Items count | `SUM(order_items.quantity)` per order | Derivable. |
| Weight (kg) | `SUM(sub_orders.weightGrams) / 1000` per order | Existing field. |
| Total | `orders.grandTotal` | Existing; needs South-Asian formatter. |
| Status | Order-level status. Pencil shows `delivered / out for delivery / at mnp hub / pending`. Existing `orders.status` is `processing / partially_fulfilled / completed` — incompatible vocabulary. `sub_orders.status` has the closer values (`pending / packed / handed_to_courier / delivered / cancelled`) — but an order can have multiple sub-orders with different statuses | **Display mapping is non-trivial when order has multiple sub_orders.** See Q-RT-3. |
| Placed date | `orders.createdAt` formatted as "DD MMM" | — |
| New endpoint | `GET /api/admin/orders?limit=7&sort=createdAt:desc` | None exists. |

### 3.5 Top sellers this week (5 rows)

| Field | Source | Notes |
|---|---|---|
| Vendor name | `vendors.shopName` | — |
| Weekly amount | `SUM(vendor revenue)` for current week (Mon–Sun) | Same source as sales-by-vendor — see Q-SBV-1. |
| Trend arrow | up/flat/down vs prior week | Compare current-week vs prior-week aggregate. |
| Highlighted #1 row | Pure visual (paper-3 vs paper-2) | — |
| New endpoint | `GET /api/admin/analytics/top-sellers?period=week&limit=5` | — |

### 3.6 Audit log feed (5 entries)

| Field | Source | Notes |
|---|---|---|
| Timestamp | `admin_audit_log.createdAt` formatted "DD MMM · HH:MM" | Existing. |
| Action verb (e.g. "Approved vendor") | `admin_audit_log.action` (text). Pencil samples imply controlled vocabulary | DB column is freeform `text()`. **No writers exist today** — none of the existing admin mutations (vendor create/update, category create/update, banner create/bulk-update) call into this table per a quick check. See Q-AUD-2. |
| Actor name | `admin_audit_log.adminId → user.name` | Join. |
| Target description (e.g. "Saleem Bhai Snacks", "Eid Promo Banner", "SKU 8841 (expired)", "Order #SH-24862") | `admin_audit_log.targetType` + `targetId` (+ `metadata`) | Requires per-targetType resolver: vendor → `vendors.shopName`; banner → `promotional_banners.title`; product → `products.name` (+ slug? + status from metadata?); category → `categories.name`; order/dispute → `orders.displayId`. **Dispute is not a current entity** — see Q-AUD-3. |
| New endpoint | `GET /api/admin/audit-log?limit=5` | — |

### 3.7 Top-bar additions

| Field | Source | Notes |
|---|---|---|
| Admin global search "Search vendors, products, orders…" | None today | Needs cross-entity search endpoint: `GET /api/admin/search?q=…` returning grouped results across vendors / products / orders. **No DB full-text index today.** |
| Bell / notifications | None | Per 02 Q19 user said "ignore bell icon" — surfaces as AMBIGUOUS. |
| User avatar initials "ZA" | Computable from `user.name` | — |
| User name "Zaid Ahmed" + chev | `user.name` from session | Avatar-trigger semantics unspecified — see Q-AVATAR-1. |
| ADMIN stamp (rotated) | Static badge | No data dependency. |

### 3.8 Sidebar additions

| Field | Source | Notes |
|---|---|---|
| Section eyebrows OVERVIEW / CATALOG / OPERATIONS | New `section`-grouping in `ADMIN_NAV_ITEMS` | Constants change in `admin-sidebar.constants.ts`. |
| Sales reports nav target | No `/admin/sales-reports` route | New screen / new route. |
| Products nav target | No `/admin/products` route (vendor-side `/vendor/products` exists) | New admin-side route distinct from vendor scope. |
| Orders nav target + count badge "24" | No `/admin/orders` route | New screen + count fetch (probably `COUNT(orders WHERE status NOT IN final_states)` polled / SWR'd). |
| Users (icon-only label) nav target | No `/admin/users` route | Label not drawn → see Q-SB-7. |

### 3.9 Date-range filter + Export

| Control | Required behavior | Notes |
|---|---|---|
| "Last 30 days" range button | Opens range picker, re-queries every KPI/widget on the page | Range options not enumerated in Pencil — see Q-RNG-1. |
| "Export CSV" | Streams CSV of currently-visible recent orders (or all orders in range?) | Scope of export not drawn — see Q-EXP-1. |
| "+ New report" CTA | Likely creates a new sales-report record / opens a dialog | No `reports` table today. Destination & data model both unknown — see Q-RPT-1. |

---

## 4. Behavior implications

For every NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE row, what code paths/endpoints/data fetching change.

### 4.1 Admin shell rewrite (top bar + sidebar)

- `apps/web/src/modules/admin/admin-layout/index.tsx` — replace light header with ink top bar. New code paths: admin search input → results dropdown; bell click (TBD per Q19); avatar dropdown menu (logout moves here from explicit `LogoutButton`).
- `apps/web/src/modules/admin/admin-layout/admin-sidebar/admin-sidebar.constants.ts` — restructure from 4 flat items to 3 sections × N items, with optional `badge` field for the Orders count. Add icon imports for `chart-line`, `folder-tree` (replacing `TagIcon`), `package`, `shopping-bag`, `users`, `chevron-right`.
- `admin-sidebar/index.tsx` — render eyebrows (mono uppercase) between groups, render trailing `chevron-right` on active item, render count badge slot, fetch the Orders count (server fetch on layout, or client SWR).
- New routes (route handlers/pages) implied by sidebar items: `/admin/sales-reports`, `/admin/products`, `/admin/orders`, `/admin/users` (label assumed).
- `LogoutButton` is presumably moved into the avatar dropdown — so the existing `LogoutButton` import in `admin-layout/index.tsx` either moves or is reused inside a `DropdownMenu` item.

### 4.2 Mobile chrome

- Mobile `<header>` becomes ink, with menu + page title + bell + avatar. Currently mobile is just the same desktop chrome at small width. New responsive split required.
- Sidebar collapses behind menu via existing `SidebarProvider`/`SidebarTrigger` — mostly compatible but visuals change.

### 4.3 Page header controls

- Range picker (`Last 30 days`): reads/writes a query-string param (likely `range=30d|7d|month|custom`); every KPI/widget re-fetches when it changes. Implementation: nuqs param + a single shared range hook the widgets subscribe to.
- Export CSV: `GET /api/admin/orders/export.csv?range=…` (new endpoint) → triggers download; loading state needed.
- "+ New report": opens a dialog (or routes to `/admin/sales-reports/new`) — destination undefined.

### 4.4 KPI grid widgets

- All 4 KPIs share a single `GET /api/admin/analytics/kpis?range=…` call (most efficient) with a React Query key like `['admin-kpis', range]`.
- Each card needs loading skeleton (Pencil shows no loading state — derived from token system per 03 Q7 answer) and error state. **Empty/error states not drawn in Pencil — see Q-STATES-1.**

### 4.5 Sales by vendor card

- `GET /api/admin/analytics/sales-by-vendor?range=…&limit=5` → top-5 with computed bar widths + rollup.
- "See all vendors" CTA — destination unspecified (probably `/admin/vendors` sorted by sales desc — see Q-SBV-2).

### 4.6 Order status card

- `GET /api/admin/analytics/order-status?range=…` → returns `{ pending, delivered, cancelled, avgFulfillmentDays, slaTargetDays }`.
- Status bucketing logic depends on Q-OS-1 resolution.

### 4.7 Recent orders table

- `GET /api/admin/orders?limit=7&sort=createdAt:desc` (new admin orders endpoint).
- Per-row click target — Pencil draws no row hover/click affordance, but a real recent-orders table almost always has row click → order detail. **Row click behavior is not drawn — see Q-RT-4.**
- "View all 342" link → `/admin/orders` (route doesn't exist yet).
- Status stamp rendering uses the existing `Stamp` primitive with intent variant chosen via the mapping in Q-OS-2.

### 4.8 Top sellers card

- `GET /api/admin/analytics/top-sellers?period=week&limit=5` → returns ranked vendors with weekly amount and WoW trend.
- Per-row click target — not drawn (probably vendor detail). See Q-TS-1.

### 4.9 Audit log card

- `GET /api/admin/audit-log?limit=5` (new endpoint).
- Resolver layer required to translate `(targetType, targetId)` → human label per Q-AUD-3.
- "View more" affordance not drawn — see Q-AUD-4.
- **Writers must be added** to existing admin mutations (vendor create/update, banner create/bulk-update, category create/update, etc.) to populate the table — without writers, the feed is permanently empty.

### 4.10 Sidebar navigation behavior

- Existing 4 nav items vs Pencil 8 nav items + 3 section eyebrows. The 4 net-new items (Sales reports, Products, Orders, Users) all imply new routes that don't exist. The Orders item additionally implies a backend count for the badge that polls/refetches.

---

## 5. Open questions for me

Numbered for reference. Every NEW_FIELD / REMOVED_FIELD / NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE / COPY_CHANGE / AMBIGUOUS row in §2 is represented here.

### Top bar / chrome

1. **Q-CHROME-1 — Brand cluster in admin top bar.**
   - **Observed:** Pencil draws a 28×28 ink-on-white "S" brand mark + "Shalmi Mart" wordmark + sep + "Admin" + a rotated ADMIN stamp in the top bar. Existing admin layout shows only a plain `<span>"Admin"</span>` next to the sidebar trigger.
   - **Question:** Is the brand mark + wordmark identical to the storefront brand, or is this a separate admin-only brand block? Should the ADMIN stamp use the existing `Stamp` primitive (`variant="neutral"` with white border on ink fill is non-standard — Pencil uses `#FFFFFF66` stroke, white text)?
   - **Plausible answers:** (a) reuse storefront brand component; (b) admin-only brand component; (c) new component shared across admin/vendor (vendor chrome has the same shape).

   **Answer:** New shared component across admin/vendor (vendor chrome has the same shape). Reduces duplication.

2. **Q-SEARCH-1 — Admin global search behavior.**
   - **Observed:** Pencil shows a 320w dark search field with placeholder "Search vendors, products, orders…" in the top bar. No code equivalent.
   - **Question:** What is the result behavior — inline dropdown of grouped results, or push to a `/admin/search?q=…` route? What entities does it search (vendors, products, orders only, or also categories / banners / users)?
   - **Plausible answers:** (a) inline dropdown grouped by entity; (b) full-page search results route; (c) entity-specific deep links (jump straight to /admin/vendors?q=…).

   **Answer:** STUBBED — see 06-scope-cut.md feature: Search route `/search`. Implement with placeholder: Inline dropdown grouped by entity (vendors / products / orders) — simplest UX, mirrors typical admin UX. Add `// TODO(post-v1):` comment at every touch point.

3. **Q-BELL-1 — Bell icon despite "ignore bell" answer.**
   - **Observed:** The Pencil top bar has a bell icon (36×36). User answer to 02 Q19 was "ignore More tab, and bell icon."
   - **Question:** Does "ignore" mean (a) drop the bell entirely from the implementation, (b) render the bell as a non-functional placeholder for visual fidelity, or (c) render and wire later?

   **Answer:** DEFERRED — see 06-scope-cut.md feature: Notifications / bell icon (DROPPED in scope-cut). Do not implement this question's scope. UI placeholder: render visually inert (no badge, no surface).

4. **Q-AVATAR-1 — Avatar + name + chev cluster.**
   - **Observed:** Pencil shows avatar (green-2 fill, "ZA" initials), full name "Zaid Ahmed", and `chevron-down`. Code today has `LogoutButton` only.
   - **Question:** Is the chev a dropdown trigger, and if so what items go in it? Pencil doesn't draw the dropdown contents. Should logout move from explicit chrome button into this dropdown?
   - **Plausible answers:** (a) avatar opens a dropdown with `Profile / Settings / Logout`; (b) avatar opens the storefront-style account drawer (see `EYc0L`); (c) avatar links to a `/admin/profile` page.

   **Answer:** Avatar opens DropdownMenu with `Profile / Settings / Logout`; existing `LogoutButton` semantics moved into menu item.

### Sidebar

5. **Q-SB-1 — Sidebar section eyebrows.**
   - **Observed:** Pencil sidebar splits items into OVERVIEW / CATALOG / OPERATIONS. Existing has one "Navigation" group.
   - **Question:** Should `ADMIN_NAV_ITEMS` change shape to `{ section, items: [...] }[]`, or remain flat with an optional `section` field per item?

   **Answer:** STUBBED — see 06-scope-cut.md feature: Admin/Vendor chrome revamp (ink top bar, sectioned sidebar, mobile bottom tab bar). Implement with placeholder: `ADMIN_NAV_ITEMS` shape changes to `{ section, items: [...] }[]`. Add `// TODO(post-v1):` comment at every touch point.

6. **Q-SB-2 — "Sales reports" nav item destination.**
   - **Observed:** New nav row with `chart-line` icon. No `/admin/sales-reports` route exists.
   - **Question:** Should this point to a placeholder route (404-able), or is the screen in scope for the revamp?

   **Answer:** Routes to placeholder `/admin/sales-reports/page.tsx` (per scope, IN_SCOPE but undesigned → ships as "Coming soon" placeholder route).

7. **Q-SB-3 — "Products" nav item destination.**
   - **Observed:** New admin-side `/admin/products`. Vendor side has `/vendor/products` already.
   - **Question:** What's the admin-side product surface — a read-only catalog browser across all vendors, or full product CRUD with vendor override? Does it reuse `/api/vendor/products` or need a new admin endpoint?

   **Answer:** Read-only catalog browser at `/admin/products` reusing `GET /api/vendor/products` (joined across all vendors); placeholder shell while design pass lands.

8. **Q-SB-4 — "Orders" nav item destination + badge count.**
   - **Observed:** New `/admin/orders` nav with mono "24" pill (ink fill).
   - **Question:** What does "24" represent — open orders, pending sub-orders, dispute count? Is the badge real-time (polled), per-render, or static?

   **Answer:** Count of open `sub_orders` (`status IN ('pending','packed','handed_to_courier')`); polled via React Query (matches existing `useVendorOrdersQuery` 5s refetch pattern).

9. **Q-SB-5 — "Banners" vs "Promo Banners" copy difference.**
   - **Observed:** Pencil label "Banners"; existing label "Promo Banners"; route stays `/admin/promo-banners`.
   - **Question:** Rename label to "Banners" only, or also rename the route?

   **Answer:** Title-only rename in nav; keep route `/admin/promo-banners`.

10. **Q-SB-6 — Categories icon.**
    - **Observed:** Pencil uses `folder-tree`; code uses `TagIcon`.
    - **Question:** Adopt `folder-tree` for visual fidelity, or keep `TagIcon`?

    **Answer:** Adopt `folder-tree` lucide; cosmetic.

11. **Q-SB-7 — 11th sidebar item label is missing in Pencil.**
    - **Observed:** Last sidebar row (`U7w55U`) contains only a `users` icon — no text label drawn (likely a Pencil omission).
    - **Question:** Confirm the label is "Users" / "Customers" / "Team" / something else, and confirm the destination route.

    **Answer:** "Users" → `/admin/users` (per scope IN_SCOPE; placeholder route).

12. **Q-SB-8 — Logout placement.**
    - **Observed:** Pencil sidebar has no explicit logout row; admin top bar has no explicit logout button. Existing layout puts `LogoutButton` in the header.
    - **Question:** Confirm logout moves into the avatar dropdown (Q-AVATAR-1) and the explicit header `LogoutButton` is removed.

    **Answer:** Confirmed — logout moves into avatar dropdown; explicit header `LogoutButton` removed.

### Header

13. **Q-HDR-1 — Title subtitle copy.**
    - **Observed:** Pencil title sub-line is "Performance for May 2026 · last sync 2 min ago" (dynamic data + cache-recency indicator). Existing copy is "Overview of your admin portal." (static).
    - **Question:** Is the sub-line wholly dynamic (range-month + last-sync time computed live), or partially static? If dynamic, is "last sync" the cache age of the analytics cache or the underlying DB read time?

    **Answer:** Show "Performance for {currentMonth}" only (interpolated server-side); drop "last sync" until cache strategy lands.

14. **Q-HDR-2 — Title size.**
    - **Observed:** Pencil "Dashboard" is 32/800 sans, letter-spacing -0.02. Existing uses Tailwind `text-heading-lg font-bold` (32/40 per token map; per 04 log heading-lg is 32 size with the existing line-height).
    - **Question:** Adopt 32/800 (heavier weight than current heading-lg's 700 default), or keep current heading-lg with `font-bold`? Is this a per-page heading style or a new "page-h1" token?

    **Answer:** Adopt 32/800 sans, letter-spacing -0.02.

15. **Q-RNG-1 — Range options.**
    - **Observed:** "Last 30 days" button with chev. No dropdown contents drawn.
    - **Question:** What are the available range presets (Today / 7d / 30d / This month / Last month / Custom)? Does "custom" open a date picker?

    **Answer:** Today / 7 days / 30 days / This month / Last month / Custom (custom opens calendar). Most-common preset set.

16. **Q-EXP-1 — Export CSV scope.**
    - **Observed:** "Export CSV" button. Scope not drawn.
    - **Question:** What gets exported — the recent-orders table (visible 7 rows), all orders in the selected range, or a different report (e.g. KPIs)?

    **Answer:** DEFERRED — see 06-scope-cut.md feature: Statement / CSV downloads (vendor ledger PDFs, admin exports). Do not implement this question's scope. UI placeholder: render but inert.

17. **Q-RPT-1 — "+ New report" destination.**
    - **Observed:** Green primary CTA. No reports model in DB; no destination drawn.
    - **Question:** Is this a placeholder for a future feature (defer), or does the revamp need to introduce a `reports` model and creation flow now?

    **Answer:** Routes to `/admin/sales-reports/new` placeholder (Sales Reports IN_SCOPE per scope-cut).

### KPI cards

18. **Q-KPI-1 — KPI 1 "Rs. 18.4 L" formatting.**
    - **Observed:** Sales formatted as lakhs ("L" suffix); other monetary values in the page use full digits with South-Asian grouping ("Rs. 1,16,380").
    - **Question:** Should KPIs collapse to lakhs/crores when ≥1 lakh, or always show full digits? If conditional, what threshold?

    **Answer:** STUBBED — see 06-scope-cut.md feature: Currency formatter (South-Asian grouping + lakh notation). Implement with placeholder: collapse to lakhs (`L`) at threshold ≥ 1,00,000. Add `// TODO(post-v1):` comment at every touch point.

19. **Q-KPI-2 — KPI 2 "TOTAL ITEMS LISTED" delta is absolute, others are %.**
    - **Observed:** k1/k3 deltas are percentages, k2 is "+412 added", k4 is "−2 deactivated".
    - **Question:** Is delta format per-KPI (some absolute, some %) — confirm per card. Is k4 measuring "active vendor count change" or "deactivation events" specifically?

    **Answer:** Match Pencil per card — k1/k3 percentages; k2 absolute count; k4 absolute count of deactivation events. Documented in a constants file.

20. **Q-KPI-3 — Comparison period for deltas.**
    - **Observed:** Deltas say "vs last month" / "this month" — but the range button is "Last 30 days".
    - **Question:** When the user changes the range to e.g. "7 days", does the delta copy change to "vs last week", or do KPIs always compare month-over-month regardless of range?

    **Answer:** KPIs always compare month-over-month regardless of range — simplest rule; copy stays "vs last month".

### Sales by vendor

21. **Q-SBV-1 — Vendor revenue source.**
    - **Observed:** `sub_orders` has multiple int columns (COD/payout/cost breakdown per `01-codebase-map.md`). Pencil shows raw sales totals per vendor.
    - **Question:** Which column is "vendor sales" — gross order value, vendor net (after platform fee), or COD collected? Need a clear contract before aggregating.

    **Answer:** gross order value

22. **Q-SBV-2 — "See all vendors" destination.**
    - **Observed:** Plain text link top-right. No drawn target.
    - **Question:** Link goes to `/admin/vendors` (sorted by sales)? Or to a `/admin/vendors/sales` view? Or a sales-reports sub-route?

    **Answer:** Link to `/admin/vendors` sorted by sales desc.

### Order status

23. **Q-OS-1 — PENDING bucket definition.**
    - **Observed:** Pencil tile is "PENDING 32". DB sub-order statuses are `pending / packed / handed_to_courier / delivered / cancelled`. Per 02 Q9 these are display labels only — no schema migration.
    - **Question:** Does "PENDING" in this widget mean only `status = 'pending'`, or does it group `pending + packed + handed_to_courier` (i.e. "anything not delivered/cancelled")? Per-status counts not drawn.

    **Answer:** Group `pending + packed + handed_to_courier` (i.e., "anything not delivered/cancelled"). Matches scope-cut placeholder semantics.

24. **Q-OS-2 — Status stamp mapping in recent-orders table.**
    - **Observed:** Table shows DELIVERED / OUT FOR DELIVERY / AT MNP HUB / PENDING. Per 02 Q9, these are display labels onto existing DB statuses.
    - **Question:** Is the mapping `delivered → DELIVERED`, `handed_to_courier → AT MNP HUB`, `packed → ???`, `pending → PENDING`? Where does "OUT FOR DELIVERY" come from — is it a sub-state of `handed_to_courier` (e.g. when courier marks "out for delivery"), and if so what's the source field? The DB has no such sub-status today.

    **Answer:** STUBBED — see 06-scope-cut.md feature: Status display-label mapping table. Implement with placeholder: `pending → PENDING`, `packed → PACKED`, `handed_to_courier → AT MNP HUB`, `delivered → DELIVERED`, `cancelled → CANCELLED`. (OUT FOR DELIVERY is a synonym; collapse — see buyer-orders Q5.) Add `// TODO(post-v1):` comment at every touch point.

25. **Q-OS-3 — Avg fulfillment computation.**
    - **Observed:** "Avg fulfillment 1.8 days".
    - **Question:** Computed as `AVG(deliveredAt − createdAt)` over delivered orders in range — but `01-codebase-map.md` shows `sub_orders.handedAt` not `deliveredAt`. Is fulfillment measured at hand-off or delivery, and if delivery is the right anchor, do we need a new `deliveredAt` timestamp?

    **Answer:** Use `AVG(handedAt − createdAt)` (existing field) as the anchor; defer adding `deliveredAt` until tracking surface lands.

26. **Q-OS-4 — SLA target source.**
    - **Observed:** "SLA target 2 days" hardcoded-feeling copy.
    - **Question:** Is "2 days" a true config value (env var? `system_settings` table?), or hardcoded in this widget for now?

    **Answer:** Hardcoded constant in shared module.

### Recent orders table

27. **Q-RT-1 — Customer "shop name" field.**
    - **Observed:** Customer cell shows two lines, e.g. "Tariq Ahmed / Tariq Kiryana Store". `user` schema has `name` only. `addresses.title` exists ("Home", "Shop", etc.) but isn't a shop brand.
    - **Question:** Where does the second line come from? Options: (a) `addresses.title` of the order's address; (b) a new `user.shopName` column for retailers; (c) join via a future "retailer-profile" table. **Likely a schema change.**

    **Answer:** STUBBED — see 06-scope-cut.md feature: Buyer business / shop name (`user.businessName`). Implement with placeholder: `user.businessName` IN_SCOPE. Add `// TODO(post-v1):` comment at every touch point.

28. **Q-RT-2 — `displayId` format.**
    - **Observed:** Pencil ids are `#SH-24891`. Existing format per `01-codebase-map.md` is `ORD-…`.
    - **Question:** Is the prefix changing from `ORD-` to `SH-`, or is `SH-` a Pencil placeholder (treat as visual only)?

    **Answer:** Treat `SH-` as visual placeholder; keep `ORD-` prefix in db. Smallest delta — no migration.

29. **Q-RT-3 — Order-level status when sub-orders disagree.**
    - **Observed:** Each row shows a single status stamp. An order may have multiple `sub_orders` with different statuses.
    - **Question:** What is the order-level status — `orders.status` (`processing/partially_fulfilled/completed`) which has different vocabulary, or a derived rollup of sub-order statuses (e.g. "all delivered" → DELIVERED, "any cancelled" → CANCELLED, else worst-case)?

    **Answer:** Derived rollup: any cancelled→CANCELLED; all delivered→DELIVERED; any handed_to_courier→AT MNP HUB; else worst-case (PACKED → PENDING). Pure helper, no schema.

30. **Q-RT-4 — Row click behavior.**
    - **Observed:** No hover/click affordance drawn.
    - **Question:** Does clicking a row navigate to an order-detail page? There is no `/admin/orders/[id]` route today. Should rows be inert (status display only) until that route exists?

    **Answer:** Rows inert until `/admin/orders/[id]` route exists; per scope Admin Orders IN_SCOPE so this becomes a clickable row to a placeholder detail page.

31. **Q-RT-5 — Items count column (e.g. "—" empty in some rows).**
    - **Observed:** Some sample rows show items count, others (e.g. #SH-24890, #SH-24887) appear to omit it in Pencil's frame data.
    - **Question:** Are blank items counts real (e.g. when items haven't been fulfilled yet) or just Pencil omissions in the design source?

    **Answer:** Always show count; treat blanks in design as oversights.

### Top sellers

32. **Q-TS-1 — Row click target.**
    - **Observed:** Each row has rank + name + amount + trend icon, no click affordance drawn.
    - **Question:** Click navigates to vendor detail (`/admin/vendors/[id]`) or to a vendor-sales detail?

    **Answer:** Click → `/admin/vendors/[id]`.

33. **Q-TS-2 — Trend computation period.**
    - **Observed:** Trend arrow is up/down/flat per row.
    - **Question:** Is the comparison "this week vs last week" or "vs vendor's own avg"? Threshold for "flat"?

    **Answer:** This week vs last week (matches "Top sellers this week" eyebrow). Threshold for flat: ≤ 5% change.

### Audit log

34. **Q-AUD-1 — Vendor deactivation event source for KPI 4.**
    - **Observed:** "−2 deactivated" delta on Active Vendors KPI implies a count of deactivation events in range.
    - **Question:** Where does "deactivation event" come from — a new `vendors.deactivatedAt` timestamp, or rows in `admin_audit_log` with a known `action` value?

    **Answer:** STUBBED — see 06-scope-cut.md feature: Admin audit log (writers + viewer feed). Implement with placeholder: Add nullable `vendors.deactivatedAt timestamp`. Smallest additive column. Add `// TODO(post-v1):` comment at every touch point.

35. **Q-AUD-2 — Audit log writers don't exist today.**
    - **Observed:** `admin_audit_log` table exists but no admin mutation appears to write to it (verified via reading `01-codebase-map.md` API surface — none of the admin routes call into it).
    - **Question:** Is the audit log meant to be written from the existing admin mutations (vendor create/update/deactivate, banner create/bulk-update, category create/update, etc.) as part of this revamp? Or is it written from a separate admin-events service that doesn't exist yet?

    **Answer:** STUBBED — see 06-scope-cut.md feature: Admin audit log (writers + viewer feed). Implement with placeholder: Wire writers into vendor activate/deactivate, banner publish, category delete only (per scope-cut placeholder). Add `// TODO(post-v1):` comment at every touch point.

36. **Q-AUD-3 — Action vocabulary + target resolver.**
    - **Observed:** Pencil samples: "Approved vendor", "Edited banner", "Removed product", "Activated category", "Reviewed dispute". DB column `action` is freeform text.
    - **Question:** (a) Define a controlled enum of action verbs, or accept freeform sentence-cased strings? (b) "Reviewed dispute" implies a `disputes` entity that doesn't exist in the schema map — is dispute resolution in scope, or is this Pencil sample noise?

    **Answer:** DEFERRED — see 06-scope-cut.md feature: Admin "Reviewed dispute" entries / disputes entity (DROPPED in scope-cut). Do not implement this question's scope. UI placeholder: Define a controlled enum of action verbs (e.g. `vendor.activate`, `vendor.deactivate`, `banner.publish`, `category.delete`).

37. **Q-AUD-4 — Pagination / "View more" affordance.**
    - **Observed:** 5 entries shown, no link to more.
    - **Question:** Is there a "View all" affordance that should appear (and a `/admin/audit-log` route), or does the dashboard widget always show only the latest 5 with no escape hatch?

    **Answer:** Show only latest 5; "View all" link routes to `/admin/audit-log` placeholder route.

### Mobile

38. **Q-MOB-1 — Mobile KPI count.**
    - **Observed:** Mobile dashboard shows only 2 KPI tiles in the snapshot (`URtey` + `mAWJr` inside `ForHQ`), not 4.
    - **Question:** Are the other 2 KPIs (Total Orders, Active Vendors) below the fold in a 2×2 stack, omitted entirely on mobile, or in a horizontal scroll?

    **Answer:** Other 2 KPIs are below the fold in a 2×2 stack.

### Removed elements

39. **Q-EX-1 — Existing placeholder copy.**
    - **Observed:** Existing dashboard renders "Welcome to Admin / Use the sidebar to navigate between Dashboard and Vendors. / This is the main dashboard. Add widgets and stats here." — none of this appears in Pencil.
    - **Question:** Confirm this is being entirely replaced by the new dashboard content (not preserved as a fallback empty state).

    **Answer:** Confirmed — replaced entirely.

40. **Q-STATES-1 — Empty / loading / error states.**
    - **Observed:** Pencil draws no loading skeletons, no empty states ("no orders this period"), no error states.
    - **Question:** For each widget (KPIs, sales-by-vendor, order status, recent orders, top sellers, audit log), what should render when (a) data is loading, (b) the range has zero data, (c) the query fails? Should the shell still show range/header controls during error?

    **Answer:** Card-level skeletons (using existing `Skeleton` primitive); empty-state copy with optional action; error renders inline retry button.

### Formatting

41. **Q-FMT-1 — Lakh/Crore notation vs full grouping.**
    - **Observed:** KPI 1 displays "Rs. 18.4 L"; recent orders rows show "Rs. 1,16,380" (full).
    - **Question:** Confirm two display modes coexist (compact for KPI hero numbers, full for table rows). Threshold for switching to lakh/crore?

    **Answer:** STUBBED — see 06-scope-cut.md feature: Currency formatter (South-Asian grouping + lakh notation). Implement with placeholder: confirms two display modes coexist (compact for KPI hero, full for tables; threshold ≥ 1,00,000). Add `// TODO(post-v1):` comment at every touch point.

---

**File written to:** `D:\Moeed 8th Sem\Fyp\Code\shalmi-web\.claude-revamp\screens\admin-dashboard\gap-analysis.md`

(End of Phase 4.1 Admin · Dashboard gap analysis. Stopping here per instructions — no implementation started.)

Answers propagated on 2026-05-02 from 06-scope-cut.md + 07-default-proposals.md
