# Feature surface map — Account Drawer / Sheet

> **Phase:** Per-feature mapping (read-only).
> **Date produced:** 2026-05-02
> **Pencil sources:** `EYc0L` (desktop), `q732Y` (mobile), plus the
> account-button entry point as drawn inside every Buyer screen header.
> **Pairs with:** `01-codebase-map.md`, `02-design-inventory.md`,
> `04-design-system-implementation-log.md`.

This document maps **what the Pencil designs show** for the Account
Drawer feature. It does not propose code, schema, or behavior. Every
inference (anything not literally drawn) is called out and pushed into
§7 "Open questions". Hard rules from `CLAUDE.md` apply.

---

## 1. Feature summary

The Account Drawer is an overlay surface (a 480w right-side sheet on
desktop, a full-screen sheet on mobile) launched from an "Account"
button in the header of every Buyer screen. It centralizes the logged-in
buyer's identity, account stats, navigation to account-area pages, and
shell controls (language toggle, log out, app version). It is presented
on top of a 50%-ink dimmed copy of the underlying page (desktop) — i.e.
it is **an overlay, not a route** (inferred from the dim layer in
`EYc0L → s6VmKD` and the layout absence on the mobile sheet). The
drawer's user card surfaces verification status (inferred), tenure
("Member since Mar 2024"), and three numeric stats (Orders count, Spent
total, Saved total — the last is inferred). The nav splits into "YOUR
ACCOUNT" (Orders, Quick reorder, Saved addresses, Payment methods, Saved
items, Settings) and "HELP & SUPPORT" (Track order, Help center, Terms &
privacy). A LANGUAGE toggle (EN / اردو) and a Log out button sit in the
foot. The drawer is the only place in the Buyer chrome where account
context is exposed (inferred — no other account surface is drawn in
header chrome across the Buyer screens).

---

## 2. Touchpoint inventory

