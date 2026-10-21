# Buyer · Home — Gap Analysis

> **Phase:** Per-screen gap analysis (read-only).
> **Date produced:** 2026-05-02.
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop `bid1Y` / Mobile `X0SzkF`. Reuses `prod1` (`QZyPu`) for product cards.
> **Existing code:**
> - Route: `/` → `apps/web/src/app/(storefront)/page.tsx` (SC).
> - Layout: `apps/web/src/app/(storefront)/layout.tsx` (SC) → `StorefrontHeader` + `StorefrontFooter`.
> - Components: `apps/web/src/modules/storefront/components/{header,footer,hero-carousel,best-prices-section,super-savers-section,category-section,product-card,product-carousel-section,product-grid-skeleton,category-products-grid}/index.tsx`.
> - Server-side data: `modules/promotions/utils/get-cached-banners.ts`, `modules/storefront/utils/{get-cached-categories,get-best-prices-products,get-super-saver-products}.ts`.
> - Types: `apps/web/src/modules/storefront/types.ts` (`StorefrontProduct`).

---

## Pencil components needed but NOT covered by `02-design-inventory.md` / `04-design-system-implementation-log.md`

Flagged before producing the diff (per workflow rule):

- **Util strip** (`FJuWj` desktop) — full-bleed ink top bar, left "Help · Track order · MNP delivery hubs" links + right cluster (`QSs5Q`: "EN · اردو" mono mini-toggle, **not** the design-system `LanguageToggle` shipped in 04). Captured in 02 §3.7 as part of "Buyer (storefront) chrome (3-tier)" but **not built in Phase 3**. → **Open Q1**.
- **Subnav** (`sh0XD`) — paper second-row nav with category text links + right "Deliver to {city}" geo cluster. Captured in 02 §3.7, not built in Phase 3. → **Open Q2**.
- **Hero banner** (`oPBiQ`) — large `ink`-fill 380h block with eyebrow, hero H1 (sans 56/800), description, two-button row (`Shop now` green, `How consolidation works` outline-on-ink), and right-side `mtxBT` arrow control cluster (40px round buttons, `chevron-left`/`chevron-right`). The current `HeroCarousel` renders raster banner images from the DB inside an `aspect-3/1` container — the Pencil design is a **typography-driven editorial hero**, not a banner-image carousel. → **Open Q3** (this is the single biggest divergence on the page).
- **Hero dot indicators** (`HzhO2`) — 4 dots (active `ink` 24×6 rounded, inactive `rule-2` 6×6). Existing carousel renders dots but the styling and count differ.
- **Category tile (compact)** — desktop tiles (`H0RR6A`, `HDPuz`, …) are 1-up `white` cards with a 48px `green-bg` round icon + 13/700 sans label, padding 16, gap 10. **Distinct from the existing `CategorySection`** which uses image squares with category name underneath.
- **Mobile category tile** (`mt1`–`mt8`) — 36px `green-bg` icon swatch with lucide icon (drinks → `glass-water`, snacks → `cookie`, oil → `droplet`, tea → `coffee`, pulses → `wheat`, dairy → `milk`, electronics → `plug`, care → `sparkles`) + 11/700 sans label. The lucide icon names per category are baked into the design — the codebase has no icon-per-category mapping today (categories store only `imageUrl`).
- **Popular section** (`rc5ew`) — 4 small horizontal cards each containing a 52² `paper-2` icon swatch + name + "{N} SKUs" mono caption. Surrounding right-side 36px arrow buttons (`l8Ae5R` outline / `WMpEa` filled-ink). No equivalent in code.
- **"Hot products" section** (`EvWCh`) — second `prod1` grid identical to best-prices but with amber "TRENDING NOW" eyebrow and "HOT" / "-12%" badges. The codebase has only **one** `BestPricesSection` (lowest price tier) and **one** `SuperSaversSection` (largest spread between tiers); neither corresponds to the Pencil "Hot products". → **Open Q4**.
- **Promo strip** (`mt4pg` desktop / `tGknt` mobile) — full-bleed `green-2` band with truck icon + "Free delivery on orders over Rs. 50,000 · Same-day cutoff 4 PM". Captured in 02 §3.11, not built. → **Open Q5**.
- **Footer (multi-column)** (`LSS70`) — 4-column footer (description blurb + 3 link columns) inside `ink` background, with bottom paper-2 hairline + © row + city list. Existing `StorefrontFooter` is a 3-column footer with categories/about/social. → **Open Q6**.

Everything else reuses primitives already covered by Phase 3.

---

## 1. Layout & structure

### Desktop (`bid1Y`, 1440 × fit_content)

