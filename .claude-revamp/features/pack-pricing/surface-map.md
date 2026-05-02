# Feature Surface Map — Pack-Based Pricing

> **Phase:** Feature surface inventory (read-only).
> **Date produced:** 2026-05-02
> **Scope:** Map every place the "Pack of N" pricing feature appears in the
> Pencil designs and what it implies for the codebase. **No design, no code
> proposals.**
> **Pencil source:** `Pencil-Design\Shalmi`. Frame ids in parentheses.
> **Pairs with:** `01-codebase-map.md`, `02-design-inventory.md`,
> `04-design-system-implementation-log.md`.

Per CLAUDE.md, every speculative claim is marked **(inferred)**. All
unresolved questions live in §7 — sections 1–6 do not silently bake in
assumptions.

---

## 1. Feature summary

The Pencil designs introduce a **pack-based pricing model** for catalog
products. A vendor defines a product as a wholesale "pack" with a fixed
pack size (e.g. "Carton of 30") and a base wholesale price; on top of
that base price the vendor can optionally publish a small set of
**bundle tiers** keyed by buy-quantity-of-packs (the form draws three
slots — "BUY 6", "BUY 12", "BUY 24" — each with its own per-pack price
and a discount-percent label, plus an "Add tier" affordance). On the
buyer side the same tiers are surfaced as a **"CHOOSE BUNDLE SIZE"**
selector on the PDP showing four discrete options (e.g. "6 pack",
"12 pack", "24 pack", "48 pack") with total price and unit price each;
one is selected by default and another carries a "BEST" stamp. The cart,
checkout and reorder surfaces all reflect the chosen bundle by encoding
it into the line — either as a "× 12" suffix on the product name, a
"12 PACK" eyebrow on the subtitle, or a "Pack of 4 / Carton of 6"
phrase appended to the title — together with a quantity stepper that
counts packs (not individual units) and a per-unit (or per-carton) price
caption. The motivation **(inferred)** is to let buyers compare unit
economics across pack quantities so they choose the best price-per-unit
deal at the vendor's pre-set thresholds.

---

## 2. Touchpoint inventory

`touchpoint_type` legend: `NEW_SCREEN` · `NEW_ELEMENT_ON_EXISTING_SCREEN`
(NEW_EL) · `MODIFIED_ELEMENT_ON_EXISTING_SCREEN` (MOD_EL) ·
`NAV_ENTRY_POINT` (NAV) · `ICON_OR_BADGE` (BADGE).

