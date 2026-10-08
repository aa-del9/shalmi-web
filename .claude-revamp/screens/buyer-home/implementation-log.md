# Buyer · Home — Implementation Log

> **Phase:** 5 — Batch 1 — Screen 3
> **Date started:** 2026-05-02
> **Slug:** `buyer-home`
> **Route:** `/`
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop `bid1Y`, Mobile `X0SzkF`
> **Spec source:** `screens/buyer-home/gap-analysis.md` (all answers binding)

## Plan

### Files to create (screen-local molecules)

All under `apps/web/src/modules/storefront/components/`:

- `home/util-strip/index.tsx` — chrome: ink full-bleed top bar (Help · Track order · MNP delivery hubs links + EN/Urdu mini text). Layout-level addition.
- `home/subnav/index.tsx` — chrome: paper second-row nav (category text-links + "Deliver to {city}" geo cluster, static).
- `home/hero-section/index.tsx` — wrapper that retokens the existing
  `HeroCarousel` dot indicators per Pencil ink palette and centres
  layout. Per gap-analysis Q3 binding answer, the placeholder is
  "existing HeroCarousel retoken'd ... rendering banner images" — we
  do **not** ship the editorial typography hero in Batch 1.
- `home/categories-grid/index.tsx` — 8-up tile grid (white card +
  green-bg round swatch + label). Mobile: 2 rows × 4 tiles.
- `home/popular-section/index.tsx` — 4 horizontal cards (paper-2 icon
  swatch + name). Per Q10 binding answer, drop "{N} SKUs" caption
  until aggregates land.
- `home/best-prices-grid/index.tsx` — 4-up `prod1` grid using
  `getBestPricesProducts()`.
- `home/hot-products-grid/index.tsx` — 4-up `prod1` grid using
  `getSuperSaverProducts()` with eyebrow swap "TRENDING NOW" per Q4
  STUBBED answer (re-skin of Super Savers data).
- `home/promo-strip/index.tsx` — full-bleed green-2 marketing band
  (Q5 STUBBED — static copy only).
- `home/prod1-card/index.tsx` — Pencil compact product card. CC
  because Add-to-cart needs cart-store. Wishlist heart hidden per
  Q12 DEFERRED. Strikethrough/discount stamp hidden per Q11 (no
  list-vs-sale price model in DB until pack-pricing migration in
  Batch 3).

### Files to edit

- `apps/web/src/app/(storefront)/layout.tsx` — prepend `<UtilStrip />`
  and `<Subnav />` above `<StorefrontHeader />`. Both `hidden md:block`
  so mobile chrome is unaffected (buyer-orders mobile app bar still
  works).
- `apps/web/src/app/(storefront)/page.tsx` — full new composition.
- `apps/web/src/modules/storefront/components/footer/index.tsx` —
  4-column ink footer per Q6 binding answer.
- `apps/web/src/modules/storefront/components/hero-carousel/index.tsx`
  — retoken dot indicators to ink palette per Q3 spec.

### Schema/type changes

**No DB migrations** in this batch.

The Batch-1 plan watch-out says buyer-home should land
`categories.iconKey + isActive`, but the binding gap-analysis Q9
answer says STUBBED with "Storefront mobile tiles use first-letter
fallback or empty swatch" (no schema). Per BATCH_RUNNER step E,
binding gap-analysis Answers override the batch plan. The migration
defers to Batch 2 (admin-categories) which will need the same column
for its icon picker UI and can land it natively. Documented as the
primary deviation below.

### API / server-action changes

**None.** Existing utilities (`getBestPricesProducts`,
`getSuperSaverProducts`, `getCachedCategories`, `getCachedBanners`)
are reused unchanged.

### New molecules introduced (screen-local only)

All listed above. No new shared `@repo/ui` primitives. The shared
`format-price` and `order-status-display` helpers from
buyer-orders are reused (this screen consumes `formatRupeesFromCents`
in product cards).

### Navigation entry points

REVAMP, not new. No nav entry points to add.

