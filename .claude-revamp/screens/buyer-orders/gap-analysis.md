# Buyer · Orders — Gap Analysis

> **Phase:** Per-screen gap analysis (read-only).
> **Date produced:** 2026-05-02
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop `g78Iwm`, Mobile `ctdRJ`.
> **Code source:** `apps/web/src/app/(storefront)/profile/orders/page.tsx` →
>   `apps/web/src/modules/retailer/retailer-orders/` (`index.tsx` +
>   `components/order-card/index.tsx` + `hooks/use-retailer-orders-query` +
>   `types.ts`); API `apps/web/src/app/api/retailer/orders/route.ts`;
>   schema `packages/database/src/schema/{orders,sub-orders,order-items}.ts`.
> **Inputs consulted:** `01-codebase-map.md`, `02-design-inventory.md`,
>   `03-token-migration.md`, `04-design-system-implementation-log.md`.

This is a discovery document. **No implementation is proposed.** Every
change category that touches schema, copy, behavior, fields, or states
becomes a numbered question in §5 — even when the answer feels obvious.

---

## 1. Layout & structure

### Pencil — Desktop (`g78Iwm`, 1440 wide × 1683 tall)

Vertical stack on `paper` page bg:

1. **Util strip** (`amYtY`, 57h) — chrome (Help · Track order · MNP delivery hubs cluster on left, language toggle on right). *Out of scope for this screen — covered by chrome work.*
2. **Header** (`JkOIE`, 86h) — chrome (logo + 44h search + account/cart). *Out of scope.*
3. **Main column** (`e1g8W`, 1360w, 40px horizontal page padding):
   1. **Breadcrumb** (`oBC` / `S3mVM`): "Home › Account › Orders" (ink-3 / ink-3 / ink, sans 13).
   2. **Page header** (`oTH` / `a52Hx`, justified) —
      - Left (`TgUgC`): title "Your orders" sans 36/800 + subtitle "24 orders · Rs. 18,40,260 lifetime" sans 14/normal ink-3.
      - Right (`a7ikfI`): "Export CSV" outline button (1.5px rule-2 stroke, download icon + sans 13/600 ink) and "Quick reorder" ink-filled primary (plus icon + sans 13/600 white).
   3. **Filter bar** (`oFilters` / `T9t4M`) — single white card, radius 8, 1px rule, padding [16,20]:
      - Tab pill row (`oTabs` / `eZg8E`): 4 chips at radius 99, padding [8,14]. Active = `ink` fill / `white` 13/700 sans + count `#FFFFFFB3` mono 11/700. Inactive = transparent fill / `ink-2` 13/600 + count `ink-3` mono 11/700. Tabs: "All orders 24" (active), "In transit 3", "Delivered 19", "Cancelled 2".
      - Flexible spacer (`oFSp` / `BVfMi`).
      - Search field (`oSearch` / `Gbjft`): `paper-2` fill, radius 6, padding [8,14], lucide `search` 16px ink-3, placeholder "Search by order ID or product" sans 13 ink-3.
      - Sort button (`oSort` / `PmRLG`): outline (1.5px rule-2), radius 6, padding [8,14], lucide `arrow-down-up` 14px + "Newest first" sans 13/600 ink.
   4. **Order list** (`ZHbCa`) — 5 vertically-stacked cards, gap implicit by stack (no top margin between rows in snapshot — they butt directly).
      - Each card (`oo1`–`oo5`): `white` fill, 1px `rule`, radius 8.
        - **Card header** (`oo1H`, `paper-2` fill, padding [16,20], 1px hairline bottom, justified):
          - Left (`oo1HL`, gap 24): 4-column eyebrow stack — each column is mono-eyebrow (sans 10/600 letter-spacing 0.12 ink-3) over value:
            - **ORDER ID** → `#SH-24891` mono 14/700 ink
            - **PLACED** → "24 Apr 2026" sans 14/600 ink
            - **TOTAL** → "Rs. 1,16,380" mono 14/700 ink
            - **WEIGHT** → "42.8 kg" mono 14/600 ink
          - Right (`oo1HR`, gap 10): rotated **stamp** (per status) + lucide `chevron-down` 18px ink.
        - **Card body** (`oo1B`, padding 20, gap 24, 2 columns):
          - Left column (`oo1L`, vertical, gap 14, fill_container):
            - **Thumbnail row** (`oo1Items`, gap 8): six 48×48 squares — five are paper-2 with 1px rule + lucide `package` 24 ink-4 placeholder; the sixth is `paper-3` with "+22" mono 13/700 ink-2 counter. (No image fills used — Pencil treats them as placeholder squares.)
            - **Items caption** (`f8Hz6` etc.): single-line wrap-able text e.g. "Sufi Cooking Oil 5 L · Lipton Yellow Label · Basmati Rice 25 kg · Dalda Ghee 16 kg · +24 more items" sans 13/normal ink-2, line-height 1.5.
            - **Meta row** (`oo1Meta`, gap 18): 3 inline icon+text items (icons lucide 14, ink-3; text sans 12 ink-3):
              - `map-pin` "Gujranwala 52250"
              - `truck` "Delivered 26 Apr · 2 days"
              - `banknote` "COD · paid on delivery"
          - Right column (`oo1A`, vertical, gap 8, width 200):
            - Primary action button — varies by stamp:
              - DELIVERED / CANCELLED → "Reorder" ink-filled, lucide `refresh-cw`, white sans 14/700, padding [10,16], radius 6.
              - OUT FOR DELIVERY / AT MNP HUB → "Track order" ink-filled, lucide `map-pin`.
            - "Invoice" outline button (1.5px rule-2), lucide `file-text` 14 + sans 13/600 ink.
            - "View details" ghost button (no fill / no border), padding [8,16], sans 13/600 ink.

The five card rows in the design walk through every drawn stamp variant:
oo1=DELIVERED, oo2=OUT FOR DELIVERY (amber), oo3=DELIVERED, oo4=AT MNP HUB (blue), oo5=CANCELLED.

### Pencil — Mobile (`ctdRJ`, 420 wide × 1279 tall)

