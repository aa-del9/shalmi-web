# Admin · Banners — Gap Analysis

> **Phase:** Per-screen gap analysis (read-only — no code written).
> **Date produced:** 2026-05-02
> **Pencil source:** `Pencil-Design\Shalmi` · Desktop frame `bjD87` · Mobile frame `btIjo`
> **Existing code:** Route `/admin/promo-banners` → `apps/web/src/modules/admin/admin-promo-banners/`
> **DB:** `packages/database/src/schema/promotional-banners.ts`
> **Inputs:** `01-codebase-map.md`, `02-design-inventory.md`, `03-token-migration.md`, `04-design-system-implementation-log.md`.

This artifact lists everything the Pencil design shows on the Admin · Banners
screen against everything the existing code does, flags every divergence, and
lifts each divergence into a numbered question for the user. **No
implementation proposed.** Per CLAUDE.md hard rule 1, every new field / copy
change / interaction implied by the design is treated as an open question, not
an assumption.

---

## 1. Layout & structure

### 1.1 Existing code

`AdminPromoBanners` (`apps/web/src/modules/admin/admin-promo-banners/index.tsx`)
renders a **two-zone** workspace:

1. **Page header.** Title "Promo Banners" (h1, `text-2xl font-semibold`) plus
   two right-aligned buttons: "Add banner" (outline) and "Save Layout" (primary,
   disabled until dirty, swaps to "Saving…" with spinner while pending).
2. **Active carousel section.** `<h2>Active carousel</h2>` over
   `BannersCarousel` — an Embla `Carousel` of full-width slides (one per active
   banner) with prev/next chevrons, plus a horizontally-arranged thumbnail
   strip below it that is **dnd-kit sortable**. Selecting a thumbnail also
   selects the matching active banner; clicking the slide toggles
   `selectedActiveId`. Each slide has a top-right destructive close button to
   remove the banner from the active set. Empty state: dashed `rule` placeholder
   "No active banners. Add banners from below."
3. **Available banners section.** `<h2>Available banners</h2>` + helper
   "Add to carousel or replace an active banner (select one above first)." A
   responsive 2/3/4-col grid (`AvailableBannersGrid`) of banner thumbnails,
   each with a hover overlay showing "Add to Carousel" and (only if an active
   banner is selected) "Replace". Empty state: text "No inactive banners. All
   banners are in the carousel."

Mutations are **batched into a single PUT** `/api/admin/banners/bulk`,
triggered by the page-level "Save Layout" button using a draft-vs-server diff
(`useAdminPromoBanners` keeps `draftBanners` in state, compares against a
`initialBannersRef`, and gates the save button on that comparison).

`BannerDialog` (modal) is the *only* create surface — title + optional
internal-path target URL + image upload. New banners always land with
`isActive=false` (server-side; see `apps/web/src/app/api/admin/banners/route.ts:71`).

### 1.2 Pencil design

The Pencil design replaces the two-zone model with a **single flat grid +
inline edit panel** workspace. Reading top-to-bottom on desktop frame
`bjD87` (1440 × 2023):

1. **Top bar** (`lvS12`, ink, 56h) — admin chrome. Identical pattern to the
   other admin screens.
2. **Sidebar** (`vrhTs`, 240w, white, hairline right border, `Banners` row
   active with `paper-2` fill).
3. **Main column** (`fQiBA`, 1200w, 40px horizontal padding):
   - **Breadcrumb** `bnBC` — "Admin · ▸ · Catalog · ▸ · **Banners**"
     (the trailing crumb is `ink 13/600`; the rest are `ink-3 13/normal`).
   - **Header** `bnHd` (`hSb7d`) — left cluster: title "Banners" (`ink 32/800`,
     letter-spacing -0.02) + subtitle "8 active · 2 scheduled · 1.84 M
     impressions this month" (`ink-3 13/normal`). Right cluster: "Performance
     report" outline button (chart-line icon + label, `rule-2 1.5px stroke`,
     radius 6, padding `[10,16]`) and "New banner" primary button (plus icon
     + label, `green-2` fill, white 14/700).
   - **KPI row** `bnKpi` (`HBLzq`) — 4 fill_container cards, gap 16, all radius
     8, padding 20, hairline `rule` 1px. The first three use `white` fill; the
     fourth uses `green-bg` fill + `green-200` 1px stroke. Per card:
     - `bnk1` "IMPRESSIONS" eyebrow (mono 11/600, ls 0.12, ink-3) → "1.84 M"
       (mono 32/800, ink) → footer row "↗ +18.2% vs last month" (mono 11/700, green).
     - `bnk2` "CLICKS" → "86,420" → "↗ +12.4% vs last month" (green).
     - `bnk3` "AVG CTR" → "4.7%" → "↘ −0.3% vs last month" (mono 11/700, amber).
     - `bnk4` "REVENUE ATTRIBUTED" (green-700 eyebrow) → "Rs. 4.2 L"
       (mono 32/800, green-700) → "From banner clicks → orders" (sans 11/600).
   - **Filters bar** `bnFil` (`gkMJP`) — single white card, radius 8, padding
     `[16,20]`, gap 12, hairline `rule`. Contents:
     - Pill tab group `bnFTabs`: "All 11" (active, `ink` fill, white text 13/700,
       count `#FFFFFFB3`), "Live 8" (inactive, `ink-2 13/600`, ink-3 count),
       "Scheduled 2", "Expired 1". Pills are radius 99, padding `[8,14]`.
     - 1px hairline spacer `bnFsp` (fill_container, height 1).
     - "Position" dropdown `bnFPos` — label "Position" (ink-3 13/normal) + value
       "All" (ink 13/600) + chevron-down. Radius 6, `rule-2 1.5px` stroke.
     - "Sort: Most clicks" dropdown `bnFSrt` — value "Sort: Most clicks"
       (ink 13/600) + chevron-down.
   - **Banner grid** `x74H7` — 2 rows of 3 cards (`bnRow1` / `bnRow2`), gap 16,
     all six cards `fill_container` width × variable height. Card spec below
     (1.3).
   - **Edit panel** `ukNl2` — full-width white card, radius 8, hairline.
     Header `bnEHd` (paper-2, hairline bottom): left = title
     "Edit banner · Hero · Restock smarter" (sans 18/800, ink) + subtitle
     "482,140 impressions · 31,840 clicks · 6.6% CTR" (mono 11/normal, ink-3);
     right = "Cancel" outline + "Save" ink-fill. Body `bnEBody` (gap 24,
     padding 24): two-column horizontal layout — `bnEUp` (380w upload column)
     and `bnEFm` (fill_container form column). Footer `bnEFoot` (paper-2,
     hairline top): left = "Remove banner" red outline; right cluster =
     "Duplicate" outline + "Preview" outline + "Publish changes" green-2.

