# Buyer · Settings — Gap Analysis

> **Phase:** Per-screen gap analysis (read-only; no code yet).
> **Date produced:** 2026-05-02
> **Pencil source:** `Pencil-Design\Shalmi` — Buyer · Settings · Desktop `R6YLrL`, Buyer · Settings · Mobile `ZETLe`.
> **Existing code surface:** `apps/web/src/app/(storefront)/profile/addresses/page.tsx` + `apps/web/src/modules/user-addresses/**`.
> **Scope (per 02-design-inventory Q2):** Only the **Saved Addresses** sub-page is in scope. Profile / Payment methods / Notifications / Preferences are drawn in Pencil but explicitly out of scope. The Settings *shell* (left nav + breadcrumb + page title) IS in scope because the addresses sub-page renders inside it.

---

## 0. Pre-flight: Pencil patterns not yet covered in 02-design-inventory or 04-implementation-log

Per the workflow rule, flagged before writing the diff.

- **Breadcrumb component.** The Settings desktop frame opens with `pdIJF "Home > Account > Settings"` — a horizontal row of `font-sans 13` text + `lucide chevron-right 14` separators (`ink-3` for inactive segments, `ink` 13/600 for the current segment). 02-design-inventory §3 catalogs other organisms but does not list a Breadcrumb primitive. 04 implementation log did not add one. The Cart-Reorder, Orders, and Reorder frames also use breadcrumbs, so it is a recurring pattern.
- **Buyer Settings sub-shell sidebar.** Pencil's `sSide` (`X9VFUu`) is a 280w **white surface card** (radius 8, 1px rule stroke, padding 8, gap 2) containing 7 nav rows + 1 hairline divider. This is **structurally different** from 02 §3.7's "Admin / Vendor sidebar" pattern (which is a 240w full-height white panel with right hairline rule, NOT a card). The codebase's `@repo/ui/sidebar` primitive (shadcn SidebarProvider/Sidebar/SidebarInset) is also a full-height layout shell, not an in-content nav card. So this is a **new pattern**: a "settings nav card" that lives inside a content area.
- **Address card (compound, with default-vs-non-default visual variants).** Pencil's `sA1/sA2/sA3` are not the same as the generic "Surface card" or "Receipt card" in 02 §3.8. The default-card uses `paper-2` fill + `ink` 1.5px stroke (eye-catching); non-default use `white` fill + `rule` 1px stroke. 04 didn't add an AddressCard primitive (it's app-feature, but its visual variant rules are screen-specific and unstated until now).
- **"DEFAULT" inline pill.** White-on-`ink` mono-uppercase 9/700 pill (radius 3, padding `[2,6]`). It is **not** a `Stamp` (Stamps are rotated -1°, mono 11/700, padding `[3,8]`, with bg/fg/stroke triplets per intent). 04's `Stamp` primitive does not have an "inverse / dark / neutral-filled" variant. Either:
  - This is a new pill primitive (a "pill badge"), distinct from Stamp, **OR**
  - It is an additional Stamp variant with no rotation and inverse coloring.
  Question raised in §5 below.
- **Mobile addresses sub-page is NOT drawn.** The Pencil mobile frame `ZETLe` is the **Settings parent index** (mUserCard + mStats + 5-row mNavCard + mLogout + version). There is no per-sub-page mobile frame for Saved Addresses, Orders, Payment methods, etc. So mobile presentation of `/profile/settings/addresses` has to be inferred. Question raised in §5.
- **EN / اردو language toggle in mobile App bar** appears in `Bvqxi → BXXir`. The `LanguageToggle` primitive was added in 04 (presentational stub), but the chrome integration (where it sits, when it shows) is not yet specified.

---

## 1. Layout & structure

### Pencil — Desktop (`R6YLrL`)

```
ISL1j  util strip (storefront chrome — out of scope for THIS task)
h6PpK  header (storefront chrome — out of scope)
ciNpb  page body (paper bg, max content width 1360, padding 40)
  pdIJF  breadcrumb        Home › Account › Settings
  c9dR8m page title         "Account & settings"  (sans 36 / 800 / -0.02 ls)
  ijhxz  sLayout (horizontal, gap 32)
    X9VFUu  sSide (280w fixed)        white card · radius 8 · 1px rule · padding 8 · gap 2
      sn1 Profile (active — paper-2 fill, ink/ink, sans 14/700)
      sn2 Orders                       (ink-2/ink-2, 14/500)
      sn3 Saved addresses              (ink-2/ink-2, 14/500)
      sn4 Payment methods              (ink-2/ink-2, 14/500)
      sn5 Notifications                (ink-2/ink-2, 14/500)
      sn6 Preferences                  (ink-2/ink-2, 14/500)
      sDiv  rule hairline
      sn7 Log out                      (red icon, red text, 14/600)
    jIMHS  sContent (vertical, gap 24, fill_container)
      lp8jd  User info card           [OUT OF SCOPE — Profile content]
      neBfP  Stats row (4 cards)      [OUT OF SCOPE — Profile content]
      ejk2V  Recent orders card       [OUT OF SCOPE — Profile content]
      d4ciA  Saved addresses card     [IN SCOPE]
        MBsPJ  header  ("Saved addresses" 22/700 + "Add address" outline button)
        klP6v  sAGrid (horizontal, gap 16, 3 cards fill_container)
          sA1 default   paper-2 / ink 1.5  · "Shop"      + DEFAULT pill + ✏️ · address · phone
          sA2           white   / rule 1   · "Home"                       + ✏️ · address · phone
          sA3           white   / rule 1   · "Warehouse"                  + ✏️ · address · phone
```

> **Note on the Pencil frame's "active" sidebar item.** The drawn frame has `Profile` (sn1) as active and shows User info / Stats / Recent orders / Saved addresses *all stacked* in `sContent`. Per Q2 of 02-design-inventory ("ignore profile/payment/notifications sub-pages even for now") **only the `Saved addresses` card is in scope**. The intended behavior of the addresses route (`sn3` active) is interpolated: the right panel shows just the `Saved addresses` card. This is an open question — see §5 Q3.

### Pencil — Mobile (`ZETLe`)

```
F5tgKi  App bar (paper, padding [14,16], 1px rule bottom)
  chevron-left · "Account" 18/700        |  EN/اردو toggle  ·  user avatar (40 circle)
dxRpm  scroll body (vertical)
  zgNgJ   mUserCard         [OUT OF SCOPE — Profile content]
  XOIfK   mStats (3 cards)  [OUT OF SCOPE — Profile content]
  Ki6pz   mNavCard (white card, radius 8, 1px rule, padding 6)  [IN SCOPE — shell nav]
    Orders          24 orders · 3 in transit
    Saved addresses 3 addresses saved
    Payment methods Cash on delivery default
    Notifications   Order updates · price drops
    Preferences     Language · region · privacy
  s7ieoU  mLogout (white card, red icon + "Log out")
  GR6JV   "Shalmi Mart · v1.0.0" (mono 11, ink-4)
```

> Mobile shows a Settings *index* (one-screen list of nav rows). The actual mobile rendering of `/profile/settings/addresses` (i.e. **the addresses sub-page itself on mobile**) is **not drawn** in the file.

### Existing code (`/profile/addresses`)

```
RootLayout  (storefront layout — Header + Footer)
ProfileAddressesPage  (CC, middleware-gated /profile/*)
  UserAddresses         div · max-w-3xl · mx-auto · px-4 py-8
    AddressesPageHeader   MapPin icon + "Saved Addresses" h1 + primary "Add address" button
    AddressesList         space-y-4 vertical stack of AddressCard, OR empty Card
      AddressCard         white Card (CardContent p-4)
        title (font-semibold) + "Default" rounded badge (bg-primary/10)
        recipientName · recipientPhone (text-muted-foreground text-sm)
        address, city
    AddressDialog         Dialog with form (title, recipientName, recipientPhone, address, city, isDefault) — POST only
```

### Sub-shell pattern — fit between Pencil and code

Today: `/profile/addresses` is a **standalone page** — it has no parent shell, no sidebar nav, no breadcrumb. The page renders directly inside `(storefront)/layout.tsx`'s Header+Footer wrapper.

Pencil: `/profile/settings/addresses` lives inside a Settings sub-shell:
- on **desktop** the shell is a side-by-side card pair (left 280w nav card, right `fill_container` content card),
- on **mobile** the shell is a stacked list (one full-screen index → tap → next sub-page).

Implications:
- The desktop shell is a **layout file** (`app/(storefront)/profile/settings/layout.tsx`?) wrapping all settings sub-pages, OR it's a feature component composed inline in each sub-page — per CLAUDE.md hard rule 1, this is a non-obvious decision that should be asked.
- The existing `(storefront)` layout still wraps everything (Header+Footer remain). The Settings shell is **inside** the storefront chrome, not a replacement.
- On mobile, since the addresses sub-page itself isn't drawn, we don't know whether the desktop "white card + 3-up grid" collapses to: (a) a full-width single-column list with the same paper-2/white card variants, (b) a different card style, or (c) something else.

---

## 2. Element-by-element diff

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| **Settings shell (parent layout)** — `ijhxz` (sSide + sContent) wrapping `/profile/settings/*` sub-pages | None — `/profile/addresses` is standalone | Whole sub-shell is new; route restructure required (`/profile/addresses` → `/profile/settings/addresses` per Q2 answer) | NEW_INTERACTION |
| **Breadcrumb** `pdIJF` "Home › Account › Settings" (sans 13, ink-3 → ink/600 active, 14px chevron-right separators, gap 8) | None | New element; no breadcrumb component exists in `@repo/ui` | NEW_INTERACTION |
| **Page title** `c9dR8m` "Account & settings" (sans 36 / 800 / -0.02 ls) | `AddressesPageHeader` h1 "Saved Addresses" (text-2xl font-bold, MapPin icon prefix) | Title changes from page-specific ("Saved Addresses") to shell-level ("Account & settings"); MapPin icon removed; size grows 24→36; weight 700→800 | COPY_CHANGE |
| **Sidebar nav row sn1 Profile** (active state shown — paper-2 fill, ink/700) — points to a sub-page that does not exist | None | Out-of-scope per Q2, but the nav row IS drawn in the sidebar; its presence/disabled-state must be decided | AMBIGUOUS |
| **Sidebar nav row sn2 Orders** (lucide `package`) | Existing `/profile/orders` route (RetailerOrders) | Nav row links to existing orders surface — but does it move under `/profile/settings/orders`, or stay at `/profile/orders` and be linked from this settings nav? | AMBIGUOUS |
| **Sidebar nav row sn3 Saved addresses** (lucide `map-pin`) | Existing `/profile/addresses` route | Per Q2 answer this is the in-scope sub-page; route moves to `/profile/settings/addresses` with redirect from old path | CHANGED_INTERACTION |
| **Sidebar nav row sn4 Payment methods** (lucide `credit-card`) | None — no payment-methods route or schema | Out of scope per Q2; nav row is drawn — render disabled, hide, or link to "coming soon"? | AMBIGUOUS |
| **Sidebar nav row sn5 Notifications** (lucide `bell`) | None | Out of scope per Q2 but drawn | AMBIGUOUS |
| **Sidebar nav row sn6 Preferences** (lucide `settings`) | None | Out of scope per Q2 but drawn | AMBIGUOUS |
| **Sidebar divider sDiv** (1px rule) above Log out | n/a | Visual structural element only | VISUAL_ONLY |
| **Sidebar nav row sn7 Log out** (red `log-out` icon, red sans 14/600) | Existing `LogoutButton` (lives in storefront header dropdown / admin sidebar) | New surface for logout — does it duplicate the header dropdown action, or replace it on settings pages? | NEW_INTERACTION |
| **Saved addresses card header** — "Saved addresses" h2 (sans 22/700, -0.01 ls) | `AddressesPageHeader` h1 "Saved Addresses" (text-2xl font-bold) + MapPin icon prefix | Title becomes a section heading inside the right panel (not a page header); MapPin removed; capitalization changes "Saved Addresses" → "Saved addresses"; weight 700→700 (same), size shrinks 24→22 | COPY_CHANGE |
| **"Add address" button** — outline ink (white fill, `rule-2` 1.5px stroke, ink text, sans 13/600, lucide `plus` 14px, padding [8,14], radius 6) | Primary green Button with `Plus` 16 icon, sans 14/600, "Add address" copy | Variant changes primary → outline; size 14→13; icon 16→14 | VISUAL_ONLY |
| **Address grid layout** — `klP6v` horizontal `fill_container` 3 cards, gap 16 | `AddressesList` vertical `space-y-4` stack inside `max-w-3xl mx-auto` | List → grid; vertical → horizontal 3-col; container narrowed (max-w-3xl) → fills sContent width | VISUAL_ONLY |
| **Address card — default visual** (paper-2 fill, 1.5px ink stroke, radius 8, padding 18, gap 8) | `AddressCard` Card (white shell, default rule border, no special visual treatment for `isDefault`) | Default card now visually emphasized via paper-2 + ink stroke (not just badge) | VISUAL_ONLY |
| **Address card — non-default visual** (white fill, 1px rule stroke, radius 8, padding 18) | Same Card primitive | Mostly aligned (Card primitive after Phase 3 retoken = white + rule); padding 16→18 | VISUAL_ONLY |
| **Address card title** — sans 15/700 ink (e.g. "Shop" / "Home" / "Warehouse") | `address.title` rendered in `font-semibold` (text-base, 14/600 default Tailwind) | Size 14→15, weight 600→700 | VISUAL_ONLY |
| **DEFAULT pill** — mono 9/700 uppercase white-on-ink, radius 3, padding [2,6], no rotation | "Default" inline span — rounded bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 | Coloring inverts (tinted-on-light → white-on-dark); typography flips sans→mono uppercase 12→9; copy capitalization "Default" → "DEFAULT" | COPY_CHANGE |
| **Edit pencil icon** (lucide `pencil` 14px, ink-3, top-right of card header) | None — no edit affordance in current AddressCard | New per-card edit interaction | NEW_INTERACTION |
| **Address text composition** — single sans 13 ink-2 line-height 1.5 wrapped string, e.g. *"Tariq Kiryana Store, Block 4, Satellite Town, Gujranwala 52250, Punjab"* | Two lines: `{recipientName} · {recipientPhone}` (sans 14 muted) then `{address}, {city}` (sans 14) | Composition flattens into one wrapped line; recipient name/phone removed from this line; address text now appears to include shop name + area + city + postal + province | COPY_CHANGE |
| **Postal code in address line** ("52250") | Schema has no `postalCode` field on `addresses` | New field implied by the address composition | NEW_FIELD |
| **Province in address line** ("Punjab") | Schema has no `province` / `region` field on `addresses` | New field implied by the address composition | NEW_FIELD |
| **Phone display under address text** — mono 12, ink-3, e.g. "+92 300 1234567" | Combined with recipient name in the same line (sans 14 muted) | Phone separated to its own row, font shifts sans→mono, size 14→12, color muted→ink-3 | VISUAL_ONLY |
| **Recipient name display** — NOT shown in Pencil card | Shown in existing AddressCard alongside phone | Recipient name disappears from card display | REMOVED_FIELD |
| **Recipient name field in form/schema** — Pencil doesn't draw an add/edit form, so unknown | `createAddressSchema` requires `recipientName` (z.min(1)); shown in AddressDialog | Is recipient name still captured in the form (just not displayed on the card), or removed from the data model entirely? | AMBIGUOUS |
| **Address composition source** — appears to include `recipientName`-equivalent ("Tariq Kiryana Store" matches the Profile shop name) plus a long address string | Existing `address` field is plain `text` "Full address", `city` is separate | Is the displayed string derived from concatenating multiple new fields (shop name, area, city, postal, province) or a single richer `address` text field? | AMBIGUOUS |
| **Set-as-default interaction** — only `DEFAULT` pill is drawn on one card; no toggle / star / "Make default" affordance visible | `AddressDialog` `isDefault` checkbox in the **create** form only; no UI to change which existing address is default | How does the user change the default after the address has been created — via the edit pencil (implied), via a separate action, or not at all? | AMBIGUOUS |
| **Delete affordance** — no trash / "Delete address" drawn anywhere | None today | Neither side has it; do we add delete (commonly expected), or is the omission intentional? | AMBIGUOUS |
| **Empty state (no addresses)** — not drawn in Pencil (3 cards always visible) | Empty Card "You don't have any saved addresses yet." + "Add your first address" outline Button | New empty state copy/visual unspecified | NEW_STATE |
| **Loading state** — not drawn in Pencil | Centered Spinner (`min-h-[40vh]`) | New loading state unspecified | NEW_STATE |
| **Error state** (e.g. fetch failure) — not drawn in Pencil | None today | Per 02-design-inventory Q14, states are per-screen; this one is unspecified | NEW_STATE |
| **Add/Edit address dialog** — not drawn in Pencil | `AddressDialog` (Add only) | Pencil draws no add/edit form. Does the new design use an inline dialog (existing pattern) or a side-panel sheet, full-page form, or expanded card? | AMBIGUOUS |
| **Mobile App bar** (chevron-left + "Account" + EN/اردو + avatar circle) | Existing mobile storefront header (logo + cart + account icon) | Settings on mobile gets a different chrome from the rest of the storefront | CHANGED_INTERACTION |
| **EN / اردو language toggle in app bar** | None in any current chrome | Per Q16 in 02-design-inventory, EN-only ships; toggle exists as primitive but placement/visibility on Settings chrome is new | NEW_INTERACTION |
| **Mobile Settings parent index** (`Ki6pz` 5-row nav card with title + subtitle + chevron-right) | None — `/profile` has no page today | New screen at `/profile/settings` (mobile index); also impacts desktop where the same nav exists in the side card | NEW_INTERACTION |
| **Mobile Saved addresses sub-page** | Existing `/profile/addresses` page (renders `UserAddresses` responsively) | Pencil does not draw the mobile sub-page — design omitted? Or implied by the desktop card translated to mobile? | AMBIGUOUS |
| **Version footer "Shalmi Mart · v1.0.0"** (mono 11, ink-4, centered) — mobile only | None | New element on mobile settings index (out-of-scope-adjacent — index is parent of addresses) | AMBIGUOUS |

---

## 3. Schema / type implications

For every NEW_FIELD / REMOVED_FIELD row in §2, what would change in code? **Reference only** — no edits in this phase.

### NEW_FIELD: postal code

- **DB:** `packages/database/src/schema/addresses.ts` — add `postalCode: text('postal_code')` (or `varchar`/`integer` — TBD by the user). Because postal codes in PK are 5 digits but other markets vary, `text` is safer. Likely `notNull` with a default? See §5 question.
- **Migration:** new file in `packages/database/migrations/` adding the column.
- **Zod (`apps/web/src/modules/user-addresses/schemas/index.ts`):** add `postalCode: z.string().min(?)` to `createAddressSchema`.
- **Server route (`apps/web/src/app/api/user/addresses/route.ts`):** the inline `createAddressSchema` (lines 10–17) duplicates the client-side schema and needs the same field added. The `db.insert` `.values({...})` block needs to pass `postalCode`.
- **TS (`apps/web/src/modules/user-addresses/types.ts`):** add `postalCode: string` to the `Address` type.
- **Cross-app schema:** `packages/schemas/src/orders/checkout.ts → shippingAddressSchema` and `apps/web/src/modules/checkout/schemas → checkoutShippingFormSchema` may also need to mirror this if checkout addresses are persisted to the same shape (currently `checkoutShippingFormSchema` has `name, phone, address, city`).

### NEW_FIELD: province / region

- Same surface set as postal code (DB column, migration, both Zod schemas, type, optional checkout mirror).
- DB column likely `province: text('province').notNull()`. Open whether to constrain to an enum (limited Pakistani provinces) or free-text — see §5.

### REMOVED_FIELD: recipient name (display only — and possibly model)

- If recipient name is removed only from card display (as drawn in Pencil) but the field stays in the form & DB: **no schema change**, only the AddressCard component changes (don't render `address.recipientName`).
- If recipient name is removed from the data model entirely:
  - DB: drop column `recipient_name` (destructive — needs migration plan and grep across `apps/web/src/modules/checkout/components/delivery-address-section/index.tsx` and any code reading `address.recipientName`).
  - Zod: drop `recipientName` from `createAddressSchema` in both `modules/user-addresses/schemas/index.ts` AND `app/api/user/addresses/route.ts`.
  - TS: drop from `Address` type.
  - Form: drop the field from `AddressDialog`.
  - **Checkout impact:** `orders` table has `shippingName` snapshot (per `packages/database/src/schema/orders.ts`). If the addresses table loses `recipientName`, the checkout flow needs an alternate source for the recipient when copying an address into an order — investigate before doing this.
- This whole branch is gated on §5 Q9 — neither outcome is assumed.

---

## 4. Behavior implications

For every NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE row in §2, what code paths change? **Reference only**.

### Route move `/profile/addresses` → `/profile/settings/addresses`

- **New route file:** `apps/web/src/app/(storefront)/profile/settings/addresses/page.tsx` rendering `UserAddresses` (or its retoken equivalent).
- **Old route:** `apps/web/src/app/(storefront)/profile/addresses/page.tsx` — keep as a permanent redirect (`redirect('/profile/settings/addresses')`) so existing bookmarks/links don't 404. Two callers reference `ABSOLUTE_ROUTES.PROFILE_ADDRESSES` directly:
  - `apps/web/src/modules/checkout/components/delivery-address-section/index.tsx:46,180`
  - `apps/web/src/modules/storefront/components/header/index.tsx:84`
- **Constants:** `apps/web/src/modules/core/constants/absolute-routes/index.ts` — `PROFILE_ADDRESSES` const must be updated to `'/profile/settings/addresses'`. Add `PROFILE_SETTINGS: '/profile/settings'` and likely `PROFILE_SETTINGS_ORDERS`, `PROFILE_SETTINGS_PAYMENTS` etc. depending on §5 answers.
- **Middleware:** `apps/web/src/middleware.ts` matcher `/profile/:path*` already covers `/profile/settings/*`. No matcher change needed.
- **API:** `/api/user/addresses` GET/POST stay where they are (decoupled from page route).

### Settings shell (parent layout)

- **New layout file:** `apps/web/src/app/(storefront)/profile/settings/layout.tsx` — Server Component or Client (depends on whether the active-state needs `usePathname`). Renders breadcrumb + page title + sLayout (sSide + sContent slot).
- **New feature module:** `apps/web/src/modules/buyer-settings/` — `components/settings-shell/`, `components/settings-sidebar-nav/`, `components/settings-breadcrumb/`. The desktop sidebar likely consumes either the shadcn `Sidebar` primitive (if applicable) or — more likely — a hand-rolled card-style nav since the shape differs (see §0).
- **Mobile rendering:** the layout has to switch between desktop side-card-pair and mobile stacked list. Either the layout itself is responsive, or each sub-page renders the mobile chrome (App bar with chevron-back) and the layout only applies above some breakpoint. Open question (§5).
- **Index route `/profile/settings`:** new page (the mobile index) that on mobile lists the 5 nav rows; on desktop, redirects (or shows a "select a setting" empty placeholder). Open per §5.

### Per-card edit interaction (NEW_INTERACTION pencil icon)

- **API:** `PATCH /api/user/addresses/[id]` does not exist — needs creating. Auth gating identical to the existing POST route (session via `getSessionFromRequest` + `requireSession` + ownership check on `addresses.userId`). Validation: a `updateAddressSchema` (likely `createAddressSchema.partial()` with explicit `id`).
- **Hook:** `apps/web/src/modules/user-addresses/hooks/use-update-address-mutation/index.ts` — invalidate `AddressQueryKeys.all` on success, mirrored toast + error handling.
- **AddressDialog:** must accept an `address?: Address` prop and switch between create-mode (POST) and edit-mode (PATCH). Form `defaultValues` either reset to `defaultValues` (create) or seed from the supplied address (edit). Title copy "Add address" vs "Edit address".
- **AddressCard:** must accept an `onEdit` callback (or trigger a context store) so clicking the pencil opens the dialog with the right address.

### Set-as-default interaction (AMBIGUOUS — only DEFAULT pill drawn)

- Existing `POST /api/user/addresses` already handles `isDefault: true` by un-defaulting all the user's other addresses (see route.ts:68–73).
- But there is currently **no UI affordance** to change which existing address is default. Two paths:
  - The edit dialog includes the `isDefault` checkbox (existing form already has it for create; mirror in edit) — simplest option.
  - A dedicated "Make default" mutation `PATCH /api/user/addresses/[id]` with body `{ isDefault: true }` (same endpoint as edit, but the dedicated card affordance shows a "Set default" button on non-default cards).
- Pencil draws neither — open question (§5).

### Delete address (AMBIGUOUS)

- No `DELETE /api/user/addresses/[id]` exists; no UI in either side. Common-sense expectation is that users can delete an address but neither code nor design has it. Question raised below.

### Logout in settings sidebar (NEW_INTERACTION)

- Existing `LogoutButton` lives at `apps/web/src/modules/auth/components/logout-button/index.tsx` — used in admin sidebar and the storefront header dropdown (via `apps/web/src/modules/storefront/components/header/index.tsx`).
- Pencil's `sn7` is a sidebar row, not the same shape as the existing `LogoutButton`. Question: reuse existing component (with retoken) or a sidebar-row-shaped variant?

### EN / اردو toggle in mobile app bar (NEW_INTERACTION)

- `LanguageToggle` primitive exists (per 04 §`language-toggle.tsx`) as a presentational `value/onValueChange` component with Q-LANG-1 still open.
- Per Q16 of 02-design-inventory: ship as visible-but-inert (or visible-and-functional toggle that simply persists to localStorage but doesn't actually translate anything yet).

### NEW_STATE: empty / loading / error for the addresses card

- Existing empty-state, loading Spinner, and error toast logic in `UserAddresses` and `AddressesList` cover the behavior. Visual treatment under the new design (paper card + 3-up grid) is unspecified. The Pencil-stated rule (per 02-design-inventory Q7 answer) is "re-derive states from design system tokens" — but the empty-state surface itself isn't drawn for this card.

---

## 5. Open questions for me

Every COPY_CHANGE / NEW_FIELD / REMOVED_FIELD / NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE / AMBIGUOUS row in §2 maps to a numbered question below.

### 1. Sub-shell route structure & layout file

**Observed.** Pencil shows a parent settings shell (left-nav card + right content card on desktop; stacked index → sub-page on mobile). Existing `/profile/addresses` is standalone with no parent shell.

**Question.** Should the shell live as a Next.js layout file (`app/(storefront)/profile/settings/layout.tsx`) wrapping every settings sub-page, or as a feature-component composed inline by each page? And on mobile, does the layout itself collapse to "show the index OR the sub-page" routing, or does each sub-page render its own mobile-app-bar chrome and skip the index?

**Hypotheses.**
- (a) Next.js layout file; mobile = same layout that conditionally renders the index at `/profile/settings` and just a back-bar at `/profile/settings/[sub]`.
- (b) Feature wrapper in each sub-page (no layout file); mobile sub-pages each own their app bar.
- (c) Layout file desktop-only (renders pass-through on mobile); each sub-page owns its mobile chrome.

### 2. Breadcrumb component

**Observed.** Pencil draws a 3-segment breadcrumb (`Home › Account › Settings`) with chevron-right separators. No breadcrumb primitive exists in `@repo/ui` and 04 didn't add one. Multiple other Pencil screens (Reorder, Orders) also use breadcrumbs.

**Question.** Should I treat Breadcrumb as a primitive to add to `@repo/ui` (analogous to how 04 paused for Tabs and asked for shadcn install), or build it inline as a feature component in `modules/buyer-settings/`?

**Hypotheses.**
- (a) Install shadcn `breadcrumb` (it exists) and retoken in the next phase.
- (b) Build a small ad-hoc Breadcrumb in `@repo/ui` from primitives.
- (c) Inline in `modules/buyer-settings/` since only a handful of screens use it.

### 3. Profile-active-by-default — what actually shows on the addresses sub-page right panel?

**Observed.** Pencil's `R6YLrL` frame draws `sn1 Profile` as the active item AND draws all of User info / Stats / Recent orders / Saved addresses stacked in `sContent`. Per Q2 the right panel is in scope only for Saved addresses. So when the user navigates to `sn3 Saved addresses`, what fills `sContent`?

**Hypotheses.**
- (a) Just the `Saved addresses` card (the only in-scope content).
- (b) The full stack as drawn (User info + Stats + Recent orders + Saved addresses) — but this conflicts with Q2's "ignore profile" directive.
- (c) The drawn frame is actually the Profile sub-page (because sn1 is active) and Saved addresses on the right is a *summary preview*, while the dedicated Saved addresses sub-page is something else not drawn.

### 4. Page title scope: shell title vs sub-page title

**Observed.** Pencil page title is "Account & settings" (shell-level). Existing page has "Saved Addresses" (sub-page-level). The Pencil right panel header `MBsPJ` "Saved addresses" 22/700 acts as a section heading inside the panel, not as the page title.

**Question.** Confirm the title hierarchy:
- shell H1 = "Account & settings" (sans 36/800)
- sub-page section H2 = "Saved addresses" (sans 22/700)

**Hypotheses.**
- (a) Yes, both — H1 is shared across all settings sub-pages, H2 changes per sub-page.
- (b) The H1 changes per sub-page (e.g. "Saved addresses" replaces "Account & settings" when navigating into addresses); the section H2 disappears.

### 5. Sidebar items that have no current sub-page (Profile, Payment methods, Notifications, Preferences)

**Observed.** Pencil sidebar has 6 nav items + Log out. Per Q2 of 02-design-inventory, only Saved addresses is in scope. Profile / Payment methods / Notifications / Preferences are drawn but not implemented.

**Question.** How should the un-implemented nav rows behave?

**Hypotheses.**
- (a) Render them visible but disabled (greyed, no hover).
- (b) Render them visible and clickable, leading to a "coming soon" placeholder page.
- (c) Hide them entirely until the corresponding sub-page is built.

### 6. Orders nav row destination

**Observed.** Pencil sidebar `sn2 Orders` is alongside Saved addresses, suggesting orders sits inside the same settings shell. Today `/profile/orders` is a separate top-level profile page.

**Question.** Does the Orders nav row link to (a) the existing `/profile/orders` (which keeps that route), or (b) a moved path `/profile/settings/orders` (mirroring the addresses move)?

**Hypotheses.**
- (a) Keep `/profile/orders` as is, just point this nav row to it (existing route is unaffected).
- (b) Move it to `/profile/settings/orders` with the same redirect strategy as addresses.

### 7. Logout in sidebar — coexist with header dropdown?

**Observed.** Pencil draws a red "Log out" row (sn7) below a divider in the settings sidebar. Existing storefront header already has a logout entry in its account dropdown (header/index.tsx).

**Question.** Should the settings sidebar logout (a) duplicate the header dropdown action (both available simultaneously), or (b) replace one with the other?

**Hypotheses.**
- (a) Both available — settings sidebar logout is just one more entry point.
- (b) Settings sidebar logout *only* on settings pages; header dropdown still shows logout elsewhere.

### 8. Page title copy — "Account & settings" vs existing "Saved Addresses"

**Observed.** Pencil shell title is "Account & settings"; existing page H1 is "Saved Addresses" with a MapPin icon prefix. Different scope (shell vs page) so technically different things, but the existing page header would disappear under the new design.

**Question.** Confirm both: the new shell H1 is "Account & settings" verbatim (no "Settings" alone, no "My account"); and confirm the MapPin icon next to the existing page-title is intentionally dropped.

### 9. Address-card section title copy & casing — "Saved Addresses" → "Saved addresses"

**Observed.** Pencil section heading is "Saved addresses" (sentence case). Existing is "Saved Addresses" (title case).

**Question.** Adopt sentence case verbatim?

### 10. DEFAULT pill vs Stamp primitive

**Observed.** The default-address pill is mono 9/700 uppercase white-on-ink, radius 3, padding [2,6], no rotation. The 04-implementation `Stamp` primitive is mono 11/700 uppercase, radius 3, padding [3,8], rotated -1°, with bg/fg/stroke triplets per intent.

**Question.** Is the DEFAULT pill (a) a new "pill badge" primitive, or (b) an additional `Stamp` variant (e.g. `variant="inverse"` with rotation override)?

**Hypotheses.**
- (a) New `Pill` / `Badge` primitive added to `@repo/ui` (or in `modules/user-addresses/`).
- (b) Extend `Stamp` with an `inverse` variant and a `rotated={false}` prop.
- (c) Inline div with Tailwind classes; no shared primitive.

### 11. DEFAULT pill copy/casing — "Default" → "DEFAULT"

**Observed.** Pencil pill text is "DEFAULT" (mono uppercase). Existing badge text is "Default" (sans Title case).

**Question.** Adopt the all-caps mono "DEFAULT" verbatim?

### 12. Address text composition — what fields drive the displayed line?

**Observed.** Pencil card body shows e.g. *"Tariq Kiryana Store, Block 4, Satellite Town, Gujranwala 52250, Punjab"* — appears to concatenate (shop / business name) + street + area + city + postal + province. Existing schema has only `address` (text) and `city`. The recipient name is shown separately today.

**Question.** Is the displayed line:
- (a) The result of the existing `address` field becoming a richer free-text "full address" input that the user types as one string?
- (b) Composed from new structured fields (e.g. line1, area, city, postalCode, province)?
- (c) Composed from existing fields + 2 new ones (postalCode, province)?

### 13. Postal code field

**Observed.** "52250" appears in the address text. No `postalCode` in schema.

**Question.** Add `postal_code` column? If so:
- type `text` or `varchar(10)`?
- required or optional?
- validation regex (e.g. PK 5-digit) — and does it accept other markets?

### 14. Province / region field

**Observed.** "Punjab" appears in the address text. No province in schema.

**Question.** Add a province field?
- enum (PK provinces only) or free-text?
- column name (`province` vs `region` vs `state`)?
- required or optional?

### 15. Recipient name — display vs model

**Observed.** Pencil card does not render recipient name. Existing card renders `{recipientName} · {recipientPhone}`. Schema has `recipient_name notNull`.

**Question.** Drop recipient name from display only (keep field in schema/form for checkout snapshots), or drop it entirely from the data model? Note: `orders.shippingName` snapshot field exists, so checkout still needs *some* "name to ship to."

**Hypotheses.**
- (a) Display-only removal; field stays in form + DB.
- (b) Total removal; checkout form supplies recipient name separately at order time.
- (c) Replace with a different concept (e.g. business / shop name field) — see Q12.

### 16. Phone display change — sans 14 muted → mono 12 ink-3, name removed

**Observed.** Phone moves to its own row, font shifts sans→mono, size 14→12, color muted→ink-3. Recipient name removed from this composite.

**Question.** Confirm font/size/color and the absence of the recipient name on this row.

### 17. Add address button: primary green → outline ink

**Observed.** Pencil "Add address" button is outline ink (white fill, 1.5px rule-2 stroke, ink text 13/600). Existing is primary green.

**Question.** Confirm the variant change (primary → outline) and the smaller text (14→13).

### 18. Edit address — UI treatment

**Observed.** Pencil shows a pencil icon in the top-right of every card. No Edit form is drawn.

**Question.** Where does the edit happen?

**Hypotheses.**
- (a) Re-use the existing AddressDialog (modal) with title swap "Add address" / "Edit address" and seeded values.
- (b) Right-side Sheet panel that slides in.
- (c) Inline expansion (the card itself becomes editable).
- (d) Separate route (`/profile/settings/addresses/[id]/edit`).

### 19. Edit API — confirm shape

**Observed.** No `PATCH /api/user/addresses/[id]` exists today. Edit pencil implies one is needed.

**Question.** Confirm:
- Endpoint shape: `PATCH /api/user/addresses/[id]` accepting partial fields.
- Auth: same session+ownership check as POST.
- Should `isDefault: true` in PATCH cascade-unset other defaults like POST does?

### 20. Set-as-default UX

**Observed.** Only the DEFAULT pill is drawn; no "Make default" affordance. Today it can only be set during create.

**Question.** How does a user change which address is default?

**Hypotheses.**
- (a) Inside the edit dialog (existing checkbox carried into edit mode).
- (b) Dedicated "Set default" action on each non-default card (button/menu item not drawn but implied).
- (c) Click on the card body to mark as default (gesture).
- (d) Not changeable post-creation by design.

### 21. Delete address — supported?

**Observed.** No delete affordance drawn anywhere; no DELETE endpoint exists today.

**Question.** Is delete in scope for this revamp?

**Hypotheses.**
- (a) Yes — add `DELETE /api/user/addresses/[id]` and a trash button or overflow menu (none drawn — would need a placement decision).
- (b) No — addresses are immutable once created (only edit + set-default).

### 22. Add/Edit dialog — design omission

**Observed.** Pencil draws no add/edit form. Existing AddressDialog is a Dialog with the standard form layout.

**Question.** Is the existing AddressDialog visual/UX retained as-is for this revamp (just retokened), or does the revamp call for a different surface (Sheet, full-page form)? See Q18.

### 23. Empty state visual

**Observed.** Pencil draws 3 cards (always populated). No empty state.

**Question.** Empty state (zero addresses) — render the card section as: (a) the existing empty Card "You don't have any saved addresses yet." copy/visual retokened, (b) a different, design-system-derived empty card (paper-2 with "Add your first address" outline button), or (c) no state distinction (just an empty grid + the section header's Add button)?

### 24. Loading state visual

**Observed.** Pencil draws no loading state. Existing centered Spinner.

**Question.** Keep centered Spinner; or use card-shaped Skeletons (3 placeholder cards mimicking the grid); or leave it to be re-derived during component implementation?

### 25. Error state visual

**Observed.** Pencil draws no error state. Existing surfaces errors via toast.

**Question.** On addresses fetch failure, show: (a) retry-able error card in place of the grid, (b) toast-only and let the section render empty, (c) something else?

### 26. Mobile addresses sub-page — design omitted

**Observed.** Pencil mobile frame `ZETLe` is the Settings *index* (`Ki6pz` 5-row nav card). The mobile rendering of `/profile/settings/addresses` itself is not drawn.

**Question.** What should the mobile sub-page look like?

**Hypotheses.**
- (a) Same `Saved addresses` desktop card translated to a single column (paper-2 default + white non-default cards stacked), section header "Saved addresses" + "Add address" outline button at top, App bar with chevron-back at the very top.
- (b) Different mobile-only treatment that mirrors the existing simpler list.
- (c) Re-use the existing `UserAddresses` component on mobile and only apply the desktop redesign.

### 27. Mobile App bar replacement on Settings pages

**Observed.** Pencil mobile uses an "Account" App bar (chevron-left + title + EN/اردو toggle + avatar). Existing storefront header is different.

**Question.** Does the Settings mobile App bar (a) replace the storefront header on all `/profile/settings/*` mobile screens, (b) co-exist (storefront header stays, app bar is added below), or (c) only show on the settings index?

### 28. EN / اردو toggle placement & behavior

**Observed.** EN/اردو toggle appears in the mobile App bar of the Settings index. Per Q16 of 02-design-inventory EN-only ships first.

**Question.** Visible-but-inert (renders, but selecting "اردو" does nothing yet), or omit until i18n ships? Also: does the toggle appear on desktop Settings chrome too (not drawn) or mobile only?

### 29. Mobile Settings index `/profile/settings` route

**Observed.** Mobile `Ki6pz` is the parent Settings index. On desktop the same nav lives inside the side card next to the content panel.

**Question.** What route renders the mobile index?

**Hypotheses.**
- (a) `/profile/settings` is the index (renders the 5-row list on mobile, shows a "select a setting" placeholder or auto-redirects to first sub-page on desktop).
- (b) `/profile/settings` always redirects to `/profile/settings/addresses` (or another default) on both breakpoints.
- (c) `/profile/settings` exists only on mobile (desktop never reaches this URL).

### 30. Version footer "Shalmi Mart · v1.0.0"

**Observed.** Mobile shows a version string at the bottom of the Settings index. Desktop does not.

**Question.** Source of the version — read from `package.json` at build-time, or hard-code? Show on every settings page on mobile, or only the index?

### 31. Address card padding 16 → 18

**Observed.** Pencil card padding is 18; existing `CardContent` uses `p-4` (16). Small drift.

**Question.** Confirm 18px (i.e. Tailwind `p-[18px]` or a custom token), or normalize to the closest Pencil-aligned step (16/24)?

### 32. Address card title size/weight 14/600 → 15/700

**Observed.** Pencil title is sans 15/700; existing is roughly 14/600 (`font-semibold text-base`).

**Question.** Adopt 15/700 verbatim — or use the closest existing typography step (`text-sm font-bold` = 14/700, or `text-base font-semibold` = 16/600)?

### 33. Addresses grid column count on tablet / narrow desktop

**Observed.** Desktop frame shows 3 cards `fill_container` in `klP6v` at the 1048px content width. Mobile has no drawn frame for this sub-page (Q26).

**Question.** What column count at intermediate breakpoints (tablet 768–1024)? Drop to 2 columns? 1 column?

---

**File written to:** `D:\Moeed 8th Sem\Fyp\Code\shalmi-web\.claude-revamp\screens\buyer-settings\gap-analysis.md`

(End of Buyer · Settings gap analysis. Stopping here per instructions — not starting implementation.)