1. **App bar** (`moAB` / `lOti7`, paper, padding [14,16], hairline bottom, justified): chevron-left + "Your orders" sans 18/700 (left); language toggle + account circle (right).
2. **Filter tabs** (`Filter tabs` / `gVK0c`, padding [12,16], hairline bottom, gap 8, `clip:true` so the row is horizontally scrollable). Tabs: "All 24" (active, ink fill), "In transit 3", "Delivered 19", "Cancelled" (no count). Active uses `ink` fill / white 13/700; inactive uses 1px rule-2 stroke / `ink-2` 13/600 + count `ink-3` mono 11/700.
3. **Scroll list** (`Scroll` / `p5BMbE`, vertical, padding 16, gap 14): 4 cards (`moo1`–`moo4`) — each card replicates the desktop card body but rearranged for narrow width:
   - **Header** (`moo1H`, paper-2, padding [14,16], hairline bottom, justified): left = order id mono 13/700 + date sans 11 ink-3 (vertical); right = rotated stamp.
   - **Body** (`moo1B`, vertical padding 16, gap 14):
     - **Stats row** (`moo1Stats`, gap 8): 3 columns each `fill_container`, eyebrow sans 9/600 ink-3 letter-spacing 0.12 + value mono 14/700 ink. Columns: **TOTAL** "Rs. 1,16,380", **ITEMS** "28", **WEIGHT** "42.8 kg".
     - **Thumbnail row** (`moo1Th`, gap 6): 4 thumbs each fill_container × 48h. Three are paper-2 placeholder squares; the fourth is paper-3 "+N" counter.
     - **Items caption**: shorter copy ("Sufi Cooking Oil 5 L · Lipton 950g · Rice 25 kg · +24 more").
     - **Buttons row** (`moo1Btns`, horizontal, gap 8): "Reorder" (ink-filled, fill_container) + "Invoice" (outline, fill_container). **Mobile has only 2 buttons — no "View details".**

The four mobile cards: moo1=DELIVERED, moo2=OUT FOR DELIVERY, moo3=DELIVERED, moo4=AT MNP HUB. (No CANCELLED card drawn on mobile, but the "Cancelled" tab still exists.)

### Existing code

`RetailerOrders` (`apps/web/src/modules/retailer/retailer-orders/index.tsx`):

1. **Sticky tab bar** at top (`top-0 z-20`, bg-white/95 backdrop-blur), 3 tabs in a `flex gap-1.5` row. Each tab is a coloured-bordered card with an emoji, an Urdu/Roman label, and an absolute-positioned count badge:
   - `pending` 🟡 "Naye"
   - `shipped` 🚚 "Raaste Mein"
   - `delivered` ✅ "Mil Gaye"
2. **Content region** (`px-3 py-4 sm:px-6`) with three branches:
   - Loading: spinner + "Orders load ho rahay hain..."
   - Error: red bordered card "Orders load nahi ho sakay" or `error.message`.
   - Empty: 📭 + per-tab message (e.g. "Koi naya order nahi").
   - List: `mx-auto flex max-w-lg flex-col gap-4` (single column, max 32rem wide on all viewports).

Each `OrderCard` (`components/order-card/index.tsx`) is a `<Link>` to `/profile/orders/[id]`:
- Header row: `displayId` (16 bold) + a coloured-pill status badge — labels are derived client-side: "Delivered" / "Cancelled" / "Shipped" / "Packing" / "Processing".
- Overlapping circular thumbnails (5 max @ 44px, then a "+N" circle) using `next/image` with the actual product image from `order_items.product.imageUrl`.
- Footer row: `Rs. {grandTotal.toLocaleString()}` (20 bold) + relative time like "Kal" / "{N} ghante pehle" / "{N} din pehle" computed from `createdAt`.

There is no breadcrumb, no page header, no search, no sort, no filter card, no per-card action buttons, no per-card meta row, no expand/collapse chevron, no item caption text, no weight/items totals, no language toggle in chrome, and no mobile-vs-desktop fork — `RetailerOrders` is a single layout that scales to a 32rem-max column.

### Headline structural deltas

- **Whole new "page header" block** (title + subtitle + Export/Quick reorder actions) — does not exist in code.
- **Whole new "filter bar" block** (tabs + search + sort) — code only has tabs.
- **Tab semantics differ:** code = 3 tabs categorising by sub-order status (pending/shipped/delivered, no Cancelled tab); design = 4 tabs (All / In transit / Delivered / Cancelled). Design also shows "All" as a default; code's default tab is `pending`.
- **Card shape differs fundamentally.** Code = compact link card (1 metric: grandTotal + relative time + thumbnails). Design = expanded card with header strip + items strip + meta strip + buttons column. Card is no longer a single Link — it has multiple actions and a chevron.
- **Visual language differs everywhere.** Code uses emoji + Urdu/Roman copy + dark-mode classes + colour-coded borders. Design uses Pencil tokens (paper-2 / ink / mono numerics / rotated stamps / hairline borders).
- **Mobile layout in design is purpose-drawn** (stats row, 4 thumbs fill_container, 2 buttons). Code does not branch by viewport.

---

