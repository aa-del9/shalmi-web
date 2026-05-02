# Phase 4 — Gap Analysis · Buyer · Reorder (also serves as Order Detail)

> **Phase:** Pre-implementation gap analysis (read-only — no source files modified).
> **Date produced:** 2026-05-02
> **Pencil source:** `Pencil-Design\Shalmi` — frames `NNw2K` (Desktop · 1440×1411) and `tbXvv` (Mobile · 420×1458).
> **Existing code source:**
> - Route: `apps/web/src/app/(storefront)/profile/orders/[id]/page.tsx` (CC, middleware-gated)
> - Component tree: `apps/web/src/modules/retailer/retailer-order-detail/` (`index.tsx`, `components/parcel-box`, `components/receipt-card`, `components/review-drawer`)
> - Hooks: `use-retailer-order-detail-query` → `GET /api/retailer/orders/[id]`; `use-submit-review-mutation` → `POST /api/retailer/reviews`
> - Server route: `apps/web/src/app/api/retailer/orders/[id]/route.ts`
> - Cart store (target sink for "Add to cart"): `apps/web/src/modules/cart/stores/cart-store.ts`
> - Schema: `packages/database/src/schema/{orders,sub-orders,order-items,product-reviews}.ts`
> **Pairs with:** `01-codebase-map.md`, `02-design-inventory.md` (Q1 confirms this frame doubles as the order-detail view).

This document is a discovery artifact. Per CLAUDE.md hard rules, no fields, copy, or behavior are invented; everything that diverges between Pencil and code becomes a numbered question in §5.

---

## 0. Pre-flight: components/patterns referenced in Pencil that are NOT in the design system inventory

Before writing the row-by-row diff, flagging any Pencil component used on this screen that wasn't catalogued in `02-design-inventory.md` §3 / `04-design-system-implementation-log.md`. These are organism-level patterns that may need to be authored as new shared primitives or composed inline.

| Pencil pattern | Where it appears on Reorder | Catalogued? | Notes |
|---|---|---|---|
| **Weight gauge** (`B2ysb` / `n76qv`) | Right column desktop, top of mobile scroll | Inventoried in 02 §3.4 (cart) but not yet built (04 marks it deferred). | Same component as Cart; spec already documented. |
| **Receipt totals card** (`FDQJ6` / `XCIbS`) | Right column desktop, bottom of mobile scroll | Inventoried in 02 §3.5 (cart) but not yet built. | Same component as Cart. Reorder summary uses identical layout: paper-2 fill, 1.5px rule-2, radius 8, mono numerics. |
| **Reorder line-item row** (`CXe6z` / `NuDbz` etc.) | Items list (7 rows desktop, 6+ rows mobile) | **NOT catalogued.** Cart has its own line-item row (`cart-item-row`); this is structurally similar but contains: leading checkbox, package thumb, title + weight eyebrow + per-unit price, qty stepper, stacked total + stock label, trailing X (remove). Mobile is two-row (top: checkbox/thumb/title/X, bottom: stepper + total). | New shared molecule needed OR Cart's row gets variants. See Q-AMB-1. |
| **Quantity stepper** (`Bslux` desktop ≈ 36h three-cell minus/value/plus inside 1.5px rule-2 outline; mobile `IOoR7` ≈ 32h) | Each line item | Cart has `quantity-selector` (existing), styling not Pencil-aligned yet. | Treat as Pencil-spec'd retoken of the existing Cart selector. |
| **Per-item stock label pill** (text strings: "in stock" green, "low stock · 8 left" amber, "out of stock"/"unavailable" red) | Each line item's `ri1Tot` slot | **NOT catalogued.** These are inline text labels, not Stamp pills (no rotation, no stroke). | Could be plain colored text or could justify a new `<StockLabel>` atom. See Q-AMB-2. |
| **Help/inline banner** (amber bg + amber border + info icon, e.g. `tX5NA` "Add 6.5 kg more to cross into the 25–50 kg tier — save Rs. 60 on delivery.") | Above items list, between weight gauge and items toolbar | **NOT catalogued.** Pencil also uses similar amber/blue/red banners on Cart and likely other surfaces. | New shared `<Callout variant="info|warning|critical">` or similar. See Q-AMB-3. |
| **Comparison panel** ("VS. ORIGINAL ORDER" — `klOB3`) | Right column desktop only (mobile omits it) | **NOT catalogued.** White card with mono eyebrow, two rows (Original total / This reorder), then a separator-topped Difference row in green-700. | Reorder-specific molecule; likely lives inside the Reorder feature module rather than `@repo/ui`. |
| **Delivery info pill** ("MNP delivery to Gujranwala · Estimated 2–3 days · same MNP partner" — `O0lIR9`) | Bottom of right column desktop only (mobile bottom CTA replaces it with sticky bar) | **NOT catalogued.** Compact paper-2 card with truck icon + 2-line text. | Reuses Cart-spec idiom — confirm reuse target. |
| **Items toolbar** ("7 items · 3 quantity changes" + "Select all" pill — `Ck8x8` / `Q4qL8`) | Above items list | **NOT catalogued.** | Simple inline composition; no new primitive needed. |
| **Mobile sticky bottom CTA bar** (`JNKsi`: total left + green "Add to cart" button right) | Mobile bottom | **NOT catalogued.** Cart mobile and Checkout mobile use a similar sticky bar (per 02 §4.2). | New shared `<StickyBottomBar>` likely warranted. See Q-AMB-4. |
| **Breadcrumb** ("Home > Orders > Reorder #SH-24891" — `TlaJs`) | Top of desktop frame | **NOT catalogued.** Used on Orders, Reorder, Settings per 02 §4.2. | New shared `<Breadcrumb>` primitive likely warranted across multiple screens. |
| **Page header** with eyebrow + 36/800 title + 15px description (`Xpmij` / `f0MtP`) | Below breadcrumb | **NOT catalogued.** Used across many screens. | New shared `<PageHeader>` primitive likely warranted. |

> The inventory does cover `Weight gauge` and `Receipt totals` (02 §3.4–§3.5); the rest are surfaced here so they get acknowledged before any line is written. **Per the workflow rule, none of these are designed in this artifact** — they are flagged so a reusable-primitive pass can decide which become `@repo/ui` atoms vs. screen-local molecules.

---

## 1. Layout & structure

### 1.1 Pencil layout (NNw2K · Desktop · 1440×1411)

Top→bottom:

1. **Util strip `QzeNJ` (57h)** — full-width ink chrome. Left: `Help · Track order · MNP delivery hubs` (3 link cluster). Right: language toggle (EN selected, اردو muted).
2. **Header `kXuWq` (86h)** — paper bg, hairline bottom. Brand mark + wordmark + "Wholesale" subtitle on left; 44h white search field centred; account + cart icons on right.
3. **Main content `eBYOc` (1268h)** — paper bg, padding `[40, 80]`-ish, vertical stack:
   - Breadcrumb `TlaJs` (16h): `Home / Orders / Reorder #SH-24891`. The active leaf `Reorder #SH-24891` is `ink` 13/600; the rest are `ink-3` 13/normal with chevron-right separators.
   - Page header `Xpmij` (122h, `rTH`):
     - Eyebrow (mono 11/700 green-700, ls 0.16): `REORDER · ORDER #SH-24891 · 24 APR 2026`
     - Title (sans 36/800 ink, ls -0.02): `Replenish last week's cart`
     - Description (sans 15/normal ink-2, line-height 1.55, fixed-width 720): `Edit quantities or remove items, then add the whole list to your cart. Your weight gauge updates as you go.`
   - Two-column grid `NW1J4` (962h, gap 32):
     - **Left column `zvsZl`** (948w):
       - Weight gauge card `B2ysb` (150h, white fill, radius 8, 1px rule)
       - Help banner `tX5NA` (36h, amber-bg / amber border / info icon + amber 13/600 text)
       - Items toolbar `Ck8x8` (32h): `7 items · 3 quantity changes` (left), `Select all` outline button (right)
       - Items list card `aDIg9` (672h, white fill, radius 8, 1px rule, 7 rows divided by `bottom: 1px rule`):
         - Each row `CXe6z` (96h, padding [16,20], gap 16, layout horizontal, alignItems center):
           checkbox `square-check-big` 18 / paper-2 thumb 64×64 with `package` icon / vertical stack `{ title sans 14/600, weight eyebrow mono 10/normal ls 0.06, per-unit-price mono 12/normal ink-3 }` (fill_container) / qty stepper 36h (3 cells: 36/48/36) / vertical stack `{ total mono 16/700, stock label sans 11/600 in {green | amber | red} }` (120w) / X icon `x` 18 (36×36 click target).
         - Last row uses `square` (unchecked) + greyed thumb + red "out of stock" + total mono 16/700 in ink-3 + red "unavailable" stock label.
     - **Right column `n1QkZY`** (380w):
       - Receipt summary card `FDQJ6` (227h, paper-2 fill, radius 8, 1.5px rule-2): mono eyebrow `ORDER SUMMARY` centred + 1px rule + rows `6 items / Subtotal / Delivery (10–25 kg) / GST 18%` (1.5px ink under-line) + total row mono 16/800.
       - Comparison card `klOB3` (122h, white fill, radius 8, 1px rule, padding 14, gap 8): mono eyebrow `VS. ORIGINAL ORDER`, rows `Original total Rs. 1,16,380` (ink-3) / `This reorder Rs. 74,580` (ink) / 1px rule top + `Difference  − Rs. 41,800` in green-700 mono.
       - Primary CTA `l8R04` (48h, green-2 fill, white text, radius 6): cart icon + `Add 6 items to cart` (sans 16/700).
       - Secondary outline CTA `q0kTAj` (42h, 1.5px rule-2, ink text): save icon + `Save as new list` (sans 14/600).
       - Delivery info pill `O0lIR9` (51h, paper-2, radius 6, padding [10,12], gap 8): truck icon + `MNP delivery to Gujranwala` (sans 12/700) / `Estimated 2–3 days · same MNP partner` (sans 11/normal ink-3).