| pencil_location | touchpoint_type | existing_screen? |
|---|---|---|
| **Buyer · Product · Desktop (`MqzEv`)** — `bundleSec` (`rbpQj`): "CHOOSE BUNDLE SIZE" header + 4 selectable bundle cards (`yFY54` / `lFdWh` selected / `HkdX5` w/ green save pill / `Urrvl` w/ green "BEST" pill); each card stacks `N` (mono 22/800), "pack" subtitle, total `Rs. X` (mono 13/700), `Rs. Y/unit` caption. | NEW_EL | Yes — `/products/[slug]` (`ProductDetail`) |
| Buyer · PDP · Desktop — `pdpPrice` (`YH4xn`): main price (`Rs. 4,820` mono 32/800) + strikethrough MRP + green save pill (`SAVE Rs. 660 (12%)`) + "Per unit: Rs. 100.42" caption. | MOD_EL | Yes — current code shows price without strikethrough/save pill or per-unit caption (inferred from `modules/cart/utils/resolve-price.ts` + `ProductDetail`). |
| Buyer · PDP · Desktop — title eyebrow `(48 × 21g)` baked into product name (`p4xJI`: "KitKat 2-Finger Carton (48 × 21g)"). | MOD_EL | Yes — title rendered on PDP. |
| Buyer · PDP · Desktop — `qtyRow` (`W2pDG`): qty stepper "−/2/+" with 44h, "Add to cart" + "Wishlist" buttons. Stepper unit = packs of the selected bundle size **(inferred)**. | MOD_EL | Yes — `add-to-cart-button` / `quantity-selector` in `modules/cart/components/`. |
| **Buyer · Product · Mobile (`OVOxe`)** — `mBundleSec` (`Lckbj`): "CHOOSE BUNDLE SIZE" + 2×2 grid (`TMZXy` row 1 with `mb1` "6 pack" + `mb2` "12 pack" selected; `bxChT` row 2 with `mb3` "24 pack" + green "SAVE" badge + `mb4` "48 pack" + green "BEST" badge). | NEW_EL | Yes — same `/products/[slug]` route, mobile layout. |
| Buyer · PDP · Mobile — title eyebrow + price row `mZ0pT` (`mwPIn` "Rs. 4,820" mono 24/800, strikethrough MRP, save pill `B2CS7q`), per-unit caption "Per unit: Rs. 100.42" (`JBvq6`). | MOD_EL | Yes. |
| Buyer · PDP · Mobile — sticky bottom bar `wovO4` / `sticky-bar`: qty stepper (`PgOuM`) + green full-width "Add to cart" (`enROY`). Stepper count = number of packs of the selected bundle **(inferred)**. | NEW_EL | Yes — current mobile PDP has no sticky add-to-cart bar (inferred from `01-codebase-map.md` §4 / `ProductDetail`). |
| **Buyer · Cart · Desktop (`g3oOM7`)** — cart line rows (`hf1tn`/`U5vRO`/…): title "KitKat 2-Finger Carton (48 × 21g)", subtitle "NESTLE · 1.008 KG · 12 PACK" (mono 10/700), unit price column "Rs. 1,140", line total "Rs. 2,280", quantity stepper. Pack count is folded into the eyebrow as `· N PACK`. | MOD_EL | Yes — `/cart` (`CartItemRow`). |
| **Buyer · Cart · Mobile (`lSn3n`)** — cart line cards (`TuTQX`/`U8kk4`/…): title `"KitKat 2-Finger × 12"` (× count baked into the title), subtitle "NESTLE · 1.008 KG", and a bottom row (`dxTYN`) with compact qty stepper + line total. | MOD_EL | Yes — same `/cart` mobile layout. |
| **Buyer · Checkout · Desktop (`S72tsk`)** — `xItemList` row items (`IheoZ`/`qp84M`/`NoUh4`): 40px thumb, title "KitKat 2-Finger × 12", subtitle "QTY 2", line total. "+ 9 more items" overflow. | MOD_EL | Yes — `/checkout` items review (`DeliveryAddressSection` page). |
| **Buyer · Checkout · Mobile (`OqB5X`)** — `mxSumC` summary card eyebrow says "ORDER SUMMARY · 12 items"; the mobile summary card shows totals only and does not enumerate per-line packs in this frame. | MOD_EL | Yes — same `/checkout` mobile. |
| **Buyer · Reorder · Desktop (`NNw2K`)** — `Items list` (`aDIg9`) line items (`CXe6z` ri1, `TlEAj` ri2, …): title `"Sufi Cooking Oil 5 L · Pack of 4"` / `"Lipton Yellow Label 950 g · Carton of 6"` (pack/carton phrase appended to product name), subtitle `"21 KG · CARTON"` / `"5.7 KG · CARTON"`, caption `"Rs. 1,205 per unit"` / `"Rs. 1,490 per carton"` (the unit/carton word varies by line **(inferred)**), qty stepper, line total. | NEW_EL | No — `/profile/orders/[id]/reorder` (or similar) is a NEW screen per `02-design-inventory` §6. |
| **Buyer · Reorder · Mobile (`tbXvv`)** — `mrList` line cards (`NuDbz`/`u1so9`/…): same title pattern in `OIAdk` "Sufi Cooking Oil 5 L · Pack of 4" + "21 KG · CARTON" + "Rs. 1,205 per unit"; per-line check-box, qty stepper, total. | NEW_EL | No — same NEW reorder screen. |
| **`prod1` reusable component (`QZyPu`)** — unit subtitle text node `xI1e6` ("5 L · CARTON") rendered between title and price; YMAL/best-prices/hot-products instances on the buyer Home and PDP override it (e.g. ymal: "22 G · CARTON × 36"). The `× N` syntax baked into the override caption is the units-per-pack metadata. | MOD_EL | Yes — used by `BestPricesSection`, `SuperSaversSection`, `ProductCarouselSection`, plus PDP "you may also like" rail. |
| **Detailed product card `dw7Oh`** (`05 Components → PRODUCT CARD`) — title `"Sufi Cooking Oil 5 L · Pack of 4"` (Pack-of phrase in title) + weight eyebrow `"SALEEM BHAI · 21 KG"` (mono 10/600) below the price row. | MOD_EL | Yes — currently surfaced via `product-card` in `modules/storefront/components/`. (Per `02 §3.3` Open Q10, `prod1` and `dw7Oh` are two distinct components.) |
| **Vendor · Products · Desktop (`H7jii`)** — Add Product form `Q01kX`: `apPriceSec` (`XsOib`) titled "PRICING" with "Buyers see the wholesale price" sub-caption; row 1 inputs `MRP (Rs.)` (`apF7`) + `Wholesale price (Rs.)` (`apF8`); section header `apBundleHd` "Bundle pricing (optional) — Reward buyers who order more cartons — give a small per-unit discount."; tier row `apBundles` (`XBPjE`) with three drawn tier cards (`bRMNc` "BUY 6 / 2,580 / −2.3%", `lK2cq` selected ink card "BUY 12 / 2,510 / −4.9%", `Ci3TV` "BUY 24 / 2,420 / −8.3%") + an `apBdAdd` "+ Add tier" affordance. | NEW_EL | Yes — `/vendor/products/new` and `/vendor/products/[id]/edit` (`AddProductForm`). |
| Vendor · Products · Desktop — `apF5` "Pack size (units)" numeric input (value `30`) inside `apR2`, paired with `apF6` "Net weight". This is a new product attribute distinct from existing `weightGrams`. | NEW_EL | Yes — same `AddProductForm`. |
| Vendor · Products · Desktop — `apF9 stock` "Stock count" with caption "cartons" (`VZxrR`) — stock unit is **packs/cartons**, not individual units **(inferred)**. | MOD_EL | Yes — current `products.stock` is a single integer with no pack/unit semantics. |
| **Vendor · Products · Mobile (`tXG16`)** — "Add product section" (`m35oBN`): `mapPrice` (`IftHf`) with PRICING eyebrow, two-input row `opBmm` (mapPF1/mapPF2 = MRP / Wholesale), "Bundle pricing (optional)" header `l1r34N`, and a 2×2 tier grid `PaK5D` (mapBd1, mapBd2 selected ink, mapBd3, plus mapBd4 "+ Add tier" placeholder). Plus `mapF5` "Pack size" input on `XyBaa`. | NEW_EL | Yes — same `AddProductForm`, mobile layout. |
| Vendor · Products · Mobile — Product list cards in `DKN8C` show pack hint in some product names (e.g. p3 `py9U2` "Olper's Milk 1L · 12pk"); not a component change but a list-row title pattern. | MOD_EL | Yes — `/vendor/products` list (`ProductTable`). |