## 2. Element-by-element diff

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Breadcrumb "Home › Account › Orders" (`oBC`) | _(none)_ | New element above the page header. | NEW_INTERACTION (navigation) |
| Page title "Your orders" sans 36/800 (`j4ioh`) | _(none)_ | No on-page heading exists today; tab bar serves as the title region. | COPY_CHANGE / NEW_FIELD (page-level) |
| Subtitle "24 orders · Rs. 18,40,260 lifetime" (`v9b1M`) | _(none)_ | Two aggregates shown together: total order count for this user, and lifetime grand-total sum. | NEW_FIELD |
| "Export CSV" button (`c2ny6`) | _(none)_ | New top-right action exporting orders as CSV. | NEW_INTERACTION |
| "Quick reorder" ink-fill button (`iZ66H`) | _(none)_ | New top-right primary CTA. Concept ambiguous — separate from per-card "Reorder". | AMBIGUOUS / NEW_INTERACTION |
| Filter tabs "All orders / In transit / Delivered / Cancelled" with counts (`oTabs`) | 3 tabs `pending` / `shipped` / `delivered` (no Cancelled, no All) | Tab set + labels + default selection differ; counts are numeric mono pills vs absolute corner badges. Design has 4 tabs incl. an "All". | CHANGED_INTERACTION + COPY_CHANGE |
| Tab visual: ink-pill chips (radius 99) with mono 11/700 counts | Coloured-bordered cards with emoji 🟡🚚✅ + Urdu labels + corner badge | Entirely different visual language and copy. | VISUAL_ONLY + COPY_CHANGE |
| Search field "Search by order ID or product" (`oSearch`) | _(none)_ | New input. Placeholder implies search both displayId and product name. | NEW_INTERACTION + NEW_FIELD (query param) |
| Sort button "Newest first" (`oSort`) | _(none — list ordered by `desc(orders.createdAt)` server-side, fixed) | New sort control. Single state visible — others not drawn. | NEW_INTERACTION |
| Card header eyebrow "ORDER ID" + value `#SH-24891` (`oo1ID`) | Header `displayId` plain text | Now an eyebrow + mono numeric pair; same data. | VISUAL_ONLY |
| Card header eyebrow "PLACED" + "24 Apr 2026" (`oo1Pl`) | Footer "Kal" / "{N} din pehle" relative time | Display switches from relative to absolute date; moves from footer to header. | COPY_CHANGE + VISUAL_ONLY |
| Card header eyebrow "TOTAL" + "Rs. 1,16,380" (`oo1Tt`) | Footer `Rs. {grandTotal}` 20 extrabold | Same data, different position + smaller mono numeric. | VISUAL_ONLY |
| Card header eyebrow "WEIGHT" + "42.8 kg" (`oo1Wt`) | _(none)_ | Aggregate weight in kg (sum of `sub_orders.weightGrams`) shown per card. Mobile also shows it in stats. | NEW_FIELD |
| Card header rotated stamp (DELIVERED / OUT FOR DELIVERY / AT MNP HUB / CANCELLED) (`oo1Stp`) | Coloured pill (Delivered / Cancelled / Shipped / Packing / Processing) | Stamp inventory differs in count (5 design statuses incl. PACKED + DELAYED in §3.2 of design-inventory but only 4 are used on this screen) and copy. Per Q9: stamps are display-only mappings of existing `sub_orders.status` enum. | CHANGED_INTERACTION (mapping) + COPY_CHANGE + VISUAL_ONLY |
| Card header chevron-down icon (`oo1Ch`) | _(none — whole card is a `<Link>`)_ | New affordance suggesting expand/collapse of the card body or a row menu. Behaviour not drawn. | NEW_INTERACTION + AMBIGUOUS |
| 6 fixed-size thumbnail squares (48×48 paper-2 + lucide `package` placeholder) + paper-3 "+N" tile (`oo1Items`) | 5 overlapping circular `<Image>` from `product.imageUrl` (44px) + grey "+N" circle | Geometry, count, fill, and fallback differ. Design draws placeholder icons not photos — but per CLAUDE.md rule we cannot infer that real photos are dropped. | VISUAL_ONLY + AMBIGUOUS |
| Items caption text e.g. "Sufi Cooking Oil 5 L · Lipton Yellow Label · Basmati Rice 25 kg · Dalda Ghee 16 kg · +24 more items" | _(none)_ | New text caption listing first N product names + "+M more items". Format ("+24 more items") differs from mobile ("+24 more"). | NEW_FIELD + COPY_CHANGE |
| Meta `map-pin` "Gujranwala 52250" | _(none)_ | Shipping city + postal code per card. `orders.shippingCity` exists; postal code does not. | NEW_FIELD |
| Meta `truck` "Delivered 26 Apr · 2 days" | _(none)_ | Delivery date + days-to-deliver. Neither is in schema today. | NEW_FIELD |
| Meta `banknote` "COD · paid on delivery" | _(none)_ | Payment method indicator. Today everything is COD; no payment-method column on `orders`. | NEW_FIELD |
| Card primary button "Reorder" (refresh-cw, ink-fill) — DELIVERED/CANCELLED state | _(none — card is a Link to detail)_ | New per-card action. Design-inventory §6 lists Reorder as a brand-new flow with no current route. | NEW_INTERACTION |
| Card primary button "Track order" (map-pin, ink-fill) — IN-TRANSIT state | _(none)_ | New per-card action. No tracking surface exists today. | NEW_INTERACTION |
| Card outline button "Invoice" (file-text) | _(none)_ | New per-card invoice download/view. No invoice generation exists. | NEW_INTERACTION |
| Card ghost button "View details" | The whole card is a `<Link href="/profile/orders/${order.id}">` to `RetailerOrderDetail` | Click target moves from "whole card" to a single ghost button — and per Q1 of design-inventory it now opens the **Reorder** frame, not the existing `/profile/orders/[id]` detail. | CHANGED_INTERACTION |
| Card click area (whole card vs. only "View details") | Whole `<Link>` | Whole-card click is gone; the body has multiple buttons. | CHANGED_INTERACTION |
| Mobile app bar (`moAB`): chevron-left + "Your orders" + language toggle + account circle | Storefront header used for all viewports | Mobile gets a screen-specific app bar with a back button and a language toggle. | NEW_STATE (mobile chrome) |
| Mobile filter tab row (`gVK0c`, horizontal scroll, `clip:true`) | Same 3-tab fixed sticky bar as desktop | Mobile becomes a horizontally-scrolling chip strip instead of a 3-up grid. | VISUAL_ONLY + CHANGED_INTERACTION |
| Mobile card stats row "TOTAL · ITEMS · WEIGHT" (`moo1Stats`) | _(none)_ | New per-card stats triple. ITEMS = order item count (computable from `order_items`); WEIGHT = sum of sub-order weight; TOTAL already exists. | NEW_FIELD |
| Mobile card thumbnail row: 4 fill_container thumbs at 48h (`moo1Th`) | Same overlapping circle thumbnails | Mobile fits 3 placeholder thumbs + 1 "+N" tile, all stretched to fill. | VISUAL_ONLY + AMBIGUOUS |
| Mobile card buttons: "Reorder" + "Invoice" only (no "View details") | _(none)_ | Mobile drops the "View details" button vs desktop. | CHANGED_INTERACTION (per viewport) |
| Page background `paper` (#FBFAF5) | `bg-white/95` sticky bar; default page bg from layout | Token-level bg shift handled in Phase 3, but this screen's surfaces are explicit white/dark and need rebinding. | VISUAL_ONLY |
| Loading state | `Loader2` spinner + "Orders load ho rahay hain..." copy | Pencil draws no loading state for this screen. | NEW_STATE (still TBD) + AMBIGUOUS |
| Empty state | 📭 emoji + per-tab Roman/Urdu copy | Pencil draws no empty state for this screen. | NEW_STATE + AMBIGUOUS |
| Error state | Red bordered card "Orders load nahi ho sakay" | Pencil draws no error state for this screen. | NEW_STATE + AMBIGUOUS |
| Tab labels in Roman/Urdu ("Naye", "Raaste Mein", "Mil Gaye") + emoji indicators | Pencil tab labels are English ("All orders / In transit / Delivered / Cancelled") with no emoji | Tab labels & language change. Design-inventory Q16 says "ignore translation, English only, but keep a toggle in design system." | COPY_CHANGE + REMOVED_FIELD (emoji) |
| Card thumbnails sourced from `product.imageUrl` | Pencil draws lucide `package` placeholder | The design omits real product images — but CLAUDE.md hard rule 3 says don't assume removal is intentional. | REMOVED_FIELD + AMBIGUOUS |
| Sticky tab bar with backdrop-blur | Pencil draws filter card not sticky in any layout snapshot | Pencil shows no sticky behaviour. | CHANGED_INTERACTION + AMBIGUOUS |

---

## 3. Schema / type implications

For every `NEW_FIELD` / `REMOVED_FIELD` row in §2, here is what the
schema/type/API would need. Nothing is proposed; this is a "what would
have to give" map.

### 3.1 NEW_FIELDs that already have data in the DB

| Field on Pencil | Source already in schema | What's missing |
|---|---|---|
| Card "WEIGHT" (e.g. 42.8 kg) | `sub_orders.weightGrams` (integer, snapshot) per `packages/database/src/schema/sub-orders.ts:22` | Aggregate (sum across an order's sub-orders) needs to be exposed in `GET /api/retailer/orders` response, and surfaced through `RetailerOrder` type in `apps/web/src/modules/retailer/retailer-orders/types.ts` (no top-level `weightGrams` field today). |
| Mobile "ITEMS" count | `order_items.quantity` per sub-order, joined in API at `apps/web/src/app/api/retailer/orders/route.ts:69-83` | A scalar `itemCount` is not currently aggregated; the API returns the full items array. Either compute server-side and add to type, or compute on client from `subOrders[*].items[*].quantity` (decision deferred). |
| Items caption "Sufi Cooking Oil 5 L · …" | `order_items.product.name` already in API response | No schema change. Display-layer "first 3-4 names + remainder count" is purely presentational. |
| Meta "Gujranwala" | `orders.shippingCity` text per `orders.ts:18` | No schema change for the city itself. |

### 3.2 NEW_FIELDs the schema does NOT currently support

| Field on Pencil | Today | Required schema/API change (described, not committed) |
|---|---|---|
| Subtitle "24 orders · Rs. 18,40,260 lifetime" | API returns the order list only — no aggregates. | Either a new endpoint (e.g. `GET /api/retailer/orders/summary`) or extend the existing route to wrap the array in `{ orders, summary: { count, lifetimeTotal } }`. The shape change ripples into `useRetailerOrdersQuery` and `RetailerOrder[]` typing. |
| Tab counts (24 / 3 / 19 / 2) | Counts are computed client-side over already-fetched array (`index.tsx:67-81`). | If pagination is added, counts must come from the API; otherwise client-side reduce stays workable. |
| Filter tab "All / In transit / Delivered / Cancelled" status mapping | Code maps via `categorizeOrder()` (in-transit ≈ any sub-order `handed_to_courier`). | Per Q9 of `02-design-inventory`, stamp labels are display-only, but the **tab "In transit"** still implies an aggregation rule combining "OUT FOR DELIVERY" *and* "AT MNP HUB" (both mapped to the existing `handed_to_courier` status). No schema change, but the mapping function changes. |
| Stamp "OUT FOR DELIVERY" vs "AT MNP HUB" | `sub_orders.status` only has one transit-state (`handed_to_courier`). | These are display-only per Q9 — but two distinct labels can't both map from a single underlying status without an extra discriminator. Mapping rule is unspecified. |
| Card "PLACED 24 Apr 2026" | `orders.createdAt` exists. | Display change only (absolute vs relative date). No schema change. |
| Meta "Delivered 26 Apr · 2 days" | `sub_orders.handedAt` exists; **no `deliveredAt` column**. | A `delivered_at`/`completed_at` timestamp does not exist on either `orders` or `sub_orders`. Computing "2 days" requires both `createdAt` and a delivery timestamp. Schema migration would be needed unless the courier-tracking integration provides it through another path. |
| Meta postal code "52250" alongside "Gujranwala" | `orders.shippingCity` only. There is no postal-code column anywhere (`addresses` and `orders` schemas have city but no postal). | New column on `addresses` and on the `orders` shipping snapshot, plus form field changes upstream. Or the postal code is faked/hard-coded for cities — unclear. |
| Meta "COD · paid on delivery" | All orders are COD today (`/api/checkout` always creates COD). There is no `paymentMethod` column on `orders`. | If the design implies multiple payment methods, a column would be needed. If it's a fixed string, no schema change. |
| Card "Invoice" action | No invoice generation exists in `apps/web/src/app/api/retailer/`. | New endpoint (PDF/HTML). No data model change strictly required — invoice content can be generated from existing `orders` + `sub_orders` + `order_items`, but a "downloaded at" or `invoiceNumber` column may or may not be wanted. |
| Card "Reorder" action | No `/profile/orders/reorder/[id]` route — design-inventory §6 lists Reorder as a NEW screen (`Buyer · Reorder`, Pencil ID `NNw2K`). | Out of scope for this gap analysis (covered in prompt 6) but the *button* on this screen has to know where to navigate. |
| Card "Track order" action | No tracking surface in the codebase; `sub_orders.courierTrackingId` exists but is not exposed via any GET. | New tracking screen + API would be needed. Out of scope for this prompt; only the *button* lives here. |
| Top "Export CSV" action | No CSV endpoint. | New endpoint emitting `text/csv`. No schema change. |
| Top "Quick reorder" action | Concept ambiguous (not the same as per-card Reorder, since it lives at the page header). | Cannot map to existing endpoints without clarification. |
| Search query | API has no `q` param. | Add `q` to `GET /api/retailer/orders` and a Drizzle `ilike` filter on `orders.displayId` and (via join) `products.name`. |
| Sort param | API only does `orderBy(desc(orders.createdAt))`. | Add `sort` enum (e.g. `newest` / `oldest` / `total_desc` / `total_asc`) — only "Newest first" is drawn so others are ambiguous. |
| Mobile language toggle | No i18n in codebase. | Per design-inventory Q16: presentational stub only — no schema / API change. The `LanguageToggle` atom already exists from Phase 3 (`packages/ui/src/components/language-toggle.tsx`). |

### 3.3 REMOVED_FIELD — items the existing UI shows but the design omits

| Existing element | Status |
|---|---|
| Real product photos in the thumbnails | Design draws lucide `package` placeholders only. Per CLAUDE.md hard rule, can't assume the design intends to drop photos — escalated as Q14. |
| Emoji + Urdu/Roman tab labels | Design uses English-only chips with no emoji. Per Q16 of design-inventory we ship English-only — but explicit removal of *these copies* needs confirmation. Escalated as Q11. |
| Whole-card click-to-detail | Design replaces it with a "View details" button. Escalated as Q9. |

### 3.4 Stamp label mapping (display-only, per Q9 of 02-design-inventory)

`sub_orders.status` enum values: `pending` / `packed` / `handed_to_courier` / `delivered` / `cancelled`.

Pencil stamps used on this screen: `DELIVERED` / `OUT FOR DELIVERY` / `AT MNP HUB` / `CANCELLED`. (Plus `PACKED` and `DELAYED` exist in the design system but are not used on the 5 drawn cards.)

Per the user's answer to Q9, this is a **display-layer mapping** with no schema change. Without prescribing a rule, the unresolved questions in the mapping are:

- Single order has multiple `sub_orders` (vendor-split). Today the code aggregates: "all delivered → Delivered; some courier → Shipped; …". The Pencil card shows **one** stamp per order. The aggregation rule for the new label set (DELIVERED / OUT FOR DELIVERY / AT MNP HUB / CANCELLED) is not given.
- `handed_to_courier` is a single underlying state but two visual stamps (`OUT FOR DELIVERY`, `AT MNP HUB`) appear on different sample cards — there is no discriminator. See Q5.
- `pending` and `packed` have no stamp drawn on this screen. See Q5.

These are mapping decisions, not schema changes — but they are not derivable from code alone. Each becomes a numbered question in §5.

### 3.5 Type / hook implications

- `RetailerOrder` (`apps/web/src/modules/retailer/retailer-orders/types.ts`) gains optional fields for `weightGrams` (sum), `itemCount`, `shippingCity`, `paymentMethod`, `deliveredAt` — pending answers.
- Response wrapper of `useRetailerOrdersQuery` likely changes to `{ orders, summary }` if subtitle aggregates are server-side.
- `RetailerOrdersQueryKeys.all` (`hooks/retailer-orders-query-keys/index.ts`) becomes parameterised by `{ tab, q, sort }` — query-key shape changes.
- `nuqs` would be a natural fit for filter/search/sort URL state (already a dep — see `01-codebase-map.md` §1).

---

## 4. Behavior implications

For every `NEW_INTERACTION` / `CHANGED_INTERACTION` / `NEW_STATE` row in
§2.

### 4.1 Filter tabs (CHANGED_INTERACTION)

- Today: client-side, 3 tabs, default `pending`. Mapping in `categorizeOrder()` (`index.tsx:41`).
- Design: 4 tabs, default `All orders`, English copy.
- Touch points if changed:
  - `RetailerOrders` `useState<TabKey>('pending')` → `'all'`, plus tab list rewrite.
  - `categorizeOrder()` rule rewrite (incl. a "Cancelled" partition).
  - Counts computed for 4 buckets; "All orders" = total length.
  - Decision: client-side filter (current pattern, simple) vs server-side `tab` query param (needed only if pagination joins). API has no pagination today.

### 4.2 Search (NEW_INTERACTION)

- API has no `q`. Adding it requires either:
  - Drizzle `ilike(orders.displayId, …)` *and* a `LEFT JOIN`/`EXISTS` on `order_items` → `products.name` (subquery to keep `orders` row count correct).
  - Or full-text via `tsvector` (none exists today; would need migration).
- URL state: `?q=` via `nuqs` — debounced input is the standard pattern but not specified in the design.
- Empty/no-results state: not drawn.

### 4.3 Sort (NEW_INTERACTION)

- Currently fixed `orderBy(desc(orders.createdAt))` (`route.ts:34`).
- Adding sort requires API param + UI control. Only "Newest first" is drawn — other options (Oldest first / Total ↑↓ / Weight ↑↓) are not in the design.

### 4.4 "Export CSV" (NEW_INTERACTION)

- No CSV infrastructure. New `GET /api/retailer/orders/export` returning `text/csv` with auth + the same filtering as the list view.
- Trigger pattern: link with `download` attribute, or programmatic `fetch` → `Blob` → object URL.

### 4.5 "Quick reorder" (AMBIGUOUS / NEW_INTERACTION)

- Concept unclear: separate from per-card "Reorder", lives at the page header. Possible meanings: (a) reorder the most recent delivered order, (b) open a picker, (c) navigate to the Reorder screen with an empty starting state. None of these is supported today.

### 4.6 Per-card primary button switch (NEW_INTERACTION)

- The primary button text + icon depend on the displayed stamp:
  - DELIVERED / CANCELLED → "Reorder" (refresh-cw)
  - OUT FOR DELIVERY / AT MNP HUB → "Track order" (map-pin)
- Code path that would change: render conditional inside `OrderCard`. The "Track order" target route doesn't exist; the "Reorder" target is the new Reorder screen (out of scope here, but the navigation target is needed).

### 4.7 "Invoice" button (NEW_INTERACTION)

- No invoice endpoint or PDF generator. New surface required.

### 4.8 "View details" → opens Reorder frame (CHANGED_INTERACTION)

- Today the *whole card* is a `<Link>` to `/profile/orders/[id]` (`RetailerOrderDetail`). Per design-inventory Q1, the new "View details" button opens the **Reorder** frame (the new `Buyer · Reorder` screen), not `RetailerOrderDetail`.
- Therefore `/profile/orders/[id]` is no longer the click target. What happens to that route is a separate question (kept? repurposed? deleted?).

### 4.9 Card chevron-down (NEW_INTERACTION + AMBIGUOUS)

- The chevron on each card header is not drawn in any expanded state. Possibilities: expand-collapse the card body, open a kebab/overflow menu, or purely visual. Behaviour unspecified.

### 4.10 Mobile app bar back button (NEW_INTERACTION)

- Mobile chrome shows a chevron-left next to the title. The screen has no parent screen in the existing flow ( `/profile/orders` is reached from the storefront header / account drawer ). Where does back navigate to?

### 4.11 Mobile filter row scroll (CHANGED_INTERACTION)

- Today's tab bar is a 3-up grid; design's mobile is a horizontally scrolling chip row with `clip:true`.

### 4.12 Loading / Empty / Error states (NEW_STATE)

- Pencil draws no loading, empty, or error state for this screen. Existing copy is Roman-Urdu; per design-inventory Q16 we ship English. The design system's spinner, skeleton, etc. exist (see `04-design-system-implementation-log.md`) but no Pencil prescription specific to this screen.

### 4.13 Language toggle in mobile app bar (NEW_STATE)

- Presentational only per design-inventory Q16. The atom is already wired into `@repo/ui` per Phase 3. No new behaviour is needed in the orders screen except mounting the toggle in the mobile app-bar slot.

### 4.14 Aggregates in subtitle (NEW_FIELD)

- "24 orders · Rs. 18,40,260 lifetime" is computed across all of the user's orders. Either expose alongside the list payload (one round-trip) or as a separate query.

---

## 5. Open questions for me

Each question pairs a §2 row with the surrounding code/design context. I
do not pick an answer where I have hypotheses — I list them.

1. **Filter tab inventory and default tab.**
   - **Observed in design:** 4 tabs `All orders 24` (active default) / `In transit 3` / `Delivered 19` / `Cancelled 2`, ink-pill style, mono-numeric counts.
   - **Observed in code:** 3 tabs `pending` (default) / `shipped` / `delivered`, no Cancelled, no All; emoji + Urdu/Roman labels.
   - **Question:** Confirm the new tab inventory (`All` / `In transit` / `Delivered` / `Cancelled`), the new default (`All`), and that the old `pending` / Roman-Urdu labels are dropped intentionally — *or* that I should preserve a "Pending/Naye" partition somewhere.
   - **Plausible answers:** (a) Adopt design as drawn; drop pending. (b) Adopt design but add a hidden 5th `pending` tab. (c) Keep pending and rename to "Awaiting packing" or similar.
   - **Answer:** Adopt design as drawn — All / In transit / Delivered / Cancelled, default `All`; drop existing `pending`/Roman-Urdu tabs.

2. **Mapping rule for tab `In transit` from `sub_orders.status`.**
   - **Observed in design:** Tab is "In transit" with its own count.
   - **Observed in code:** `categorizeOrder()` says "any sub-order with status `handed_to_courier`" → "shipped"; otherwise pending unless terminal.
   - **Question:** Does "In transit" continue to mean "any sub-order in `handed_to_courier`", or does it now also include `packed` orders (since those are "in progress" but not yet delivered)? What about partially-delivered (some `delivered`, some `handed_to_courier`)?
   - **Plausible answers:** (a) "Any non-terminal" = pending/packed/handed_to_courier. (b) Strict: at least one `handed_to_courier`. (c) Order-level: derive from `orders.status` (`processing` / `partially_fulfilled` / `completed`).
   - **Answer:** Strict — at least one sub-order in `handed_to_courier`. Doesn't double-count packed orders.

3. **Mapping rule for tab `Cancelled`.**
   - **Observed in design:** "Cancelled" tab with count 2.
   - **Observed in code:** No Cancelled tab. Code's terminal logic treats "all delivered or cancelled" as the `delivered` tab.
   - **Question:** Is "Cancelled" = every sub-order cancelled, or any cancelled, or `orders.status` based?
   - **Plausible answers:** (a) All sub-orders cancelled. (b) Any sub-order cancelled (would overlap with "In transit" if some are still moving). (c) `orders.status` flag — but no `cancelled` value exists in `orders.status` enum (only `processing` / `partially_fulfilled` / `completed`).
   - **Answer:** All sub-orders cancelled. Avoids overlap with In Transit.

4. **Subtitle aggregates: "24 orders · Rs. 18,40,260 lifetime".**
   - **Observed in design:** Static string with two metrics — total order count and lifetime grand-total sum.
   - **Observed in code:** No aggregates of any kind on `/api/retailer/orders`.
   - **Question:** Should these be (a) computed server-side in the same route (extending its response wrapper), (b) a separate endpoint, or (c) computed client-side from the fetched array?
   - **Note:** Whichever wins, `RetailerOrder[]` typing changes, and so do the `useRetailerOrdersQuery` return type and call sites.
   - **Answer:** Server-side in same `GET /api/retailer/orders` route, wrapping response as `{ orders, summary: { count, lifetimeTotal } }`.

5. **Mapping for stamps `OUT FOR DELIVERY` vs `AT MNP HUB`.**
   - **Observed in design:** Two distinct stamps drawn on different cards.
   - **Observed in code:** Only one underlying transit state (`handed_to_courier`).
   - **Question:** Per Q9 of design-inventory, stamps are display-only — so what discriminator separates "OUT FOR DELIVERY" from "AT MNP HUB" if both come from `handed_to_courier`?
   - **Plausible answers:** (a) Time-since-handed: <X hours = "AT MNP HUB", >X hours = "OUT FOR DELIVERY". (b) Presence of `courierTrackingId` (already in schema) flips the label. (c) These are semantic synonyms in the design and we pick one. (d) Add a sub-status discriminator (would contradict the "no schema change" answer in Q9).
   - **Answer:** STUBBED — see 06-scope-cut.md feature: Status display-label mapping table. Implement with placeholder: constants file + 1 helper resolving sub_orders.status enum to Pencil display stamps; AT MNP HUB chosen as canonical for handed_to_courier. Add `// TODO(post-v1):` comment at every touch point. Semantic synonyms — pick `AT MNP HUB` as canonical for `handed_to_courier`. Drop `OUT FOR DELIVERY` from the mapping.

6. **Stamps `PENDING` and `PACKED` on this screen.**
   - **Observed in design:** No stamp drawn on this screen for either state. The design system frame defines `PACKED` (ink/paper-2) but the 5 cards on Buyer·Orders don't use it.
   - **Observed in code:** Both states are first-class — `pending` is the most common state for a fresh order; `packed` shows on the existing tab row as "Packing".
   - **Question:** Which stamp should display for an order whose sub-orders are in `pending` or `packed`? Is `PACKED` valid here even though no card on this screen uses it?
   - **Plausible answers:** (a) Use `PACKED` from the design system. (b) Suppress the stamp entirely. (c) New label "Processing" not in the design system.
   - **Answer:** Use design-system PACKED variant; PENDING uses `warning` intent (per status-mapping table).

7. **`Quick reorder` top-right button.**
   - **Observed in design:** Ink-fill button with plus icon labelled "Quick reorder" in `oTH` right cluster.
   - **Observed in code:** No equivalent.
   - **Question:** What does it do?
   - **Plausible answers:** (a) Reorder the most recent delivered order in one click. (b) Open a picker/sheet. (c) Navigate to the Reorder screen with an empty seeded cart.
   - **Answer:** Reorder the most recent delivered order in one click → navigates to `/profile/orders/{lastDeliveredId}` (the new Reorder screen).

8. **`Export CSV` scope.**
   - **Observed in design:** Outline button "Export CSV" with download icon.
   - **Observed in code:** No CSV endpoint.
   - **Question:** Does Export apply to the *current filtered view* (tab + search + sort), or always *all* orders for the user? What columns are required?
   - **Answer:** DEFERRED — see 06-scope-cut.md feature: Statement / CSV downloads (vendor ledger PDFs, admin exports). Do not implement this question's scope. UI placeholder: all "Download…" / "Export…" buttons hidden across screens.

9. **Card click target and "View details" target.**
   - **Observed in design:** Card has multiple buttons; "View details" is a dedicated button.
   - **Observed in code:** Whole card is a `<Link>` to `/profile/orders/[id]` → `RetailerOrderDetail`.
   - **Question:** Per design-inventory Q1, "View details" opens the Reorder frame. (a) Does the whole-card click also open Reorder, or is it inert? (b) What happens to the existing `/profile/orders/[id]` route (`RetailerOrderDetail` + `ParcelBox` + `ReceiptCard` + `ReviewDrawer`) — kept, repurposed, or deleted?
   - **Answer:** Per `02 Q1` user answer, "View details" opens Reorder. Whole card click also opens Reorder for parity. Existing `/profile/orders/[id]` route stays — repurposed as the Reorder screen (per scope-cut).

10. **Card chevron-down behaviour.**
    - **Observed in design:** A `chevron-down` icon next to the stamp on each card header. No expanded variant drawn.
    - **Observed in code:** None.
    - **Question:** Does the chevron (a) expand/collapse the card body, (b) open a kebab/overflow menu, or (c) is it a placeholder for future behaviour?
    - **Answer:** Placeholder for future behavior; render but inert (no expand, no menu) for now.

11. **Tab labels: copy + emoji.**
    - **Observed in design:** English chip labels, no emoji, no Urdu.
    - **Observed in code:** Roman-Urdu + emoji + Naye/Raaste Mein/Mil Gaye copy.
    - **Question:** Confirm emoji and Roman-Urdu labels are removed intentionally for this English-only release. Is there any string we should retain (e.g. an Urdu subtitle) or is it a clean wipe?
    - **Answer:** Clean wipe to English — drop emoji + Roman-Urdu strings (per `02 §7 Q16`).

12. **Card meta: "Delivered 26 Apr · 2 days".**
    - **Observed in design:** Truck icon + "Delivered 26 Apr · 2 days" — implies a delivered timestamp and a duration.
    - **Observed in code:** No `delivered_at` on either `orders` or `sub_orders`. `sub_orders.handedAt` exists but is the courier-handover timestamp, not delivery.
    - **Question:** Where does the delivered date come from? Options: (a) Add a `deliveredAt` column on `sub_orders`. (b) Reuse `updatedAt` when status flips to `delivered`. (c) Do not show this meta line until the data exists. The "2 days" duration is derived once a delivered timestamp is available.
    - **Answer:** STUBBED — see 06-scope-cut.md feature: Order tracking surface (buyer-side). Implement with placeholder: "Track order" CTAs route to `/profile/orders/[id]` rendering the existing detail (parcel boxes still work) as fallback; account drawer Track-order row hides when no active order; util-strip "Track order" link goes to `/profile/orders`. Add `// TODO(post-v1):` comment at every touch point. Add `sub_orders.deliveredAt timestamp`; "X days" derived from `deliveredAt − createdAt`.

13. **Card meta: "Gujranwala 52250" (postal code).**
    - **Observed in design:** City + 5-digit postal code.
    - **Observed in code:** `orders.shippingCity` is a free-text string. No postal-code column on `orders` or `addresses`.
    - **Question:** (a) Add a postal-code field upstream (addresses + shipping snapshot). (b) Hardcode/lookup postal codes per city. (c) Drop the postal code from the display.
    - **Answer:** STUBBED — see 06-scope-cut.md feature: Postal code + province on addresses. Implement with placeholder: address card composition includes postal/province; order meta line shows postal code. Add `// TODO(post-v1):` comment at every touch point. `addresses.postalCode` + mirrored on `orders` shipping snapshot.

14. **Card thumbnails: design shows placeholder icons, code shows real product photos.**
    - **Observed in design:** Six 48×48 paper-2 squares with a centred lucide `package` icon (ink-4). No image fills.
    - **Observed in code:** `<Image src={item.product.imageUrl} … fill />` actual product photos in overlapping circles.
    - **Question:** Is the placeholder a stand-in for real images that will render at runtime, or is the design intentionally suppressing photos in favour of icons?
    - **Answer:** User answer: for products, images will be used. for categories, vendor can choose b/w image or icon.

15. **Card meta: "COD · paid on delivery" — payment method indicator.**
    - **Observed in design:** Banknote icon + "COD · paid on delivery".
    - **Observed in code:** No `paymentMethod` column; checkout always creates COD orders.
    - **Question:** (a) Static copy ("COD · paid on delivery") because it's the only payment method. (b) Add a `paymentMethod` enum on `orders` for future-proofing. (c) Different copy when other methods land.
    - **Answer:** DEFERRED — see 06-scope-cut.md feature: Payment methods feature. Do not implement this question's scope. UI placeholder: checkout payment selector renders 3 disabled cards with "Coming soon" labels; account drawer "Payment methods" row hidden or static "Cash on delivery"; no payment_methods table. Static copy; no `paymentMethod` column.

16. **Items caption format: "Sufi Cooking Oil 5 L · Lipton Yellow Label · Basmati Rice 25 kg · Dalda Ghee 16 kg · +24 more items".**
    - **Observed in design:** Desktop ends with "+24 more items"; mobile drops the word "items" → "+24 more".
    - **Observed in code:** No equivalent caption.
    - **Question:** (a) Confirm the desktop/mobile copy difference is intentional. (b) How many product names lead the list (4 desktop / 3 mobile)? (c) Separator " · " is right? (d) For one-product orders, do we append "+0 more items" or hide the suffix?
    - **Answer:** Confirm desktop/mobile split as drawn; lead with 4 names desktop / 3 names mobile; separator ` · `; if N=0, hide the suffix.

17. **Sort options.**
    - **Observed in design:** Single visible state "Newest first".
    - **Observed in code:** Fixed `orderBy(desc(createdAt))`.
    - **Question:** What other sort options should the dropdown expose (Oldest first / Total ↑↓ / Weight ↑↓ / Status)?
    - **Answer:** Newest first (default), Oldest first. Two options; expand later.

18. **Search scope.**
    - **Observed in design:** Placeholder "Search by order ID or product".
    - **Observed in code:** None.
    - **Question:** Search is over (a) `orders.displayId` only, (b) displayId + `products.name`, (c) displayId + product name + product slug + city. The placeholder mentions only the first two.
    - **Answer:** `displayId` + `products.name` (matches the placeholder).

19. **Loading / Empty / No-results / Error states.**
    - **Observed in design:** Not drawn for this screen.
    - **Observed in code:** All three exist with Roman-Urdu copy + emoji.
    - **Question:** (a) Keep current shapes but rewrite copy in English / retoken visually? (b) Adopt an explicit Pencil-driven style (skeleton with stamp shapes? empty illustration?)? (c) Specify per-tab empty messages, and a separate "no results" state for empty search?
    - **Answer:** Keep current shapes (skeleton, empty, error) but rewrite copy to English and retoken visually.

20. **Mobile app bar: chevron-left target.**
    - **Observed in design:** Back chevron at the top of `lOti7`.
    - **Observed in code:** Storefront header is global; no per-screen back.
    - **Question:** Where does back go? Options: (a) `/profile` (account drawer trigger surface per design-inventory Q3). (b) `router.back()`. (c) Storefront `/`.
    - **Answer:** `/profile` (account drawer trigger surface per `02 §7 Q3`).

21. **Mobile drops "View details" button.**
    - **Observed in design:** Mobile card has only "Reorder" + "Invoice"; desktop has all three.
    - **Observed in code:** No buttons at all; whole card is a Link.
    - **Question:** On mobile, what's the gesture for opening Reorder? (a) Tap anywhere on the card body (whole-card link returns). (b) Tap the order ID / stamp / chevron. (c) Long-press menu. (d) Drop the action entirely on mobile.
    - **Answer:** Tap card body opens Reorder (matches Q9 desktop semantic).

22. **Mobile filter chip "Cancelled" with no count.**
    - **Observed in design:** Mobile shows "All 24" / "In transit 3" / "Delivered 19" / "Cancelled" — the last has no number.
    - **Observed in code:** N/A.
    - **Question:** Is it intentional that "Cancelled" omits its count on mobile, or is it a Pencil draw oversight?
    - **Answer:** Pencil oversight — add count.

23. **Mobile language toggle in the app bar.**
    - **Observed in design:** Mobile app bar (`lOti7`) shows the EN/Urdu segmented control alongside the account avatar.
    - **Observed in code:** No language toggle anywhere.
    - **Question:** Per design-inventory Q16, the toggle is presentational. (a) Render the `LanguageToggle` atom inert (no-op). (b) Render disabled / read-only. (c) Defer mounting until i18n lands.
    - **Answer:** STUBBED — see 06-scope-cut.md feature: i18n / language toggle plumbing (presentational EN-only). Implement with placeholder: render LanguageToggle visible-but-inert (visual only) with no state plumbing; clicking does nothing. Add `// TODO(post-v1):` comment at every touch point.

24. **`Quick reorder` vs per-card "Reorder" — copy collision.**
    - **Observed in design:** Two buttons say "Reorder" in different surfaces (top-right "Quick reorder" + per-card "Reorder").
    - **Observed in code:** N/A.
    - **Question:** Confirm both labels are correct, or harmonise (e.g. rename the top-right one to "Repeat last order" / "New order from past").
    - **Answer:** Confirm both labels correct; differentiated by surface (header CTA = Quick reorder; card CTA = Reorder).

25. **Stamp aggregation when an order has multiple sub-orders in different states.**
    - **Observed in design:** Each card shows exactly one stamp.
    - **Observed in code:** `getStatusSummary()` (`order-card/index.tsx:19`) does an existing reduce — but the design's stamp set is different.
    - **Question:** What is the precedence rule for the new label set (DELIVERED / OUT FOR DELIVERY / AT MNP HUB / CANCELLED) when sub-orders disagree? E.g. one delivered + one in transit → which stamp?
    - **Answer:** Derived rollup: any cancelled→CANCELLED; all delivered→DELIVERED; any handed_to_courier→AT MNP HUB; any packed→PACKED; else PENDING.

26. **Card border / surface palette specifics — visual confirmation.**
    - **Observed in design:** Card body is `white`; card header strip is `paper-2`; all hairlines `rule` / `rule-2`; whole card 1px `rule` outer border.
    - **Observed in code:** White card + neutral border, with dark-mode classes still present.
    - **Question:** Confirm we map this card to (a) `Card` primitive from `@repo/ui` — which after Phase 3 is `bg-white text-ink-2 rounded-md border border-rule` — composed with a header strip, OR (b) a new dedicated `OrderCard` shell that doesn't reuse the `Card` primitive. The implementation log §`card.tsx` notes "receipt-style and inverse Card variants may need to be added in Phase 4 if reuse is high enough."
    - **Answer:** Use existing `Card` primitive (`packages/ui/src/components/card.tsx`) composed with a paper-2 header strip.

27. **Pencil-system component coverage.**
    - **Observed in design:** This screen uses pill-tabs (radius 99), the `Stamp` atom, the `LanguageToggle` atom, lucide `chevron-down` / `arrow-down-up` / `refresh-cw` / `map-pin` / `file-text` / `banknote` / `truck` / `package` / `download` / `plus` / `search` / `chevron-left` / `chevron-right` icons, and a horizontally-scrolling chip row on mobile.
    - **Observed in implementation log:** `Stamp` and `LanguageToggle` are shipped. Underline tabs are flagged as "ask user to install shadcn `tabs`". **Pill tabs (radius 99) are NOT covered** by either the design-inventory `05 Components` row (which only documents underline tabs and chip filter rows separately) or the implementation log.
    - **Question:** Is the pill-tab + count chip a new primitive (e.g. `<TabPill count={…}>`), or a thin styling on top of buttons / underline tabs? This is the §02-design-inventory Q11-style "flag if a component wasn't covered" check.
    - **Answer:** Thin styling on top of buttons (small inline `TabPill` component in the orders module). Defer making it a `@repo/ui` primitive.

28. **Chip row on mobile with `clip:true` (horizontal scroll).**
    - **Observed in design:** `gVK0c` clips children — implies scrollable.
    - **Observed in implementation log:** No `ChipRow` / `Tabs` primitive yet (Tabs flagged as a future install).
    - **Question:** Is this its own primitive (`<ChipScroller>`) or just a Tailwind `flex overflow-x-auto` div? Given that the same chip pattern shows up on buyer/cart screens elsewhere (per `02-design-inventory.md` §3.11), a primitive may be warranted.
    - **Answer:** Tailwind `flex overflow-x-auto` div; promote to primitive only if reused in 3+ screens.

29. **Sticky tab bar + backdrop blur.**
    - **Observed in design:** No `position: sticky` is encoded by Pencil — the design has no scroll stickiness affordance for the filter card.
    - **Observed in code:** `sticky top-0 z-20 … bg-white/95 … backdrop-blur-md`.
    - **Question:** Drop the sticky / backdrop-blur entirely (purely flow), or preserve sticky behaviour at runtime even though Pencil doesn't show it?
    - **Answer:** Drop sticky / backdrop-blur entirely (Pencil shows pure flow).

30. **Token mapping for the DELIVERED stamp text colour.**
    - **Observed in design:** Stamp text uses `$green` (Pencil aliases `green = green-700 = #15803D` per §1.1 of design-inventory and §1.1 of token-migration).
    - **Observed in implementation log:** Both `green` and `green-700` survive as aliases.
    - **Question:** This is mostly a token sanity check rather than a behaviour Q — confirm we use `green` (which today resolves to `--green-700`) for the DELIVERED stamp's content colour rather than `green-2`/`green-600`. (Phase-3 OQ Q1 already preserved both names.)
    - **Answer:** Confirmed — use `green-700` (Pencil aliases `green = green-700`).

---

**File written to:** `D:\Moeed 8th Sem\Fyp\Code\shalmi-web\.claude-revamp\screens\buyer-orders\gap-analysis.md`

(End of Buyer · Orders gap analysis. Read-only phase — stopping here per
instructions.)

Answers propagated on 2026-05-02 from 06-scope-cut.md + 07-default-proposals.md