### 1.2 Pencil layout (tbXvv · Mobile · 420×1458)

1. **App bar `x5vQH` (73h)** — brand cluster left + (account, cart) icon pair right. No language toggle, no util strip, no search bar.
2. **Main scroll `fo5Yr` (1319h)**:
   - Mini eyebrow `PGKQh` (mono 10/700 green-700, ls 0.16): `REORDER · 24 APR 2026` (note: drops the "ORDER #SH-24891" segment that desktop carries).
   - Mobile title `f0MtP` (sans 24/800 ink, fixed-width fill_container): `Replenish last week's cart`.
   - Compact weight gauge `n76qv` (110h): same composition as desktop but legend is single-line (`0–10 / 10–25 / 25–50 / 50+` only, no Rs. labels per cell), 18h bar, gauge value 24/700.
   - Compact help banner `g8hyrx` (31h, amber): `Add 6.5 kg more — save Rs. 60 on delivery.` (shorter copy than desktop).
   - Items toolbar `Q4qL8` (28h): `7 items` (sans 16/700) + `Select all` (icon + sans 12/600, no border pill).
   - Items list `tSBwy` (826h) — 6 rows × ~135h (mobile shows only 6 of the 7 desktop items in this frame; the 7th is below the visible viewport but the list scrolls). Each row is 2-row vertical:
     - Top row `THFH8` / `tpmy0`: checkbox 18 / 56×56 paper-2 thumb / vertical stack `{ title sans 13/600, weight eyebrow mono 10, per-unit price mono 11 }` / X icon 18.
     - Bottom row `g6QnY` / `biGRs`: qty stepper 32h (3 cells 32/40/32) on left + total mono 15/700 with stock label sans 10/600 on right.
   - Receipt summary card `XCIbS` (165h) — same composition as desktop receipt but compact: mono eyebrow centred + Subtotal / Delivery / GST (1.5px ink under-line) + Total mono 15/800. **Mobile omits the `6 items` summary row that desktop has, and omits the entire `VS. ORIGINAL ORDER` comparison card.**
3. **Sticky bottom CTA bar `JNKsi` (66h)** — paper bg, 1px rule top hairline:
   - Left: vertical stack `{ Total · 6 items (sans 11 ink-3), Rs. 74,580 (mono 18/800 ink) }`.
   - Right: green-2 button `Add to cart` with cart icon (sans 14/700, padding [12,18], radius 6).
   - **Mobile bar omits "Save as new list" CTA and the delivery info pill — those are desktop-only or accessible via another mobile entry point not drawn in this frame.**

### 1.3 Existing code layout (RetailerOrderDetail)

Single column, mobile-first (`max-w-lg`, `mx-auto`, `px-3 py-4`). Top→bottom:

1. Back button + order header — circular icon button + `displayId` + `createdAt` formatted via `toLocaleDateString('en-PK')`.
2. Delivery address card — pin emoji + `shippingName / shippingAddress, shippingCity / shippingPhone`.
3. **`ParcelBox` per `subOrder`** — each parcel renders: header `Parcel {n}` + status pill (with emoji), body of items rows. Each item row: 48px circular thumb (next/image with `imageUrl`), title + `qty x Rs. unitPrice`, total + (if delivered & not reviewed) "🌟 Rate" button.
4. `ReceiptCard` — receipt-style card with jagged top/bottom edges, header "Payment Summary" + `displayId`, rows `Items Total / Shipping Fee / Wallet Refund (Items not available)` + `COD Amount to Collect` totalling `grandTotal − walletRefund`.
5. `ReviewDrawer` — bottom Sheet with 5 large rating stars + textarea + Submit button; opens when "Rate" pressed.

### 1.4 Layout-level diff (high level)