(No **NEW_SCREEN**, **NAV_ENTRY_POINT**, or **ICON_OR_BADGE** touchpoints
were found in this pass that are dedicated to pack-pricing — the feature
lives entirely inside existing-or-already-planned screens.)

---

## 3. Data model implications

What the designs require to persist or expose. References to existing
schema files come from `01-codebase-map.md` §5.

**Confirmed direction (per `02-design-inventory` Q12):** the existing
`product_price_tiers` model (`packages/database/src/schema/product-price-tiers.ts`
— `minQty`/`maxQty`/`priceCents`) is being **replaced** by a pack-based
model. So this is not additive; it is a model swap.

What the design surfaces imply we need:

1. **Per-product pack metadata.**
   - The vendor form draws a single numeric field `Pack size (units)`
     ("30" in the sample). **(inferred)** this is units-per-pack stored
     once on the product (e.g. `products.packSize int`).
   - The vendor form also draws `Net weight` ("4.5") next to it
     (`apR2`). The unit (kg? per-pack? per-unit?) is not labelled in the
     drawn frame — see Open Q4. The existing
     `products.weightGrams` exists but the new field's relationship to
     it is unstated.
   - PDP titles bake the units-per-pack into the product name string
     ("KitKat 2-Finger Carton (48 × 21g)"), and `prod1`/`dw7Oh`
     subtitles render shorthand ("5 L · CARTON", "22 G · CARTON × 36")
     — **(inferred)** these are presentation strings derived from
     `packSize`, `unitLabel`, and per-unit weight, but the design does
     not declare which is stored vs derived.

