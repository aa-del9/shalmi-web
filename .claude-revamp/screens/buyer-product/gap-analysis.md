# Gap Analysis — Buyer · Product Detail Page (PDP)

> **Phase:** Per-screen gap analysis (read-only).
> **Date produced:** 2026-05-02
> **Pencil source:** `Pencil-Design\Shalmi` — Buyer · Product · Desktop (`MqzEv`) + Buyer · Product · Mobile (`OVOxe`).
> **Existing code:**
> - Route: `apps/web/src/app/(storefront)/products/[slug]/page.tsx`
> - Component: `apps/web/src/modules/cart/components/product-detail/index.tsx`
> - Helpers: `apps/web/src/modules/cart/components/{add-to-cart-button,quantity-selector}/index.tsx`
> - Server util: `apps/web/src/modules/cart/utils/get-product-by-slug.ts`
> - API: `apps/web/src/app/api/products/[slug]/route.ts`
> - Cart store: `apps/web/src/modules/cart/stores/cart-store.ts`
> - Schemas: `packages/database/src/schema/{products,product-price-tiers}.ts`,
>   `packages/schemas/src/catalog/{product,product-price-tiers}.ts`
> **Pairs with:** `01-codebase-map.md`, `02-design-inventory.md`,
> `03-token-migration.md`, `04-design-system-implementation-log.md`,
> `features/pack-pricing/surface-map.md`.

This artifact answers two questions: (1) what does the Pencil PDP show
that the current code lacks (or has differently), and (2) what does the
current PDP code render that the Pencil design omits. It does **not**
propose code. Every diff row that is anything other than VISUAL_ONLY is
mirrored as a numbered question in §5.

Per CLAUDE.md, nothing is treated as "obvious removal" or "obvious
addition" — when in doubt the row escalates to AMBIGUOUS and becomes a
question.

---

## 1. Layout & structure

**Desktop PDP (`MqzEv`) — top-level frame layout (paper bg, 1440w):**

```
chrome1 (util strip · ink · [8,40])
chrome2 (header · paper · gap 32 · [16,40] · bottom 1px rule)
chrome3 (subnav · paper · gap 24 · [12,40] · top+bottom 1px rule)
crumb   (breadcrumb · [16,40,8,40])
pdp-main `NtLQi` (gap 48 · [12,40,32,40])  ← two-column
  ├─ Left: image gallery 560×560 + thumb strip below
  └─ Right column (info):
       title row (with "(48 × 21g)" eyebrow baked into title)
       price block `pdpPrice` `YH4xn`
         · Rs. 4,820   (mono 32/800)
         · strikethrough MRP
         · green pill: SAVE Rs. 660 (12%)
         · "Per unit: Rs. 100.42" caption
       bundle section `bundleSec` `rbpQj`
         · header: "CHOOSE BUNDLE SIZE"
         · 4 cards: 6 / 12 (selected) / 24 (SAVE) / 48 (BEST)
       qty row `qtyRow` `W2pDG`
         · qty stepper (44h) "− 2 +"
         · Add to cart (primary green)
         · Wishlist (heart) button
       delivery card
       spec section
ymal `s02mB`  ("you may also like" rail of `prod1` cards)
chromeFt1 (footer · ink)
```

**Mobile PDP (`OVOxe`) — single-column (420w):**

```
mch1     (app bar · 14/16 · bottom 1px rule)
mch2     (search wrap · [12,16,8,16])
mPdpCrumb (breadcrumb · [10,16,4,16])
mPdpHero `kQzgZ` (380h paper-2 hero image area, no thumb strip)
mPdpInfo `CQLdS` (gap 14 · [18,16,12,16])
  · title (with units eyebrow baked in)
  · price row `mZ0pT` `mwPIn` (Rs. 4,820 mono 24/800)
  · strikethrough MRP + save pill `B2CS7q`
  · "Per unit: Rs. 100.42" caption `JBvq6`
  · bundle section `mBundleSec` `Lckbj`  ← 2×2 grid of pack cards
mDelivCard `O6qlT` (paper-2 · 1.5px rule-2 · [12,16])
mSpecSec `S09fYZ` (gap 8 · padding 16)
sticky-bar `wovO4` (paper · [12,16] · top 1px rule)
  · qty stepper `PgOuM`
  · full-width "Add to cart" `enROY`
```

**Existing code layout (`ProductDetail` → `/products/[slug]/page.tsx`):**

```
page wrapper  (mx-auto max-w-7xl px-4 py-8)
ProductDetail (grid gap-8 md:grid-cols-2)
  Left: image gallery (aspect-square + thumb strip)
  Right (space-y-6):
    h1 title (2xl/3xl) + weight ("500g") + "From Rs. X" lowest price
    Separator
    "Bulk Offerings" header (Package icon + sm-semibold text)
    tier grid (sm:grid-cols-2): each tier shows
      · "minQty – maxQty pcs" or "minQty+ pcs"
      · "Rs. X /pc"
      · "Rs. X for Y pcs"
    quantity row (Qty: + QuantitySelector + total)
    stock indicator dot ("X in stock" / "Out of stock")
    AddToCartButton (full-width)
```

**Layout-level differences:**

1. **Container width.** Code uses `max-w-7xl` (≈1280px) inside `px-4 py-8`. Pencil draws the desktop content at 1440w with `padding [12,40,32,40]` on the pdp-main frame and 40px horizontal chrome padding. Visual width target shifts.
2. **Image gallery aspect.** Code uses `aspect-square` with `fill` and adapts to grid column width. Pencil draws a fixed 560×560 image area with thumb strip below. Sizing model differs (responsive square vs fixed-px).
3. **Right-column information density.** Code's right column is: title → weight → "From Rs. X" → tier grid → qty + total → stock → CTA. Pencil's right column is: title (with packaging eyebrow inside) → price block (with strikethrough + save pill + per-unit caption) → bundle selector → qty row (stepper + Add to cart + Wishlist) → delivery card → spec section. The set of sections is materially different and ordered differently.
4. **YMAL section.** Pencil includes a "you may also like" rail (`s02mB`) of `prod1` cards. Code has none.
5. **Mobile layout split.** Pencil mobile is structurally distinct from desktop: hero image is a separate paper-2 framed area (no thumb strip), info block is below, and a sticky bottom bar carries the qty stepper + Add to cart. Code is a single responsive grid (`md:grid-cols-2`) — no mobile-specific sticky bar, no separate hero treatment.
6. **Breadcrumb.** Pencil draws `crumb` and `mPdpCrumb`. Code has no breadcrumb.
7. **Delivery card / spec section.** Both are net-new sections in the design.

---

## 2. Element-by-element diff

Categories: VISUAL_ONLY · COPY_CHANGE · NEW_FIELD · REMOVED_FIELD ·
NEW_INTERACTION · CHANGED_INTERACTION · NEW_STATE · AMBIGUOUS.
"Pencil element" lists Pencil node IDs from the inventory / surface map
where known. "Existing element" points at code locations.

### 2.A Chrome / structure

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Util strip `lsM4s` (ink, util links + language toggle) | `StorefrontHeader` chrome (no util strip drawn today) | Chrome refactor; not PDP-specific. Out of scope here — flagged on the storefront chrome revamp. | VISUAL_ONLY |
| Header `viDkl` + Subnav `A88CV` | `StorefrontHeader` | Same — chrome scope, not PDP. | VISUAL_ONLY |
| Breadcrumb `wMEos` (desktop) / `mPdpCrumb` `hklEu` (mobile) — "Home > Categories > … > Product" | _(none)_ | Pencil shows a breadcrumb on PDP; code has no breadcrumb. New element + new structure. Exact path & link semantics undefined in design. | NEW_INTERACTION |
| Footer `f7fWg` (ink) | `StorefrontFooter` | Chrome scope. | VISUAL_ONLY |

