# Weight Gauge (Delivery Tier) — Surface Map

> **Phase:** Feature surface mapping (read-only design pass).
> **Date produced:** 2026-05-02
> **Pencil source:** `Pencil-Design\Shalmi`
> **Pairs with:** `01-codebase-map.md`, `02-design-inventory.md`,
> `04-design-system-implementation-log.md`.

This artifact maps **what the Pencil designs already show** for the
Weight Gauge feature. It does not propose code, copy, or behavior.
Every inferred fact is marked "(inferred)" and re-surfaced in §7.

---

## 1. Feature summary

The Weight Gauge is a basket-level UI element that exposes Shalmi's
**weight-banded delivery pricing** to the buyer in real time. It pairs
the cart's current total weight (e.g. `18.5 kg`) with a horizontal
fill-bar segmented into four delivery tiers and labels the active tier
in bold/ink while the other three remain muted. The four tiers
captured verbatim from the design-system showcase (`LA21g`) and the
desktop cart gauge (`rnCT6`) are:

| Range | Delivery cost (as drawn) |
|---|---|
| 0–10 kg | Rs. 280 |
| 10–25 kg | Rs. 180 |
| 25–50 kg | Rs. 120 |
| 50+ kg | Rs. 80 |

Heavier baskets get a lower per-shipment delivery fee — i.e. the gauge
is a **bulk-shipping incentive surface (inferred)**: the higher the
fill, the cheaper the delivery line in the receipt. An adjacent
amber-colored helper callout (e.g. "Add 6.5 kg more to drop to next
tier — save Rs. 60") nudges the user toward the next bracket
**(inferred — copy is hard-coded in the static design and we do not
know whether it appears always, only near a tier boundary, or only
when net savings are positive)**. The selected tier label also
propagates into the order-summary delivery line on cart, reorder, and
checkout (e.g. "Delivery (10–25 kg) · Rs. 180").

---

## 2. Touchpoint inventory

Each row is a place the gauge (or its derived "tier label") appears in
Pencil. `existing_screen?` answers whether the **screen** (not the
gauge itself) already exists in code, per `02-design-inventory.md` §5.

| pencil_location | touchpoint_type | existing_screen? |
|---|---|---|
| Design System → `05 Components → WEIGHT GAUGE` (`LA21g`) inside `a2HFrA` | `NEW_ELEMENT_ON_EXISTING_SCREEN` (showcase only — no consumer route) | Showcase / N/A |
| Buyer · Cart · Desktop (`g3oOM7`) → `cartLeft` (`wWiXo`) → `gauge` (`rnCT6`) — top of left column, above `cart-lines` | `NEW_ELEMENT_ON_EXISTING_SCREEN` | Yes (`/cart`) |
| Buyer · Cart · Mobile (`lSn3n`) → `mGaugeWrap` (`Qt7Dv`) → `mGauge` (`s5yyU9`) — between cart header and `m-cart-lines` | `NEW_ELEMENT_ON_EXISTING_SCREEN` | Yes (`/cart`) |
| Buyer · Reorder · Desktop (`NNw2K`) → `rLayout` (`NW1J4`) → `rLeft` (`zvsZl`) → `Weight gauge` (`B2ysb`) — top of left column, above amber helper, item-list and `rTopBar`. **Note:** the brief said "right column above receipt", but in the actual frame the gauge sits in the **left** column; the receipt (`FDQJ6`) is in `rRight` (`n1QkZY`) without a gauge. (inferred discrepancy) | `NEW_ELEMENT_ON_EXISTING_SCREEN` (the **screen** is new — see §6) | No — Reorder is a new screen per `02-design-inventory.md` §6 |
| Buyer · Reorder · Mobile (`tbXvv`) → `Scroll` (`fo5Yr`) → `Weight gauge` (`n76qv`) — directly under "Replenish last week's cart" title, above amber `mrHelp` callout. The mobile gauge replaces the column legend with a subtitle like `Tier 2 · Rs. 180 delivery` next to the kg readout, **and the legend row drops the `Rs. 280/180/120/80` per-tier prices, showing only the kg ranges** (inferred — different layout density, may be a "compact" variant) | `NEW_ELEMENT_ON_EXISTING_SCREEN` | No — Reorder is a new screen |
| Buyer · Checkout · Desktop (`S72tsk`) — verify presence: **the gauge is NOT drawn.** `xRight` (`F3YHlB`) holds `xSumCard` + `xPlace` + `xSecure` only. The active **tier label only** survives as part of the summary line "Delivery (10–25 kg) · Rs. 180" inside `xRules` (inferred — verified via `mxSumC` companion content; desktop `xRules` rows are abbreviated children we did not fully read but follow the same pattern as mobile per the `Rs. 79,768` total reuse) | `MODIFIED_ELEMENT_ON_EXISTING_SCREEN` (delivery row in summary card) | Yes (`/checkout`) |
| Buyer · Checkout · Mobile (`OqB5X`) → `mxSum` (`WffEW`) → `mxSumC` (`DJEAP`) → `mxsr2` row "Delivery (10–25 kg) · Rs. 180". **No gauge component** is drawn on this screen — only the tier label in the delivery summary row | `MODIFIED_ELEMENT_ON_EXISTING_SCREEN` | Yes (`/checkout`) |

The feature has **no** `NEW_SCREEN`, `NAV_ENTRY_POINT`, or
`ICON_OR_BADGE` touchpoints.

---

## 3. Data model implications

What the design implies, anchored to what `01-codebase-map.md` §5 says
exists today.

### Inputs the gauge already has

- **Per-product weight** — `products.weightGrams` (integer) already
  exists (`packages/database/src/schema/products.ts`). Cart line items
  resolve to products via `lineItemSchema.productId`
  (`packages/schemas/src/cart/line-item.ts`).
- **Cart line items** — Zustand `cart-store` (`modules/cart/stores/`)
  already persists `{ productId, quantity }[]`.

### Inputs the gauge does NOT have today

- **A tier table.** The four `(min_kg, max_kg, delivery_cost_rs)` rows
  drawn in the design have **no representation in the current schema
  or constants** (grep of `02-design-inventory.md` §6 already flags
  weight gauge as a "net-new feature inside existing screens"). This
  needs either:
  - a new database table (e.g. `delivery_tiers` / similar) with
    columns `(id, minWeightGrams, maxWeightGrams nullable for "and
    above", priceCents, isActive, sortOrder, timestamps)`, or
  - a constants module under `modules/cart/` or
    `packages/constants/`. (inferred — design does not say which.)
- **Cart-total weight resolver.** Today there is no cart-side selector
  that computes `Σ(product.weightGrams × quantity)`. Cart components
  resolve prices via `modules/cart/utils/resolve-price.ts` but no
  parallel `resolve-weight.ts` exists.
- **Delivery-cost-from-weight resolver.** Same gap — no util maps a
  total weight in grams onto the active tier and its `priceCents`.
- **Per-`sub_order` vs per-`order` shipping.** Existing
  `sub_orders.weightGrams` and `sub_orders` cost columns suggest
  shipping is computed **per vendor sub-order**. The cart gauge shows
  one whole-cart number, not per-vendor numbers. (inferred conflict —
  see §7 Q4.)

### API endpoints

Nothing new is **strictly required** if tiers are constants and the
weight is derived client-side from already-fetched product weights.
The only spot where tiers would touch the wire today is
`POST /api/checkout` (`apps/web/src/app/api/checkout/route.ts`),
which currently writes `orders.totalShippingCost` and per-`sub_order`
costs from… (verify — server-side computation path was not inspected
this pass). If tiers move to DB, a `GET /api/delivery-tiers` (public,
cacheable) is implied. (inferred — design does not specify.)

### Existing schema fields impacted

- `products.weightGrams` — read-only consumer. **No change.**
- `orders.totalShippingCost` / `sub_orders` cost breakdown — write
  path needs to honor the tier table when the order is placed
  (otherwise the gauge advertises Rs. 180 but checkout charges
  something different).
- `order_items.totalPrice` — unaffected (item subtotals are
  independent of shipping).

---

## 4. State & ownership

- **Cart-weight derivation is purely a *selector* over existing
  state.** The Zustand cart store at
  `apps/web/src/modules/cart/stores/cart-store.ts` already holds the
  line items; weight is `Σ(line.quantity × product.weightGrams)`.
  Pattern fit: a memoised selector / hook in `modules/cart/hooks/`
  (mirroring `resolve-price.ts`).
- **Active-tier derivation** is a pure function over the weight value
  + the tier table. Belongs next to the resolver above (e.g.
  `modules/cart/utils/resolve-delivery-tier.ts`).
- **Tier table source** — if constants, lives in `packages/constants/`
  or `modules/cart/constants/`. If DB-backed, `useDeliveryTiersQuery`
  via React Query (matches the existing pattern from
  `useAddressesQuery`, `useBannersQuery`, etc.). (inferred which.)
- **No new global context / store is required by the design.** The
  gauge is a presentational component fed by the existing cart store
  and the tier table.
- **Server-side authoritative tier resolution at checkout time** is
  implied for correctness, since the displayed tier must match the
  charged tier. Belongs in the same file/module that handles
  `POST /api/checkout` shipping math today (verify).

---

## 5. Auth & permissions

- The **cart screen is unauthenticated today** (`/cart` is a CC, no
  middleware, per `01-codebase-map.md` §4). The gauge inherits that —
  any visitor with items in their persisted cart sees it.
- **Reorder** requires login (it's anchored to a past `order` id and
  uses retailer order data). Same posture as `/profile/orders`.
- **Checkout** already redirects unauthenticated users (`Per-page
  redirect to /auth?redirect=/checkout`).
- The gauge **does not differentiate by role** in any drawn frame.
  Vendor and admin chrome do not show the gauge in any inspected
  frame. (inferred completeness — admin/vendor screens were not
  traversed for this feature.)
- No design state is drawn for permissions failure modes (e.g. weight
  unavailable, tier table fetch failed, etc.) — see §7 Q9.

---

## 6. Build order recommendation

Recommended order with brief justification:

1. **Tier source of truth** — decide constants vs. DB (Q1 below) and
   add the rows. This unblocks every consumer.
2. **Pure utilities** — `resolveCartWeight(items, productsById)` and
   `resolveDeliveryTier(weightGrams, tiers)` in
   `modules/cart/utils/`. Pure functions, easy to unit-test and to
   re-use across cart, reorder, checkout server-side.
3. **`<WeightGauge>` presentational component.** Per
   `04-design-system-implementation-log.md` §"Atoms intentionally NOT
   added in this phase", the gauge is explicitly deferred and listed
   for the cart revamp. Two visual variants are observed (full legend
   with prices on desktop/showcase; compact subtitle + price-less
   legend on mobile reorder) — handle as `variant` prop or two
   components per `02-design-inventory.md` Q10 precedent. (inferred —
   design has no "variant" labelling.)
4. **Wire into cart** — desktop above `cart-lines`, mobile between
   header and lines. Both are existing screen edits.
5. **Wire delivery-tier-aware "Delivery" row** into the cart-summary
   and checkout-summary cards — same active-tier label and rupee
   value. This is the cross-screen consistency surface.
6. **Server-side honoring at `POST /api/checkout`** — the wire-side
   shipping math must match what the gauge advertised, otherwise the
   feature breaks user trust. Treat this as a correctness gate, not a
   polish pass.
7. **Reorder screen build** — gauge is one of several elements on a
   net-new screen; sequence per the Reorder feature's own surface map
   (not this file).

Justification: (1)→(2)→(3) follows the standard schema-first /
utils-next / presentation-last gradient. The Cart screen (4) is
prioritised before Reorder (7) because the gauge is the same
component on both, and the cart is an existing surface where
regressions are easier to spot. Server-side correctness (6) sits
alongside (4)/(5) because if checkout doesn't apply the same tier
logic, the gauge becomes a lie.

---

## 7. Open questions

Numbered for easy reference.

1. **Tier source of truth — constants or DB?** Pencil shows four
   fixed rows. If the business plans to change tier prices regionally
   or seasonally, this needs to be a DB table; if not, constants are
   fine. Design alone cannot answer.

  answer: yes it will be a DB table.

2. **Are tiers global, per-vendor, or per-hub?** The `vendors` schema
   has a `hub` field and `sub_orders` group items by vendor. The
   gauge shows a single whole-cart tier. Is shipping really
   computed once per cart, or summed per sub-order? The cart-summary
   "Delivery (10–25 kg) · Rs. 180" suggests once per cart (inferred);
   the existing `sub_orders` cost columns suggest per sub-order.
   These can be reconciled but only one way is right.

  answer: shipping will be calculated once per cart.

3. **Cart weight = `Σ(product.weightGrams × quantity)`?** Confirm.
   Variants/packs (per `02-design-inventory.md` Q12 — the new
   pack-based pricing) may carry their own weights distinct from the
   base product. If a "Pack of 6" multiplies the per-unit weight, who
   owns that math?

   answer: yes it will be calculated as sum of all the products in the cart. when vendor will add the weight, it will be the unit weight of that product and must be calculated as (unit weight * quantity).

4. **"Free delivery on orders over Rs. 50,000" copy in cart right
   column** (`eqqJe` → `yQFbU`) — does this override the tier-based
   delivery cost when the subtotal crosses Rs. 50,000? If so, the
   gauge should presumably reflect that (e.g. a "FREE" stamp on the
   bar). The static design does not show the override state.

   answer: yes it will override the tier based delivery cost when the subtotal crosses Rs. 50,000. and the gauge will show "FREE" stamp on the bar.

5. **Amber helper callout** ("Add 6.5 kg more to drop to next tier —
   save Rs. 60") — is it shown:
   (a) always, with dynamic copy,
   (b) only when within some threshold of the next tier boundary,
   (c) only when net savings are positive, or
   (d) some combination? Reorder desktop also shows this helper with
   identical copy `tX5NA`. Mobile cart frame has no helper at all.

   answer: (a) always, with dynamic copy. we can change the logic later if needed.

6. **Two visual variants** — desktop shows full legend with per-tier
   rupee values (`Rs. 280` etc.); mobile reorder uses a `Tier 2 · Rs.
   180 delivery` subtitle and drops rupee values from the legend
   row. Are these formal variants of one component, or two
   components? (Mirrors `02-design-inventory.md` Q10 for product
   cards.)

   answer: Yes, it is a single component, in reorder mobile version it has a price values missing, only consider weight guage from cart (Desktop + Mobile).

7. **Showcase vs. cart-desktop spec drift.** The design-system
   showcase (`LA21g`) draws a 22h bar with `cornerRadius: 3` and
   `padding: 28`; the cart-desktop instance (`rnCT6`) has 22h bar
   with `cornerRadius: 11` (pill) and `padding: 20`. Reorder desktop
   (`B2ysb`) has bar `cornerRadius: 4`. Three rounding values for the
   "same" bar — is this intentional variation or design churn?

   answer: design churn, consider from the cart version (Desktop + Mobile).

8. **No gauge on checkout — intentional?** Checkout shows only the
   tier label embedded in the delivery summary row. Is the gauge
   genuinely meant to disappear once the user has committed to a
   weight (i.e. cart is the negotiation surface, checkout is the
   confirmation surface), or was it dropped from these frames in
   error?

   answer: It is intentional, checkout is the confirmation surface, so it will not show the weight gauge.

9. **Empty / error / loading states.** No frame shows: 0kg cart, tier
   table failed to load, weight unknown for a product (older record
   without `weightGrams`), or above the highest tier. Behavior not
   inferable from designs.

   answer: proposed basic empty state, error state and loading state.

10. **Cart vs. sub-order accounting in summary.** The cart receipt
    (`PetUj` → `sumTotal`) and checkout receipt (`SOEpL` /
    `DJEAP`) both list one delivery line. Existing
    `orders.totalShippingCost` is whole-order; `sub_orders.*` cost
    columns are per-vendor. Source of truth for the displayed Rs.
    value at write-time?

    answer: whole order.

11. **Reorder right-column "VS. ORIGINAL ORDER"** card (`klOB3`) —
    out of scope for this feature, but it intersects: if the buyer
    drops items, weight changes, tier changes, and the comparison
    delta changes. Does this comparison's "delivery" row track the
    new tier or the original tier? (inferred relevance.)

    answer: new tier.

12. **Brief said "right column above receipt" for Reorder Desktop —
    actual placement is left column above items list.** Confirm the
    actual frame is correct (and the brief had a typo), or whether
    the design has been updated and we are looking at a stale
    placement.

    answer: follow the design in pencil.  

---

(End of weight-gauge surface map. Stopping here per instructions —
no code, no implementation.)