| pencil_location | touchpoint_type | existing_screen? |
|---|---|---|
| `EYc0L` Buyer · Account drawer · Desktop (frame) | NEW_ELEMENT_ON_EXISTING_SCREEN (overlay surface, not a route) | No — overlay attaches to every Buyer page |
| `EYc0L → ZoF9z` Account drawer panel (480w right-side) | NEW_ELEMENT_ON_EXISTING_SCREEN | No |
| `EYc0L → s6VmKD` Page dim layer (`#0F141199`) | NEW_ELEMENT_ON_EXISTING_SCREEN | No |
| `ZoF9z → LkrJP` (drDPHd) drawer header — title "Account" + close `x` icon button | NEW_ELEMENT_ON_EXISTING_SCREEN | No |
| `ZoF9z → Vsvp4` (drDUC) user card (paper-2): avatar `Btegg` + name/phone/business `SuqNc` + stamp row `xU3yX` + stats grid `sxS4u` | NEW_ELEMENT_ON_EXISTING_SCREEN | No |
| `ZoF9z → Vsvp4 → xU3yX → H5poUJ` "VERIFIED" green stamp (rotation 1°) | ICON_OR_BADGE | No |
| `ZoF9z → Vsvp4 → sxS4u` 3-column stats grid (`ds1` ORDERS / `ds2` SPENT / `ds3` SAVED) | NEW_ELEMENT_ON_EXISTING_SCREEN | No |
| `ZoF9z → hWx2e → f8Z4Lu` "YOUR ACCOUNT" nav card (6 rows: Orders, Quick reorder, Saved addresses, Payment methods, Saved items, Settings) | NEW_ELEMENT_ON_EXISTING_SCREEN | No |
| `ZoF9z → hWx2e → f8Z4Lu → WkRhQ` "Orders" row + amber "3" pill badge `SVh4w` (in-transit count) | NAV_ENTRY_POINT + ICON_OR_BADGE | Targets `/profile/orders` |
| `ZoF9z → hWx2e → f8Z4Lu → Na3ld` "Quick reorder" row | NAV_ENTRY_POINT | NEW — no `/reorder` route exists today (Buyer · Reorder is itself a NEW screen per `02-design-inventory.md` §6) |
| `ZoF9z → hWx2e → f8Z4Lu → uVWmM` "Saved addresses" row | NAV_ENTRY_POINT | Targets `/profile/addresses` (existing) — though per `02-design-inventory.md` Q2 answer it will become `/profile/settings/addresses` |
| `ZoF9z → hWx2e → f8Z4Lu → GHeTx` "Payment methods" row, subtitle "Cash on delivery default" | NAV_ENTRY_POINT | NEW — no `/profile/payment-methods` page exists, no payment-methods schema exists |
| `ZoF9z → hWx2e → f8Z4Lu → f8Azk2` "Saved items" row, subtitle "12 products bookmarked" | NAV_ENTRY_POINT | NEW — no saved-items / wishlist surface or schema exists |
| `ZoF9z → hWx2e → f8Z4Lu → Q8fdEc` "Settings" row, subtitle "Profile · notifications · privacy" | NAV_ENTRY_POINT | Targets the NEW Buyer Settings screen (`R6YLrL`/`ZETLe`) |
| `ZoF9z → hWx2e → v2JzJ` "HELP & SUPPORT" nav card (3 rows: Track order, Help center, Terms & privacy) | NEW_ELEMENT_ON_EXISTING_SCREEN | No |
| `ZoF9z → hWx2e → v2JzJ → ai4eo` "Track order" row, subtitle "#SH-24735 · out for delivery" (amber) | NAV_ENTRY_POINT | Targets `/profile/orders/[id]` (per `02-design-inventory.md` Q1, the order-detail surface is the Reorder screen) |
| `ZoF9z → hWx2e → v2JzJ → dWHxE` "Help center" row | NAV_ENTRY_POINT | NEW — no help-center page exists |
| `ZoF9z → hWx2e → v2JzJ → PPzWT` "Terms & privacy" row | NAV_ENTRY_POINT | NEW — no terms/privacy page exists |
| `ZoF9z → W72oM → m7Klr` LANGUAGE row + segmented toggle `PimbZ` (EN selected / اردو) | MODIFIED_ELEMENT_ON_EXISTING_SCREEN | The `LanguageToggle` primitive is already implemented (`packages/ui/src/components/language-toggle.tsx`, see `04-design-system-implementation-log.md`) but is not yet placed anywhere |
| `ZoF9z → W72oM → GyUam` Log out button (red, outline card) | NAV_ENTRY_POINT | A `LogoutButton` component exists (`apps/web/src/modules/auth/components/logout-button`) but its current visual treatment hasn't been audited against the drawer spec |
| `ZoF9z → W72oM → FRygd` "Shalmi Mart · v1.0.0" version string | NEW_ELEMENT_ON_EXISTING_SCREEN | Static text |
| `q732Y` Buyer · Account sheet · Mobile (full-screen sheet) | NEW_ELEMENT_ON_EXISTING_SCREEN | No |
| `q732Y → WF5gr` Mobile app bar — "Account" title (sans 18/800) + close `x` icon button | NEW_ELEMENT_ON_EXISTING_SCREEN | No |
| `q732Y → VKF6c, z5ImS, m7ZU0K` user card / nav / foot (same content as desktop, restacked) | NEW_ELEMENT_ON_EXISTING_SCREEN | No |
| Account button — Buyer · Home · Desktop header (`bid1Y`) | NAV_ENTRY_POINT | `/` exists; current `StorefrontHeader` has a DropdownMenu (per `02-design-inventory.md` §5), the Pencil button is a stacked `user` icon + "Account" label, ink-filled when active |
| Account button — Buyer · Home · Mobile header (`X0SzkF`) | NAV_ENTRY_POINT | `/` exists |
| Account button — Buyer · Product · Desktop header (`MqzEv`) | NAV_ENTRY_POINT | `/products/[slug]` exists |
| Account button — Buyer · Product · Mobile header (`OVOxe`) | NAV_ENTRY_POINT | `/products/[slug]` exists |
| Account button — Buyer · Cart · Desktop header (`g3oOM7`) | NAV_ENTRY_POINT | `/cart` exists |
| Account button — Buyer · Cart · Mobile header (`lSn3n`) | NAV_ENTRY_POINT | `/cart` exists |
| Account button — Buyer · Checkout · Desktop header (`S72tsk`) | NAV_ENTRY_POINT | `/checkout` exists |
| Account button — Buyer · Checkout · Mobile header (`OqB5X`) | NAV_ENTRY_POINT | `/checkout` exists |
| Account button — Buyer · Orders · Desktop header (`g78Iwm`) | NAV_ENTRY_POINT | `/profile/orders` exists |
| Account button — Buyer · Orders · Mobile header (`ctdRJ`) | NAV_ENTRY_POINT | `/profile/orders` exists |
| Account button — Buyer · Reorder · Desktop header (`NNw2K`) | NAV_ENTRY_POINT | NEW screen (no route today) |
| Account button — Buyer · Reorder · Mobile header (`tbXvv`) | NAV_ENTRY_POINT | NEW screen |
| Account button — Buyer · Settings · Desktop header (`R6YLrL`) | NAV_ENTRY_POINT | NEW screen |
| Account button — Buyer · Settings · Mobile header (`ZETLe`) | NAV_ENTRY_POINT | NEW screen |
| Account button "active" visual — drawn in the dimmed underlying page on the desktop drawer frame (`iuC9I → ti9zW` ink fill + white user icon + "Account" label) | MODIFIED_ELEMENT_ON_EXISTING_SCREEN | Implies a pressed/selected state — per `04-design-system-implementation-log.md` §5.4 button states are re-derived from tokens; this specific "active when drawer open" state is not in any header component today |
| `05 Components → STAMPS` row (`xU3yX → H5poUJ` references the same VERIFIED green stamp pattern) | ICON_OR_BADGE | The `Stamp` primitive exists (`packages/ui/src/components/stamp.tsx`); the design uses the `success` intent variant with literal label "VERIFIED" |