Mobile frame `btIjo` (420 × 1613) is a vertical stack:
1. Ink top bar (56h, menu icon left + bell + avatar right).
2. Sub-header card `JjsKc` (188h) — title row (`Gpn2b` 314×49) + small CTA
   `gx3cC` (74×32) + 3-cell mini-KPI row `x0ZnSf` (3 × 124w cells) + 3-pill
   filter chip row `kQy63`.
3. Banner list `b2Z4D` — 5 vertical banner cards (each 388×243: 140 image +
   103 body) plus a small footer hint row `x50OQK` (388×37, 14×14 icon + a
   single text line ~342w).

There is **no edit panel on mobile** — the design omits inline editing for
small screens. (Open Q1.)

### 1.3 Banner card spec (Pencil)

Each card on desktop is a vertical `frame`, radius 8, white fill, hairline
`rule` stroke, clipped:

- **Image area** (`bn1Img`, 200h, `fill_container`, `vertical layout`,
  `justifyContent:end`, padding 18) with a colored fill (per banner: green-900,
  ink, amber, blue, green-700, ink-3). Inside it:
  - Decorative absolute-positioned 48px lucide `image` icon at (16, 16),
    fill `#FFFFFF26`.
  - Eyebrow (sans 9/600, green-200, ls 0.16) — e.g. "BULK WHOLESALE · 25
    BAZAARS", "REORDER · QUICK REPLENISH", "RAMADAN BUNDLE · 2026".
  - Title (sans 18/700 white, ls -0.01, lineHeight 1.05).
  - Status stamp `bn1Stp` (top-right, `layoutPosition:absolute`, rotation 1°,
    cornerRadius 3, padding `[3,8]`, mono 10/700 white, ls 0.08, 1.5px stroke
    matching variant). Variants observed:
    - "LIVE" — fill `#15803D40` (green-700 @ 25%), stroke `green-500`.
    - "SCHEDULED" — fill `#1E40AF40`, stroke `blue` (banner #4 strip).
    - "SCHEDULED" — fill `#A1620740`, stroke `amber` (banner #5 hero).
    - "EXPIRED" — fill `#6B716D40`, stroke `ink-3` (banner #6 ramadan).
- **Body** (`bn1Body`, vertical, padding `[14,16]`, gap 10):
  - Header row (`bn1Hdr`, `justifyContent:space_between`):
    - Left: title (sans 14/700 ink) + subtitle (mono 11/normal ink-3) — e.g.
      "Hero · Restock smarter" / "Position: HERO · 1920×720 · 24 Apr → 31 May".
    - Right `bn1Act`: 16px lucide `pencil` (ink-2), `trash-2` (red),
      `ellipsis-vertical` (ink-3). Gap 6.
  - Stats row (`bn1Stats`, padding-top 10, hairline top): 3 cells
    `[IMPRESSIONS, CLICKS, CTR]` with right-hairlines between cells. Eyebrow
    (sans 9/600 ink-3), value (mono 14/700 ink, except CTR is `green` when
    populated and ink-3 dash for unpublished). For SCHEDULED banners the
    values render as "—".

### 1.4 Edit panel form spec (Pencil)

Inside `bnEBody` two-column body:

**Left column `bnEUp` (380w):**
- `bnEUpBox` — drop zone (200h, paper-2 fill, rule-2 1.5px stroke, radius 8,
  centered vertical layout): 32px `image-up` icon (ink-3), heading "Upload
  banner image" (sans 14/700 ink), helper "PNG, JPG, WebP · max 4 MB ·
  1920×720 recommended" (mono 11/normal, ink-3, centered, fill_container).
- `bnECur` — "current file" row (paper-2, radius 6, padding `[10,12]`, gap 10):
  48px green-900 thumbnail with white-translucent image icon, then file info
  vertical stack — filename "hero-restock-may2026.jpg" (mono 12/700 ink) +
  meta "1920×720 · 1.4 MB · uploaded 24 Apr" (mono 10/normal ink-3) — and a
  16px `x` icon at the right (ink-3).

**Right column `bnEFm` (fill_container, vertical, gap 18):**
- `bnEf1` Title field — label "Title" (sans 13/600 ink-2). Input `bnEf1In`
  (44h, white, radius 6, **`ink` 1.5px stroke** — drawn as the active/focused
  state) with body content "Restock smarter, save more" (sans 14/600 ink).
- `bnEf2` Eyebrow / kicker — same shape, default state (`rule-2` 1.5px),
  value "Bulk wholesale · 25 bazaars" (14/normal).
- `bnER1` row (gap 12) — two fill_container fields side by side:
  - `bnEf3` Position select — value "Hero (1920×720)" + chevron-down.
  - `bnEf4` CTA label — value "Shop now".
- `bnEf5` Link URL — mono 13/normal value "shalmi.pk/c/today-lowest".
- `bnER2` row (gap 12) — two fill_container date fields:
  - `bnEf6` Start date — mono 14/normal "24 Apr 2026" + calendar icon.
  - `bnEf7` End date — mono 14/normal "31 May 2026" + calendar icon.
- `bnEStat` Status block (paper-2, radius 8, padding 14): left = label
  "Status" (sans 13/700 ink) + helper "Live banners auto-pause when end date
  passes" (sans 11/normal ink-3); right = segmented toggle (`bnESTog`, radius
  6, ink 1.5px stroke, clipped) with two cells "LIVE" (ink fill, white text,
  selected) and "PAUSED" (transparent, ink text). Each cell padding `[6,12]`.
- `bnEAud` Audience targeting block (paper-2, radius 8, padding 14, hairline
  rule): eyebrow "AUDIENCE TARGETING" (mono 10/700, ls 0.12, ink-3), then 3
  rows justify-space-between:
  - "Cities" → "All Pakistan"
  - "Buyer segment" → "All buyers"
  - "Show on" → "Web + mobile"

### 1.5 Top-line layout diff

| Concern | Existing code | Pencil | Verdict |
|---|---|---|---|
| Page composition | Page-header + 2 sections (active carousel + available grid) | Breadcrumb + page-header + KPI row + filters bar + flat banner grid + edit panel | Wholly different |
| Banner grouping | Two zones partitioned by `isActive` boolean | One flat grid; status (LIVE / SCHEDULED / EXPIRED) is conveyed via stamps; filter pills sub-select status | Fundamental data-model change |
| Reorder UX | dnd-kit sortable thumbnails of active set | None drawn — reorder is not visible in the design | See Q5 |
| Edit UX | Modal dialog (`BannerDialog`) for create only; no edit | Inline edit panel pinned below grid; new + edit both surface here (presumably) | Fundamental UX change |
| Save UX | One "Save Layout" button at top of page; bulk-PUT diff | Per-banner Save (in panel header) + Publish changes (in panel footer) + global "New banner" CTA | Different mutation model |
| Mobile parity | Same layout, responsive grid columns | Stacked card list, no edit panel; small footer hint | Different |

---

## 2. Element-by-element diff

Categories: **VISUAL_ONLY**, **COPY_CHANGE**, **NEW_FIELD**, **REMOVED_FIELD**,
**NEW_INTERACTION**, **CHANGED_INTERACTION**, **NEW_STATE**, **AMBIGUOUS**.

### 2.1 Page chrome / header

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Breadcrumb `bnBC` "Admin > Catalog > Banners" | none — page renders directly with no breadcrumb | New chrome element. Implies "Catalog" parent grouping that does not exist as a route. | NEW_INTERACTION |
| Page header title "Banners" (sans 32/800) | `<h1>Promo Banners</h1>` (`text-2xl font-semibold`) | Title text shortened ("Promo Banners" → "Banners") and typography differs (32/800 vs 24/600). | COPY_CHANGE |
| Header subtitle "8 active · 2 scheduled · 1.84 M impressions this month" | none | New status sentence with live counts. | NEW_INTERACTION |
| Header CTA "Performance report" (outline, chart-line icon) | none | New action — opens a separate report surface. | NEW_INTERACTION |
| Header CTA "New banner" (green-2 + plus icon, label "New banner") | "Add banner" outline button | Label changed; visual treatment changed from outline → filled green primary; new banner still opens a create flow. | COPY_CHANGE + VISUAL_ONLY |
| (none) | "Save Layout" primary button at page level | Page-level bulk-save is not present in the design — Pencil saves per banner via the edit panel. | REMOVED_FIELD / CHANGED_INTERACTION |

### 2.2 KPI row (`bnKpi`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Card 1 — IMPRESSIONS (1.84 M) + delta | none | New metric. Requires an impressions source. | NEW_FIELD |
| Card 2 — CLICKS (86,420) + delta | none | New metric. Requires a clicks source. | NEW_FIELD |
| Card 3 — AVG CTR (4.7%) + delta (amber) | none | New derived metric. | NEW_FIELD |
| Card 4 — REVENUE ATTRIBUTED (Rs. 4.2 L) | none | New attribution metric — requires linking banner clicks → resulting orders. | NEW_FIELD |
| Period label baked into deltas: "vs last month" | none | Implies a period scope (this-month?). No period selector shown — see Q4. | AMBIGUOUS |

### 2.3 Filters bar (`bnFil`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Status pill tabs: All / Live / Scheduled / Expired (with counts) | implicit two-zone partition by `isActive` | Replaces the active/inactive split with a 4-state taxonomy. Requires deriving (or storing) Live/Scheduled/Expired. | NEW_FIELD + NEW_INTERACTION |
| Position dropdown ("All", chevron) | none | New filter axis on a new field (`position`). | NEW_FIELD + NEW_INTERACTION |
| Sort dropdown ("Sort: Most clicks", chevron) | none — list is sorted by `displayOrder` | New sort options (at minimum "Most clicks" — others not drawn). | NEW_INTERACTION |

### 2.4 Banner card (grid)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Card outer (white, radius 8, rule 1px, clipped vertical) | thumbnail wrapper (white card, rounded-lg, border, group hover) | Different shape and density. | VISUAL_ONLY |
| Image area (200h, colored fill standing in for image) with absolute decoration (image icon top-left) | `<Image>` rendering `imageUrl`, with hover overlay covering whole image | Pencil renders banners against a flat color (presumably representing the image), not the image itself, in this snapshot — see Q2. | AMBIGUOUS |
| Eyebrow on image (sans 9/600, green-200, ls 0.16, e.g. "BULK WHOLESALE · 25 BAZAARS") | none | New per-banner field overlaid on the image. | NEW_FIELD |
| Title on image (sans 18/700 white) | the `title` text shows below the image, truncated | Title is now overlaid on the image and uses display typography. Existing `title` lives below in a small caption. | COPY_CHANGE + VISUAL_ONLY |
| Status stamp (LIVE / SCHEDULED / EXPIRED) | none | New status label, derived from new state (see §3). | NEW_STATE |
| Body header — left text (`Hero · Restock smarter` 14/700) + subtitle "Position: HERO · 1920×720 · 24 Apr → 31 May" | `<p className="truncate p-2 text-sm font-medium">{banner.title}</p>` | New compound caption pulling 4 fields: an internal/admin name, position, dimensions, schedule range. Existing `title` is the public caption — see Q3. | NEW_FIELD + AMBIGUOUS |
| Body header — actions (pencil / trash-2 / ellipsis-vertical) | hover overlay buttons "Add to Carousel" + "Replace" | Different action set: edit, delete, more-menu vs add-to-carousel/replace. | CHANGED_INTERACTION |
| Stats row at card foot — IMPRESSIONS / CLICKS / CTR | none | Per-banner counters surfaced on every card. | NEW_FIELD |
| (none) | hover overlay "Add to Carousel" button | Action removed (no active-vs-available concept in design). | REMOVED_FIELD |
| (none) | hover overlay "Replace" button (when an active banner is selected) | Action removed. | REMOVED_FIELD |
| (none) | destructive close button on the active slide (X to remove from active) | The "remove from active" affordance is gone — replaced by the per-card trash-2 (which presumably deletes the banner outright, not just demotes it). | REMOVED_FIELD / CHANGED_INTERACTION |

### 2.5 Edit panel — header (`bnEHd`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Edit panel pinned below grid | `BannerDialog` modal (create-only) | Inline panel replaces modal. | CHANGED_INTERACTION |
| Title "Edit banner · Hero · Restock smarter" + sub "482,140 impressions · 31,840 clicks · 6.6% CTR" | dialog title "Add banner" | Mode is implicit; an "Edit" mode does not exist in code today. Adding requires deciding what header copy reads in create mode (see Q12). | NEW_INTERACTION + COPY_CHANGE |
| "Cancel" outline / "Save" ink-fill in header | dialog footer "Cancel" outline / "Add banner" green | Two save controls now exist in the design — one in the header ("Save", ink) and one in the footer ("Publish changes", green-2). See Q9. | AMBIGUOUS + NEW_INTERACTION |

### 2.6 Edit panel — left column (`bnEUp`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Drop zone box "Upload banner image · PNG, JPG, WebP · max 4 MB · 1920×720 recommended" | `ImageUpload` (`apps/web/src/modules/common/components/image-upload`) | Visual treatment + helper copy + size/dimension constraints all new. | COPY_CHANGE + NEW_FIELD |
| Current file row — filename + "1920×720 · 1.4 MB · uploaded 24 Apr" + remove (x) | dialog renders a small image preview + "Clear" outline button | New metadata strings (filename, size, dimensions, upload timestamp) that are not currently surfaced — see Q11. | NEW_FIELD |

### 2.7 Edit panel — right column (`bnEFm`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Title field "Restock smarter, save more" (44h, ink-stroke 1.5px focus state) | `title` field in `BannerDialog` (Input) | Field present in both — visual treatment retoken per design system. | VISUAL_ONLY |
| Eyebrow / kicker field "Bulk wholesale · 25 bazaars" | none | New text field. | NEW_FIELD |
| Position select "Hero (1920×720)" | none | New enumerated field — implies a fixed position taxonomy and matching dimensions. | NEW_FIELD |
| CTA label field "Shop now" | none | New text field. | NEW_FIELD |
| Link URL field "shalmi.pk/c/today-lowest" (mono) | `targetUrl` (Input, validated as internal `/…` path) | Same idea, but Pencil shows an absolute URL with host (`shalmi.pk/...`) — diverges from the existing internal-path-only validator. See Q10. | CHANGED_INTERACTION |
| Start date "24 Apr 2026" (mono + calendar) | none | New scheduling field. | NEW_FIELD |
| End date "31 May 2026" (mono + calendar) | none | New scheduling field. | NEW_FIELD |
| Status block — label + helper "Live banners auto-pause when end date passes" + LIVE/PAUSED segmented toggle | `isActive` boolean (no UI in dialog; only via active-carousel membership) | The active/inactive boolean has been split into a manual LIVE/PAUSED toggle plus an automatic schedule-driven Expired state. See Q6. | NEW_STATE + CHANGED_INTERACTION |
| Audience targeting block — Cities / Buyer segment / Show on | none | New audience-targeting fields, all readonly-displayed in the snapshot (no edit affordance drawn). See Q13. | NEW_FIELD + AMBIGUOUS |

### 2.8 Edit panel — footer (`bnEFoot`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| "Remove banner" red outline (left) | none in dialog; `trash-2` icon also exists per-card | Destructive delete now has two entry points. Confirm semantics — see Q8. | NEW_INTERACTION |
| "Duplicate" outline (copy icon) | none | New action: clone a banner. | NEW_INTERACTION |
| "Preview" outline (eye icon) | none | New action: preview the banner in its position context (storefront preview?). See Q14. | NEW_INTERACTION |
| "Publish changes" green-2 (right) | n/a | Distinct from header "Save". Implies a draft-vs-live model. See Q9. | NEW_INTERACTION + AMBIGUOUS |

### 2.9 Mobile

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| 3-cell mini-KPI row | none | New mobile-only KPI mini-block (3 cells, not 4 — desktop has 4). See Q15. | NEW_FIELD + AMBIGUOUS |
| Filter chip row (3 chips) | none | Mobile reduces filters to chips. Number of chips (3) ≠ number of pill tabs on desktop (4). See Q15. | AMBIGUOUS |
| 5 banner cards stacked | responsive grid down to 2 cols | Different list density. | VISUAL_ONLY |
| Footer hint row (`x50OQK`, 14×14 icon + 342w text) | none | Single text-line affordance (likely "Manage banners from desktop" or similar). Copy not extracted. See Q1. | AMBIGUOUS |
| (no edit panel on mobile) | (no equivalent — mobile uses same modal) | Confirm whether edit is unavailable on mobile or routes to a separate edit screen. See Q1. | AMBIGUOUS |

---

## 3. Schema / type implications

For every NEW_FIELD or REMOVED_FIELD in §2, here is the concrete DB / API /
Zod surface that would change. (No code is being written — this is the
material the user will need to decide on.)

### 3.1 New columns on `promotional_banners`

Current schema (`packages/database/src/schema/promotional-banners.ts`):

```
id, title, imageUrl, targetUrl, isActive, displayOrder, createdAt, updatedAt
```

The Pencil design implies the following additions. Each is a Q in §5.

| Field | Suggested type | Source of truth | Open Q |
|---|---|---|---|
| `eyebrow` (kicker) | `text` (nullable) | `bn1Img` eyebrow string | Q3 |
| `position` | enum (`hero` / `promo_top` / `strip` / `sidebar` / others?) | `bn1Inf` "Position: HERO / PROMO TOP / STRIP / SIDEBAR" | Q4 |
| `width`, `height` | `integer` × 2 (or derived from position?) | "1920×720" / "1920×400" / "1920×56" / "480×600" | Q4 |
| `ctaLabel` | `text` (nullable) | `bnEf4` "Shop now" | Q3 |
| `startsAt` | `timestamp` (timezone-aware?) | `bnEf6` "24 Apr 2026" | Q6 |
| `endsAt` | `timestamp` (timezone-aware?) | `bnEf7` "31 May 2026" | Q6 |
| `status` (manual) | enum (`live` / `paused`) | `bnESTog` segmented | Q6 |
| `targetCities` | `text[]` or `json` | `bnEAr1` "All Pakistan" | Q13 |
| `targetSegment` | `text` enum | `bnEAr2` "All buyers" | Q13 |
| `targetPlatforms` | `text[]` (`web`, `mobile`) | `bnEAr3` "Web + mobile" | Q13 |
| `internalName` (admin label) | `text` | `bn1Hdr` "Hero · Restock smarter" (distinct from public title "Restock smarter, save more") | Q3 |

**Implications for the existing `isActive` and `displayOrder` columns:**

- `isActive` becomes ambiguous. Pencil distinguishes manual *paused* from
  automatic *expired* (driven by `endsAt`) and *scheduled* (driven by
  `startsAt`). The four pill states (All / Live / Scheduled / Expired) are
  computed from `(status, startsAt, endsAt, now)`. Whether `isActive` is kept
  as a back-compat column, replaced by `status`, or derived → see Q6.
- `displayOrder` / drag-drop is not present in the design. Whether it
  survives → see Q5.

### 3.2 Counters / metrics surface

Per Q13 of `02-design-inventory.md` the user already confirmed
"yes new schema needed, we will add startsAt / endsAt, impression / click
counters." The design surfaces:

- Per-banner: impressions, clicks, CTR, "publish window" (start/end dates).
- Page-level KPIs: total impressions, total clicks, average CTR, **revenue
  attributed**, plus deltas vs "last month".

The DB / API options are:

1. **Counter columns** on `promotional_banners` (`impressions bigint default 0`,
   `clicks bigint default 0`). Cheapest. CTR is derived
   `clicks / NULLIF(impressions, 0)`. No time-series; "vs last month" is not
   computable without a snapshot.
2. **Events table** (`banner_events { id, bannerId, type: impression|click,
   userId?, sessionId?, occurredAt, metadata? }`) — supports any time window.
   Heavier (write volume on impressions especially).
3. **Hybrid:** counters on the row for the dashboard hot path, events table
   for historical aggregations. Most production-realistic.

**Revenue attributed** specifically requires linking a banner → click →
session → resulting order, which the existing `orders` schema does not track.
Either an `orders.attributedBannerId` column, an `order_attributions` join
table, or a separate analytics surface — see Q7.

### 3.3 Position taxonomy

Banner positions observed in Pencil: **HERO** (1920×720), **PROMO TOP**
(1920×400), **STRIP** (1920×56), **SIDEBAR** (480×600). The current
storefront only renders banners on the home page through
`getCachedBanners()` → `BannersCarousel`. There are no rendering surfaces
today for `PROMO TOP` (a horizontal mid-page strip), `STRIP` (a global thin
banner — likely the "promo strip" defined in `02 §3.11`), or `SIDEBAR`. The
schema decision (enum vs free text) and matching storefront work both
hinge on Q4.

### 3.4 Remove `imageUrl` / `targetUrl` shape changes

- Existing `targetUrl` is validated by Zod as an internal path
  (`/^\/[a-zA-Z0-9/_-]*$/`). Pencil shows an absolute URL with a host
  (`shalmi.pk/c/today-lowest`) → see Q10.
- File metadata (filename, size, dimensions, uploaded date) is currently not
  persisted; only `imageUrl` is. Adding the metadata row in the design
  requires a schema decision — see Q11.

### 3.5 Removed concept: two-zone (active vs available)

Removing the `isActive`-driven active-carousel partition has cascading API
effects:

- `PUT /api/admin/banners/bulk` is essentially "atomic toggle of `isActive` +
  `displayOrder` for many rows at once." That semantics goes away if both
  columns go away. The endpoint may still be needed if the user wants
  bulk-pause / bulk-publish, but the current shape is wrong.
- `POST /api/admin/banners` currently inserts with `isActive: false` to land
  the banner in the "available" zone. New mental model: the banner is
  created (perhaps as `paused` until the user fills in dates and toggles
  LIVE).
- `GET /api/banners` (public storefront feed) currently returns
  `isActive: true` rows ordered by `displayOrder`. Replacement criterion
  needs to combine `status === 'live'` AND `now BETWEEN startsAt AND endsAt`
  AND filter by `position`.

Each of these is touched only after Q5 / Q6 are answered.

---

## 4. Behavior implications

For each NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE in §2, the code
paths that would change.

### 4.1 KPI aggregation path

**New code paths:** A KPI provider (`useBannerKpisQuery` or similar) calling
a new endpoint such as `GET /api/admin/banners/kpis?period=this-month` that
sums impressions / clicks / derived CTR / attributed-revenue for the period.
Today's `useBannersQuery` returns row data only — there is no aggregation.

**Open dependencies:**
- Time period — see Q4 / KPI delta period.
- Revenue attribution model — see Q7.

### 4.2 Status filter pills

**New code paths:** A nuqs-backed search-param (e.g. `?status=live`) that
filters `useBannersQuery` results client-side OR moves filtering to the
server (`GET /api/admin/banners?status=…&position=…&sort=…`). Counts on each
pill ("All 11", "Live 8", …) require a separate count query or a
denormalized facet count in the list response.

### 4.3 Schedule validation

**New code paths:**
- Zod schema must validate `startsAt < endsAt` (or both nullable for "ongoing").
- Server-side: schedule changes write to `startsAt`/`endsAt`. The "Status:
  LIVE/PAUSED" toggle is a separate boolean that interacts with dates per Q6.
- Storefront-side: the public banner feed must filter by
  `now BETWEEN startsAt AND endsAt` (so SCHEDULED banners stay hidden until
  start, EXPIRED banners auto-drop after end). If counters live on the row,
  the impression/click writers should refuse to increment outside the
  schedule window, or the analytics layer should ignore those events.

### 4.4 Per-banner edit (replace modal with inline panel)

**New code paths:**
- Add `PATCH /api/admin/banners/[id]` (currently absent). Today only POST
  (create) and PUT bulk exist.
- `useUpdateBannerMutation`.
- The `useAdminPromoBanners` hook moves from a "draft-everything-then-bulk-
  PUT" model to a per-row state machine. The bulk-save dirty-diff logic
  (`utils/areBannersEqual`, `initialBannersRef`) likely goes away, replaced
  by per-banner form state inside the edit panel.
- The `BannerDialog` modal becomes redundant if creation also happens in the
  edit panel — see Q12.

### 4.5 Pause / Resume

**New code paths:** Either a toggle field on the same `PATCH` or a dedicated
`POST /api/admin/banners/[id]/pause` / `…/resume`. Mutation invalidates
the query and updates the LIVE/PAUSED segmented control. Storefront feed
respects `status === 'live'`.

### 4.6 Duplicate

**New code paths:** `POST /api/admin/banners/[id]/duplicate` returning a new
row with copied fields (image URL reused? deep-cloned?). Default values for
`startsAt`/`endsAt` on the duplicate — see Q14.

### 4.7 Preview

**New code paths:** `Preview` opens a public-style preview of the banner.
Implementation options:

1. New route `/admin/promo-banners/[id]/preview` that mounts the storefront
   banner component for the given `position` with the draft data.
2. A draft query param on the storefront, e.g. `/?previewBannerId=…`,
   gated on admin session.
3. Side-panel preview embedded in the edit UI itself.

See Q14.

### 4.8 Performance report

**New code paths:** "Performance report" opens either a deeper analytics
screen or a download (e.g. CSV export). No code path exists today. See Q16.

### 4.9 Audience targeting

**New code paths:** Storefront banner feed must respect the targeting filters
(`targetCities`, `targetSegment`, `targetPlatforms`). City inference comes
from the user's selected delivery hub or session geo — currently there is no
user-city linkage on the storefront feed (`GET /api/banners` filters only
on `isActive`). Buyer segment is undefined in the current schema (no
`segment` column on `user`). See Q13.

### 4.10 Reorder (existing) → (?)

The dnd-kit reorder UX has no Pencil counterpart. Either:
- Reorder still happens but is hidden in an "..." menu / Position select.
- Reorder happens via a Sort field on the banner.
- Reorder is removed entirely (the storefront just renders all `live`
  banners in `startsAt` desc order).

See Q5.

### 4.11 Storefront consumer

`apps/web/src/modules/promotions/utils/get-cached-banners.ts` and the
storefront `HeroCarousel` consume the public feed. Any `isActive` →
status-and-window change must propagate there or the front page goes blank.
Out of scope for this gap analysis but flagged so the cross-screen impact
is on record.

---

## 5. Open questions for me

Numbered. Every row in §2 with a non-VISUAL_ONLY category lifts here.

### Q1 — Mobile edit affordance

- **Observed (design):** Mobile frame `btIjo` shows banner cards but **no
  edit panel**. There is a small footer row (`x50OQK`, 14×14 icon + a 342w
  single line of text) whose copy I have not extracted; the rest of the
  screen is read-only browse + filter chips.
- **Observed (code):** `BannerDialog` modal works on every viewport
  identically.
- **Question:** Is editing intentionally unavailable on mobile, and if so
  what does the footer hint say?
- **Plausible answers:**
  (a) Mobile is read-only — the footer reads something like "Edit banners
      from desktop" and the per-card pencil/trash icons are decorative or
      omitted on mobile.
  (b) Mobile keeps creating + editing through the existing dialog (the
      design just didn't draw the modal on mobile).
  (c) Mobile pushes editing into a full-screen route
      (`/admin/promo-banners/[id]`) instead of an inline panel.

**Answer:** Mobile is read-only — footer hint reads "Edit banners from desktop"; per-card pencil/trash icons omitted on mobile. Smallest delta — no extra mobile route.

### Q2 — Image fills on banner cards in the design

- **Observed (design):** Each banner card's image area is rendered as a
  flat color (green-900, ink, amber, blue, green-700, ink-3) with a
  decorative `image` icon at top-left, not as a real image. The eyebrow +
  title overlays are colored as if for a hero banner image.
- **Observed (code):** Actual user-uploaded `imageUrl`s are rendered with
  `<Image>`.
- **Question:** Are those flat-color rectangles placeholders for the actual
  uploaded image, or is the color a per-banner background-color field that
  the design intends as a real prop alongside the image?
- **Plausible answers:**
  (a) Placeholder only — the real card renders the uploaded image filling
      the area; the eyebrow/title overlays sit on top of the image with the
      design's typography.
  (b) New field — `backgroundColor` (or `accentColor`) on the banner row,
      used as a fallback when no image is uploaded and as a tint behind the
      stamp/title.
  (c) The grid card never renders the image — it always uses an
      admin-chosen accent color, and the image only renders on the
      storefront.

**Answer:** Placeholder only — the real card renders the uploaded `imageUrl`; eyebrow/title overlay sits on top.

### Q3 — Per-banner copy fields surface (eyebrow / title / internal name / cta label)

- **Observed (design):** Each card shows three distinct copy strings:
  - **Eyebrow / kicker** on the image (e.g. "BULK WHOLESALE · 25 BAZAARS").
  - **Public title** on the image (large, "Restock smarter, save more").
  - **Admin / internal name** in the body header (small, "Hero · Restock
    smarter").
  - **CTA label** in the edit panel ("Shop now").
- **Observed (code):** Only `title` exists on `promotional_banners`.
- **Question:** Are these all distinct fields, or is the body-header
  caption derived from `position` + a slug of the title?
- **Plausible answers:**
  (a) Four new fields: `eyebrow`, `internalName`, `ctaLabel`, plus the
      existing `title` repurposed as the public hero title.
  (b) Three new fields: `eyebrow`, `ctaLabel`, and an `internalName` that
      defaults to `title` and is editable.
  (c) The body-header caption is purely derived: `${position} · ${title}`
      and only `eyebrow` + `ctaLabel` are new.

**Answer:** Four new fields: `eyebrow`, `internalName`, `ctaLabel`, plus existing `title` repurposed as the public hero title. Cleanest schema; matches Pencil literally.

### Q4 — Position taxonomy and dimensions

- **Observed (design):** Four positions referenced in card subtitles —
  HERO (1920×720), PROMO TOP (1920×400), STRIP (1920×56), SIDEBAR (480×600).
  Edit panel position field reads "Hero (1920×720)" with a chevron.
- **Observed (code):** No position concept; `getCachedBanners()` returns a
  flat list rendered only by the home `HeroCarousel`.
- **Question:** Which positions are in scope, and where does each render on
  the storefront?
- **Plausible answers:**
  (a) Four positions exactly as drawn — HERO renders on home above the
      categories, PROMO TOP renders mid-home, STRIP is a global top-of-page
      strip on every storefront page, SIDEBAR renders on category pages.
      Dimensions are baked into the position enum.
  (b) Only HERO ships now; PROMO TOP / STRIP / SIDEBAR are future positions
      drawn for completeness.
  (c) Position is a free-text label and the storefront ignores it for now.

**Answer:** DEFERRED — see 06-scope-cut.md feature: Admin Banners scheduling + status state machine. Do not implement this question's scope. UI placeholder: Add a `position` column with enum but ship only HERO storefront slot.

### Q5 — Reorder / display order

- **Observed (design):** No drag handles, no order numbers, no "drag to
  reorder" affordance. Sort is "Most clicks" by default.
- **Observed (code):** `displayOrder` integer + dnd-kit sortable thumbnails
  drive the public banner sequence.
- **Question:** Does ordering still exist?
- **Plausible answers:**
  (a) Drop ordering entirely — storefront renders banners in some implicit
      order (newest `startsAt` first, or random within position).
  (b) Keep `displayOrder` per `position` but expose it through a numeric
      "Sort order" input in the edit panel rather than drag-drop.
  (c) The Sort dropdown ("Sort: Most clicks") is the *admin list* sort only
      — the *public* render order is something else (e.g. always honors a
      `displayOrder`, just not editable from this screen).

**Answer:** Keep `displayOrder` per `position` but expose through a numeric "Sort order" input in the edit panel. Preserves existing storefront contract; drops only the dnd-kit UI.

### Q6 — Status model: LIVE / PAUSED / SCHEDULED / EXPIRED

- **Observed (design):**
  - Filter pills: All / Live / Scheduled / Expired.
  - Card stamps: LIVE (green), SCHEDULED (blue or amber — both observed),
    EXPIRED (grey).
  - Edit panel "Status" segmented toggle with two cells: **LIVE / PAUSED**
    plus helper "Live banners auto-pause when end date passes".
- **Observed (code):** `isActive` boolean only.
- **Question:** What is the precise state machine?
- **Plausible answers:**
  (a) Manual flag is `live` or `paused`; derived label is one of
      `live`/`scheduled`/`paused`/`expired` based on `(status, startsAt,
      endsAt, now)`. Two SCHEDULED stamp colors (blue and amber) are just
      visual noise, not distinct sub-states.
  (b) Five distinct stored states (`draft` / `scheduled` / `live` /
      `paused` / `expired`) with explicit transitions, and the segmented
      toggle only exposes the user-controlled live↔paused transition.
  (c) Three stored states (`live` / `paused` / `archived`) and SCHEDULED /
      EXPIRED are derived from dates regardless of stored state.

  **Sub-question — two SCHEDULED colors.** Banner #4 has SCHEDULED in blue,
  banner #5 has SCHEDULED in amber. Are these two visual variants of the
  same logical state, or do they map to different sub-states (e.g.
  "scheduled-soon" vs "scheduled-far")?

**Answer:** Manual flag `live | paused`; derived label is `live | scheduled | paused | expired` from `(status, startsAt, endsAt, now)`. Two SCHEDULED stamp colors collapse to one. Matches Pencil-confirmed feature in scope-cut.

### Q7 — Revenue attribution

- **Observed (design):** KPI card "REVENUE ATTRIBUTED · Rs. 4.2 L · From
  banner clicks → orders" (green-bg). Edit panel does not show per-banner
  revenue.
- **Observed (code):** No banner→click→order linkage exists. `orders` has
  no `attributedBannerId`, no UTM, no campaign columns.
- **Question:** How is revenue attributed?
- **Plausible answers:**
  (a) Add `orders.attributedBannerId` (last-click attribution within a
      session): when a user clicks a banner, store the banner id in the
      session; if any order is placed in that session, mark the order as
      attributed to that banner.
  (b) `order_attributions` join table allowing multi-touch (user can be
      attributed to several banners across an order).
  (c) Out of scope for v1 — KPI card shows a placeholder figure / zero and
      we wire revenue later.

**Answer:** DEFERRED — see 06-scope-cut.md feature: Banner performance analytics & revenue attribution. Do not implement this question's scope. UI placeholder: KPI card "REVENUE ATTRIBUTED" hidden or shows "—".

### Q8 — Delete semantics (per-card trash + footer "Remove banner")

- **Observed (design):** Two delete entry points — the small `trash-2` icon
  in the card body header, and a "Remove banner" red outline at the bottom
  of the edit panel.
- **Observed (code):** No delete endpoint exists.
- **Question:** Is there one delete or two?
- **Plausible answers:**
  (a) Both call the same hard-delete endpoint (`DELETE /api/admin/banners/[id]`).
      Card icon is a quick action, panel button is a long-form action with a
      confirmation.
  (b) Card trash is a soft-delete / archive; "Remove banner" is hard-delete.
  (c) Card trash deletes immediately with a toast undo; "Remove banner"
      deletes only after the dirty-state on the panel is reset.

**Answer:** Both call the same hard-delete `DELETE /api/admin/banners/[id]`. Card icon = quick action with confirm Dialog; panel button = same action with confirm.

### Q9 — Two save controls in edit panel: "Save" vs "Publish changes"

- **Observed (design):** Edit panel header has "Cancel" + "Save" (ink fill).
  Edit panel footer has "Remove banner" + "Duplicate" + "Preview" + "Publish
  changes" (green-2 fill). Both Save controls write data.
- **Observed (code):** N/A — current dialog has one "Add banner" submit.
- **Question:** What's the difference between Save and Publish changes?
- **Plausible answers:**
  (a) "Save" = save as draft (banner stays paused / scheduled depending on
      dates); "Publish changes" = save AND immediately set LIVE.
  (b) "Save" = save admin-only fields (internal name, audience); "Publish
      changes" = save the consumer-facing content (title, CTA, image) and
      invalidates the storefront cache.
  (c) Visual redundancy — both are the same action and only one ships.

**Answer:** Visual redundancy — only one Save action ships; drop the second button.

### Q10 — Link URL: internal path vs absolute URL

- **Observed (design):** "Link URL" field shows `shalmi.pk/c/today-lowest`
  (no scheme, hostname-prefixed).
- **Observed (code):** `createBannerSchema.targetUrl` requires
  `^/[a-zA-Z0-9/_-]*$` (an absolute internal path starting with `/`).
- **Question:** Does the field accept hostnames or stays internal?
- **Plausible answers:**
  (a) Same as today — internal-only path (`/c/today-lowest`); the design's
      hostname prefix is a presentational hint shown in the input but stored
      as `/c/today-lowest`.
  (b) Allow absolute URLs (any external link); validate as URL, no scheme
      restriction.
  (c) Allow both, with separate handling (internal paths use Next router,
      absolute URLs do `<a target="_blank">`).

**Answer:** Same as today — internal-only path. Hostname prefix in design is presentational only. Preserves existing `createBannerSchema.targetUrl` regex (`^/[a-zA-Z0-9/_-]*$`).

### Q11 — File metadata storage

- **Observed (design):** Current-file row shows filename
  ("hero-restock-may2026.jpg"), dimensions (1920×720), file size (1.4 MB),
  upload date (24 Apr).
- **Observed (code):** Only `imageUrl` is stored; the filename/size/dims
  metadata isn't persisted (Supabase upload returns URL only via
  `/api/admin/upload/promo-assets`).
- **Question:** Are these strings persisted or computed on read?
- **Plausible answers:**
  (a) Persist `imageFilename`, `imageWidth`, `imageHeight`, `imageBytes`,
      `imageUploadedAt` columns at upload time.
  (b) Derive on read by HEAD-requesting Supabase Storage.
  (c) Skip — show only filename (parsed from URL) and uploaded-at (from
      `createdAt`); drop the dimension and size strings.

**Answer:** Skip — show filename parsed from URL and uploaded-at from `createdAt`; drop dimension/size strings. No schema change.

### Q12 — Create flow vs edit flow surface

- **Observed (design):** "New banner" green CTA in page header. Edit panel
  is shown for an *existing* banner (it has counters, a current-file row,
  etc.). The panel for create is not drawn separately.
- **Observed (code):** Create happens in `BannerDialog`. There is no edit.
- **Question:** When the user clicks "New banner", does the edit panel
  enter create mode (with empty values), or does a separate dialog/route
  open?
- **Plausible answers:**
  (a) Edit panel doubles as create — clicking "New banner" focuses it,
      blanks the fields, and the header reads "New banner" instead of
      "Edit banner · …". On Save the row is created and the panel switches
      to edit mode for that row.
  (b) Keep `BannerDialog` for create, edit panel for edit only.
  (c) Two separate routes: `/admin/promo-banners/new` and
      `/admin/promo-banners/[id]/edit`.

**Answer:** Edit panel doubles as create — clicking "New banner" focuses it, blanks fields, header reads "New banner".

### Q13 — Audience targeting: edit-able or display-only

- **Observed (design):** Audience block shows three rows (Cities / Buyer
  segment / Show on) with values to the right. No chevrons or edit
  affordances are drawn — looks like a read-only summary.
- **Observed (code):** No audience targeting fields exist anywhere.
- **Question:** Are these fields editable, and if so what are the value
  taxonomies?
- **Plausible answers:**
  (a) Read-only for v1 — every banner is "All Pakistan / All buyers / Web +
      mobile" by default and these strings are static labels. Schema just
      stores defaults until targeting ships.
  (b) Editable but not drawn in the snapshot — a click reveals selectors.
      Cities = list of supported cities (currently undefined in schema);
      Segments = `all_buyers / new_buyers / repeat_buyers` (no `segment`
      column on `user` today); Platforms = checkboxes for `web`/`mobile`.
  (c) Out of scope for the revamp — fields are aspirational, drop them.

**Answer:** DEFERRED — see 06-scope-cut.md feature: Banner audience targeting. Do not implement this question's scope. UI placeholder: Hide the audience block entirely.

### Q14 — Preview and Duplicate actions

- **Observed (design):** "Preview" eye icon + "Duplicate" copy icon in the
  edit panel footer. No flow drawn.
- **Observed (code):** Neither action exists.
- **Question — Preview:** Where does Preview show the banner?
- **Plausible answers:**
  (a) Inline modal showing the banner against a faux storefront frame.
  (b) Open the storefront homepage in a new tab with `?previewBannerId=…`.
  (c) Side-panel preview in the same screen.
- **Question — Duplicate:** What gets cloned?
- **Plausible answers:**
  (d) All fields except dates (start/end reset to null, status set to
      paused).
  (e) All fields including dates.
  (f) Everything but counters and image URL (force re-upload).

**Answer:** Preview = (b) open storefront homepage in new tab with `?previewBannerId=…`. Duplicate = (d) all fields except dates (status forced to `paused` on the clone).

### Q15 — Mobile KPI mini-row and filter chips count

- **Observed (design):** Mobile shows a 3-cell mini-KPI row but desktop has
  4 KPI cards. Mobile shows 3 filter chips but desktop has 4 status pill
  tabs (All / Live / Scheduled / Expired).
- **Observed (code):** No mobile differentiation.
- **Question:** Which KPIs and filter pills are dropped on mobile?
- **Plausible answers:**
  (a) Mobile drops "Revenue attributed" (largest, most data-heavy) and "All"
      pill (since it's just the unfiltered view) — leaving Impressions /
      Clicks / CTR and Live / Scheduled / Expired.
  (b) Mobile drops a different combination — confirm which.
  (c) Mobile chips are different filter axes (e.g. position chips), not the
      desktop status pills.

**Answer:** DEFERRED — see 06-scope-cut.md feature: Banner performance analytics & revenue attribution. Do not implement this question's scope. UI placeholder: mini-row hidden on mobile; filter chips collapse to 3 status pills (Live / Scheduled / Expired).

### Q16 — "Performance report" CTA

- **Observed (design):** Header outline button with chart-line icon labelled
  "Performance report".
- **Observed (code):** No such surface.
- **Question:** What does this open?
- **Plausible answers:**
  (a) A full-screen analytics page at `/admin/promo-banners/performance`
      with charts (impressions over time, click-through funnels, top
      banners, etc.).
  (b) A downloadable export (CSV / PDF) of current banner KPIs.
  (c) An external link to a third-party analytics dashboard.

**Answer:** DEFERRED — see 06-scope-cut.md feature: Banner performance analytics & revenue attribution. Do not implement this question's scope. UI placeholder: hide button.

### Q17 — Header subtitle counts vs KPI card counts

- **Observed (design):** Header subtitle reads "8 active · 2 scheduled ·
  1.84 M impressions this month". The 1.84 M figure also appears in the
  IMPRESSIONS KPI card. The "active" / "scheduled" counts also appear in
  the filter pills ("Live 8" / "Scheduled 2") — but the subtitle says
  "active" while the pill says "Live".
- **Observed (code):** No counts surface.
- **Question:** Is "active" in the subtitle the same as "Live" in the pill,
  and are these all sourced from the same query?
- **Plausible answers:**
  (a) Yes — "active" is just a synonym for "live"; one count source feeds
      both. The subtitle copy should align with the pill copy ("8 live").
  (b) "Active" includes Live + Scheduled (banners not yet expired) while
      "Live" means currently rendering.
  (c) The subtitle is dynamic copy that should be reviewed before shipping
      since the wording mixes legacy ("active") and new ("scheduled")
      taxonomy.

**Answer:** Drop impressions count from subtitle (perf DEFERRED — see 06-scope-cut.md feature: Banner performance analytics & revenue attribution). Status counts: "active" is synonym for "live"; one count source. Subtitle becomes "8 live · 2 scheduled".

### Q18 — Card stats render for SCHEDULED banners ("—" placeholder)

- **Observed (design):** Banner #4 (strip, SCHEDULED blue) and banner #5
  (hero, SCHEDULED amber) show "—" for IMPRESSIONS / CLICKS / CTR. Banner
  #6 (EXPIRED) shows real numbers.
- **Observed (code):** N/A.
- **Question:** Are stats hidden because the banner has no events yet
  (zero), or because it has not yet started (filtered out from analytics
  intentionally)?
- **Plausible answers:**
  (a) Always show numbers — "—" when literally zero, real number otherwise.
  (b) Show "—" when status === scheduled (regardless of any leaked
      impressions); show real numbers for live / paused / expired.
  (c) Show "—" when `now < startsAt`; otherwise render counters.

**Answer:** DEFERRED — see 06-scope-cut.md feature: Banner performance analytics & revenue attribution. Do not implement this question's scope. UI placeholder: per-card stats hidden entirely under perf-DEFERRED placeholder.

### Q19 — Title typography and copy change ("Promo Banners" → "Banners")

- **Observed (design):** Header reads "Banners" only.
- **Observed (code):** Title is "Promo Banners"; the route is
  `/admin/promo-banners`.
- **Question:** Is the title change intentional, and should the route also
  change to `/admin/banners`?
- **Plausible answers:**
  (a) Title only — keep route at `/admin/promo-banners`.
  (b) Both — rename route to `/admin/banners` (and the module + DB-schema
      file). The DB table `promotional_banners` is independent.
  (c) Keep "Promo Banners" — design copy is shorthand.

**Answer:** Title only; keep route at `/admin/promo-banners`. Smallest diff — avoids touching constants and DB table name.

### Q20 — "1.84 M" / "Rs. 4.2 L" Indian abbreviation format

- **Observed (design):** KPIs use SI Indian numbering ("1.84 M" for 1.84
  million; "Rs. 4.2 L" for 4.2 lakh). Header subtitle also uses "1.84 M".
- **Observed (code):** Today there is no number-formatting helper for these
  abbreviations.
- **Question:** Confirm the abbreviation rules — when does a value collapse
  to "K" / "L" / "Cr" / "M"?
- **Plausible answers:**
  (a) Indian SI: thousand=K, lakh=L (10⁵), crore=Cr (10⁷); switch to
      whichever bracket the value lands in. (But the design uses "M" for
      1.84 million — inconsistent with that scheme.)
  (b) Western SI: K (10³), M (10⁶), B (10⁹). "Rs. 4.2 L" would not exist;
      it would be "Rs. 420 K".
  (c) Mixed by intent — use "M" for impression counts (large but global)
      and "L" / "Cr" for currency (PKR-rooted). Define an explicit mapping.

  This intersects user direction in `02 §7 Q17` ("Standardize to one,
  South-Asian digit-grouping") — answer there talks about
  digit-grouping (4,86,300) but not about the "K / L / M / Cr"
  abbreviation rule. So this needs a fresh answer.

**Answer:** STUBBED — see 06-scope-cut.md feature: Currency formatter (South-Asian grouping + lakh notation). Implement with placeholder: `Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })` for full grouping; lakh/crore notation only on KPI hero numbers (threshold ≥ 1,00,000). Add `// TODO(post-v1):` comment at every touch point.

---

**Gap-analysis written to:** `D:\Moeed 8th Sem\Fyp\Code\shalmi-web\.claude-revamp\screens\admin-banners\gap-analysis.md`

(End of admin-banners gap analysis. Stopping here per workflow — not starting
implementation.)

Answers propagated on 2026-05-02 from 06-scope-cut.md + 07-default-proposals.md
