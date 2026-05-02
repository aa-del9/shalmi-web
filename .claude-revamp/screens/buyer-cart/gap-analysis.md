# Buyer · Cart — Gap Analysis

> **Phase:** Per-screen gap analysis (read-only).
> **Date produced:** 2026-05-02.
> **Pencil source:** `Pencil-Design\Shalmi` — Desktop `g3oOM7` / Mobile `lSn3n`. Reuses `05 Components → WEIGHT GAUGE` (`LA21g`) and `RECEIPT TOTALS` (`olYUW`).
> **Existing code:**
> - Route: `/cart` → `apps/web/src/app/(storefront)/cart/page.tsx` (CC).
> - Components: `apps/web/src/modules/cart/components/{cart-item-row,cart-summary,quantity-selector}/index.tsx`.
> - Store: `apps/web/src/modules/cart/stores/cart-store.ts` (Zustand + persist).
> - Helpers: `apps/web/src/modules/cart/utils/resolve-price.ts`.
> - Types: `apps/web/src/modules/cart/types.ts`.

---

## Pencil components needed but NOT covered by `02-design-inventory.md` / `04-design-system-implementation-log.md`

Flagged before producing the diff (per workflow rule). Two compound elements appear on the cart screen and have **not** been built yet:

- **Weight Gauge** (Pencil §3.4, node `LA21g`; on-screen instances `rnCT6` desktop + `s5yyU9` mobile). Captured in 02 §3.4 as a known compound, **not** built in Phase 3 (04 listed under "Atoms intentionally NOT added in this phase"). Implementation deferred to cart revamp.
- **Receipt Totals** (Pencil §3.5, node `olYUW`; on-screen instances `PetUj` desktop + `aDBD9` mobile). Same status as above — captured in 02 §3.5, deferred in 04.
- **Mobile Sticky Bottom Bar** (`AKOjb`). Mentioned in 02 §3.9 only for the *vendor* mobile bottom-tab-bar; **the buyer cart sticky bar is a different organism**: TOTAL eyebrow + amount on the left, full-width green CTA on the right. Not enumerated in 02 §3 component catalog. → **Open Q12** (below).
- **"Help-tip" amber pill** (`zRw0V`, "Add 6.5 kg more to drop to next tier — save Rs. 60"). A new contextual nudge attached to the gauge. Not in 02 §3 catalog. → **Open Q11** (below).

