# Buyer · Account Drawer / Sheet — Gap Analysis

> **Phase:** Per-screen gap analysis (read-only).
> **Date produced:** 2026-05-02.
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop `EYc0L` / Mobile `q732Y`. Sub-IDs:
> - Desktop drawer root `ZoF9z` (480w right panel) — `LkrJP` (header), `Vsvp4` (user card), `hWx2e` (Nav), `W72oM` (Foot).
> - Page-dimmed underlying chrome `SLjtU` + `s6VmKD` (50%-ink dim) + `QUg8S` (drDBody — placeholder hero + 4 paper-2 cards used only as a backdrop preview).
> - Mobile sheet `q732Y` — `WF5gr` (App bar), `VKF6c` (m3UC user card), `z5ImS` (Nav), `m7ZU0K` (Foot).
> **Existing code:**
> - **NEW UI surface** — overlay, not a route. Closest existing surface is the `DropdownMenu` rendered inline in `apps/web/src/modules/storefront/components/header/index.tsx` (auth-gated to logged-in users only).
> - Trigger candidates: storefront header avatar (existing dropdown) and (per design-inventory Q3) the existing `/profile` middleware-gated route which has no page today.
> - Logout: `apps/web/src/modules/auth/components/logout-button/index.tsx`.
> - Session: `useSession`/`signOut` from `apps/web/src/modules/auth/client/auth-client/index.ts` (better-auth + phone-number plugin).
> - UI primitives that may back this: `packages/ui/src/components/sheet.tsx` (Radix-based slide-over, retoken in Phase 3 with `shadow-drawer`), `packages/ui/src/components/dialog.tsx`, `packages/ui/src/components/language-toggle.tsx` (Phase-3 atom).
> - Phase-3 atom already shipped: `Stamp` — used by drawer's "VERIFIED" pill.
> - **Note:** `01-codebase-map.md` mentions `modules/storefront/components/profile-nav/` but that folder **does not exist**; the dropdown is inline. Recorded here for the codebase-map followup.

---

## Pencil components needed but NOT covered by `02-design-inventory.md` / `04-design-system-implementation-log.md`

Flagged before producing the diff (per workflow rule):

- **Drawer trigger from header (`actAccount` desktop / `mAcct` mobile)** — these are header buttons, not part of the drawer atom itself. Anatomy is captured under buyer-home gap analysis; called out here because the trigger surface determines the **opening behavior** for the drawer overlay. → cross-references buyer-home Open Q7.
- **Compound `User card`** (`Vsvp4` desktop / `VKF6c` mobile) — paper-2 fill card with avatar row + stamp row + 3-column stats grid (vertical hairlines between stats, top hairline above stats). Not in 02 §3 catalog as a reusable, but the structure is unique. Treated as a per-screen molecule.
- **Inline lang toggle inside drawer Foot** (`PimbZ` desktop / `JEIAy` mobile) — the segmented `LanguageToggle` primitive shipped in Phase 3 (`packages/ui/src/components/language-toggle.tsx`). The drawer is the **first real consumer** of that primitive. Per design-inventory Q16, EN-only ships first; the Urdu glyph renders system-fallback until `Noto_Nastaliq_Urdu` is wired.
- **Logout list-item card** (`GyUam` / `PildW`) — its own white card containing a `log-out` red icon + red 15/700 "Log out". Not the design-system `Button/destructive` — it's a list-row pattern. Treated as inline composition.
- **Stat card with right-hairline dividers** (`sxS4u` / `g9L8t`) — 3 cells in one frame using per-cell `stroke.right: 1` ink-rule. Pattern recurs in stats-segments cards (vendor surfaces) but is hand-built per screen, not a formal component.
- **Nav row** (`WkRhQ`/`Na3ld`/… and `m3n1`/`m3n2`/…) — left lucide icon (20 ink-2) + 2-line label stack (title sans 15/600 ink, subtitle sans 12 ink-3) + optional trailing pill (e.g. amber count badge `SVh4w` "3") + chevron-right. **One row variant has an embedded `Stamp`-like pill but rendered as an inline frame, not the Phase-3 `Stamp` primitive.** Open Q below.
- **Underlying-page placeholder** (`SLjtU` + `drDPlc`/`drDPGrid` inside `QUg8S`) — a stylized backdrop drawn behind the dim, showing "page content (dimmed under drawer)" placeholder text + 4 paper-2 cards. **This is a design-time stand-in only** — at runtime the actual page is what's behind the drawer. Documented for completeness.

Everything else reuses primitives already covered by Phase 3.

---

## 1. Layout & structure

### Desktop overlay anatomy (`EYc0L`, 1440 × 1200)

The frame `EYc0L` is laid out with `layout: "none"` and contains 3 absolutely-positioned children:

1. **Underlying page (dimmed)** `SLjtU` (1440 × 1200, `clip: true`, `paper` fill, vertical layout). Contains:
   - `drDUtil` (`g1xjKF`) — the storefront util-strip, **rendered with whites at 85% / 40% alpha** (`#FFFFFFD9`/`#FFFFFF66`) to simulate dim.
   - `drDH` (`qe69U`) — a copy of the storefront header (brand mark + "Search 50,000+ items" 44h field + Account/Cart actions in pill form).
   - `drDBody` (`QUg8S`) — placeholder hero ("Restock smarter, save more" sans 48/800 ink) + a 280h paper-2 placeholder card "page content (dimmed under drawer)" + 4 paper-2 240h placeholder rectangles.
   - **This is the design-time backdrop only — at runtime the underlying page IS whatever the user opened the drawer from.**