### 2.B Image gallery (left column, desktop)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Main hero image (560×560, paper-2 background) | Main image (`aspect-square`, `bg-muted`, `rounded-xl`) | Pencil background is paper-2; current is `bg-muted` (now resolves to paper-2 post-Phase 3). Radius differs: Pencil cards radius 8 vs code `rounded-xl` (currently 16; post-Phase 3 → still ad-hoc). | VISUAL_ONLY |
| Thumb strip below main image | `flex gap-2 overflow-x-auto` thumbs (`size-16` rounded-lg) | Pencil thumb-strip layout/sizing not measured in this pass. Selection styling differs (Pencil unspecified vs code's `border-primary` + `border-muted`). Treat as visual-only retoken until thumb spec is captured. | VISUAL_ONLY |
| Mobile hero `kQzgZ` (paper-2 frame, 380h, no thumb strip drawn) | Same component renders responsively (`aspect-square`) | Mobile drops the thumb strip in design. Code keeps the same gallery on mobile. Removal-or-not is a design decision. | REMOVED_FIELD |

### 2.C Title block

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Product title `p4xJI`, e.g. "KitKat 2-Finger Carton (48 × 21g)" — packaging eyebrow `(48 × 21g)` baked into the title string | `<h1>{product.name}</h1>` (sans 2xl/3xl, font-bold, tracking-tight) | Pencil example bakes the units-per-pack and per-unit weight into the displayed title string. Code renders only `product.name`. Whether Pencil intends a separate computed eyebrow vs literal vendor-typed name is ambiguous. | AMBIGUOUS |
| Title type style (Pencil "H3" 20/700 sans for product name in inventory; PDP main title size not separately sampled — see surface map) | `text-2xl font-bold tracking-tight sm:text-3xl` | Pencil PDP title size not extracted in this pass; code uses 24/30px responsive bold. Likely VISUAL_ONLY retoken. | VISUAL_ONLY |
| Weight subtitle (Pencil shows weight inside title eyebrow + on cards as separate mono eyebrow) | `<p className="text-muted-foreground mt-1">{product.weightGrams}g</p>` | Pencil never shows raw grams alone on PDP — packaging info is folded into title/eyebrow. Removing the bare "500g" line is implied but not explicitly drawn. | AMBIGUOUS |

### 2.D Price block `pdpPrice` `YH4xn`

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Main price "Rs. 4,820" (mono 32/800 desktop, mono 24/800 mobile via `mwPIn`) | `<p className="mt-3 text-2xl font-bold">From {formatPrice(lowestPrice)}</p>` | Code shows "From Rs. X" using the lowest tier price (sans bold). Pencil shows the *currently-selected bundle* price (mono large). Different number, different font family, different leading word. | COPY_CHANGE |
| Strikethrough MRP next to main price | _(none)_ | New element — `MRP` is not stored anywhere today. | NEW_FIELD |
| Green save pill "SAVE Rs. 660 (12%)" (desktop) / `B2CS7q` mobile | _(none)_ | Computed display tied to MRP vs wholesale-or-bundle price. Per pack-pricing §7 Q2 the user confirmed this is in scope and computed from MRP + wholesale. | NEW_FIELD |
| Per-unit caption `JBvq6` "Per unit: Rs. 100.42" | _(none)_ | New caption. Per pack-pricing §7 Q3 user confirmed this is a separate stored field (not derived). | NEW_FIELD |
| Currency formatting "Rs. 4,820" with South-Asian digit grouping | `formatPrice(amount)` returns `Rs. ${amount.toLocaleString()}` (locale-default grouping; on most browsers en-US → "4,820"; on Pakistani locales would group differently) | Per `02 §7 Q17`, design standardizes on "Rs." + South-Asian digit grouping. `toLocaleString()` without a locale arg is non-deterministic. | CHANGED_INTERACTION |

### 2.E Bundle section `bundleSec` `rbpQj` (desktop) / `mBundleSec` `Lckbj` (mobile)

This is the central feature change. Per `02-design-inventory` Q12 the
existing tier-band model is being **replaced** by a discrete pack-based
model. The bundle selector has its own surface map
(`features/pack-pricing/surface-map.md`); rows below are the PDP-only
slice.

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Section header "CHOOSE BUNDLE SIZE" (mono eyebrow) | "Bulk Offerings" header with `Package` icon | Different copy ("CHOOSE BUNDLE SIZE" vs "Bulk Offerings") and different visual treatment (mono eyebrow vs sm-semibold text). | COPY_CHANGE |
| 4 bundle cards (`yFY54`/`lFdWh` selected/`HkdX5` SAVE pill/`Urrvl` BEST pill) — each card: pack count `N` (mono 22/800) + "pack" subtitle + total `Rs. X` (mono 13/700) + `Rs. Y/unit` caption | tier buttons (sm:grid-cols-2) — each: "minQty – maxQty pcs" + "Rs. X /pc" + "Rs. X for Y pcs" | The data model (qty bands → discrete packs), the visual layout (3-stacked text in mono vs 2-row sans), and the selection states (Pencil shows ink-filled selected card + green "SAVE" / "BEST" overlay pills; code shows `border-primary bg-primary/5 ring-primary/20`) all differ. | NEW_FIELD + NEW_INTERACTION + NEW_STATE |
| "BEST" pill on `Urrvl` | _(none)_ | Indicates either auto-marked best-deal or vendor-pinned. Per pack-pricing §7 Q17 still open — not implemented either way. | NEW_FIELD |
| "SAVE" pill on `HkdX5` | _(none)_ | Same — open in pack-pricing §7 Q17. | NEW_FIELD |
| Default-selected bundle (sample shows `12 pack` selected) | Code initializes `selectedTierIdx = 0` (cheapest band by minQty) | Default-selection rule differs and is not specified by Pencil (pack-pricing §7 Q7). | CHANGED_INTERACTION |
| Mobile 2×2 grid `Lckbj` (`mb1`/`mb2` selected/`mb3` SAVE/`mb4` BEST) | Same `sm:grid-cols-2` (responsive) | Layout shape matches by accident; data model still differs. | NEW_FIELD + NEW_INTERACTION |
| Existing per-tier `minQty/maxQty` band semantics | `productPriceTiersFormSchema` enforces continuous bands, no gaps, prices strictly decreasing, last tier `maxQty=null` | Per Q12 answer, the band model is being dropped. Removing the existing schema is an intentional REMOVED_FIELD that requires migration. | REMOVED_FIELD |

### 2.F Qty + Add-to-cart row `qtyRow` `W2pDG` (desktop)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Qty stepper (44h, "− 2 +") — counts **packs**, not units | `QuantitySelector` (h-8 = 32h) — counts individual pcs/units, sourced from `min/max/step=1` and tier `minQty` constraints | Pencil stepper unit = packs of selected bundle (per pack-pricing §3 inferred). Code stepper unit = individual pieces. Both the height (32→44) and the semantic of the counted unit change. | CHANGED_INTERACTION |
| "Add to cart" button (primary green, 40h, padding [0,16], radius 6) | `AddToCartButton` `<Button size="lg" className="w-full">` | Width: code is full-width below qty row; Pencil has Add-to-cart inline next to qty + Wishlist. Layout rearrangement. Variant mapping is fine (default = green). | VISUAL_ONLY |
| Wishlist (heart) button next to Add to cart | _(none)_ | New action. There is no wishlist data model anywhere in the codebase (no `wishlist` table, no API endpoint, no store). | NEW_INTERACTION |
| Stock indicator (Pencil draws stock copy on cards via "3 LOW STOCK" stamp on vendor dashboard, but no PDP stock indicator was inventoried in design) | `<div>{stock} in stock` / `Out of stock` indicator dot row | Pencil PDP omits a stock indicator dot. Removal-or-not undecided. | AMBIGUOUS |
| `outOfStock` disabled state on Add to cart | Code: `disabled={outOfStock || added}` ("Out of Stock" label) | Pencil PDP doesn't draw an out-of-stock state; the design system's component states were marked "to re-derive" (per `02 §7 Q7`). Behavior expected to remain but visual states aren't drawn. | NEW_STATE (to re-derive) |
| "Added to cart" temporary success state (1500ms) | Code: `setAdded(true); setTimeout(() => setAdded(false), 1500)` with Check icon | Pencil draws no success state for Add to cart. Drop, keep, or replace with toast — undecided. | AMBIGUOUS |

### 2.G Delivery card `mDelivCard` `O6qlT` (mobile drawn) — desktop equivalent likely inside right column

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Delivery card (paper-2 fill, 1.5px rule-2 stroke, [12,16] padding, 10 gap) | _(none)_ | New element. Content was not extracted in the inventory pass (likely shipping cost band info via the weight gauge, but specifics not captured). | NEW_FIELD |
| Desktop "delivery card" referenced in `02 §4.2` PDP description | _(none)_ | Same — desktop equivalent is described but not separately ID'd in this pass. | NEW_FIELD |

### 2.H Spec section `S09fYZ` (mobile drawn) — desktop equivalent likely inside right column

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Spec section (gap 8, padding 16) — content not extracted | _(none)_ | New section. Whether it lists product attributes (brand, weight, pack size, vendor, etc.), or is a "spec sheet" with key/value rows is unspecified. The existing schema has `name`, `weightGrams`, `vendorId`, `images`, `stock` — fields, but no rich attribute model. | NEW_FIELD |

### 2.I Mobile-only sticky bar `wovO4`

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Sticky bar (paper, [12,16], 1px top rule) at the bottom of mobile PDP | _(none)_ | New mobile pattern. Code does not have a sticky add-to-cart bar. | NEW_INTERACTION |
| Qty stepper `PgOuM` inside sticky bar | _(none on mobile separately)_ | Counts packs, not units (per §2.E). | NEW_INTERACTION |
| Full-width "Add to cart" `enROY` inside sticky bar | _(none on mobile separately)_ | Full-width green CTA. | NEW_INTERACTION |

### 2.J YMAL row `s02mB` (desktop) — mobile equivalent not explicitly named in inventory

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| "you may also like" rail of `prod1` (`QZyPu`) cards (gap 18, [16,40,32,40] padding) | _(none)_ | New section. Requires a "related products" data source. None exists in the API today (`/api/products/[slug]` returns only the single product). No category-based or vendor-based "related" endpoint exists. | NEW_FIELD + NEW_INTERACTION |

### 2.K Reusable card `prod1` (used in YMAL)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| `prod1` (`QZyPu`) — paper-2 image area, heart icon, package icon centered, "SHALMI WAREHOUSE" eyebrow, product name (sans 14/700), unit subtitle (mono 10/700, e.g. "5 L · CARTON × 36"), price row (mono 18/800 + strikethrough mono 12), green "+ Add" button | `apps/web/src/modules/storefront/components/product-card/index.tsx` (existing storefront card — used in BestPricesSection, SuperSaversSection, ProductCarouselSection) | The existing storefront `ProductCard` is the candidate to retoken into `prod1`. Diff between the two is itself a separate revamp; for PDP gap analysis, this is "PDP relies on the (revamped) prod1 in a new YMAL surface". | NEW_INTERACTION (relative to PDP) |

### 2.L Other code elements with no Pencil counterpart on PDP

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| _(none drawn)_ | "From Rs. X" prefix on lowest-tier price | Pencil does not show a "From" / range price (it shows the currently-selected bundle's exact total). Whether this is removal or just unrendered is open. | AMBIGUOUS |
| _(none drawn)_ | "Bulk Offerings" copy + `Package` lucide icon next to header | Replaced by "CHOOSE BUNDLE SIZE" mono eyebrow with no icon (per §2.E). | COPY_CHANGE |
| _(none drawn)_ | "Qty:" prefix next to QuantitySelector | Pencil qty stepper has no "Qty:" label drawn. | AMBIGUOUS |
| _(none drawn)_ | Stock indicator: green/red dot + "{stock} in stock" / "Out of stock" | See §2.F. | AMBIGUOUS |
| _(none drawn)_ | Single line total (`text-lg font-bold` next to per-unit price) | Pencil price block shows total at top + per-unit caption + save pill, but does not separately show a "line total = qty × per-unit" inline number on PDP. The `Rs. 4,820` price already represents the bundle total; no separate "qty × N" total line exists. | AMBIGUOUS |
| _(none drawn)_ | "Added to Cart" success state with Check icon (1.5s) | See §2.F. | AMBIGUOUS |
| _(none drawn)_ | `notFound()` and "Product Not Found" page metadata fallback | Pencil draws no PDP error state. Behavior expected to stay; flag for design coverage. | NEW_STATE |
| _(none drawn)_ | Page-level metadata (`generateMetadata`) returning title/description | Pencil scope is visual; metadata behavior unaffected. | VISUAL_ONLY |

---

## 3. Schema / type implications

For every NEW_FIELD / REMOVED_FIELD row in §2, here is what would change.
**These are required-changes-if-implemented descriptions, not proposals.**

### 3.1 Pack-based pricing model (replaces `product_price_tiers`)

This is the largest schema change. Already documented in detail in
`features/pack-pricing/surface-map.md` §3. Summary for the PDP slice:

- **`packages/database/src/schema/products.ts`** — needs new columns:
  pack size (`packSize int`), pack-level prices (`packMrpCents`,
  `packWholesalePriceCents`), per-unit weight (`unitWeightGrams int`,
  per pack-pricing Q4 user answer = grams). Existing `weightGrams`
  column's relationship to `unitWeightGrams` is unsettled (Open Q below).
- **`packages/database/src/schema/product-price-tiers.ts`** — entire
  table rebuilt or replaced (e.g. `product_pack_tiers` with
  `productId`, `packQty`, `pricePerPackCents`, optional flags for
  `isBest` / `isSave`, ordering). The `minQty`/`maxQty` band columns go
  away.
- **`packages/database/migrations/`** — new Drizzle migration: drop or
  rebuild `product_price_tiers`; add columns to `products`.
- **`packages/schemas/src/catalog/product.ts`** — `createProductSchema`
  loses `tiers: createProductPriceTiersSchema`, gains pack fields and
  pack-tier array; `productImageSchema` unchanged.
- **`packages/schemas/src/catalog/product-price-tiers.ts`** — both
  `productPriceTiersFormSchema` and `createProductPriceTiersSchema`
  removed; replaced with a "pack tiers" schema (e.g. each row =
  `{ packQty, pricePerPackCents, isBest?, isSave? }` with vendor-side
  validation: at least one row, packQty values strictly increasing,
  `pricePerPackCents` strictly decreasing, no duplicates).
- **`apps/web/src/modules/cart/types.ts`** — `PriceTier`/`CartItem`/
  `CartItemInput` lose `priceTiers: PriceTier[]` and gain pack metadata
  + a per-line `selectedPackQty` (or `selectedTierIndex`) so the cart
  remembers which bundle was chosen.
- **`apps/web/src/modules/cart/utils/resolve-price.ts`** — the
  `resolvePrice(priceTiers, quantity)` band-lookup is replaced by a
  pack-tier lookup (probably keyed by `selectedPackQty`).
- **`apps/web/src/modules/cart/utils/get-product-by-slug.ts`** — the
  `db.select().from(productPriceTiers)` query is replaced by the new
  pack-tiers query; the returned shape gains pack fields.
- **API endpoints touched** (per surface map §3.6):
  - `GET /api/products/[slug]` (`apps/web/src/app/api/products/[slug]/route.ts`)
    must return pack metadata + tiers + MRP + per-unit fields.
  - `GET /api/categories/[id]/products` (list) — new fields for cards.
  - `POST /api/vendor/products` + `PATCH /api/vendor/products/[id]`
    must accept the new payload.
  - `POST /api/checkout` must persist the chosen pack + per-pack price
    into `order_items`.
- **`packages/database/src/schema/order-items.ts`** —
  `unitPrice`/`totalPrice` snapshots may need to expand with
  `packSizeAtPurchase` / `pricePerUnitAtPurchase` to keep order
  history stable when the vendor later edits the product (see Q11 in
  the pack-pricing surface map).

### 3.2 MRP / save / per-unit caption

Adds three new fields to the product:

- `packMrpCents int` (or `mrpCents`) — used to compute the strikethrough
  MRP and the save pill amount.
- A computed display for "SAVE Rs. 660 (12%)" — derived at render time
  from `mrpCents − pricePerPackCents` and percentage.
- `pricePerUnitDisplayCents` (or computed) — the "Per unit: Rs. 100.42"
  caption. Per pack-pricing §7 Q3, user answer = "separate field" —
  meaning it's stored, not derived.

These touch `products.ts` schema, `createProductSchema`, the API
GET/POST shapes, the catalog list endpoints (so cards can render
strikethroughs), and `order_items` snapshots if we need stable
historical rendering.

### 3.3 Wishlist (heart icon next to Add to cart)

If implemented, adds a wholly new feature surface:

- New table (`wishlist` or `user_product_favorites`): `userId`,
  `productId`, composite PK or unique constraint, timestamps.
- New API endpoints: `GET /api/user/wishlist`, `POST /api/user/wishlist`
  (toggle), `DELETE /api/user/wishlist/[productId]`.
- Auth gate: signed-in only (currently `/profile/*` is the only middleware-gated path; PDP is public, so wishlist toggling on PDP needs to either (a) bounce to `/auth?redirect=` or (b) keep a local-storage wishlist for guests and merge on sign-in).
- New cart-store-or-equivalent client state OR a React Query hook.
- New `Heart` icon button next to Add to cart on PDP and presumably on
  cards (`prod1` already shows a heart).

### 3.4 YMAL ("you may also like") rail

If implemented:

- New API endpoint (e.g. `GET /api/products/[slug]/related`) since
  `/api/products/[slug]` returns only the single product and there is
  no general "products by category" call wired into PDP today.
  Alternatively a query parameter on the existing
  `GET /api/categories/[id]/products` that excludes the current
  product.
- Selection rule (same category? same vendor? best sellers? collab
  filtering?) is unspecified by the design.
- Reuses `prod1` (the retoken target of the existing
  `modules/storefront/components/product-card`).

### 3.5 Breadcrumb

If implemented:

- Requires the product → category(s) → root path. Schema already has
  `product_categories` (m:m) so a product can belong to multiple
  categories; the design doesn't specify which one wins for the crumb,
  or whether the crumb supports multi-parent display.
- New data fetch in `getProductBySlug` to also pull the primary
  category (and likely the category's `name` + `slug`).

### 3.6 Delivery card + Spec section

Both are NEW_FIELD with insufficient design detail to enumerate concrete
schema changes. Possible directions (all need confirmation):

- Delivery card may render the cart's weight gauge against this single
  product (shipping cost band given `unitWeightGrams × quantity ×
  packSize`). The weight-gauge feature has its own surface map; out of
  scope here per pack-pricing Q1.
- Spec section likely needs a new product attribute model (key/value
  pairs) — none exists. Could also be a fixed set of inline attributes
  (brand, vendor name, hub, packaging) sourced from existing tables,
  but the inventory pass did not extract the spec rows.

### 3.7 Removed: `product.weightGrams` ambiguity

Pencil PDP omits a bare grams display. The existing `<p>{weightGrams}g</p>`
line in `ProductDetail` may be redundant once packaging info is folded
into the title eyebrow. Whether `weightGrams` (the column) survives or
becomes `unitWeightGrams` (renamed) is the schema question — see Q below.

---

## 4. Behavior implications

For every NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE in §2, here
is what code paths would be affected.

### 4.1 Pack selection state

- **Component state** — `ProductDetail` currently keeps
  `selectedTierIdx` and `quantity`; in the new model it keeps
  `selectedPackQty` (or `selectedTierIndex`) and a pack-counted
  `quantity` (number of packs). Both selections affect the price block
  and the qty stepper.
- **Cart store** — `cart-store.ts` (`addItem` keyed by
  `productId`) becomes keyed by `productId + selectedPackQty` (open
  per pack-pricing Q8) so the buyer can have two distinct lines of the
  same product at different bundle sizes; the persisted `CartItem`
  shape grows.
- **Cart total math** — `getCartTotalPrice` in `cart-store.ts` calls
  `resolvePrice(item.priceTiers, item.quantity)`; this entire helper
  is reworked because the band lookup goes away.
- **Quantity stepper unit** — `QuantitySelector` is unit-agnostic; the
  PDP simply passes "number of packs" instead of "number of units".
  But the design draws the stepper inline with Add to cart on desktop
  and inside the sticky bar on mobile — layout change, no API change
  for the stepper itself.

### 4.2 Currency formatting

- `formatPrice(amount)` (`modules/cart/utils/resolve-price.ts`) returns
  `Rs. ${amount.toLocaleString()}`. To get South-Asian grouping
  ("4,86,300" for KPIs; design uses "Rs. 4,820" so the example doesn't
  trigger the lakh-grouping but the rule per `02 §7 Q17` is to
  standardize on one). Behavior change: pass an explicit locale (`en-IN`
  / `en-PK`) or implement custom grouping. Touches every caller of
  `formatPrice` (PDP, cart, checkout, success page, etc.) — system-wide.

### 4.3 Wishlist toggling (if in scope)

- New mutation hook (React Query) hitting `/api/user/wishlist`.
- Auth-gate UX: on click while logged-out → either inline auth modal
  (`AuthModal` already exists in `modules/auth/components/auth-modal/`)
  or push to `/auth?redirect=`.
- Card rendering: the heart icon must reflect current wishlist state
  (filled vs outline), so the PDP needs the wishlist set fetched on
  mount (or hydrated from a global wishlist-store).

### 4.4 YMAL data fetching

- New React Query hook (e.g. `useRelatedProductsQuery(slug)`) hitting a
  new endpoint.
- The PDP page is a Server Component today (`generateMetadata` and
  default export are `async`). YMAL can either be fetched server-side
  (extends `getProductBySlug`) or rendered as a Client Component child
  with React Query — both are consistent with patterns in the codebase
  (storefront sections do server-side; profile pages do client-side).

### 4.5 Breadcrumb data

- `getProductBySlug` would gain a category lookup. Already cached via
  `unstable_cache`.

### 4.6 Sticky add-to-cart bar (mobile)

- Pure presentation. New mobile-only component (`<MobilePdpStickyBar>`
  or similar). No schema or API change; reads the same selection state
  as the inline desktop CTA.

### 4.7 "Added to cart" success affordance

- Today's behavior: button label flips for 1.5s with a Check icon, then
  resets. Pencil draws no such state. Possible directions: drop the
  state, keep it, or replace with a Sonner toast + open-cart-sheet
  shortcut. Open question.

### 4.8 Out-of-stock handling

- Today's behavior: `outOfStock` disables the button and changes the
  label to "Out of Stock". Pencil PDP doesn't show this state. The
  design system implementation log (04) said component states are
  re-derived from tokens. PDP-level out-of-stock copy/visual is
  undecided — flag as a question.

### 4.9 Default-selected bundle on mount

- Code initializes `selectedTierIdx = 0` (first tier by minQty).
- Pencil sample shows mid-bundle (`12 pack`) selected with a
  vendor-pinned-or-rule-based rationale (see pack-pricing §7 Q7). The
  initialization rule changes; the component still derives `quantity`
  (= 1 pack? or vendor-set "pack starter qty"?) from the selection.

### 4.10 Product-not-found

- Today: `notFound()` triggers Next.js's default 404. Pencil draws no
  PDP empty/error state. Stays unchanged unless the design adds a
  "product unavailable" branded screen — undecided.

---

## 5. Open questions for me

Numbered. Every NEW_FIELD / REMOVED_FIELD / NEW_INTERACTION /
CHANGED_INTERACTION / NEW_STATE / COPY_CHANGE / AMBIGUOUS row in §2 maps
to one numbered question here. Hypotheses are listed but not chosen.

> The questions that overlap with the pack-pricing surface map are
> deliberately re-asked here, scoped to the PDP, because surface-map
> Open Qs Q4–Q11 still have answers pending and the PDP cannot move
> until they're resolved.

---

**1. (NEW_INTERACTION) Breadcrumb on PDP — desktop `wMEos` and mobile `mPdpCrumb`.**

- Observed: Pencil draws a breadcrumb row above pdp-main on desktop
  ([16,40,8,40]) and a compact one on mobile ([10,16,4,16]). Code has
  no breadcrumb anywhere on PDP. The schema has
  `product_categories` (m:m), so a product can be in multiple
  categories, and the design doesn't specify how the crumb resolves a
  multi-parent product.
- Question: which category should drive the breadcrumb when a product
  belongs to more than one, and what is the exact breadcrumb format
  (Home › {category.name} › {product.name}? include sub-categories?
  link targets?)?
- Plausible answers:
  (a) Pick the first category by some tie-breaker (created order /
      lowest sort order) and render `Home › {Category} › {Product}`.
  (b) Use the category the buyer arrived from (referer / search-param
      `from=category-slug`), falling back to (a).
  (c) Render a "primary category" via a new `isPrimary` flag on
      `product_categories`.
- **Answer:** STUBBED — see 06-scope-cut.md feature: Admin "Catalog" sidebar grouping + Breadcrumb component. Implement with placeholder: IN_SCOPE — install shadcn `breadcrumb` once, retoken, reuse across screens. Add `// TODO(post-v1):` comment at every touch point. Pick first category by `product_categories` insert order; render `Home › {Category} › {Product}`.

---

**2. (AMBIGUOUS) Title eyebrow / packaging info inside `product.name`.**

- Observed: Pencil example title is literally
  "KitKat 2-Finger Carton (48 × 21g)" — packaging count + per-unit
  weight are baked into the displayed string. Code renders only
  `product.name`. The pack-pricing surface map (§7 Q3) confirmed
  per-unit caption is a separate stored field, but didn't decide
  whether the title-eyebrow `(48 × 21g)` is also stored vs. computed.
- Question: is the `(48 × 21g)` portion part of the stored
  `products.name`, or rendered automatically from `packSize` +
  `unitWeightGrams`?
- Plausible answers:
  (a) Vendor types it manually into `name` (current model — keep
      `name` as-is, no derivation).
  (b) `name` stays "KitKat 2-Finger Carton" and the eyebrow
      `(48 × 21g)` is computed and concatenated at render time from
      `packSize` and `unitWeightGrams`.
  (c) `name` stays plain and the eyebrow renders as a separate text
      node above/inside the title block (so it gets its own type
      style).
- **Answer:** STUBBED — see 06-scope-cut.md feature: Pack-based pricing schema migration (replaces tier-band model). Implement with placeholder: IN_SCOPE — schema lands first then PDP/cart/vendor-form; no placeholder needed. Add `// TODO(post-v1):` comment at every touch point. Computed at render from `packSize` + `unitWeightGrams`.

---

**3. (AMBIGUOUS) Bare weight subtitle "{weightGrams}g".**

- Observed: code renders `<p>{product.weightGrams}g</p>` directly
  under the title. Pencil PDP shows packaging info inside the title
  eyebrow only — there is no standalone grams line.
- Question: drop the bare weight subtitle entirely, or is Pencil just
  not drawing it because the example product encodes weight in the
  title eyebrow?
- Plausible answers:
  (a) Drop — packaging info is handled by the title eyebrow per Q2
      and a separate spec section.
  (b) Keep — visible somewhere else (e.g., inside the spec section)
      as "Net weight: 21g per unit".
  (c) Repurpose to show *pack* weight (unit weight × pack size) as a
      single line.
- **Answer:** Drop — packaging info handled by title eyebrow + spec section.

---

**4. (COPY_CHANGE) Main price copy — "From Rs. X" vs "Rs. 4,820".**

- Observed: code shows `From {formatPrice(lowestPrice)}` (= the
  lowest priceCents across all tiers). Pencil shows `Rs. 4,820` (mono
  32/800), which is the price of the currently-selected bundle.
- Question: confirm the price displayed in the main price block is
  the per-pack-price-times-pack-quantity of the *currently selected
  bundle* (so it changes as the buyer picks 6 / 12 / 24 / 48), with no
  "From" prefix anywhere.
- Plausible answers:
  (a) Yes, current-bundle total only; no "From".
  (b) Show current-bundle total AND keep a "From Rs. X" eyebrow when
      no bundle is selected (e.g., before initial render).
  (c) Show per-pack price (e.g., Rs. 2,510 / pack) instead of the
      total, with the total derived elsewhere.
- **Answer:** STUBBED — see 06-scope-cut.md feature: Pack-based pricing schema migration (replaces tier-band model). Implement with placeholder: IN_SCOPE — schema lands first then PDP/cart/vendor-form; no placeholder needed. Add `// TODO(post-v1):` comment at every touch point. Yes — current-bundle total only; remove "From" prefix.

---

**5. (NEW_FIELD) MRP (strikethrough price).**

- Observed: Pencil draws a strikethrough MRP next to the main price.
  The vendor form draws an `MRP (Rs.)` input alongside `Wholesale
  price (Rs.)` (per pack-pricing surface map §2). Existing
  `products` table has no MRP column.
- Question: confirm `MRP` is a per-product (per-unit? per-pack?)
  field that the vendor types, and is required on every product (or
  optional, where omission = no strikethrough drawn).
- Plausible answers:
  (a) New required column `packMrpCents int` on `products`,
      vendor-typed; if equals or below pack price, no save pill drawn.
  (b) Same as (a) but `unitMrpCents` (per-unit MRP) and the pack
      strikethrough is `unitMrpCents × packSize`.
  (c) Optional — if missing, hide the strikethrough and save pill
      entirely.
- **Answer:** STUBBED — see 06-scope-cut.md feature: Pack-based pricing schema migration (replaces tier-band model). Implement with placeholder: IN_SCOPE — schema lands first then PDP/cart/vendor-form; no placeholder needed. Add `// TODO(post-v1):` comment at every touch point. Optional `packMrpCents` — if missing, hide strikethrough + save pill. Vendor isn't forced to set MRP.

---

**6. (NEW_FIELD) Green save pill "SAVE Rs. 660 (12%)".**

- Observed: Pencil draws a green save pill next to the main price
  (desktop `pdpPrice`; mobile `B2CS7q`). The pack-pricing surface
  map (§7 Q2) confirmed this is in scope; surface-map Q5 left the
  source-of-truth open between (per-pack-price minus MRP) and a
  vendor-typed `discountPercent`.
- Question: is the save amount and percentage purely derived (from
  MRP and the chosen bundle's per-pack price), or does the vendor
  type it directly?
- Plausible answers:
  (a) Derived — `save = mrp − pricePerPack`, `percent =
      round((save / mrp) × 100)`.
  (b) Vendor types `discountPercent`; we display the typed percent
      and back-compute the rupees from MRP × percent.
  (c) Both — vendor can override the derived value.
- **Answer:** STUBBED — see 06-scope-cut.md feature: Pack-based pricing schema migration (replaces tier-band model). Implement with placeholder: IN_SCOPE — schema lands first then PDP/cart/vendor-form; no placeholder needed. Add `// TODO(post-v1):` comment at every touch point. Derived: `save = mrp − pricePerPack`, `percent = round((save/mrp)×100)`.

---

**7. (NEW_FIELD) Per-unit caption "Per unit: Rs. 100.42".**

- Observed: Pencil draws "Per unit: Rs. 100.42" `JBvq6` below the
  price block on desktop and mobile. Pack-pricing §7 Q3 user answer
  said "separate field" (= stored, not derived).
- Question: confirm this is stored explicitly (e.g., a
  `pricePerUnitCents` field per product or per pack tier) rather than
  computed from `pricePerPackCents / packSize`. And: does this string
  show ".42" decimals (real division output) — meaning the field is
  stored as a decimal? — or is it just an example of arbitrary
  vendor-typed content?
- Plausible answers:
  (a) Stored as `pricePerUnitCents` (integer cents) per product; the
      ".42" comes from the integer cents → display rendering.
  (b) Stored as `pricePerUnitCents` per *pack tier* (so each
      bundle's per-unit caption can differ).
  (c) Computed at render — `pricePerPackCents / packSize` rounded to
      2 decimals (despite Q3 answer saying "separate field", this is
      worth a final confirm).
- **Answer:** STUBBED — see 06-scope-cut.md feature: Pack-based pricing schema migration (replaces tier-band model). Implement with placeholder: IN_SCOPE — schema lands first then PDP/cart/vendor-form; no placeholder needed. Add `// TODO(post-v1):` comment at every touch point. Stored as integer `pricePerUnitCents` per product per `02 §7 Q12 / pack-pricing surface map`.

---

**8. (CHANGED_INTERACTION) Currency formatting / digit grouping.**

- Observed: `formatPrice` uses `amount.toLocaleString()` with no
  locale argument — non-deterministic across environments. `02 §7 Q17`
  user answer = standardize on South-Asian digit grouping with "Rs."
  prefix.
- Question: which exact rule — `Intl.NumberFormat('en-IN', ...)`
  yields "4,86,300"; `'en-PK'` and `'ur-PK'` may differ. And: do we
  always render integer cents as integer rupees (no decimals), or do
  we honor the ".42" per-unit caption decimals?
- Plausible answers:
  (a) `Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })` for
      all `Rs.` displays (matches "4,86,300" sample on vendor
      dashboard); decimals only on `pricePerUnitCents` rendering.
  (b) Custom formatter that always South-Asian-groups and never
      shows decimals; per-unit caption rounds to 0 decimals
      (rejecting the ".42" example as design-side filler text).
  (c) Locale-aware via `next-intl` once i18n lands.
- **Answer:** STUBBED — see 06-scope-cut.md feature: Currency formatter (South-Asian grouping + lakh notation). Implement with placeholder: IN_SCOPE — replace `amount.toLocaleString()` callers with new `formatPrice` using `Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })`. Add `// TODO(post-v1):` comment at every touch point. `Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })` for all `Rs.` displays; decimals only on per-unit caption.

---

**9. (COPY_CHANGE) Bundle section header — "CHOOSE BUNDLE SIZE" vs "Bulk Offerings".**

- Observed: code renders "Bulk Offerings" with a Package icon. Pencil
  renders the mono-eyebrow "CHOOSE BUNDLE SIZE" header (no icon).
- Question: confirm the new copy is "CHOOSE BUNDLE SIZE" (mono
  eyebrow style) and the icon is dropped.
- Plausible answers:
  (a) Use Pencil copy verbatim; drop Package icon.
  (b) Keep an icon for visual continuity with cards (heart, package
      etc. appear on prod1) but use Pencil copy.
  (c) "Bulk Offerings" stays — Pencil sample is just an example
      header.
- **Answer:** Use Pencil copy verbatim ("CHOOSE BUNDLE SIZE"); drop Package icon.

---

**10. (NEW_FIELD + NEW_INTERACTION + NEW_STATE) Bundle cards (`yFY54`/`lFdWh`/`HkdX5`/`Urrvl`) — full geometry, content, and selection states.**

- Observed: 4 bundle cards on desktop (selected card = ink-filled
  with white text per surface map; SAVE pill on `HkdX5`; BEST pill on
  `Urrvl`). Each card shows `N` (mono 22/800) + "pack" + total +
  `/unit` caption. Mobile shows 2×2 grid `Lckbj`. The data model
  requires `packQty`, `pricePerPackCents`, optional badge flags. None
  of this is in the schema today.
- Question: confirm the card content shape (4 fields per card: pack
  qty, total, per-unit caption, optional badge), the selected-state
  visual (ink fill + white text), and the badge taxonomy
  (`SAVE` vs `BEST` are two flags vs one flag with two values).
- Plausible answers:
  (a) One badge flag per tier with enum `none | save | best`;
      selected-state is `bg-ink text-white` per surface map.
  (b) Two booleans per tier (`isSave`, `isBest`) — both could
      theoretically appear on the same tier (the design doesn't show
      that case).
  (c) No stored badge flags — `BEST` = highest qty tier, `SAVE` =
      tier with biggest delta from MRP (auto-computed).
- **Answer:** STUBBED — see 06-scope-cut.md feature: Pack-based pricing schema migration (replaces tier-band model). Implement with placeholder: IN_SCOPE — schema lands first then PDP/cart/vendor-form; no placeholder needed. Add `// TODO(post-v1):` comment at every touch point. One badge flag per tier with enum `none | save | best`; selected-state `bg-ink text-white`.

---

**11. (REMOVED_FIELD) Existing tier-band schema (`product_price_tiers`).**

- Observed: code currently relies on `product_price_tiers` with
  `minQty/maxQty/priceCents` and a strict no-gaps validator. Per
  `02 §7 Q12` user confirmed the band model is dropped in favor of
  pack tiers. The PDP gap analysis flags this as an explicit
  removal so it's not silent.
- Question: confirm the removal path — drop the
  `product_price_tiers` table outright (with a destructive
  migration), or rebuild it as `product_pack_tiers` with the new
  columns? Which Drizzle migration strategy (separate add+drop vs
  rename+ALTER)?
- Plausible answers:
  (a) Drop `product_price_tiers` and add a fresh `product_pack_tiers`
      table (cleanest; loses any dev-data still in the old table).
  (b) Rename + ALTER columns in place (preserves table name history;
      messier migration).
  (c) Keep the old table dormant for one release while writing to the
      new one (safer for staged rollout).
- **Answer:** STUBBED — see 06-scope-cut.md feature: Pack-based pricing schema migration (replaces tier-band model). Implement with placeholder: IN_SCOPE — schema lands first then PDP/cart/vendor-form; no placeholder needed. Add `// TODO(post-v1):` comment at every touch point. Drop `product_price_tiers` and add fresh `product_pack_tiers`. Cleanest.

---

**12. (CHANGED_INTERACTION) Default-selected bundle.**

- Observed: code uses `selectedTierIdx = 0` (smallest band).
  Pencil sample shows `12 pack` (mid tier) selected. Surface map
  §7 Q7 left this open.
- Question: what determines the default selection?
- Plausible answers:
  (a) Vendor-pinned: a `isDefault` boolean on one tier row.
  (b) Auto-rule: the tier with the lowest per-unit price.
  (c) Auto-rule: the tier just below the median pack qty (so 12 in a
      6/12/24/48 set).
- **Answer:** Vendor-pinned `isDefault` boolean on one tier row.

---

**13. (CHANGED_INTERACTION) Qty stepper unit & height.**

- Observed: Pencil stepper is 44h and counts packs (sample shows
  "− 2 +"). Code stepper is 32h (`size-8` buttons + h-8 input) and
  counts individual pieces with a `min={1}` and `max={stock}`
  constraint.
- Question: confirm the stepper unit is "packs of the
  currently-selected bundle size" and the floor/ceiling rules
  (min = 1 pack, max = vendor's `stock` interpreted as number of
  packs per pack-pricing §7 Q14 still pending).
- Plausible answers:
  (a) Min = 1 pack; max = `stock` (where stock is now in packs);
      changing the bundle resets quantity to 1.
  (b) Same min/max but changing the bundle preserves total units and
      back-converts (e.g., 2× 12-packs (=24 units) becomes 1× 24-pack
      (=24 units)).
  (c) Min = "starter pack qty" the vendor pins per tier (so the 12-pack
      tier might force min=2 = 24 units minimum).
- **Answer:** STUBBED — see 06-scope-cut.md feature: Pack-based pricing schema migration (replaces tier-band model). Implement with placeholder: IN_SCOPE — schema lands first then PDP/cart/vendor-form; no placeholder needed. Add `// TODO(post-v1):` comment at every touch point. Min = 1 pack, max = `stock` (interpreted as packs); changing the bundle resets quantity to 1.

---

**14. (NEW_INTERACTION) Wishlist (heart) button next to Add to cart.**

- Observed: Pencil draws a `Heart` icon button beside Add to cart
  on desktop `qtyRow`. The icon also appears on `prod1` cards. There
  is **no** `wishlist` table, API route, or store anywhere in the
  codebase.
- Question: is wishlist in scope for this revamp, and if so, does it
  persist server-side (signed-in only) or also support guest
  local-storage with merge-on-sign-in?
- Plausible answers:
  (a) In scope, signed-in only — bounce guest clicks to
      `/auth?redirect=/products/[slug]`.
  (b) In scope, hybrid — guest clicks store locally; merge to
      server-side wishlist on sign-in.
  (c) Not in scope yet — render the heart but make it a no-op (or
      drop the heart on PDP for this revamp).
- **Answer:** STUBBED — see 06-scope-cut.md feature: Wishlist / Saved Items. Implement with placeholder: heart icons render but are no-ops (or removed); account drawer "Saved items" row hidden; header "Saved" button hidden. Add `// TODO(post-v1):` comment at every touch point. Signed-in only — bounce guest clicks to `/auth?redirect=/products/[slug]`. (Defer guest local-storage merge until v2.)

---

**15. (AMBIGUOUS) Stock indicator on PDP.**

- Observed: code renders a green/red dot + "{stock} in stock" or
  "Out of stock" line. Pencil PDP draws no stock indicator
  (low-stock language only appears on the vendor dashboard via the
  red "3 LOW STOCK" stamp, which is a vendor surface).
- Question: drop the stock-indicator line on PDP entirely, surface
  it elsewhere (e.g., inside the spec section as
  `Stock: 12 cartons left`), or only render it conditionally (e.g.,
  only when stock < threshold)?
- Plausible answers:
  (a) Drop entirely from PDP — out-of-stock is communicated via the
      Add-to-cart disabled state (re-derived per design system Q7).
  (b) Move into the spec section as a key/value row.
  (c) Conditional — show only when stock low, with copy like "Only
      X cartons left".
- **Answer:** Drop entirely from PDP — out-of-stock is communicated via Add-to-cart disabled state.

---

**16. (NEW_STATE) Out-of-stock disabled state on Add to cart.**

- Observed: code disables the button and shows "Out of Stock" copy
  when `stock <= 0`. Pencil draws no out-of-stock state.
- Question: keep the disabled state with the same copy, change the
  copy ("Sold out"? "Notify me"? mirror vendor stamp wording
  "OUT OF STOCK"?), or replace with a different affordance (e.g.,
  hide the CTA and show a "Notify when back in stock" form)?
- Plausible answers:
  (a) Keep disabled + "Out of Stock" copy.
  (b) Switch to an inverse state — show "Notify me" CTA that opens
      a small input dialog (new feature; out of revamp scope).
  (c) Hide CTA, render an inline `red` stamp "OUT OF STOCK" and
      disable the qty stepper.
- **Answer:** Keep disabled + "Out of Stock" copy (existing behavior).

---

**17. (AMBIGUOUS) "Added to Cart" temporary success state.**

- Observed: code flips the button label to "Added to Cart" with a
  Check icon for 1.5s and disables the button. Pencil draws no such
  state — the design language uses Sonner toasts elsewhere
  (`StorefrontHeader` opens cart sheet via React state; no toast
  noted in PDP context).
- Question: drop the inline transition, replace with a Sonner toast
  ("Added to cart · View cart"), or keep the inline transition but
  retoken to design tokens?
- Plausible answers:
  (a) Drop inline transition; show a Sonner toast (matches design
      system Toaster which is already mounted).
  (b) Keep inline transition, retoken (uses `green-2` background).
  (c) Both — toast plus a brief check overlay.
- **Answer:** Drop inline transition; show Sonner toast (matches existing `sonner` integration).

---

**18. (NEW_FIELD) Delivery card (mobile `mDelivCard`, desktop equivalent).**

- Observed: Pencil draws a paper-2 / 1.5px rule-2 card; the inventory
  pass did not extract its content. The PDP description in `02 §4.2`
  mentions a "delivery card" but no copy was sampled.
- Question: what does the delivery card contain — pricing band per
  weight tier (mirroring the cart's weight gauge, scaled to a single
  product), a generic "MNP delivery" trust message, or a
  per-buyer-address ETA? And what data drives it?
- Plausible answers:
  (a) Generic copy block, no data dependency
      ("MNP delivery · 1–3 days").
  (b) Weight-gauge mini view: shows shipping cost band given the
      current pack size × selected qty × `unitWeightGrams`.
  (c) Per-address ETA — requires the buyer to be signed-in and have
      a saved address.
- **Answer:** STUBBED — see 06-scope-cut.md feature: PDP spec section + delivery card. Implement with placeholder: spec section as a fixed inline list (brand + vendor + weight + pack size from existing data once pack-pricing lands); delivery card as static copy. Add `// TODO(post-v1):` comment at every touch point. Static copy "MNP delivery · 1–3 days".

---

**19. (NEW_FIELD) Spec section (mobile `mSpecSec`, desktop equivalent).**

- Observed: gap 8 / padding 16 frame; content not extracted. No
  product attribute model exists.
- Question: what fields does the spec section list, and is there a
  fixed schema (brand / vendor / weight / pack size / hub / etc.) or
  a generic key-value attribute table per product?
- Plausible answers:
  (a) Fixed inline list sourced from existing fields
      (`vendor.shopName`, `weightGrams`, `packSize`, `hub`).
  (b) New `product_attributes` table — `productId`, `key`, `value`
      with order, vendor-typed in the add-product form.
  (c) Markdown-style description field on `products` rendered
      verbatim (single rich-text column).
- **Answer:** STUBBED — see 06-scope-cut.md feature: PDP spec section + delivery card. Implement with placeholder: spec section as a fixed inline list (brand + vendor + weight + pack size from existing data once pack-pricing lands); delivery card as static copy. Add `// TODO(post-v1):` comment at every touch point. Fixed inline list (brand + vendor + weight + pack size from existing fields).

---

**20. (NEW_INTERACTION) Mobile sticky add-to-cart bar `wovO4`.**

- Observed: Pencil mobile PDP has a bottom sticky bar with qty
  stepper `PgOuM` and full-width Add to cart `enROY`. Code has no
  mobile sticky bar; it renders the same right-column layout
  responsively.
- Question: is the qty stepper available *only* in the sticky bar on
  mobile (i.e., the qty stepper is removed from the inline info
  block), or does it appear in both places?
- Plausible answers:
  (a) Sticky bar is the only qty + Add-to-cart surface on mobile
      (pure migration from inline to sticky).
  (b) Inline qty + sticky qty are both present and stay in sync.
  (c) Inline shows the bundle selector + qty hint; sticky shows
      Add-to-cart and a compact stepper that mirrors the inline
      selection.
- **Answer:** Sticky bar is the only qty + Add-to-cart surface on mobile (pure migration from inline to sticky).

---

**21. (NEW_FIELD + NEW_INTERACTION) YMAL ("you may also like") rail `s02mB`.**

- Observed: Pencil draws a rail of `prod1` cards under `pdp-main`.
  No related-products endpoint exists; no selection rule documented.
- Question: how are related products selected, what's the request
  budget (1 row of N? infinite scroll?), and is there a fallback
  when the product has no category or there are too few related
  items?
- Plausible answers:
  (a) Same primary category, exclude self, ordered by stock-or-recency,
      fixed take=8.
  (b) Same vendor, exclude self, take=8.
  (c) Mix — half category, half vendor; or popularity-based via a
      future query.
- **Answer:** Same primary category, exclude self, ordered by stock-or-recency, fixed take=8. New endpoint `GET /api/products/[slug]/related`.

---

**22. (REMOVED_FIELD) Mobile thumbnails strip.**

- Observed: Pencil mobile PDP draws only `mPdpHero` (380h paper-2
  hero) — no thumbnail strip below. Code renders the same gallery
  on mobile, including `flex gap-2 overflow-x-auto` thumbs whenever
  `images.length > 1`.
- Question: drop the mobile thumb strip entirely, swipe-through the
  hero (carousel-style) instead, or render thumbs in a different
  position (e.g., dot pagination under the hero)?
- Plausible answers:
  (a) Drop thumbs on mobile; show only the first image.
  (b) Convert hero to a swipeable carousel with dot pagination.
  (c) Move thumbs into a horizontal scroll inside the hero frame
      (overlay).
- **Answer:** Drop thumbs on mobile; show only the first image (matches Pencil mobile hero).

---

**23. (AMBIGUOUS) "Qty:" label prefix.**

- Observed: code prepends `<span>Qty:</span>` before the
  QuantitySelector. Pencil qty rows draw the stepper without a
  visible "Qty:" label.
- Question: drop the "Qty:" prefix entirely, replace with an icon,
  or keep it as a screen-reader-only label for accessibility while
  hiding it visually?
- Plausible answers:
  (a) Drop the visible label; rely on stepper UI.
  (b) Keep visually-hidden as `sr-only` for a11y.
  (c) Replace with an icon (Pencil's lucide guidance pairs icons
      with labels — but the qty stepper is in chrome territory where
      glyph-only is allowed per `02 §1.8`).
- **Answer:** Keep visually-hidden as `sr-only` for a11y.

---

**24. (AMBIGUOUS) Inline line-total under qty.**

- Observed: code shows `formatPrice(currentUnitPrice)/pc` and
  `formatPrice(lineTotal)` to the right of the qty stepper. Pencil
  doesn't draw a separate "qty × per-unit = total" inline number on
  PDP; the main price block already shows the bundle total, and the
  per-unit caption is in the price block.
- Question: drop the inline "per-unit + total" cluster next to the
  qty stepper entirely (because the price block already covers
  both), or keep one of them (e.g., a running total that updates
  with qty changes)?
- Plausible answers:
  (a) Drop entirely — the price block IS the total.
  (b) Keep a running "total (qty × bundle price)" only; drop the
      per-unit duplicate.
  (c) Move both into the spec/delivery card as a "running total"
      row.
- **Answer:** Drop entirely — the price block IS the total.

---

**25. (AMBIGUOUS) Product-not-found state.**

- Observed: code calls Next.js `notFound()` and `generateMetadata`
  returns `{ title: 'Product Not Found' }`. Pencil draws no PDP
  empty state.
- Question: keep the default Next.js 404, or design a branded
  "product unavailable" PDP fallback?
- Plausible answers:
  (a) Keep default Next.js 404.
  (b) Add a `not-found.tsx` under `app/(storefront)/products/[slug]/`
      with branded copy + suggestion to browse the parent category.
  (c) Inline error state inside the same PDP route (no `notFound()`).
- **Answer:** Keep default Next.js 404.

---

**26. (NEW_INTERACTION) `prod1` card heart icon.**

- Observed: `prod1` reusable component has a heart in the top-right
  of the image area. Used in YMAL on PDP and on home best-prices /
  hot-products. Same wishlist data dependency as Q14.
- Question: is the heart on `prod1` cards interactive (toggle
  wishlist), display-only (visited / saved), or purely decorative?
- Plausible answers:
  (a) Interactive — same wishlist endpoint as Q14.
  (b) Display-only — fills if the product is already in the
      wishlist, but tapping does nothing on cards (only on PDP).
  (c) Decorative — keep it as a visual element until wishlist
      ships.
- **Answer:** STUBBED — see 06-scope-cut.md feature: Wishlist / Saved Items. Implement with placeholder: heart icons render but are no-ops (or removed); account drawer "Saved items" row hidden; header "Saved" button hidden. Add `// TODO(post-v1):` comment at every touch point. Interactive — same wishlist endpoint as Q14.

---

**27. (REMOVED_FIELD) Util strip language toggle on PDP chrome.**

- Observed: chrome `lsM4s` includes the language toggle. Per `02 §7
  Q16` user said EN-only ships first but the toggle stays in the
  design system. The PDP renders inside this chrome.
- Question: does the language toggle appear on PDP chrome but as a
  no-op (clickable, single state EN), or is it hidden until i18n
  lands?
- Plausible answers:
  (a) Render the toggle, EN selected, no-op on click (matches
      `LanguageToggle` primitive shipped in 04).
  (b) Hide the toggle entirely until i18n is wired.
  (c) Render it disabled (greyed out) with a tooltip.
- **Answer:** STUBBED — see 06-scope-cut.md feature: i18n / language toggle plumbing (presentational EN-only). Implement with placeholder: render LanguageToggle visible-but-inert (visual only) with no state plumbing; clicking does nothing. Add `// TODO(post-v1):` comment at every touch point. EN selected, no-op on click.

---

**28. (VISUAL_ONLY but flagged) "From {price}" prefix removal vs lowest-price fallback.**

- Observed: code's "From" prefix is only meaningful when there are
  multiple price tiers. With pack-based pricing, the buyer always
  selects a bundle, so a single "current" price exists. But before
  the buyer selects (or for a hypothetical product with one tier),
  what shows?
- Question: at PDP first paint (before user interaction), is the
  selected bundle's price shown immediately, and is "From" copy
  ever used anywhere on PDP?
- Plausible answers:
  (a) Default-selected bundle's price renders immediately; "From"
      is dead copy and gets removed.
  (b) For products with no bundle tiers (just a base wholesale
      price), show that price with no "From".
  (c) Keep "From" only for catalog list cards (where
      "From Rs. X / pack" makes sense across tier ranges); never on
      PDP.
- **Answer:** Default-selected bundle's price renders immediately; "From" copy removed from PDP.

---

**29. (AMBIGUOUS) Existing `weightGrams` column relationship to new pack-pricing fields.**

- Observed: `products.weightGrams int notNull` exists today. The
  pack-pricing surface map confirmed `unitWeightGrams` (per-unit, in
  grams) is added. `weightGrams` (an int with no documented
  meaning beyond "weight in grams") is now ambiguous — is it the
  per-pack net weight (used for shipping) or per-unit?
- Question: rename `weightGrams` to `packWeightGrams` (= per-pack net
  weight, used by cart's weight gauge), keep both fields with clear
  different meanings, or drop `weightGrams` if it's redundant given
  `unitWeightGrams × packSize`?
- Plausible answers:
  (a) Rename to `packWeightGrams`; recompute existing data once
      `unitWeightGrams` is backfilled.
  (b) Keep `weightGrams` as a stored convenience (=
      `unitWeightGrams × packSize`) for query speed; backfill in
      migration; mark non-null with default.
  (c) Drop `weightGrams` entirely; compute on the fly from
      `unitWeightGrams × packSize` everywhere.
- **Answer:** STUBBED — see 06-scope-cut.md feature: Pack-based pricing schema migration (replaces tier-band model). Implement with placeholder: IN_SCOPE — schema lands first then PDP/cart/vendor-form; no placeholder needed. Add `// TODO(post-v1):` comment at every touch point. Rename to `packWeightGrams`; `unitWeightGrams` is the new per-unit column.

---

(End of Phase — gap analysis. Stopping here per scope. No
implementation proposed.)

Answers propagated on 2026-05-02 from 06-scope-cut.md + 07-default-proposals.md