| Concern | Pencil | Existing code |
|---|---|---|
| Container width | Desktop 1440 with 1280-ish content max; mobile 420 | Single `max-w-lg` (~512px) container regardless of viewport |
| Layout | Two-column desktop / scroll + sticky-bar mobile | Stacked single-column |
| Grouping of items | Flat single list (1 card with N rows) | Grouped by sub-order (N parcel cards) |
| Status surface | None drawn (one breadcrumb + eyebrow `REORDER · ORDER #SH-24891 · 24 APR 2026`) | Per-parcel status pill with emoji |
| Primary affordance | Edit quantities + add to cart (interactive) | Read-only history view + per-item rate button |
| Address surface | Not drawn | `shippingName / address / city / phone` card |
| Receipt | Subtotal / Delivery / GST 18% / Total | Items Total / Shipping Fee / Wallet Refund / COD Amount |
| Comparison panel | "VS. ORIGINAL ORDER" desktop-only | None |
| CTA | Primary `Add 6 items to cart` + secondary `Save as new list` (desktop) / single `Add to cart` (mobile sticky) | None (read-only) |
| Review/rate flow | None drawn anywhere on the frame | Bottom Sheet with 5 stars + textarea, triggered per item |
| Tracking surface | None drawn (util strip has a generic "Track order" link) | None on this page (sub-order has `courierTrackingId` but UI doesn't render it) |

The screen's role pivots from **read-only history + post-delivery review** to **interactive replenishment editor with summary + comparison vs. original**. Both roles point to the same route `/profile/orders/[id]` per design-inventory Q1; the gap analysis below treats the Pencil frame as the new sole behavior of that route.

---

## 2. Element-by-element diff

Categories: VISUAL_ONLY · COPY_CHANGE · NEW_FIELD · REMOVED_FIELD · NEW_INTERACTION · CHANGED_INTERACTION · NEW_STATE · AMBIGUOUS.

### 2.1 Page chrome (header / breadcrumb / page title)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Util strip (Help · Track order · MNP delivery hubs) + EN/اردو language toggle | None (storefront layout has its own header but no util strip with these items) | New chrome strip not part of revamp scope of this screen — handled by storefront chrome work. Listing for completeness. | VISUAL_ONLY |
| Storefront header (brand + 44h search + account + cart icons) | `StorefrontHeader` component (out of scope of this screen) | Already present in `(storefront)` layout; not this screen's concern. | VISUAL_ONLY |
| Breadcrumb `Home / Orders / Reorder #SH-24891` (`TlaJs`) | Back button (circular icon `ArrowLeft` linking to `/profile/orders`) | Different navigation paradigm: breadcrumb (3 segments, hierarchical) vs. single back arrow. Pencil also surfaces order id in the leaf. | CHANGED_INTERACTION |
| Page eyebrow `REORDER · ORDER #SH-24891 · 24 APR 2026` (mono 11/700 green-700) | Order header line: `displayId` (sans bold 18) + `createdAt` formatted as `dd MMM yyyy` (xs ink-3) | Pencil eyebrow concatenates literal `REORDER`, the order id, and the date with `·` separators — single mono line. Existing splits id + date into two stacked lines and uses sans-serif. Date format `24 APR 2026` is uppercase short month + numeric day + year (no leading zero). | COPY_CHANGE + VISUAL_ONLY |
| Page title `Replenish last week's cart` (sans 36/800) | None — existing has only the order id `displayId` as a heading | Pencil introduces a marketing-style title not present in code. **Copy is conditional on the screen role** (always reads "Replenish last week's cart" in the frame, regardless of order recency). | NEW_FIELD |
| Page description `Edit quantities or remove items, then add the whole list to your cart. Your weight gauge updates as you go.` (sans 15/normal ink-2) | None | New static copy below title. | NEW_FIELD |
| Mobile eyebrow `REORDER · 24 APR 2026` (drops the order id segment) | Same as above (no equivalent) | Mobile eyebrow is shorter than desktop — drops `· ORDER #SH-24891 ·`. | COPY_CHANGE |

### 2.2 Weight gauge card (`B2ysb` desktop, `n76qv` mobile)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Weight gauge header eyebrow `CART WEIGHT` (mono 11/600 ls 0.08) + tier label `Tier 2 · 10–25 kg · Rs. 180 delivery` (sans 12 ink-3) | None | The screen displays a current cart weight tier readout. Backed by sub-order `weightGrams` (sum across items based on `products.weightGrams * quantity`). | NEW_FIELD |
| Right side big number `18.5` (mono 32/700) + `kg` (sans 13/500 ink-3) | None | Aggregated weight display. | NEW_FIELD |
| Bar `bAvOW` (22h, paper-2 fill, radius 4, inner ink rectangle `uFO5D` filled to current position; clipped) | None | Visual progress fill within the bar — width depends on current weight vs. tier ranges. | NEW_FIELD + NEW_INTERACTION |
| Legend with 4 cells `0–10 KG / Rs. 280 · 10–25 KG / Rs. 180 · 25–50 KG / Rs. 120 · 50+ KG / Rs. 80`; active tier ink-bold; right hairlines between cells | None | Per-tier delivery price table. **Source of these tier values is undefined in code today** — `sub_orders.shippingFeeCustomer` is computed at checkout but the tier table itself is not declared anywhere. | NEW_FIELD |
| Mobile compact legend (no Rs. per cell, 9px font) | None | Mobile-only condensed variant. | NEW_FIELD |

### 2.3 Help banner (`tX5NA` desktop, `g8hyrx` mobile)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Amber callout: `Add 6.5 kg more to cross into the 25–50 kg tier — save Rs. 60 on delivery.` (desktop) / `Add 6.5 kg more — save Rs. 60 on delivery.` (mobile) | None | Computed advisory copy: distance to next tier + savings amount. Both numbers (`6.5 kg`, `Rs. 60`) are derived from current cart weight + tier table. **Conditional rendering not specified in design** (i.e., no frame for "you are already in the highest tier"). | NEW_FIELD + NEW_STATE |

### 2.4 Items toolbar (`Ck8x8` desktop, `Q4qL8` mobile)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Left summary `7 items · 3 quantity changes` (sans 18/700 ink + ink-3 13) | None | Pencil shows two facts: total item count, and *change-from-original* count. The latter implies tracking which items the user has edited vs. the original snapshot. | NEW_FIELD + NEW_INTERACTION |
| Right `Select all` pill (square-check-big icon + sans 13/600, 1.5px rule-2 outline pill, mobile loses the pill border) | None | Bulk-toggle interaction. | NEW_INTERACTION |

### 2.5 Items list

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Items list card `aDIg9` — flat single white card with N rows separated by `bottom 1px rule` | `ParcelBox` per sub-order, each its own bordered card with parcel header + per-item rows | **Grouping changes from per-vendor (sub-order) to flat list.** Sub-orders are a real domain concept (one order can have N vendors → N sub-orders, each with own status / shipping fee / COD). Pencil flattens. | CHANGED_INTERACTION + REMOVED_FIELD |
| Per-row leading checkbox `square-check-big` (selected by default) / `square` (out-of-stock row) | None | Per-item include-in-reorder toggle. | NEW_INTERACTION |
| Thumbnail: 64×64 paper-2 frame with centred `package` lucide icon, 1px rule (desktop) | 48×48 circular thumbnail with `next/image` from `item.product.imageUrl` (or `?` placeholder if null) | Thumb is square (radius 6), uses generic icon glyph instead of product image, larger (64 vs 48) on desktop. **Mobile is 56×56 still icon-only.** | VISUAL_ONLY + REMOVED_FIELD (image not rendered) |
| Title row `Sufi Cooking Oil 5 L · Pack of 4` (sans 14/600 ink, fill_container) | `item.product.name` (truncated, sans 14/medium) | Pencil concatenates product name + a "Pack of N" / "Carton of N" / "Box of N" suffix. **The pack/carton suffix is a NEW concept that depends on the new pack-pricing schema (per `02 Q12`).** | NEW_FIELD |
| Weight eyebrow `21 KG · CARTON` (mono 10/normal ls 0.06, ink-3) | None | New per-item weight + unit-type label. Weight comes from `products.weightGrams`; unit-type (`CARTON / BAG / TIN / BOX`) is **not in current schema**. | NEW_FIELD |
| Per-unit price `Rs. 1,205 per unit` / `Rs. 1,490 per carton` / `Rs. 6,200 per bag` / `Rs. 7,600 per tin` / `Rs. 280 per box` / `Rs. 1,033 per carton` (mono 12/normal ink-3) | `{quantity} x Rs. {unitPrice}` (sans xs ink-400) | Pencil shows price-per-unit (or per-pack), not "qty × price". The unit noun (`unit / carton / bag / tin / box`) varies per product. | COPY_CHANGE + NEW_FIELD |
| Quantity stepper (`Bslux` desktop = 36h three-cell 36/48/36 inside 1.5px rule-2 outline; mobile `IOoR7` = 32h 32/40/32) | None on order detail (existing `quantity-selector` only used in cart) | New per-row interactive stepper that increments/decrements quantity and updates totals + weight + counters. | NEW_INTERACTION |
| Per-row total `Rs. 4,820` (mono 16/700 ink) | `Rs. {totalPrice}` (sans bold) | Total now in mono numerics. **Total is computed = quantity × unit price, derived live as user adjusts stepper. Existing code reads `item.totalPrice` directly from the historical order snapshot.** | CHANGED_INTERACTION + VISUAL_ONLY |
| Stock label below total: `in stock` (green-700 sans 11/600), `low stock · 8 left` (amber sans 11/600), `out of stock` / `unavailable` (red mono 12/normal for unit-price line; sans 11/600 for stock-state label) | None | New per-item live stock status. **Backed by `products.stock` integer, but the threshold for "low stock" is not defined in code.** | NEW_FIELD + NEW_STATE |
| Trailing X (`x` icon 18 in 36×36 click target, ink-3) | None | New per-row remove action. | NEW_INTERACTION |
| Out-of-stock row state (`ri7`): unchecked checkbox, greyed thumb (already paper-2; opacity unchanged), title still ink, weight still ink-3, per-unit price replaced by red `out of stock` mono 12, total `Rs. 0` ink-3 mono, label `unavailable` red sans 11/600 | `isCancelled` ParcelBox state: opacity 50%, line-through on title, line-through on totals, red border on parcel | Different out-of-stock visualization (Pencil per-item; existing per-parcel for cancellations). | NEW_STATE + REMOVED_FIELD |
| Mobile per-row layout: 2-row vertical (top `THFH8` = checkbox/thumb/title-block/X; bottom `g6QnY` = stepper + total stack) | Same single horizontal row regardless of viewport | Mobile rows are taller (2 stacked rows) and reorder elements. | VISUAL_ONLY |

### 2.6 Receipt summary (`FDQJ6` desktop, `XCIbS` mobile)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Mono eyebrow `ORDER SUMMARY` centred (mono 11/700 ls 0.08 ink-2) | None (`ReceiptCard` says `🧾 Payment Summary` then `displayId`) | Different label, no order id in the receipt. | COPY_CHANGE |
| Hairline `XWtzD` separator under eyebrow | None | Visual divider. | VISUAL_ONLY |
| Row `6 items / Rs. 63,040` (desktop only — mobile omits this row) | None | Item-count row at top of receipt. | NEW_FIELD |
| Row `Subtotal / Rs. 63,040` (mono 13) | Row `Items Total / Rs. {totalItemsCost}` | Label changes `Items Total` → `Subtotal`. | COPY_CHANGE |
| Row `Delivery (10–25 kg) / Rs. 180` | Row `Shipping Fee / Rs. {totalShippingCost}` | Label includes the active weight tier. Number sourced from tier table given current cart weight. | COPY_CHANGE + NEW_FIELD |
| Row `GST 18% / Rs. 11,360` with 1.5px ink under-line | None | New tax row. **GST 18% is not stored or computed anywhere in current code** (no `gstAmount`, no `taxRate`, no GST flag on `orders`). | NEW_FIELD |
| Total row `Total / Rs. 74,580` (mono 16/800 desktop, 15/800 mobile) | Total row `COD Amount to Collect / Rs. {grandTotal − walletRefund}` (sans bold extralarge mono extrabold) | Label `Total` not `COD Amount to Collect`. **No COD-specific framing in the new design**, no wallet-refund row. | COPY_CHANGE + REMOVED_FIELD |
| (existing only) Wallet Refund (Items not available) row when any sub-order is cancelled, with negative number in green | — | Pencil omits wallet refund row entirely. Cancellation of a sub-order line still creates a wallet credit per business logic (existing `ReceiptCard` calculates `walletRefund` from cancelled sub-orders). | REMOVED_FIELD |
| (existing only) Receipt has decorative jagged top and bottom edges (paper-receipt aesthetic) | — | Pencil receipt is a flat paper-2 card, no jagged edges. | VISUAL_ONLY |

### 2.7 Comparison card "VS. ORIGINAL ORDER" (`klOB3`, desktop only)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Mono eyebrow `VS. ORIGINAL ORDER` (mono 10/700 ls 0.08 ink-3) | None | New panel. | NEW_FIELD |
| Row `Original total · Rs. 1,16,380` (sans 13 ink-3 + mono 13 ink-3) | None | Reads original `orders.grandTotal` of the source order. | NEW_FIELD |
| Row `This reorder · Rs. 74,580` (sans 13/600 ink + mono 13/700 ink) | None | Computed live total of edited reorder draft. | NEW_FIELD |
| Row `Difference · − Rs. 41,800` (sans 13/700 green-700 + mono 13/700 green-700) above 1px rule top | None | Computed signed difference. **Sign rule and color rule not declared:** is positive (more expensive) shown in red? | NEW_FIELD + AMBIGUOUS |

### 2.8 CTA stack (right column desktop)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Primary CTA `l8R04` — full-width green-2 button, 48h, padding [14,20], radius 6, cart icon + `Add 6 items to cart` (sans 16/700 white). | None | Adds the (selected, in-stock) items to cart-store. Count "6 items" = number of selected items, dynamic. | NEW_INTERACTION + NEW_FIELD |
| Secondary CTA `q0kTAj` — full-width outline button, 42h, 1.5px rule-2, save icon + `Save as new list` (sans 14/600 ink). | None | Saves the current edited line-up as a new reusable shopping list. **No "shopping lists" or "saved orders" feature exists in current code or schema.** | NEW_INTERACTION + NEW_FIELD |
| Delivery info pill `O0lIR9` — paper-2, radius 6, padding [10,12]: truck icon + `MNP delivery to Gujranwala` (sans 12/700) / `Estimated 2–3 days · same MNP partner` (sans 11/normal ink-3). | None | Shows delivery destination (city) + ETA + carrier-continuity claim. **City is sourceable from current default address; ETA range and "same MNP partner" claim are not in current schema.** | NEW_FIELD |

### 2.9 Mobile sticky bottom bar (`JNKsi`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Sticky bar paper bg + 1px rule top hairline; left vertical stack `Total · 6 items` (sans 11 ink-3) + `Rs. 74,580` (mono 18/800 ink); right green-2 button `Add to cart` (sans 14/700 white, padding [12,18], radius 6) | None — existing has no sticky bar | New mobile sticky CTA pattern. **Mobile omits the secondary "Save as new list" CTA** — unclear whether it's accessible elsewhere on mobile or genuinely deprecated for mobile. | NEW_INTERACTION + AMBIGUOUS |

### 2.10 Existing-only elements not in Pencil

| existing_element | pencil_element | diff_summary | category |
|---|---|---|---|
| Back button (circular `ArrowLeft` 40px → `/profile/orders`) | (Pencil uses breadcrumb) | Removal of dedicated back button on this screen. | REMOVED_FIELD |
| Delivery address card showing `shippingName / shippingAddress, shippingCity / shippingPhone` | None | Pencil does not draw the historical shipping address on the reorder/order-detail screen. Default-address inferred for the new reorder is referenced only via the right-column "MNP delivery to Gujranwala" pill. | REMOVED_FIELD |
| Per-parcel header `📦 Parcel {n}` + status pill `{emoji} {label}` (color-mapped from `sub_orders.status`) | None | Pencil flattens sub-order grouping; no parcel header, no status pill on this screen. | REMOVED_FIELD |
| Per-item "Rate" yellow pill (when delivered & not reviewed) → opens ReviewDrawer | None | Pencil does not draw any per-item rating affordance on this screen. The DB still has `product_reviews` and the `POST /api/retailer/reviews` endpoint exists. | REMOVED_FIELD + AMBIGUOUS |
| ReviewDrawer (5 stars + textarea + submit, with vibrate + audio feedback on star tap) | None | Entire review flow not present in Pencil. | REMOVED_FIELD + AMBIGUOUS |
| Cancellation visual: red border + 50% opacity + line-through on title and totals (when `subOrder.status === 'cancelled'`) | (Pencil shows out-of-stock per-item only) | No equivalent for sub-order cancellation in Pencil. | REMOVED_FIELD |
| Wallet refund row + computation in `ReceiptCard` | None | (Already noted in §2.6 — listed here for completeness.) | REMOVED_FIELD |
| Loading state: centred spinner + Roman-Urdu copy `Order details load ho rahay hain...` | None drawn | Pencil does not draw a loading state for this screen. | NEW_STATE (missing) |
| Error state: red bordered red-50 card with Roman-Urdu copy `Order details load nahi ho sakay` | None drawn | Pencil does not draw an error state. | NEW_STATE (missing) |
| Tracking ID: `sub_orders.courierTrackingId` exists in schema but is **not rendered** in current UI either | None | No-op: neither side renders this. Listed for completeness. | (n/a) |

---

## 3. Schema / type implications

For every NEW_FIELD or REMOVED_FIELD above, the changes that would be required to power them:

### 3.1 Page header (NEW)

- `Replenish last week's cart` (title) and the body copy are static — no schema impact.
- `REORDER · ORDER #SH-24891 · 24 APR 2026` eyebrow uses `orders.displayId` (already on the row) and `orders.createdAt` (already on the row, currently formatted via `toLocaleDateString('en-PK')` in `index.tsx:62`). Format changes to uppercase short month + numeric day + year (e.g. `24 APR 2026`).

### 3.2 Weight gauge + tier table (NEW)

- **Per-item weight (`products.weightGrams`)** already exists — used today only at checkout to compute `sub_orders.weightGrams`.
- **Aggregated current cart weight** = `Σ items[i].quantity × products.weightGrams[i]`. Computed client-side from the reorder draft state.
- **Tier table** (`0–10 kg / Rs. 280`, `10–25 kg / Rs. 180`, `25–50 kg / Rs. 120`, `50+ kg / Rs. 80`) — **does not live anywhere in code today**. Options:
  - Hardcoded constant in a shared module (e.g. `packages/constants/src/delivery-tiers.ts`).
  - New DB table `delivery_tiers` (`min_weight_grams`, `max_weight_grams`, `fee_cents`).
  - Per-region table if delivery hubs differ (per `02 §3.7` MNP hubs are city-pinned).
- **Help banner copy** (`Add 6.5 kg more to cross into the 25–50 kg tier — save Rs. 60 on delivery.`) — derived live from `(nextTier.minWeight − currentWeight)` and `(currentTier.fee − nextTier.fee)`.

### 3.3 Items list (NEW + CHANGED_INTERACTION)

- **`isReorderDetailsView` data source**: Per Q1 of `02-design-inventory.md`, this screen serves both Reorder and Order Detail. The data source remains `GET /api/retailer/orders/[id]`. It returns historical `order_items` snapshot (existing behavior).
- **Local "draft" state**: editing quantities, selection toggles, and removals do NOT mutate the original order (the order is immutable, stored as snapshot). A local draft state in the screen tracks `{ orderItemId → { selected, quantity } }`. Final "Add to cart" pushes the draft into `cart-store.ts` (Zustand-persisted).
- **Items list source**: each row needs:
  - `productId`, `productName`, `weightGrams`, `stock`, current `priceTiers` (`product_price_tiers`) — **`products.stock` is currently NOT returned by the GET endpoint** (`apps/web/src/app/api/retailer/orders/[id]/route.ts:84-90`). The endpoint would need to include `products.stock` and current `priceTiers` so the screen can show current pricing/availability.
  - Historical `order_items.quantity`, `order_items.unitPrice` (already returned).
  - **Pack/carton/bag/tin/box label** (`Pack of 4`, `Carton of 6`, …) — depends on the **new pack-pricing schema decided in `02 Q12`** ("we follow the flow followed in design, which is a 'pack' based approach"). Per that answer, schema changes are pending and needed before this label can render. Affected: `packages/database/src/schema/products.ts`, `packages/database/src/schema/product-price-tiers.ts` (or a new `product_packs` table), and possibly `order_items` (which historical pack was bought).
  - **Unit-type noun** (`unit / carton / bag / tin / box`) — currently no field in `products` carries this. New `products.unitType` enum field, or derived from the pack schema.
  - **Pack weight** for the eyebrow: `21 KG · CARTON` is the *pack* weight, not per-unit weight. If `products.weightGrams` is per-unit, a pack of 4 of `Sufi Oil 5 L` (5 kg per unit nominal, but the eyebrow shows 21 kg total ≈ 5.25 × 4) would need either a `weightPerPackGrams` field on the new pack schema or a runtime multiplier.
- **Live total per row**: `quantity × unitPrice` — currently `order_items.totalPrice` is the historical snapshot, but Pencil shows `Rs. 4,820` for a row with `Rs. 1,205 per unit` × quantity 4 = `Rs. 4,820`. Needs to be derived live.
- **Quantity stepper bounds**: not declared by Pencil. Min = 1 (or 0 → remove)? Max = `products.stock`?
- **Selection (checkbox)**: a per-row boolean in the local draft. Default `true` for in-stock rows, `false` for out-of-stock.
- **Remove (X)**: removes a row from the local draft (not from the persisted order — the order is immutable).
- **Stock label thresholds**: `in stock` / `low stock · 8 left` / `out of stock` map to:
  - `in stock` when `products.stock > LOW_STOCK_THRESHOLD`
  - `low stock · N left` when `0 < products.stock ≤ LOW_STOCK_THRESHOLD` (threshold value not specified — the `8 left` is a literal in the design)
  - `out of stock` / `unavailable` when `products.stock === 0`
  - Threshold constant lives where? (No precedent in the codebase.)

### 3.4 Receipt summary (CHANGED_INTERACTION + NEW_FIELD)

- `Subtotal` = `Σ live row totals` (in-stock + selected only).
- `Delivery (10–25 kg)` = `tierLookup(currentWeight).fee` — depends on tier table (§3.2).
- `GST 18%` — **completely new computation; no `taxRate` or `gstCents` field anywhere**. Likely needs:
  - A constant `GST_RATE = 0.18` somewhere shared.
  - Computation `gst = round(subtotal × 0.18)` (or applied to `subtotal + delivery`?).
  - **Decision: is GST stored on future `orders` rows (so historical receipts can re-show it correctly), or always recomputed?** Currently `orders` only stores `totalItemsCost / totalShippingCost / grandTotal` integers. Adding `gstCents` (or `taxAmount`) would be required if GST is to be persisted.
- `Total` = `subtotal + delivery + gst`.
- "6 items" row = count of selected, in-stock rows.

The **existing** receipt fields (`Items Total`, `Shipping Fee`, `Wallet Refund`, `COD Amount to Collect`) are tied to `orders.totalItemsCost / totalShippingCost / grandTotal` and the runtime `walletRefund = Σ cancelledSubOrder.codAmount`. Removing them from this screen does NOT require schema changes (the underlying columns stay; only the UI representation changes).

### 3.5 Comparison panel (NEW)

- `Original total` = `orders.grandTotal` of the source order (already on the row).
- `This reorder` = live computed total of the draft.
- `Difference` = signed delta. Color rule unspecified (see Q-AMB-5).

### 3.6 Primary / secondary CTAs (NEW_INTERACTION)

- **`Add 6 items to cart`**: pushes selected, in-stock items into `cart-store.ts` via `addItem(input, quantity)`. The cart store currently expects `CartItemInput` shape: `{ productId, name, slug, image, weightGrams, vendorId, priceTiers }` — every field except `quantity`. The order-detail GET endpoint currently does NOT return `slug`, `vendorId`, `priceTiers`, or `image (blurHash + url)` — only `name` + `imageUrl[0]`. **Endpoint must be extended to return the full `CartItemInput` payload per item, OR the screen must do a secondary fetch per product slug.**
- Adding to cart does NOT mutate the order. It only updates client cart state.
- **`Save as new list`**: implies a "saved shopping lists" feature. **No schema or endpoint exists**. Would require:
  - New table `saved_lists (id, userId, name, createdAt)`.
  - New table `saved_list_items (id, listId, productId, quantity)`.
  - New endpoints `POST /api/retailer/lists`, `GET /api/retailer/lists`, etc.
  - A UI surface to *view* saved lists (also undefined — no Pencil frame).

### 3.7 Delivery info pill (NEW_FIELD)

- `MNP delivery to Gujranwala` — needs the user's default delivery city. Source: `addresses.city` for the user's `isDefault: true` address. Currently the screen makes no address query.
- `Estimated 2–3 days` — **no source in current schema**. Hardcoded? Per-hub config? Per-tier?
- `· same MNP partner` — claim that the new reorder will use the same courier partner as the original order. **No `subOrders.courierPartner` or similar field exists** (only `courierTrackingId`).

### 3.8 Removed elements

- **Back button** — removed in favor of breadcrumb. No schema change.
- **Delivery address card** — removed from this screen. The original order's `shippingName / shippingPhone / shippingAddress / shippingCity` columns stay populated on `orders` (they are immutable snapshots). UI just stops surfacing them on this screen.
- **ParcelBox + per-parcel status pill** — removed UI grouping. `sub_orders` rows still exist and are still queried for vendor payout, vendor orders, etc. The reorder/order-detail screen simply flattens them.
- **Per-item Rate button + ReviewDrawer** — removed from this screen. The `product_reviews` table, `useSubmitReviewMutation`, and `POST /api/retailer/reviews` endpoint remain available; their UI entry point is gone here (could it be moved elsewhere — e.g. a separate "Past delivered orders" surface?).
- **Wallet refund row** — removed from receipt UI on this screen. `wallet` table + balance logic untouched.

### 3.9 Currency formatting

Pencil uses `Rs. 4,820` style with comma thousands separators throughout this screen, **except** for the comparison-panel "Original total" which uses South-Asian grouping `Rs. 1,16,380`. Per `02 Q17` user answer ("Standardize to one, and use the South-Asian digit-grouping style"), all Rupee values on this screen should render as South-Asian groups (e.g. `Rs. 1,16,380` not `Rs. 116,380`). The existing code uses `.toLocaleString()` with no locale argument (defaults to host locale → Western grouping). A shared formatter would be required.

---

## 4. Behavior implications

For each NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE:

### 4.1 Local draft-editing state (NEW_INTERACTION)

- The screen needs a local `useState` (or `useReducer`) holding `{ [orderItemId]: { selected: boolean, quantity: number, removed: boolean } }`, seeded from the historical order on first render.
- All numbers on the screen (per-row total, subtotal, GST, total, item count, weight tier label, gauge fill, help banner copy, comparison difference) recompute from this draft on every state change.
- The original order is **never mutated** — no `PATCH /api/retailer/orders/[id]` is implied by this screen.
- **No persistence between sessions** unless the user clicks `Save as new list` (which is itself unscoped — see §3.6).

### 4.2 Quantity stepper (NEW_INTERACTION)

- Per row, increment/decrement via the `+`/`−` cells of `Bslux` / `IOoR7`.
- Lower bound and upper bound undefined. Likely lower=1 (X removes the row), upper=`products.stock`.
- Recomputes per-row total = `quantity × unitPrice`.
- Recomputes subtotal, weight gauge, comparison panel, help banner, primary CTA label (`Add N items to cart`).

### 4.3 Per-row checkbox (NEW_INTERACTION)

- Toggles `selected: boolean` in the draft.
- Out-of-stock rows are forced `selected: false` (and the checkbox renders as `square` not `square-check-big`) — confirm whether they're disabled or just default-off.
- Affects: subtotal calc, item count, primary CTA label, weight gauge, GST.

### 4.4 Per-row remove X (NEW_INTERACTION)

- Removes the row from the draft list. No confirmation modal drawn in Pencil. (Confirm needed?)
- Affects: same downstream as quantity / selection.

### 4.5 "Select all" toggle (NEW_INTERACTION)

- Toggles all rows' `selected` state. Out-of-stock rows still excluded? (Confirm.)

### 4.6 Live recompute of weight gauge + help banner + comparison panel (NEW_INTERACTION + NEW_STATE)

- Every quantity/selection change triggers:
  - Weight = `Σ row.weightGrams * row.quantity` (selected only).
  - Tier lookup against the tier table.
  - Bar fill width within current tier range.
  - Help banner copy "Add X kg more to cross into Y tier — save Rs. Z on delivery."
  - Comparison delta vs `orders.grandTotal`.
- **Edge state: user is already at top tier (50+ kg).** Pencil does not draw a frame for this — does the help banner hide or show a different copy?
- **Edge state: cart is empty (everything deselected/removed).** Not drawn — what does the gauge show? Tier 1 with `Rs. 280`? Hidden? CTA disabled?

### 4.7 Primary CTA "Add N items to cart" (NEW_INTERACTION)

- Pushes selected rows (with current draft quantities) into `useCartStore.addItem()`.
- Each push currently calls `addItem(input, quantity)` where existing items in cart get their quantity **incremented** (`apps/web/src/modules/cart/stores/cart-store.ts:23-39`). That's the desired behavior for "add to cart" — but if user has cart items already, this **adds to** the existing cart rather than replacing it. Confirm intent (Q-INT-3).
- After successful add, navigation: stay on screen? Toast? Redirect to `/cart`? Pencil does not draw the post-action state.

### 4.8 Secondary CTA "Save as new list" (NEW_INTERACTION)

- Saves draft as a named shopping list. Modal to ask for name? Default name from order id?
- Needs entire backing schema + endpoints + UI surface (none exist — see §3.6).

### 4.9 Mobile sticky bottom bar (NEW_INTERACTION)

- Same `Add to cart` semantics as desktop primary CTA (with a single label that doesn't include the count? Pencil mobile bar reads simply `Add to cart`).
- Mobile bar omits the `Save as new list` and the delivery info pill. Are those accessible elsewhere on mobile (e.g. a More menu, or above the sticky bar in the scroll)? Pencil mobile frame `tbXvv` ends with `XCIbS` (receipt) → no save button, no delivery pill drawn in the scroll.

### 4.10 Loss of review/parcel features (CHANGED_INTERACTION + REMOVED_FIELD)

- Existing endpoint `POST /api/retailer/reviews` remains, but no UI on this screen will trigger it. **Does the review flow move to another screen, or is it deprecated?**
- `sub_orders.status` and `courierTrackingId` continue to exist (vendor orders use them). The **buyer surface** for tracking a live order disappears with the parcel boxes. Per `02 §3.7` the storefront util strip has a `Track order` link — possibly the new home for tracking, but no Pencil frame is drawn for it on this revamp.

### 4.11 Page role pivot (AMBIGUOUS)

- Today, this route is the post-checkout "look at my order, see parcels, leave reviews" screen.
- Pencil presents it as the pre-checkout "edit and re-add to cart" screen.
- **Is the existing role retired completely, or do both behaviors coexist on the same route?** If reorder is the only role, the screen carries no information about delivery progress, parcel splits, or reviews — those moments need somewhere else to live (or the order detail role needs a separate route / sub-state).

---

## 5. Open questions for me

Numbered. Each NEW_FIELD / REMOVED_FIELD / NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE / COPY_CHANGE / AMBIGUOUS row in §2 has a question here. (Questions are also raised for §0 components and for derived behavioral choices that arise from the diff.)

### 5.A — Page chrome and headers

1. **Breadcrumb vs. back button (CHANGED_INTERACTION).**
   - Observed: Pencil shows breadcrumb `Home / Orders / Reorder #SH-24891`. Existing code uses a circular `ArrowLeft` button linking to `/profile/orders`.
   - Question: Should the back button be removed entirely on desktop in favor of the breadcrumb, and on mobile (where Pencil also shows no back button — only an app-bar without one) navigation relies entirely on the OS back gesture / breadcrumb-equivalent?
   - Hypotheses: (a) Keep both — breadcrumb on desktop, ArrowLeft on mobile. (b) Replace fully — breadcrumb everywhere; mobile gets a smaller breadcrumb above the title. (c) Mobile uses a small back-arrow in the app-bar (inside `x5vQH`) that Pencil omitted but is implied.

2. **Page title `Replenish last week's cart` (NEW_FIELD + COPY_CHANGE).**
   - Observed: Pencil hard-codes this title regardless of how recent the original order is. The order in the design is dated `24 APR 2026` and the design was produced 2026-05-02 (so "last week" is plausible only for that mock).
   - Question: Is the title literally always "Replenish last week's cart", or does it adapt ("Replenish your N-week-old cart" / "Reorder this list" / etc.)?
   - Hypotheses: (a) Always literal `Replenish last week's cart` (placeholder per design). (b) Templated: `Replenish {your last week's / this 3-week-old / this} cart`. (c) Different title when serving the order-detail role vs. reorder role.

3. **Page description copy (NEW_FIELD).**
   - Observed: `Edit quantities or remove items, then add the whole list to your cart. Your weight gauge updates as you go.` is hardcoded in Pencil.
   - Question: Confirm this copy is canonical and not lorem-style? Should it remain visible after a user has interacted (e.g. only show on first visit)?

4. **Page eyebrow date format (COPY_CHANGE).**
   - Observed: Pencil shows `· 24 APR 2026` — uppercase short month, no leading zero, year. Existing code uses `toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })` which yields something like `24 Apr 2026` (sentence-case month).
   - Question: Use uppercase month per Pencil (`24 APR 2026`), and if so should this be a shared formatter for all date eyebrows across the design?

5. **Mobile eyebrow drops the order id (COPY_CHANGE).**
   - Observed: Desktop eyebrow `REORDER · ORDER #SH-24891 · 24 APR 2026`; mobile eyebrow `REORDER · 24 APR 2026`.
   - Question: Is the order id intentionally dropped on mobile for space, or is it an oversight? If intentional, where does the user see the id on mobile?

### 5.B — Weight gauge and tier table

6. **Tier table source (NEW_FIELD).**
   - Observed: Pencil hardcodes `0–10 kg / Rs. 280`, `10–25 kg / Rs. 180`, `25–50 kg / Rs. 120`, `50+ kg / Rs. 80`. No corresponding constants or DB rows exist.
   - Question: Where does this table live?
   - Hypotheses: (a) Hardcoded constant (`packages/constants/src/delivery-tiers.ts`). (b) New DB table `delivery_tiers`. (c) Per-region table keyed by the user's hub city.

7. **Help banner copy template (NEW_FIELD + NEW_STATE).**
   - Observed: `Add 6.5 kg more to cross into the 25–50 kg tier — save Rs. 60 on delivery.` (desktop) / `Add 6.5 kg more — save Rs. 60 on delivery.` (mobile).
   - Question: What is the exact template (need parameter slots), and how does it render at the top tier (no "next" tier) and when cart is empty?
   - Hypotheses: (a) Hide banner at top tier. (b) Show alternate copy "You're at the best delivery rate." (c) Show a non-amber "info" variant.

8. **Compact mobile gauge legend (VISUAL_ONLY).**
   - Observed: Mobile legend shows `0–10 / 10–25 / 25–50 / 50+` only (no Rs. labels per cell).
   - Question: Confirm intentional, or should the Rs. amounts wrap to a second line on mobile?

### 5.C — Items list

9. **Items toolbar count "7 items · 3 quantity changes" (NEW_FIELD).**
   - Observed: The "3 quantity changes" segment implies the screen tracks how many rows have been edited vs. the original snapshot.
   - Question: Confirm "quantity changes" includes only quantity edits, or also: removals, deselections, both? When the count is 0, does the segment hide or render `0 quantity changes`?

10. **Select-all behavior (NEW_INTERACTION).**
    - Observed: Pill toggle shows `square-check-big` icon + "Select all".
    - Question: Does it toggle (Select all → Deselect all)? Does it skip out-of-stock rows? Does it reset removed rows?

11. **Items list grouping (CHANGED_INTERACTION + REMOVED_FIELD).**
    - Observed: Pencil renders one flat list; existing `ParcelBox` groups by sub-order with status pills.
    - Question: Confirm sub-order grouping is removed entirely from this screen. If yes, does the order-detail role lose the per-vendor breakdown forever, or does it migrate to a different screen / a collapsible disclosure?
    - Hypotheses: (a) Reorder screen is flat, parcel/status info disappears for buyers. (b) An expandable "View by vendor / parcel" toggle exists but isn't drawn. (c) Tracking moves to the storefront util-strip "Track order" link (separate screen).

12. **Per-row thumbnail (REMOVED_FIELD + VISUAL_ONLY).**
    - Observed: Pencil thumbs are always 64×64 (desktop) / 56×56 (mobile) paper-2 frames with a generic `package` lucide icon, no product image. Existing renders `next/image` from `item.product.imageUrl`.
    - Question: Is the icon thumbnail intentional (uniform "warehouse pallet" aesthetic) or a placeholder for a real product image? If intentional, should `next/image` be removed and `imageUrl` no longer fetched?

13. **Title with "Pack of N / Carton of N / Box of N" suffix (NEW_FIELD).**
    - Observed: Titles like `Sufi Cooking Oil 5 L · Pack of 4`, `Lipton Yellow Label 950 g · Carton of 6`, `Knorr Chicken Cubes · Box of 24`.
    - Question: Is the pack/carton/box label appended to the product name in storage, or is it derived from the new pack-pricing schema (per `02 Q12` answer)? Which historical pack does an existing `order_item` map to (the GET endpoint currently has no concept of packs)?

14. **Per-item weight eyebrow `21 KG · CARTON` (NEW_FIELD).**
    - Observed: `21 KG · CARTON` shown for `Sufi Oil 5 L · Pack of 4` (i.e. the *pack* weight, not the unit weight).
    - Question: Is this the **pack weight** (= `unitWeight × packSize` rounded) or the actual snapshot from a `weightPerPackGrams` field? Where does the unit-type noun (`CARTON / BAG / TIN / BOX`) come from — a new `products.unitType` enum?

15. **Per-unit price phrasing variations (COPY_CHANGE + NEW_FIELD).**
    - Observed: `Rs. 1,205 per unit`, `Rs. 1,490 per carton`, `Rs. 6,200 per bag`, `Rs. 7,600 per tin`, `Rs. 280 per box`, `Rs. 1,033 per carton`.
    - Question: Is the noun (`unit / carton / bag / tin / box`) tied to the same `unitType` field referenced in Q14, or a separate field? Confirm exhaustive list.

16. **Quantity stepper bounds (NEW_INTERACTION).**
    - Observed: Stepper has `−`, value, `+`. No min/max indicators drawn.
    - Question: Lower bound = 1 (with X to remove) or 0 (auto-removes at 0)? Upper bound = `products.stock`? Step size always 1?

17. **Per-row total recompute (CHANGED_INTERACTION).**
    - Observed: Pencil row shows `Rs. 4,820` (= 4 packs × `Rs. 1,205`). Existing reads the historical snapshot.
    - Question: Confirm row total is recomputed live from the **current** per-pack price (which might differ from the historical `unitPrice`)? Or from the historical `unitPrice × current quantity`? This has user-visible price-drift consequences.
    - Hypotheses: (a) Always current price. (b) Always historical snapshot. (c) Show both ("was Rs. X, now Rs. Y").

18. **Stock label states and threshold (NEW_FIELD + NEW_STATE).**
    - Observed: `in stock` (green-700), `low stock · 8 left` (amber), `out of stock` / `unavailable` (red).
    - Question: Where is the `low stock` threshold defined (the `8 left` is the actual remaining stock, but at what number does it switch from `in stock` to `low stock`)?
    - Hypotheses: (a) Hardcoded 10. (b) Per-product threshold field. (c) Percentage (e.g. "low stock when stock < daily-typical-velocity").

19. **Per-row remove X confirmation (NEW_INTERACTION).**
    - Observed: Bare X icon with no modal drawn.
    - Question: Confirm or not? Inline undo toast? Soft-delete (greyed but recoverable)?

20. **Out-of-stock row state (NEW_STATE + REMOVED_FIELD).**
    - Observed: Unchecked checkbox, red `out of stock` per-unit-price line, total `Rs. 0` ink-3, `unavailable` red label.
    - Question: Is the checkbox **disabled** for out-of-stock rows (cannot be selected) or just **default-off** (user can override)? Is the X still active (can the user remove the row)?

### 5.D — Receipt summary

21. **Receipt eyebrow `ORDER SUMMARY` vs. existing `🧾 Payment Summary` + displayId (COPY_CHANGE).**
    - Observed: Pencil drops the displayId from the receipt body and changes the label.
    - Question: Confirm `ORDER SUMMARY` is canonical and the order id is not needed in the receipt (already in the page eyebrow + breadcrumb).

22. **`6 items` row at top of receipt (NEW_FIELD, desktop only).**
    - Observed: Desktop receipt has a `6 items / Rs. 63,040` row; mobile receipt omits it.
    - Question: Is the count row truly desktop-only, or is the mobile omission a design oversight?

23. **`Subtotal` vs `Items Total` (COPY_CHANGE).**
    - Observed: Pencil says `Subtotal`; existing says `Items Total`.
    - Question: Confirm rename.

24. **`Delivery (10–25 kg)` label includes tier (COPY_CHANGE + NEW_FIELD).**
    - Observed: `Delivery (10–25 kg)` includes the active tier label inline.
    - Question: Is the tier label always shown, or hidden when not applicable (e.g. "Free delivery")?

25. **`GST 18%` row (NEW_FIELD).**
    - Observed: `GST 18% / Rs. 11,360` is a new line. No GST data exists.
    - Question: Is the rate always 18% (hardcoded constant), or per-region / per-vendor / configurable? Should historical orders also show GST (requires migration of past `orders` rows + a new `gstAmount` column)?

26. **Total label and removal of `COD Amount` framing (COPY_CHANGE + REMOVED_FIELD).**
    - Observed: Pencil says `Total / Rs. 74,580`; existing says `COD Amount to Collect`.
    - Question: Is COD framing removed because the reorder hasn't been placed yet (so "amount to collect" is premature)? Confirm the **new** order placed via the "Add to cart" → /checkout flow still records COD as the payment method (existing behavior).

27. **Wallet refund row removed (REMOVED_FIELD).**
    - Observed: Existing receipt has `Wallet Refund (Items not available)` row when sub-orders are cancelled. Pencil has no equivalent.
    - Question: Is the wallet-refund concept removed from this screen entirely (still shown elsewhere, e.g. a Wallet screen — `02 §6 Q10` flagged Wallet UI as missing), or is it gone for good?

### 5.E — Comparison panel

28. **Comparison panel desktop-only (REMOVED_FIELD on mobile).**
    - Observed: Desktop has `klOB3` "VS. ORIGINAL ORDER"; mobile has no equivalent.
    - Question: Confirm intentional desktop-only, or does mobile get a collapsed version above the receipt?

29. **Difference sign and color rule (NEW_FIELD + AMBIGUOUS).**
    - Observed: Difference shows `− Rs. 41,800` in green-700 (because reorder is cheaper than original).
    - Question: When the reorder is **more expensive** than the original (positive difference), what color and sign prefix is used?
    - Hypotheses: (a) Red text + `+ Rs. X` prefix. (b) Ink text + `+ Rs. X` (neutral). (c) Always green (the comparison is informative, not judgmental).

30. **Currency formatting `Rs. 1,16,380` (COPY_CHANGE).**
    - Observed: Comparison panel uses South-Asian digit grouping; rest of the screen uses Western grouping (`Rs. 4,820`).
    - Question: Per `02 Q17` answer, all should be South-Asian. Confirm this means even smaller numbers like `Rs. 4,820` are written with a comma (no special handling needed for ≤5 digits — South-Asian groups are right-most 3 then 2-by-2). Verify intended `toLocaleString('en-IN')` or a custom formatter.

### 5.F — CTAs

31. **Primary CTA label `Add 6 items to cart` (NEW_INTERACTION + COPY_CHANGE).**
    - Observed: Label includes a live count.
    - Question: Plural form when count is 1 (`Add 1 item to cart`)? Disabled state copy when 0 items selected (`Select items to continue`)?

32. **"Save as new list" feature (NEW_INTERACTION + NEW_FIELD).**
    - Observed: Secondary CTA with no schema, no list-management UI, no list-listing screen.
    - Question: Is this feature in scope for this revamp at all, or stubbed/disabled until a "Saved Lists" screen design exists?
    - Hypotheses: (a) Out-of-scope for now — render the button but disable / route to "coming soon". (b) In scope — design the schema + listing screen separately. (c) Remove the button.

33. **Delivery info pill content (NEW_FIELD).**
    - Observed: `MNP delivery to Gujranwala` + `Estimated 2–3 days · same MNP partner`.
    - Question: ETA range source? "same MNP partner" claim source? What is shown when the user has no default address or has changed cities since the original order?
    - Hypotheses: (a) Hardcoded "2–3 days". (b) Per-tier ETA. (c) Per-hub ETA. For "same MNP partner": (a) literal claim regardless. (b) Conditional on a stored `courierPartner` field (does not exist).

### 5.G — Mobile-only

34. **Mobile sticky bar omits secondary CTA + delivery pill (NEW_INTERACTION + AMBIGUOUS).**
    - Observed: Mobile bar has only `Total · 6 items` + `Add to cart`. No "Save as new list", no delivery info pill.
    - Question: Are those two items dropped on mobile entirely, accessed via an overflow menu, or rendered above the sticky bar in the scroll?

### 5.H — Removed-from-design but present-in-code

35. **Delivery address card removal (REMOVED_FIELD).**
    - Observed: Existing renders `shippingName / shippingAddress / shippingCity / shippingPhone`. Pencil omits.
    - Question: Is the historical shipping address truly not surfaced anywhere on this screen? If a user wants to verify which address the original order shipped to, where do they look?

36. **Per-parcel status pill + parcel grouping (REMOVED_FIELD).**
    - Observed: `📦 Parcel {n}` headers + `pending / packed / handed_to_courier / delivered / cancelled` colored pills are present in code, absent in Pencil.
    - Question: When the order is *in flight* (not yet delivered), where does the buyer see status? Storefront util-strip `Track order` link? A future shipping screen? Or are buyers no longer expected to track from here?

37. **Per-item Rate button + ReviewDrawer flow (REMOVED_FIELD + AMBIGUOUS).**
    - Observed: Existing has a `🌟 Rate` button per delivered/unreviewed item that opens a 5-star drawer. Pencil has no equivalent.
    - Question: Is the review feature deprecated, or moved to a different surface? `product_reviews` table + `POST /api/retailer/reviews` endpoint stay or are removed?
    - Hypotheses: (a) Reviews moved to a "Past orders" screen not yet designed. (b) Reviews moved into the PDP (each delivered customer sees a "Review this product" prompt). (c) Reviews deprecated; the feature is dropped.

38. **Cancellation visualization (REMOVED_FIELD + NEW_STATE).**
    - Observed: Existing renders cancelled sub-orders with red border + 50% opacity + line-through. Pencil only models per-item out-of-stock (different concept).
    - Question: Can sub-orders still be cancelled (vendor side) while the buyer is on this screen, and if so how does the user see that on the reorder UI?

### 5.I — Loading / error / empty / role pivot

39. **Loading state (NEW_STATE).**
    - Observed: Pencil draws no loading state. Existing shows a centred spinner with Roman-Urdu copy.
    - Question: Per `01 §7 Q14` and per the per-screen-state question — what does the loading state look like? Skeleton rows in the items list? Spinner in the page header area?

40. **Error state (NEW_STATE).**
    - Observed: Pencil draws no error state. Existing shows a red bordered card with Roman-Urdu copy.
    - Question: What does error look like? Per-section retry? Full-page retry?

41. **Empty state (NEW_STATE).**
    - Observed: Pencil draws no state for "this order has no items" (probably impossible) or "all items removed by the user".
    - Question: When the user removes the last item from the draft, what does the screen show — disabled CTA + a hint? An empty-state illustration?

42. **Role pivot — reorder vs. order-detail (AMBIGUOUS).**
    - Observed: Per `02 Q1` this single Pencil frame doubles as the order-detail view. But the frame is heavily skewed toward "edit + add to cart"; it carries no parcel status, no delivery progress, no review affordance.
    - Question: When a buyer has just placed an order today and wants to see "where is my parcel right now", do they:
    - Hypotheses: (a) Land on this same `/profile/orders/[id]` route (this Pencil frame) and have no in-screen tracking UI — they must go to a separate "Track order" screen. (b) The route renders a different layout depending on whether the order is in-flight vs. delivered (two states of the same screen, not designed). (c) The route renders this Pencil frame always, and tracking is a separate `/profile/orders/[id]/track` screen not in design scope yet.

### 5.J — Components flagged in §0

43. **Reorder line-item row is new (AMBIGUOUS).**
    - Observed: Cart has its own `cart-item-row`. Reorder needs a similar but distinct row (with checkbox, X, stock label, weight eyebrow, "in stock" / "low stock" / "out of stock" labels).
    - Question: Build a new `<ReorderLineItem>` component (screen-local), or extend `<CartLineItem>` with variants?

44. **Stock label as primitive vs. inline text (AMBIGUOUS).**
    - Observed: Inline text labels with one of three colors and one of three copy strings.
    - Question: Worth a new `<StockLabel>` atom in `@repo/ui`, or just inline text styling per row?

45. **Help / inline callout banner (AMBIGUOUS).**
    - Observed: Used here in amber. Same idiom probably needed in info / critical variants on Cart/Checkout.
    - Question: Build a generic `<Callout variant="info|warning|critical">` atom now or defer until needed elsewhere?

46. **Mobile sticky bottom bar (AMBIGUOUS).**
    - Observed: Cart and Checkout mobile also use a similar sticky bar.
    - Question: Build a shared `<StickyBottomBar>` primitive now, or compose inline per screen?

47. **Breadcrumb primitive (AMBIGUOUS).**
    - Observed: Used on Orders, Reorder, Settings, and admin/vendor surfaces per inventory.
    - Question: Add `<Breadcrumb>` to `@repo/ui` (shadcn has one — `npx shadcn@latest add breadcrumb` per the `04` log's component-add convention) before this revamp lands?

48. **Page header primitive (AMBIGUOUS).**
    - Observed: Used across many screens — eyebrow + title + description + (optional) actions row.
    - Question: Add a shared `<PageHeader>` molecule now or compose inline?

---

**File location:** `D:\Moeed 8th Sem\Fyp\Code\shalmi-web\.claude-revamp\screens\buyer-reorder\gap-analysis.md`

(End of Phase 4 gap analysis for Buyer · Reorder. Stopping per workflow — no implementation begins until §5 questions are resolved.)
