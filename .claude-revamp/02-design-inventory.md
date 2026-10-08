# Phase 0.5 — Design Inventory (Pencil)

> **Phase:** Pre-revamp design inventory (read-only)
> **Date produced:** 2026-05-02
> **Source:** `D:\Moeed 8th Sem\Fyp\Code\shalmi-web\Pencil-Design\Shalmi`
> **Pairs with:** `01-codebase-map.md` (existing-code map)

This artifact captures **what is in the Pencil file**, not what should be built.
Per CLAUDE.md, never invent fields/copy/behavior; treat this as a discovery
document. All speculative mappings live in §5 and §7.

The file is a single Pencil document with **46 top-level frames**: 1 design
system showcase, 2 v1 reference mockups, 32 v2 product screens (16 buyer / 8
admin / 8 vendor — each in Desktop **and** Mobile), 4 large section-label
banners ("Design System + Mockups", "Buyer Screens", "Admin Screens", "Vendor
Screens"), and the giant title rectangles around them. Plus **1 reusable
component** (`prod1` — a product card).

---

## 1. Design system tokens

The file declares **27 variables** total via `pencil:get_variables` —
all are color or font tokens. Spacing, radius, font sizes, shadows, and
motion are *not* declared as variables; they appear as raw numeric values
inside the design system showcase frame (§1.4–§1.6 below). I have captured
those raw scales as they appear in Pencil and **have not normalized them**.

### 1.1 Color tokens (declared variables)

Listed exactly as `pencil:get_variables` returned them. Usage labels in the
right column come from the swatch labels inside the Design System frame
(`a2HFrA → 01 Colors`).

#### Brand

| Token | Value | Pencil swatch label · usage label |
|---|---|---|
| `ink` | `#0F1411` | "Ink" — Wordmark, header |
| `green-2` | `#16A34A` | "Primary green" — Primary CTA, Add |
| `green-500` | `#22C55E` | "Green accent" — Hover, badges |
| `green-600` | `#16A34A` | "Green 600" — Banner highlights |
| `ink-2` | `#2A2F2C` | "Ink-2" — Body, headings |
| `green-900` | `#14532D` | "Green 900" — Footer, hero |

> Note: `green-2` and `green-600` resolve to the same hex (`#16A34A`); they
> appear as two separate entries in both the variables table and the brand
> swatches. See Open Q4.

#### Surfaces

| Token | Value | Pencil swatch label · usage label |
|---|---|---|
| `paper` | `#FBFAF5` | "Paper" — Page bg |
| `green-bg` | `#F0FDF4` | "Green 50" — Section bg / Tile green ("Category tiles") |
| `white` | `#FFFFFF` | "Surface white" — Cards, products |
| `green-200` | `#DCFCE7` | "Green 200" — Banner eyebrows |
| `paper-2` | `#F5F2E8` | "Receipt cream" — Receipts, summaries |
| `paper-3` | `#ECE7D6` | (used as bar/avatar fill in dashboards; no labelled swatch) |

#### Status

| Token | Value | Pencil swatch label · usage label |
|---|---|---|
| `green-700` | `#15803D` | "Green 700" — Delivered, success |
| `green-bg` | `#F0FDF4` | "Green 50" — Success surface (reused) |
| `amber` | `#A16207` | "Amber" — In progress, low stock |
| `amber-bg` | `#FEF7E0` | (paired with `amber`; no separate swatch label) |
| `red` | `#B91C1C` | "Stamp red" — Cancel, error, discount |
| `red-bg` | `#FEF2F2` | (paired with `red`) |
| `blue` | `#1E40AF` | "Blue" — At MNP hub, info |
| `blue-bg` | `#EFF4FF` | (paired with `blue`) |
| `ink-3` | `#6B716D` | "Ink-3" — Captions, meta |
| `ink-4` | `#A0A4A1` | (placeholder text, soft icons) |

#### Hairline / chrome

| Token | Value | Usage |
|---|---|---|
| `rule` | `#0F141119` (≈ ink @ 10%) | Default 1px hairline rule between sections |
| `rule-2` | `#0F141133` (≈ ink @ 20%) | Heavier hairline (paper-2 cards, inputs) |

### 1.2 Typography tokens (declared variables)

| Token | Value | Used for |
|---|---|---|
| `font-sans` | `"Plus Jakarta Sans"` | UI, headings, body |
| `font-mono` | `"JetBrains Mono"` | Numerics, prices, stamps, labels (uppercase eyebrows), receipts |
| `font-ar` | `"Noto Nastaliq Urdu"` | Urdu strings (status, greeting, language toggle) |

### 1.3 Type scale (raw values — not declared as variables)

Captured from `02 Typography → Specimens` rows. Format is `size / weight`
with spec-row labels as they appear in Pencil.

| Spec row | Size | Weight | Letter-spacing | Font | Sample |
|---|---|---|---|---|---|
| PLUS JAKARTA — 56 / 800 | 56px | 800 | -0.03 | sans | "Restock smarter, save more" |
| H1 — 36 / 800 | 36px | 800 | -0.02 | sans | "Shop by category" |
| H2 — 26 / 700 | 26px | 700 | (default) | sans | "Today's lowest" |
| H3 — 20 / 700 | 20px | 700 | (default) | sans | "Sufi Cooking Oil 5 L" |
| BODY — 16 / 400 | 16px | normal | (default) | sans | (paragraph copy) |
| SMALL — 14 / 400 | 14px | normal | (default) | sans | (meta, vendor name) |
| CAPTION — 12 / 400 | 12px | normal | (default) | sans | "Source-level prices" |
| MONO LABEL — 11 / 600 | 11px | 600 | 0.08 | mono | "BAZAAR 7 · IMPORTED SNACKS" |
| MONO NUMERIC — 17 / 700 | 17px | 700 | (default) | mono | "Rs. 4,820" |
| NOTO NASTALIQ — 18 | 18px | normal | (default) | font-ar | "آرڈر دیں" |

Additional sizes used elsewhere in the file (not in the showcase row but
appearing in screen content): 9, 10, 11, 12, 13, 14, 15, 17, 18, 20, 22, 24,
26, 28, 30, 32, 36, 48, 56 px. Eyebrows and stamps consistently use the
mono font at 9–11px with letter-spacing 0.08–0.16 and weights 600/700.

### 1.4 Spacing scale (raw values — not declared as variables)

Captured from `03 Spacing → SpacingBars`. Eyebrow says **"4 pt grid."**

| Token label | Value (px) |
|---|---|
| s-1 | 4 |
| s-2 | 8 |
| s-3 | 12 |
| s-4 | 16 |
| s-5 | 24 |
| s-6 | 32 |
| s-7 | 48 |
| s-8 | 64 |
| s-9 | 96 |

### 1.5 Radius scale (raw values — not declared as variables)

Captured from `03 Spacing → RadiusGrid` (radii kept tight per the eyebrow).

| Position | Value (px) |
|---|---|
| r1 | 0 (sharp) |
| r2 | 4 |
| r3 | 6 |
| r4 | 8 |
| r5 | 12 |
| r6 | 999 (pill) |

Used in the file:
- 3 — for stamp pills
- 4 — for icon swatches, language-toggle interior
- 6 — for buttons, search inputs, sidebar nav rows, banner badges
- 8 — for cards, receipts, surface containers
- 10 — for product card outer
- 12 — for KPI cards, dashboard widgets
- 16 — for hero banner blocks, payout callout
- 99 / 999 — for pill chips and circular avatars

### 1.6 Elevation / shadow

No declared variables. The only shadow encountered in the inventory pass is
on the desktop **Account drawer** sheet (`EYc0L → ZoF9z`):
`shadowType: outer, color: #0F141140, offset: { x:-12, y:0 }, blur:48`.
Most surfaces rely on **hairline strokes** (`rule` / `rule-2`) instead of
shadows — this matches the design system narrative ("paper, hairline rules,
ink chrome").

### 1.7 Stroke / border

| Use case | Thickness | Color token |
|---|---|---|
| Default hairline rule between sections | 1 | `rule` |
| Card / surface border on `paper` bg | 1 | `rule` |
| Heavier border on `paper-2` (receipt cream) cards | 1.5 | `rule-2` |
| Search inputs | 1.5 | `rule-2` |
| Stamps | 1.5 | matches stamp color (`green-700`/`blue`/`ink`/`amber`/`red`) |
| Radius scale samples | 1.5 | `ink` |
| Admin search inside dark top bar | 1 | `#FFFFFF33` (ad-hoc 20% white) |

### 1.8 Iconography

Per `04 Iconography`: **Lucide outlined, 2px stroke, 24px default size.**
Each icon must be paired with a text label; glyph-only is reserved for tab
bars/chrome. The 16 icons that appear in the showcase row:

`search`, `shopping-cart`, `truck`, `package`, `weight`, `receipt`,
`shield-check`, `bell`, `user`, `map-pin`, `plus`, `refresh-cw`, `house`,
`layout-grid`, `bookmark`, `mic`.

Additional icons used in screens (not in the showcase row): `chevron-down`,
`chevron-right`, `menu`, `x`, `check`, `arrow-right`, `trending-up`,
`hourglass`, `calendar`, `heart`, `banknote`, `book-open`, `shopping-bag`,
`layout-dashboard`, `settings`.

### 1.9 Motion

No motion or duration tokens declared. No animations are visible in static
Pencil frames.

### 1.10 Voice (extracted from `06 Voice` — Do/Don't table)

Not tokens, but design-system rules that constrain copy. Captured here so
the revamp doesn't accidentally violate them.

| DO | DON'T |
|---|---|
| "Rs. 4,820 · Pack of 4" — concrete unit, source-level price, tabular numerics | "Best price guaranteed!" — no marketing absolutes |
| "Delivered · پہنچ گیا" — bilingual, hand-translated | "ڈیلیور شدہ (auto)" — never machine-translate Urdu |
| "21 kg · Delivery Rs. 180" — show weight tier and exact rupees pre-checkout | "Delivery: see cart" — don't hide cost behind another tap |
| "Saleem Bhai · Bazaar 7" — name the vendor, not just the brand | "Premium gourmet partner" — brochure voice; cut |

---

## 2. Themes / modes

**There is no light/dark/brand variant in the file.** `pencil:get_variables`
returns flat values for every variable (no `theme` array entries). Every
screen renders against `paper` (#FBFAF5) as the page background; the only
"dark" surface is the chrome `ink` (#0F1411) used on top bars / footers /
util strips and the few inverted KPI cards (e.g. payout-pending tile).

Implications for code:
- The current codebase has a complete `.dark` token block in
  `packages/ui/src/styles/globals.css` and a `next-themes` dependency.
  **The Pencil designs do not specify dark mode**, so the existing dark
  tokens are unsupported by design. (See Open Q5.)

---

## 3. Component library

Pencil exposes only **one formally-reusable component** (`reusable: true`):

| ID | Name | What it is |
|---|---|---|
| `QZyPu` | `prod1` | Product card — paper-2 image area, discount pill (`-12%`), heart icon, central package icon, "SHALMI WAREHOUSE" eyebrow, product name (sans 14/700), unit subtitle (mono 10/700, e.g. "5 L · CARTON"), price row (mono 18/800 with strikethrough mono 12), green "+ Add" button. Used on Buyer Home (best-prices and hot-products sections) and Buyer Product YMAL section. |

Everything else is an **ad-hoc grouping** that recurs across screens. The
following table catalogs those compound patterns. Variants/states are listed
only where the file actually shows them; **anything implied but not drawn is
called out in §7**.

### 3.1 Atoms / inputs

| Pattern | Variants drawn in `05 Components → BUTTONS / FORM FIELDS` | Tokens |
|---|---|---|
| **Button — primary inverse** ("Place order") | size 40h · padding [0,16] · radius 6 · `ink` fill · `white` 14/600 sans | `ink`, `white`, font-sans |
| **Button — primary green** ("Add to cart") | size 40h · radius 6 · `green-2` fill · `white` 14/600 | `green-2`, `white` |
| **Button — outline ink** ("View details") | radius 6 · `white` fill · 1px `ink` stroke · `ink` 14/600 | `white`, `ink` |
| **Button — ghost** ("Cancel") | radius 6 · no fill · `ink-3` 14/600 | `ink-3` |
| **Button — destructive outline** ("Remove") | radius 6 · `white` fill · 1px `red` stroke · `red` 14/600 | `red`, `white` |
| **Search field — light** | radius 6 · `white` fill · 1px `rule-2` stroke · 44h · padding `[0,12]` · search icon (lucide `search`, 18px, `ink-3`) + placeholder `ink-3` 14 sans | `white`, `rule-2`, `ink-3` |
| **Labeled input** | label `ink-2` 12/600 sans + 6px gap + input box (44h, radius 6, `white` fill, 1.5px `rule-2` stroke) | `ink-2`, `white`, `rule-2` |
| **Search field — dark (admin/vendor topbar)** | radius 6 · `#FFFFFF1A` fill · 1px `#FFFFFF33` stroke · 36h · 320w | (ad-hoc whites) |

States NOT drawn for buttons or inputs: hover, active/pressed, focus,
disabled, loading, error. (Open Q7.)

### 3.2 Stamps (status pills)

From `05 Components → STAMPS`. All share: 1.5px stroke, radius 3, padding
`[3,8]`, mono 11/700, letter-spacing 0.08, **rotation -1°** ("rotated status
stamp" — distinctive of the system).

| Stamp | Label color | Fill | Stroke |
|---|---|---|---|
| **DELIVERED** | `green-700` | `green-bg` | `green-700` |
| **AT MNP HUB** | `blue` | `blue-bg` | `blue` |
| **PACKED** | `ink` | `paper-2` | `ink` |
| **DELAYED** | `amber` | `amber-bg` | `amber` |
| **CANCELLED** | `red` | `red-bg` | `red` |

The brief also mentions `OUT FOR DELIVERY`, `NEW`, `DISPATCHED` — these
states are **referenced but not present in the stamp showcase row**. They
appear elsewhere in screen content (e.g. vendor dashboard tile labels say
"NEW · PACKED" amber pill, "8 NEW · 4 PACKED"), but no `OUT FOR DELIVERY`
stamp variant is drawn. (Open Q9.)

### 3.3 Product card

The reusable `prod1` (above), plus a **larger desktop variant** drawn inline
in `05 Components → PRODUCT CARD` (`dw7Oh`, 300w):

- 300w, radius 8, `white` fill, 1px `rule` stroke
- Image area (300×300, `paper-2` fill, bottom hairline) with a `-12%` red
  badge top-left and an 80px lucide `package` icon centered
- Body: vendor eyebrow (mono 10/600 — "SALEEM BHAI") · title (sans 15/700)
  · price row (mono 17/700 + strikethrough mono 12) · weight eyebrow
  ("SALEEM BHAI · 21 KG" mono 10/600) · "+ Add" green button (40h)

The smaller `prod1` lacks the discount badge and uses sans 14/700 for the
title. So **two product card variants exist** (compact and detailed); they
are not formally tied as "variants of one component." (Open Q10.)

### 3.4 Weight gauge

From `05 Components → WEIGHT GAUGE` (`LA21g`):

- Header row: "WEIGHT" eyebrow (mono) on left, current value mono on right
- Bar: 22h × `fill_container`, radius 3, `paper-2` fill, with an inner `ink`
  rectangle showing the fill progress; clipped
- Legend: 4 columns separated by 1px right hairlines: `0–10 kg / Rs. 280`,
  `10–25 kg / Rs. 180`, `25–50 kg / Rs. 120`, `50+ kg / Rs. 80`. Active
  tier bolded (`ink` 11/700) and Rs. value `ink-2`; inactive tiers `ink-3`.

This is the **delivery-tier gauge** described in the brief (cart shows
which weight bracket the basket falls into, exposing per-kg shipping cost).

### 3.5 Receipt totals

From `05 Components → RECEIPT TOTALS` (`olYUW`, 380w):

- `paper-2` fill, 1px `rule-2` stroke, radius 8, padding 16, gap 8
- Rows: Subtotal · Delivery (10–25 kg) · GST 18% · then a thicker rule and
  Total row at mono 16/700
- All numbers mono, justified `space_between`.

### 3.6 Tabs and language toggle

From `05 Components → TABS · LANGUAGE TOGGLE` (`vRXid`):

- **Underline tabs** — sans 14, gap 24, with 1px `rule` bottom on the row
  and 2px `ink` bottom on the active tab. Active label `ink` 14/600,
  inactive `ink-3` 14/500. ("All / Snacks / Cooking oil / Tea")
- **Language toggle** — segmented control: outer `white` fill, 1.5px `ink`
  stroke, radius 6, 2px padding. Two children: "EN" mono 11/700 white-on-ink
  and "اردو" font-ar 13 ink-on-transparent. Selected state shown is EN.

### 3.7 App / page chrome

Three distinct chrome systems in the file:

**Buyer (storefront) chrome (3-tier):**
1. `Util strip` — full-width `ink` 8/40 padding. Left: link cluster
   ("Help · Track order · MNP delivery hubs"). Right: language toggle.
2. `Header` — `paper`, 16/40 padding, hairline bottom: brand cluster (round
   `ink` 36px mark + wordmark + "Wholesale" subtitle), 44h white search
   field with placeholder "Search 50,000+ items", and right cluster
   (account button, cart button — count badge in green).
3. `Subnav` — `paper`, 12/40 padding, hairline top+bottom. Horizontal
   category links (Home / Categories / Best Prices / Today's Deals / etc.)
   plus right-side "Pin a bazaar" pill.

**Mobile buyer chrome:**
1. `App bar` — 14/16 padding, brand left, two icon actions right (account,
   cart). 44h search field appears in a separate `Search wrap` below.

**Admin / Vendor chrome (desktop):**
- `Top bar` — `ink` background, 10/32 padding. Left: white round mark +
  "Shalmi Mart" wordmark + "·" + "Admin" or "Vendor" + a small rotated
  badge (e.g. role pill). Right: dark search (320w, `#FFFFFF1A`), bell,
  avatar, name + chevron.
- `Sidebar` — 240w, `white` fill, 1px right hairline rule, padding
  `[16,12,24,12]`, gap 4. Each section starts with an eyebrow row, then nav
  items at radius 6, padding `[10,12]`, gap 12. Active item gets a
  `paper-2` fill.

**Admin / Vendor mobile chrome:**
- Single dark `App bar` at 12/16 padding (menu icon + page title left;
  bell + avatar right).
- Vendor mobile pages have a bottom tab bar (`vJBmE` etc.) — see §3.9.

### 3.8 Cards & containers

- **Surface card** — `white` fill, 1px `rule` stroke, radius 8.
- **Receipt / summary card** — `paper-2` fill, 1.5px `rule-2` stroke,
  radius 8 (or 12 in dashboards).
- **Inverse / payout-pending card** — `ink` fill, white text, radius 12
  (KPI accent on vendor dashboard, "Next payout" hero on ledger).
- **Hero / banner block** — `green-900` fill, radius 16, generous padding
  (40–48px), used for buyer home main banner and "Reorder block" on v1
  desktop home.
- **Empty/placeholder card** — `paper-2` fill, radius 16, height 280px,
  centered (`drDPlc` in account drawer page-dimmed background, the
  category-tile-image placeholders).

### 3.9 Bottom tab bar (mobile vendor only)

`vJBmE`, `lSsjh`: 5 evenly-distributed tabs · 12/16/18 padding · `white`
fill · 1px `rule` top hairline. Each tab has a 22px lucide icon + 10/700
sans label. Active tab uses `ink`; inactive `ink-3`. Tabs:
**Dashboard · Products · Orders · Ledger · More**. (Buyer mobile screens do
**not** use a bottom tab bar — they rely on the account sheet drawer.)

### 3.10 Account drawer / sheet (overlay)

Desktop (`EYc0L → ZoF9z`): 480w right-side panel with outer shadow over a
50%-opacity dim of the underlying page. Sections top→bottom:

- Drawer header — title "Account" sans 20/800 + close icon button (36px)
- User card — paper-2 fill, contains user row + stamp row + stats grid
  (with a top hairline)
- Nav — two `white` cards (radius 8, hairline), each prefixed by an
  eyebrow label
- Foot — language row, logout button (`white` card), version string
  ("Shalmi Mart · v1.0.0", mono 11)

Mobile (`q732Y`): same content stacked vertically, full-screen sheet,
`paper-2` user card, `paper` nav card.

### 3.11 Other compound elements observed

- **Trust strip** — paper-2 inline pill with three icon+text items, dot
  separators (mobile home).
- **Hero carousel dots** — 3 dots, current is rounded `ink` 18×6, others
  ellipses 6×6 `rule-2`.
- **Promo strip** — `green-2` full-width band, white text, single line of
  copy.
- **Filter chip row** — horizontal scrolling chip set on Buyer Orders and
  Vendor Products.
- **Sortable banner grid + edit panel** — two-column layout on Admin
  Banners (grid of banner cards on left, edit panel on right).
- **Sales bar chart** — vendor dashboard, 7 day-bars, weekend highlighted
  in `green-2`, today in `ink`. Built from rectangles + labels.
- **Donut/segment row** — vendor products has a "Stats segments" frame and
  vendor orders has a "Status segments" frame (NEW / PACKED / DISPATCHED
  ratios — geometry not exported here, structure only).
- **Step indicator** — checkout has `stepIdx` row at top of main column
  (numeric step counts with separators).
- **Inline `Add Product form`** — vendor products desktop has the product
  table AND a full add-product form in the same scroll. Mobile has an
  "Add product section" too.

---

## 4. Screen inventory

35 screen frames in total (excluding the giant section-label rectangles).
Each row is one Pencil top-level frame. Frame IDs are the Pencil node IDs
so they can be re-opened via `pencil:batch_get`.

### 4.1 Reference / showcase

| ID | Name | What it is | Notable contents |
|---|---|---|---|
| `a2HFrA` | Design System | The system showcase itself (1200w, vertical flow) | Hero · TOC · 01 Colors · 02 Typography · 03 Spacing & radius · 04 Iconography · 05 Components · 06 Voice |
| `F4eQQ` | Desktop Home (v1) | Original v1 home mockup, kept as reference (1280w) | Util strip · Header (with subnav, includes "Pin a bazaar" pill) · Hero grid (banner + rail) · Trust row · Categories · "Today's lowest" · "25 SPECIALIZED BAZAARS" · Reorder block · Footer |
| `XaQ7g` | Mobile Home (v1) | Original v1 mobile home mockup, reference (420w) | App bar · Search wrap (with mic icon) · Greet ("Salaam, Tariq Bhai" + Urdu) · Banner with overlay gradient · Carousel dots · CategorySec · PopularSec · BestPricesSec · Trust strip |

### 4.2 Buyer (storefront) — 8 pairs

| Desktop ID | Mobile ID | Name | Purpose | Components used |
|---|---|---|---|---|
| `bid1Y` | `X0SzkF` | Buyer · Home | Storefront landing | Util strip, Header (logo + 44h search + actions), Subnav (cat links), Hero carousel, Categories grid (8 tiles desktop / 2-row mobile), Popular section (4 tiles), Best-prices grid (uses `prod1`), Hot-products grid (uses `prod1`), Promo strip ("ONE MNP DELIVERY"), Footer |
| `MqzEv` | `OVOxe` | Buyer · Product (PDP) | Product detail | Chrome (util/header/subnav), Breadcrumb, PDP main (gallery left 560×560 + thumb strip; right column with title + variant info + price + "Pack of 4/6/12/24/48" bundle pricing block + qty + add-to-cart + delivery card + spec section), YMAL ("you may also like") row of `prod1`s, Footer. Mobile: hero image (`mPdpHero` 380h), info, delivery card, spec section, sticky "Add to cart" bar at bottom (`wovO4`/`sticky-bar`) |
| `g3oOM7` | `lSn3n` | Buyer · Cart | Cart line items + summary | Cart-main (left: cart line rows; right: receipt-card 380w with weight gauge + receipt totals + place-order button). Mobile: header, weight gauge wrap, cart lines, summary card, sticky bottom bar |
| `S72tsk` | `OqB5X` | Buyer · Checkout | Place order | `stepIdx` (step indicator), main two-col: left column with delivery address card + rider notes + payment selector + items review; right column with order summary card + 51h CTA. Mobile: separate stacked sections (mxStep, mxTitle, mxAddr, mxInstr, mxPay, mxSum) + sticky CTA bar |
| `g78Iwm` | `ctdRJ` | Buyer · Orders | Order history | Breadcrumb · `oTH` (page header) · `oFilters` (tabs + search 6/14 + sort) · 5 order cards in `Order list` (`oo1`–`oo5`) — each is a white card showing order id, items, totals, status stamp, action buttons. Mobile: app bar + Filter tabs (clipped horizontal scroll) + scroll list |
| `NNw2K` | `tbXvv` | Buyer · Reorder | "Replenish last week's cart" page | Breadcrumb ("Home > Orders > Reorder #SH-24891") · `rTH` page header with eyebrow "REORDER · ORDER #SH-24891 · 24 APR 2026" · two-col `rLayout` (left: editable line items; right 380w: weight gauge + receipt + add-to-cart). Mobile: scroll + bottom CTA bar |
| `R6YLrL` | `ZETLe` | Buyer · Settings | Account & settings | Breadcrumb ("Home > Account > Settings") · `c9dR8m` page title "Account & settings" · `sLayout`: 280w left `sSide` (white card with vertical nav items) + right `sContent` panel (settings sections, 24 gap). Mobile: app bar + scroll |
| `EYc0L` | `q732Y` | Buyer · Account drawer/sheet | Overlay (not a route) | Desktop: dimmed page underneath + 480w right drawer with `drDPHd` (close), `drDUC` user card (paper-2, includes stamp row and stats), `Nav` (two white nav cards), `Foot` (lang row, logout, version). Mobile: full-screen sheet with same content |

### 4.3 Admin — 4 pairs

| Desktop ID | Mobile ID | Name | Purpose | Components used |
|---|---|---|---|---|
| `AcB4v` | `R0bdxR` | Admin · Dashboard | KPI dashboard | Top bar (ink, `Admin` badge), Sidebar (3 sections, ~11 nav items), Main: Breadcrumb, Header, KPI grid, Two-col row, Recent Orders Table, Bottom row (top sellers + audit log per brief — geometry only confirms structure). Mobile: ink app bar + main scroll |
| `H6Ch4T` | `Xmeb6` | Admin · Vendors | Vendor management | Top bar, Sidebar (Vendors active), Main: Breadcrumb, Header (`vHd`), KPI row (`vKpi`), Filters card (`vFil`), `vSplit` (table left + edit panel right with shop info / GST / categories / limits per brief). Mobile: ink app bar + sub-header card + List |
| `A0BZZx` | `IVbBD` | Admin · Categories | Category CRUD | Same admin shell. Main: Breadcrumb (`cBC`), Header (`cHd`), KPI row (`cKpi`), Filters card (`cFil`), `cSplit` (table + edit panel — icon picker / slug / parent / sort order per brief). Mobile shell with `mcSub` and List |
| `bjD87` | `btIjo` | Admin · Banners | Banner management | Same admin shell. Main: Breadcrumb (`bnBC`), Header (`bnHd`), KPI row (`bnKpi`), Filters (`bnFil`), `Banner grid` (vertical layout) + `Edit panel` card (preview + scheduling + CTR/revenue per brief). Mobile shell with `mbSub` and List |

### 4.4 Vendor — 4 pairs

| Desktop ID | Mobile ID | Name | Purpose | Components used |
|---|---|---|---|---|
| `VqlnC` | `L95K24` | Vendor · Dashboard | Vendor home | Top bar (ink, `Vendor` badge), Sidebar (4 sections, 5 nav items), Main: Header (eyebrow "MONDAY · 28 APRIL · GUJRANWALA" + title "Saleem Brothers Wholesale" + "This month" filter + "Add product" green CTA), KPI row (4 cards: Orders Today w/ amber stamp "8 NEW · 4 PACKED", Revenue MTD w/ green +14% stamp, Active Listings w/ red "3 LOW STOCK" stamp, Payout Pending — inverse `ink` card), Sales chart (7-day bars, MON in ink, SAT in `green-2`), TwoCol (recent orders + low stock per brief), Payouts callout (paper-2 footer-style block w/ "Releases Friday, 2 May to your registered Allied Bank account ending 4291" and `View ledger` button). Mobile: same content vertically stacked + bottom tab bar (Dashboard/Products/Orders/Ledger/More) |
| `H7jii` | `tXG16` | Vendor · Products | Product mgmt | Top bar, Sidebar (Products active), Main: Header, Stats segments (donut/segment row), Product table card, `apTitle`, Add Product form card (with bundle pricing tiers per brief), `apFoot` paper-2 footer. Mobile: hero card + Chip row + Product list + "Add product section" + bottom tab bar |
| `jXwqE` | `EEK8K` | Vendor · Orders | Orders / packing | Top bar, Sidebar (Orders active), Main: Header, **`Status segments`** frame (3-tile NEW/PACKED/DISPATCHED ratio block per brief), `voSubHd`, Cards (order cards — each with the giant "Packed ✓" CTA per brief), `Later zone` paper-2 callout. Mobile: hero card + Status segs + Cards |
| `S8BU3J` | `u5iGd` | Vendor · Ledger | Friday weekly payouts | Top bar, Sidebar (Ledger active), Main: `ldHd`, `Next payout` block (`ink` fill, radius 16, 32/40 padding — countdown card per brief), `ldRow` two-col (breakdown + bank info per brief), `History card` (white, hairline). Mobile: app bar + scroll only |

---

## 5. Design ↔ Code screen mapping (DRAFT)

Pencil source on the left, existing code from `01-codebase-map.md` on the
right. Mappings marked **NEW** indicate screens with no current route; see
§6.

| Pencil screen | Likely existing route / file | Confidence |
|---|---|---|
| `bid1Y` Buyer · Home · Desktop | `/` → `apps/web/src/app/(storefront)/page.tsx` (currently renders `HeroCarousel`, `BestPricesSection`, `CategorySection`, `SuperSaversSection`) | High |
| `X0SzkF` Buyer · Home · Mobile | Same `/` route (responsive) | High |
| `MqzEv` / `OVOxe` Buyer · Product | `/products/[slug]` → `apps/web/src/app/(storefront)/products/[slug]/page.tsx` (`ProductDetail`) | High |
| `g3oOM7` / `lSn3n` Buyer · Cart | `/cart` → `apps/web/src/app/(storefront)/cart/page.tsx` (`CartItemRow`, `CartSummary`) | High |
| `S72tsk` / `OqB5X` Buyer · Checkout | `/checkout` → `apps/web/src/app/(storefront)/checkout/page.tsx` (`DeliveryAddressSection`) | High |
| `g78Iwm` / `ctdRJ` Buyer · Orders | `/profile/orders` → `apps/web/src/app/(storefront)/profile/orders/page.tsx` (`RetailerOrders`) | High |
| (Pencil has no per-order detail screen drawn) | `/profile/orders/[id]` → `RetailerOrderDetail` exists in code; no Pencil counterpart this pass — see Open Q1 | UNCLEAR |
| `NNw2K` / `tbXvv` Buyer · Reorder | **NEW** — no existing route. Closest existing surface: `/profile/orders/[id]` (which currently has no reorder action). The "Reorder #SH-24891" page is a new top-level screen. | **NEW** — see §6 |
| `R6YLrL` / `ZETLe` Buyer · Settings | **NEW** — no existing `/profile/settings` route. Existing `/profile/addresses` is a sub-page. The Pencil sidebar (`sSide`) suggests Settings is a parent shell containing addresses + other items. | **NEW** — see §6 / Open Q2 |
| `EYc0L` / `q732Y` Buyer · Account drawer/sheet | **Overlay, not a route.** Closest existing surface is the `DropdownMenu` in `apps/web/src/modules/storefront/components/header/index.tsx`. Mobile sheet has no current counterpart. | **NEW UI pattern** — see Open Q3 |
| `AcB4v` / `R0bdxR` Admin · Dashboard | `/admin/dashboard` → `apps/web/src/app/admin/dashboard/page.tsx` (`AdminDashboard`). Existing dashboard is essentially placeholder per `01-codebase-map.md` Open Q4. | High (target) — content is largely new |
| `H6Ch4T` / `Xmeb6` Admin · Vendors | `/admin/vendors` → `apps/web/src/app/admin/vendors/page.tsx` (`AdminVendors`) | High |
| `A0BZZx` / `IVbBD` Admin · Categories | `/admin/categories` → `apps/web/src/app/admin/categories/page.tsx` (`AdminCategories`) | High |
| `bjD87` / `btIjo` Admin · Banners | `/admin/promo-banners` → `apps/web/src/app/admin/promo-banners/page.tsx` (`AdminPromoBanners`) | High |
| `VqlnC` / `L95K24` Vendor · Dashboard | `/vendor/dashboard` → `apps/web/src/app/vendor/dashboard/page.tsx` (currently a placeholder copy block) | High (target) — content is essentially new |
| `H7jii` / `tXG16` Vendor · Products | `/vendor/products` (list) + `/vendor/products/new` + `/vendor/products/[id]/edit`. Pencil shows **list AND add-product form on the same scroll** — this differs from the current routing where new/edit are separate pages. | UNCLEAR — see Open Q11 |
| `jXwqE` / `EEK8K` Vendor · Orders | `/vendor/orders` → `apps/web/src/app/vendor/orders/page.tsx` (`VendorOrders`) | High |
| `S8BU3J` / `u5iGd` Vendor · Ledger | **NEW** — `/vendor/ledger` exists in `ABSOLUTE_ROUTES.VENDOR_LEDGER` constant but no `app/vendor/ledger/page.tsx` file exists. (`01-codebase-map.md` Open Q9.) | **NEW** — see §6 |
| `a2HFrA` Design System | No route — internal reference document. (Could optionally become a Storybook page; out of scope here.) | N/A |
| `F4eQQ` Desktop Home (v1) | No route — v1 mockup, reference only | N/A |
| `XaQ7g` Mobile Home (v1) | No route — v1 mockup, reference only | N/A |

---

## 6. New screens (no existing route)

Pencil screens that have no corresponding page in the current codebase:

1. **Buyer · Reorder** (`NNw2K` / `tbXvv`) — standalone "Replenish last
   week's cart" flow tied to a specific past order id.
2. **Buyer · Settings** (`R6YLrL` / `ZETLe`) — parent settings shell with a
   left nav of sub-items. Existing `/profile/addresses` likely belongs
   inside this shell.
3. **Buyer · Account drawer/sheet** (`EYc0L` / `q732Y`) — overlay/sheet,
   not a route. Replaces the small `DropdownMenu` in the current
   `StorefrontHeader`.
4. **Vendor · Ledger** (`S8BU3J` / `u5iGd`) — Friday-weekly payouts
   screen. Backed by `vendor_ledger` table that already exists in the DB
   schema, but has no UI today.

Plus several **net-new features inside existing screens** (not separate
routes, but new product behavior the revamp must implement):

- **Weight gauge** on cart, reorder, and possibly checkout (delivery tier
  by basket weight).
- **Bundle / pack pricing tiers** ("Pack of 4 / 6 / 12 / 24 / 48") on PDP.
  The DB has `product_price_tiers` (qty-based), but the design's
  "Pack of N" framing implies units-per-pack as a discrete selector — see
  Open Q12.
- **Status stamps** (DELIVERED / AT MNP HUB / PACKED / DELAYED /
  CANCELLED) used across orders. Existing `sub_orders.status` enumerates
  `pending / packed / handed_to_courier / delivered / cancelled` — close
  but not identical wording. See Open Q9.
- **Bilingual EN/اردو language toggle** in chrome and stamps. There is no
  i18n in the current codebase.
- **Vendor "Packed ✓" giant CTA** workflow on Vendor Orders.
- **Vendor payout countdown** + bank-info display on Vendor Dashboard
  ("Releases Friday, 2 May to your Allied Bank account ending 4291").
- **Admin KPI dashboard** with sales chart, order status, recent orders,
  top sellers, audit log — replaces the current placeholder.
- **Admin Banners scheduling + CTR/revenue metrics** — existing
  `promotional_banners` table has only `isActive`, `displayOrder`; no
  scheduling fields. See Open Q13.
- **Admin Vendors edit panel: GST, categories, limits** — existing
  `vendors` table has `bankName / accountTitle / iban / hub`; no GST
  number, no per-vendor categories or order limits. See Open Q14.

---

## 7. Open questions for me

Numbered for easy reference.

1. **No order-detail screen in the Pencil file** — The codebase has
   `/profile/orders/[id]` (`RetailerOrderDetail`). I did not find a Pencil
   frame for "single order detail" view. Is that intentionally omitted
   from this design pass (i.e. the existing detail screen stays as-is), or
   should the Reorder frame double as the order-detail view, or should I
   look harder (e.g. is it inside another frame I missed)?

   Answer: Yes, on clicking View details in Order History, it opens the Reorder frame.

2. **`Buyer · Settings` scope** — The Settings screen has a left
   `sSide` nav. I did not extract its individual item labels in this pass.
   Does Settings host: profile / addresses / payment methods / language /
   notifications / something else? Critical for deciding whether existing
   `/profile/addresses` becomes `/profile/settings/addresses`.

   Answer: for now just ignore Profile/payment/notification pages.

   and yes, /profile/addresses should be /profile/settings/addresses.

3. **Account drawer routing** — Account drawer is overlay-only. Should
   the existing route `/profile` (which doesn't have a page today) become
   the drawer trigger surface, or is the drawer triggered from any page?
   On mobile, is the sheet an overlay over the current page or its own
   screen at `/account`?
   
   Answer: yes exiting route /profile should be the drawer trigger surface, and on mobile, the sheet is an overlay over the current page.

4. **Two `green-2` / `green-600` tokens with the same hex value** —
   `pencil:get_variables` declares both `green-2: #16A34A` and
   `green-600: #16A34A`. Brand swatches show them as separate "Primary
   green" vs "Green 600" (with different usage labels: "Primary CTA, Add"
   vs "Banner highlights"). Are these intentionally aliased, and should I
   collapse them in code, or preserve both names?

  Answer: do it according to the  pencil design system, ignore the current implementation.

5. **Dark mode** — Pencil declares no theme variants. Existing
   `globals.css` has a complete `.dark` token block + `next-themes` dep
   wired in dependencies (but no `<ThemeProvider>` actually mounted, per
   `01-codebase-map.md` Q12). Should the revamp **delete** the dark token
   block, **keep it dormant**, or **derive a dark theme** during revamp?

   Answer: yes revamp delete the dark token block. we will add dark theme later.

6. **`paper-3` and `ink-4` are declared but not labeled in swatches** —
   They appear in usage (chart bars, placeholder icons) but have no
   "official" usage description. Want me to assume they extend the same
   scale, or wait for explicit guidance?

Answer:  i want you to go according to the pencil design system, ignore the current implementation. what is in pencil design system, we need it strictly follow in our project.

7. **Component states not drawn** — For buttons, inputs, search fields,
   stamps, tabs, checkboxes/radios, and product cards, the file shows
   only the *default* state. Hover, focus, pressed, disabled, loading,
   and error are not drawn. Existing shadcn primitives have these; do I
   keep current state styling (hover dims, focus ring, etc.) or do you
   want them re-derived from the design system tokens?

   Answer: i want you to go according to the pencil design system, re-derive the component states from the design system tokens. and make sure it is according to the design system.

8. **Form primitives with no Pencil counterpart** — The codebase uses
   Checkbox, Select, DropdownMenu, Sheet, Sidebar, Skeleton, Spinner,
   Toast (Sonner), Dialog, Carousel. Of those, Pencil shows a search
   field + labeled input + tabs + language toggle + sidebar nav. The
   others are implied but not designed. Should I assume current shadcn
   styling stays, or expect you to provide more screens?

   Answer: use the current styling and the shadcn components existing to make reusable components u are talking about. if any component needed designing cannot be built on top of existing shadcn components. you can go with either of two options, in same order of preference:
- if any shadcn component exists for this purpose, but isnt in the codebase, you may ask the user to get it added, and then continue to use that
- ⁠build the component needed from scratch if no primitive exists for the usecase

9. **Status stamp values vs DB enum** — Pencil stamps row shows
   DELIVERED / AT MNP HUB / PACKED / DELAYED / CANCELLED. Brief text also
   mentions OUT FOR DELIVERY, NEW, DISPATCHED. Existing
   `sub_orders.status` enum is `pending / packed / handed_to_courier /
   delivered / cancelled`. There is no `at_mnp_hub`, no `delayed`, no
   `out_for_delivery`, no `new`, no `dispatched` in the schema. Are
   these:
   (a) display-only labels mapped from existing statuses
   (e.g. `handed_to_courier` → "AT MNP HUB"),
   (b) brand-new statuses that require a schema migration, or
   (c) two different state machines (order vs sub-order)?

Answer: we have `pending / packed / handed_to_courier /
   delivered / cancelled` only. and these are display only labels mapped from existing statuses.

10. **Two product card variants** — `prod1` reusable (compact, no
    discount badge) and `dw7Oh` inline detailed card (with discount
    badge, weight eyebrow). Should we treat these as two variants of one
    component (`<ProductCard variant="compact|detailed">`), or as two
    distinct components?

    Answer: we have two product card variants, one is compact and one is detailed. and these are two distinct components.

11. **Vendor Products: list + add-form on one page** — Pencil draws the
    Add Product form inline on the same scroll as the list (both desktop
    and mobile). Today the codebase has separate routes
    `/vendor/products`, `/vendor/products/new`, `/vendor/products/[id]/edit`.
    Should the revamp:
    (a) collapse to a single scroll page with the form always visible,
    (b) keep the existing routes and use the inline form only as an
    alternate entry point, or
    (c) route stays the same, only the visual treatment changes?

    Answer: collapse to a single scroll page with the form visible only for edit (on selecting a product from the list) and add with empty state (on clicking add product button).

12. **"Pack of 4 / 6 / 12 / 24 / 48" pricing UI** — PDP shows discrete
    pack-size selectors. The DB has `product_price_tiers (minQty, maxQty,
    priceCents)` which is a quantity-band model, not a "discrete pack
    size" model. Are packs derived from the tier table (e.g. tier 1 = 1-5
    units = "single", tier 2 = 6-11 = "Pack of 6", etc.), or do packs
    require a new schema (pack-units-per-tier or a separate table)?
     
    answer: we follow the flow followed in design, which is a “pack” based approach, instead of tier-based where min and max are adjustable. we will define quantity and price for packs, and show the same all around, following design. this change requires schema and logic changes, proceed with that ensuring it aligns perfectly with design.

13. **Banner scheduling + CTR/revenue** — Brief mentions "scheduling,
    performance metrics like CTR and revenue" on Admin Banners. Current
    `promotional_banners` table has only `isActive`, `displayOrder`, no
    `startsAt` / `endsAt`, no impression / click counters. New schema
    needed?

    answer: yes new schema needed, we will add startsAt / endsAt, impression / click counters.

14. **Vendor edit panel fields: GST / categories / limits** — Brief
    mentions Admin Vendors edit panel includes "shop info, GST,
    categories, limits". Current `vendors` table: `shopName`, `city`,
    `hub`, `bankName`, `accountTitle`, `iban`, `isActive`. No GST
    number, no per-vendor categories, no limits. New fields?

    Answer: yes new fields needed, we will add categories, limits, but no GST.

15. **"Pin a bazaar" pill in v1 desktop home subnav** — `F4eQQ → Subnav`
    has a "Pin a bazaar" CTA at the right end. This is **only** in the v1
    reference mockup; the v2 `bid1Y` Buyer Home subnav has different
    items. Confirm v1 is reference-only and not part of revamp scope.
    
    Answer: v1 is reference only, not part of revamp scope. we will only implement from v2.

16. **Bilingual UI scope** — Stamps and a couple of strings show
    EN+اردو ("Delivered · پہنچ گیا"; "Salaam, Tariq Bhai · سلام، طارق
    بھائی"). The toggle exists in chrome. Is full UI translation in
    scope, or only specific status/copy moments?

    Answer: We will ignore the transalation altogether now, and will only implement in English. but wee need a toggle in design system so that we can add it later on.


17. **Currency symbols** — Pencil uses **"Rs."** (e.g. "Rs. 4,820") on
    most product/cart/checkout surfaces, and **"₨"** (the rupee sign,
    U+20A8) on vendor dashboard KPIs (e.g. "₨ 4,86,300"). Two separate
    glyphs, two separate display formats (also note the South-Asian
    digit-grouping style "4,86,300"). Standardize to one, or preserve
    both contexts?

    Answer: Standardize to one, and use the South-Asian digit-grouping style.

18. **Hero carousel UI controls** — Buyer Home hero has dot indicators
    only; no prev/next arrows are drawn (mobile shows 3 dots, desktop
    shows arrow chevrons in the `Hero` group geometry). Confirm whether
    arrows should appear on desktop, since I see them implied in
    `bid1Y → Hero` subnodes (`g8ajbB`, `sJhxl`, `fZp9q` look like
    arrow/dot dots).

    Answer: yes arrows should appear in desktop, but not in mobile. As per in pencil designs of this screens.

19. **Vendor mobile bottom tab bar** — Tabs are
    Dashboard / Products / Orders / Ledger / More. **"More" is not a
    route** in the codebase or in any drawn screen. What does it open
    (settings? logout sheet?)? Same question for the bell icon
    in the topbar — there's no notifications screen anywhere in Pencil.

    Answer:  ignore More tab, and bell icon. \
    
20. **`Pencil-Design/Shalmi - Copy.pen` exists** — The folder also
    contains a `.pen` copy. I did not open it. Confirm `Shalmi` (the
    file used here) is canonical, and `Shalmi - Copy.pen` is a stale
    backup that should be ignored.

    Answer: Yes, Shalmi is canonical. ignore Shalmi - Copy.pen.

---

(End of Phase 0.5 design inventory. Stopping here per instructions — not
starting Phase 1.)