2. **Pack base price (per-pack price).**
   - Vendor form draws two inputs: `MRP (Rs.)` and `Wholesale price (Rs.)`.
   - Existing schema only has tier prices in `product_price_tiers`. New
     fields on `products` (or on a new pack-price table) implied:
     `packMrpCents` / `packWholesalePriceCents` **(inferred)**.

3. **Bundle tiers.**
   - The vendor form drew three tier slots (BUY 6 / BUY 12 / BUY 24)
     with `+ Add tier`. **(inferred)** tiers are user-editable and
     unbounded in count.
   - Each tier carries: a pack-quantity threshold (`6`, `12`, `24`),
     a per-pack price (`2,580` / `2,510` / `2,420`) **OR** a discount
     percent (the "−2.3% / −4.9% / −8.3%" labels) — Pencil shows both
     side by side; not declared which is the source-of-truth input vs
     derived display. See Open Q5.
   - The PDP buyer-side block draws four bundle cards (6/12/24/48) —
     not three. Either the buyer can see additional tiers beyond what
     the vendor drew in this sample, or the example data simply
     differs across the two screens. See Open Q6.
   - **One tier is selected by default** (sample shows `12 pack`
     selected). The design encodes "selected"/"BEST"/"SAVE" visual
     states but does not declare which is the default-selection rule
     (cheapest unit price? mid tier? vendor-pinned?). See Open Q7.

4. **Replacement of `product_price_tiers`.**
   - Per Q12 answer in `02-design-inventory`, the `minQty`/`maxQty`
     band model is being dropped. **(inferred)** schema migration:
     drop `product_price_tiers` (or rebuild it as
     `product_pack_tiers` with `minPackQty` / `pricePerPackCents`),
     drop the `productPriceTiersFormSchema` /
     `createProductPriceTiersSchema` (in
     `packages/schemas/src/catalog/product-price-tiers.ts`), and
     replace with new schemas.

5. **Cart / order line snapshot.**
   - Cart lines display **`N PACK`** eyebrow + per-pack and total
     prices. Existing `order_items` table
     (`packages/database/src/schema/order-items.ts`) snapshots
     `unitPrice` and `totalPrice`. **(inferred)** `unitPrice` becomes
     "per-pack price at time of order" and a new
     `packSizeAtPurchase` / `pricePerUnitCents` snapshot may be
     needed for the "Rs. 100.42 per unit" caption to remain accurate
     even if the product is later edited. The existing cart store
     (`modules/cart/stores/cart-store.ts`) currently keys lines by
     `productId + quantity` — the new model **(inferred)** also needs
     `selectedTierIndex` or `selectedPackQty` to know which bundle
     was picked.

6. **API endpoints touched (not exhaustive — existing routes only).**
   - `GET /api/products/[slug]` — must return pack metadata + tiers.
   - `POST /api/vendor/products` and `PATCH /api/vendor/products/[id]`
     — must accept the new pack/MRP/wholesale + tier payload.
   - `GET /api/vendor/products` and `GET /api/categories/[id]/products`
     — list rows need at least `packSize` so cards can render
     "5 L · CARTON" or "× 12" subtitles.
   - `POST /api/checkout` — must persist the chosen bundle qty/price
     into `order_items`.
   - No design surface implied a new dedicated endpoint
     (e.g. `/products/[id]/tiers`) but that decision is open.

---

## 4. State & ownership

What the designs imply about where state lives, given the patterns the
codebase already uses (`01-codebase-map.md` §1, §3).

- **Currently selected bundle on PDP** — the bundle selector is a local
  UI state on the PDP. **(inferred)** belongs in the PDP client
  component (likely `ProductDetail` in
  `modules/cart/components/product-detail.tsx`), not in a global store.
- **Cart line carrying the selected pack qty** — the cart is
  Zustand-persisted (`modules/cart/stores/cart-store.ts`). To round-trip
  the bundle choice across page reloads, the cart line **(inferred)**
  must store `selectedPackQty` (or the chosen tier index) in addition
  to `productId` and `quantity`. Whether two cart lines for the same
  product but different bundle sizes should be distinct lines or
  collapse is undefined in the designs — see Open Q8.
