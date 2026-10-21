# Buyer · Checkout — Gap Analysis

> **Phase:** Per-screen gap analysis (read-only).
> **Date produced:** 2026-05-02.
> **Pencil source:** `Pencil-Design\Shalmi` — Desktop frame `S72tsk`, Mobile frame `OqB5X`.
> **Code source:** `apps/web/src/app/(storefront)/checkout/page.tsx`, `apps/web/src/modules/checkout/components/delivery-address-section/index.tsx`, `apps/web/src/modules/checkout/schemas/index.ts`, `packages/schemas/src/orders/checkout.ts`, `apps/web/src/app/api/checkout/route.ts`, `apps/web/src/app/(storefront)/checkout/success/page.tsx`.
> **Inputs read:** `01-codebase-map.md`, `02-design-inventory.md`, `03-token-migration.md`, `04-design-system-implementation-log.md`.
>
> Per CLAUDE.md, this artifact only describes gaps. **No implementation is proposed.** Every NEW_FIELD / REMOVED_FIELD / NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE / COPY_CHANGE / AMBIGUOUS row in §2 is also enumerated in §5 as an open question.

---

## 0. Pencil components used here that were not yet inventoried

The Pencil checkout uses the following compound elements that are **not** in `02-design-inventory.md §3` and have **not** been built in `04-design-system-implementation-log.md`. They are flagged here so the design-system list can be updated before implementation:

- **Step indicator (`stepIdx` / `mxStep`)** — top-of-page row showing checkout progress (`Cart › Checkout › Confirmation`), with the active step in `ink` 13/800 and other steps in `ink-3` 13/normal, separated by lucide `chevron-right` (`ink-4`). Mobile variant prepends a lucide `chevron-left` and uses 11px text. **Not in §3.**
- **Numbered section header (`sah`/`sih`/`sph` and `mxah`/`mxih`/`mxph`)** — eyebrow with two parts: a 2-digit `01`/`02`/`03` in `ink-3` mono 13/700 followed by an uppercase title in `ink` mono 13/700 with letter-spacing 1.4. **Not in §3.**
- **Saved-address card (`tITW7`/`yKOPa` desktop, `DKw5l`/`O7Qd9F` mobile)** — selectable card with a left-side radio glyph, name, optional `DEFAULT` tag (mono 9/700, `green-700` on `green-bg`, radius 3), phone (mono), and full street address (sans). Selected state = 2px `ink` border; unselected = 1.5px `rule-2`. **Not in §3.** (`02 §3.1` only describes inputs/buttons; no "selectable card / radio card" pattern.)
- **Outline secondary action (`BJSn9 newAddrBtn`)** — `+ Use a new address` outline button with 1.5px `ink-3` stroke, 6 radius, padding [10,16]. Distinct from the §3.1 "outline ink" variant (which uses `ink` stroke). **Not catalogued.**
- **Textarea (`K1U3S` / `q7VPQj`)** — multiline input, 120h desktop / 90h mobile, padding 14/12, `white` fill, 1.5px `rule-2` stroke, radius 6, `ink-4` placeholder. **No textarea primitive in `@repo/ui` and no Pencil spec for one in §3.**
- **Selectable payment-option card (`manJH`/`x2EwoJ`/`M23iH` desktop, `BFDSU`/`abKso`/`U8Uiom` mobile)** — radio card variants:
  - Selected (`po1`): `green-bg` fill, 2px `green-700` stroke, radius 10. Header row with banknote icon, "Cash on Delivery (COD)" title (sans 14/800), and a `RECOMMENDED` tag (mono 9/700, `green-700` on `white`, 1px `green-700` stroke). Caption underneath in `ink-2` sans 12.
  - Disabled / coming-soon (`po2`/`po3`): `white` fill, 1.5px `rule-2` stroke, **opacity 0.55**, lucide icon (`smartphone` / `credit-card`) + label + small "(coming soon)" note (desktop) or `soon` mono 9/700 tag (mobile). **Not catalogued.**
- **Order-summary card (`SOEpL` desktop, `DJEAP` mobile)** — `paper-2` fill, 1.5px `rule-2` stroke, radius 10/8, with `ORDER SUMMARY` eyebrow, an item list (40×40 white image tile + name + `QTY n` mono caption + line price mono 12/700), an `+ N more items` overflow line, breakdown rows (Subtotal / Delivery / GST), and a top-ruled TOTAL row. Conceptually overlaps with `02 §3.5 RECEIPT TOTALS` but adds an item-thumbnail list above the totals. **Item-list portion not catalogued.**
- **Place-order CTA (`she98`)** — full-width `green-2` button with lucide `lock` icon and "Place order" sans 15/700 label. Differs from the standard 40h primary green (`02 §3.1`) — this one is taller (51 desktop / 44 mobile) with a leading icon. **Not catalogued.**
- **Mobile sticky bottom bar (`JyHLi mxSticky`)** — `paper` fill, 1px `rule` top hairline, padding [12,16], left "TOTAL / Rs. 79,768" stack, right Place-order CTA. **Not catalogued.**
- **Secure-checkout reassurance (`i7i77 xSecure`)** — small inline pill: lucide `shield-check` icon + "Secure checkout · Order ID generated on confirm" mono 11. **Not catalogued.**

---

## 1. Layout & structure

### Desktop (`S72tsk`, 1440 × 1203)

Vertical stacking, top → bottom:

1. **Util strip** (`D1Fna`, h44) — chrome (help/track/hubs links + language toggle on the right).
2. **Header** (`tCdm9`, h80) — brand cluster, 44h search, account + cart actions.
3. **Subnav** (`o74ivy`, h40) — category links + "Pin a bazaar" pill.
4. **Step indicator** (`N48xQ stepIdx`, h44) — `Cart › Checkout › Confirmation`.
5. **Main two-column** (`hCgs2`, h729):
   - **Left column** (`o6t0O xLeft`, 948w, gap 24, vertical) — title `Checkout` (sans 30/800), then sections (1) Delivery Address, (2) Rider Instructions, (3) Payment.
   - **Right column** (`F3YHlB`, 380w) — Order Summary card → Place-order CTA → Secure-checkout note. The right column does not visually appear sticky in the static frame, but its placement at `y=12` matches the desktop "summary rail" pattern.
6. **Footer** (`XEszG`, h266) — ink-fill 4-column footer.

### Mobile (`OqB5X`, 420 × 984)

Single-column vertical stack with **sticky bottom action bar**:

1. App bar (`YWZqZ mxch`, h68) — brand + language toggle + account + cart.
2. Step row (`WoXnQ mxStep`, h38) — chevron-left back affordance + breadcrumb (`Cart › Checkout › Confirmation`).
3. Title (`Smunc mxTitle`, h44) — "Checkout" 24/800.
4. Section: Delivery Address (`B3khgq mxAddr`, h242).
5. Section: Rider Instructions (`Y3d1T mxInstr`, h129).
6. Section: Payment (`GjjJK mxPay`, h207).
7. Section: Order Summary (`WffEW mxSum`, h188) — `ORDER SUMMARY · 12 items` eyebrow + paper-2 receipt card (subtotal/delivery/GST/total). **Mobile summary omits the per-item thumbnail list** that appears on desktop.
8. **Sticky CTA bar** (`JyHLi mxSticky`, h68) — TOTAL / amount on left, Place-order CTA on right.

### Existing code layout (`apps/web/src/app/(storefront)/checkout/page.tsx`)

- `<div class="mx-auto max-w-7xl px-4 py-8">` → top "Back to Cart" ghost button + Page title `Checkout` (text-2xl bold).
- `<div class="grid gap-8 lg:grid-cols-3">`:
  - **Left** (`lg:col-span-2`): `DeliveryAddressSection` then a `Card` with **"Order Items (n)"** section that renders **all** line items inline with thumbnails + per-item subtotals.
  - **Right** (single column): sticky `Card.sticky.top-20` with Order Summary (Items + Shipping `TBD` + Total + amber "Cash on Delivery" notice + Place-order CTA labelled "Place Order (COD)").
- Mobile: same React tree, no sticky bottom bar; summary card stacks below the left column when the grid collapses.

### High-level layout deltas

- **NEW step indicator row** above the page title (`stepIdx`). Currently a `Back to Cart` ghost link.
- **NEW Rider Instructions section** (between address and payment).
- **NEW Payment-method selector section** (currently no UI selector; only COD copy in summary).
- **Order Items section is moved into the Order Summary card** as a compact preview list with `+ N more items` overflow on desktop, and **fully omitted** on mobile (summary keeps only count + totals). Today the items render as a separate left-column card with the full list visible at all times.
- **Order Summary now shows Subtotal / Delivery (weight-tiered) / GST 18% / Total**. Today the summary shows Items / Shipping `TBD` / Total only — there is no GST row, no delivery-tier line, and `totalShippingCost: 0` is hardcoded in `apps/web/src/app/api/checkout/route.ts:197`.
- **Mobile gains a sticky bottom bar** (`mxSticky`) with TOTAL + Place-order CTA. No sticky bar today.
- **Place-order CTA** is taller than the standard 40h button, has a leading lock icon, and reads `Place order` (no `(COD)` suffix). Today it reads `Place Order (COD)` in a standard primary button.
- **"Secure checkout · Order ID generated on confirm"** trust micro-line added below the CTA on desktop.
- **Title "Checkout"** bumps from `text-2xl` to sans 30/800 (desktop) / 24/800 (mobile).
- **No "Manage addresses" link** appears in the design (code has it in `delivery-address-section/index.tsx:45`).
- **No "Back to Cart" arrow button** in the design (replaced by step indicator + chevron-left on mobile).
- The address sub-section presents address cards with **a left-side radio glyph** instead of full-card press-to-select with a ring. The `DEFAULT` tag uses Pencil's mono pill.

---