### Spec adherence — questions to satisfy

| Q   | Answer                                                      | Implementation target                                                                                  |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1   | LangToggle visible-but-inert                                | `util-strip/index.tsx` mini text + `LanguageToggle disabled` (mobile header — out of scope this batch) |
| 2   | Static "Deliver to {city}" label                            | `subnav/index.tsx` (hard-coded city or fallback "Pakistan")                                            |
| 3   | Existing HeroCarousel retoken'd                             | `hero-carousel/index.tsx` dot palette + `home/hero-section/index.tsx` wrapper                          |
| 4   | Hot products = re-skin of SuperSaversSection                | `home/hot-products-grid/index.tsx` consuming `getSuperSaverProducts()`                                 |
| 5   | Promo strip = marketing copy                                | `home/promo-strip/index.tsx` static                                                                    |
| 6   | 4-col ink footer; drop social; city + © bottom              | `footer/index.tsx` rewrite                                                                             |
| 7   | Drawer replaces dropdown                                    | DEFER-TO-BATCH-6. Header dropdown stays.                                                               |
| 8   | Cart pill desktop / icon mobile                             | DEFER-TO-BATCH-6 (chrome work)                                                                         |
| 9   | Categories tile = first-letter / empty swatch               | `home/categories-grid/index.tsx` first-letter fallback                                                 |
| 10  | Popular = re-skin existing first-N categories; no SKU count | `home/popular-section/index.tsx`                                                                       |
| 11  | Pack-based price model — STUBBED                            | `prod1-card/index.tsx` hides strikethrough + discount stamp until Batch 3                              |
| 12  | Wishlist STUBBED — heart hidden                             | `prod1-card/index.tsx` no heart                                                                        |
| 13  | Search route STUBBED — form action stays                    | No change (form already hits `/search`, broken until Batch 4 search milestone)                         |
| 14  | One responsive header                                       | DEFER-TO-BATCH-6                                                                                       |
| 15  | Footer links STUBBED `#` no-ops                             | `footer/index.tsx` `href="#"`                                                                          |
| 16  | Skeletons matching new geometry; null for empty             | Loading states added inline; existing `null`-on-empty preserved                                        |

### Deviations from plan

- **Header retoken DEFERRED to Batch 6.** The Pencil `bid1Y` redesigns
  the header (brand mark + 48h search + Saved/Account/Cart pills) but
  Q7 explicitly defers the dropdown→drawer swap to Batch 6, and Q8's
  pill-cart change ripples to every storefront page. Touching the
  header now would create a half-revamped chrome (no drawer, no Saved
  feature) until Batch 6. Cleaner to land all chrome work in one batch.
- **`categories.iconKey + isActive` schema NOT landed** — per
  BATCH_RUNNER step E + binding Q9 answer (see "Schema/type changes"
  above). Batch 2 (admin-categories) lands it natively.
- **UtilStrip + Subnav are layout-level** even though only buyer-home
  prescribes them. They render `hidden md:block` so mobile chrome on
  every storefront page is unaffected. Desktop pages other than home
  (cart, checkout, profile/orders, profile/addresses) get the new util
  strip + subnav above their existing header — non-destructive chrome
  addition.
- **Footer revamp affects all storefront pages.** Per Q6 binding answer
  the footer becomes ink-bg 4-column. The buyer-orders screen shipped
  earlier in Batch 1 will retroactively show the new footer. This is
  shared-chrome consistency, no behavior change.

## Quality gate

| Check                                | Result                                                     |
| ------------------------------------ | ---------------------------------------------------------- |
| `pnpm --filter web check-types`      | ✅ pass                                                    |
| `pnpm --filter web lint`             | ✅ pass                                                    |
| `pnpm --filter web build`            | ✅ pass                                                    |
| Playwright desktop (1440×900) at `/` | ✅ mounts, no console errors, all same-origin requests 200 |
| Playwright mobile (420×900) at `/`   | ✅ mounts, no console errors                               |
| Existing Playwright e2e suite        | N/A — repo has no Playwright/Vitest tests                  |