- **Server-state queries for the catalog** — already use
  `@tanstack/react-query` (`use-category-products-query`,
  `use-vendor-product-query`, etc.). New pack fields would flow through
  the same hooks; no new context/store implied.
- **Vendor add-product form** — already uses `react-hook-form` + Zod
  in `modules/vendor/.../add-product/`. The bundle-tiers row maps to a
  `useFieldArray` (since "+ Add tier" exists). No new global state.
- **Reorder screen state** — NEW screen; per-line "selected" checkbox,
  per-line qty, plus a "Save as new list" CTA on desktop. Owner is
  likely a local component-level reducer or a dedicated
  `useReorderDraftQuery`/mutation pair. The design does not specify
  persistence of the draft across navigations — see Open Q9.

No multi-page global context (e.g. React context provider) is implied
by the designs. The existing `packages/contexts/` providers
(`stack-navigator`, `user-context`) do not need changes for this feature
**(inferred)**.

---

## 5. Auth & permissions

What the design surfaces imply, and what's ambiguous.

| Surface | Auth signal in design | Existing gating |
|---|---|---|
| Buyer · PDP (desktop + mobile) | Public (no sign-in chrome on PDP) | Public — `/products/[slug]` is unauthenticated. |
| Buyer · Cart | No auth blocker drawn — the cart shows line data and a "Proceed to checkout" CTA. | Public — cart is client-side Zustand store. |
| Buyer · Checkout | Drawn with delivery address card and payment selector (no guest-checkout copy). | Auth-required per page logic (`/checkout` redirects to `/auth?redirect=/checkout`). |
| Buyer · Reorder | Frame title "REORDER · ORDER #SH-24891 · 24 APR 2026" implies the user has a previous order to reorder against. **(inferred)** auth-required. | Middleware-gated (`/profile/*` per `01-codebase-map.md`). |
| Vendor · Add Product form | Lives under vendor chrome (ink top-bar with "Vendor" badge). | Vendor role enforced by `middleware.ts` on `/vendor/:path*`. |
| Vendor · Products list | Same vendor chrome. | Same. |

**Pack-pricing-specific permission ambiguities:**
- The design does not depict admin moderation of pack tiers or any
  approval of price changes (the form footer copy says "Saved
  automatically as draft. Submit when ready." → admin approval is
  implied for *publishing* a product but is not pack-pricing-specific).
- It is not specified whether a vendor's edits to bundle tiers on a
  *live* product take effect immediately or require re-approval. See
  Open Q10.
- Buyer-side viewing of bundle tiers is not gated to authenticated
  users in the drawn PDP — bundle tiers are public **(inferred)**.

---

## 6. Build order recommendation

Suggested ordering, with brief justification. **No work is being
proposed yet — this is a sequence to consider once Open Questions in §7
are resolved.**

1. **Schema + Zod + API layer.**
   - Decide pack-pricing schema (Q4–Q7).
   - Migration: drop or refactor `product_price_tiers`, add pack fields
     to `products` (or a new `product_pack_tiers` table), update
     `order_items` snapshot fields if Q11 needs them.
   - Update Zod schemas in `packages/schemas/src/catalog/`.
   - Update read endpoints (`/api/products/[slug]`,
     `/api/vendor/products`, `/api/categories/[id]/products`) to emit
     the new shape; update write endpoints
     (`POST/PATCH /api/vendor/products`, `POST /api/checkout`) to
     accept it.
   - Rationale: every UI surface depends on the data shape; doing this
     first prevents two-direction churn.

2. **Vendor Add Product form (`H7jii` / `tXG16`).**
   - This is the *producer* of pack data. Until vendors can write
     tiers, every buyer surface is reading empty fields.
   - Touches: `modules/vendor/.../add-product/` (existing form), with
     `useFieldArray` for tiers and a new `Pack size (units)` input.

3. **Buyer · PDP bundle selector (`MqzEv` `rbpQj` + `OVOxe` `Lckbj`).**
   - First *consumer* surface. Drives the cart-store contract
     (selected pack qty + per-pack price).
   - Mobile sticky-bar (`wovO4`) ships in the same step (it depends on
     the same selection state).

