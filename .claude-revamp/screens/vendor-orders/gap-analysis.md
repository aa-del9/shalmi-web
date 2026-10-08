# Gap Analysis — Vendor · Orders

> **Phase:** Per-screen gap analysis (read-only, no code changes)
> **Date produced:** 2026-05-02
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop `jXwqE` (Vendor · Orders · Desktop) / Mobile `EEK8K` (Vendor · Orders · Mobile)
> **Code source:**
> - Route: `apps/web/src/app/vendor/orders/page.tsx` → `VendorOrders` (CC, middleware-gated)
> - Module: `apps/web/src/modules/vendor/vendor-orders/` (`index.tsx`, `components/order-card`, hooks for query + status-update mutation)
> - Layout: `apps/web/src/modules/vendor/vendor-layout/index.tsx` (sidebar + sticky header)
> - API: `GET /api/vendor/orders`, `PATCH /api/vendor/orders/[subOrderId]`
> - Schema: `packages/database/src/schema/{sub-orders,order-items,orders}.ts`

This is a discovery document. Per CLAUDE.md, no fields/copy/behavior have been
inferred — every divergence between Pencil and code is enumerated and either
labelled as a non-ambiguous category (VISUAL_ONLY, etc.) or escalated as an
open question.

---

## 1. Layout & structure

### Desktop (`jXwqE`, 1440 × 2930)

Pencil composes the screen as: `Top bar (LslMi, ink, padding [10,32])` +
`Body (ANyyi)`. The body's top-down composition (visible in the screenshot
of `jXwqE`):

1. **Sidebar** (240w, white, hairline right rule) — chrome, shared across all
   vendor screens. `Orders` nav row is the active row (paper-2 fill); it
   carries an **amber `8` pending-order badge** that is reused across vendor
   screens (per the screen-doc summary in `vendor-portal.md`).