Everything else on the screen reuses primitives already covered (Stamp not used here; Button used; surfaces use Card-like styling but with custom shells per Pencil's receipt-card spec).

---

## 1. Layout & structure

### Desktop (`g3oOM7`, 1440 × 1448)

Top-down stack:

1. **Util strip** (`adSxN`, 1440 × 44, full-bleed). Help / Track order / MNP delivery hubs links left, language toggle right.
2. **Header** (`o8UXs`, 1440 × 80). Brand cluster (logo + wordmark + "Wholesale" subtitle), search field 922w (`GPgu7`), right-side cluster (account button, lang segmented, cart button with green dot).
3. **Subnav** (`v3lYaZ`, 1440 × 40). Category links left + small mono "EN · اردو …" cluster right.
4. **Main grid** (`gd5Yx`, 1440 × 1018, padded 40px each side). **Two columns**:
   - Left column (`wWiXo`, 948w):
     - `c52B4K` — `cartHead`: title "Your cart · 12 items" left + "Clear cart" with trash icon right (`space_between`, 24-bottom gap).
     - `rnCT6` — **Weight Gauge card** (white fill, radius 10, padding 20). Top row "CART WEIGHT / 18.5 kg" + 22h fill bar + 4-column tier legend + amber help-tip ("Add 6.5 kg more …").
     - `nmgKb` — Cart line item list. **7 line items**, each 96h with bottom 1px hairline rule; no separator component, the rule is part of the row.
   - Right column (`JYngs`, 380w):
     - `PetUj` — **Receipt Totals card** (paper-2 fill, radius 10, 1.5px rule-2, padding 20). "ORDER SUMMARY" eyebrow → Subtotal / Delivery (10–25 kg tier) / GST 18% → Total (top hairline above).
     - `A3uckC` — green "Proceed to checkout" CTA (full-width, 51h, arrow icon).
     - `eqqJe` — "Free delivery on orders over Rs. 50,000" hint with truck icon (centered, mono caption).
5. **Footer** (`MIwVZ`, 1440 × 266).

### Mobile (`lSn3n`, 420 × 912)

Top-down stack:

1. **Mobile chrome** (`I7t3K`, 420 × 68). Brand cluster left + lang toggle / account / cart icons right. **No search field** in the cart-screen mobile chrome (search lives on Home).
2. **Page header** (`dmvjo`, 420 × 56). `chevron-left` back icon + "Your cart · 12" title (no clear-cart action visible).
3. **Weight Gauge wrap** (`Qt7Dv`, 420 × 142). Same gauge card, scaled — `s5yyU9` (white, radius 10, padding 14): "CART WEIGHT / 18.5 kg" + 18h bar + 4-column legend. **No amber help-tip** on mobile.
4. **Cart list** (`P9Xn4e`, 420 × 414). **4 line items** (each 92h white card, radius 8, 1px rule, 12 padding). Different shape from desktop rows: 56×56 image, title, single-line eyebrow ("NESTLE · 1.008 KG"), then a bottom row with quantity selector and **line total** (no per-pack price, no remove icon visible).
5. **Receipt Totals card** (`aDBD9`, 420 × 164). Same content as desktop, no amber tip.
6. **Sticky bottom bar** (`AKOjb`, 420 × 68, paper fill + top hairline). TOTAL eyebrow + Rs. 79,768 left; green-2 "Checkout →" 44h button right.

### Existing code structure

`apps/web/src/app/(storefront)/cart/page.tsx`:
- Single `<div className="mx-auto max-w-7xl px-4 py-8">` container.
- Heading row: `h1 "Shopping Cart"` + `Clear Cart` ghost button (no icon).
- **Empty state branch**: ShoppingCart icon + "Your cart is empty" h2 + paragraph + "Continue Shopping" Button → `/`.
- **Non-empty branch**: 3-col grid (`lg:grid-cols-3`); left `lg:col-span-2` is `divide-y` of `CartItemRow`s + `Separator` + "Continue Shopping" outline Button. Right column is `CartSummary`.
- `CartSummary`: heading "Order Summary" → "Items (N) · Subtotal" / "Shipping · Calculated at checkout" → divider → "Subtotal · total" → "Proceed to Checkout" Button (auth-gated via `useSession` + `openAuthModal`).
- No mobile-specific layout; relies on responsive grid collapse.

### Top-level layout differences

| | Pencil | Existing |
|---|---|---|
| Container width | 1360 (1440 − 2×40) | `max-w-7xl` (1280) |
| Column ratio | 948 / 380 = ~71/29 (5+2 of a notional 7 grid) | `col-span-2` / `col-span-1` = 67/33 of a 3-col grid |
| Section ordering (desktop) | head → gauge → items / summary → CTA → tip | head → items → divider → continue / summary |
| Weight gauge | Above the line-item list | Absent |
| Empty state | Not drawn | Rich (icon + h2 + p + CTA) |
| "Continue shopping" CTA below items | Not drawn | Present |
| Mobile sticky bottom bar | Yes (TOTAL + Checkout) | No (responsive collapse only) |
| Mobile gauge position | Between header and item list | n/a |
| Free-delivery hint | Yes (desktop, under CTA) | No |
| Inline tier-aware delivery copy | "Delivery (10–25 kg tier)" | "Calculated at checkout" |
| GST line | Yes ("GST 18%") | No |

---

## 2. Element-by-element diff

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| **Page chrome** — util strip + header (logo+search+actions) + subnav | `(storefront)/layout.tsx` → `StorefrontHeader` (single header row, no util strip, no separate subnav) | Out of scope for the cart screen file itself; chrome belongs to layout revamp. Flagged for awareness only. | (out-of-scope) |
| **Mobile chrome** — `I7t3K` (brand + lang + acct + cart) | Same `StorefrontHeader` rendered responsively | Same — out of scope here. | (out-of-scope) |
| `c52B4K` cartHead → "Your cart · 12 items" (sans 30/800 ink + mono 14 ink-3) | `<h1>Shopping Cart</h1>` (text-2xl=24, font-bold) + no count | Title copy changes; item count appended in mono after a "·"; size changes 24→30. | COPY_CHANGE |
| `eYF6u` clearCart → trash-2 icon (14, ink-3) + "Clear cart" sans 13 ink-3 | `<Button variant="ghost" size="sm">Clear Cart</Button>` (no icon) | Adds icon; case change "Clear Cart" → "Clear cart"; styling shifts to inline icon+text in `ink-3` rather than ghost button. | VISUAL_ONLY (icon add is borderline COPY/VISUAL — flagged as COPY_CHANGE in §5 Q3) |
| `rnCT6` Weight Gauge card (top row + bar + 4-tier legend) | (none) | Entirely new compound. Requires `cartTotalWeightGrams` + tier resolution + active-tier highlight. | NEW_FIELD + NEW_INTERACTION |
| `zRw0V` amber help-tip ("Add 6.5 kg more to drop to next tier — save Rs. 60") | (none) | New contextual nudge; requires "delta-to-next-tier" calc + "savings" calc in shipping cost. Desktop only. | NEW_FIELD + NEW_INTERACTION |
| Cart line `cl1Img` — 64×64 paper-2 placeholder with package icon | `Link` wrapping 80–96px `Image` (with bg-muted placeholder showing "No image") | Smaller (64 vs 80–96); placeholder uses lucide `package` icon centered on paper-2 instead of "No image" text. Image is **not** a link in Pencil. | VISUAL_ONLY + CHANGED_INTERACTION (link-on-image removed) |
| Cart line title — "KitKat 2-Finger Carton (48 × 21g)" sans 14/700 ink, **fixed-width**, not styled as link | `<Link>` styled `text-sm font-medium hover:underline` to `/products/[slug]` | Pencil draws plain text, no hover/underline; existing makes it a PDP link. Pack info is part of the *name string* in the design ("48 × 21g") — implies catalog snapshot includes pack metadata in display name, OR title is composed at render time. | CHANGED_INTERACTION + AMBIGUOUS |
| Cart line eyebrow — "NESTLE · 1.008 KG · 12 PACK" mono 10/700 ink-3 letter-spacing 1.1 | `<p>` "10g · Rs. 100/pc" (text-xs, ink/3 equivalent) | Eyebrow shows **vendor name + total weight + pack count**; existing shows weight + per-pc price. Per-pc price moves out of caption to its own field on the desktop row. | NEW_FIELD (vendor name in cart line) + REMOVED_FIELD (per-pc in caption) + COPY_CHANGE |
| Cart line `cl1Qty` — single bordered frame (radius 6, 1.5px rule-2) holding `[ − ] [ 2 ] [ + ]` (no input box) | `QuantitySelector`: three separate elements — outline icon Button (-) + typeable Input (h-8 w-14) + outline icon Button (+) | Pencil shows a single segmented control with a static numeric cell — **no typeable input**. Existing supports keyboard editing. | CHANGED_INTERACTION |
| Cart line per-pack price — "Rs. 1,140" mono 13/normal ink-3 (right-aligned, w90) — desktop only | (per-pc price embedded in caption) | New independently positioned price column (per-pack/per-unit); mobile omits it entirely. | NEW_FIELD (or REPOSITIONED — see §5 Q5) |
| Cart line total — "Rs. 2,280" mono 15/800 ink (right-aligned, w100) | `<p>` line total "{formatPrice(lineTotal)}" text-sm font-semibold | Same field, restyled to mono 15/800. | VISUAL_ONLY |
| Cart line remove — `x` lucide 16 ink-3 in 32×32 hit area (desktop only) | `Button variant="ghost" size="icon"` with `Trash2` size-4 in `text-destructive` | Icon glyph changes (`x` vs `trash-2`); color changes (ink-3 vs red). **Mobile cart row has no remove control drawn.** | VISUAL_ONLY + AMBIGUOUS (mobile remove behavior) |
| Cart line bottom border (1px rule, no separator component) | `divide-y` on parent | Same effect, different mechanism. | VISUAL_ONLY |
| Mobile line eyebrow — "NESTLE · 1.008 KG" mono 9/700 (no "PACK" segment) | n/a | Mobile drops the pack-count segment; copy is shorter. | COPY_CHANGE |
| Mobile line bottom row `dxTYN` — quantity selector (28h) + line total only | n/a | Per-pack price omitted on mobile; remove control omitted; quantity selector smaller. | NEW_STATE (mobile-specific layout) + REMOVED_FIELD (mobile per-pack + remove) |
| `PetUj` ORDER SUMMARY card — paper-2 fill, mono labels, eyebrow | `CartSummary` — bg-muted/50, sans labels, h2 "Order Summary" | Surface tone changes (cream paper-2 vs muted), typography moves to mono, heading downgrades to mono eyebrow. | VISUAL_ONLY |
| Summary row — "Subtotal" + Rs. 67,420 | "Items (N)" Rs. value + "Subtotal" Rs. value (two rows) | Pencil collapses to a single Subtotal row; "Items (N)" line is removed. | REMOVED_FIELD + COPY_CHANGE |
| Summary row — "Delivery (10–25 kg tier)" + Rs. 180 | "Shipping" + "Calculated at checkout" (placeholder) | Cart now resolves the delivery cost inline with active-tier copy. Requires backend or config-driven tier resolution. | NEW_FIELD + NEW_INTERACTION |
| Summary row — "GST 18%" + Rs. 12,168 | (none) | New tax line. Needs rate (config? schema?) and computed off subtotal. | NEW_FIELD |
| Summary total — "TOTAL · Rs. 79,768" with top 1.5px rule-2 | "Subtotal · total" with top separator | Label changes "Subtotal" → "TOTAL" (uppercase mono); value now includes Delivery + GST. | COPY_CHANGE + CHANGED_INTERACTION (computation) |
| `A3uckC` checkout CTA — green-2 fill, "Proceed to checkout" + arrow-right icon, full-width 51h | `<Button size="lg">Proceed to Checkout</Button>` with auth-gate (opens AuthModal if signed out) | Adds trailing arrow icon; capitalizes differently ("checkout" vs "Checkout"); **Pencil does not draw an auth-gate state.** | COPY_CHANGE + AMBIGUOUS (auth gating not depicted) |
| `eqqJe` free-delivery hint — truck icon (green-700) + "Free delivery on orders over Rs. 50,000" | (none) | New marketing/informational caption beneath the CTA. Implies a free-delivery threshold rule that may interact with the gauge tiers. | NEW_FIELD |
| Mobile sticky bottom bar `AKOjb` — TOTAL eyebrow + amount + green Checkout button | (none — no mobile sticky on this page) | New mobile organism; pins Checkout to viewport. | NEW_INTERACTION + NEW_STATE |
| Empty state | (not drawn in Pencil) | ShoppingCart icon + "Your cart is empty" + paragraph + "Continue Shopping" Button | Pencil omits — intentional removal or just not drawn? | AMBIGUOUS |
| "Continue Shopping" CTA below item list | (not drawn in Pencil) | Outline Button → "/" | Pencil omits — intentional removal? | AMBIGUOUS |
| Loading / skeleton state for cart load | (not drawn) | Cart is local Zustand+persist (no fetch); loading not currently needed. | (not applicable) |
| Auth-required state on checkout CTA | (not drawn) | `useSession` → `openAuthModal(CHECKOUT)` if signed out | Behavior present in code, not depicted in Pencil. Don't change silently. | AMBIGUOUS |

---

## 3. Schema / type implications

For every NEW_FIELD or REMOVED_FIELD above:

### NEW: Cart total weight in kg + active delivery tier

- **Computed**, not stored. Sum of `qty × weightGrams` across `cartStore.items`. Existing `CartItem` already carries `weightGrams: number` (`apps/web/src/modules/cart/types.ts:17`).
- **Tier table needs to live somewhere.** Pencil shows four tiers (`0–10 kg / Rs. 280`, `10–25 / Rs. 180`, `25–50 / Rs. 120`, `50+ / Rs. 80`). Options (each becomes a question):
  - Hardcode in a `delivery-tiers.ts` constants file under `modules/cart/utils/`.
  - New DB table `delivery_tiers (id, minKg, maxKg, costCents)`.
  - Inline in app config / env.
- **Tier resolution helper** (parallel to `resolvePrice`): `resolveDeliveryTier(totalWeightGrams) → { minKg, maxKg|null, costCents, label }`.
- **No DB migration needed for cart-side state** (Zustand-only); migration only required if tiers move to DB. Note: when an order ultimately ships, `sub_orders` already has `weightGrams` and per-suborder shipping cost ints (`packages/database/src/schema/sub-orders.ts`) — but the cart screen never persists, so this is purely client-derived.

### NEW: GST 18% line

- Computed: `Math.round(subtotal * 0.18)`.
- Rate (`0.18`) needs a home — same options as tier table (constant vs env vs DB).
- No existing GST field anywhere in the codebase (grep confirms `tax`/`gst` absent from `packages/database/src/schema/`, `packages/schemas/`, and `modules/cart/`).
- Order-side: `orders.totalItemsCost / totalShippingCost / grandTotal` exist (`packages/database/src/schema/orders.ts`); a `taxCents` (or `gstCents`) field would be needed when checkout writes the order, otherwise grandTotal won't reconcile with what the cart showed.

### NEW: Vendor name in cart line eyebrow ("NESTLE · …")

- `CartItem` carries `vendorId` but **not vendor name** (`apps/web/src/modules/cart/types.ts`).
- Two implementations possible (each becomes a question):
  - Snapshot vendor name into the cart at add-time (extend `CartItemInput` and the persisted store shape — note `cart-store.ts` uses `persist` with key `'shalmi-cart'`, so existing localStorage entries would need a migration path).
  - Fetch vendor names at render time (new query → new API endpoint, since `/api/admin/vendors` is admin-only and doesn't expose names publicly).

### NEW: Pack metadata (count + per-pack weight) shown as "12 PACK" / "1.008 KG"

- Pencil's "12 PACK" implies the catalog knows the pack-units count.
- Per **02 §7 Q12 answer**, the schema is moving from `product_price_tiers (minQty, maxQty, priceCents)` to a **pack-based** model. That work is the surface noted in `.claude-revamp/features/pack-pricing/surface-map.md`.
- Until that schema lands, the cart cannot show pack count without inventing a value. Whether the cart displays the pack count today, after, or only after pack-pricing ships is **Open Q1** below.
- "1.008 KG" appears to be `weightGrams / 1000`, formatted to 3 decimals — derivable from existing `weightGrams`. (But verify whether this is *per pack* or *per unit × qty* — the values in the design (12 PACK, 1.008 KG) imply per-pack weight ≈ 84g × 12 = 1.008 kg, i.e. the pack's gross weight, not per-unit.) See **Open Q4**.

### REMOVED: "Items (N)" subtotal-prefix row

- Pencil removes the `Items (N)` row from the order summary. If intentional, no schema change; just delete from `CartSummary`. If unintentional, leave. → **Open Q9**.

### REMOVED: "Continue Shopping" CTA + empty state

- Both currently exist in `cart/page.tsx`. Pencil draws neither. No schema impact; pure UX questions → **Open Q14**, **Open Q15**.

### REMOVED (mobile only): Per-pack price + remove icon on mobile cart row

- Behavioral, not schema. The mobile row drops both, leaving qty change as the only mutation path. → **Open Q7** (remove on mobile).

---

## 4. Behavior implications

For every NEW_INTERACTION, CHANGED_INTERACTION, NEW_STATE:

### Cart-store shape changes

`apps/web/src/modules/cart/stores/cart-store.ts` currently exposes:

```
items, addItem, removeItem, updateQuantity, clearCart
+ getCartTotalItems(items), getCartTotalPrice(items)
```

Pencil's UI introduces three new derived quantities and one threshold:

| Derived | Source |
|---|---|
| `getCartTotalWeightGrams(items)` | sum(qty × weightGrams) |
| `resolveDeliveryTier(totalWeightGrams)` | tier table → `{ rangeLabel, costCents }` |
| `getCartGstCents(subtotalCents, rate)` | round(sub × rate) |
| `getCartGrandTotal(items)` | subtotal + delivery + gst |
| `freeDeliveryThresholdCents` | `5_000_000` (Rs. 50,000) — drives the hint copy |

These can all live as exported pure functions alongside existing `getCartTotalItems / getCartTotalPrice`; no `persist` schema migration is required (state shape unchanged) **unless** vendor name (Q2) or pack metadata (Q1) move into `CartItem`.

### "Add X kg more to drop to next tier — save Rs. Y" amber help-tip

- Computes: nextTier = tier where `tier.minKg > currentKg`; if exists, delta = `nextTier.minKg − currentKg`, savings = `currentTier.cost − nextTier.cost`.
- Edge cases not depicted by Pencil (each becomes a question): cart at the cheapest tier (50+ kg) → hide the tip? cart in the cheapest tier with savings already maxed? cart at exactly the boundary? See **Open Q11**.

### Quantity selector replacement (CHANGED_INTERACTION)

- Existing `QuantitySelector` accepts typed input (`<Input type="text" inputMode="numeric">` with onBlur/Enter commit). Pencil removes the input cell entirely → only `−` and `+` buttons + a static numeric label.
- Either (a) keep the typeable input behind a different visual treatment, (b) drop typeability entirely (matches Pencil literally), (c) ship a new variant. → **Open Q5**.

### Auth gating on checkout CTA

- Existing: `CartSummary` calls `openAuthModal(ABSOLUTE_ROUTES.CHECKOUT)` if `!session?.user`.
- Pencil draws the button unconditionally as a green CTA with an arrow, no auth-gate state, no spinner. Two interpretations: (a) keep the existing gate behavior verbatim (no visual change beyond styling), (b) drop the gate and let `/checkout` redirect (which it already does at the page level). → **Open Q13**.

### Mobile sticky bottom bar

- Adds a fixed-position element pinning TOTAL + Checkout button to the viewport on viewports below the desktop breakpoint. Behavior questions (each → question):
  - Does it always show, or only when scrolled past the inline summary card? → **Open Q12a**.
  - Does it replace the in-flow `Proceed to checkout` button on mobile, or co-exist with it? → **Open Q12b**.
  - Body padding-bottom needed to avoid the bar covering the last cart row.

### Image is no longer a link to PDP

- Existing `cart-item-row` wraps the image and the title in `<Link href="/products/[slug]">`. Pencil's image is plain (no link affordance) and the title is rendered as plain text. Removing PDP navigation from the cart row is a behavior change. → **Open Q6**.

### "12 items" item-count in title

- Header copy "Your cart · 12 items" exposes the cart count next to the title. Computed from `getCartTotalItems`. Pure derived; no API/data change. (Mobile shows `· 12` without the "items" word — see Q3.)

### Free-delivery hint computation

- "Free delivery on orders over Rs. 50,000" implies a threshold gate. Two behaviors possible (each → question):
  - Static marketing copy; no computation, never updates. (Implementation cheapest.)
  - Live: when `subtotal ≥ 50,000`, the Delivery row in the receipt zeros out and the gauge / amber-tip suppress themselves. → **Open Q10**.

### Removal of empty state and "Continue Shopping" CTA

- If empty state is intentionally removed, the page must still handle `items.length === 0` somehow (else it renders gauge-with-0kg, empty list, summary-with-Rs.0 — which is functional but odd). → **Open Q14**.
- If "Continue Shopping" is intentionally removed, no behavior to wire; just delete. → **Open Q15**.

### Page chrome — out of scope for cart screen

- The `(storefront)/layout.tsx` shell will be redone in a later pass (storefront chrome); the cart-screen revamp itself does not own the util strip / header / subnav.

### API endpoints affected

- **No new endpoint is strictly required** for the cart screen itself, because the cart is local-only (Zustand+persist) and computes everything client-side from `CartItem.weightGrams + priceTiers + vendorId`.
- **Indirectly affected**: if checkout must reconcile delivery + GST with what the cart displayed, then `POST /api/checkout` (`apps/web/src/app/api/checkout/route.ts`) needs to write `totalShippingCost`, plus a new `taxCents` (or equivalent) into `orders` so the order detail later matches. Out of scope for this gap analysis but flagged.
- If vendor-name snapshotting (Q2) or pack-metadata exposure (Q1) is rejected in favor of a fetch, a new public endpoint is needed (e.g. `GET /api/cart/hydrate?productIds=…`).

---

## 5. Open questions for me

> Each row in §2 with category NEW_FIELD / REMOVED_FIELD / NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE / COPY_CHANGE / AMBIGUOUS becomes a question below. Some are merged where the resolution is shared.

---

**Q1 — Pack count display "12 PACK"** *(NEW_FIELD; eyebrow on cart line)*

- **Observed (design):** Cart line eyebrow reads "NESTLE · 1.008 KG · 12 PACK".
- **Observed (code):** `CartItem` does not carry pack count; `products` table has `weightGrams` only; pack-pricing schema work is in motion per `02 §7 Q12` and surface-mapped at `.claude-revamp/features/pack-pricing/`.
- **Question:** Should the cart screen wait for the pack-pricing schema to land before showing "12 PACK" (so the value comes from the new `pack` model), or should it display a placeholder (e.g. omit "· 12 PACK") in the interim?
- **Plausible answers:**
  - (a) Hold the cart revamp on this surface until pack-pricing ships; eyebrow shows "VENDOR · WEIGHT" only until then.
  - (b) Add the "PACK" segment now; cart consumes a (yet-to-be-added) `packUnits` field that pack-pricing will provide.
  - (c) Drop "PACK" from the design — vendor + weight is enough.

---

**Q2 — Vendor name on cart line** *(NEW_FIELD)*

- **Observed (design):** "NESTLE · 1.008 KG · 12 PACK" — vendor name is the leading mono eyebrow.
- **Observed (code):** `CartItem` (`apps/web/src/modules/cart/types.ts:17`) carries `vendorId` only; no `vendorName`. No public endpoint returns vendor name today (`/api/admin/vendors` is admin-only).
- **Question:** Where should vendor name come from?
- **Plausible answers:**
  - (a) Snapshot at add-time: extend `CartItemInput` + `CartItem` with `vendorName: string` (requires updating every call site that adds to the cart, plus a `persist` migration for existing localStorage entries keyed `'shalmi-cart'`).
  - (b) Fetch at render time: new public endpoint that returns name+id pairs for a list of productIds.
  - (c) Drop vendor name from the cart eyebrow; show only weight/pack info.

---

**Q3 — Title copy + item count** *(COPY_CHANGE)*

- **Observed (design):** "Your cart · 12 items" (desktop) / "Your cart · 12" (mobile) at sans 30/800 ink.
- **Observed (code):** `<h1>Shopping Cart</h1>` (text-2xl font-bold) with no count.
- **Question:** Adopt "Your cart" copy verbatim? And are the desktop/mobile renderings (`· 12 items` vs `· 12`) intentional?
- **Plausible answers:**
  - (a) Adopt verbatim; keep the desktop/mobile difference (mobile drops the word "items" for space).
  - (b) Adopt "Your cart" but show item count consistently across breakpoints.
  - (c) Keep "Shopping Cart" title; just append the count.

---

**Q4 — Weight display "1.008 KG"** *(NEW_FIELD; AMBIGUOUS)*

- **Observed (design):** Eyebrow reads "1.008 KG". The example product is "KitKat 2-Finger Carton (48 × 21g)" — a single pack.
- **Observed (code):** `CartItem.weightGrams` is the *per-product* weight as configured on `products.weightGrams`.
- **Question:** Does this number represent the per-pack/per-unit catalog weight (as currently stored), or the total weight of this line in the cart (qty × weight)?
- **Plausible answers:**
  - (a) Per-pack/unit weight as configured (just `weightGrams / 1000` formatted).
  - (b) Line total weight (qty × weightGrams / 1000).
  - (c) Per individual unit inside the pack (i.e. 21g shown as 0.021 kg) — unlikely given the value `1.008 KG` matches 48 × 21g.

---

**Q5 — Quantity selector behavior on cart row** *(CHANGED_INTERACTION)*

- **Observed (design):** Single segmented control `[ − | 2 | + ]` (radius 6, 1.5px rule-2 stroke). The `2` cell shows static text — no input box.
- **Observed (code):** `QuantitySelector` is three separate elements with a typeable `<Input>` (commits onBlur/Enter; only digits accepted).
- **Question:** Drop typeable input entirely (Pencil-literal), keep typeable input behind the new visual treatment, or ship two variants?
- **Plausible answers:**
  - (a) Pencil-literal: drop typing; +/- only.
  - (b) Keep typing (existing affordance) but restyle to single segmented frame; the "2" cell becomes the editable input.
  - (c) Pencil-literal on cart row but keep typeable variant elsewhere (PDP, vendor product form).

---

**Q6 — PDP linking from cart row image/title** *(CHANGED_INTERACTION)*

- **Observed (design):** Image is a plain placeholder; title is plain text; no link affordance drawn.
- **Observed (code):** Both image and title are `<Link href="/products/[slug]">`.
- **Question:** Remove PDP navigation from the cart row, or keep the link but drop the visual underline/hover?
- **Plausible answers:**
  - (a) Remove entirely — cart is a transactional surface, navigating away is a back-button trip.
  - (b) Keep link, drop underline/hover styling so the affordance is invisible (per Pencil).
  - (c) Keep link only on title, not image.

---

**Q7 — Mobile cart row: missing per-pack price and remove icon** *(REMOVED_FIELD; mobile only)*

- **Observed (design):** Mobile line `dxTYN` shows quantity selector + line total only. No per-pack price column. No `x` remove icon (the desktop `hUM66` 32×32 hit area is absent).
- **Observed (code):** `cart-item-row` renders price + total + Trash button at every breakpoint.
- **Question:** On mobile, how does the user remove an item — qty −1 to zero (the existing `updateQuantity(qty=0)` pathway already removes), a long-press, a swipe gesture, or is the missing icon an oversight?
- **Plausible answers:**
  - (a) Removal happens by tapping `−` until qty=0 (existing store already supports this).
  - (b) Add a swipe-to-delete gesture (new interaction not drawn in Pencil).
  - (c) Pencil simply forgot to draw the icon; keep the explicit remove icon on mobile too.

---

**Q8 — `Clear cart` action on mobile** *(REMOVED_FIELD or AMBIGUOUS)*

- **Observed (design):** Mobile `dmvjo` header shows back-arrow + title only — no "Clear cart" affordance anywhere on the mobile cart screen.
- **Observed (code):** `clearCart` is exposed and triggered by the desktop "Clear Cart" button; would need a mobile entry point.
- **Question:** Drop the clear-cart action on mobile entirely, or surface it elsewhere (e.g. in the account drawer, a confirm dialog from the back arrow, an overflow menu)?
- **Plausible answers:**
  - (a) Mobile has no clear-cart affordance — intentional; users remove items individually.
  - (b) Add an overflow menu (`…`) in the mobile header.
  - (c) Pencil oversight; add a "Clear cart" link below the item list.

---

**Q9 — "Items (N)" line removed from order summary** *(REMOVED_FIELD)*

- **Observed (design):** Receipt `PetUj` shows Subtotal / Delivery / GST / Total — no "Items (N)" prefix row.
- **Observed (code):** `CartSummary` shows "Items (N)" on a separate line above Subtotal.
- **Question:** Remove the items-count line entirely, or fold it elsewhere (e.g. into the title "· 12 items")?
- **Plausible answers:**
  - (a) Remove; the title-bar `· 12 items` already conveys the count.
  - (b) Keep; add it back as a Pencil oversight.
  - (c) Move it to a less-prominent position (e.g. caption under TOTAL).

---

**Q10 — "Free delivery on orders over Rs. 50,000"** *(NEW_FIELD; AMBIGUOUS — static or live?)*

- **Observed (design):** Static caption with truck icon under the checkout CTA on desktop. Mobile does not show it.
- **Observed (code):** No threshold logic exists.
- **Question:** Is this static marketing copy, or a real threshold that, when crossed, zeros out the Delivery line and suppresses the gauge / amber-tip?
- **Plausible answers:**
  - (a) Static copy; no computation. Threshold and copy live in a constants file.
  - (b) Live: when `subtotal ≥ 50,000`, set delivery to zero in the receipt; relabel to "Delivery (free over Rs. 50,000)"; gauge stays informational only.
  - (c) Live but only suppresses the amber tip when the threshold is reached, not the delivery cost.

---

**Q11 — Amber help-tip behavior across edge cases** *(NEW_INTERACTION)*

- **Observed (design):** "Add 6.5 kg more to drop to next tier — save Rs. 60" — amber-bg pill with info icon. Drawn only on the desktop gauge.
- **Observed (code):** No tip exists.
- **Question:** What does the tip show / hide when:
  - Cart is empty (0 kg)?
  - Cart is in the cheapest tier (50+ kg)?
  - Cart sits exactly at a tier boundary (e.g. exactly 25 kg)?
  - On mobile (the gauge is drawn, but the tip is not).
- **Plausible answers:**
  - (a) Hide the tip whenever there's no next-cheaper tier; otherwise compute delta + savings; mobile never shows it.
  - (b) Always show; default to "Cheapest tier reached" copy when at 50+ kg.
  - (c) Show on both breakpoints (Pencil oversight on mobile).

---

**Q12 — Mobile sticky bottom bar behavior** *(NEW_INTERACTION + NEW_STATE)*

- **Observed (design):** `AKOjb` — paper fill, top hairline, TOTAL eyebrow + Rs. amount left, green Checkout button (44h) right.
- **Observed (code):** No sticky bar exists.
- **Question (a):** Always pinned, or only when scrolled past the inline summary card?
- **Question (b):** Does it replace the inline `Proceed to checkout` CTA on mobile, or co-exist with it (the inline CTA renders inside `JYngs` desktop-side; mobile has no parallel inline CTA visible above the sticky)?
- **Plausible answers:**
  - (a) Always pinned; inline mobile CTA does not exist (mobile collapse drops it). Body bottom-padding offsets the bar.
  - (b) Pinned only when the inline summary scrolls out of view; inline CTA still rendered on mobile.
  - (c) Pinned only when items > 0; hidden on empty state.

---

**Q13 — Auth gate on checkout CTA** *(AMBIGUOUS — behavior present in code, not depicted in Pencil)*

- **Observed (design):** Plain green CTA, no auth-gate / disabled / loading state drawn.
- **Observed (code):** `CartSummary` opens the AuthModal if no session; the CTA is otherwise a plain `<Link href="/checkout">`.
- **Question:** Keep the auth-gate behavior (modal opens on click when signed out), drop it (let `/checkout` page handle the redirect — it already does), or replace with a different affordance (sign-in inline before checkout)?
- **Plausible answers:**
  - (a) Keep existing modal behavior; visual treatment matches Pencil but the click handler still gates.
  - (b) Drop the modal; `/checkout` page already redirects unauthenticated users.
  - (c) Show a separate "Sign in to continue" button when signed out, instead of the green CTA.

---

**Q14 — Empty state behavior** *(AMBIGUOUS)*

- **Observed (design):** No empty state drawn anywhere.
- **Observed (code):** Rich empty state — ShoppingCart icon, "Your cart is empty", paragraph, "Continue Shopping" Button.
- **Question:** Keep the existing empty state as-is, restyle it to the Pencil tone (paper, mono eyebrow, ink-2 body), or replace with a redirect (push back to `/`)?
- **Plausible answers:**
  - (a) Keep current copy + structure; restyle to Pencil tokens; no logic change.
  - (b) Pencil intentionally omits — design a fresh empty state in this revamp pass (paper-2 placeholder card with "Your cart is empty · Browse the bazaar" copy).
  - (c) Auto-redirect to `/` when items.length === 0 (don't render the cart screen at all).

---

**Q15 — "Continue Shopping" CTA below items** *(AMBIGUOUS)*

- **Observed (design):** Not drawn.
- **Observed (code):** Outline Button below the line-item list, links to `/`.
- **Question:** Remove entirely, or hide on desktop (where the user can use chrome nav) and keep on mobile?
- **Plausible answers:**
  - (a) Remove entirely.
  - (b) Keep; Pencil oversight.
  - (c) Move to mobile only, immediately above the sticky bar.

---

**Q16 — Clear-cart icon + casing** *(COPY_CHANGE)*

- **Observed (design):** Trash-2 icon + "Clear cart" sans 13 ink-3, rendered as inline text, not a button-shaped pill.
- **Observed (code):** `<Button variant="ghost" size="sm">Clear Cart</Button>` (no icon, button affordance).
- **Question:** Adopt the icon + sentence-case copy + inline non-button styling literally?
- **Plausible answers:**
  - (a) Adopt verbatim.
  - (b) Adopt icon + casing, keep ghost-button shape.
  - (c) Keep current treatment (no icon).

---

**Q17 — Receipt-card surface tone** *(VISUAL_ONLY but spans tokens)*

- **Observed (design):** Receipt card uses `paper-2` (cream) fill + 1.5px `rule-2` stroke + radius 10. CTA below it is on the page background, not inside the card.
- **Observed (code):** `bg-muted/50` rounded-lg border p-6 — single block containing both summary rows AND the checkout button.
- **Question:** Is the structural split (receipt card + standalone CTA + free-delivery caption beneath) the intended composition, or is it OK to keep the single-block treatment if it's visually equivalent?
- **Plausible answers:**
  - (a) Adopt the three-piece composition exactly (`PetUj` card + `A3uckC` CTA + `eqqJe` caption as siblings).
  - (b) Move the CTA inside the receipt card (single block) but apply paper-2 + rule-2 styling.
  - (c) Adopt three-piece on desktop; collapse to single block above the sticky bar on mobile.

---

**Q18 — GST rate source** *(NEW_FIELD)*

- **Observed (design):** "GST 18%" hard-coded in the design. Receipt totals component (`olYUW`) also shows "GST 18%".
- **Observed (code):** No tax handling exists anywhere (cart, checkout, orders schema).
- **Question:** Where should the rate live, and does it need to be changeable per region/category/vendor in future?
- **Plausible answers:**
  - (a) Hardcoded constant `GST_RATE = 0.18` in `modules/cart/utils/`; one place to change later.
  - (b) Env var (`NEXT_PUBLIC_GST_RATE`).
  - (c) DB-driven (new `tax_rates` table) for future flexibility — overkill for now.

---

**Q19 — Delivery tier table source** *(NEW_FIELD)*

- **Observed (design):** Four tiers hard-coded in the design: 0–10 / 10–25 / 25–50 / 50+ kg at Rs. 280 / 180 / 120 / 80.
- **Observed (code):** No delivery tier definition exists.
- **Question:** Same shape as Q18 — constant, env, or DB?
- **Plausible answers:**
  - (a) Constant in `modules/cart/utils/delivery-tiers.ts`.
  - (b) DB-backed (`delivery_tiers` table) so admin can edit later.
  - (c) Pull from existing `vendor_ledger` cost-per-kg figures (unlikely; those are vendor-side reimbursements).

---

**Q20 — Tier-active highlight rule** *(NEW_INTERACTION; AMBIGUOUS)*

- **Observed (design):** Active tier (10–25 kg) is bolded ink, top stroke is 2px ink, label color flips ink-3 → ink. Other tiers are ink-3 with rule-2 strokes.
- **Question:** What's the "active" condition exactly — the tier whose `[minKg, maxKg)` currently contains `cartTotalKg`? What if cartTotalKg = 0 (no tier active)? What if cartTotalKg = 10 exactly (boundary)?
- **Plausible answers:**
  - (a) Inclusive on min, exclusive on max: `tier.minKg <= kg < tier.maxKg`. At 0 kg, no tier is highlighted (or first tier is highlighted).
  - (b) Inclusive on both: at 10 kg, both tiers 1 and 2 are highlighted (visual conflict).
  - (c) Highlight the *cheapest reachable* tier rather than the current weight tier.

---

**Q21 — Receipt label "Delivery (10–25 kg tier)" copy** *(COPY_CHANGE; depends on Q20)*

- **Observed (design):** Receipt row reads "Delivery (10–25 kg tier)" — the current tier's range is interpolated into the label.
- **Observed (code):** "Shipping · Calculated at checkout".
- **Question:** Confirm the dynamic label format: `Delivery ({minKg}–{maxKg} kg tier)` for bounded tiers, and `Delivery ({minKg}+ kg tier)` for the open-ended last tier?
- **Plausible answers:**
  - (a) Yes — exact format above; localizable later.
  - (b) Show range only without the word "tier" ("Delivery (10–25 kg)") — matches the mobile receipt copy `aDBD9` which omits "tier".
  - (c) Show just "Delivery" with no parenthetical, since the gauge above already shows the tier visually.

---

**Q22 — Mobile receipt-card "Delivery (10–25 kg)" vs desktop "Delivery (10–25 kg tier)"** *(COPY_CHANGE)*

- **Observed (design):** Desktop says "tier"; mobile drops it.
- **Question:** Intentional shortening for mobile, or oversight?
- **Plausible answers:**
  - (a) Intentional — match Pencil verbatim.
  - (b) Standardize to one wording across breakpoints (pick one).

---

**Q23 — Per-pack price "Rs. 1,140" column on desktop row** *(NEW_FIELD or REPOSITIONED)*

- **Observed (design):** Desktop cart row shows two prices: per-pack Rs. 1,140 (mono 13/normal ink-3) and line total Rs. 2,280 (mono 15/800 ink). Mobile shows only the line total.
- **Observed (code):** Per-pc price is shown in the caption ("10g · Rs. 100/pc"); line total is on its own.
- **Question:** Is "Rs. 1,140" the unit price (per pack), or something else (e.g. "you paid X for the first pack and Y for the rest" tier-aware)?
- **Plausible answers:**
  - (a) Unit price per pack at the currently-active tier — i.e. `resolvePrice(item.priceTiers, item.quantity)`. Mobile drops it for space.
  - (b) Unit price *before* tier discount (struck-through), to surface the discount delta — but no strikethrough is drawn in this row (unlike `prod1` product card).
  - (c) Per-unit (per individual unit inside a pack), not per-pack — would require pack-units knowledge (depends on Q1).

---

**Q24 — Trash-2 vs `x` for remove control** *(VISUAL_ONLY)*

- **Observed (design):** `x` lucide 16, color `ink-3`, hit area 32×32.
- **Observed (code):** `Trash2` lucide size-4, color `text-destructive`, hit area size-8.
- **Question:** Adopt `x` ink-3 verbatim, or keep Trash2 and just retoken color?
- **Plausible answers:**
  - (a) Adopt verbatim.
  - (b) Keep Trash2; retoken to `ink-3` (no destructive red, since Pencil clearly de-emphasizes the action).
  - (c) Keep Trash2 + destructive red.

---

**Q25 — Cart row image is not a Link in Pencil** *(CHANGED_INTERACTION; subset of Q6)*

- Same as Q6; tracked separately because it's specifically about the image element having `<Link>` removed in addition to (or instead of) the title.

---

**Q26 — Mobile cart-row title copy "KitKat 2-Finger × 12"** *(COPY_CHANGE)*

- **Observed (design):** Mobile title is "KitKat 2-Finger × 12" (sans 13/700, fixed width). Desktop title is "KitKat 2-Finger Carton (48 × 21g)".
- **Question:** Is the mobile title a truncation rule (auto-shorten by character/word count?) or a separate display field stored on the product?
- **Plausible answers:**
  - (a) Auto-truncate the desktop string with `text-overflow: ellipsis` (CSS) — mobile renders a single line.
  - (b) Different display string per breakpoint, computed from product fields (name + pack count).
  - (c) Pencil sample data only; the same name string renders at both breakpoints, just truncated visually.

---

**Q27 — Subtotal row label change "Items (N)" → "Subtotal"** *(COPY_CHANGE)*

- **Observed (design):** Single "Subtotal" row.
- **Observed (code):** Two rows — "Items (N)" + "Shipping" then a separator and "Subtotal" total-style row.
- **Question:** Confirm the receipt has only Subtotal / Delivery / GST / Total — no "Items (N)" prefix and no separator before Subtotal?
- *(See Q9 for the structural removal; this question is about the label text change only.)*

---

(End of gap analysis. No code proposed.)