4. **Cart store + Cart screen (`g3oOM7` / `lSn3n`).**
   - Update Zustand cart line shape to carry the bundle choice.
   - Update `CartItemRow` to render "× N" / "N PACK" subtitle and
     per-pack + line-total prices.

5. **Checkout review section (`S72tsk` / `OqB5X`).**
   - Items review reads from the cart shape; once the cart shape is
     finalized, this is a presentation-only update.

6. **Reorder screen (NEW per `02 §6`).**
   - Standalone NEW screen. Depends on the new product/order data
     model being in place so it can render historical line items with
     the "Pack of N" / "Carton of N" phrasing and per-line stepper.
   - Lower priority because it is not on the current critical path
     for ordering.

7. **Catalog cards (`prod1` / `dw7Oh`).**
   - Cosmetic: render the unit/pack subtitle. Depends only on read
     endpoints exposing `packSize` + unit label. Can ship in parallel
     with step 3.

Why schema-first and not screen-first: every surface in §2 reads or
writes the same handful of fields; flipping the model under live UI
twice will produce two visual regressions instead of one. Why vendor
form before PDP: without a producer, the PDP would be reading from
empty/nonexistent data and we'd have to seed mock tiers manually.

---

## 7. Open questions for me

Numbered. The first cluster (Q1–Q3) covers feature scope; Q4–Q11 cover
data/schema decisions; Q12+ cover ambiguous touchpoints.

### Feature scope

1. **What counts as "in scope" for this feature?** Is this just (a) the
   pack/MRP/wholesale + bundle-tiers schema + the PDP selector +
   cart/checkout/reorder display, or does it also include (b) the
   weight-gauge surfaces in cart/reorder (`02 §3.4` and the cart
   `gauge` block) since those are visually adjacent and read product
   weight × pack qty? Weight-gauge has its own
   `.claude-revamp/features/weight-gauge/` folder, so I assume **(a)**
   only — please confirm.

2. **Is the "−12% / SAVE Rs. 660 (12%)" red discount badge / green
   save pill on PDP and `dw7Oh` part of pack-pricing or a separate
   discounting feature?** The MRP-vs-wholesale diff is what generates
   the percentage, so it's structurally inside pack-pricing — but
   storefront discounting often lives in its own feature. Confirm
   whether to include the `pdpSave` / `mSaveB` / `B2CS7q` /
   "−12%" badge logic here.

3. **Is "Per unit: Rs. 100.42" caption a derived display string or an
   independently stored field?** Same question for the YMAL eyebrow
   "22 G · CARTON × 36" — is the `× 36` literal a stored attribute or
   a render of `packSize`? My (inferred) read is "derived"; please
   confirm so I don't carry a second schema field for it.

### Data / schema decisions

4. **`Net weight` field on the vendor form — units and granularity?**
   The label `Net weight` shows the value `4.5` with no unit suffix
   visible in this Pencil pass. Is it (a) per-pack net weight in kg?
   (b) per-unit weight in kg? (c) reuse of existing `products.weightGrams`?
   Cart subtitles render values like "1.008 KG" (KitKat × 12) and
   "21 KG · CARTON" (Sufi 5L Pack of 4) — both look like *per-pack*
   weights, so my (inferred) read is per-pack in kg.

5. **Bundle tier source-of-truth: per-pack price or discount percent?**
   The vendor form draws both `2,580` and `−2.3%` on each tier card
   together. Which is the input the vendor types and which is the
   computed display? Same question for cart total ("Rs. 2,280 / 2 =
   Rs. 1,140 per pack at the 12-pack tier" — derived from pack qty?
   from a stored `pricePerPackCents`?).

6. **Why does the PDP show four bundle options (6 / 12 / 24 / 48) but
   the vendor form draws only three tier slots (BUY 6 / BUY 12 /
   BUY 24)?** Three possibilities I can see: (a) the example data
   simply differs across screens (the vendor would have hit "+ Add tier"
   to add the 48 case); (b) the buyer also sees a default
   "1 pack" or "0 tier" option that the vendor doesn't author; (c) the
   vendor form is showing a partial view. I'm proceeding under (a)
   **(inferred)**, please confirm.