## 2. Element-by-element diff

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| `D1Fna` util strip + `tCdm9` header + `o74ivy` subnav + `XEszG` footer | `(storefront)/layout.tsx` chrome (`StorefrontHeader` / `StorefrontFooter`) | Chrome differs across the site, not specific to checkout. Out of scope here — gaps tracked at the storefront-chrome screen. | VISUAL_ONLY |
| `N48xQ stepIdx` (`Cart › Checkout › Confirmation`, active = `Checkout`) | `Back to Cart` ghost button (`page.tsx:184-190`) | A 3-step progression indicator replaces the back-link. The active step is the current page; "Confirmation" implies post-place-order destination. | NEW_STATE |
| `WoXnQ mxStep` (mobile chevron-left + breadcrumb) | (no mobile-specific equivalent; `Back to Cart` link is desktop-styled) | Mobile gains a left-chevron tap target + the same breadcrumb sequence. | NEW_INTERACTION |
| Page title `Checkout` (sans 30/800 desktop, 24/800 mobile, `srfaW` / `Lq8dM`) | `<h1 class="text-2xl font-bold">Checkout</h1>` (`page.tsx:191`) | Size and weight increase; copy unchanged. | VISUAL_ONLY |
| `01 DELIVERY ADDRESS` eyebrow (`sah` / `mxah`) | `<MapPin/> Delivery Address` heading (`delivery-address-section/index.tsx:42-44`) | Eyebrow style changes from icon + sentence-case heading to numbered uppercase mono eyebrow. Numbering ties section into stepIdx. | COPY_CHANGE |
| Saved-address card with radio (`tITW7`/`yKOPa` and `DKw5l`/`O7Qd9F`) — radio glyph + name + optional `DEFAULT` tag + phone (mono) + full address; selected = 2px ink stroke, unselected = 1.5px rule-2. | Full-press button card with primary-tinted ring on selection (`delivery-address-section/index.tsx:62-87`). Currently shows `title`, `Default` tag, `recipientName · recipientPhone`, `address, city`. | Visual treatment changes (radio-led, no fill on select). Field set is the same; **but mobile detail card omits phone** (only name + city short label visible in `H33GM7` for `mxac2`). | CHANGED_INTERACTION |
| Address card `DEFAULT` tag (`y5HXWd ac1Tag` / `IXwYl mxac1Tag`) | `Default` pill in code (`delivery-address-section/index.tsx:74-78`) | Pill style changes (mono 9/700, `green-700` on `green-bg`, 3 radius). Copy DEFAULT vs Default. | COPY_CHANGE |
| `BJSn9 newAddrBtn` "+ Use a new address" (outline ink-3 1.5px, padding [10,16]) | `Use a different address` outline button (`delivery-address-section/index.tsx:88-98`) | Copy: "Use a new address" vs "Use a different address". Style: leading `+` lucide icon + ink-3 outline. | COPY_CHANGE |
| `02 RIDER INSTRUCTIONS` eyebrow + textarea `K1U3S`/`q7VPQj` (placeholder "e.g. Call before arrival, leave with the shopkeeper next door…", h120 desktop / h90 mobile) | (no rider-instructions UI; not present in `delivery-address-section` or `page.tsx`) | Brand-new free-text field for delivery instructions. Placeholder text is design copy. | NEW_FIELD |
| `03 PAYMENT` eyebrow + 3 selectable payment-option cards (`manJH` COD selected, `x2EwoJ` JazzCash/EasyPaisa coming-soon disabled, `M23iH` Bank transfer/Card coming-soon disabled). Selected = `green-bg` fill + 2px `green-700` border + filled radio + banknote icon + bold title + `RECOMMENDED` tag + caption. Disabled = `white` fill + 1.5px `rule-2` + opacity 0.55. | (no UI; only an amber `<strong>Cash on Delivery</strong> — Pay when your order arrives.` notice in summary, `page.tsx:276-278`) | Brand-new payment-method selector. Currently codebase is COD-only with no choice surface; design exposes 3 options of which 2 are visibly disabled with "(coming soon)" copy. Backend accepts no `paymentMethod` field today. | NEW_FIELD |
| COD payment option `manJH po1` — title "Cash on Delivery (COD)" + caption "Pay the rider in cash on delivery. No advance payment required." + "RECOMMENDED" tag | Summary inline notice "Cash on Delivery — Pay when your order arrives." (`page.tsx:276-278`) | Copy expands and moves out of summary into a labeled selectable card. "RECOMMENDED" is a new badge concept. | COPY_CHANGE |
| Disabled payment options copy `JazzCash / EasyPaisa (coming soon)` and `Bank transfer / Card (coming soon)` (mobile uses `soon` mono pill instead of "(coming soon)") | (none) | New disabled-state copy. Confirms which methods are eventually planned but unconfirmed timing. | NEW_FIELD |
| Order Summary card (`SOEpL` / `DJEAP`) — `paper-2` receipt card with `ORDER SUMMARY` eyebrow (mobile adds `· 12 items`); compact item list (3 rows + `+ N more items` overflow) — desktop only; Subtotal / Delivery (10–25 kg) / GST 18% rows; top-ruled TOTAL row | `<Card sticky top-20>` with `Order Summary` heading, Items (n) row, Shipping `TBD` row (green text), Total row (`page.tsx:253-274`). Item list is a separate card on the left (`page.tsx:204-250`). | Visual surface (paper-2 receipt vs white card), section title typography, item-list moved into summary on desktop (and dropped on mobile), and content rows differ — see following rows. | CHANGED_INTERACTION |
| `Subtotal` row (`zHHRR`) showing `Rs. 67,420` | `Items (n)` row showing `formatPrice(totalPrice)` | Label changes; same value source (cart subtotal). Currency formatter must produce `Rs. ` prefix per design and South-Asian digit grouping (per `02 §7 Q17`). | COPY_CHANGE |
| `Delivery (10–25 kg)` row (`Mpriq`) showing `Rs. 180` — references the weight-tier system | `Shipping` row showing static `TBD` (green) (`page.tsx:265-268`) | Replaces `TBD` placeholder with a computed delivery line whose value depends on basket weight tier (per `02 §3.4 Weight gauge` and `02 §6` "Weight gauge on cart, reorder, and possibly checkout"). API today hardcodes `totalShippingCost: 0` (`api/checkout/route.ts:197`) and `subOrders.shippingFeeCustomer: 0` (`api/checkout/route.ts:218`). | NEW_FIELD |
| `GST 18%` row (`r9weK1`) showing `Rs. 12,168` | (no tax row) | Brand-new tax line. Today neither `orders` nor `sub_orders` schema exposes a tax field; `grandTotal = totalItemsCost` (`api/checkout/route.ts:198`). | NEW_FIELD |
| Top-ruled `TOTAL` row (`g7y0nO`) — mono 14/700 label + mono 18/800 amount | Bottom-ruled `Total` row (`page.tsx:271-274`) — sans semibold | Style change (mono numerics, eyebrow-style `TOTAL` label) and value semantics change (now includes delivery + GST). | COPY_CHANGE |
| Compact item list inside summary (`Y9a9cq xItemList`) — 40×40 white tile (placeholder lucide `package` glyph, no real product image), name (sans 12/700), `QTY n` mono caption, line price mono 12/700 — visible 3 rows + `+ N more items` overflow | Full inline list with real `next/image` thumbnails, name + `qty × unitPrice` caption, and line subtotal (`page.tsx:209-247`) | List moves from a separate card into the summary, image style changes (placeholder square instead of product photo — see Q17), caption shape changes (`QTY n` instead of `n × unitPrice`), and overflow truncates to 3 visible rows. | CHANGED_INTERACTION |
| Place-order CTA `she98` — green-2 fill, 51h, full-width, lucide `lock` icon + "Place order" sans 15/700 | `<Button size="lg" class="mt-4 w-full">` with text "Place Order (COD)" or loading spinner + "Placing Order..." (`page.tsx:280-294`) | Copy ("Place order" no COD suffix), height (≈51h vs `lg=h-12`), and a leading `lock` icon. Loading state behavior unspecified in design. | COPY_CHANGE |
| Mobile sticky CTA bar `JyHLi mxSticky` — TOTAL eyebrow + amount on left, Place-order CTA on right (44h) | (no sticky bar; CTA scrolls with summary card) | Brand-new mobile pattern. | NEW_INTERACTION |
| Trust micro-line `i7i77 xSecure` — lucide `shield-check` + "Secure checkout · Order ID generated on confirm" mono 11 (desktop only — no equivalent on mobile in the frame) | (none) | New microcopy; reassurance about order ID timing. | NEW_FIELD |
| `Manage addresses` link (top-right of address card) | `<Link>Manage addresses</Link>` (`delivery-address-section/index.tsx:45-50`) | Design omits this affordance. Could be intentional removal (saved addresses are managed elsewhere) or an oversight. | REMOVED_FIELD |
| Manual shipping form fallback (Name / Phone / Address / City inputs that appear when "Use a different address" is toggled) — `delivery-address-section/index.tsx:119-176` and `apps/web/src/modules/checkout/schemas/index.ts checkoutShippingFormSchema` | (no inline manual form) | Design's `+ Use a new address` button does **not** show fields inline; behavior is implied (e.g., open the address dialog, navigate elsewhere). The 4-field manual form currently shipping has no Pencil counterpart. | REMOVED_FIELD |
| Auth-required redirect (`!session?.user → /auth?redirect=/checkout`, `page.tsx:90-96`) | (same in design — implicit; no visual treatment) | Behavior preserved. | VISUAL_ONLY |
| Empty-cart guard (`items.length === 0 → /cart`, `page.tsx:98-102`) | (same; not visualized) | Behavior preserved. | VISUAL_ONLY |
| Loading spinner during session-load / submit (`Loader2`, `page.tsx:166-180, 286-289`) | (no Pencil loading frames) | Component states for the page are not drawn — consistent with `02 §7 Q7` (states not in Pencil; re-derive from tokens). | AMBIGUOUS |
| Toast errors (`toast.error('Please select a delivery address')`, `page.tsx:107`, `page.tsx:138, 147, 159`) | (no Pencil error frames) | Error/feedback states are not drawn. | AMBIGUOUS |