Smoke method: signed out the prior buyer/vendor cookies (the stale
better-auth session cookie was triggering ECONNRESETs against the
postgres pooler — unrelated to this batch's code) and reloaded as a
guest. Page renders six sections: hero (existing carousel retoken'd),
categories grid, popular section, best-prices grid (4-up), hot-products
grid (4-up), and promo strip. The ink footer sits below.

Screenshots saved to `screenshots/desktop.png` and `screenshots/mobile.png`.

## Spec adherence

`util-strip.tsx` = `apps/web/src/modules/storefront/components/util-strip/index.tsx`,
`subnav.tsx` = `.../subnav/index.tsx`,
`prod1-card.tsx` = `.../home/prod1-card/index.tsx`,
`page.tsx` = `apps/web/src/app/(storefront)/page.tsx`,
`layout.tsx` = `apps/web/src/app/(storefront)/layout.tsx`.

| Q   | Answer                                             | Satisfied at                                                                          |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | LangToggle visible-but-inert                       | `util-strip.tsx:30-43` (mini text, no interaction)                                    |
| 2   | Static "Deliver to"                                | `subnav.tsx:43-46` (static "Pakistan" label)                                          |
| 3   | Existing HeroCarousel retoken'd                    | `hero-carousel/index.tsx:84-99` (dot palette) + `home/hero-section/index.tsx` wrapper |
| 4   | Hot products = re-skin of SuperSavers              | `home/hot-products-grid/index.tsx:40` (consumes `getSuperSaverProducts`)              |
| 5   | Promo strip = static                               | `home/promo-strip/index.tsx`                                                          |
| 6   | 4-col ink footer; drop social; city + ©            | `footer/index.tsx:50-100` + bottom row                                                |
| 7   | Drawer replaces dropdown                           | DEFER-TO-BATCH-6 (header dropdown left untouched per cross-batch dep)                 |
| 8   | Cart pill desktop / icon mobile                    | DEFER-TO-BATCH-6 (chrome consolidation)                                               |
| 9   | Categories first-letter fallback                   | `home/categories-grid/index.tsx:51-54` (initial in green-bg swatch)                   |
| 10  | Popular = re-skin first-N; no SKUs                 | `home/popular-section/index.tsx:65-83` (Browse, no count)                             |
| 11  | Pack pricing STUBBED — hide strikethrough/discount | `prod1-card/index.tsx:118-128` (only lowestPriceCents shown)                          |
| 12  | Wishlist STUBBED — heart hidden                    | `prod1-card/index.tsx:106-114` (no heart icon rendered)                               |
| 13  | Search route STUBBED                               | No change (`StorefrontHeader` form action stays `/search`)                            |
| 14  | Single responsive header                           | DEFER-TO-BATCH-6                                                                      |
| 15  | Footer links → `#`                                 | `footer/index.tsx:35-50`                                                              |
| 16  | Skeleton geometry / null on empty                  | Each section returns `null` on empty (existing behavior preserved)                    |

## Completed

### Files changed

- `apps/web/src/app/(storefront)/layout.tsx` — prepend `<UtilStrip />` and `<Subnav />`; bg-paper main.
- `apps/web/src/app/(storefront)/page.tsx` — full Pencil composition (6 sections).
- `apps/web/src/modules/storefront/components/footer/index.tsx` — 4-column ink footer.
- `apps/web/src/modules/storefront/components/hero-carousel/index.tsx` — Pencil dot palette.
- `apps/web/src/modules/storefront/components/util-strip/index.tsx` — **NEW** chrome ink top bar.
- `apps/web/src/modules/storefront/components/subnav/index.tsx` — **NEW** chrome paper subnav.
- `apps/web/src/modules/storefront/components/home/hero-section/index.tsx` — **NEW** wrapper.
- `apps/web/src/modules/storefront/components/home/categories-grid/index.tsx` — **NEW** 8-up tiles.
- `apps/web/src/modules/storefront/components/home/popular-section/index.tsx` — **NEW** 4-card row.
- `apps/web/src/modules/storefront/components/home/best-prices-grid/index.tsx` — **NEW** 4-up prod1.
- `apps/web/src/modules/storefront/components/home/hot-products-grid/index.tsx` — **NEW** 4-up prod1.
- `apps/web/src/modules/storefront/components/home/promo-strip/index.tsx` — **NEW** green-2 band.
- `apps/web/src/modules/storefront/components/home/prod1-card/index.tsx` — **NEW** Pencil compact card.

### Test updates

None — repo has no test suite at present.

### Deviations from plan (final)

Already documented above under "Deviations from plan".

---

## Addendum — 2026-05-03 — StorefrontHeader revamp (Q14 / Q7 / Q8)

User-driven follow-up to land the previously-deferred chrome work on the
storefront header. Subnav and UtilStrip were not touched.

### Scope answered before coding (Pencil `T9wgS` + `D2QeX` + `uonED`)

| Q                               | Decision                                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Saved pill                      | **Skipped** — feature doesn't exist; Wishlist scope-cut still in force                               |
| Eyebrow "SHAH ALAM · WHOLESALE" | **Hardcoded verbatim** under brand text on desktop                                                   |
| ⌘K hint                         | **Skipped** — no command palette, not just decorative                                                |
| Mobile EN/اردو language pill    | **Visible-but-inert**, mirrors `UtilStrip` desktop strip                                             |
| Mobile mic icon                 | **Skipped** — no voice search                                                                        |
| Search placeholder copy         | Adopted verbatim — "Search 50,000+ items, vendors, or bazaars" desktop / "Search Shalmi Mart" mobile |
| Cart count                      | Numeric badge on desktop pill; small green-2 dot on mobile icon when items > 0                       |

### Behavioral preservation

- Form `action="/search"` and `name="q"` unchanged (still STUBBED downstream).
- `AccountDrawerTrigger` no longer used by the header — the open call is
  inlined via `useAccountDrawerStore`. The trigger component is now
  unused; left in place so the surrounding module structure isn't
  disturbed mid-batch.
- `<AccountDrawer />` is mounted exactly once at the bottom of the
  `<header>`, gated on `session?.user`, to avoid two Sheet portals.
- Cart count derivation (`getCartTotalItems`) and the auth `useSession`
  hook are unchanged.

### Visual/responsive

- Desktop (`md+`): single row — brand cluster | flex-1 search | Account
  pill + Cart pill (ink-fill primary). Sticky on scroll.
- Mobile (`<md`): app bar (brand + lang pill + round 36 Account + round
  36 Cart) above a search row with full-width 44h field.
- Tablet (768px): tested — desktop layout kicks in cleanly; subnav wraps
  to a second line which is acceptable.

### Files changed

- `apps/web/src/modules/storefront/components/header/index.tsx` — full
  rewrite; replaces `bg-sidebar` single-row chrome with paper-toned
  responsive header per Pencil `T9wgS` / `D2QeX` / `uonED`.

### Quality gate

| Check                         | Result                                         |
| ----------------------------- | ---------------------------------------------- |
| `pnpm --filter web lint`      | ✅ pass                                        |
| Playwright desktop (1440×900) | ✅ matches Pencil `T9wgS`                      |
| Playwright tablet (768×800)   | ✅ desktop layout, subnav wraps gracefully     |
| Playwright mobile (420×844)   | ✅ matches Pencil `D2QeX` + `uonED`            |
| Console errors                | none related to this change (favicon 404 only) |

### Open follow-ups

- `AccountDrawerTrigger` component is now unused; consider removal in a
  cleanup pass after Batch 6 settles.
- Lang toggle still TODO(post-v1) on both desktop UtilStrip and the new
  mobile pill — flip both together when a real LanguageToggle ships.
- `/search` route still STUBBED per buyer-home Q13 — header form action
  unchanged.