---

## 3. Data model implications

References to schema files come from `01-codebase-map.md` §5
("Drizzle (PostgreSQL)").

### 3.1 Already-available data (existing schema can serve)

| Drawer surface | Source | Schema path |
|---|---|---|
| User name ("Tariq Ahmed") | `user.name` | `packages/database/src/schema/auth.ts` |
| Phone display ("+92 300 1234567") | `user.phoneNumber` | `packages/database/src/schema/auth.ts` |
| "Member since {Month YYYY}" | `user.createdAt` | `packages/database/src/schema/auth.ts` |
| Avatar — image fallback | `user.image` | `packages/database/src/schema/auth.ts` (avatar in design shows only initials "TA"; image-vs-initials precedence is **inferred**) |
| Saved-addresses count and default-address title | `addresses` (`isDefault`, `title`) | `packages/database/src/schema/addresses.ts` |
| Orders count ("24") | `orders` rows for `userId` | `packages/database/src/schema/orders.ts` |
| In-transit count ("3") for the amber pill on the Orders row | `sub_orders.status` (presumably non-`delivered`, non-`cancelled` rows for the user's orders) — **inferred** how the count is defined | `packages/database/src/schema/sub-orders.ts` |
| Spent total ("Rs. 18.4 L") | `SUM(orders.grandTotal)` for `userId` — **inferred** that the figure is gross (incl. shipping + GST) and not item-only | `packages/database/src/schema/orders.ts` |
| Latest active order (Track order subtitle "#SH-24735 · out for delivery") | `orders.displayId` joined to `sub_orders.status` of the latest active sub-order — **inferred** (no "latest active" query exists) | `orders.ts` + `sub-orders.ts` |
| Last cart for Quick reorder | most recent `orders` row for `userId` — **inferred**; "last cart" could equally mean the cart-store snapshot before checkout, which is not persisted server-side today | `orders.ts` (and `modules/cart/stores/cart-store.ts` for the Zustand-persisted client copy) |

### 3.2 Schema additions implied (not currently in the codebase)

None of these are drawn as a schema; all are inferred from the drawer's
labels.

| Drawer surface | Inferred new data |
|---|---|
| User card subtitle line 3 ("Tariq Kiryana Store") | A buyer-side **business/shop name** field on the user (or a separate `retailer_profile` table). The current `user` schema has no shop-name field for the `retailer` role; only the `vendors` table has `shopName`, and that is for the seller side. |
| User card stamp ("VERIFIED") | A semantic verification flag. Closest existing column is `user.phoneNumberVerified` — but the stamp wording is "VERIFIED" (not "PHONE VERIFIED"), so the intent is ambiguous. |
| User card third stat ("SAVED · Rs. 2.3 L", green-700) | A "savings" amount per buyer. There is **no list-price / msrp / undiscounted-price column** on `products` or `product_price_tiers` — saving against what baseline is undefined. |
| Nav row "Saved items" ("12 products bookmarked") | A wishlist / saved-items table (rows: `userId`, `productId`, `createdAt`). No such table exists today (`product_reviews`, `addresses`, `wallet` are the closest user-scoped tables). |
| Nav row "Payment methods" ("Cash on delivery default") | A payment-methods concept (table or constant set). Today the only payment path is COD and `/api/checkout` does not record a method. There is a `wallet` table with `balanceCents` but it is unused by checkout. |
| Foot — language preference persisted | `user.locale` or similar. Not in the schema; the existing `LanguageToggle` primitive ships as presentational. |

### 3.3 New API endpoints implied

Not drawn anywhere in Pencil; inferred from data needs above.

- `GET /api/user/me` (or similar) — composite payload for the drawer:
  display name, phone, image, business/shop name (NEW), verified stamp
  (NEW), member-since date, lifetime stats (orders count, spent, saved
  (NEW)), in-transit orders count, latest active order summary,
  addresses count + default address title, saved-items count (NEW),
  default payment method (NEW). **Inferred** — current API surface has
  no equivalent (`/api/user/addresses` returns addresses only).
- `GET /api/user/saved-items` (and `POST` / `DELETE`) — only if
  saved-items is in scope for this feature. Not drawn explicitly; the
  drawer only shows the count and a chevron, not the list view.
- `GET /api/user/payment-methods` — only if payment-methods is in scope.
  Same caveat.

### 3.4 Existing reusable primitives that already cover parts of this

From `04-design-system-implementation-log.md`:

- `Sheet` (`packages/ui/src/components/sheet.tsx`) — already retoken'd
  for the drawer-shadow / paper / hairline spec, including the
  `shadow-drawer` Pencil shadow on right-side sheets. **This is the
  natural surface primitive for the drawer.**
- `Stamp` — `success` variant covers "VERIFIED".
- `LanguageToggle` — covers the EN / اردو segmented control.
- `Button` — current variants cover the close-icon (icon size) and
  Log out (outline variant retoken'd).
- `Card` — the receipt-cream `paper-2` fill + `rule` border for the
  user card matches the receipt/summary card variant called out in
  `04-design-system-implementation-log.md` (deferred to feature
  components).
- A `LogoutButton` already exists in
  `apps/web/src/modules/auth/components/logout-button` — visual
  alignment to the drawer's red outline pattern is **inferred** (not
  audited here).

---

## 4. State & ownership

What the design implies, not what to build:

- The drawer is an **overlay** that mounts on every Buyer screen
  (Home, PDP, Cart, Checkout, Orders, Reorder, Settings). Its open/close
  state must therefore be reachable from any Buyer-screen header
  component.
- The codebase already has a Zustand-based modal store at
  `apps/web/src/modules/core/stores/modal-store.ts` (referenced in
  `01-codebase-map.md` §2 and rendered via `GlobalModals` in
  `modules/root-layout/`). This is the existing pattern for global
  overlay state. **Whether the drawer plugs into that store or uses a
  local `Sheet`-controlled state is inferred** — the design does not
  specify.
- The user-context provider exists (`packages/contexts/src/user-context`)
  alongside better-auth's `useSession`. The drawer's user data (name,
  phone, image) is reachable via `useSession`; the inferred new
  composite stats endpoint would be cached via React Query (server data
  fetching is React Query everywhere else per `01-codebase-map.md`
  §1).
- The "active" visual on the Account button (drawn pressed/inverted in
  `iuC9I → ti9zW`) implies the header component must read drawer-open
  state. Inferred.

---

## 5. Auth & permissions

- The drawer surfaces user-specific data (name, phone, business name,
  stats, addresses, orders). It is therefore implicitly **logged-in
  only**. The Pencil designs only show the logged-in state.
- The drawer's entry point (Account button) is drawn on **public**
  Buyer screens too (Home, PDP, Cart). Today these pages are public per
  `middleware.ts` (only `/admin/*`, `/vendor/*`, `/profile/*` are
  gated). What the Account button does for an unauthenticated visitor
  is **not drawn** — the entire logged-out state for the drawer is
  ambiguous.
- "VERIFIED" stamp on the user card implies a verification gate that is
  not specified. Closest existing flag is `user.phoneNumberVerified`,
  but mapping is inferred.
- Role differentiation: the drawer is the **buyer** drawer (per the
  frame names "Buyer · Account drawer/sheet"). Vendor and admin
  surfaces have their own dark top-bar chrome (`02-design-inventory.md`
  §3.7) with separate avatar/name affordances, and there are no
  vendor- or admin-side account-drawer frames in Pencil. The drawer's
  visibility for users with `role === 'vendor'` or `role === 'admin'`
  who happen to land on a Buyer screen is **not drawn**.

---

## 6. Build order recommendation

Proposed order (justifications brief; nothing here is to be
implemented before §7 questions are resolved):

1. **Resolve §7 open questions first.** Several of them block schema
   work (saved-items table, savings semantics, business name field,
   payment methods).
2. **Schema additions** for the data the existing tables can't serve
   (per §3.2). This unblocks API work and keeps the drawer from
   shipping with placeholder strings.
3. **Composite drawer-data endpoint** (`GET /api/user/me` or similar)
   so the drawer has one cacheable React Query source rather than 5–6
   parallel queries.
4. **Drawer component itself** — built on top of existing `Sheet`,
   `Stamp`, `LanguageToggle`, `Card`, `Button` primitives. Pure
   presentation; consumes the composite endpoint plus `useSession`.
5. **Account-button entry point** — a small header sub-component used
   by every Buyer screen header, with the active/pressed treatment per
   §2. This is one component, drawn the same in all 8 desktop +
   8 mobile Buyer headers.
6. **Wire the entry point + drawer into each existing Buyer screen
   header.** The current `StorefrontHeader` (`apps/web/src/modules/
   storefront/components/header/`) is the touch-point on most
   surfaces; whether Cart / Checkout / Orders use the same header or
   custom ones is to be confirmed during implementation (per
   `01-codebase-map.md`, the storefront layout's header is shared, but
   per-screen confirmation is needed).
7. **Routes that the drawer points to** — Quick reorder, Saved items,
   Payment methods, Help center, Terms & privacy, Settings — are NEW
   surfaces called out in §2. Stub routes (or defer) per the open
   questions in §7.

---

## 7. Open questions for me

Numbered for easy reference. All inferences in §1–§6 trace back here.

### Scope ambiguities

1. **Business / shop name on the user card** — "Tariq Kiryana Store"
   is drawn as the third line of the user info block (after name and
   phone). Is this:
   (a) a new field on `user` (e.g. `shopName`/`businessName`) that
   retailers fill at signup,
   (b) sourced from a new `retailer_profile` table mirroring `vendors`,
   or
   (c) static / templated copy that should not exist as data?
   The current schema has nothing for it.

   answer: a

2. **"VERIFIED" stamp meaning** — what verification does it represent?
   Phone (existing `user.phoneNumberVerified`)? Email
   (`user.emailVerified`)? KYC of the retailer business? An admin
   approval flag? Pencil draws a single stamp only; no "unverified"
   counter-state is drawn.

   answer: just phoneNumber verified

3. **"SAVED · Rs. 2.3 L" stat** — savings against what baseline? There
   is no MSRP/list-price column on `products` and the
   `product_price_tiers` table only stores per-tier prices, not a
   "regular price". Options:
   (a) Add a "regular price" / "MSRP" column to products (or to tiers)
   and compute saved as `Σ(regular − paid)`,
   (b) Add a per-line-item `savedCents` snapshot at order time,
   (c) Drop the SAVED stat,
   (d) Something else.

   answer: (a)

4. **"Spent" stat composition** — is "Rs. 18.4 L" gross
   (`SUM(orders.grandTotal)` — items + shipping + GST) or net (items
   only)? Pencil shows only the figure.

   answer: (a)

5. **"3 in transit" amber pill on the Orders row** — which sub-order
   statuses count as "in transit"? `pending`? `packed`?
   `handed_to_courier`? The combination is unstated. Per
   `02-design-inventory.md` Q9 the answer was "display-only labels
   mapped from existing statuses" — same question reframed for a
   *count*: which underlying enum values feed it?

   answer: handed_to_courier

6. **"Saved items" / wishlist scope** — the drawer surfaces "12
   products bookmarked" with a chevron, but the only Pencil node here
   is the row itself. Is the saved-items list view in scope for this
   feature, or is the drawer just the entry point and the list page
   ships in a later wave? If in scope, is wishlist per-user (requires
   login) or per-session (anonymous, persisted client-side)? Persisted
   across devices?

   answer: out of scope

7. **"Payment methods" scope** — drawer subtitle is "Cash on delivery
   default", which today is the only payment path (`/api/checkout`).
   Is this a placeholder pending real card/bank-transfer support, or
   is the payment-methods page in scope and we need a schema +
   endpoints for it?

   answer: cash on delivery is the only payment method for now. 

8. **"Track order" row data semantics** — subtitle is "#SH-24735 · out
   for delivery". This shows the **most recent active order** (single).
   Open sub-questions:
   (a) What if the user has zero active orders — does the row hide,
   show a placeholder, or stay with neutral copy?
   (b) What if the user has multiple active orders — pick the most
   recent? The most behind in delivery?
   (c) "out for delivery" status — per `02-design-inventory.md` Q9
   answer, statuses are display labels mapped from existing enums.
   Which existing `sub_orders.status` enum value(s) map to "out for
   delivery"? Likely `handed_to_courier`, but this is not stated.

   answer: (a) hide, (b) most recent, (c) handed_to_courier

9. **"Quick reorder" target** — does this link to a NEW screen
   (`02-design-inventory.md` §6 #1, which is itself tied to a specific
   past order id via the breadcrumb), or does it open a generic
   "reorder my last cart" flow that re-hydrates the cart store from
   the last order? The drawer's subtitle "Replenish your last cart"
   suggests the latter; the standalone Reorder screen suggests the
   former.

   answer: yes, open reorder screen

10. **"Settings" subtitle** — copy is "Profile · notifications ·
    privacy", but per `02-design-inventory.md` Q2 answer the Settings
    screen ignores Profile / notifications / payment for now. Should
    the drawer subtitle be revised to match the actual Settings scope
    (addresses-only?) or kept as drawn?

    answer: kept as drawn

11. **"Help center" / "Terms & privacy" rows** — are these in scope
    for this feature (i.e. ship NEW pages for them) or stub routes /
    external links? The current codebase has neither.

    answer: out of scope

### Data / schema decisions

12. **Caching of the drawer composite payload** — should the drawer
    refresh stats on every open, or cache via React Query with a
    standard staleTime? Pencil can't answer this.

    answer: caching for 5 minutes

13. **Avatar precedence** — the drawer always draws initials (white
    "TA" on `ink`-fill 56px circle). The `user.image` column exists.
    When `user.image` is set, does the drawer show the image, or
    always initials (per the design system's avatar treatment shown
    only-as-initials)?

    answer: always initials

14. **Language toggle persistence** — the toggle is presentational
    today (per `04-design-system-implementation-log.md` Q-LANG-1).
    Is wiring it to a stored `user.locale` preference in scope for
    this feature, or still deferred until i18n proper?

    answer: out of scope

### Touchpoint ambiguity

15. **Account-button "active" state** — the drawer's underlying dimmed
    page draws the account button in pressed/inverted style
    (`iuC9I → ti9zW` ink fill + white). Confirm this is an
    "active-when-drawer-open" state rather than a "currently on the
    account page" state (the latter doesn't apply because the drawer
    is overlay-only, but worth confirming).

    answer: active when drawer open