---

## 3. Schema / type implications

### 3.1 Step indicator state

- **No persisted state.** The 3 steps are visual only (`Cart` is the previous page, `Checkout` is the current page, `Confirmation` is the post-success page). No new schema/type is required if "Confirmation" maps to `apps/web/src/app/(storefront)/checkout/success/page.tsx`. The active step is implied by the route.
- However, **the design treats "Cart" as a clickable step** (it is rendered in `ink-3` like a previous link). If the step indicator should also be a navigation control (click "Cart" → go back), no schema change is needed but a routing decision is — see Q1.

### 3.2 Rider instructions payload

- **NEW field** with no current support:
  - `apps/web/src/modules/checkout/schemas/index.ts` (`checkoutShippingFormSchema`) does not include rider notes.
  - `packages/schemas/src/orders/checkout.ts` (`shippingAddressSchema`, `checkoutCartPayloadSchema`) does not include rider notes.
  - `apps/web/src/app/api/checkout/route.ts` does not read or persist any rider-notes value.
  - Drizzle `orders` table (per `01 §5`) has shipping snapshot fields (name/phone/address/city) but no `riderNotes` / `instructions` / `deliveryNote` column.
  - Drizzle `sub_orders` table has no equivalent column either.
- A schema migration would be needed (column on `orders` or `sub_orders` — see Q3), plus extension of `checkoutCartPayloadSchema` and the manual form schema.

### 3.3 Payment selector vs current COD-only flow

- **NEW field** with no current support:
  - `checkoutCartPayloadSchema` does not have a `paymentMethod` field.
  - `apps/web/src/app/api/checkout/route.ts` writes `subOrders.codAmount = itemsTotal` unconditionally (`route.ts:217`); the field name presumes COD.
  - `orders` table has no `paymentMethod` column (per `01 §5`).
- For the current pass, only COD is selectable and the other two are visually disabled. A naive implementation (hardcode COD on submit) would not require a schema change immediately — but the design's selector implies a future enum (`cod`, `jazzcash_easypaisa`, `bank_transfer_card`). See Q4 for whether to add the column now (with a single allowed value) or defer.

### 3.4 Delivery / shipping fee (weight-tiered)