Top-down vertical stack (`paper` page bg, `gap` derived from each section's own padding):

1. **Util strip** (`FJuWj`, 1440 × ~36, `ink` bg, padding [8, 40], `space_between`).
   - Left (`NekeR`): "Help · Track order · MNP delivery hubs" (sans 12, white).
   - Right (`QSs5Q`): mini "EN · اردو" tri-token mono row (white "EN" / `ink-4` "·" / `ink-4` "اردو").
2. **Header** (`ORLlp`, 1440 × ~80, `paper` bg, padding [16, 40], gap 32, hairline-bottom).
   - Brand cluster `r2pBym` — 36px round `ink` mark with paper "S" (sans 18/800), wordmark "Shalmi Mart" (sans 18/800 ink) + "WHOLESALE" (mono 9/700, ink-3, letter-spacing 1.5).
   - Search `bh4iZ` — 48h, radius 6, `white` fill, 1.5px `rule-2` stroke, `search` icon 18 ink-3 + placeholder "Search products, brands, categories…" (sans 14, ink-4). **Width fills container** (the bulk of header width).
   - Actions `Vhvdx` — three pieces, gap 16:
     - `actSaved` (`GoUXa`): vertical `heart` icon 22 + "Saved" (sans 11, ink-2).
     - `actAccount` (`QDRDt`): vertical `user` icon 22 + "Account" (sans 11/600 ink).
     - `cartBtn` (`AIbie`): green-2 inverse pill — `shopping-cart` 18 white + "Cart" (sans 13/700 white) + green-500 22px circular badge with white count text. Padding [10, 14], radius 6, `ink` fill.
3. **Subnav** (`sh0XD`, 1440 × ~40, `paper` bg, padding [12, 40], hairline top+bottom).
   - Left `Bm7lp` — 11 horizontal sans-13 links: Home (700 ink, active) / Categories / Drinks / Snacks / Cooking oil / Tea & coffee / Pulses & rice / Dairy / Personal care / Electronics / **Today's lowest** (700 green-700, distinct treatment).
   - Right `hK6jz` — `map-pin` 14 ink-3 + "Deliver to " (sans 12 ink-3) + "Gujranwala 52250" (sans 12/700 ink).
4. **Hero** (`ObrJy`, 1440 × ~436, padding [32, 40, 24, 40]):
   - **Banner card `oPBiQ`** (1360 × 380, `ink` fill, radius 16, padding [48, 56], gap 32, `space_between`). Two columns:
     - Left `yHpcV` (`fill_container`): eyebrow "WHOLESALE · CONSOLIDATED DELIVERY" (mono 11/700 green-500, ls 1.5) → H1 "Restock smarter, save more" (sans 56/800 paper, ls -0.03, line-height 1.05) → desc "Order from one trusted warehouse. Tier-priced delivery rewards larger carts. Same-day cutoff at 4 PM." (sans 15, ink-4, line-height 1.5) → button row `nynAo`:
       - `heroPri` — green-2 fill, padding [14, 22], radius 6 — "Shop now" 14/700 white + `arrow-right` 16 white.
       - `heroSec` — transparent, 1.5px `ink-4` stroke, padding [14, 22], radius 6 — "How consolidation works" 14/700 paper.
     - Right `Fm2Kd` (280w fixed, `alignItems: end`): only contains arrow cluster `mtxBT` — 40px round buttons: `arrL` (ink-2 fill, paper chevron-left) and `arrR` (paper fill, ink chevron-right). Gap 8.
   - **Dots `HzhO2`** below banner, padding [14, 0, 0, 0]: 1 active rounded `ink` 24×6, 3 inactive `rule-2` 6×6 dots. (Question: 4 dots → implies 4 hero slots.)
5. **Categories** (`HKyta`, 1440 × ~200, padding [24, 40], gap 16, vertical):
   - Header `xy2G9` — left `C1zg8` (eyebrow "BROWSE CATEGORIES" mono 11/700 ink-3 ls 1.5 + H2 "Shop by category" sans 24/800 ink) + right "View all →" (sans 13/700 green-700).
   - Grid `jsvXJ` — 8-up horizontal `fill_container` row, gap 12. Each tile (`H0RR6A` … `l4rTGB`) is `white` fill, 1px `rule` stroke, radius 8, padding 16, gap 10, vertical `alignItems: center`: 48² `green-bg` round icon swatch + label (sans 13/700 ink). Labels: Drinks · Snacks · Cooking oil · Tea & coffee · Pulses & rice · Dairy · Electronics · Personal care.
6. **Popular** (`rc5ew`, padding [8, 40, 24, 40], gap 16, vertical):
   - Header `HGgW5` — left `r9lf6` (eyebrow "POPULAR THIS WEEK" mono 11/700 ink-3 + H2 "Most ordered" sans 24/800) + right `v6UXo` arrow cluster (36px outline `pAL` + 36px filled-ink `pAR`).
   - Grid `M4436T` — 4-up horizontal `fill_container`, gap 14. Each card (`iQNOQ`/`MflUP`/`HmDjX`/`xK78o`) is `white` fill, 1px `rule`, radius 10, padding 16, gap 12, horizontal: 52² `paper-2` icon swatch + 2-line stack — name (sans 14/700 ink) + "{N} SKUs" (mono 11 ink-3). Sample data: "Pulses & rice · 248 SKUs", "Cooking oil · 112 SKUs", "Tea & coffee · 86 SKUs", "Snacks · 194 SKUs".
7. **Best prices** (`fLhQz`, padding [16, 40, 24, 40], gap 18, vertical):
   - Header `wVziZ` — left `oajqN` (eyebrow "BEST PRICES · SUPER SAVERS" mono 11/700 **red**, ls 1.5 + H2 "Today's lowest" sans 28/800 ink) + right "See all deals →" (sans 13/700 green-700).
   - Grid `R4Izz` — **4-up `prod1` row**, gap 16. First instance is the master `QZyPu` (defaults: "Sufi Cooking Oil 5L", `Rs. 4,820` was `Rs. 5,480`, "5 L · CARTON", `SHALMI WAREHOUSE`). Other instances override `descendants` with brand label, name, weight, price, sale price, discount stamp text (-10% / -13% / -10%). All four use the same `prod1` shell.
8. **Hot products** (`EvWCh`, padding [16, 40, 24, 40], gap 18, vertical):
   - Header `z2dVL` — eyebrow "TRENDING NOW" mono 11/700 **amber** + H2 "Hot products this week" sans 28/800 + "View all →" (green-700).
   - Grid `V82zVV` — **4-up `prod1` row** with overrides: "Nestle Milkpak 1L × 12" (HOT), "Olper's Cream 200ml" (HOT), "KitKat 2-Finger Carton" (-12%), "Lays Salted Carton" (-12%). The "HOT" badge is a string override on `pMmJ6` — the badge component itself is the same red discount-pill primitive.
9. **Promo strip** (`mt4pg`, full-bleed, `green-2` fill, padding [16, 40], horizontal centered, gap 12): truck icon 18 white + "Free delivery on orders over Rs. 50,000" (sans 14/700 white) + green-200 "·" + "Same-day cutoff 4 PM" (sans 14 green-200).
10. **Footer** (`LSS70`, `ink` bg, padding [48, 40, 24, 40], gap 32, vertical):
    - 4-column grid `laX4v` (gap 48, all columns `fill_container`):
      - `fc1` (`Lxc2x`) — brand pill row `IuKAi` + 13-char description blurb (sans 13, ink-4, line-height 1.6).
      - `fc2` (`IVNF9`) — "FOR BUYERS" eyebrow + 4 links (Browse catalog / Today's lowest / My orders / Quick reorder).
      - `fc3` (`Lmgus`) — "HELP" eyebrow + 4 links (FAQ / Contact support / Returns & refunds / Delivery hubs).
      - `fc4` (`x762cr`) — "COMPANY" eyebrow + 3 links (About / Careers / Terms).
    - Bottom row `z8PcQ` (`space_between`, padding [20, 0, 0, 0], top hairline 1px `rule-2`): "© 2026 SHALMI MART · TERMS · PRIVACY" (mono 11/700 ink-4, ls 1.2) | "GUJRANWALA · LAHORE · KARACHI" (mono 11/700 ink-4, ls 1.2).

### Mobile (`X0SzkF`, 420 × fit_content)

1. **Mobile app bar** (`D2QeX`, 420 × ~60, `paper` bg, padding [14, 16], hairline-bottom, `space_between`):
   - Left `nRu4h` — 32px round ink mark with white "S" + "Shalmi Mart" (sans 17/800 ink). **No "WHOLESALE" tagline on mobile.**
   - Right `wli6S` — three controls, gap 8:
     - `mLang` (`DP9YA`) segmented — 1.5px `ink` stroke, radius 6, padding 2: child `mEN` (`ink` fill, paper "EN" mono 11/700) + child `mUR` (transparent, ink "اردو" font-ar 11). **This is the `LanguageToggle` primitive** (or its visual equivalent — see Open Q1).
     - `mAcct` (`Hi92Y`) — 36px round `paper-2` with `user` 18 ink (and a hidden `mCartDot` decoration).
     - `mCart` (`HiWxX`) — 36px round `paper-2` with `shopping-cart` 18 ink + green-500 8px dot at top-right (`YnyhN`, "has-items" indicator).
2. **Search wrap** (`uonED`, padding [12, 16, 8, 16]) — single search field `mSearch` (`AiFO6`): 44h, radius 6, white fill, 1.5px rule-2, `search` 18 + placeholder. Same shape as design-system input.
3. **Hero** (`X0wTE`, padding [12, 16, 8, 16]):
   - `mHeroBan` (`W7aXEk`, 200h, radius 12, `ink` fill, padding 20, vertical, `justifyContent: end`, gap 10): eyebrow "WHOLESALE" (mono 10/700 green-500) + H1 "Restock smarter, save more" (sans 24/800 paper, line-height 1.1) + green-2 "Shop now" pill (`mHeroBtn`, padding [10, 16], radius 6).
   - Dots `e1kaD` below — 3 dots (vs 4 on desktop), padding [10, 0, 0, 0]. **Mobile has no arrow controls** — confirms swipe-only.
4. **Categories** (`JZtjX`, padding 16, gap 14, vertical):
   - Header `adLVM` — H2 "Shop by category" (sans 18/800 ink) + "View all" (sans 12/700 green-700).
   - Two rows of 4 tiles each (`mRow1` `NwUdO` and `mRow2` `YQLZ5`). Each tile (`mt1`–`mt8`): white fill, radius 8, 1px rule, padding 12, gap 6, vertical centered: 36px `green-bg` round + lucide icon (drinks=`glass-water` / snacks=`cookie` / oil=`droplet` / tea=`coffee` / pulses=`wheat` / dairy=`milk` / electronics=`plug` / care=`sparkles`) + label (sans 11/700 ink). **Note label compression**: "Cooking oil" → "Oil", "Tea & coffee" → "Tea", "Pulses & rice" → "Pulses", "Personal care" → "Care".
5. **Best prices** (`TbBoZ`, padding [8, 16, 16, 16], gap 12):
   - Header `eZWGj` — eyebrow "BEST PRICES · SUPER SAVERS" (mono 10/700 red, ls 1.4) + H2 "Today's lowest" (sans 20/800).
   - Row `h4wsz` — **2-up `prod1`** (`mProd1`, `mProd2`) with overrides reducing fontSizes (S97Tb 13 / s2IoX 11 / xa9U8 14) and image height (`wZjJK` 200 → 120).
6. **Hot products** (`xiPQg`, padding [0, 16, 16, 16], gap 12):
   - Same structure: amber eyebrow "TRENDING NOW" + H2 "Hot products this week" (sans 20/800) + 2-up `prod1` row `qjfvq`.
7. **Promo strip** (`tGknt`, green-2, padding [14, 16], gap 10): truck 16 white + "Free delivery over Rs. 50,000" (sans 12/700 white). **Single-line, no separator/secondary phrase like desktop has.**
8. **Footer** (`wmenE`, ink bg, padding [24, 16], gap 18, vertical):
   - Grid `eeoM1` — **2 columns** (BUYERS / HELP), each with 3 short links. **No COMPANY column on mobile.**
   - Bottom `af9Uo` — centered "© 2026 SHALMI MART" (mono 10/700 ink-4, ls 1.2). No city list.

### Existing code structure

`apps/web/src/app/(storefront)/page.tsx`:
- Single `<div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-8">` container.
- Children, in order: `HeroCarousel` (server-loaded `banners`) → `BestPricesSection` (lowest-priced products) → `CategorySection title="Popular Categories"` (first 5 of 10 cached categories) → `SuperSaversSection` (largest tier-spread products) → `CategorySection title="Browse More"` (remaining categories).

`apps/web/src/app/(storefront)/layout.tsx`:
- `<StorefrontHeader />` + `<main>{children}</main>` + `<StorefrontFooter />`.

`StorefrontHeader` (`modules/storefront/components/header/index.tsx`, CC):
- Sticky 56h header (`bg-sidebar`, hairline-bottom, `backdrop-blur`).
- Brand link → "/" (text-xl bold, just `APP_NAME`, no mark/tagline).
- Search form `<form action="/search">` with `Search` icon and `Input` placeholder "Search products...".
- Right cluster: cart icon-button (with primary-colored count badge), then either avatar `DropdownMenu` (when authed; first letter on green circle) or "Sign In" button (when not).
- The `DropdownMenu` contains: name + phone label, "My Orders", "Addresses", "Logout" — all rendered inline; **no separate `profile-nav` module exists in code** (despite `01-codebase-map.md` mentioning one). See Open Q7.

`StorefrontFooter` (`modules/storefront/components/footer/index.tsx`, SC):
- 3-column grid (`bg-primary`, white text):
  - Categories list (looped from `getCachedCategories`).
  - "About Shalmi Mart" paragraph blurb.
  - "Follow Us" icon row (Facebook, Instagram, Twitter).
- Bottom rule + © row.

`HeroCarousel` (CC, `modules/storefront/components/hero-carousel/index.tsx`):
- Embla carousel of DB `banners` (each = full-bleed image inside `aspect-3/1`, optionally a `<Link>` if `targetUrl` set).
- Auto-advances every 5s.
- Bottom dot indicators (1.5px tall pills, active is 24w primary color).
- **No textual content, no editorial hero pattern, no arrow controls in design — only image banners.**

`CategorySection` (SC):
- Title (`text-2xl font-bold`) + 2/3/5-col responsive grid of square category tiles.
- Each tile = `aspect-square` image (or first-letter fallback) + name caption (`text-sm font-medium`).
- Linked to `/categories/${slug}`.

`BestPricesSection` (SC) → `ProductCarouselSection title="Best Prices"`. Data via `getBestPricesProducts()` (lowest tier price ordering).
`SuperSaversSection` (SC) → `ProductCarouselSection title="Super Savers"`. Data via `getSuperSaverProducts()` (largest spread between tiers).
`ProductCarouselSection` (CC):
- `Carousel` with `CarouselPrevious`/`CarouselNext` arrows in the header row.
- `ProductCard` items inside `CarouselItem` (`basis-1/2 md:basis-1/3 lg:basis-1/5` — so up to 5 visible at once).

`ProductCard` (CC):
- `Card` shell with linked `aspect-square` image, name (truncate), weight in grams, "From Rs. {price}" (lowest tier only).
- Bottom action bar: `QuantitySelector` + "Add" `Button` that fetches `/api/products/[slug]` to add to cart.
- **No discount badge, no bundle metadata, no eyebrow/vendor name, no strikethrough price.**

### Top-level layout differences

| | Pencil | Existing |
|---|---|---|
| Page chrome | 3-tier (util strip + header + subnav) | Single-tier sticky `StorefrontHeader` |
| Hero | Editorial typography hero in ink card with arrows + dots | Image-only `aspect-3/1` `HeroCarousel` with dots only |
| Hero data source | Static editorial copy (4 slides implied) | DB-driven `promotional_banners.imageUrl` (whatever's seeded) |
| Page sections, in order | Hero → Categories (8) → Popular (4) → Best prices (4 prod1) → Hot products (4 prod1) → Promo strip → Footer | Hero → Best prices carousel → Popular Categories grid → Super savers carousel → Browse More grid |
| Categories tile | Icon swatch + name (no image) | `aspect-square` image + name |
| Best prices | 4-up grid of `prod1` (compact card) | Carousel of `ProductCard` (different anatomy) |
| "Hot products" / trending section | Yes, separate from best prices | Absent (`SuperSaversSection` is structurally similar but loads "largest tier spread", not "trending") |
| Promo strip | Yes (full-bleed `green-2` band) | No |
| Footer | 4 cols (description + Buyers + Help + Company) | 3 cols (Categories + About + Social) |
| Mobile chrome | Brand left + lang/account/cart right + search row + bottom-tab-less; full mobile redesign | Same desktop header collapses responsively (no separate mobile chrome) |
| Mobile category tile | 8 lucide-icon tiles in 2 rows of 4 | Inherits `CategorySection` 2-col responsive grid with images |
| Mobile sticky bottom bar | Not drawn on Home (not a buyer-mobile pattern; bottom-tab is vendor-only per 02 §3.9) | Not present |

---

## 2. Element-by-element diff

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| **Util strip** `FJuWj` (ink, "Help · Track order · MNP delivery hubs" + EN/اردو mini toggle) | (none) | Entirely new full-bleed pre-header tier. Holds 3 utility links + a mini lang/locale row. | NEW_INTERACTION + NEW_FIELD (links) + COPY_CHANGE |
| **Subnav** `sh0XD` (paper, 11 category text-links + "Deliver to Gujranwala 52250" geo cluster) | (none) | Entirely new mid-chrome tier. Categories repeat info from the main Categories grid; "Deliver to" implies a delivery-zip switcher. | NEW_INTERACTION + NEW_FIELD (delivery city/zip) |
| **Brand mark** `r2pBym` — 36px round ink-circle with paper "S" + 2-line "Shalmi Mart" (18/800 ink) + "WHOLESALE" (mono 9/700 ink-3) | `<Link href="/">{APP_NAME}</Link>` (text-xl bold) | Brand becomes a graphic mark with subtitle pair. Mark ↔ wordmark composition is the asset identity. | VISUAL_ONLY |
| **Header search** `bh4iZ` (48h, 1.5px rule-2, ink-3 search icon, "Search products, brands, categories…") | `<Input>` 36h with `Search` icon, "Search products..." | Height 36 → 48; copy change; visual matches Phase 3 input retoken. **Form action `/search` already missing per 01-codebase-map Q6 — search route doesn't exist.** | COPY_CHANGE + AMBIGUOUS (target route) |
| **Saved icon button** `actSaved` (heart 22 + "Saved" caption, sans 11) | (none) | New header action. Implies a "Saved items / wishlist" feature not in code. The drawer shows "Saved items · 12 products bookmarked" too — see account-drawer gap analysis. | NEW_INTERACTION + NEW_FIELD |
| **Account icon button** `actAccount` (user 22 + "Account" caption) | Avatar `DropdownMenu` trigger (filled green with first letter, or "Sign In" button) | Replaces avatar with a labeled icon-button. Click target opens the **Account drawer** (per account-drawer gap analysis), not the small DropdownMenu. | CHANGED_INTERACTION |
| **Cart action** `cartBtn` (ink pill with shopping-cart icon, "Cart" label, green-500 22px round badge with count) | Ghost icon Button with overlay primary-color count badge | Becomes a labeled inverse pill (not an icon). Badge moves from a corner overlay to inline child of the pill. | VISUAL_ONLY + COPY_CHANGE |
| **Lang toggle (util-strip mini, desktop)** `QSs5Q` ("EN · · · اردو" 3-token mono row) | (none) | New inline lang indicator (different visual from the segmented `LanguageToggle` shipped in Phase 3). Per design-inventory Q16 toggle is presentational only — but **two visual variants of the toggle now exist**: util-strip mini (this row) and the design-system segmented (also seen on Account drawer). | NEW_FIELD + AMBIGUOUS |
| **Lang toggle (mobile header)** `mLang` (segmented EN/اردو) | (none) | Same as Phase-3 `LanguageToggle` primitive — wire-up only. | NEW_INTERACTION |
| **Hero card** `oPBiQ` (ink 380h editorial hero with eyebrow + 56/800 H1 + desc + 2-button row + arrow cluster) | `HeroCarousel` (raster banner images, 5s auto-advance) | Hero changes from **DB-driven banner imagery** to **editorial typography card**. Either (a) banners feed copy (eyebrow/title/desc/cta1/cta2) into the new layout, or (b) banner table is bypassed entirely on Home and the new hero is hard-coded. | NEW_FIELD (× many) + CHANGED_INTERACTION |
| **Hero CTA #1** `heroPri` (green-2 "Shop now" + arrow-right) | (none — banner image is the CTA) | New explicit CTA. Likely targets `/categories` or `/products?sort=…`. | NEW_INTERACTION + NEW_FIELD (target route) |
| **Hero CTA #2** `heroSec` (transparent outline-on-ink "How consolidation works") | (none) | New marketing CTA. No existing /how-it-works route. | NEW_INTERACTION + NEW_FIELD |
| **Hero arrows** `mtxBT` (40px round arrL ink-2 fill / arrR paper fill) | (none — `HeroCarousel` has no arrows on Home; only `ProductCarouselSection` uses arrows) | New control variant: 40px round, two distinct fills. Aligns with answer to design-inventory Q18 ("arrows on desktop only"). | NEW_INTERACTION + VISUAL_ONLY |
| **Hero dots** `HzhO2` (4 dots, active rounded ink 24×6, inactive 6×6 rule-2) | Existing dot indicators (1.5px h, active w-6 primary, inactive w-1.5 muted-foreground/30) | Geometry close but tokens differ; **active dot is `ink` (chrome), not `green-2` (primary)**. | VISUAL_ONLY |
| **Categories grid** `jsvXJ` (8 tiles: white card + 48² green-bg round icon + 13/700 sans label) | `CategorySection` (image-tile grid, tile = aspect-square image + 14/medium name) | Tile design fundamentally different — design uses lucide icons + green-bg swatches; existing uses category image + caption. **No icon-per-category data in `categories` table today.** | NEW_FIELD (icon mapping) + VISUAL_ONLY |
| **Categories grid item count** | 8 tiles (desktop) / 8 tiles in 2 rows (mobile) | First 5 categories from the alphabetically sorted `getCachedCategories` slice + remaining 5 in "Browse More" | Design fixes 8; design takes the first 8 by something (popularity? curation?). | NEW_FIELD (curation/sort field) |
| **Mobile category icons** `glass-water/cookie/droplet/coffee/wheat/milk/plug/sparkles` | (none — uses image) | Each visible mobile tile has a hard-coded lucide icon. Need a category→icon map; or category schema gains an `icon` field. | NEW_FIELD |
| **Categories "View all" CTA** | "View all →" sans 13/700 green-700 | (none — categories live in the grid, no "view all") | New nav target. No `/categories` index route exists today (only `/categories/[slug]`). | NEW_INTERACTION + NEW_FIELD (target route) |
| **Popular section** (4 horizontal cards: 52² icon swatch + name + "{N} SKUs", with arrow controls in header) | `CategorySection title="Popular Categories"` (image grid, no SKU count) | Same conceptual content (top categories) but different anatomy + adds **SKU count metric** that doesn't exist client-side today. | NEW_FIELD (SKU count) + VISUAL_ONLY |
| **Popular header arrows** `pAL`/`pAR` (36px round, outline + filled-ink) | (none — section has no carousel) | Implies horizontal scroll/carousel for popular categories beyond the visible 4. | NEW_INTERACTION |
| **Best prices header** `wVziZ` (red eyebrow "BEST PRICES · SUPER SAVERS" + 28/800 H2 "Today's lowest" + green "See all deals →") | `<h2>Best Prices</h2>` + `CarouselPrevious`/`CarouselNext` | Title copy changes ("Best Prices" → "Today's lowest"); eyebrow added; "See all deals" replaces inline arrows. | COPY_CHANGE + NEW_FIELD (eyebrow + see-all route) |
| **Best prices grid** `R4Izz` (4-up `prod1` grid, fixed) | `ProductCarouselSection` (carousel of up to 20 `ProductCard`s; 5 visible) | Becomes a **4-card static grid**, not a carousel. Either show top-4 only, or revert to a carousel that visually looks like a 4-up grid at the snap point. | CHANGED_INTERACTION |
| **`prod1` card** (image area with discount/HOT badge + heart + central package icon + warehouse eyebrow / body with brand eyebrow + name + bundle metadata + price + strikethrough + green-2 "+ Add" full-width btn) | `ProductCard` (image + name + grams + "From Rs. ..." + qty selector + Add btn) | Design renders a packaged-goods card: brand eyebrow ("TAPAL", "DALDA", "LIPTON"), pack metadata ("950 G · CARTON × 12"), discount stamp, **wishlist heart**, **strikethrough original price**. None of these data points are wired today. Per 02-design-inventory Q10 these are two distinct components (compact `prod1` vs detailed `dw7Oh`); **only the compact `prod1` is referenced on Home.** | NEW_FIELD (× many) + CHANGED_INTERACTION |
| **`prod1` "+ Add" button** | `Add` button + `QuantitySelector` | Button is full-width green-2 with `+` icon and "Add"; **no inline quantity selector** in the card — quantity is presumably set on PDP or by repeated taps. | CHANGED_INTERACTION + REMOVED_FIELD (quantity selector) |
| **`prod1` heart icon** | (none) | Wishlist toggle. No `wishlists` table or `saved_items` schema exists. | NEW_INTERACTION + NEW_FIELD |
| **`prod1` discount stamp / "HOT" badge** (red `boxkB`, padding [4,8], radius 4, child text override per instance: "-12%", "-13%", "HOT", "-10%") | (none) | Discount % is computed (`(originalPrice - currentPrice) / originalPrice * 100`); "HOT" is a **manual curation flag** with no DB equivalent. | NEW_FIELD (compute discount; flag products as HOT) |
| **`prod1` strikethrough original price** `s2IoX` | (none — only lowest tier price shown) | Implies the product has a "list price" and a "sale price". Today `productPriceTiers` is a single quantity-banded price, not a sale/list pair. | NEW_FIELD |
| **`prod1` brand/vendor eyebrow** `r9Esbv` (e.g. "TAPAL", "DALDA", "SHALMI WAREHOUSE") | (none) | Either vendor name (`vendors.shopName`) or brand (no schema). Defaults render "SHALMI WAREHOUSE" in master. | NEW_FIELD + AMBIGUOUS (brand vs vendor) |
| **`prod1` pack metadata** `xI1e6` ("950 G · CARTON × 12", "5 L · TIN", "21 G · CARTON × 48") | "{weightGrams} g" caption | Display includes pack size (`× N`) and packaging unit ("CARTON" / "TIN"). Pack quantity ties into the pack-pricing schema change resolved by 02-design-inventory Q12. | NEW_FIELD (pack-of-N display, packaging unit) |
| **Hot products section** (amber eyebrow "TRENDING NOW" + H2 "Hot products this week" + 4-up `prod1` grid) | `SuperSaversSection` (carousel of products with widest tier price spread) | New conceptual category. "Hot" implies trending/best-selling — **no metric exists in the API today** (no order-count aggregations, no view counters). The existing `SuperSaversSection` is *not* the same idea (it's a discount/spread heuristic). | NEW_FIELD (trending metric) + CHANGED_INTERACTION |
| **Hot products grid** `V82zVV` | `SuperSaversSection` carousel | Same anatomy difference as Best Prices (4-up grid vs carousel). | CHANGED_INTERACTION |
| **Promo strip** `mt4pg` (full-bleed green-2 band: truck + "Free delivery on orders over Rs. 50,000 · Same-day cutoff 4 PM") | (none) | New marketing module. Two pieces of copy: free-delivery threshold + cutoff time. Threshold copy aligns with weight gauge / shipping logic in cart but neither value exists in code today. | NEW_FIELD (threshold, cutoff) + COPY_CHANGE |
| **Footer column 1 — description** `Lxc2x` (brand pill + sans 13 ink-4 description) | "About Shalmi Mart" column (with paragraph) | Same idea, different copy and visual treatment. | COPY_CHANGE |
| **Footer column 2 — "FOR BUYERS"** (Browse catalog / Today's lowest / My orders / Quick reorder) | "Categories" list (loops every category) | Replaces dynamic category list with static buyer-nav links. **Quick reorder** routes to the new Reorder screen. | NEW_INTERACTION + REMOVED_FIELD (category links) |
| **Footer column 3 — "HELP"** (FAQ / Contact support / Returns & refunds / Delivery hubs) | (none) | New static help-link column. None of these routes exist. | NEW_FIELD + NEW_INTERACTION |
| **Footer column 4 — "COMPANY"** (About / Careers / Terms) | (none — only About paragraph in column 2) | New static company-link column. None of these routes exist. | NEW_FIELD + NEW_INTERACTION |
| **Footer social row** | `Facebook`/`Instagram`/`Twitter` icon links in column 3 | Removed in Pencil Home — no social icons. Either intentionally cut or moved elsewhere. | REMOVED_FIELD + AMBIGUOUS |
| **Footer bottom row** `z8PcQ` (© / city list, mono 11/700 ink-4) | "© Shalmi Mart. All rights reserved." (text-xs neutral-200, single centered line) | Replaces simple copyright with two-mono-token line + Pakistani city list. | COPY_CHANGE |
| **Footer bg color** | `ink` (#0F1411) | `bg-primary` (was green primary, now resolves to `green-2 = #16A34A` post Phase 3) | Footer changes from green→ink. | VISUAL_ONLY |
| **Mobile app bar** `D2QeX` (brand left, 3 actions right; no search) | `StorefrontHeader` collapsing responsively | Mobile gets purpose-built chrome — needs a separate `<MobileStorefrontHeader>` or fully responsive markup. | CHANGED_INTERACTION + NEW_FIELD |
| **Mobile search wrap** `uonED` | (none — search is in the same row as everything on mobile via responsive collapse) | Search becomes its own row beneath the app bar. | VISUAL_ONLY |
| **Mobile categories** (8 lucide-icon tiles, 2×4) | Responsive `CategorySection` (uses category images) | See "Mobile category icons" row above. | NEW_FIELD + VISUAL_ONLY |
| **Mobile product card overrides** (S97Tb 13, s2IoX 11, xa9U8 14, image height 200→120) | (none — `ProductCard` has no responsive size variant) | Mobile shows a more compact `prod1`. Implementation likely a per-screen class, not a separate component. | VISUAL_ONLY |
| **Loading state** | Not drawn | `ProductGridSkeleton` exists for product grids; no specific home skeleton; other sections have no explicit loading frame | Pencil draws no loading frames. | NEW_STATE |
| **Empty state** (no banners / no products) | Pencil draws no empty states | Existing returns `null` early when arrays are empty. | NEW_STATE (or REMOVED_FIELD if Pencil expects always-populated) |

---

## 3. Schema / type implications

For each NEW_FIELD / REMOVED_FIELD above:

### 3.1 `promotional_banners` table — hero data shape

**Existing schema** (`packages/database/src/schema/promotional-banners.ts`): `id`, `title`, `imageUrl`, `targetUrl`, `isActive`, `displayOrder`, timestamps.

**Pencil hero** wants editorial fields per slide (eyebrow, headline, description, primaryCtaLabel, primaryCtaHref, secondaryCtaLabel, secondaryCtaHref). These are not in the table. Two paths exist:

- **(a)** Replace `imageUrl` with a structured `content` (JSONB) holding the editorial fields and treat the imagery as decorative (or keep `imageUrl` as background art).
- **(b)** Keep `promotional_banners` for image-based promos elsewhere and introduce a separate `home_hero_slides` table (or hard-code Home hero copy in code).

→ **Open Q3** (this is the single biggest schema decision for Home).

### 3.2 Categories — icon + SKU count + curation

**Existing schema** (`categories.ts`): `id`, `name`, `slug`, `imageUrl`, timestamps.

Pencil needs:
- An icon name per category (lucide enum: `glass-water`, `cookie`, `droplet`, `coffee`, `wheat`, `milk`, `plug`, `sparkles`, plus the desktop tile uses no icons at all — see Open Q9).
- SKU count metric for the Popular section. Computable client-side as `count(products) where category.id in ...` but currently no API exposes it.
- A "popularity / curation" ordering for the 4 cards in Popular and 8 tiles in Categories. Existing fetcher orders by `name asc` and slices.

Possible field additions: `icon: text NULL`, `displayOrder: int NULL`, `isFeatured: boolean default false`.

### 3.3 Products — wishlist, brand, pack-of-N display, discount

**Existing schema** (`products.ts`): `id`, `vendorId`, `name`, `slug`, `weightGrams`, `images` (jsonb), `stock`, `version`, timestamps; plus `productPriceTiers` (qty band).

Pencil `prod1` shows:
- **Brand eyebrow** ("TAPAL"). Either derive from `vendors.shopName` (likely wrong — Tapal is a brand, not a vendor) or add `products.brand: text NULL`.
- **Pack metadata** ("950 G · CARTON × 12"). Pack quantity comes from the new pack-pricing flow (per design-inventory Q12 answer), but the **packaging unit** ("CARTON" / "TIN" / "BOX") has no schema. Need either `products.packagingUnit: text` or a new lookup table.
- **Strikethrough original price**. Per design-inventory Q12 we are moving to a pack-pricing model — the "list" price could be the per-unit price × pack count, and the "sale" price could be the pack price; OR a separate `originalPriceCents` field is needed. → **Open Q11**.
- **Discount % / "HOT" badge**. Discount can be computed once strikethrough price is wired. "HOT" / "TRENDING" requires a flag — add `products.isTrending: boolean default false` (admin-curated) **or** derive from order_items aggregations (data-driven).
- **Wishlist heart**. Requires a new join table: `saved_items (userId, productId, createdAt)` with PK `(userId, productId)`. Plus `GET/POST/DELETE /api/user/saved-items` endpoints. → **Open Q12**.

### 3.4 New routes implied by header / footer / hero CTAs

| Route | Purpose | In code today? | Notes |
|---|---|---|---|
| `/search?q=...` | Search results | No (form already points here, no page) | Already an open Q from 01-codebase-map. |
| `/profile/saved` (or `/saved`) | Wishlist surface | No | New feature. |
| `/categories` (index) | "View all" categories | No | Could be a new SC index or a redirect to `/`. |
| `/today` (or `/best-prices`, etc.) | "See all deals" / "Today's lowest" target | No | New feature route. |
| `/how-it-works` (or `/about/consolidation`) | Hero secondary CTA target | No | Marketing page. |
| `/help`, `/help/faq`, `/help/contact`, `/help/returns`, `/delivery-hubs` | Footer help links | No | Marketing/CMS pages. |
| `/about`, `/careers`, `/terms`, `/privacy` | Footer company links | No | Marketing/CMS pages. |
| `/?city=GUJ52250` (or query/cookie) | "Deliver to Gujranwala 52250" subnav | No | Implies a delivery-zone selector — connects with weight-gauge tiering on cart? See Open Q2. |

### 3.5 i18n

The util-strip mini toggle (`QSs5Q`) and mobile `mLang` segmented imply EN/Urdu wiring. Per design-inventory Q16, **EN-only ships first** but the toggle must be present. The Phase-3 `LanguageToggle` primitive is the segmented component; **the util-strip text-row is a separate visual** — see Open Q1.

---

## 4. Behavior implications

### 4.1 Hero refactor (single biggest behavior change)

Current `HeroCarousel` does a server fetch of `getCachedBanners()` and renders an embla carousel of `<Image>` blocks. Pencil hero is editorial typography on an `ink` card with explicit primary/secondary CTAs.

Implementation options (decision dependency: Open Q3):

- **A. Editorial-from-DB**: extend the `promotional_banners` schema with eyebrow / headline / description / two CTAs, and let admins author home heroes. The existing `BannersCarousel` admin UI grows to accept these fields.
- **B. Hard-coded editorial**: drop banners from Home entirely; ship the Pencil hero as a static React block. Banners table becomes a "categorical promo" surface used elsewhere (e.g. PDP / category pages).

Either way, the carousel index/dots and arrow control state move from "1 banner per Image" to "1 slide per editorial frame".

### 4.2 Search route

Header search posts to `/search?q=...` (already in code). The route does not exist (`01-codebase-map.md` Open Q6). Implementing the home page revamp does not require search to ship at the same time, but the form action stays valid, so a new `/search/page.tsx` should land in the same milestone or the placeholder cleared. → **Open Q13**.

### 4.3 Saved / wishlist behavior

The `prod1` heart icon and the `actSaved` header button both push toward a wishlist feature. Toggling the heart is a per-user mutation that requires auth — same auth pattern as cart (auth-modal redirect). Given current scope (per design-inventory Q-style "ignore for later" answers in 02-design-inventory.md), a confirmation is needed: ship now, stub-only, or out-of-scope? → **Open Q12**.

### 4.4 "Deliver to {city}" subnav

`hK6jz` shows a pinned delivery zone. This affects:
- Shipping tiers (cart's weight gauge already references "10–25 kg / Rs. 180" tiers → Q: are tiers city-dependent?).
- Banner / hero copy (cutoff time may vary by city).
- Vendor availability (`vendors.city`/`vendors.hub` exists, so a city selector could filter listings).

Behavior is undefined by Pencil (the design just shows a current value). → **Open Q2**.

### 4.5 Categories vs Popular split

Pencil has both `Categories` (8 tiles) and `Popular` (4 horizontal cards). Codebase has only `CategorySection` rendered twice (Popular Categories + Browse More). The conceptual model differs:
- Existing: same data, two slices.
- Design: two distinct surfaces with **different anatomy**.

If Popular is "this week's most-ordered category", it needs an aggregation (`order_items` × `product_categories`). No such API today. → **Open Q10**.

### 4.6 Hot / Trending products

If "Hot" is admin-curated, add `products.isTrending` and an admin toggle. If it's data-driven (e.g. last-7-days top sellers), add an aggregate query. The two paths produce different latencies and different content (curated freshness vs purely behavioral). → **Open Q11**.

### 4.7 Mobile chrome

Existing header collapses responsively. Pencil designs a purpose-built mobile bar with a separate search-row beneath. The cleanest implementation is two layout variants behind a `useIsMobile`-style breakpoint, OR a single header that conditionally renders the search-row. The mobile bar also introduces the **hidden cart-dot** (`mCartDot`) on the mobile account button — visible only when there's a notification / saved item / unread state. There's no schema for that today. → **Open Q14**.

### 4.8 Promo strip copy values

"Free delivery on orders over Rs. 50,000" and "Same-day cutoff 4 PM" are **business rules** the codebase doesn't enforce. Cart's existing free-delivery semantics are tier-based (per weight gauge), not order-value-based. Either:
- the strip is purely marketing copy (no code change), or
- it reflects real eligibility logic (free shipping if `grandTotal ≥ 5,000,000 paisa`) which would need to be added to checkout.

→ **Open Q5**.

### 4.9 Footer link targets

Most footer links route to pages that don't exist. They can ship as `<Link>`s to `#` placeholders in the same PR as the layout, or as a parallel "marketing scaffolding" PR. → **Open Q15**.

---

## 5. Open questions for me

Numbered. Every NEW_FIELD / REMOVED_FIELD / NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE / COPY_CHANGE / AMBIGUOUS row in §2 maps to one of these.

### 1. Util-strip lang toggle (mini, desktop) vs design-system `LanguageToggle` (segmented)

- **Observed (design):** Desktop util strip has `QSs5Q` — three mono tokens "EN" (white) "·" (ink-4) "اردو" (ink-4 font-ar) **inline**, no border, no segmented frame. Mobile header has `mLang` (`DP9YA`) — a 1.5px ink-stroked segmented control with two children, matching the Phase-3 `LanguageToggle` primitive (per design-inventory §3.6, `vRXid`). Account drawer (`tNHG9`/`d5XRb`) uses the segmented variant too.
- **Observed (code):** No lang toggle wired anywhere. Phase-3 shipped a **segmented** `LanguageToggle` primitive, but no mini-row variant.
- **Question:** Are these two visual treatments of the same control (mini = compact summary, segmented = interactive control), or two different controls? Should the util-strip mini be implemented as a tiny variant of the same primitive, a separate `LanguageIndicator` text component, or simply ad-hoc inline text?
- **Hypotheses:** (a) one component with `variant="mini" | "segmented"`; (b) the mini is decorative copy inside the util strip and the segmented in the header is the only interactive control; (c) util strip should be replaced with the segmented control to avoid two separate UIs.
**Answer:** STUBBED — see 06-scope-cut.md feature: i18n / language toggle plumbing (presentational EN-only). Implement with placeholder: Toggle renders inert (visual only) with no state plumbing; clicking does nothing. Add `// TODO(post-v1):` comment at every touch point.

### 2. "Deliver to {city/zip}" subnav cluster

- **Observed (design):** `hK6jz` shows `map-pin` 14 + "Deliver to " + bold "Gujranwala 52250".
- **Observed (code):** No city/zip selector or delivery-zone state anywhere. `addresses` has `city`; `vendors` has `city`/`hub`.
- **Question:** Is this a static link to the Account drawer's "Saved addresses" section (presentational only), or an interactive city selector (which affects cart shipping tiers, vendor availability, delivery cutoff times)?
- **Hypotheses:** (a) presentational, derived from the user's default address; (b) interactive popover that switches a global "delivery zone" (cookie/state); (c) interactive but changes only display — pricing/availability stays the same.
**Answer:** STUBBED — see 06-scope-cut.md feature: "Deliver to {city}" delivery zone selector. Implement with placeholder: Render as a static, non-interactive label (read from default address). Add `// TODO(post-v1):` comment at every touch point.

### 3. Hero data source — banner table extension or hard-coded editorial?

- **Observed (design):** Editorial typography hero (`oPBiQ`): eyebrow, 56/800 H1, paragraph, two CTAs, 4 dots (4 slides).
- **Observed (code):** `promotional_banners` has only `imageUrl` / `targetUrl`. `HeroCarousel` renders raster banners.
- **Question:** Three paths — extend `promotional_banners` with editorial fields and migrate the carousel; create a new `home_hero_slides` table; or hard-code the 4 hero slides in code and repurpose the banners table for other surfaces.
- **Hypotheses:** (a) extend banners; (b) new table; (c) hard-code.
**Answer:** STUBBED — see 06-scope-cut.md feature: Editorial home hero (replace banner-image carousel). Implement with placeholder: Existing `HeroCarousel` retoken'd to use ink/paper colors but rendering banner images. Add `// TODO(post-v1):` comment at every touch point.

### 4. "Hot products" / "TRENDING NOW" — what backs it?

- **Observed (design):** Section `EvWCh` with amber eyebrow "TRENDING NOW" and 4 `prod1` cards (Milkpak, Olper's, KitKat, Lays). HOT / -12% badge variants.
- **Observed (code):** `SuperSaversSection` exists but loads "biggest tier-spread" — different concept.
- **Question:** Does "Hot" = admin-curated flag (`products.isTrending`), data-driven (top sellers last N days), or repurposed `SuperSaversSection`?
- **Hypotheses:** (a) admin flag with an admin-products toggle; (b) aggregation query on `order_items`; (c) reuse `SuperSaversSection` and rename the eyebrow only.
**Answer:** STUBBED — see 06-scope-cut.md feature: Hot products / trending metric. Implement with placeholder: Home Hot Products section reuses `SuperSaversSection` with the eyebrow re-skinned to "TRENDING NOW". Add `// TODO(post-v1):` comment at every touch point.

### 5. Promo strip — marketing copy or enforced logic?

- **Observed (design):** `mt4pg` desktop / `tGknt` mobile — full-bleed `green-2` band with truck icon + "Free delivery on orders over Rs. 50,000 · Same-day cutoff 4 PM" (mobile shortens to single phrase).
- **Observed (code):** No order-value-threshold free-shipping logic. Cart shipping is weight-tier based.
- **Question:** Is this marketing-only (Home decoration) or does cart need to honor the threshold?
- **Hypotheses:** (a) marketing copy only — Home is a static block; (b) cart adds a "free shipping if order ≥ Rs. 50,000" override; (c) the threshold is a config value set by admin (new env / settings record).
**Answer:** STUBBED — see 06-scope-cut.md feature: Free delivery threshold + same-day cutoff (business rule). Implement with placeholder: Render the strip as static marketing copy; cart delivery line continues to use weight tier regardless. Add `// TODO(post-v1):` comment at every touch point.

### 6. Footer redesign — drop social links, add Help & Company columns, change to `ink` bg

- **Observed (design):** `LSS70` — `ink` bg, 4 columns, no social icons; bottom row has city list + © string.
- **Observed (code):** `bg-primary` (now `green-2`), 3 columns including social icons, single-line ©.
- **Question:** Drop social icons entirely or relocate (e.g. into Help column)? Confirm `ink` footer is intentional (vs reusing the `green-900` "Footer, hero" Pencil token, which is also a candidate per 02 §1 brand swatches).
- **Hypotheses:** (a) drop social, use `ink` exactly as drawn; (b) keep social as a new "Follow us" column; (c) `green-900` instead of `ink` (matching original Pencil "Footer" usage label).
**Answer:** Drop social icons; use `ink` background as drawn; bottom row has city list + © string.

### 7. Account button — drawer trigger replaces existing `DropdownMenu`

- **Observed (design):** `actAccount` (desktop) and `mAcct` (mobile) — both clicking opens Buyer · Account drawer.
- **Observed (code):** `StorefrontHeader` renders an inline `DropdownMenu` with "My Orders / Addresses / Logout".
- **Question:** Confirm the dropdown is fully replaced by the drawer (not coexisting), and that the mobile account button is the same trigger. (This is also questioned in the buyer-account-drawer gap analysis — answered there per design-inventory Q3, but recording here for cross-screen consistency.)
- **Hypotheses:** (a) replace dropdown entirely with drawer; (b) keep dropdown as a simpler desktop variant and use drawer only on mobile; (c) drawer for authed users, dropdown / `Sign In` button for unauthed.
**Answer:** Replace dropdown entirely with drawer (matches account-drawer feature).

### 8. Cart action — pill button + label "Cart"

- **Observed (design):** `cartBtn` (`AIbie`) is an ink-fill labeled pill (cart icon + "Cart" text + green-500 badge).
- **Observed (code):** Ghost icon-button with overlay-corner badge.
- **Question:** Confirm the pill style is intentional and that the badge becomes an inline child (not corner overlay). Same Q for mobile (`HiWxX` is iconic 36px round, no label) — so mobile drops the label even though desktop adds it.
- **Hypotheses:** (a) pill-with-label desktop, icon-only mobile (as drawn); (b) icon-only on both; (c) icon-only desktop (matching current code), full pill mobile.
**Answer:** Pill-with-label desktop, icon-only mobile (as drawn).

### 9. Categories grid — 8 fixed tiles with icons (desktop) but no icons (per current schema)

- **Observed (design):** Desktop tile (`H0RR6A`, etc.) has a 48² `green-bg` round swatch but **no glyph/lucide icon** drawn inside; mobile tile (`mt1`–`mt8`) has explicit lucide icons. Labels: drinks/snacks/cooking-oil/tea&coffee/pulses&rice/dairy/electronics/personal-care.
- **Observed (code):** `categories.imageUrl` (admin-uploaded) only.
- **Question:** What renders inside the desktop swatch? (a) the existing `imageUrl` reduced to fit; (b) a lucide icon (which one? the mobile mapping?); (c) the swatch is intentionally empty as a token-tile only and the label is the whole identifier.
- **Hypotheses:** (a)/(b)/(c) above. Mobile clearly uses lucide icons — needs `categories.icon` field (or hard-coded slug→icon map).
**Answer:** STUBBED — see 06-scope-cut.md feature: Category icons (Lucide map). Implement with placeholder: Storefront mobile tiles use first-letter fallback or empty swatch. Add `// TODO(post-v1):` comment at every touch point.

### 10. "Popular" section — what's the metric, what's the data source?

- **Observed (design):** `rc5ew` 4 horizontal cards: 52² icon + name + "{N} SKUs" caption (e.g. "Pulses & rice · 248 SKUs"). The header has scroll-arrow controls (`pAL`/`pAR`) implying more than 4 items off-screen.
- **Observed (code):** `getCachedCategories()` slices first 5 alphabetically.
- **Question:** Is "Popular this week" a manual feature flag, an aggregation of orders, or just a different label on the existing list? If it's a real metric, what's the SKU count source — `count(products where category.id ...)` live query, or a denormalized `categories.skuCount`?
- **Hypotheses:** (a) admin curation + denormalized count; (b) aggregation queries; (c) re-skin of existing first-5.
**Answer:** Re-skin of existing first-N categories (no new aggregation). Drop "{N} SKUs" caption until aggregates land.

### 11. `prod1` price model — "list" vs "sale"

- **Observed (design):** Each `prod1` shows two price texts: `xa9U8` (e.g. "Rs. 4,820", mono 18/800 ink) and `s2IoX` (e.g. "Rs. 5,480", mono 12, ink-3) implied as strikethrough. Plus a discount stamp "-12%".
- **Observed (code):** `productPriceTiers` is a single qty-band price, no list/sale split.
- **Question:** Is the strikethrough a list price (separate field) or the next-higher-quantity tier? Per design-inventory Q12 the new model is **pack-based** — does each pack have a "compare-at" / list price, or is the discount derived from the smallest-pack-per-unit-equivalent?
- **Hypotheses:** (a) `pack.listPriceCents` + `pack.priceCents`; (b) computed as per-unit equivalent vs single-unit price; (c) a separate `discountPercent` field, no list price actually shown — just the % stamp.
**Answer:** STUBBED — see 06-scope-cut.md feature: Pack-based pricing schema migration (replaces tier-band model). Implement with placeholder: N/A — already user-confirmed; not a candidate for deferral. Add `// TODO(post-v1):` comment at every touch point.

### 12. Wishlist / saved items

- **Observed (design):** `actSaved` header button + `prod1` heart icon + Account-drawer "Saved items · 12 products bookmarked".
- **Observed (code):** No `saved_items` / `wishlists` table; no API; no UI.
- **Question:** Is wishlist in scope for the Home revamp, or stub-only (heart icon non-functional, header `Saved` link routes to a placeholder)?
- **Hypotheses:** (a) ship full feature (table + API + UI); (b) stub-only — render the icon, no behavior, drawer counter shows 0; (c) drop wishlist from this revamp pass and remove the heart icon.
**Answer:** STUBBED — see 06-scope-cut.md feature: Wishlist / Saved Items. Implement with placeholder: Heart icons render but are no-ops (or removed). Account drawer "Saved items" row hidden or shows "0 products bookmarked" linking to a "Coming soon" page. Header "Saved" button hidden. Add `// TODO(post-v1):` comment at every touch point.

### 13. `/search` route implementation

- **Observed (design):** Header search field is the same shape as Phase-3 input; placeholder copy changes ("Search products, brands, categories…" desktop / mobile has no placeholder shown as it's the default Phase-3 input).
- **Observed (code):** `<form action="/search">` posts to a non-existent route (01-codebase-map Q6).
- **Question:** Does the Home revamp include shipping `/search`, or do we leave the form action as-is and ship search separately?
- **Hypotheses:** (a) ship search route in the same milestone; (b) defer; (c) replace the form with a client-side autocomplete that doesn't navigate.
**Answer:** STUBBED — see 06-scope-cut.md feature: Search route `/search`. Implement with placeholder: Storefront search form remains broken (`<form action="/search">` 404s). Admin top-bar search renders inert. Vendor list search filter hidden. Add `// TODO(post-v1):` comment at every touch point.

### 14. Mobile chrome — separate component or responsive header?

- **Observed (design):** Distinct mobile chrome (`D2QeX` app bar + `uonED` search wrap), no overlap with desktop layout.
- **Observed (code):** Single `StorefrontHeader` collapses responsively.
- **Question:** Two components or one? Also: the mobile account/cart icons are 36px round on `paper-2` — the `mCartDot` badge on the account button (`Hi92Y` → `sZQvk`) is `enabled: false` in the design (placeholder for "show when N saved/notifications"). What state triggers it?
- **Hypotheses:** (a) split into `<MobileStorefrontHeader>`/`<DesktopStorefrontHeader>`; (b) one header with a `useIsMobile` branch; (c) Tailwind responsive classes only.
**Answer:** One header with a `useIsMobile`-style branch (matches existing single-`StorefrontHeader` pattern). `mCartDot` triggers when cart has unread/items count > 0 (re-uses cart-store).

### 15. Footer links — placeholder or scaffolded routes?

- **Observed (design):** 4 columns of static link text. No per-link route info in the file.
- **Observed (code):** None of these routes exist (no `/help`, `/about`, etc.).
- **Question:** Do we ship the Home revamp with `<Link href="#">` placeholder hrefs, scaffold empty marketing routes, or wire to an external CMS?
- **Hypotheses:** (a) `#` anchors; (b) skeleton page files in `app/(storefront)/help/...`; (c) external links / Contentful / similar.
**Answer:** STUBBED — see 06-scope-cut.md feature: Footer marketing pages (Help, About, Terms, Privacy, Returns, FAQ, Delivery hubs, Careers). Implement with placeholder: Links route to a single `/coming-soon` placeholder route (or `#` no-op). Add `// TODO(post-v1):` comment at every touch point.

### 16. Loading / empty / error states for Home sections

- **Observed (design):** No loading/empty/error frames drawn for Home sections.
- **Observed (code):** Sections return `null` when data is empty; no skeleton on Home (`ProductGridSkeleton` exists but isn't used here); no error boundary.
- **Question:** Do we ship explicit skeletons (sized to match the new `prod1` card grid) and empty/error states, or accept the existing "render nothing" behavior?
- **Hypotheses:** (a) add skeletons matching the new geometry; (b) keep `null` and rely on cache always-warmed; (c) suspense boundary with the page-skeleton pattern.
**Answer:** Add skeletons matching the new `prod1` card grid geometry; existing `null` empty states remain.

---

(End of Buyer · Home gap analysis. Stopping here per workflow rule — not starting implementation.)

Answers propagated on 2026-05-02 from 06-scope-cut.md + 07-default-proposals.md
