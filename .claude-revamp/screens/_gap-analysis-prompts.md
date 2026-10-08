# Gap-Analysis Prompts — One per Screen

> **Purpose:** Ready-to-paste prompts for the per-screen Phase 1 gap analysis.
> **Source of mappings:** `.claude-revamp/02-design-inventory.md` §4–§5 (Pencil node IDs)
> and `.claude-revamp/01-codebase-map.md` §4 (existing routes / files).
> **Read-only phase:** Each prompt's only writable output is
> `.claude-revamp/screens/<screen-slug>/gap-analysis.md`.
>
> Conventions used below:
> - "Pencil page/frame name" is given as `<Human Name> (Desktop ID: <id> / Mobile ID: <id>)`
>   so the agent can call `pencil:batch_get` directly with the IDs.
> - "Existing code source" lists the route, the page file, and the primary feature
>   module folder so the agent can follow imports without guessing.
> - The Pencil document is `Pencil-Design/Shalmi` (canonical — `Shalmi - Copy.pen` is
>   ignored per design-inventory Q20).

---

## Index

### Buyer (storefront)
1. [Buyer · Home](#1-buyer--home)
2. [Buyer · Product Detail (PDP)](#2-buyer--product-detail-pdp)
3. [Buyer · Cart](#3-buyer--cart)
4. [Buyer · Checkout](#4-buyer--checkout)
5. [Buyer · Orders](#5-buyer--orders)
6. [Buyer · Reorder / Order Detail](#6-buyer--reorder--order-detail)
7. [Buyer · Settings](#7-buyer--settings)
8. [Buyer · Account Drawer / Sheet](#8-buyer--account-drawer--sheet)

### Admin
9. [Admin · Dashboard](#9-admin--dashboard)
10. [Admin · Vendors](#10-admin--vendors)
11. [Admin · Categories](#11-admin--categories)
12. [Admin · Banners](#12-admin--banners)

### Vendor
13. [Vendor · Dashboard](#13-vendor--dashboard)
14. [Vendor · Products](#14-vendor--products)
15. [Vendor · Orders](#15-vendor--orders)
16. [Vendor · Ledger](#16-vendor--ledger)

---

## 1. Buyer · Home

We're doing the gap analysis for ONE screen: **Buyer · Home (Storefront landing)**.

Read these files first:
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/02-design-inventory.md`
- `.claude-revamp/03-token-migration.md`
- `.claude-revamp/04-design-system-implementation-log.md`

The Pencil source for this screen: **Buyer · Home (Desktop ID: `bid1Y` / Mobile ID: `X0SzkF`)** in `Pencil-Design/Shalmi`.
The existing code source for this screen:
- Route: `/`
- Page file: `apps/web/src/app/(storefront)/page.tsx`
- Layout: `apps/web/src/app/(storefront)/layout.tsx` (storefront shell — `StorefrontHeader`, `StorefrontFooter`)
- Feature module: `apps/web/src/modules/storefront/` (components: `header`, `footer`, `hero-carousel`, `promo-bar`, `trust-strip`, `category-section`, `category-products-grid`, `best-prices-section`, `super-savers-section`, `product-card`, `product-carousel-section`)
- Server-side data: `modules/storefront/utils/get-cached-categories.ts`, `modules/promotions/utils/get-cached-banners.ts`

This is a READ-ONLY phase. The only file you may write is
`.claude-revamp/screens/buyer-home/gap-analysis.md` (create the folder).

Workflow:
1. Read the existing screen file(s) end to end. Follow imports until you
   understand the full component tree, the data it loads, the schemas
   involved, and the actions it triggers.
2. Open the Pencil design for this screen. Use `pencil:snapshot_layout` first,
   then `pencil:batch_get` for component details. Use `pencil:export_nodes`
   only if visual reference is genuinely needed.
3. For each visible UI element in the Pencil design, identify the
   corresponding element in the existing code (or note that there is none).
4. For each element in the existing code, identify the corresponding
   element in the Pencil design (or note that the design omits it).

Produce `gap-analysis.md` with these sections:

1. **Layout & structure** — overall layout differences (grid, sections,
   ordering, responsive behavior).

2. **Element-by-element diff** — a table:
   `pencil_element | existing_element | diff_summary | category`.
   Categories: VISUAL_ONLY (style change, no behavior impact), COPY_CHANGE,
   NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE (loading/empty/error variants drawn that don't exist in code),
   AMBIGUOUS.

3. **Schema / type implications** — for every NEW_FIELD or REMOVED_FIELD,
   what schema/type/API changes would be required? Reference the actual
   files and types.

4. **Behavior implications** — for every NEW_INTERACTION,
   CHANGED_INTERACTION, or NEW_STATE, what code paths would change? What
   API endpoints? What data fetching?

5. **Open questions for me** — numbered. EVERY row in section 2 with
   category NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE, COPY_CHANGE, or AMBIGUOUS MUST become a numbered question
   here. For each:
   - What you observed (in design and in code).
   - The specific question.
   - 2–3 plausible answers if you have hypotheses (but do not pick one).

Hard rules:
- DO NOT propose a single line of code yet.
- DO NOT assume defaults for new fields (type, validation, required vs
  optional, default value, where it comes from in the API). Each becomes a
  question.
- DO NOT assume removed elements are intentional removals — they might just
  be undrawn. Ask.
- DO NOT assume copy changes are intentional. Ask.
- If a Pencil component you need wasn't covered in
  `02-design-inventory.md` or `04-design-system-implementation-log.md`,
  flag it as a question before writing the gap analysis.

When done, show me the file path and STOP. Do not start implementation.

---

## 2. Buyer · Product Detail (PDP)

We're doing the gap analysis for ONE screen: **Buyer · Product Detail Page (PDP)**.

Read these files first:
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/02-design-inventory.md`
- `.claude-revamp/03-token-migration.md`
- `.claude-revamp/04-design-system-implementation-log.md`

The Pencil source for this screen: **Buyer · Product (Desktop ID: `MqzEv` / Mobile ID: `OVOxe`)** in `Pencil-Design/Shalmi`. Note: PDP includes a "Pack of 4/6/12/24/48" bundle pricing block and a YMAL row using the reusable `prod1` (`QZyPu`) card. Per design-inventory Q12, packs are a new pack-based pricing model that replaces the existing tier model.
The existing code source for this screen:
- Route: `/products/[slug]`
- Page file: `apps/web/src/app/(storefront)/products/[slug]/page.tsx`
- Primary component: `apps/web/src/modules/cart/components/product-detail/`
- Add-to-cart helpers: `modules/cart/components/add-to-cart-button/`, `modules/cart/components/quantity-selector/`
- Server-side data: `modules/cart/utils/get-product-by-slug.ts`
- Cart store: `modules/cart/stores/cart-store.ts` (Zustand + persist)
- API: `GET /api/products/[slug]` (`apps/web/src/app/api/products/[slug]/route.ts`)
- Schemas: `packages/database/src/schema/products.ts`, `packages/database/src/schema/product-price-tiers.ts`, `packages/schemas/src/catalog/product.ts`, `packages/schemas/src/catalog/product-price-tiers.ts`

This is a READ-ONLY phase. The only file you may write is
`.claude-revamp/screens/buyer-product/gap-analysis.md` (create the folder).

Workflow:
1. Read the existing screen file(s) end to end. Follow imports until you
   understand the full component tree, the data it loads, the schemas
   involved, and the actions it triggers.
2. Open the Pencil design for this screen. Use `pencil:snapshot_layout` first,
   then `pencil:batch_get` for component details. Use `pencil:export_nodes`
   only if visual reference is genuinely needed.
3. For each visible UI element in the Pencil design, identify the
   corresponding element in the existing code (or note that there is none).
4. For each element in the existing code, identify the corresponding
   element in the Pencil design (or note that the design omits it).

Produce `gap-analysis.md` with these sections:

1. **Layout & structure** — overall layout differences (grid, sections,
   ordering, responsive behavior).

2. **Element-by-element diff** — a table:
   `pencil_element | existing_element | diff_summary | category`.
   Categories: VISUAL_ONLY, COPY_CHANGE, NEW_FIELD, REMOVED_FIELD,
   NEW_INTERACTION, CHANGED_INTERACTION, NEW_STATE, AMBIGUOUS.

3. **Schema / type implications** — for every NEW_FIELD or REMOVED_FIELD,
   what schema/type/API changes would be required? Reference the actual
   files and types. Pay special attention to the pack-based pricing model
   (new schema territory per design-inventory Q12).

4. **Behavior implications** — for every NEW_INTERACTION,
   CHANGED_INTERACTION, or NEW_STATE, what code paths would change? What
   API endpoints? What data fetching? Include cart-store implications for
   pack selection.

5. **Open questions for me** — numbered. EVERY row in section 2 with
   category NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE, COPY_CHANGE, or AMBIGUOUS MUST become a numbered question
   here. For each:
   - What you observed (in design and in code).
   - The specific question.
   - 2–3 plausible answers if you have hypotheses (but do not pick one).

Hard rules:
- DO NOT propose a single line of code yet.
- DO NOT assume defaults for new fields. Each becomes a question.
- DO NOT assume removed elements are intentional removals. Ask.
- DO NOT assume copy changes are intentional. Ask.
- If a Pencil component you need wasn't covered in `02-design-inventory.md`
  or `04-design-system-implementation-log.md`, flag it as a question before
  writing the gap analysis.

When done, show me the file path and STOP. Do not start implementation.

---

## 3. Buyer · Cart

We're doing the gap analysis for ONE screen: **Buyer · Cart**.

Read these files first:
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/02-design-inventory.md`
- `.claude-revamp/03-token-migration.md`
- `.claude-revamp/04-design-system-implementation-log.md`

The Pencil source for this screen: **Buyer · Cart (Desktop ID: `g3oOM7` / Mobile ID: `lSn3n`)** in `Pencil-Design/Shalmi`. Note: cart includes the **weight gauge** delivery-tier component (`05 Components → WEIGHT GAUGE`, `LA21g`) and the receipt-totals card (`olYUW`).
The existing code source for this screen:
- Route: `/cart`
- Page file: `apps/web/src/app/(storefront)/cart/page.tsx` (CC)
- Primary components: `apps/web/src/modules/cart/components/cart-item-row/`, `modules/cart/components/cart-summary/`, `modules/cart/components/quantity-selector/`
- Cart store: `modules/cart/stores/cart-store.ts` (Zustand + persist)
- Price helpers: `modules/cart/utils/resolve-price.ts`

This is a READ-ONLY phase. The only file you may write is
`.claude-revamp/screens/buyer-cart/gap-analysis.md` (create the folder).

Workflow:
1. Read the existing screen file(s) end to end. Follow imports until you
   understand the full component tree, the data it loads, the schemas
   involved, and the actions it triggers.
2. Open the Pencil design for this screen. Use `pencil:snapshot_layout` first,
   then `pencil:batch_get` for component details. Use `pencil:export_nodes`
   only if visual reference is genuinely needed.
3. For each visible UI element in the Pencil design, identify the
   corresponding element in the existing code (or note that there is none).
4. For each element in the existing code, identify the corresponding
   element in the Pencil design (or note that the design omits it).

Produce `gap-analysis.md` with these sections:

1. **Layout & structure** — overall layout differences (grid, sections,
   ordering, responsive behavior; note Pencil mobile uses sticky bottom bar).

2. **Element-by-element diff** — a table:
   `pencil_element | existing_element | diff_summary | category`.
   Categories: VISUAL_ONLY, COPY_CHANGE, NEW_FIELD, REMOVED_FIELD,
   NEW_INTERACTION, CHANGED_INTERACTION, NEW_STATE, AMBIGUOUS.

3. **Schema / type implications** — for every NEW_FIELD or REMOVED_FIELD,
   what schema/type/API changes would be required? Reference the actual
   files and types. Note: weight gauge needs `weightGrams` per cart item +
   delivery tier resolution logic.

4. **Behavior implications** — for every NEW_INTERACTION,
   CHANGED_INTERACTION, or NEW_STATE, what code paths would change? What
   API endpoints? What data fetching? Cover weight-bucket calculation,
   delivery-cost copy, and cart-store shape.

5. **Open questions for me** — numbered. EVERY row in section 2 with
   category NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE, COPY_CHANGE, or AMBIGUOUS MUST become a numbered question
   here. For each:
   - What you observed (in design and in code).
   - The specific question.
   - 2–3 plausible answers if you have hypotheses (but do not pick one).

Hard rules:
- DO NOT propose a single line of code yet.
- DO NOT assume defaults for new fields. Each becomes a question.
- DO NOT assume removed elements are intentional removals. Ask.
- DO NOT assume copy changes are intentional. Ask.
- If a Pencil component you need wasn't covered in `02-design-inventory.md`
  or `04-design-system-implementation-log.md`, flag it as a question before
  writing the gap analysis.

When done, show me the file path and STOP. Do not start implementation.

---

## 4. Buyer · Checkout

We're doing the gap analysis for ONE screen: **Buyer · Checkout**.

Read these files first:
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/02-design-inventory.md`
- `.claude-revamp/03-token-migration.md`
- `.claude-revamp/04-design-system-implementation-log.md`

The Pencil source for this screen: **Buyer · Checkout (Desktop ID: `S72tsk` / Mobile ID: `OqB5X`)** in `Pencil-Design/Shalmi`. Note: includes a step-indicator (`stepIdx`), delivery address card, rider notes, payment selector, items review, and a sticky CTA on mobile (`mxStep`, `mxTitle`, `mxAddr`, `mxInstr`, `mxPay`, `mxSum`).
The existing code source for this screen:
- Route: `/checkout`
- Page file: `apps/web/src/app/(storefront)/checkout/page.tsx` (CC, redirects unauthenticated users to `/auth?redirect=/checkout`)
- Components: `apps/web/src/modules/checkout/components/delivery-address-section/`
- Schemas: `apps/web/src/modules/checkout/schemas/` (`checkoutShippingFormSchema`)
- Cross-app schema: `packages/schemas/src/orders/checkout.ts` (`shippingAddressSchema`, `checkoutCartPayloadSchema`)
- API: `POST /api/checkout` (`apps/web/src/app/api/checkout/route.ts`) — creates `orders` + `sub_orders` + `order_items`
- Cart store: `modules/cart/stores/cart-store.ts`
- Addresses query (used here too): `modules/user-addresses/hooks/use-addresses-query.ts`
- Success page: `apps/web/src/app/(storefront)/checkout/success/page.tsx`

This is a READ-ONLY phase. The only file you may write is
`.claude-revamp/screens/buyer-checkout/gap-analysis.md` (create the folder).

Workflow:
1. Read the existing screen file(s) end to end. Follow imports until you
   understand the full component tree, the data it loads, the schemas
   involved, and the actions it triggers.
2. Open the Pencil design for this screen. Use `pencil:snapshot_layout` first,
   then `pencil:batch_get` for component details. Use `pencil:export_nodes`
   only if visual reference is genuinely needed.
3. For each visible UI element in the Pencil design, identify the
   corresponding element in the existing code (or note that there is none).
4. For each element in the existing code, identify the corresponding
   element in the Pencil design (or note that the design omits it).

Produce `gap-analysis.md` with these sections:

1. **Layout & structure** — overall layout differences (grid, sections,
   ordering, responsive behavior; mobile sticky CTA).

2. **Element-by-element diff** — a table:
   `pencil_element | existing_element | diff_summary | category`.
   Categories: VISUAL_ONLY, COPY_CHANGE, NEW_FIELD, REMOVED_FIELD,
   NEW_INTERACTION, CHANGED_INTERACTION, NEW_STATE, AMBIGUOUS.

3. **Schema / type implications** — for every NEW_FIELD or REMOVED_FIELD,
   what schema/type/API changes would be required? Reference the actual
   files and types. Cover step-indicator state, rider-notes payload,
   payment-selector options vs current COD-only flow.

4. **Behavior implications** — for every NEW_INTERACTION,
   CHANGED_INTERACTION, or NEW_STATE, what code paths would change? What
   API endpoints? What data fetching? Cover `POST /api/checkout` payload
   shape and any step-progression logic.

5. **Open questions for me** — numbered. EVERY row in section 2 with
   category NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE, COPY_CHANGE, or AMBIGUOUS MUST become a numbered question
   here. For each:
   - What you observed (in design and in code).
   - The specific question.
   - 2–3 plausible answers if you have hypotheses (but do not pick one).

Hard rules:
- DO NOT propose a single line of code yet.
- DO NOT assume defaults for new fields. Each becomes a question.
- DO NOT assume removed elements are intentional removals. Ask.
- DO NOT assume copy changes are intentional. Ask.
- If a Pencil component you need wasn't covered in `02-design-inventory.md`
  or `04-design-system-implementation-log.md`, flag it as a question before
  writing the gap analysis.

When done, show me the file path and STOP. Do not start implementation.

---

## 5. Buyer · Orders

We're doing the gap analysis for ONE screen: **Buyer · Orders (order history)**.

Read these files first:
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/02-design-inventory.md`
- `.claude-revamp/03-token-migration.md`
- `.claude-revamp/04-design-system-implementation-log.md`

The Pencil source for this screen: **Buyer · Orders (Desktop ID: `g78Iwm` / Mobile ID: `ctdRJ`)** in `Pencil-Design/Shalmi`. Note: page header `oTH`, filter bar `oFilters` (tabs + search + sort), 5 order cards `oo1`–`oo5` with status stamps. Per design-inventory Q1, "View details" on an order card opens the **Reorder** frame (covered in prompt 6).
The existing code source for this screen:
- Route: `/profile/orders`
- Page file: `apps/web/src/app/(storefront)/profile/orders/page.tsx` (CC, middleware-gated)
- Primary component: `apps/web/src/modules/retailer/retailer-orders/`
- Hooks: `modules/retailer/retailer-orders/hooks/use-retailer-orders-query.ts`
- API: `GET /api/retailer/orders` (`apps/web/src/app/api/retailer/orders/route.ts`)
- Status enum source: `packages/database/src/schema/sub-orders.ts` (`pending` / `packed` / `handed_to_courier` / `delivered` / `cancelled`) — per design-inventory Q9, Pencil stamp labels are display-only mappings of these existing values.

This is a READ-ONLY phase. The only file you may write is
`.claude-revamp/screens/buyer-orders/gap-analysis.md` (create the folder).

Workflow:
1. Read the existing screen file(s) end to end. Follow imports until you
   understand the full component tree, the data it loads, the schemas
   involved, and the actions it triggers.
2. Open the Pencil design for this screen. Use `pencil:snapshot_layout` first,
   then `pencil:batch_get` for component details. Use `pencil:export_nodes`
   only if visual reference is genuinely needed.
3. For each visible UI element in the Pencil design, identify the
   corresponding element in the existing code (or note that there is none).
4. For each element in the existing code, identify the corresponding
   element in the Pencil design (or note that the design omits it).

Produce `gap-analysis.md` with these sections:

1. **Layout & structure** — overall layout differences.

2. **Element-by-element diff** — a table:
   `pencil_element | existing_element | diff_summary | category`.
   Categories: VISUAL_ONLY, COPY_CHANGE, NEW_FIELD, REMOVED_FIELD,
   NEW_INTERACTION, CHANGED_INTERACTION, NEW_STATE, AMBIGUOUS.

3. **Schema / type implications** — for every NEW_FIELD or REMOVED_FIELD,
   what schema/type/API changes would be required? Reference the actual
   files and types. Pay attention to status-stamp label mapping (display
   layer only — see Q9).

4. **Behavior implications** — for every NEW_INTERACTION,
   CHANGED_INTERACTION, or NEW_STATE, what code paths would change? What
   API endpoints? What data fetching? Cover filter tabs, search, sort —
   none of which exist on the API today.

5. **Open questions for me** — numbered. EVERY row in section 2 with
   category NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE, COPY_CHANGE, or AMBIGUOUS MUST become a numbered question
   here. For each:
   - What you observed (in design and in code).
   - The specific question.
   - 2–3 plausible answers if you have hypotheses (but do not pick one).

Hard rules:
- DO NOT propose a single line of code yet.
- DO NOT assume defaults for new fields. Each becomes a question.
- DO NOT assume removed elements are intentional removals. Ask.
- DO NOT assume copy changes are intentional. Ask.
- If a Pencil component you need wasn't covered in `02-design-inventory.md`
  or `04-design-system-implementation-log.md`, flag it as a question before
  writing the gap analysis.

When done, show me the file path and STOP. Do not start implementation.

---

## 6. Buyer · Reorder / Order Detail

We're doing the gap analysis for ONE screen: **Buyer · Reorder (also serves as Order Detail per design-inventory Q1)**.

Read these files first:
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/02-design-inventory.md`
- `.claude-revamp/03-token-migration.md`
- `.claude-revamp/04-design-system-implementation-log.md`

The Pencil source for this screen: **Buyer · Reorder (Desktop ID: `NNw2K` / Mobile ID: `tbXvv`)** in `Pencil-Design/Shalmi`. Per design-inventory Q1, this frame doubles as the order-detail view (clicking "View details" on a Buyer · Orders card lands here). Notable contents: breadcrumb "Home > Orders > Reorder #SH-24891", page header `rTH` (eyebrow "REORDER · ORDER #SH-24891 · 24 APR 2026"), two-col `rLayout` (editable line items left, weight-gauge + receipt + add-to-cart right). Mobile: scroll + sticky CTA bar.
The existing code source for this screen:
- Route: `/profile/orders/[id]`
- Page file: `apps/web/src/app/(storefront)/profile/orders/[id]/page.tsx` (CC, middleware-gated)
- Primary component: `apps/web/src/modules/retailer/retailer-order-detail/` (`ParcelBox`, `ReceiptCard`, `ReviewDrawer`)
- Hooks: `use-retailer-order-detail-query`, `use-submit-review-mutation`
- API: `GET /api/retailer/orders/[id]`, `POST /api/retailer/reviews`
- Cart store (for "Reorder → cart" actions): `modules/cart/stores/cart-store.ts`
- Schema: `packages/database/src/schema/orders.ts`, `sub-orders.ts`, `order-items.ts`, `product-reviews.ts`

This is a READ-ONLY phase. The only file you may write is
`.claude-revamp/screens/buyer-reorder/gap-analysis.md` (create the folder).

Workflow:
1. Read the existing screen file(s) end to end. Follow imports until you
   understand the full component tree, the data it loads, the schemas
   involved, and the actions it triggers.
2. Open the Pencil design for this screen. Use `pencil:snapshot_layout` first,
   then `pencil:batch_get` for component details. Use `pencil:export_nodes`
   only if visual reference is genuinely needed.
3. For each visible UI element in the Pencil design, identify the
   corresponding element in the existing code (or note that there is none).
4. For each element in the existing code, identify the corresponding
   element in the Pencil design (or note that the design omits it).
   In particular: the existing detail page has a `ReviewDrawer` and parcel
   tracking — confirm whether Pencil omits these intentionally or just
   doesn't draw them.

Produce `gap-analysis.md` with these sections:

1. **Layout & structure** — overall layout differences (note dual role:
   detail-view + reorder-action).

2. **Element-by-element diff** — a table:
   `pencil_element | existing_element | diff_summary | category`.
   Categories: VISUAL_ONLY, COPY_CHANGE, NEW_FIELD, REMOVED_FIELD,
   NEW_INTERACTION, CHANGED_INTERACTION, NEW_STATE, AMBIGUOUS.

3. **Schema / type implications** — for every NEW_FIELD or REMOVED_FIELD,
   what schema/type/API changes would be required? Reference the actual
   files and types. Cover "edit line items + add to cart" flow (does this
   imply mutating the existing order, or only seeding cart-store?).

4. **Behavior implications** — for every NEW_INTERACTION,
   CHANGED_INTERACTION, or NEW_STATE, what code paths would change? What
   API endpoints? What data fetching? Cover weight-gauge for past-order
   replenish, and how the existing review/parcel features survive (or not).

5. **Open questions for me** — numbered. EVERY row in section 2 with
   category NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE, COPY_CHANGE, or AMBIGUOUS MUST become a numbered question
   here. For each:
   - What you observed (in design and in code).
   - The specific question.
   - 2–3 plausible answers if you have hypotheses (but do not pick one).

Hard rules:
- DO NOT propose a single line of code yet.
- DO NOT assume defaults for new fields. Each becomes a question.
- DO NOT assume removed elements are intentional removals. Ask.
- DO NOT assume copy changes are intentional. Ask.
- If a Pencil component you need wasn't covered in `02-design-inventory.md`
  or `04-design-system-implementation-log.md`, flag it as a question before
  writing the gap analysis.

When done, show me the file path and STOP. Do not start implementation.

---

## 7. Buyer · Settings

We're doing the gap analysis for ONE screen: **Buyer · Settings**.

Read these files first:
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/02-design-inventory.md`
- `.claude-revamp/03-token-migration.md`
- `.claude-revamp/04-design-system-implementation-log.md`

The Pencil source for this screen: **Buyer · Settings (Desktop ID: `R6YLrL` / Mobile ID: `ZETLe`)** in `Pencil-Design/Shalmi`. Notable contents: breadcrumb "Home > Account > Settings", page title `c9dR8m` "Account & settings", `sLayout` with 280w left `sSide` nav (white card with vertical nav items) and right `sContent` panel (24-gap settings sections). Mobile: app bar + scroll. Per design-inventory Q2, scope is **only Addresses** for now — ignore profile/payment/notifications sub-pages even if drawn.
The existing code source for this screen:
- **NEW route** — there is currently no `/profile/settings`. Closest existing surface is `/profile/addresses` (which per Q2 should move under `/profile/settings/addresses`).
- Existing addresses page: `apps/web/src/app/(storefront)/profile/addresses/page.tsx` (CC, middleware-gated)
- Existing addresses module: `apps/web/src/modules/user-addresses/` (`address-card`, `address-dialog`, `addresses-list`, `addresses-page-header`, hooks, schemas)
- Addresses API: `GET, POST /api/user/addresses` (`apps/web/src/app/api/user/addresses/route.ts`)
- Schema: `packages/database/src/schema/addresses.ts`, `apps/web/src/modules/user-addresses/schemas/createAddressSchema`
- Middleware gating: `apps/web/src/middleware.ts` (`/profile/*`)

This is a READ-ONLY phase. The only file you may write is
`.claude-revamp/screens/buyer-settings/gap-analysis.md` (create the folder).

Workflow:
1. Read the existing screen file(s) end to end (the Addresses surface plus
   any related profile-area code). Follow imports until you understand the
   full component tree, the data it loads, the schemas involved, and the
   actions it triggers.
2. Open the Pencil design for this screen. Use `pencil:snapshot_layout` first,
   then `pencil:batch_get` for component details — including the `sSide`
   nav items so we know which sub-pages are drawn (even if out-of-scope per
   Q2). Use `pencil:export_nodes` only if visual reference is genuinely
   needed.
3. For each visible UI element in the Pencil design, identify the
   corresponding element in the existing code (or note that there is none).
4. For each element in the existing code, identify the corresponding
   element in the Pencil design (or note that the design omits it).

Produce `gap-analysis.md` with these sections:

1. **Layout & structure** — overall layout differences. Note the
   "sub-shell" pattern (left nav + right content) and how the existing
   `/profile/addresses` standalone page fits inside it.

2. **Element-by-element diff** — a table:
   `pencil_element | existing_element | diff_summary | category`.
   Categories: VISUAL_ONLY, COPY_CHANGE, NEW_FIELD, REMOVED_FIELD,
   NEW_INTERACTION, CHANGED_INTERACTION, NEW_STATE, AMBIGUOUS.

3. **Schema / type implications** — for every NEW_FIELD or REMOVED_FIELD,
   what schema/type/API changes would be required? Reference the actual
   files and types.

4. **Behavior implications** — for every NEW_INTERACTION,
   CHANGED_INTERACTION, or NEW_STATE, what code paths would change? What
   API endpoints? What data fetching? Cover the route move
   (`/profile/addresses` → `/profile/settings/addresses`) and any redirects.

5. **Open questions for me** — numbered. EVERY row in section 2 with
   category NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE, COPY_CHANGE, or AMBIGUOUS MUST become a numbered question
   here. For each:
   - What you observed (in design and in code).
   - The specific question.
   - 2–3 plausible answers if you have hypotheses (but do not pick one).

Hard rules:
- DO NOT propose a single line of code yet.
- DO NOT assume defaults for new fields. Each becomes a question.
- DO NOT assume removed elements are intentional removals. Ask.
- DO NOT assume copy changes are intentional. Ask.
- If a Pencil component you need wasn't covered in `02-design-inventory.md`
  or `04-design-system-implementation-log.md`, flag it as a question before
  writing the gap analysis.

When done, show me the file path and STOP. Do not start implementation.

---

## 8. Buyer · Account Drawer / Sheet

We're doing the gap analysis for ONE screen: **Buyer · Account Drawer / Sheet (overlay, not a route)**.

Read these files first:
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/02-design-inventory.md`
- `.claude-revamp/03-token-migration.md`
- `.claude-revamp/04-design-system-implementation-log.md`

The Pencil source for this screen: **Buyer · Account Drawer (Desktop ID: `EYc0L` / Mobile ID: `q732Y`)** in `Pencil-Design/Shalmi`. Desktop: 480w right side panel with outer shadow over a 50%-dim of underlying page; sub-IDs `ZoF9z` (sheet root), `drDPHd` (close), `drDUC` (paper-2 user card with stamp row + stats grid), `Nav` (two white nav cards), `Foot` (lang row + logout + version). Mobile (`q732Y`): full-screen sheet, `paper-2` user card, `paper` nav card. Per design-inventory Q3: the existing route `/profile` (which has no page today) becomes the drawer trigger surface; on mobile, the sheet is an overlay over the current page.
The existing code source for this screen:
- **NEW UI pattern** — overlay, not a route. Closest existing surface is the `DropdownMenu` in `apps/web/src/modules/storefront/components/header/index.tsx` (and `modules/storefront/components/profile-nav/`).
- Trigger candidates: storefront header avatar (existing dropdown), and (per Q3) `/profile` route stub.
- Logout: `apps/web/src/modules/auth/components/logout-button/`
- Session: better-auth client (`modules/auth/client/auth-client/`)
- UI primitives that may back this: `packages/ui/src/components/sheet.tsx` (Radix-based sheet), `packages/ui/src/components/dialog.tsx`
- Language toggle: NOT in current codebase (per design-inventory Q16, toggle exists in design system but UI is English-only for now).

This is a READ-ONLY phase. The only file you may write is
`.claude-revamp/screens/buyer-account-drawer/gap-analysis.md` (create the folder).

Workflow:
1. Read the existing trigger surfaces end to end (storefront header,
   profile-nav, logout-button). Follow imports until you understand what
   the current avatar dropdown contains, where it's invoked from, and
   what session/user data flows into it.
2. Open the Pencil design for this overlay. Use `pencil:snapshot_layout`
   first, then `pencil:batch_get` for component details. Use
   `pencil:export_nodes` only if visual reference is genuinely needed.
3. For each visible UI element in the Pencil design, identify the
   corresponding element in the existing code (or note that there is none).
4. For each element in the existing code (e.g. dropdown items), identify
   the corresponding element in the Pencil design (or note that the
   design omits it).

Produce `gap-analysis.md` with these sections:

1. **Layout & structure** — overlay anatomy (desktop right-side 480w sheet
   vs mobile full-screen sheet); trigger placement; dim/scrim spec.

2. **Element-by-element diff** — a table:
   `pencil_element | existing_element | diff_summary | category`.
   Categories: VISUAL_ONLY, COPY_CHANGE, NEW_FIELD, REMOVED_FIELD,
   NEW_INTERACTION, CHANGED_INTERACTION, NEW_STATE, AMBIGUOUS.

3. **Schema / type implications** — what does the user-stats grid in the
   drawer's `drDUC` card need from the user/session/orders data? Map each
   stat back to a real DB column (or flag as missing).

4. **Behavior implications** — overlay open/close mechanics, route
   coupling (Q3 `/profile` as trigger), language-toggle stub, logout
   behavior, version-string source.

5. **Open questions for me** — numbered. EVERY row in section 2 with
   category NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE, COPY_CHANGE, or AMBIGUOUS MUST become a numbered question
   here. For each:
   - What you observed (in design and in code).
   - The specific question.
   - 2–3 plausible answers if you have hypotheses (but do not pick one).

Hard rules:
- DO NOT propose a single line of code yet.
- DO NOT assume defaults for new fields. Each becomes a question.
- DO NOT assume removed elements are intentional removals. Ask.
- DO NOT assume copy changes are intentional. Ask.
- If a Pencil component you need wasn't covered in `02-design-inventory.md`
  or `04-design-system-implementation-log.md`, flag it as a question before
  writing the gap analysis.

When done, show me the file path and STOP. Do not start implementation.

---

## 9. Admin · Dashboard

We're doing the gap analysis for ONE screen: **Admin · Dashboard**.

Read these files first:
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/02-design-inventory.md`
- `.claude-revamp/03-token-migration.md`
- `.claude-revamp/04-design-system-implementation-log.md`

The Pencil source for this screen: **Admin · Dashboard (Desktop ID: `AcB4v` / Mobile ID: `R0bdxR`)** in `Pencil-Design/Shalmi`. Notable contents: ink top bar with `Admin` badge, sidebar (3 sections, ~11 nav items), Breadcrumb, Header, KPI grid, two-col row, Recent Orders table, bottom row (top sellers + audit log). Per `01-codebase-map.md` Q4 the existing dashboard is a placeholder, so most of this is essentially new content.
The existing code source for this screen:
- Route: `/admin/dashboard` (`/admin` redirects here)
- Page file: `apps/web/src/app/admin/dashboard/page.tsx` (SC wrapper)
- Body component: `apps/web/src/modules/admin/admin-dashboard/` (CC; placeholder per codebase-map Q4)
- Layout: `apps/web/src/app/admin/layout.tsx` + `apps/web/src/modules/admin/admin-layout/` (`AdminSidebar`, `LogoutButton`, `SidebarProvider`)
- Middleware: admin role-gated (`apps/web/src/middleware.ts`)
- Audit log table: `packages/database/src/schema/admin-audit-log.ts`
- No analytics/KPI endpoints exist today.

This is a READ-ONLY phase. The only file you may write is
`.claude-revamp/screens/admin-dashboard/gap-analysis.md` (create the folder).

Workflow:
1. Read the existing screen file(s) end to end (the dashboard body,
   admin layout, sidebar). Follow imports until you understand the
   current placeholder structure and the layout shell.
2. Open the Pencil design for this screen. Use `pencil:snapshot_layout` first,
   then `pencil:batch_get` for component details. Use `pencil:export_nodes`
   only if visual reference is genuinely needed.
3. For each visible UI element in the Pencil design, identify the
   corresponding element in the existing code (or note that there is none —
   most of this dashboard is brand-new).
4. For each element in the existing code, identify the corresponding
   element in the Pencil design (or note that the design omits it).

Produce `gap-analysis.md` with these sections:

1. **Layout & structure** — admin shell (top bar + sidebar + main); KPI
   grid + tables.

2. **Element-by-element diff** — a table:
   `pencil_element | existing_element | diff_summary | category`.
   Categories: VISUAL_ONLY, COPY_CHANGE, NEW_FIELD, REMOVED_FIELD,
   NEW_INTERACTION, CHANGED_INTERACTION, NEW_STATE, AMBIGUOUS.

3. **Schema / type implications** — for every NEW_FIELD or REMOVED_FIELD,
   what schema/type/API changes would be required? KPI sources, recent
   orders aggregation, top sellers, audit-log feed — none of these have
   endpoints today; itemize what's needed.

4. **Behavior implications** — for every NEW_INTERACTION,
   CHANGED_INTERACTION, or NEW_STATE, what code paths would change? What
   API endpoints? What data fetching? Cover sidebar nav items (~11) vs
   the current sidebar contents.

5. **Open questions for me** — numbered. EVERY row in section 2 with
   category NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE, COPY_CHANGE, or AMBIGUOUS MUST become a numbered question
   here. For each:
   - What you observed (in design and in code).
   - The specific question.
   - 2–3 plausible answers if you have hypotheses (but do not pick one).

Hard rules:
- DO NOT propose a single line of code yet.
- DO NOT assume defaults for new fields. Each becomes a question.
- DO NOT assume removed elements are intentional removals. Ask.
- DO NOT assume copy changes are intentional. Ask.
- If a Pencil component you need wasn't covered in `02-design-inventory.md`
  or `04-design-system-implementation-log.md`, flag it as a question before
  writing the gap analysis.

When done, show me the file path and STOP. Do not start implementation.

---

## 10. Admin · Vendors

We're doing the gap analysis for ONE screen: **Admin · Vendors**.

Read these files first:
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/02-design-inventory.md`
- `.claude-revamp/03-token-migration.md`
- `.claude-revamp/04-design-system-implementation-log.md`

The Pencil source for this screen: **Admin · Vendors (Desktop ID: `H6Ch4T` / Mobile ID: `Xmeb6`)** in `Pencil-Design/Shalmi`. Notable: Breadcrumb, header `vHd`, KPI row `vKpi`, filters `vFil`, `vSplit` (table left + edit panel right with shop info, categories, limits per brief). Per design-inventory Q14, edit panel adds **categories** and **limits** as new fields (no GST).
The existing code source for this screen:
- Route: `/admin/vendors`
- Page file: `apps/web/src/app/admin/vendors/page.tsx` → `AdminVendors` (CC, middleware-gated)
- Module: `apps/web/src/modules/admin/admin-vendors/` (`VendorsPageHeader`, `VendorsTable`, `VendorsTableSkeleton`, `VendorsPagination`, `VendorDialog`)
- Hooks: `useAdminVendors`, `useVendorsQuery`, `useVendorQuery`, `useCreateVendorMutation`, `useUpdateVendorMutation`
- API: `GET, POST /api/admin/vendors`, `GET, PATCH /api/admin/vendors/[id]`
- Schemas: `apps/web/src/modules/admin/admin-vendors/schemas/` (`bankDetailsSchema`, `createVendorSchema`, `updateVendorSchema`)
- DB: `packages/database/src/schema/vendors.ts` — current fields: `shopName`, `city`, `hub`, `bankName`, `accountTitle`, `iban`, `isActive` (no `categories`, no `limits`).

This is a READ-ONLY phase. The only file you may write is
`.claude-revamp/screens/admin-vendors/gap-analysis.md` (create the folder).

Workflow:
1. Read the existing screen file(s) end to end. Follow imports until you
   understand the full component tree, the data it loads, the schemas
   involved, and the actions it triggers (incl. the dialog vs the
   Pencil split-view edit panel).
2. Open the Pencil design for this screen. Use `pencil:snapshot_layout` first,
   then `pencil:batch_get` for component details. Use `pencil:export_nodes`
   only if visual reference is genuinely needed.
3. For each visible UI element in the Pencil design, identify the
   corresponding element in the existing code (or note that there is none).
4. For each element in the existing code, identify the corresponding
   element in the Pencil design (or note that the design omits it).

Produce `gap-analysis.md` with these sections:

1. **Layout & structure** — current dialog-based edit vs Pencil
   `vSplit` (inline panel) — confirm the routing impact.

2. **Element-by-element diff** — a table:
   `pencil_element | existing_element | diff_summary | category`.
   Categories: VISUAL_ONLY, COPY_CHANGE, NEW_FIELD, REMOVED_FIELD,
   NEW_INTERACTION, CHANGED_INTERACTION, NEW_STATE, AMBIGUOUS.

3. **Schema / type implications** — for every NEW_FIELD or REMOVED_FIELD,
   what schema/type/API changes would be required? Cover **categories**
   (per-vendor, many-to-many with `categories`?) and **limits** (numeric?
   types?) per Q14.

4. **Behavior implications** — for every NEW_INTERACTION,
   CHANGED_INTERACTION, or NEW_STATE, what code paths would change? What
   API endpoints? What data fetching? Cover KPI sources (`vKpi`),
   filter behavior (`vFil`), split-panel state.

5. **Open questions for me** — numbered. EVERY row in section 2 with
   category NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE, COPY_CHANGE, or AMBIGUOUS MUST become a numbered question
   here. For each:
   - What you observed (in design and in code).
   - The specific question.
   - 2–3 plausible answers if you have hypotheses (but do not pick one).

Hard rules:
- DO NOT propose a single line of code yet.
- DO NOT assume defaults for new fields. Each becomes a question.
- DO NOT assume removed elements are intentional removals. Ask.
- DO NOT assume copy changes are intentional. Ask.
- If a Pencil component you need wasn't covered in `02-design-inventory.md`
  or `04-design-system-implementation-log.md`, flag it as a question before
  writing the gap analysis.

When done, show me the file path and STOP. Do not start implementation.

---

## 11. Admin · Categories

We're doing the gap analysis for ONE screen: **Admin · Categories**.

Read these files first:
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/02-design-inventory.md`
- `.claude-revamp/03-token-migration.md`
- `.claude-revamp/04-design-system-implementation-log.md`

The Pencil source for this screen: **Admin · Categories (Desktop ID: `A0BZZx` / Mobile ID: `IVbBD`)** in `Pencil-Design/Shalmi`. Notable: breadcrumb `cBC`, header `cHd`, KPI row `cKpi`, filters `cFil`, `cSplit` (table + edit panel — icon picker / slug / parent / sort order per brief). Mobile shell with `mcSub` and List.
The existing code source for this screen:
- Route: `/admin/categories`
- Page file: `apps/web/src/app/admin/categories/page.tsx` → `AdminCategories` (CC, middleware-gated)
- Module: `apps/web/src/modules/admin/admin-categories/` (`CategoriesPageHeader`, `CategoriesTable`, `CategoriesTableSkeleton`, `CategoryDialog`)
- Hooks: `useCategoryQuery`, `useCreateCategoryMutation`, `useUpdateCategoryMutation`
- API: `GET /api/categories` (public), `POST /api/admin/categories`, `PATCH /api/admin/categories/[id]`, `POST /api/admin/upload/categories`
- Schemas: `apps/web/src/modules/admin/admin-categories/schemas/` (`createCategorySchema`, `updateCategorySchema`)
- DB: `packages/database/src/schema/categories.ts` — current fields: `id`, `name`, `slug`, `imageUrl`, timestamps (no `parent`, no `sortOrder`, no `iconKey`).

This is a READ-ONLY phase. The only file you may write is
`.claude-revamp/screens/admin-categories/gap-analysis.md` (create the folder).

Workflow:
1. Read the existing screen file(s) end to end. Follow imports until you
   understand the full component tree, the data it loads, the schemas
   involved, and the actions it triggers (dialog vs split-panel).
2. Open the Pencil design for this screen. Use `pencil:snapshot_layout` first,
   then `pencil:batch_get` for component details. Use `pencil:export_nodes`
   only if visual reference is genuinely needed.
3. For each visible UI element in the Pencil design, identify the
   corresponding element in the existing code (or note that there is none).
4. For each element in the existing code, identify the corresponding
   element in the Pencil design (or note that the design omits it).

Produce `gap-analysis.md` with these sections:

1. **Layout & structure** — overall layout differences (dialog vs
   `cSplit` inline edit panel).

2. **Element-by-element diff** — a table:
   `pencil_element | existing_element | diff_summary | category`.
   Categories: VISUAL_ONLY, COPY_CHANGE, NEW_FIELD, REMOVED_FIELD,
   NEW_INTERACTION, CHANGED_INTERACTION, NEW_STATE, AMBIGUOUS.

3. **Schema / type implications** — for every NEW_FIELD or REMOVED_FIELD,
   what schema/type/API changes would be required? Cover **icon picker**
   (icon-key field?), **parent** (self-referencing FK?), **sort order**
   (int column? reorder API?).

4. **Behavior implications** — for every NEW_INTERACTION,
   CHANGED_INTERACTION, or NEW_STATE, what code paths would change? What
   API endpoints? What data fetching? Cover KPI sources, filter behavior,
   reorder/drag mechanics if implied.

5. **Open questions for me** — numbered. EVERY row in section 2 with
   category NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE, COPY_CHANGE, or AMBIGUOUS MUST become a numbered question
   here. For each:
   - What you observed (in design and in code).
   - The specific question.
   - 2–3 plausible answers if you have hypotheses (but do not pick one).

Hard rules:
- DO NOT propose a single line of code yet.
- DO NOT assume defaults for new fields. Each becomes a question.
- DO NOT assume removed elements are intentional removals. Ask.
- DO NOT assume copy changes are intentional. Ask.
- If a Pencil component you need wasn't covered in `02-design-inventory.md`
  or `04-design-system-implementation-log.md`, flag it as a question before
  writing the gap analysis.

When done, show me the file path and STOP. Do not start implementation.

---

## 12. Admin · Banners

We're doing the gap analysis for ONE screen: **Admin · Banners (Promo Banners)**.

Read these files first:
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/02-design-inventory.md`
- `.claude-revamp/03-token-migration.md`
- `.claude-revamp/04-design-system-implementation-log.md`

The Pencil source for this screen: **Admin · Banners (Desktop ID: `bjD87` / Mobile ID: `btIjo`)** in `Pencil-Design/Shalmi`. Notable: breadcrumb `bnBC`, header `bnHd`, KPI row `bnKpi`, filters `bnFil`, banner grid (vertical layout) + edit panel card with preview / scheduling / CTR / revenue per brief. Per design-inventory Q13, scheduling (`startsAt`/`endsAt`) and impression/click counters are new schema.
The existing code source for this screen:
- Route: `/admin/promo-banners`
- Page file: `apps/web/src/app/admin/promo-banners/page.tsx` → `AdminPromoBanners` (CC, middleware-gated)
- Module: `apps/web/src/modules/admin/admin-promo-banners/` (`BannersCarousel` (dnd-kit sortable), `AvailableBannersGrid`, `BannerDialog`, hooks, schemas, utils)
- Hooks: `useBannersQuery`, `useCreateBannerMutation`, `useBulkUpdateBannersMutation`
- API: `GET, POST /api/admin/banners`, `PUT /api/admin/banners/bulk`, `POST /api/admin/upload/promo-assets`, public `GET /api/banners`
- Schemas: `apps/web/src/modules/admin/admin-promo-banners/schemas/` (`createBannerSchema`, `bulkUpdateBannerSchema`, `bulkUpdateBannersPayloadSchema`)
- DB: `packages/database/src/schema/promotional-banners.ts` — current fields: `id`, `title`, `imageUrl`, `targetUrl`, `isActive`, `displayOrder`, timestamps (no `startsAt`/`endsAt`, no impression/click counts).

This is a READ-ONLY phase. The only file you may write is
`.claude-revamp/screens/admin-banners/gap-analysis.md` (create the folder).

Workflow:
1. Read the existing screen file(s) end to end. Follow imports until you
   understand the full component tree, the data it loads, the schemas
   involved, and the actions it triggers (sortable grid, bulk-save flow).
2. Open the Pencil design for this screen. Use `pencil:snapshot_layout` first,
   then `pencil:batch_get` for component details. Use `pencil:export_nodes`
   only if visual reference is genuinely needed.
3. For each visible UI element in the Pencil design, identify the
   corresponding element in the existing code (or note that there is none).
4. For each element in the existing code, identify the corresponding
   element in the Pencil design (or note that the design omits it).
   Pencil shows a "vertical banner grid" — confirm vs current
   active-carousel + available-grid two-zone layout.

Produce `gap-analysis.md` with these sections:

1. **Layout & structure** — current two-zone (active carousel +
   available grid) vs Pencil's vertical grid + edit-panel.

2. **Element-by-element diff** — a table:
   `pencil_element | existing_element | diff_summary | category`.
   Categories: VISUAL_ONLY, COPY_CHANGE, NEW_FIELD, REMOVED_FIELD,
   NEW_INTERACTION, CHANGED_INTERACTION, NEW_STATE, AMBIGUOUS.

3. **Schema / type implications** — for every NEW_FIELD or REMOVED_FIELD,
   what schema/type/API changes would be required? Cover scheduling
   (`startsAt`/`endsAt` types, timezone handling), impressions/clicks
   counters (counter columns? events table?), CTR/revenue derivations.

4. **Behavior implications** — for every NEW_INTERACTION,
   CHANGED_INTERACTION, or NEW_STATE, what code paths would change? What
   API endpoints? What data fetching? Cover KPI sources, schedule
   validation, metrics aggregation.

5. **Open questions for me** — numbered. EVERY row in section 2 with
   category NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE, COPY_CHANGE, or AMBIGUOUS MUST become a numbered question
   here. For each:
   - What you observed (in design and in code).
   - The specific question.
   - 2–3 plausible answers if you have hypotheses (but do not pick one).

Hard rules:
- DO NOT propose a single line of code yet.
- DO NOT assume defaults for new fields. Each becomes a question.
- DO NOT assume removed elements are intentional removals. Ask.
- DO NOT assume copy changes are intentional. Ask.
- If a Pencil component you need wasn't covered in `02-design-inventory.md`
  or `04-design-system-implementation-log.md`, flag it as a question before
  writing the gap analysis.

When done, show me the file path and STOP. Do not start implementation.

---

## 13. Vendor · Dashboard

We're doing the gap analysis for ONE screen: **Vendor · Dashboard**.

Read these files first:
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/02-design-inventory.md`
- `.claude-revamp/03-token-migration.md`
- `.claude-revamp/04-design-system-implementation-log.md`
- `.claude-revamp/screens/vendor-portal.md` (existing screens artifact for the vendor portal)

The Pencil source for this screen: **Vendor · Dashboard (Desktop ID: `VqlnC` / Mobile ID: `L95K24`)** in `Pencil-Design/Shalmi`. Notable: ink top bar with `Vendor` badge, sidebar (4 sections, 5 nav items), header with eyebrow ("MONDAY · 28 APRIL · GUJRANWALA") + title + "This month" filter + green "Add product" CTA, KPI row (Orders Today amber, Revenue MTD, Active Listings, Payout Pending — inverse ink), Sales chart (7-day bars), TwoCol (recent orders + low stock + top sellers), Payouts callout (paper-2 banner with View ledger CTA). Mobile: stacked + bottom tab bar (Dashboard / Products / Orders / Ledger / More — per design-inventory Q19, ignore "More" and bell). Sample copy in `screens/vendor-portal.md` is **placeholder — must be confirmed before wiring**.
The existing code source for this screen:
- Route: `/vendor/dashboard` (`/vendor` redirects here)
- Page file: `apps/web/src/app/vendor/dashboard/page.tsx` (SC; per `01-codebase-map.md` Q5, currently a static placeholder "Use the sidebar…")
- Layout: `apps/web/src/app/vendor/layout.tsx` + `apps/web/src/modules/vendor/vendor-layout/` (`VendorSidebar`)
- Middleware: vendor role-gated (`apps/web/src/middleware.ts`)
- Vendor DB: `packages/database/src/schema/vendors.ts`, `vendor-ledger.ts`, `sub-orders.ts`, `products.ts`
- No analytics/payout/KPI endpoints exist today.

This is a READ-ONLY phase. The only file you may write is
`.claude-revamp/screens/vendor-dashboard/gap-analysis.md` (create the folder).

Workflow:
1. Read the existing screen file(s) end to end (the placeholder dashboard,
   vendor layout, sidebar). Follow imports until you understand the
   current shell.
2. Open the Pencil design for this screen. Use `pencil:snapshot_layout` first,
   then `pencil:batch_get` for component details. Use `pencil:export_nodes`
   only if visual reference is genuinely needed.
3. For each visible UI element in the Pencil design, identify the
   corresponding element in the existing code (or note that there is none —
   most of this dashboard is brand-new).
4. For each element in the existing code, identify the corresponding
   element in the Pencil design (or note that the design omits it).

Produce `gap-analysis.md` with these sections:

1. **Layout & structure** — vendor shell (top bar + sidebar + main on
   desktop; app bar + bottom tab bar on mobile); KPI row + chart + two-col
   + payout callout.

2. **Element-by-element diff** — a table:
   `pencil_element | existing_element | diff_summary | category`.
   Categories: VISUAL_ONLY, COPY_CHANGE, NEW_FIELD, REMOVED_FIELD,
   NEW_INTERACTION, CHANGED_INTERACTION, NEW_STATE, AMBIGUOUS.

3. **Schema / type implications** — for every NEW_FIELD or REMOVED_FIELD,
   what schema/type/API changes would be required? Cover `payout_pending_amount`,
   `payout_release_date`, `payout_bank_last4` (per `screens/vendor-portal.md`
   open Q1), low-stock threshold, KPI feeds, sales-chart series.

4. **Behavior implications** — for every NEW_INTERACTION,
   CHANGED_INTERACTION, or NEW_STATE, what code paths would change? What
   API endpoints? What data fetching? Cover "This month" filter,
   "Add product" CTA target (vendor products page), "View ledger" link
   (Vendor · Ledger — currently NEW), bottom-tab navigation.

5. **Open questions for me** — numbered. EVERY row in section 2 with
   category NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE, COPY_CHANGE, or AMBIGUOUS MUST become a numbered question
   here. For each:
   - What you observed (in design and in code).
   - The specific question.
   - 2–3 plausible answers if you have hypotheses (but do not pick one).

Hard rules:
- DO NOT propose a single line of code yet.
- DO NOT assume defaults for new fields. Each becomes a question.
- DO NOT assume removed elements are intentional removals. Ask.
- DO NOT assume copy changes are intentional. Ask.
- If a Pencil component you need wasn't covered in `02-design-inventory.md`
  or `04-design-system-implementation-log.md`, flag it as a question before
  writing the gap analysis.

When done, show me the file path and STOP. Do not start implementation.

---

## 14. Vendor · Products

We're doing the gap analysis for ONE screen: **Vendor · Products (list + inline add/edit form per design-inventory Q11)**.

Read these files first:
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/02-design-inventory.md`
- `.claude-revamp/03-token-migration.md`
- `.claude-revamp/04-design-system-implementation-log.md`
- `.claude-revamp/screens/vendor-portal.md`

The Pencil source for this screen: **Vendor · Products (Desktop ID: `H7jii` / Mobile ID: `tXG16`)** in `Pencil-Design/Shalmi`. Notable: header (eyebrow "CATALOG · 47 ACTIVE", "Import CSV" + green "Add product" CTAs), stats segments (4-cell white card with internal dividers: ALL / ACTIVE / LOW STOCK / DRAFTS), product table card with filter bar + table rows + paginator. Mobile: hero card, search, chip row (All / Active / Low stock / Drafts), product list, "Add product section". The Pencil design draws **list + add-product form on the same scroll** — per design-inventory Q11, the revamp **collapses to a single scroll page** (form visible only for edit on selecting a product, or for add with empty state on clicking Add product button).
The existing code source for this screen:
- Routes: `/vendor/products`, `/vendor/products/new`, `/vendor/products/[id]/edit` (all middleware-gated; **the Q11 answer collapses these to a single route**)
- Page files:
  - `apps/web/src/app/vendor/products/page.tsx` → `VendorProducts` (CC) — list
  - `apps/web/src/app/vendor/products/new/page.tsx` (SC) — wraps `AddProductForm`
  - `apps/web/src/app/vendor/products/[id]/edit/page.tsx` (CC, `useParams`) — wraps `AddProductForm` prefilled
- Modules:
  - `apps/web/src/modules/vendor/vendor-products/` (`ProductListPageHeader`, `ProductTable`, `ProductTableSkeleton`, `ProductImageThumbnail`, `ProductCategoriesCell`, hooks)
  - `apps/web/src/modules/vendor/vendor-products/modules/add-product/` — `AddProductForm`, mutations
- Hooks: `useVendorProductsQuery`, `useVendorCategoriesQuery`, `useVendorProductQuery`, `useCreateProductMutation`, `useUpdateProductMutation`
- API: `GET, POST /api/vendor/products`, `GET, PATCH /api/vendor/products/[id]`, `POST /api/vendor/upload`
- DB / schemas: `packages/database/src/schema/products.ts`, `product-price-tiers.ts`, `product-categories.ts`; `packages/schemas/src/catalog/product.ts`, `catalog/product-price-tiers.ts`. Per design-inventory Q12, **pricing model changes** from tiers to discrete packs — schema migration needed.
- "Import CSV" CTA: no existing endpoint.

This is a READ-ONLY phase. The only file you may write is
`.claude-revamp/screens/vendor-products/gap-analysis.md` (create the folder).

Workflow:
1. Read the existing screen file(s) end to end (list page, new page,
   edit page, AddProductForm, table, hooks). Follow imports until you
   understand the full component tree, the data it loads, the schemas
   involved, and the actions it triggers.
2. Open the Pencil design for this screen. Use `pencil:snapshot_layout` first,
   then `pencil:batch_get` for component details. Use `pencil:export_nodes`
   only if visual reference is genuinely needed.
3. For each visible UI element in the Pencil design, identify the
   corresponding element in the existing code (or note that there is none).
4. For each element in the existing code, identify the corresponding
   element in the Pencil design (or note that the design omits it).

Produce `gap-analysis.md` with these sections:

1. **Layout & structure** — overall layout differences. Note the
   route-collapse decision (Q11) and how list + form share the page on
   both desktop and mobile.

2. **Element-by-element diff** — a table:
   `pencil_element | existing_element | diff_summary | category`.
   Categories: VISUAL_ONLY, COPY_CHANGE, NEW_FIELD, REMOVED_FIELD,
   NEW_INTERACTION, CHANGED_INTERACTION, NEW_STATE, AMBIGUOUS.

3. **Schema / type implications** — for every NEW_FIELD or REMOVED_FIELD,
   what schema/type/API changes would be required? Cover the **pack-based
   pricing model** (Q12), product status taxonomy ("LOW STOCK" / "DRAFT"
   per `screens/vendor-portal.md` Q2), CSV import, low-stock threshold.

4. **Behavior implications** — for every NEW_INTERACTION,
   CHANGED_INTERACTION, or NEW_STATE, what code paths would change? What
   API endpoints? What data fetching? Cover route consolidation, status
   filter chips, paginator on list, image upload.

5. **Open questions for me** — numbered. EVERY row in section 2 with
   category NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE, COPY_CHANGE, or AMBIGUOUS MUST become a numbered question
   here. For each:
   - What you observed (in design and in code).
   - The specific question.
   - 2–3 plausible answers if you have hypotheses (but do not pick one).

Hard rules:
- DO NOT propose a single line of code yet.
- DO NOT assume defaults for new fields. Each becomes a question.
- DO NOT assume removed elements are intentional removals. Ask.
- DO NOT assume copy changes are intentional. Ask.
- If a Pencil component you need wasn't covered in `02-design-inventory.md`
  or `04-design-system-implementation-log.md`, flag it as a question before
  writing the gap analysis.

When done, show me the file path and STOP. Do not start implementation.

---

## 15. Vendor · Orders

We're doing the gap analysis for ONE screen: **Vendor · Orders**.

Read these files first:
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/02-design-inventory.md`
- `.claude-revamp/03-token-migration.md`
- `.claude-revamp/04-design-system-implementation-log.md`
- `.claude-revamp/screens/vendor-portal.md`

The Pencil source for this screen: **Vendor · Orders (Desktop ID: `jXwqE` / Mobile ID: `EEK8K`)** in `Pencil-Design/Shalmi`. Notable: ink top bar (`LslMi`), sidebar with Orders active (carries an amber `8` pending-order badge across vendor screens), main column header, **`Status segments`** frame (NEW / PACKED / DISPATCHED ratio), `voSubHd`, order cards each with a giant "Packed ✓" CTA, `Later zone` paper-2 callout. Mobile (`EEK8K`): app bar (`fAWNZ`) + hero card + Status segs + Cards + bottom tab bar (Orders active). Per design-inventory Q9, stamp labels are **display-only mappings** of the existing `sub_orders.status` enum (`pending` / `packed` / `handed_to_courier` / `delivered` / `cancelled`) — no schema migration for statuses.
The existing code source for this screen:
- Route: `/vendor/orders`
- Page file: `apps/web/src/app/vendor/orders/page.tsx` → `VendorOrders` (CC, middleware-gated)
- Module: `apps/web/src/modules/vendor/vendor-orders/` (`OrderCard`, hooks, status-update mutation)
- Hooks: `useVendorOrdersQuery`, `useUpdateSubOrderStatusMutation`
- API: `GET /api/vendor/orders`, `PATCH /api/vendor/orders/[subOrderId]` (status transitions: `pending` → `packed` → `handed_to_courier` → `delivered`/`cancelled`)
- DB: `packages/database/src/schema/sub-orders.ts`, `order-items.ts`, `orders.ts`

This is a READ-ONLY phase. The only file you may write is
`.claude-revamp/screens/vendor-orders/gap-analysis.md` (create the folder).

Workflow:
1. Read the existing screen file(s) end to end. Follow imports until you
   understand the full component tree, the data it loads, the schemas
   involved, and the actions it triggers (status-transition flow).
2. Open the Pencil design for this screen. Use `pencil:snapshot_layout` first,
   then `pencil:batch_get` for component details. Use `pencil:export_nodes`
   only if visual reference is genuinely needed.
3. For each visible UI element in the Pencil design, identify the
   corresponding element in the existing code (or note that there is none).
4. For each element in the existing code, identify the corresponding
   element in the Pencil design (or note that the design omits it).

Produce `gap-analysis.md` with these sections:

1. **Layout & structure** — overall layout (status segments + cards +
   later zone); mobile bottom tab bar.

2. **Element-by-element diff** — a table:
   `pencil_element | existing_element | diff_summary | category`.
   Categories: VISUAL_ONLY, COPY_CHANGE, NEW_FIELD, REMOVED_FIELD,
   NEW_INTERACTION, CHANGED_INTERACTION, NEW_STATE, AMBIGUOUS.

3. **Schema / type implications** — for every NEW_FIELD or REMOVED_FIELD,
   what schema/type/API changes would be required? Pay attention to the
   "Packed ✓" giant CTA workflow vs the existing PATCH-status flow.
   Status taxonomy is display-only (Q9) — no schema change for that.

4. **Behavior implications** — for every NEW_INTERACTION,
   CHANGED_INTERACTION, or NEW_STATE, what code paths would change? What
   API endpoints? What data fetching? Cover Status segments source data,
   `Later zone` filter behavior, the giant-CTA UX vs current button.

5. **Open questions for me** — numbered. EVERY row in section 2 with
   category NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE, COPY_CHANGE, or AMBIGUOUS MUST become a numbered question
   here. For each:
   - What you observed (in design and in code).
   - The specific question.
   - 2–3 plausible answers if you have hypotheses (but do not pick one).

Hard rules:
- DO NOT propose a single line of code yet.
- DO NOT assume defaults for new fields. Each becomes a question.
- DO NOT assume removed elements are intentional removals. Ask.
- DO NOT assume copy changes are intentional. Ask.
- If a Pencil component you need wasn't covered in `02-design-inventory.md`
  or `04-design-system-implementation-log.md`, flag it as a question before
  writing the gap analysis.

When done, show me the file path and STOP. Do not start implementation.

---

## 16. Vendor · Ledger

We're doing the gap analysis for ONE screen: **Vendor · Ledger (Friday weekly payouts)**.

Read these files first:
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/02-design-inventory.md`
- `.claude-revamp/03-token-migration.md`
- `.claude-revamp/04-design-system-implementation-log.md`
- `.claude-revamp/screens/vendor-portal.md`

The Pencil source for this screen: **Vendor · Ledger (Desktop ID: `S8BU3J` / Mobile ID: `u5iGd`)** in `Pencil-Design/Shalmi`. Notable: ink top bar, sidebar with Ledger active, main: `ldHd`, `Next payout` block (`ink` fill, radius 16, 32/40 padding — countdown card per brief), `ldRow` two-col (breakdown + bank info per brief), `History card` (white, hairline). Mobile: app bar + scroll only.
The existing code source for this screen:
- **NEW route** — `/vendor/ledger` is referenced in `ABSOLUTE_ROUTES.VENDOR_LEDGER` (`apps/web/src/modules/core/constants/absolute-routes.ts`) but no page file exists. (`01-codebase-map.md` Open Q9.)
- DB already has the table: `packages/database/src/schema/vendor-ledger.ts` — fields: `id`, `vendorId`, `direction` (`credit`/`debit`), `amount`, `type` (`sale_revenue` / `logistics_reimbursement` / `payout` / `penalty`), `referenceId`, `description`, `createdAt`. Vendor bank info on `vendors` table (`bankName`, `accountTitle`, `iban`).
- No API endpoints exist for vendor ledger or payout calculations today.
- Vendor layout: `apps/web/src/app/vendor/layout.tsx` + `apps/web/src/modules/vendor/vendor-layout/`

This is a READ-ONLY phase. The only file you may write is
`.claude-revamp/screens/vendor-ledger/gap-analysis.md` (create the folder).

Workflow:
1. Read the existing relevant code (vendor layout/sidebar, the
   `vendor_ledger` schema, the absolute-routes constant). Confirm there
   is no `app/vendor/ledger/page.tsx` and no `/api/vendor/ledger/*`
   endpoint today.
2. Open the Pencil design for this screen. Use `pencil:snapshot_layout` first,
   then `pencil:batch_get` for component details. Use `pencil:export_nodes`
   only if visual reference is genuinely needed.
3. For each visible UI element in the Pencil design, identify the
   corresponding element in the existing code (or note that there is none —
   this is a brand-new route).
4. For each element in the existing code (DB columns), identify the
   corresponding element in the Pencil design (or note that the design
   omits it — e.g. is `penalty` direction surfaced anywhere?).

Produce `gap-analysis.md` with these sections:

1. **Layout & structure** — Next-payout block (ink card with countdown)
   + breakdown + bank info two-col + history card.

2. **Element-by-element diff** — a table:
   `pencil_element | existing_element | diff_summary | category`.
   Most rows on the existing side will be "(none — new route)". Categories:
   VISUAL_ONLY, COPY_CHANGE, NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION,
   CHANGED_INTERACTION, NEW_STATE, AMBIGUOUS.

3. **Schema / type implications** — for every NEW_FIELD or REMOVED_FIELD,
   what schema/type/API changes would be required? The `vendor_ledger`
   table exists; figure out whether the design's "Next payout" amount
   needs a derived view (sum of credits not yet paid out), whether
   bank-account-last4 is OK to derive from `iban`, whether countdown
   needs a `payout_release_date` column (already flagged in
   `screens/vendor-portal.md` Q1).

4. **Behavior implications** — for every NEW_INTERACTION,
   CHANGED_INTERACTION, or NEW_STATE, what code paths would change? What
   API endpoints? What data fetching? Cover `GET /api/vendor/ledger`
   shape, payout-cycle business logic (Friday weekly), navigation from
   Vendor Dashboard's "View ledger" CTA.

5. **Open questions for me** — numbered. EVERY row in section 2 with
   category NEW_FIELD, REMOVED_FIELD, NEW_INTERACTION, CHANGED_INTERACTION,
   NEW_STATE, COPY_CHANGE, or AMBIGUOUS MUST become a numbered question
   here. For each:
   - What you observed (in design and in code).
   - The specific question.
   - 2–3 plausible answers if you have hypotheses (but do not pick one).

Hard rules:
- DO NOT propose a single line of code yet.
- DO NOT assume defaults for new fields. Each becomes a question.
- DO NOT assume removed elements are intentional removals. Ask.
- DO NOT assume copy changes are intentional. Ask.
- If a Pencil component you need wasn't covered in `02-design-inventory.md`
  or `04-design-system-implementation-log.md`, flag it as a question before
  writing the gap analysis.

When done, show me the file path and STOP. Do not start implementation.

---

## Notes on coverage

- **Auth screens** (`/auth`, `/auth/otp`, `(auth)/sign-in`, `(auth)/sign-up`)
  are **not** in this prompts file because the Pencil document contains no
  auth frames (per `02-design-inventory.md` §4 — only 16 v2 screens, none
  of which are auth). See `01-codebase-map.md` Open Q1–Q3 for the wider
  question of whether auth is in revamp scope.
- **Checkout success** (`/checkout/success`) is also undrawn in Pencil and
  is therefore not covered here.
- The **Design System showcase** (`a2HFrA`) and the v1 reference mockups
  (`F4eQQ`, `XaQ7g`) are reference-only and have no route counterpart;
  they are excluded by design (per design-inventory Q15).
- If, while running a prompt, the agent discovers the Pencil frame
  references additional sub-frames not listed in `02-design-inventory.md`
  (or named with IDs we don't have), it should treat that as an open
  question rather than guessing the mapping.