2. **Main column** (≈1200w, padding ~40/48/80/48) containing, in order:
   - **Hero / page header.** Eyebrow + H1 ("8 orders to pack") + subtitle.
   - **Status segments frame** (`Status segments`, the "NEW / PACKED /
     DISPATCHED ratio block" called out in `02-design-inventory.md` §4.4 and
     reaffirmed by the brief). 3 tiles in a row, each with a count and a
     label.
   - **`voSubHd`** — sub-header band (eyebrow "Packing list" + "X open
     orders" meta on the right; possibly with an action affordance).
   - **Order cards** — vertical stack. Each card carries the giant "Packed ✓"
     green CTA spanning full card width. Multiple line-item rows above the
     CTA, header eyebrow with order id and a status stamp, recipient line.
   - **Later zone** — paper-2 callout near the bottom (e.g. "8 more orders
     queued for today"), styled per Pencil §3.8 receipt-cream surface
     (paper-2 fill, 1.5px rule-2 stroke).

### Mobile (`EEK8K`, 420 × 2206)

Pencil children of the mobile frame (verified via `pencil:batch_get`):

1. `fAWNZ` — App bar (ink, padding [12,16]).
2. `p0bA2L` — Hero (paper, padding [20,16,16,16], hairline bottom).
3. `a9Xa9` — Status segs (paper, padding [12,16]). Confirmed via screenshot:
   3 tiles `8 NEW` (amber-bg) / `14 PACKED` (white) / `286 COMPLETE`
   (green-bg).
4. `ucjsk` — Cards stack (gap 18, padding [18,16,32,16]).

**Note (AMBIGUOUS):** the brief and `vendor-portal.md` say all vendor mobile
pages have a bottom tab bar (Dashboard / Products / Orders / Ledger / More).
The drawn `EEK8K` frame contains **only the 4 children above** — there is no
`vJBmE`/`lSsjh` tab bar inside this frame. Either the bottom tab bar is
intentionally omitted from this screen, lives in the layout above the screen
frame, or was simply not drawn here. → Open Q1.

### Existing code structure

`VendorLayout` (`apps/web/src/modules/vendor/vendor-layout/index.tsx`):
- `SidebarProvider` + `VendorSidebar` + `SidebarInset`
- A **sticky shadcn-style header** (`h-14`) inside `SidebarInset` containing
  `SidebarTrigger`, the literal text "Vendor", and a `LogoutButton` on the
  right.
- Children render inside a padded `flex-1` div.

`VendorOrders` (`apps/web/src/modules/vendor/vendor-orders/index.tsx`):
- A **sticky 3-tab segmented bar** at top of the content area, where each
  tab is *both* a filter and a count indicator. Tabs: `pending` ("Naye
  Order"), `packed` ("Pack Ho Rahay"), `handed_to_courier` ("Bhejne Ke Liye
  Tayar"). Roman Urdu labels.
- A vertical stack of `OrderCard`s, filtered to the active tab.
- Loading / error / empty states, all with Roman Urdu copy and emoji
  affordances.

`OrderCard` (`apps/web/src/modules/vendor/vendor-orders/components/order-card/index.tsx`):
- Card style: rounded-2xl, **dashed-border receipt aesthetic**, with a
  conic-gradient zigzag bottom edge (`maskImage`).
- Header: `orderDisplayId` (mono) + relative time ago + recipient name +
  city.
- Line items: 64px image thumbnail + product name + unit price (mono) +
  large numeric quantity + small "qty" caption.
- COD total row.
- Single action button (`h-14`, full-width) whose label changes per status:
  `pending → "Pack Kar Liya"`, `packed → "Courier Ko De Diya"`,
  `handed_to_courier → null` (no button).
- On success: triggers `navigator.vibrate([100,50,100])` and plays
  `/success-ding.wav`.

### Cross-mapping (high level)

| Pencil layout slot | Existing code | Diff summary |
|---|---|---|
| Ink top bar (`LslMi`) | `VendorLayout` header — sticky, white `bg-background`, `h-14`, with literal "Vendor" text + `LogoutButton` | Chrome differs (white vs ink, different content). Out of scope here but the screen sits inside it. |
| Sidebar with `Orders` active + amber `8` badge | `VendorSidebar` — no per-route badge today | Sidebar revamp out-of-scope; the **badge** itself is new and needs a count source — see Q-SIDEBAR. |
| Main column hero — H1 "8 orders to pack" + subtitle | No equivalent. The current screen jumps straight into the sticky tab bar. | NEW (a hero/page header replaces the tab bar as the column header). |
| Status segments frame (3 tiles) | Sticky 3-tab segmented bar (3 tabs) | Visually different; semantically overlapping but **status taxonomy and selection behavior** differ (see §2 row "Status segments / tabs"). |
| `voSubHd` (eyebrow + meta) | None | NEW. |
| Order cards (paper, hairline, giant CTA) | Order cards (white, dashed-border receipt with zigzag, smaller CTA) | Substantially restyled; the action workflow also differs (one giant CTA per card vs a contextual button that flips label between two transitions). |
| Later zone paper-2 callout | None | NEW callout. |
| (No equivalent in design) | Loading state with `Loader2` + Roman Urdu copy | Removed in design? Or just not drawn? |
| (No equivalent in design) | Error state (red card) | Same Q. |
| (No equivalent in design) | Empty state per tab (📭 + Roman Urdu copy) | Same Q. |
| (No equivalent in design) | Vibration + audio feedback on advance | Same Q. |
| (No equivalent in design) | 5-second polling (`refetchInterval: 5000`) | Likely behavior-only, unrelated to design. |
| Mobile bottom tab bar (per brief) | None | Brief says it should be there; design frame doesn't draw it — see Q1. |

---

## 2. Element-by-element diff

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Ink top bar (`LslMi`, padding [10,32], `Vendor` branding + nav state per `vendor-portal.md`) | `VendorLayout` `<header>` (`h-14`, `bg-background`, hairline bottom, contains `SidebarTrigger`, literal "Vendor", `LogoutButton`) | Different fill (ink vs white), different content (Pencil shows brand mark + role badge + likely bell/avatar — chrome-level; existing is a minimal sticky header) | VISUAL_ONLY (cross-screen chrome — flagged here for awareness, not for resolution in this gap analysis) |
| Sidebar `Orders` row with amber `8` pending-order badge | `VendorSidebar` Orders row, no badge | Badge requires a pending-orders count source; not present today | NEW_FIELD |
| Hero / page header — H1 "8 orders to pack" + eyebrow + subtitle | No corresponding component in `VendorOrders` | New page-header organism with copy whose source is unclear (literal vs computed from the data) | NEW_FIELD |
| Hero subtitle copy | n/a | What is the source string ("8 orders to pack" — is `8` `count(pending)`? Is it sub-orders or distinct orders?) | AMBIGUOUS |
| Status segments frame `a9Xa9` — 3 tiles `8 NEW` (amber-bg) / `14 PACKED` (white) / `286 COMPLETE` (green-bg) (mobile) | Sticky 3-tab bar with `pending` / `packed` / `handed_to_courier` keys | Three buckets in both, but **labels differ** (NEW vs Naye Order; PACKED vs Pack Ho Rahay; **COMPLETE vs Bhejne Ke Liye Tayar**), and the third bucket maps differently (Pencil `COMPLETE` vs code `handed_to_courier`); also the **interaction model** is unclear — see Q3 | COPY_CHANGE + AMBIGUOUS |
| Status segment third tile label — desktop says `DISPATCHED` (per task brief) but mobile screenshot says `COMPLETE` | n/a | Two different labels in the same screen across breakpoints; unclear which is canonical | AMBIGUOUS |
| Status segments interaction (clickable filter? read-only summary?) | Existing tabs are clickable filters with `useState` selection | Pencil draws no obvious "selected" visual treatment on the segments — they may be display-only stats, in which case the cards list is single-bucket only | AMBIGUOUS |
| `voSubHd` sub-header (eyebrow "Packing list" + `X open Orders` meta + possible CTA) | No equivalent | Source of "open Orders" count + whether there is a CTA (e.g. "Go Live", "Print all", filter dropdown) | NEW_FIELD |
| Hero "Print all" / batch action (visible-ish as "Go Live" or similar pill near subhead) | None | Possible new action; can't confirm without batch_get of header subnodes | AMBIGUOUS |
| Order card header eyebrow — "Order · #SH-24891" with status stamp | `orderDisplayId` (mono) + relative `timeAgo()` (`createdAt`-based) | Pencil header surfaces a status stamp inline; existing surfaces a relative timestamp instead | COPY_CHANGE + REMOVED_FIELD (timeAgo) |
| Order card recipient row (visible in screenshot — appears as a single line with name/right-side meta) | `{shippingName} · {shippingCity}` | Likely the same data, but the **visual treatment** and possibly which fields appear differ (Pencil may show address fragment, item-count, weight, etc.) | AMBIGUOUS |
| Order card line item — qty appears in a **left-side mono qty box**, then product name + size/text on the right | line item shows 64px **product image thumbnail** on the left, name + unit price middle, large mono qty on the right | The line-item layout is essentially **mirrored** and the product image is **dropped** in the Pencil version (no thumbnails visible at this zoom) | REMOVED_FIELD (image) + CHANGED_INTERACTION |
| Order card line item secondary text | code shows `formatPrice(unitPrice) + " each"` | Pencil rows look like "size/weight" or "carton of N"-style descriptors, not unit price | COPY_CHANGE / AMBIGUOUS (need batch_get on a row to confirm exact strings) |
| Per-line-item unit price | shown in code | Not visibly shown in Pencil rows | REMOVED_FIELD |
| Per-line-item product image | shown in code (64px thumb, fallback emoji) | Not present in Pencil card rows | REMOVED_FIELD |
| Order card COD total row ("COD Total" + amount, mono) | rendered in code | Not obviously present at the bottom of the Pencil card (the bottom of the card is the giant CTA). May be in the header area instead. | AMBIGUOUS / REMOVED_FIELD |
| Order card weight info | not surfaced in code | Possibly surfaced in Pencil header-right area (weightGrams exists in `VendorSubOrder` type but unused) | NEW_FIELD (display-only — data already exists) |
| Order card giant green "Packed ✓" CTA (full card width, ~tall, Pencil green-2) | h-14 button with status-dependent label ("Pack Kar Liya" / "Courier Ko De Diya" / null) | **Same workflow conceptually** for `pending → packed`, but: (a) Pencil draws the same CTA on every visible card with a single label "Packed ✓" — implying the cards list is filtered to a single status (likely `pending`); (b) the existing implementation has a second transition CTA ("Courier Ko De Diya" for packed → handed_to_courier) which has no equivalent CTA visible in Pencil; (c) copy differs (English "Packed ✓" vs Roman Urdu "Pack Kar Liya") | CHANGED_INTERACTION + COPY_CHANGE |
| Receipt / zigzag bottom decoration on order card | rendered via `maskImage: conic-gradient` in code | Not present in Pencil — Pencil cards are plain rectangles with hairline borders | REMOVED_FIELD (visual) |
| Dashed border on order card | rendered in code (`border-2 border-dashed`) | Pencil cards have solid hairline `rule` strokes per §3.8 | VISUAL_ONLY |
| Vibration + audio feedback on success | code: `navigator.vibrate([100,50,100])` + `/success-ding.wav` | Not specified by Pencil | AMBIGUOUS (keep / remove / change?) |
| Polling cadence (`refetchInterval: 5000`) | code | Not specified by Pencil | AMBIGUOUS (behavior, not visual) |
| Loading state (`Loader2` + "Orders load ho rahay hain...") | code | Not drawn in Pencil for this screen | NEW_STATE (design omits loading) |
| Error state (red card + error message) | code | Not drawn in Pencil for this screen | NEW_STATE (design omits error) |
| Empty state per status (`📭` + Roman Urdu copy varying by tab) | code | Not drawn in Pencil for this screen | NEW_STATE (design omits empty) |
| Later zone paper-2 callout — eyebrow + count + (likely) link | None | New surface that implies a second pool of orders ("queued for today") not present in current data model | NEW_FIELD + NEW_INTERACTION |
| Mobile bottom tab bar (Orders active) per brief | None | Per brief should be present; not drawn inside `EEK8K` | AMBIGUOUS |
| Roman Urdu UI copy throughout | code uses "Naye Order", "Pack Ho Rahay", etc. | Pencil uses English; bilingual scope answered globally as "EN only first" (02 §7 Q16) but the existing strings are Roman Urdu, not Urdu script — confirm whether to retain or remove | COPY_CHANGE |
| Status taxonomy display labels (NEW / PACKED / COMPLETE/DISPATCHED) | code uses `pending` / `packed` / `handed_to_courier` (DB enum) | Per 02 §7 Q9: display-only mapping, no schema change. But the **mapping itself** is undefined for `delivered` and `cancelled`, and the third segment's label conflicts (`COMPLETE` mobile vs `DISPATCHED` brief) | COPY_CHANGE + AMBIGUOUS |

---

## 3. Schema / type implications

Per 02 §7 Q9: the status taxonomy is **display-only**. No migration on
`sub_orders.status` is needed. The display mapping itself is an open
question (Q3, Q4 below).

### Fields that may be needed (subject to user confirmation)

| Field | Why | Where it would live | Source if not added |
|---|---|---|---|
| Pending-order count exposed to vendor sidebar | Pencil sidebar shows an **amber `8` badge** on the Orders nav row | Either embedded in the existing `GET /api/vendor/orders` response (e.g. as a meta block), or a separate `GET /api/vendor/sidebar-stats` endpoint; consumed by `VendorSidebar` | Could be derived client-side by a parallel React Query, but the badge is rendered in chrome (above the page), so the cleanest source is server-side per request. — Q-SIDEBAR |
| Order card weight (display) | `weightGrams` already exists on `sub_orders` and on `VendorSubOrder` type, but is **not surfaced** in the existing card | None — the data exists | Already in code/schema. Pure display. |
| Order card item-count summary (e.g. "6 items · 21 kg") | Possibly visible on the Pencil card header right side | Derivable from `items.length` and `weightGrams` | Already in code. |
| "Later zone — orders queued for today" | Pencil callout shows orders that are not yet shippable today (or are in some "later" pool) | Unknown. Could be `pending` orders with a future-dated `expectedShipAt` (no such column today), OR a vendor-set "later" flag (no column today), OR purely a UI bucket for a non-current-day subset. | This is a new product behavior with no obvious data backing — Q5 |
| Order detail (tap-through) | Pencil card may be tappable; brief is silent on per-card detail navigation | Existing app has no `/vendor/orders/[id]` route | Q6 |
| Status display label per `sub_orders.status` value | Pencil shows NEW/PACKED/COMPLETE or DISPATCHED stamps | Display constant; no schema | Q3 |

### Workflow / mutation implications (for the giant CTA)

Existing `PATCH /api/vendor/orders/[subOrderId]` advances one step in
`pending → packed → handed_to_courier`. The Pencil card's giant "Packed ✓"
CTA is consistent with the **first** transition (`pending → packed`) only.
The second transition (`packed → handed_to_courier`) has **no visible CTA**
in the drawn Pencil cards.

Three plausible interpretations (none picked):
- (a) The Pencil screen is a packing-only view (filtered to `pending`), and
  there is a separate, undrawn UI for the second transition.
- (b) The CTA's label is contextual (e.g. "Packed ✓" / "Handed off ✓") and
  Pencil only happens to show the first variant.
- (c) The workflow collapses two steps into one, in which case the existing
  `ALLOWED_TRANSITIONS` map and possibly the underlying `handedAt` /
  `handed_to_courier` semantics change.

→ Q7.

---

## 4. Behavior implications

### Status segments — source data and selection

- Pencil's segments show **counts** (8 / 14 / 286). The current
  `GET /api/vendor/orders` returns sub-orders only with `status` already
  filtered by `vendorId`; counts are derivable client-side from the
  returned list, but **only for the statuses already in the list** —
  `delivered` and `cancelled` are *not* explicitly excluded from the SQL
  but in practice the third bucket "286 COMPLETE" is much larger than
  what the polled list would carry day-to-day, so either:
  - The endpoint returns all-time history and the segment counts include
    historical orders, or
  - There is a separate stats endpoint, or
  - The 286 figure is illustrative and counts are computed from the same
    list with a more permissive set of statuses included
  → Q4.
- Whether a segment click filters the cards (current behavior) or whether
  the segments are read-only summary tiles (and the cards always show one
  bucket) is undetermined from the static design. → Q3.

### Later zone — filter behavior

- A second pool of orders ("queued for today") implies either a separate
  data source (a different vendor stage), a different time-bucket on the
  same data (e.g. orders not due to ship today), or a vendor-defined
  list. None of these has backing in the current schema or API. → Q5.

### Giant CTA UX vs current button

- Existing button: contextual label per status, one transition per click,
  `mutate(subOrderId)` against `PATCH /api/vendor/orders/[subOrderId]`,
  with `onSuccess` triggering vibration + audio feedback.
- Pencil CTA: full-width green "Packed ✓" affordance. No second-transition
  CTA visible.
- Plausible plan changes (none picked):
  - Keep the existing endpoint and mutation, retitle and resize the button,
    but keep the label contextual when the status is `packed`.
  - Drop the second transition entirely (collapse `packed →
    handed_to_courier`), changing the API contract.
  - Move the second transition to a different surface (per-order detail
    page, or a separate "Ready for courier" tab/segment).
  → Q7.

### Empty / loading / error states

- Pencil shows none of these. Existing implementation has all three with
  Roman Urdu copy. Per CLAUDE.md hard rule 2 ("never silently change
  existing behavior"), retaining vs replacing must be confirmed. → Q9.

### Audio + haptic feedback

- Not specified in Pencil. Existing implementation uses
  `navigator.vibrate` + a `/success-ding.wav` audio file. Removing it is
  a behavior change; keeping it is fine but unverified. → Q10.

### Polling cadence

- Existing query uses `refetchInterval: 5000` (5 s). Not specified in
  Pencil. Likely behavior-only, but the badge and segment counts will
  benefit from continued polling. Confirm the cadence is acceptable on
  the redesigned screen (especially with chrome-level badge data). → Q11.

### Sidebar pending badge

- Implies a new data dependency at the chrome level. If multiple vendor
  screens consume it, putting the count in `VendorLayout` (server-side or
  via a shared React Query) is cleaner than per-screen. → Q-SIDEBAR (Q12).

---

## 5. Open questions for me

Numbered for easy reference. Per the workflow rule, every NEW_FIELD,
REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION, NEW_STATE, COPY_CHANGE
or AMBIGUOUS row in §2 maps to one of the questions below.

### 1. Mobile bottom tab bar — present or absent for this screen?

- **Observed in design:** the drawn `EEK8K` frame contains 4 children
  (App bar, Hero, Status segs, Cards). No `vJBmE`/`lSsjh` bottom tab bar
  inside the frame.
- **Observed in brief / `vendor-portal.md`:** explicit statement that
  vendor mobile pages have a bottom tab bar (Dashboard / Products /
  Orders / Ledger / More) — the brief reaffirms this for `EEK8K`.
- **Question:** Should Vendor · Orders · Mobile render the bottom tab bar
  on this screen?
- **Possible answers:**
  - (a) Yes; the tab bar lives in a layout above the screen frame and was
    simply not redrawn here.
  - (b) Yes; it should be added, the Pencil omission is a drawing oversight.
  - (c) No; this screen intentionally hides the tab bar.
**Answer:** STUBBED — see 06-scope-cut.md feature: Admin/Vendor chrome revamp (ink top bar, sectioned sidebar, mobile bottom tab bar). Implement with placeholder: bottom tab bar lives in vendor mobile layout, rendered on this screen (per user override making this IN_SCOPE all). Add `// TODO(post-v1):` comment at every touch point.

### 2. Pending-order badge on the sidebar — data source

- **Observed in design:** amber `8` badge on the `Orders` sidebar row,
  reused across all vendor screens.
- **Observed in code:** `VendorSidebar` does not render any badges and
  has no count source.
- **Question:** What value drives the badge, and where does it come from?
- **Possible answers:**
  - (a) `count(sub_orders where vendorId=me and status='pending')` exposed
    in the existing `GET /api/vendor/orders` payload (e.g. as a meta
    field).
  - (b) A new `GET /api/vendor/sidebar-stats` endpoint serving sidebar
    counts (extensible to other badges later).
  - (c) Derived client-side from the current orders query (works only on
    pages that already fetch orders).
**Answer:** STUBBED — see 06-scope-cut.md feature: Vendor sidebar Orders count badge. Implement with placeholder: embedded in existing `GET /api/vendor/orders` payload as a meta field. Add `// TODO(post-v1):` comment at every touch point.

### 3. Status segments — interaction model and selection state

- **Observed in design:** 3 tiles `8 NEW` / `14 PACKED` / `286 COMPLETE`
  (mobile). No selected-state styling visible. Cards below appear to
  show a single bucket (most cards visibly `pending` / awaiting
  packing).
- **Observed in code:** sticky tab bar where each tab is both the count
  indicator and the active filter; default selection is `pending`.
- **Question:** Are the Pencil segments interactive filters (like the
  existing tabs) or display-only stats, with the cards list filtered
  by some other rule?
- **Possible answers:**
  - (a) Interactive filters that reproduce the existing tab behavior;
    Pencil simply doesn't show a selected state.
  - (b) Read-only summary tiles; the cards list is always the
    "to-be-packed" bucket (`pending` only), and packed/completed orders
    are seen elsewhere (e.g. in Ledger or in a separate screen).
  - (c) Read-only with an implicit filter (e.g. clicking a tile drills
    into a different screen).
**Answer:** Interactive filters reproducing existing tab behavior; selected state styling re-derived from tokens.

### 4. Status segments — counts source (and what's in the third bucket)

- **Observed in design:** Mobile reads `8 NEW / 14 PACKED / 286 COMPLETE`.
  Brief says desktop reads `NEW / PACKED / DISPATCHED`. The third bucket
  has different labels across breakpoints.
- **Observed in code:** counts are computed client-side from the polled
  list; that list returns only this vendor's sub-orders, all statuses,
  no time bound.
- **Question:** Which statuses fall into each segment, and what time
  scope do the counts cover (today / open / all-time)?
- **Possible answers (NEW):**
  - (a) `pending` only.
  - (b) `pending` + any not-yet-`packed` placeholder.
- **Possible answers (PACKED):**
  - (a) `packed` only.
  - (b) `packed` + `handed_to_courier` (everything past pending but not
    yet delivered).
- **Possible answers (third tile = COMPLETE or DISPATCHED):**
  - (a) `delivered` only — all-time count.
  - (b) `handed_to_courier` + `delivered` — a "shipped or done" rollup.
  - (c) `delivered` for today only.
**Answer:** NEW=`pending`, PACKED=`packed`, third tile (COMPLETE/DISPATCHED) = `handed_to_courier + delivered` rollup over a current-week window. Pencil's "286 COMPLETE" is a long-window count; window is configurable later.

### 5. "Later zone" paper-2 callout — meaning and data backing

- **Observed in design:** paper-2 callout near the bottom of the page,
  e.g. "8 more orders queued for today".
- **Observed in code:** no concept of "later" / scheduled orders. There is
  no `scheduledShipAt`, `expectedShipAt`, or similar column on
  `sub_orders` / `orders`.
- **Question:** What does "Later zone" represent, and what data backs it?
- **Possible answers:**
  - (a) `pending` sub-orders whose `createdAt` falls outside the current
    cut-off (e.g. dropped today after the daily packing cut-off) —
    pure UI bucketing of existing data.
  - (b) A new vendor-set field (`scheduledShipAt`, `deferredUntil`) that
    requires schema work.
  - (c) A static informational footer (no real count behind it).
**Answer:** Static informational footer (no real count behind it). Smallest delta — defer the underlying scheduling concept.

### 6. Per-order detail page — tap-through behavior

- **Observed in design:** order cards may be tappable to open a detail
  view. The brief and the drawn frame don't make this explicit.
- **Observed in code:** there is no `/vendor/orders/[id]` route; the
  card is non-navigational.
- **Question:** Is there a per-sub-order detail screen behind the card,
  or are all interactions inline on the list?
- **Possible answers:**
  - (a) No detail page; everything inline (current).
  - (b) Tap opens a sheet/drawer (mobile) or expands an inline panel
    (desktop) — no route change.
  - (c) Tap navigates to a new `/vendor/orders/[id]` route (which would
    need an API endpoint and components).
**Answer:** No detail page; everything inline (current behavior preserved).

### 7. Giant "Packed ✓" CTA — full lifecycle workflow

- **Observed in design:** every visible card carries the same green
  "Packed ✓" full-width CTA. No second-transition CTA is drawn.
- **Observed in code:** card button label is contextual: `pending →
  "Pack Kar Liya"` (transitions to packed), `packed → "Courier Ko De
  Diya"` (transitions to handed_to_courier), `handed_to_courier →` no
  button. Underlying `PATCH /api/vendor/orders/[subOrderId]` advances by
  one step.
- **Question:** How does the redesigned screen handle the
  `packed → handed_to_courier` transition?
- **Possible answers:**
  - (a) Cards list is filtered to `pending` only; `packed` and
    `handed_to_courier` orders show on a different screen / segment, with
    their own CTA(s) we haven't seen drawn yet.
  - (b) The CTA is contextual per card status (e.g. "Packed ✓",
    "Handed off ✓") and Pencil only happens to show the
    `pending`-state variant.
  - (c) The workflow collapses to a single transition (
    `pending → done`), which would change `ALLOWED_TRANSITIONS` and the
    semantics of the `handedAt` column.
**Answer:** CTA contextual per card status — "Packed ✓" for pending → packed; "Handed off ✓" for packed → handed_to_courier; nothing for terminal states.

### 8. Order card line-item layout & per-row content

- **Observed in design:** rows show a left-hand mono qty box, then
  product name + a secondary descriptor (size / pack / "carton of N").
  No per-row image. No per-row unit price.
- **Observed in code:** rows show a 64px image + product name + per-unit
  price + large numeric qty (right-aligned).
- **Question:** Should we drop the product image and unit price from the
  row, and add the descriptor — and if so, what is the descriptor's
  source?
- **Possible answers:**
  - (a) Drop the image and unit price entirely; the descriptor is
    derived from existing fields (e.g. weight + a hardcoded "carton of N"
    string from product metadata that doesn't exist yet).
  - (b) Drop the image only, keep the unit price somewhere else on the
    row.
  - (c) Keep both; treat the design as illustrative and accept that the
    code already fits the spirit of the row.
**Answer:** Keep both image + unit price (existing code) — Pencil is illustrative; smallest delta from current row shape.

### 9. Empty / loading / error states

- **Observed in design:** Pencil draws no states for empty, loading or
  error. Existing implementation renders all three with Roman Urdu copy
  (`📭` + "Koi naya order nahi" / "Orders load ho rahay hain..." /
  red-card error message).
- **Observed in code:** the three states are explicit and visually
  distinct.
- **Question:** Is the omission intentional (states should be removed or
  collapsed into a generic skeleton), or should we re-derive equivalents
  from the new design system tokens, keeping the behavior?
- **Possible answers:**
  - (a) Re-derive empty / loading / error states from Pencil tokens
    (paper-2 cards, hairline rules, no emoji), keeping behavior identical.
  - (b) Replace loading with a Pencil-styled skeleton (paper-2
    placeholder rows), drop emoji, keep error and empty as paper-2
    callouts.
  - (c) Remove empty / loading / error in favor of Suspense + error
    boundary.
**Answer:** Re-derive from Pencil tokens (paper-2 cards, hairline rules, no emoji); rewrite copy to English; keep behavior identical.

### 10. Audio + haptic feedback on success

- **Observed in design:** not specified.
- **Observed in code:** `navigator.vibrate([100,50,100])` + plays
  `/success-ding.wav` at 60% volume on every successful status
  transition.
- **Question:** Keep, modify, or remove?
- **Possible answers:**
  - (a) Keep as-is.
  - (b) Remove (Pencil is silent → assume removal).
  - (c) Keep haptic, drop audio.
**Answer:** Keep as-is (`navigator.vibrate` + `/success-ding.wav`).

### 11. Polling cadence

- **Observed in design:** not specified.
- **Observed in code:** `refetchInterval: 5000` (5 s).
- **Question:** Retain 5 s polling, increase, or move to push (SSE /
  websocket / on-focus revalidation only)?
- **Possible answers:**
  - (a) Keep 5 s.
  - (b) Increase to 15–30 s and add `refetchOnWindowFocus`.
  - (c) Drop polling; rely on focus + manual refresh.
**Answer:** Keep 5s `refetchInterval`.

### 12. Roman Urdu copy in existing UI

- **Observed in design:** copy is English ("8 orders to pack",
  "Packed ✓", "NEW / PACKED / COMPLETE/DISPATCHED").
- **Observed in code:** Roman Urdu strings throughout (tab labels, empty
  states, button labels, loading copy).
- **Question:** Per 02 §7 Q16 ("ignore translation altogether now,
  implement in English") — do we replace all Roman Urdu with the Pencil
  English copy? Or were the existing Roman Urdu strings meant to be
  preserved as a vendor-facing UX choice?
- **Possible answers:**
  - (a) Replace all Roman Urdu with Pencil English; ship the language
    toggle as the placeholder for future translation.
  - (b) Keep Roman Urdu (matches the user's vendor-segment audience).
  - (c) Hybrid: tab labels and stamps go English; long-form empty/error
    messages stay Roman Urdu.
**Answer:** STUBBED — see 06-scope-cut.md feature: i18n / language toggle plumbing (presentational EN-only). Implement with placeholder: replace all Roman Urdu with Pencil English copy; ship language toggle as placeholder. Add `// TODO(post-v1):` comment at every touch point.

### 13. Status display labels — full mapping table

- **Observed in design:** stamps drawn for DELIVERED / AT MNP HUB /
  PACKED / DELAYED / CANCELLED (per 02 §3.2). Segments label as `NEW` /
  `PACKED` / `COMPLETE` (mobile) or `DISPATCHED` (desktop, per brief).
- **Observed in code:** raw enum `pending / packed / handed_to_courier /
  delivered / cancelled`.
- **Question:** Confirm the canonical display mapping per status. (Per
  02 §7 Q9 the mapping is display-only, but the pairing isn't fully
  specified.)
- **Possible answers (none picked):**
  - (a) `pending` → NEW ; `packed` → PACKED ; `handed_to_courier` → AT MNP
    HUB ; `delivered` → DELIVERED ; `cancelled` → CANCELLED .
  - (b) `pending` → NEW ; `packed` → PACKED ; `handed_to_courier` →
    DISPATCHED ; `delivered` → DELIVERED ; `cancelled` → CANCELLED .
  - (c) Some other mapping (please supply).
- And: which of those buckets feed the third segment tile
  (COMPLETE/DISPATCHED) — see Q4.
**Answer:** STUBBED — see 06-scope-cut.md feature: Status display-label mapping table. Implement with placeholder: use the canonical map (admin-dashboard Q24). Add `// TODO(post-v1):` comment at every touch point.

### 14. Order card header secondary content — time vs status

- **Observed in design:** card header surfaces a status stamp inline
  with the order id; no relative time.
- **Observed in code:** card header surfaces a relative time
  (`timeAgo(order.createdAt)`) and the recipient name + city. No status
  stamp inline.
- **Question:** Do we keep the relative time, replace with the status
  stamp, or carry both?
- **Possible answers:**
  - (a) Replace time with status stamp.
  - (b) Keep both (stamp left of order id, time on right).
  - (c) Drop both; surface only the order id + recipient.
**Answer:** Keep both — stamp left of order id, time on right.

### 15. `voSubHd` content — "Packing list" eyebrow + meta + possible CTA

- **Observed in design:** sub-header band between the status segments and
  the cards. Likely contains an eyebrow ("Packing list") and an open-orders
  count on the right; may host a CTA (e.g. batch print, mark-all-packed,
  filter dropdown).
- **Observed in code:** no equivalent.
- **Question:** What does `voSubHd` contain exactly, and is there a CTA?
- **Possible answers:**
  - (a) Eyebrow + count only; no CTA.
  - (b) Eyebrow + count + a single action (e.g. "Print all", "Filter").
  - (c) Eyebrow + count + multiple actions (sort + filter + bulk action).
  - I would need a `pencil:batch_get` on the `voSubHd` node to confirm —
    requesting confirmation rather than guessing.
**Answer:** User answer: A15: yes contains a "Print All Labels" button.

---

(End of gap analysis. No code changes proposed; all decisions deferred to
the user's answers above.)

Answers propagated on 2026-05-02 from 06-scope-cut.md + 07-default-proposals.md