2. **Dim layer** `s6VmKD` (rectangle, 960 × 1200, fill `#0F141199` (~ink @ 60%), positioned x=0). It covers everything **except** the right 480w. (Note: the file uses `#0F141199` here; Phase 3 set `--bg-overlay = #0F141180` per OQ Q13. There is a small discrepancy between the drawer dim (60%) and the design-system overlay token (50%). → **Open Q1**.)
3. **Account drawer** `ZoF9z` (480w × 1200h, `clip: true`, `paper` fill, vertical layout, **outer shadow** `{ blur:48, color:#0F141140, offset:{x:-12,y:0} }` matching the Phase-3 `--shadow-drawer` token, **left hairline 1px `rule`**, positioned x=960). Contents top→bottom:
   - **Drawer header** `LkrJP` (padding [20, 24], hairline-bottom 1px rule, `space_between`):
     - "Account" (sans 20/800 ink, ls -0.01).
     - Close button `cxVhm` — 36×36, no fill, 1px `rule-2` stroke, radius 6, contains a centered `x` icon 18 ink. **No hover/disabled state drawn.**
   - **User card** `Vsvp4` (paper-2 fill, padding [20, 24], gap 14, vertical, hairline-bottom):
     - Row `Ctz5J` (gap 14, horizontal):
       - Avatar `Btegg` — 56×56 round, ink fill, centered "TA" white sans 18/800.
       - Stack `SuqNc` (gap 2, vertical, fills): "Tariq Ahmed" (sans 17/700 ink, ls -0.01), "+92 300 1234567" (mono 13 ink-3), "Tariq Kiryana Store" (sans 13 ink-3).
     - Stamp row `xU3yX` (gap 8, horizontal): `H5poUJ` "VERIFIED" stamp (mono 11/700 green, green-bg fill, 1.5px green stroke, radius 3, padding [3,8], rotation 1°) + "Member since Mar 2024" (sans 12 ink-3).
     - Stats grid `sxS4u` (top hairline 1px rule, padding-top 14, horizontal, 3 cells equal, vertical hairlines between via per-cell `stroke.right`):
       - `ds1`: "24" (mono 18/800 ink) + "ORDERS" (sans 10/600 ink-3, ls 0.12).
       - `ds2`: "Rs. 18.4 L" (mono 18/800 ink) + "SPENT" (sans 10/600 ink-3).
       - `ds3`: "Rs. 2.3 L" (mono 18/800 **green-700**) + "SAVED" (sans 10/600 **green-700**).
   - **Nav** `hWx2e` (padding 16, gap 12, vertical):
     - **Section label `C6WHN`** "YOUR ACCOUNT" (mono 11/700 ink-3, ls 0.12), padding [0, 8].
     - **Nav card `f8Z4Lu`** (white fill, 1px rule, radius 8, vertical) — 6 nav rows separated by 1px bottom hairlines (last row no rule):
       1. **Orders** (icon `package`, 2-line: "Orders" 15/600 + "24 orders · 3 in transit" 12 ink-3, **trailing amber "3" pill** `SVh4w` — radius 99, amber-bg fill, 1px amber stroke, padding [2, 7], child mono 11/700 amber, **chevron-right** 18 ink-3).
       2. **Quick reorder** (icon `refresh-cw`, "Quick reorder" + "Replenish your last cart").
       3. **Saved addresses** (icon `map-pin`, "Saved addresses" + "3 addresses · default Shop").
       4. **Payment methods** (icon `credit-card`, "Payment methods" + "Cash on delivery default").
       5. **Saved items** (icon `heart`, "Saved items" + "12 products bookmarked").
       6. **Settings** (icon `settings`, "Settings" + "Profile · notifications · privacy").
     - **Section label `K73nPT`** "HELP & SUPPORT" (mono 11/700 ink-3), padding [16, 8, 0, 8].
     - **Nav card `v2JzJ`** (white fill, 1px rule, radius 8, vertical) — 3 rows:
       7. **Track order** (icon `truck`, "Track order" + **"#SH-24735 · out for delivery"** subtitle in **amber 12/600**).
       8. **Help center** (icon `life-buoy`, "Help center" + "FAQ · returns · contact us").
       9. **Terms & privacy** (icon `file-text`, "Terms & privacy" — single-line, no subtitle).
   - **Foot** `W72oM` (padding [16, 16, 20, 16], gap 12, top hairline 1px rule, vertical):
     - **Lang row `m7Klr`** (`space_between`, padding [0, 8]): "LANGUAGE" eyebrow (mono 11/700 ink-3, ls 0.12) + segmented `PimbZ` (radius 6, 1.5px ink stroke, clip: true). Children:
       - `tNHG9` (`drDLg1`) — `ink` fill, padding [6, 12], child "EN" (mono 11/700 white). **Selected.**
       - `d5XRb` (`drDLg2`) — transparent, padding [6, 12], child "اردو" (font-ar 13 ink).
     - **Logout `GyUam`** — white fill, 1px rule, radius 8, padding [14, 16], gap 14, horizontal `alignItems: center`: `log-out` icon 20 red + "Log out" (sans 15/700 red, fixed-width fills container).
     - **Version `FRygd`** — "Shalmi Mart · v1.0.0" (mono 11 ink-4, ls 0.06, text-align center).

### Mobile sheet anatomy (`q732Y`, 420 × 912)