- The design shows `Delivery (10–25 kg) Rs. 180`, sourced from the weight-tier system (per `02 §3.4`).
- Schema:
  - `products.weightGrams` exists (`01 §5`) and is already summed into `subOrders.weightGrams` in `route.ts:171, 207`.
  - `subOrders.shippingFeeCustomer`, `subOrders.coolieFeeReimbursement`, `subOrders.courierCost`, `subOrders.platformCommission` exist as fields (per `route.ts:218-221`) but are written as `0`.
  - `orders.totalShippingCost` exists (`route.ts:197`) but is written as `0`.
- A weight-tier table or constants file is needed to compute the tier rate (10–25 kg → Rs. 180, etc., per `02 §3.4` "0–10 kg / Rs. 280, 10–25 kg / Rs. 180, 25–50 kg / Rs. 120, 50+ kg / Rs. 80"). This is a **policy/config**, not necessarily a new DB table — see Q5.

### 3.5 GST tax line

- **NEW field**:
  - No `gstAmount` / `taxCents` column on `orders` or `sub_orders`.
  - No tax computation in `apps/web/src/app/api/checkout/route.ts`.
  - Per design, GST is **18%** of (subtotal? subtotal+delivery? — value `Rs. 12,168` in design ≈ 18% of `Rs. 67,420` subtotal, not of subtotal+delivery). See Q6 for the rule.
- A schema migration adds `taxCents` (or similar) to `orders`, plus computation in the route handler. `grandTotal = totalItemsCost + totalShippingCost + tax`.

### 3.6 Order summary item list (compact)

- No schema change. Display-only: derive `name`, `quantity`, line price from existing `useCartStore` + `resolvePrice`.
- The `40×40` placeholder image tile (`GUckg`) shows a generic `package` icon, **not** the product image. See Q17.

### 3.7 Address card minimum displayed fields (mobile vs desktop)

- Desktop card (`tITW7`) shows: name, DEFAULT tag, phone, full address.
- Mobile non-selected card (`O7Qd9F`) shows: name, short city only ("Industrial Estate, Kamoki"), no phone. Design implies a truncated representation. See Q2 for whether this is a state difference (selected = expanded, unselected = collapsed) or a content-presence difference.

---

## 4. Behavior implications

### 4.1 Step indicator as navigation

- If `Cart` step is interactive, a click handler on `IW4jz` (mobile equivalent `mGY9k`) would push to `/cart`. No new endpoint. Just a `<Link>` instead of plain text. — depends on Q1.

### 4.2 Rider instructions

- Add a controlled textarea to the React form (likely a new field on `checkoutShippingFormSchema` or a parallel state).
- Plumb through `POST /api/checkout` payload (`checkoutCartPayloadSchema` → handler → `orders` / `sub_orders` insert).
- No new endpoint; `POST /api/checkout` payload shape changes.

### 4.3 Payment selector