16. **Logged-out state of the entry point** — on public Buyer pages
    (Home, PDP, Cart) a guest can see the Account button. What does
    tapping it do?
    (a) Open the drawer in an empty/teaser state,
    (b) Redirect to `/auth?redirect=<from>`,
    (c) Open the existing auth modal (`apps/web/src/modules/auth/components/auth-modal`)?
    Pencil only draws the logged-in state.

    answer: (a) open the drawer in an empty/teaser state with login button

17. **Other roles on Buyer screens** — if a `vendor` or `admin` user
    lands on a Buyer screen, does the same drawer surface for them?
    Pencil shows separate vendor/admin chrome elsewhere but does not
    address this overlap.

    answer: yes

18. **Mobile sheet — is it overlay or its own route?** — answered
    historically in `02-design-inventory.md` Q3 ("on mobile, the sheet
    is an overlay over the current page"), so this is resolved.
    Re-confirming here only because the mobile frame `q732Y` is
    drawn as a full-screen artwork and could be misread as a route.

    answer: its own route.

19. **Drawer body scroll vs body lock** — the desktop drawer
    `clip: true` + height 1200 vs the mobile sheet's full-height
    layout — neither indicates whether the underlying page should be
    scroll-locked while the drawer is open. Inferred behavior; please
    confirm.

    answer: scroll locked

20. **"Shalmi Mart · v1.0.0" version string** — should this come from
    `package.json` (build-time injected) or be a static literal? Not
    drawn how.

    answer: static literal