Full-screen vertical sheet. **No dim, no shadow** — the design treats it as a route-style replacement screen. (The Pencil frame doesn't draw the underlying page — implied to be replaced 1:1.)

1. **App bar** `WF5gr` (`paper`, padding [14, 16], hairline-bottom, `space_between`):
   - "Account" (sans 18/800 ink) **[NB: 2 px smaller than the desktop drawer header — 18 vs 20]**.
   - Close button `egO6b` (36×36, 1px `rule-2` stroke, radius 6, child `x` 18 ink). Same shape as desktop.
2. **User card** `VKF6c` — same content as desktop but padding [18, 16] (vs desktop [20, 24]), `space_between` not used (vertical), single column. Avatar still 56², text sizes same. Stamp row + stats grid identical (stat label fontSize is 9 vs 10 desktop — small typographic adjustment).
3. **Nav** `z5ImS` (padding [14, 16], gap 10, vertical):
   - `m3NL` "YOUR ACCOUNT" eyebrow (padding [0, 4]).
   - `m3NC` (white card, 8 radius, 1 rule) with 6 rows `m3n1…m3n6` — same icons, labels, subtitles, and trailing amber pill on Orders.
   - `m3NL2` "HELP & SUPPORT" eyebrow (padding [12, 4, 0, 4]).
   - `m3NC2` (white card) with 3 rows `m3n7…m3n9`.
4. **Foot** `m7ZU0K` (padding [14, 16, 20, 16], gap 12, top hairline) — same lang segmented `JEIAy` (children `y5e3TV` ink-fill EN / `xaiIk` transparent اردو), white logout card `PildW` (red icon + "Log out" 15/700 red), version `djrNy` "Shalmi Mart · v1.0.0".

### Existing code structure

There is **no drawer component today**. The closest surface is the inline `DropdownMenu` in `StorefrontHeader`:

```
DropdownMenuTrigger (avatar circle, first letter on green-2 bg)
└─ DropdownMenuContent w-56
   ├─ DropdownMenuLabel
   │   ├─ {userName} (sm, semibold)
   │   └─ {phoneNumber} (xs, muted-foreground)
   ├─ DropdownMenuSeparator
   ├─ DropdownMenuItem  → /profile/orders   (Package icon + "My Orders")
   ├─ DropdownMenuItem  → /profile/addresses (MapPin icon + "Addresses")
   ├─ DropdownMenuSeparator
   └─ DropdownMenuItem variant=destructive  (LogOut icon + "Logout") → signOut()
```

The dropdown is rendered conditionally:
- Loading → `bg-muted size-9 rounded-full` skeleton.
- Authed → DropdownMenu with avatar trigger.
- Unauthed → `<Button asChild size="sm">Sign In</Button>` to `/auth`.

The `LogoutButton` component (`auth/components/logout-button/index.tsx`) is **separate from the dropdown's logout item** — it does `signOut()` then `router.push('/')` + `router.refresh()`. Currently used only by `AdminLayout` (per `01-codebase-map.md` §4).

`packages/ui/src/components/sheet.tsx` is the right Radix primitive — Phase 3 retoken'd it specifically for this drawer (`bg-white text-ink-2`, `border-rule`, `shadow-drawer` only on the right-side variant, `bg-bg-overlay` for the scrim).

`packages/ui/src/components/language-toggle.tsx` (Phase 3) is a presentational `value="en|ur"`, `onValueChange`, `disabled` controlled segmented control. It is **not yet consumed anywhere**.

### Top-level layout differences

| | Pencil (drawer/sheet) | Existing (DropdownMenu) |
|---|---|---|
| Surface type | 480w right-side `Sheet` (desktop) / full-screen sheet (mobile) | Popover-anchored DropdownMenu (~224w) |
| Trigger | Labeled `actAccount` icon button (header) — see Open Q-buyer-home-7 | First-letter avatar circle |
| Sections | 4 (header / user card / nav / foot) | 3 menu items + label + 1 destructive item |
| User card | Avatar + name + phone + shop-name + verified stamp + 3 stat cells | Name + phone (label only, in dropdown header) |
| Nav rows | 9 rows in 2 cards (6 + 3), each with icon + 2-line label + optional pill + chevron | 2 menu items (My Orders / Addresses) |
| Lang toggle | Segmented EN/اردو in Foot | None |
| Logout | White-card list-item with red icon + red label, in Foot | Inline destructive `DropdownMenuItem` |
| Version string | "Shalmi Mart · v1.0.0" | None |
| Unauthed state | Not drawn (drawer assumes session) | "Sign In" Button replaces avatar |
| Dim / scrim | 60% ink (`#0F141199`) | Radix portal default (no full-page dim) |
| Open mechanic | Right slide-in (desktop) / replace screen (mobile) | Anchored popover |
| Trigger replaces dropdown? | Per design-inventory Q3 → yes (existing route `/profile` is the trigger surface; drawer overlays current page) | n/a |

---

## 2. Element-by-element diff

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| **Drawer trigger** (`actAccount` desktop / `mAcct` mobile) | `DropdownMenuTrigger` (avatar circle in `StorefrontHeader`) | Trigger changes from anchored popover to slide-out drawer. Per design-inventory Q3 the trigger surface is the existing `/profile` route (which has no page today) — drawer is opened over whatever route is current. | CHANGED_INTERACTION |
| **Drawer overlay (dim)** `s6VmKD` (`#0F141199`, ~60% ink) | (Radix DropdownMenu has no full-page dim) | New scrim. Phase-3 `--bg-overlay = #0F141180` (50%) — slightly lighter than the drawer's drawn 60% dim. | NEW_FIELD + AMBIGUOUS (50% vs 60%) |
| **Drawer panel** `ZoF9z` (480w, paper, drawer shadow + left hairline) | (none) | New `Sheet` consumer with `side="right"`, width 480 (vs Phase-3 `<SheetContent>` default w-3/4 sm:max-w-sm). | VISUAL_ONLY + CHANGED_INTERACTION |
| **Drawer header** `LkrJP` ("Account" sans 20/800 + 36px close button) | `DropdownMenuLabel` (name+phone) | Title is the literal word "Account", not the user name; close button is a 36px square with x icon (Phase-3 dialog/sheet has its own close — verify current `SheetClose` size). | NEW_FIELD + COPY_CHANGE |
| **User avatar** `Btegg` (56×56 round, ink, white "TA" sans 18/800 — initials) | Avatar trigger (36×36 round, green-2, white first-letter sans 14) | Avatar grows; uses initials (probably first+last) on `ink`, not first-letter on green. | VISUAL_ONLY + NEW_FIELD (initials computation) |
| **User name** "Tariq Ahmed" (sans 17/700 ink, ls -0.01) | `{userName}` (sm semibold) | Size up; same source. | VISUAL_ONLY |
| **Phone number** "+92 300 1234567" (mono 13 ink-3) | `(session.user as { phoneNumber?: string }).phoneNumber` (xs muted-foreground) | Size up; **font changes to mono** for the phone. | VISUAL_ONLY |
| **Shop name** "Tariq Kiryana Store" (sans 13 ink-3) | (none) | New. The user's "shop name" / business name shown for retailer accounts. **No `user.shopName` / `business_name` field on `user` table — `vendors` has `shopName` but only vendors have rows there.** | NEW_FIELD |
| **VERIFIED stamp** `H5poUJ` ("VERIFIED" mono 11/700 green, green-bg, 1.5 green stroke, radius 3, padding [3,8], rotation 1°) | (none) | Use Phase-3 `Stamp variant="success"` primitive; copy "VERIFIED". State source = `user.phoneNumberVerified` (`auth.ts` schema). | NEW_FIELD (mapping) + NEW_INTERACTION |
| **Stamp row sub-text** "Member since Mar 2024" (sans 12 ink-3) | (none) | New. Source = `user.createdAt`, formatted "Member since {Mon YYYY}". | NEW_FIELD |
| **Stat 1** "24 ORDERS" (mono 18/800 ink + sans 10/600 ink-3 ls 0.12) | (none) | New aggregate. Source = `count(orders where userId = current)`. No endpoint today. | NEW_FIELD + NEW_INTERACTION |
| **Stat 2** "Rs. 18.4 L SPENT" (mono 18/800 ink + sans 10/600 ink-3) | (none) | New aggregate. "L" = lakh (Pakistani lakh notation, 100,000). Source = `sum(orders.grandTotal where userId = current and status in (delivered, completed))`. **South-Asian formatter required (per 03-token-migration / design-inventory Q17).** | NEW_FIELD + NEW_INTERACTION |
| **Stat 3** "Rs. 2.3 L SAVED" (mono 18/800 green-700 + sans 10/600 green-700) | (none) | New aggregate. **Definition undefined** — savings could be `(unitPrice × qty) - subOrders.totals` (sale price discount), or `grandTotal at smallest pack vs largest pack pricing`. Pencil shows the metric but not its formula. | NEW_FIELD + AMBIGUOUS |
| **Section label** "YOUR ACCOUNT" (mono 11/700 ink-3, ls 0.12) | (none) | New eyebrow style — same family as Phase-3 `--text-label-xs` (mono 11/600 ls 0.08). Letter-spacing differs (0.12 here vs 0.08 in design-system spec). | VISUAL_ONLY |
| **Nav card 1** (white card, 1px rule, radius 8, internal hairline rules between rows) | (none) | New "list card" pattern. **Distinct from `<DropdownMenu>` and `<Sheet>` primitives** — closest existing primitive is `Card`/`CardContent`. | NEW_FIELD (compound) |
| **Nav row · Orders** (`package` icon + "Orders" / "24 orders · 3 in transit" + amber "3" pill + chevron) | `<DropdownMenuItem>` (Package icon + "My Orders" → `/profile/orders`) | Adds 2-line content (count + in-transit), trailing **count-pill** badge. The "in transit" subtitle implies `subOrders.status in ('packed','handed_to_courier')` aggregation. | NEW_FIELD (× 3: order count, in-transit count, badge value) + NEW_INTERACTION + COPY_CHANGE ("My Orders" → "Orders") |
| **Trailing pill on Orders row** `SVh4w` (amber-bg fill, amber 1 stroke, radius 99, padding [2,7], child "3" mono 11/700 amber) | (none) | New atom — visually distinct from Phase-3 `Stamp` (different shape: amber pill is rounded-full not radius-3, no rotation). Could be a new `Counter` / `Badge` primitive or an inline frame. | NEW_FIELD + AMBIGUOUS (new primitive vs ad-hoc) |
| **Nav row · Quick reorder** (`refresh-cw` icon + "Quick reorder" + "Replenish your last cart") | (none) | New nav row pointing to the Reorder screen (already covered by buyer-reorder gap analysis). | NEW_INTERACTION + NEW_FIELD (target route) |
| **Nav row · Saved addresses** (`map-pin` + "Saved addresses" + "3 addresses · default Shop") | `<DropdownMenuItem>` ("MapPin" + "Addresses" → `/profile/addresses`) | Renamed; subtitle adds count + default-tag. **"default Shop"** implies `addresses.title = 'Shop'` is the default — labeling pattern needs `addresses.isDefault` (already in schema) + `addresses.title`. | NEW_FIELD (counts + default-title) + COPY_CHANGE |
| **Nav row · Payment methods** (`credit-card` + "Payment methods" + "Cash on delivery default") | (none) | New row. **There is no `payment_methods` table** today — checkout uses COD only. → Open Q. | NEW_FIELD + NEW_INTERACTION |
| **Nav row · Saved items** (`heart` + "Saved items" + "12 products bookmarked") | (none) | Wishlist row — same feature flagged in buyer-home gap analysis. **No `saved_items` table.** | NEW_FIELD + NEW_INTERACTION |
| **Nav row · Settings** (`settings` + "Settings" + "Profile · notifications · privacy") | (none) | New row → links to `/profile/settings` (which is being added per buyer-settings gap analysis answers in 02 design-inventory Q2). | NEW_INTERACTION |
| **Nav row · Track order** (`truck` + "Track order" + amber subtitle "#SH-24735 · out for delivery") | (none) | Implies a "current active order" lookup. Subtitle is **conditionally rendered**: only when an active in-transit order exists. **"out for delivery" maps to `subOrders.status = 'handed_to_courier'`** per design-inventory Q9. → Open Q. | NEW_FIELD + NEW_INTERACTION + NEW_STATE (no-active-order variant not drawn) |
| **Nav row · Help center** (`life-buoy` + "Help center" + "FAQ · returns · contact us") | (none) | Routes to a /help index — same target Q as buyer-home Open Q15 footer links. | NEW_INTERACTION |
| **Nav row · Terms & privacy** (`file-text` + "Terms & privacy" — single-line) | (none) | Routes to /terms or /privacy — same target Q. | NEW_INTERACTION |
| **Lang row eyebrow** "LANGUAGE" (mono 11/700 ink-3, ls 0.12) | (none) | New copy line. | NEW_FIELD |
| **Lang segmented control** `PimbZ` / `JEIAy` (clip:true, radius 6, 1.5 ink stroke, EN selected ink-fill / اردو transparent) | (none) | First consumer of Phase-3 `<LanguageToggle>`. Per design-inventory Q-LANG-1, Auto-Mode shipped the primitive as presentational (controlled `value`/`onValueChange`); the drawer must own the state and propagate it (or wire a global i18n context — deferred). | NEW_INTERACTION |
| **Logout** `GyUam` / `PildW` (white card with red icon + red 15/700 "Log out" label, full-width row) | `DropdownMenuItem variant=destructive` ("LogOut" + "Logout") | Visual treatment changes from menu-item to white-card list-row. **Behavior: same** — calls `signOut()`. Consider whether to reuse the existing `LogoutButton` component (which post-signout does `router.push('/')` + `router.refresh()`). | VISUAL_ONLY + COPY_CHANGE ("Logout" → "Log out") |
| **Version string** "Shalmi Mart · v1.0.0" (mono 11 ink-4, ls 0.06, centered) | (none) | New. Source = `package.json` version (or env `NEXT_PUBLIC_APP_VERSION`). The string format includes the brand prefix from `APP_NAME`. | NEW_FIELD |
| **Underlying-page placeholder** `SLjtU` + `drDPlc` etc. | n/a | Pencil-only design backdrop; at runtime the live page shows. **Drawer must NOT scroll the underlying page when open** (Radix Sheet handles this). Confirm body scroll lock matches. | (out-of-scope) |
| **Open mechanic** | (Radix Sheet animation) | Per design-inventory Q3, drawer is overlay over current page on both desktop and mobile. **Mobile: full-screen** vs desktop: 480w right-side panel. Phase-3 `Sheet` defaults to `side="right"` and width-3/4 — needs a 480w override on desktop and `side="bottom"` or full-screen on mobile (or a single right-side variant that grows to 100vw at small breakpoints). | CHANGED_INTERACTION |
| **Close mechanic** | n/a | Three close paths: × button, scrim click, Esc key. Pencil only draws the × button. Confirm scrim/Esc map to the same close. | NEW_STATE (close-via-scrim/Esc not drawn) + AMBIGUOUS |
| **Unauthed state** | n/a | **Pencil draws no unauthed drawer.** Today the header shows a "Sign In" button instead of the avatar. Either (a) the drawer trigger is hidden when unauthed (avatar replaced with Sign In as today), or (b) the drawer opens but with sign-in CTA instead of user content. | NEW_STATE + AMBIGUOUS |
| **Loading state** | n/a | Stats / counts (orders, spent, saved, addresses count, saved-items count, in-transit order id) require async fetches — Pencil shows them filled. Need skeleton frames for each line that has dynamic content. | NEW_STATE |
| **Empty / no-active-order state** | n/a | Track-order row has copy "#SH-24735 · out for delivery" — what's drawn when there's no active order? Hide the row, dim it, or show "No active order"? | NEW_STATE + AMBIGUOUS |

---

## 3. Schema / type implications

For each NEW_FIELD / REMOVED_FIELD above:

### 3.1 User profile fields exposed in the drawer

**Existing `user` table (`packages/database/src/schema/auth.ts`):** `id`, `name`, `email`, `emailVerified`, `image`, `phoneNumber`, `phoneNumberVerified`, `role`, `createdAt`, `updatedAt`.

| Drawer field | Source today | Required schema change |
|---|---|---|
| Initials ("TA") | derive from `user.name` | none |
| Display name | `user.name` | none |
| Phone | `user.phoneNumber` | none (already on `session.user`) |
| **Shop name / business name** ("Tariq Kiryana Store") | not on `user` | **NEW**: add `user.businessName: text NULL` (or `retailer_profile` 1:1 table). |
| VERIFIED stamp | `user.phoneNumberVerified` | none |
| "Member since Mar 2024" | `user.createdAt`, formatted | none (formatter only) |

### 3.2 Stat aggregations

Three aggregates require new endpoints (or fold into a single `GET /api/user/profile-stats`):

```ts
type ProfileStats = {
  ordersCount: number;             // count(orders where userId = me)
  inTransitCount: number;          // count(sub_orders join orders where userId = me and sub_orders.status in ('packed','handed_to_courier'))
  totalSpentCents: number;         // sum(orders.grandTotal where userId = me and orders.status in ('completed','partially_fulfilled'))
  totalSavedCents: number;         // SAVING FORMULA UNDEFINED — see Open Q3
  activeAddressesCount: number;    // count(addresses where userId = me)
  defaultAddressTitle: string|null;// addresses.title where addresses.isDefault = true and userId = me
  savedItemsCount: number;         // count(saved_items where userId = me) — REQUIRES NEW TABLE
  activeOrderDisplayId: string|null;  // first order with active sub_order, ordered by recency
  activeOrderStatusLabel: string|null;// e.g. "out for delivery"
};
```

**New endpoint** `GET /api/user/profile-stats` (cookie-authed). Cached server-side per-user; invalidated on order/cart/wishlist mutations.

### 3.3 Saved items / wishlist

(Same dependency as buyer-home Open Q12.)

Add `saved_items (userId, productId, createdAt)` PK `(userId, productId)`. Endpoints:
- `GET /api/user/saved-items` — for `/profile/saved` page (new) and the count.
- `POST /api/user/saved-items` (body `{ productId }`) — toggle on.
- `DELETE /api/user/saved-items/[productId]` — toggle off.

### 3.4 Payment methods

There is **no `payment_methods` table** and checkout is COD-only. Two paths:
- (a) Create `payment_methods (id, userId, type, label, details, isDefault, createdAt)` so the row has real data; the only allowed `type` initially is `cod`.
- (b) Render the row as **read-only static copy** ("Cash on delivery default") with the row pointing to a placeholder/CMS page.

→ **Open Q4**.

### 3.5 i18n state plumbing

The lang segmented control belongs to the drawer Foot. Decisions:
- Where is `value` stored? (cookie / localStorage / nuqs URL state / context).
- Phase-3 ships `<LanguageToggle>` as controlled-only — the drawer (and chrome) needs to own state.

→ **Open Q5**.

### 3.6 Routes referenced by drawer rows

| Row | Target route | In code today? |
|---|---|---|
| Orders | `/profile/orders` | Yes |
| Quick reorder | `/profile/orders/{lastOrderId}/reorder` (or similar) | No (Reorder is a new screen — see buyer-reorder gap analysis) |
| Saved addresses | `/profile/addresses` (or `/profile/settings/addresses` per design-inventory Q2) | Yes today, will move per Q2 |
| Payment methods | `/profile/payment-methods` (or similar) | No |
| Saved items | `/profile/saved` (or similar) | No |
| Settings | `/profile/settings` | No (new — buyer-settings) |
| Track order | `/profile/orders/{activeOrderId}` (or `/track/{displayId}`) | `/profile/orders/[id]` exists |
| Help center | `/help` | No |
| Terms & privacy | `/terms` and/or `/privacy` | No |

### 3.7 Drawer width override (Sheet primitive)

Phase-3 `<SheetContent>` doesn't have a `width` prop today (it inherits Radix defaults). Either (a) extend the primitive with a size variant, or (b) pass a `className="sm:!max-w-[480px]"` override inline, or (c) add a sized variant to the CVA config. → **Open Q6**.

---

## 4. Behavior implications

### 4.1 Open / close mechanics

- **Trigger**: Header `actAccount` button (desktop) and `mAcct` button (mobile). Per design-inventory Q3 these clicks open the drawer; the existing `/profile` middleware-gated route becomes the "trigger surface" — i.e. the route exists for deep-linking purposes (open the drawer programmatically when user lands on `/profile`).
- **Open**: Radix `Sheet` slide-in from right (desktop) and either slide-up from bottom or right-edge full-bleed on mobile. Phase-3 `SheetContent` already animates and applies `--shadow-drawer` on the right-side variant.
- **Close**: × button (`SheetClose`), scrim click (`SheetOverlay` onClick), Esc key (Radix default). Confirm all three are wired.
- **Body scroll**: locked by Radix when open.

### 4.2 Route coupling — existing `/profile` route

The middleware (`apps/web/src/middleware.ts`) already gates `/profile/*` for authed users. Per design-inventory Q3, `/profile` (no trailing segment) becomes a deep-link surface that opens the drawer. Implementation choices:
- (a) `/profile/page.tsx` server-component renders nothing visible but sets a "open drawer on mount" client signal (cookie/query param/zustand store).
- (b) `/profile` redirects to `/?account=open` and the storefront layout reads the param to open the drawer.
- (c) `/profile` redirects to the first nav row's actual route (e.g. `/profile/orders`) and the drawer is **not** auto-opened — only manual via header button.

→ **Open Q7**.

### 4.3 Lang toggle behavior

- Per design-inventory Q16: EN-only ships first; toggle must exist but not actually translate.
- Per Phase 3 Q-LANG-1: the primitive is presentational; not yet wired to any global state.
- For this drawer, the simplest path: presentational `<LanguageToggle>` whose `onValueChange` writes to a cookie + reloads (or no-op until i18n lands). Confirm.

→ **Open Q5** (combines with §3.5).

### 4.4 Logout behavior

Two existing patterns:
- Header DropdownMenu's logout: calls `signOut()` (no redirect, relies on session refresh).
- `LogoutButton` component: `signOut()` + `router.push('/')` + `router.refresh()`.

The drawer logout should follow the **`LogoutButton` pattern** (post-logout redirect to `/`), and **close the drawer first** to avoid a flash of empty drawer state. → **Open Q8**.

### 4.5 Version string source

Two options:
- (a) Read `package.json#version` at build time via a Next.js env / config (`NEXT_PUBLIC_APP_VERSION`).
- (b) Hard-code in the version frame.

Recommend (a) — the design intent is "show current build". Needs an `env.ts` addition. → **Open Q9**.

### 4.6 Active-order lookup

Track-order row needs the **most recent in-transit order** for the user. Query: `select displayId from orders where userId = me and exists (select 1 from sub_orders where orderId = orders.id and status in ('packed','handed_to_courier')) order by createdAt desc limit 1`. Status string mapping per design-inventory Q9:

| `sub_orders.status` | Drawer copy |
|---|---|
| `pending` | (no row, or "Awaiting packing"?) |
| `packed` | "Packed" |
| `handed_to_courier` | "Out for delivery" |
| `delivered` | (no row — hide track-order row) |
| `cancelled` | (no row) |

→ **Open Q10**.

### 4.7 Saved-items count, active addresses count

These propagate from the existing tables; need a single `/api/user/profile-stats` endpoint that can be revalidated on cart / order / saved-item mutations. The drawer also needs to subscribe so counts update without a full re-open.

### 4.8 Mobile-vs-desktop responsive breakpoint

Pencil draws desktop and mobile as **two distinct layouts** (480w right-side vs full-screen replacement). A single `<Sheet side="right">` with width 480 doesn't naturally collapse to "full-screen mobile" — Radix supports `side="right"` with a width that grows to 100vw at small breakpoints (e.g. `w-full sm:w-[480px]`). Confirm this approach matches the mobile design (which has its own App bar with "Account" title vs desktop's drawer header — they're equivalent visually if the sheet is full-screen).

### 4.9 Stats freshness

Drawer stats are likely shown on every drawer open. Two options:
- (a) Server fetch on each open (simple, slow).
- (b) Client React Query with stale-while-revalidate (matches existing patterns; can prefetch on hover of the trigger).

Recommend (b). → **Open Q11**.

---

## 5. Open questions for me

Numbered. Every NEW_FIELD / REMOVED_FIELD / NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE / COPY_CHANGE / AMBIGUOUS row in §2 maps to one of these.

### 1. Drawer scrim opacity — 50% (Phase-3 token) vs 60% (drawn in file)

- **Observed (design):** `s6VmKD` rectangle uses `#0F141199` (~60% ink alpha).
- **Observed (token):** Phase-3 `--bg-overlay = #0F141180` (50%).
- **Question:** Should the drawer scrim use the existing `--bg-overlay` (50%) or a one-off 60% override? Are 50% and 60% intentionally different surfaces in the design system?
- **Hypotheses:** (a) align scrim to `--bg-overlay`, drop the 60% as a Pencil-side rounding artefact; (b) introduce `--bg-overlay-strong = #0F141199` and use it for the drawer; (c) keep 50% on dialogs, use 60% only on the drawer because it has a wider shadow.

### 2. "Saved" stat formula

- **Observed (design):** Stat 3 reads "Rs. 2.3 L SAVED" (mono 18/800 green-700 — visually highlighted to suggest it's a positive metric).
- **Observed (code):** No "savings" concept in any schema or aggregation.
- **Question:** What does "Saved" mean? Discount-vs-list-price savings on completed orders, savings vs single-unit price for pack purchases, or platform credits earned?
- **Hypotheses:** (a) sum of `(originalPrice - paidPrice) × qty` across all order items (requires list price, see buyer-home Open Q11); (b) sum of pack-discount equivalents (requires pack-pricing model from design-inventory Q12); (c) sum of `wallet.balanceCents` historic credits (matches existing `wallet` table); (d) just a marketing string, computed approximately.

### 3. Trailing pill on "Orders" row — new primitive or ad-hoc?

- **Observed (design):** Amber-bg pill, radius 99, padding [2,7], 1px amber stroke, child mono 11/700 amber "3". Visually distinct from Phase-3 `Stamp` (radius 3, rotation -1°).
- **Observed (code):** No counter / pill primitive exists.
- **Question:** Is this a new generic primitive (a `<Counter variant="warning|info|critical">` to use anywhere a count needs to render) or an ad-hoc inline frame for this drawer only?
- **Hypotheses:** (a) new `<Counter>` primitive shipped now (used in nav rows here, possibly cart-icon badge in header, etc.); (b) inline frame here, generalize later; (c) reuse `Stamp` with a new rounded variant.

### 4. Payment methods row — schema or static?

- **Observed (design):** Row reads "Payment methods" / "Cash on delivery default". The row is fully styled — implies the user can tap into a payment-methods page.
- **Observed (code):** No `payment_methods` table; checkout is COD-only.
- **Question:** Build the schema + page now, or render the row as static copy with no real destination?
- **Hypotheses:** (a) full feature: `payment_methods` table + `/profile/payment-methods` page (for now only seedable as `cod`); (b) static row, link to a "Coming soon" placeholder; (c) hide the row until a non-COD method exists.

### 5. Lang toggle — global state plumbing

- **Observed (design):** Drawer Foot has the segmented `LanguageToggle`, and the storefront util-strip has its mini-row variant — both reflect the same selected language.
- **Observed (code):** Phase-3 `LanguageToggle` is presentational (`value` / `onValueChange`); no global i18n.
- **Question:** Where does the language state live, and what does changing it do today (per design-inventory Q16, EN-only ships first)?
- **Hypotheses:** (a) cookie `lang=en|ur` set by toggle, no UI changes today (no-op); (b) Zustand store + cookie + reload; (c) URL search param via nuqs; (d) the toggle is fully disabled and the UI is read-only until i18n lands.

### 6. Drawer width override on `<SheetContent>`

- **Observed (design):** Desktop drawer 480w, mobile full-screen.
- **Observed (code):** `<SheetContent side="right">` ships with Radix's defaults (~3/4 screen up to `sm:max-w-sm`).
- **Question:** Extend the primitive (e.g. add a `size` variant) or pass `className` overrides per consumer?
- **Hypotheses:** (a) extend primitive `size="sm"|"md"|"lg"`; (b) per-consumer className; (c) add a dedicated `<AccountDrawer>` molecule that internally configures width.

### 7. Trigger surface — `/profile` route + header button

- **Observed (design):** Both the header `actAccount` button and the existing `/profile` middleware-gated route open the drawer; per design-inventory Q3, "yes existing route /profile should be the drawer trigger surface".
- **Observed (code):** Header has avatar Dropdown today; `/profile` has no page; mobile responsive collapses Dropdown to the same trigger.
- **Question:** Implementation choice for `/profile` deep-linking — auto-open via cookie, search param, route redirect, or render-then-open?
- **Hypotheses:** (a) `/profile/page.tsx` mounts a client component that opens the drawer on mount and replaces history with `/`; (b) middleware redirect `/profile` → `/?account=open`; (c) `/profile/page.tsx` renders a static "Account" landing that includes the drawer rendered open by default.

### 8. Logout target after signOut

- **Observed (design):** No post-logout state drawn.
- **Observed (code):** Two patterns: dropdown logout (no redirect) vs `LogoutButton` (redirect to `/` + refresh).
- **Question:** Drawer logout uses which pattern, and does it close the drawer first?
- **Hypotheses:** (a) follow `LogoutButton` (close drawer → signOut → push `/` → refresh); (b) signOut only and let session listeners reset the page; (c) close drawer → signOut → keep current route (works for `/`, but `/profile/*` middleware will redirect to `/auth?redirect=...`).

### 9. Version string source

- **Observed (design):** "Shalmi Mart · v1.0.0" mono 11 ink-4 ls 0.06 centered.
- **Observed (code):** No `APP_VERSION` env / config wired.
- **Question:** Hard-code in component, read `package.json#version` at build, or expose via `NEXT_PUBLIC_APP_VERSION`?
- **Hypotheses:** (a) `NEXT_PUBLIC_APP_VERSION` env, populated at build by Vercel from package.json; (b) import from `package.json` directly (Next.js allows server-side); (c) hard-code constant in `core/constants/app-info`.

### 10. Track-order row — copy mapping when there's no active order

- **Observed (design):** Subtitle "#SH-24735 · out for delivery" assumes one active order.
- **Observed (code):** No "active order" concept.
- **Question:** When the user has zero in-transit orders, does the row (a) hide, (b) show fallback "No active orders", (c) link to general orders list, (d) something else?
- **Hypotheses:** (a) hide row; (b) "No active orders" — keep the row, no badge, no chevron; (c) route to `/profile/orders` regardless and subtitle becomes "View all your orders".

### 11. Stats freshness / cache strategy

- **Observed (design):** Stats render filled with no loading hint.
- **Observed (code):** No `/api/user/profile-stats` endpoint; existing similar fetchers use React Query.
- **Question:** SWR-on-open with skeletons in the meantime, or server-render once on drawer mount?
- **Hypotheses:** (a) React Query, prefetch on header trigger hover; (b) server-render on `/profile` route + revalidate via the live drawer; (c) skeleton-on-open, fetch each time.

### 12. Initials computation

- **Observed (design):** Avatar shows "TA" for "Tariq Ahmed" — first letter of each name part.
- **Observed (code):** Header avatar shows only the first letter (`userName.charAt(0)`).
- **Question:** Drawer-and-header use first+last initials, or only first letter (matching today)? Does single-name user show one initial?
- **Hypotheses:** (a) split on whitespace, take first letter of first two parts (handles "Tariq Ahmed" → "TA", "Ali" → "A"); (b) keep first-letter-only; (c) different rules for drawer (TA) vs header (T).

### 13. Stamp-row "Member since" date format

- **Observed (design):** "Member since Mar 2024".
- **Observed (code):** `dayjs` is in deps; date formatter not centralized for this case.
- **Question:** Format `Mon YYYY` (`dayjs(...).format('MMM YYYY')`) or longer (`MMMM YYYY` → "March 2024")?
- **Hypotheses:** (a) abbreviated `MMM YYYY` (matches drawn copy); (b) full `MMMM YYYY`; (c) localized format per current language.

### 14. "L" lakh notation (South-Asian) for currency

- **Observed (design):** "Rs. 18.4 L" / "Rs. 2.3 L" (lakh = 100,000). Per 03-token-migration Q answer to design-inventory Q17, "Standardize to one, and use the South-Asian digit-grouping style." But the lakh-suffix abbreviation ("L" = lakh) is a separate convention.
- **Observed (code):** `formatPrice` (in `modules/cart/utils/resolve-price.ts`) — needs verification of grouping behavior.
- **Question:** Stats use lakh-abbreviated form ("Rs. 18.4 L") while the rest of the UI uses full grouping ("Rs. 18,40,000"). Is the drawer the only place lakh-abbreviation is used, or is it system-wide for amounts above a threshold?
- **Hypotheses:** (a) drawer-only abbreviation (formatter passes a `compact: true` flag); (b) system-wide abbreviation above 1,00,000; (c) raw grouping everywhere — abbreviation is design shorthand only.

### 15. Saved items / wishlist scope

- **Same dependency as buyer-home Open Q12.** If wishlist is out-of-scope for this revamp, the "Saved items" nav row needs a placeholder or removal.

### 16. Unauthed drawer behavior

- **Observed (design):** No unauthed variant drawn.
- **Observed (code):** Header shows "Sign In" Button when unauthed (no avatar/dropdown).
- **Question:** When unauthed, does (a) the trigger button hide entirely, (b) the trigger opens a drawer with sign-in CTA + minimal Help/Terms links, (c) the trigger routes to `/auth`?
- **Hypotheses:** (a) hide trigger, show "Sign In" Button as today; (b) drawer opens with reduced surface; (c) trigger redirects to `/auth?redirect=/`.

### 17. "default Shop" copy in Saved-addresses subtitle

- **Observed (design):** "3 addresses · default Shop" — implies default address has a `title` of "Shop" (existing schema field).
- **Observed (code):** `addresses.title` exists and is required (`createAddressSchema`).
- **Question:** Should the subtitle render the literal title (so a user with default title "Office" would see "default Office") or always say "Shop / Home / Other" from a fixed enum?
- **Hypotheses:** (a) literal title field; (b) enum mapped; (c) a new `addresses.kind` enum + the literal `title` for display.

### 18. Drawer header close-button style

- **Observed (design):** 36×36, no fill, 1px `rule-2` stroke, radius 6, `x` icon 18 ink. **No hover state drawn.**
- **Observed (code):** Phase-3 `<SheetContent>` has its own absolute-positioned close (X icon, top-right, no border).
- **Question:** Use the Phase-3 default close (override styling) or render a custom close button inside the drawer header?
- **Hypotheses:** (a) hide default close, render custom `<SheetClose>` styled as a 36px outline button inside the title row; (b) restyle the default close to match; (c) accept the default close.

---

(End of Buyer · Account Drawer gap analysis. Stopping here per workflow rule — not starting implementation.)