- The right-column layout has the CTA outside the form, so submission needs to know the chosen `paymentMethod`. If only COD is selectable in this pass, the radio group is presentational and the payload still defaults to COD. If we send `paymentMethod` to the server, `checkoutCartPayloadSchema` and the `route.ts` handler both change. — depends on Q4.
- Disabled options (`po2`/`po3`) need either a `disabled` attribute or simply opacity-and-non-interactive treatment (matching the design's `opacity: 0.55`). No backend impact.

### 4.4 POST /api/checkout payload shape

Today (`route.ts:54` parses `checkoutCartPayloadSchema`):
```
{ items: [{productId, quantity}], addressId? | shippingAddress? }
```
Design implies:
```
{
  items, addressId? | shippingAddress?,
  riderNotes?: string,            // §3.2 + Q3
  paymentMethod: 'cod' | …,       // §3.3 + Q4
  // server computes:
  //   shippingFeeCents: by weight tier (§3.4 + Q5)
  //   taxCents: 18% of (subtotal | subtotal+shipping) (§3.5 + Q6)
  //   grandTotal: subtotal + shipping + tax
}
```
- Per CLAUDE.md hard rule 2 ("never silently change existing behavior"), **the change to compute non-zero shipping and tax in the existing handler is a behavior change** that requires explicit confirmation before implementation.

### 4.5 Order-Items review is moved into the summary card (desktop)

- Currently the items render in their own left-column card (`page.tsx:204-250`). Design moves them into the right-column summary card with a 3-row preview + "+ N more items".
- Behavior: scrolling/expansion of the truncated list is undefined. Possible behaviors: pure non-interactive truncation, or click → expand, or click → scroll-to-cart. See Q7.

### 4.6 Mobile sticky CTA

- Sticky positioning + safe-area handling on mobile. No backend change.
- The summary card on mobile no longer contains the CTA — `xPlace` lives in the sticky bar (`czDUl`). Behavior on submit is the same as desktop.

### 4.7 Address card radio interaction

- The current code uses a full-card button toggle (`delivery-address-section/index.tsx:62`). Design uses a left-side radio glyph. The interaction model is still single-select; this is a presentation refactor. The "Use a new address" outline button is preserved, but the **inline manual form** that currently appears below has no design counterpart — see Q8.

### 4.8 "Use a new address" outcome

- Design shows the button but not what happens on click. Plausible outcomes:
  - Open the existing `AddressDialog` from `apps/web/src/modules/user-addresses/components/address-dialog/`.
  - Navigate to `/profile/addresses`.
  - Reveal an inline form (today's behavior).
- See Q8.

### 4.9 Loading / error / empty states

- Current page has explicit loading guards (`page.tsx:166-180`) and toast errors. Design draws none. Per `02 §7 Q7` (states re-derived from tokens), state styling exists at primitive level but page-level states are not framed.

---

## 5. Open questions for me

Numbered. Every actionable category row in §2 maps to at least one entry below.

### Step indicator

1. **Step indicator copy and behavior** (`N48xQ stepIdx`, `WoXnQ mxStep`).
   - **Observed in design:** A 3-step row reading `Cart › Checkout › Confirmation`, with `Checkout` bold-active, others inactive. Mobile prepends a `chevron-left`.
   - **Observed in code:** A `Back to Cart` ghost button (`page.tsx:184-190`).
   - **Question:** Should each step be clickable (acting as breadcrumb navigation), and what does the mobile chevron-left target — the previous step (`Cart`), browser back, or always `/cart`?
   - **Plausible answers:** (a) Display-only step row, mobile chevron always → `/cart`. (b) Each step is a `<Link>` (Cart → `/cart`, Confirmation → not yet a route). (c) Only `Cart` is navigable; chevron mirrors that link.
**Answer:** Display-only step row; mobile chevron always navigates to `/cart`. Smallest delta.

### Address section

2. **Mobile address-card field set** (`mxac1` vs `mxac2`).
   - **Observed in design:** Selected/primary mobile card shows name + DEFAULT tag + phone + full address. Unselected mobile card (`mxac2`) shows only name + a short locality label ("Industrial Estate, Kamoki") — no phone, no full address.
   - **Observed in code:** Both selected and unselected cards always show the full field set.
   - **Question:** Is the unselected mobile card intentionally collapsed (state-driven), or is it a layout abbreviation in the static frame?
   - **Plausible answers:** (a) Collapse unselected cards to name + city; expand on select. (b) Always show all fields; the design omitted them for visual brevity. (c) Collapse only on small viewports.
**Answer:** Always show all fields; design omitted for visual brevity.

3. **Rider-instructions persistence target.**
   - **Observed in design:** A textarea labelled `02 RIDER INSTRUCTIONS` with placeholder "e.g. Call before arrival, leave with the shopkeeper next door…". h120 desktop, h90 mobile, no character counter drawn.
   - **Observed in code:** No field exists in `checkoutShippingFormSchema`, `checkoutCartPayloadSchema`, `orders` table, or `sub_orders` table.
   - **Question:** Where should the value be persisted, and does it need validation (max length, optional vs required)?
   - **Plausible answers:** (a) New `orders.riderNotes` text column (one note per parent order). (b) New `sub_orders.riderNotes` (per-vendor copy of the same note). (c) Optional `text` column on `orders` with a max length (e.g., 500 chars), nullable.
**Answer:** Optional `text` column on `orders.riderNotes` with max 500 chars, nullable. Smallest additive — one column, parent-order-level.

### Payment

4. **Payment method enum scope and persistence.**
   - **Observed in design:** Three option cards. Only COD (`po1`) is enabled and pre-selected; `po2 (JazzCash / EasyPaisa)` and `po3 (Bank transfer / Card)` are visually disabled with "(coming soon)" copy.
   - **Observed in code:** `checkoutCartPayloadSchema` has no `paymentMethod`; `orders` and `sub_orders` have no payment-method column. The handler writes `subOrders.codAmount = itemsTotal` unconditionally.
   - **Question:** Should we add a `paymentMethod` enum/column now (with the disabled options enumerated for forward compatibility), or only when those methods become functional?
   - **Plausible answers:** (a) Add `orders.paymentMethod enum('cod', 'mobile_wallet', 'card_or_bank')` defaulting to `'cod'`; only `'cod'` is accepted by the schema until others ship. (b) Defer — keep COD-only behavior, render the radio purely as UI without sending it. (c) Add a free-form `paymentMethod text` and validate at the schema layer.
**Answer:** DEFERRED — see 06-scope-cut.md feature: Payment methods feature. Do not implement this question's scope. UI placeholder: Checkout payment selector renders 3 disabled cards with "Coming soon" labels (already drawn that way). Account drawer "Payment methods" row hidden or static "Cash on delivery". No table.

5. **Delivery (shipping) tier source.**
   - **Observed in design:** `Delivery (10–25 kg) Rs. 180` row computed from basket weight, matching the four-tier scale documented in `02 §3.4` (0–10 / 10–25 / 25–50 / 50+ kg → Rs. 280 / 180 / 120 / 80).
   - **Observed in code:** `apps/web/src/app/api/checkout/route.ts:197` writes `totalShippingCost: 0` and `subOrders.shippingFeeCustomer: 0` (`route.ts:218`); no tier table or constant exists.
   - **Question:** Where should the tier rates live, and is the rate per-order (one rate per total basket weight) or per-vendor sub-order (each sub-order weighed separately)?
   - **Plausible answers:** (a) Hardcoded constant in `packages/constants` (or `apps/web/src/modules/checkout`), per-order based on summed basket weight. (b) Hardcoded constant, per sub-order (each vendor parcel charges its own delivery — matches existing `subOrders.shippingFeeCustomer` field shape). (c) New `delivery_tiers` Drizzle table seeded with the four ranges; admin-editable later.
**Answer:** STUBBED — see 06-scope-cut.md feature: Weight gauge + delivery tier table. Implement with placeholder: Weight gauge hidden on cart/reorder; checkout shipping line stays "Calculated at checkout" / `Rs. 0`. Add `// TODO(post-v1):` comment at every touch point.

6. **GST 18% computation base.**
   - **Observed in design:** `GST 18% Rs. 12,168`. With `Subtotal Rs. 67,420` and `Delivery Rs. 180`, 18% × 67,420 = 12,135.60 (close to 12,168 — rounding off-by-a-few). 18% × (67,420 + 180) = 12,168.0 — **exact match.** So the design's tax base appears to be subtotal + delivery, but the row is still labelled `GST 18%`.
   - **Observed in code:** No tax field; no computation.
   - **Question:** Is GST 18% applied to (subtotal) or (subtotal + delivery), and where on the schema does it live?
   - **Plausible answers:** (a) `taxCents = round(0.18 × (subtotal + delivery))`, persisted on `orders.taxCents`. (b) `taxCents = round(0.18 × subtotal)`, persisted on `orders.taxCents`. (c) Per-vendor tax on `sub_orders.taxCents` (matches per-vendor financial breakdown that already exists for `coolieFeeReimbursement` / `platformCommission`).
**Answer:** DEFERRED — see 06-scope-cut.md feature: GST 18% on orders. Do not implement this question's scope. UI placeholder: GST row hidden across receipts. Total = subtotal + delivery only.

### Order summary

7. **Items overflow behavior (`+ N more items`).**
   - **Observed in design:** Desktop summary shows 3 line items + a `+ 9 more items` ghost line (`p3GWs xi4`). Mobile omits the item list entirely.
   - **Observed in code:** Items render as a separate full list on desktop; on mobile they stack below the summary.
   - **Question:** Does `+ N more items` expand inline on click, link to the cart, or stay non-interactive?
   - **Plausible answers:** (a) Non-interactive truncation; the user must navigate back to `/cart` to see all items. (b) Click expands to show all items inside the summary card. (c) Click scrolls to a separate detailed list elsewhere on the page.
**Answer:** Non-interactive truncation; user navigates back to `/cart` to see all.

8. **"+ Use a new address" target.**
   - **Observed in design:** A button with leading `+` icon. No inline form is drawn beneath it; the next visible section is `02 RIDER INSTRUCTIONS`.
   - **Observed in code:** Clicking `Use a different address` (`delivery-address-section/index.tsx:88-98`) reveals an inline 4-input manual form (Name, Phone, Address, City) under the address list.
   - **Question:** Should the button open an `AddressDialog` (matching `/profile/addresses` behavior), navigate to `/profile/addresses`, or keep the inline form?
   - **Plausible answers:** (a) Open the existing `AddressDialog`; on save, the new address is added to the saved list and auto-selected. (b) Navigate to `/profile/addresses`. (c) Preserve the inline manual form (status quo).
**Answer:** Open existing `AddressDialog` (`apps/web/src/modules/user-addresses/components/address-dialog/`); on save, address is added + auto-selected.

### Removed elements

9. **`Manage addresses` link removal.**
   - **Observed in design:** No "Manage addresses" affordance on the address card.
   - **Observed in code:** `<Link>Manage addresses</Link>` in the top-right of `DeliveryAddressSection` (`delivery-address-section/index.tsx:45-50`).
   - **Question:** Is the omission intentional (address management lives entirely behind `+ Use a new address`), or accidental?
   - **Plausible answers:** (a) Intentional removal — `+ Use a new address` (Q8) covers the same need. (b) Accidental — re-add a small text link. (c) Move to a profile entry point only.
**Answer:** Intentional removal — `+ Use a new address` (Q8) covers the same need.

10. **Manual shipping form removal.**
    - **Observed in design:** No 4-input manual form (Name / Phone / Address / City) is drawn at any point in the checkout flow.
    - **Observed in code:** `apps/web/src/modules/checkout/schemas/index.ts checkoutShippingFormSchema` and the corresponding form fields (`delivery-address-section/index.tsx:119-176`) implement a manual entry path. This path is what the API consumes when `payloadShippingAddress` is provided (`api/checkout/route.ts:82-89`).
    - **Question:** Is the manual-form path being removed entirely (saved addresses only), or relocated (e.g., into the dialog from Q8)?
    - **Plausible answers:** (a) Remove the manual path; require a saved address. `checkoutCartPayloadSchema` becomes `addressId`-only. (b) Move the manual form into the new-address dialog; payload semantics unchanged. (c) Keep both paths but hide the manual form behind a dialog from the checkout screen.
**Answer:** Move manual form into the new-address dialog (per Q8); checkout flow only takes `addressId`. Existing `checkoutShippingFormSchema` becomes part of the dialog's create flow.

### Copy changes

11. **`DEFAULT` (uppercase mono) vs `Default` (sentence-case sans).**
    - **Observed in design:** `DEFAULT` mono 9/700, `green-700` on `green-bg`, radius 3 pill.
    - **Observed in code:** `Default` text in a `bg-primary/10 text-primary` pill (`delivery-address-section/index.tsx:74-78`).
    - **Question:** Is this a global system change (every "Default" / status pill becomes mono uppercase) or only on this card?
    - **Plausible answers:** (a) Global — adopt the Pencil "stamp" / mono pill style for every "Default", "Active", "Featured" tag. (b) Local to address cards. (c) Reuse the existing primitive `Stamp` component built in `04-design-system-implementation-log.md` with a `success` variant.
**Answer:** Reuse existing `Stamp` primitive (`packages/ui/src/components/stamp.tsx`) with a `success` intent variant. No new primitive.

12. **Eyebrow style for the three sections.**
    - **Observed in design:** Numbered eyebrow (`01 DELIVERY ADDRESS`) in JetBrains Mono 13/700 with letter-spacing 1.4.
    - **Observed in code:** Sentence-case heading with leading icon (`<MapPin/> Delivery Address`).
    - **Question:** Is the numbered-mono eyebrow universal for all multi-section forms in the revamp, or only for checkout?
    - **Plausible answers:** (a) Checkout-only pattern. (b) Universal pattern for any "step-style" layout. (c) Reuse the new section-header element across forms but make numbering optional.
**Answer:** Checkout-only pattern — keep numbered-mono eyebrow scoped to checkout for now.

13. **CTA copy `Place order` vs `Place Order (COD)`.**
    - **Observed in design:** "Place order" (sentence case) with leading lock icon, no payment-method suffix.
    - **Observed in code:** `Place Order (COD)` (title case + suffix).
    - **Question:** Do we drop the `(COD)` suffix because the payment method now lives in its own section above, and is sentence-case the new convention for all CTAs?
    - **Plausible answers:** (a) Yes — drop the suffix; sentence-case is the new standard for CTA copy. (b) Keep title case for primary CTAs; only this one becomes "Place order". (c) Drop the suffix only when the payment selector is functional; keep "(COD)" while it's the only option.
**Answer:** Drop suffix; sentence-case is the new standard.

14. **`Subtotal` vs `Items (n)` row label.**
    - **Observed in design:** `Subtotal` (no item count beside it; mobile shows `· 12 items` only in the eyebrow `O73nrx`).
    - **Observed in code:** `Items (n)` (with count).
    - **Question:** Move count to the eyebrow (matching mobile design), or keep it inline?
    - **Plausible answers:** (a) Drop count; rename to "Subtotal". (b) Drop count from row; add `· N items` to the `ORDER SUMMARY` eyebrow on both desktop and mobile (matches mobile design). (c) Keep inline `Subtotal (N items)`.
**Answer:** Drop count from row; add `· N items` to the `ORDER SUMMARY` eyebrow (matches mobile design).

15. **`Use a new address` vs `Use a different address`.**
    - **Observed in design:** "Use a new address".
    - **Observed in code:** "Use a different address".
    - **Question:** Is this intentional copy refinement or incidental?
    - **Plausible answers:** (a) Adopt new copy verbatim. (b) Keep current copy. (c) Use a different phrasing entirely (e.g., "Add new address").
**Answer:** Adopt new copy verbatim.

### New states / interactions

16. **Disabled payment-option treatment.**
    - **Observed in design:** Whole card at opacity 0.55 with "(coming soon)" copy (desktop) or `soon` mono pill (mobile). Radio glyph still drawn but unfilled.
    - **Observed in code:** No equivalent.
    - **Question:** Should the disabled cards be DOM-disabled (non-interactive, `aria-disabled`), or interactive-but-toast ("Coming soon — please choose another method")? Should hover/focus states still apply?
    - **Plausible answers:** (a) `aria-disabled` + non-interactive; hover/focus suppressed; cursor `not-allowed`. (b) Interactive with a toast on click. (c) Hidden entirely until those methods ship (defeats the design intent).
**Answer:** `aria-disabled` + non-interactive; cursor `not-allowed`; hover/focus suppressed.

17. **Order-summary item-list image source.**
    - **Observed in design:** A 40×40 white tile with a generic lucide `package` glyph and an `ink-4` stroke — clearly **not** the product image.
    - **Observed in code:** Real `next/image` thumbnails using `item.image.url` (`page.tsx:218-225`).
    - **Question:** Is the `package` glyph the intended consistent treatment in the summary list (independent of whether a product image exists), or is it a stand-in placeholder for the static frame and the actual product image should appear?
    - **Plausible answers:** (a) Always use the placeholder glyph — the summary is intentionally textual / receipt-like. (b) Use the product image when available; fall back to the glyph. (c) Use a smaller version of the product image with a `paper-2` background ring.
**Answer:** Use product image when available; fall back to lucide `package` glyph.

### Ambiguous

18. **Page-level loading state.**
    - **Observed in design:** No loading frame.
    - **Observed in code:** Centered `Loader2` spinner (`page.tsx:166-180`) before mount/session resolves.
    - **Question:** Use the new shadcn-derived `Spinner` primitive? Replace with a skeleton matching the layout? Inherit from Phase 3 primitive states?
    - **Plausible answers:** (a) Keep the centered spinner using `@repo/ui/components/spinner`. (b) Render a skeleton mirroring the section layout. (c) Defer — leave page-level loading unchanged this revamp.
**Answer:** Keep centered `Spinner` from `@repo/ui/components/spinner`.

19. **Submission loading state on the CTA.**
    - **Observed in design:** No frame for "submitting".
    - **Observed in code:** CTA swaps to `<Loader2/> Placing Order...`.
    - **Question:** Keep the in-button spinner + "Placing order…" copy, or use the new primitive's `disabled`-with-spinner pattern from §5.4 of `03-token-migration.md`?
    - **Plausible answers:** (a) Keep current behavior verbatim. (b) Disable the button + show inline spinner without copy change. (c) Show a sticky loading bar over the page.
**Answer:** Keep current behavior verbatim (in-button spinner + "Placing order…").

20. **Error feedback (selection / submission).**
    - **Observed in design:** No error frames.
    - **Observed in code:** Sonner `toast.error` (`page.tsx:107, 138, 147, 159`).
    - **Question:** Continue with toasts, or render inline `red`-tinted helper text under the relevant section per Pencil error-state derivation in §5.4 of `03-token-migration.md`?
    - **Plausible answers:** (a) Toasts only (current). (b) Inline section-level errors only. (c) Both — toast for network errors, inline for validation.
**Answer:** Both — Sonner toast for network errors, inline section-level errors for validation.

---

**File written to:** `D:\Moeed 8th Sem\Fyp\Code\shalmi-web\.claude-revamp\screens\buyer-checkout\gap-analysis.md`

(End of Buyer · Checkout gap analysis. Stopping here per instructions — not starting implementation.)

Answers propagated on 2026-05-02 from 06-scope-cut.md + 07-default-proposals.md