7. **Default-selected tier rule.** The PDP samples `12 pack` as
   selected (mid tier). What's the rule — vendor-pinned default,
   cheapest unit price, smallest qty, or smallest qty above a
   threshold? Affects both schema (do we store `isDefault` on a tier?)
   and PDP rendering.

8. **Cart line uniqueness.** If a buyer adds "Sufi Cooking Oil ×
   6 pack" and later adds "Sufi Cooking Oil × 12 pack" of the same
   product, are those two distinct cart lines or do they collapse to
   one "× 18 pack" line? The design doesn't show this state. Affects
   the cart-store key (`productId` vs `productId + selectedPackQty`).

9. **Reorder screen line items — how is the historical pack-size
   determined?** The reorder line "Sufi Cooking Oil 5 L · Pack of 4"
   uses "Pack of 4" — that's the historical bundle qty *or* is it the
   product's current pack-size attribute? Affects whether
   `order_items` needs to snapshot pack size at purchase time
   (per §3 point 5).

10. **Vendor-edit policy on pack tiers for live products.** Does
    editing tiers on an already-approved product (a) auto-publish
    instantly, (b) require admin re-approval, or (c) only allow
    drafting until next approval window? The form footer copy
    ("Saved automatically as draft. Submit when ready for admin
    review.") implies (b) but is generic.

11. **`order_items` snapshot fields.** Existing schema snapshots
    `unitPrice` and `totalPrice` (per-line) but does not store pack
    size or per-unit price. Should the new model add
    `packSizeAtPurchase` / `pricePerUnitAtPurchase` so receipts and
    reorder remain stable when the vendor later edits the product, or
    is recomputing-from-current-product acceptable?

### Ambiguous touchpoints

12. **Reorder line caption: "per unit" vs "per carton".** ri1 is
    `"Rs. 1,205 per unit"` and ri2 is `"Rs. 1,490 per carton"`
    (different word, both `mono 12/normal`). Is this driven by a
    per-product `unitLabel` field (the vendor picks the noun)? Or is
    it just an inconsistency in the Pencil sample? Affects whether
    `unitLabel` is part of the schema. The same ambiguity surfaces
    in cart subtitles ("PACK" vs "CARTON") and `prod1`'s "5 L ·
    CARTON" caption.

13. **`Pack size (units)` field on the form vs the buyer-visible
    bundle qty.** The form has a single `Pack size (units)` field
    ("30") describing the *unit pack* (a carton of 30 packs of chips,
    say). The buyer-visible bundle selector then offers "6 / 12 / 24 /
    48 *of those packs*". I want to confirm I'm reading the
    relationship correctly (units-per-pack on the product ×
    pack-quantity at the bundle = total units in cart) so the
    "Per unit" caption math is right. **(inferred)** but worth a
    one-line confirm.

14. **Stock unit.** The vendor form caption next to stock count says
    "cartons" (`VZxrR`). Confirm whether stock is in *packs/cartons*,
    not individual units. Affects ordering math (a buyer adding "6
    pack" decrements `stock` by 6, not 6 × packSize).

15. **Mobile checkout summary granularity.** Mobile checkout (`OqB5X`)
    shows a totals-only summary ("ORDER SUMMARY · 12 items") with no
    per-line list. Should we drop per-line rendering on mobile
    checkout entirely, or is the design simply abbreviated and a list
    is implied? Desktop checkout shows the list — not having one on
    mobile would be a real UX call.

16. **Detailed product card `dw7Oh` — where does it appear in
    production?** The card lives in `05 Components` only. Per `02 §3.3`
    and Q10 it is a distinct component from `prod1`. I did not find a
    placed instance of `dw7Oh` in any v2 buyer screen during this
    pass. Confirm whether `dw7Oh` ships as a placed component (and on
    which screens) or is reference-only — affects whether pack
    pricing has to render through this card at all.

17. **Discount semantics on the PDP buyer-side green pills.** Two
    different green pills appear on PDP bundle cards — `b3Save` (mid)
    vs `b4Best` (last). Are these the same concept (vendor-marked
    "best deal") or different (auto-computed "save" vs vendor-pinned
    "best")? Affects whether tiers carry one boolean flag, two flags,
    or none.

---

(End of pack-pricing surface map. Stopping here per scope — not
proposing the data model or any code.)
