# Order Status Stamps — Surface Map

> **Phase:** Feature surface mapping (read-only).
> **Date produced:** 2026-05-02
> **Source:** Pencil file `Pencil-Design/Shalmi`.
> **Inputs read:** `01-codebase-map.md`, `02-design-inventory.md`,
> `04-design-system-implementation-log.md`, plus Pencil nodes listed in §2.
> **Hard rule (CLAUDE.md):** every inference is flagged "(inferred)" and
> mirrored as an open question in §7.

---

## 1. Feature summary

The feature is a unified status visual system that communicates the
lifecycle stage of an order or sub-order across every order-touching
surface — buyer order history, buyer order/reorder header, vendor
packing queue, vendor dashboard KPI tiles and recent-orders list, and
the buyer account drawer's user card. The same five color/label tokens
(DELIVERED green, AT MNP HUB blue, PACKED ink-on-paper, DELAYED amber,
CANCELLED red — see `05 Components → STAMPS`, frame `K3KOEZ`) are reused
in two distinct presentational shapes: (a) a **rotated "rubber-stamp"
pill** (1.5px stroke, radius 3, padding [3,8], mono 11/700, rotation
±1°) used inside detailed order-card headers and on identity badges,
and (b) a **flat status pill** (1px stroke, radius 99, padding [2,8] /
[2,7]) used for compact KPI deltas, dashboard recent-order rows and
order-count badges. The same palette also drives the larger
**Status-segment tiles** on the Vendor Orders page and the topbar
**VENDOR** identity badge. (inferred) The feature appears to drive only
*display*; the actual state machine remains the existing
`sub_orders.status` enum (mapped via display labels per Q9 of the
design inventory).

---

## 2. Touchpoint inventory

Pencil node IDs are stable — re-open via `pencil:batch_get`. "Existing
screen?" cross-references the Phase 0 codebase map.

| pencil_location | touchpoint_type | existing_screen? |
|---|---|---|
| `a2HFrA → 05 Components → STAMPS` (`K3KOEZ` card; stamps `FEuzm` DELIVERED · `vcFkw` AT MNP HUB · `N2FxFB` PACKED · `VsCJd` DELAYED · `df6Q2` CANCELLED) | NEW_ELEMENT_ON_EXISTING_SCREEN (design-system showcase only — drives the `Stamp` primitive that already exists in `packages/ui/src/components/stamp.tsx`) | n/a (internal reference frame) |
| `g78Iwm` Buyer · Orders · Desktop — `oFilters` (`T9t4M`) tabs / sort row | MODIFIED_ELEMENT_ON_EXISTING_SCREEN (filter tabs use status labels) | `/profile/orders` (`apps/web/src/app/(storefront)/profile/orders/page.tsx`) |
| `g78Iwm` `Order list` (`ZHbCa`) — `oo1` DELIVERED (`CLTnO`), `oo2` OUT FOR DELIVERY (`qs3Gr`, amber), `oo3` DELIVERED (`acH7C`), `oo4` AT MNP HUB (`a31WN`), `oo5` CANCELLED (`OXX8q`) | MODIFIED_ELEMENT_ON_EXISTING_SCREEN (each card header carries a rotated stamp at top-right; rotation `+1°` in usage vs `-1°` in showcase) | `/profile/orders` (renders `RetailerOrders` → `OrderCard`) |
| `ctdRJ` Buyer · Orders · Mobile — `Filter tabs` (`gVK0c`) chips: All/In transit (count 3)/Delivered (count 19)/Cancelled | MODIFIED_ELEMENT_ON_EXISTING_SCREEN (status-derived filter chip row, with counts) | `/profile/orders` (mobile responsive view of same route) |
| `ctdRJ` mobile cards `moo1`-`moo4` — DELIVERED (`bl0PK`), OUT FOR DELIVERY (`VyJUI`, amber), DELIVERED (`E5peI`), AT MNP HUB (`Qnnbq`); fontSize 10 (smaller than 11 desktop) | MODIFIED_ELEMENT_ON_EXISTING_SCREEN | `/profile/orders` |
| `NNw2K` Buyer · Reorder · Desktop — `rTH` eyebrow `odI5N` "REORDER · ORDER #SH-24891 · 24 APR 2026" (mono 11/700, `#15803D` green-700, **letter-spacing 0.16, no rotation, no border, no fill**) | NEW_ELEMENT_ON_EXISTING_SCREEN (inferred — visually borrows the green-700 + mono palette of the DELIVERED stamp, but is rendered as plain coloured eyebrow text, NOT a `Stamp`) | NEW screen (`/profile/orders/[id]` per Q1 of 02-design-inventory now opens this Reorder frame) |
| `tbXvv` Buyer · Reorder · Mobile — `mrEy` "REORDER · 24 APR 2026" (mono 10/700, `#15803D`, letter-spacing 0.16) | NEW_ELEMENT_ON_EXISTING_SCREEN (same eyebrow style as desktop, smaller size) | NEW screen |
| `jXwqE` Vendor · Orders · Desktop — `Top bar` → `voTBdg` (`f4FWd`): rotated rubber-stamp shape with content "VENDOR" (mono 10/700, white-on-transparent, stroke `#FFFFFF66`, rotation `+1°`) | ICON_OR_BADGE (role-identity badge styled as a stamp) | `/vendor/orders` (and via shared layout, every authenticated vendor page) |
| `jXwqE` `Status segments` (`OrskX`) — 3 large tiles `voSeg1` NEW · TO PACK (8 amber, with hourglass icon), `voSeg2` PACKED (14 ink, package icon), `voSeg3` DISPATCHED · COMPLETED (286 green, truck icon). Each tile is a 20/24-padded segment of one bordered card divided by 1px right hairlines. | NEW_ELEMENT_ON_EXISTING_SCREEN (inferred — large numeric summary band; uses stamp **palette** but is not a Stamp) | `/vendor/orders` |
| `jXwqE` `Cards` (`bdxIR`) — Order card 1/2/3 each carries `vc1Stp` rotated stamp showing "NEW" (amber, rotation `+1°`); the giant green "Packed ✓" CTA below is the action that flips the status. | MODIFIED_ELEMENT_ON_EXISTING_SCREEN | `/vendor/orders` (`VendorOrders` → `OrderCard`; status update via `useUpdateSubOrderStatusMutation` → `PATCH /api/vendor/orders/[subOrderId]`) |
| `EEK8K` Vendor · Orders · Mobile — `Status segs` (`a9Xa9`) 3-up: 8 NEW (amber tile, ink stroke amber), 14 PACKED (white tile, ink stroke), 286 COMPLETE (green tile) | NEW_ELEMENT_ON_EXISTING_SCREEN (mobile equivalent of OrskX) | `/vendor/orders` (mobile) |
| `EEK8K` `Cards` (`ucjsk`) — Order cards 1-3 with rotated stamp in `moC1Hd` header (inferred from card structure — header content is abbreviated in this read pass; same NEW amber as desktop is the visible default state) | MODIFIED_ELEMENT_ON_EXISTING_SCREEN | `/vendor/orders` (mobile) |
| `VqlnC` Vendor · Dashboard · Desktop — `Top bar` → `voTBdg` (`xf7GX`): rotated "VENDOR" badge (same as Vendor Orders) | ICON_OR_BADGE | `/vendor/dashboard` (currently placeholder copy per codebase map Q5) |
| `VqlnC` `KPI row` (`JS8se`) — 4 KPI cards each containing a flat status pill: `S3qEc` "8 NEW · 4 PACKED" (amber, radius 99, no rotation) on Orders Today (`llXvr`); `hyf45` "+14% vs last month" (green, with `trending-up` icon) on Revenue MTD (`SRu3d`); `fegTX` "3 LOW STOCK" (red) on Active Listings (`zPb5w`); `DzmUa` "RELEASES FRI · 2 MAY" (white-on-ink with `hourglass` icon) on Payout Pending (`WQpuM`, the only inverse `ink` card). | NEW_ELEMENT_ON_EXISTING_SCREEN (entire dashboard is essentially new content) | `/vendor/dashboard` |
| `VqlnC` `Recent orders` (`ZZ3MV`) — 5-row order list. Per-row pill at right end: r1 amber NEW (`vNa9k`), r2 amber NEW (`DU4u6`), r3 neutral PACKED (`EuIne`, white fill, ink stroke), r4 green DELIVERED (`TmyyK`), r5 green DELIVERED (`SOfwa`). Pill style: cornerRadius 99, 1px stroke, padding [2,8], no rotation. | NEW_ELEMENT_ON_EXISTING_SCREEN | `/vendor/dashboard` |
| `L95K24` Vendor · Dashboard · Mobile — `KPI grid` (`yO8lw`) 2×2 of cards `k1`/`k2`/`k3`/`k4` (k4 inverse ink) with the same pills as desktop | NEW_ELEMENT_ON_EXISTING_SCREEN | `/vendor/dashboard` (mobile) |
| `L95K24` `Recent orders` (`fwZko`) — mini list `o1` amber NEW pill (`zfBou`), `o2` amber NEW pill (`v0Ejc`), `o3` neutral PACKED pill (`CUNrI`); pill mono fontSize 8, padding [2,7] | NEW_ELEMENT_ON_EXISTING_SCREEN | `/vendor/dashboard` (mobile) |
| `EYc0L` Buyer · Account drawer · Desktop — `drDStmpRow` (`xU3yX`) inside user card `drDUC`: rotated stamp `H5poUJ` content "VERIFIED" (green, rotation `+1°`) + adjacent caption "Member since Mar 2024" | NEW_ELEMENT_ON_EXISTING_SCREEN (drawer is a new UI pattern per 02-design-inventory §6; the feature contributes the user-trust stamp) | NEW (overlay, triggered from `/profile` per Q3 of 02-design-inventory) |
| `EYc0L` mobile counterpart `q732Y` — `m3StRow` (`T4jd1h`) with stamp `KCP4E` "VERIFIED" (green) + "Member since Mar 2024" caption | NEW_ELEMENT_ON_EXISTING_SCREEN | NEW (full-screen mobile sheet over current page per Q3) |
| `q732Y` Nav row `m3n1` — Orders nav row carries flat amber pill `m3n1B` (`UAXUb`) showing the integer "3" (count of in-transit orders), styled with the amber stamp palette | ICON_OR_BADGE (numeric count badge using stamp palette) | NEW (inside the new account sheet) |

---

## 3. Data model implications

**No new tables, columns, or migrations are strictly required for the
visual feature.** The mapping decided in Q9 of 02-design-inventory says
the stamp labels are display-only mappings of existing
`sub_orders.status` (`pending` / `packed` / `handed_to_courier` /
`delivered` / `cancelled` — see `packages/database/src/schema/sub-orders.ts`).
However the design surfaces five distinct user-visible labels —
DELIVERED, OUT FOR DELIVERY, AT MNP HUB, PACKED, DELAYED, CANCELLED —
and the dashboard introduces NEW. That's six display labels for five
DB states; resolution lives in §7 (open Q1 / Q2). No new endpoint is
required for stamps themselves.

What the **surrounding** order surfaces *do* need (and what the stamps
ride on top of):

- **Buyer order list & cards** (`oo1`–`oo5`, `moo1`–`moo4`): each card
  shows order ID, placed date, total, **weight** (`42.8 kg` etc.),
  item-count, item-thumbnails, and 1–4 metadata icon rows. The
  existing `GET /api/retailer/orders` returns order rows but I have
  not verified that it returns weight, item-thumbnails, and
  per-item metadata at this read depth. (inferred — see Q3.)
- **Buyer Orders Mobile filter tab counts** ("In transit · 3",
  "Delivered · 19"): need an aggregate count by display-status. The
  current API returns the list; counts would be derived client-side or
  added to the response. (inferred — see Q4.)
- **Vendor `Status segments`** (8 NEW · 14 PACKED · 286 DISPATCHED ·
  COMPLETED): aggregate counts of vendor's sub-orders grouped by
  display-status. The current `GET /api/vendor/orders` returns the
  list; an aggregate is not currently exposed. (inferred — see Q5.)
- **Vendor Dashboard KPI tile** "8 NEW · 4 PACKED" combines two
  display-status counts in one pill. Same data dependency as the
  Status segments above.
- **Vendor Dashboard "Recent orders"** with a per-row stamp/pill: the
  existing `GET /api/vendor/orders` is the obvious data source, but
  there's no `?limit=5` / `?recent=true` parameter today. (inferred —
  see Q6.)
- **Account drawer "VERIFIED" stamp** (Q7): the current
  `user.phoneNumberVerified` boolean (in `packages/database/src/schema/auth.ts`)
  is the most likely backing field, but the visual semantics ("verified
  buyer", "verified retailer", "trusted account") are not specified.

---

## 4. State & ownership

Stamps themselves are a **purely presentational** concern — the
`<Stamp>` primitive (`packages/ui/src/components/stamp.tsx`,
documented in `04-design-system-implementation-log.md` §
`stamp.tsx (NEW)`) is already in the design system with five intent
variants (`success | info | neutral | warning | critical`). No store,
context, or query state is owned by the stamp itself.

State that the stamp *consumes* lives wherever the parent surface
already manages it:

- **Buyer order list**: `useRetailerOrdersQuery` →
  `apps/web/src/modules/retailer/retailer-orders/...` (React Query).
  Display-status mapping should live alongside the order-card view
  (e.g. a `mapSubOrderStatusToStamp(status)` util colocated with the
  retailer-orders module — inferred placement matching the codebase's
  per-feature structure).
- **Vendor order list & status segments**: `useVendorOrdersQuery` and
  `useUpdateSubOrderStatusMutation` already exist
  (`apps/web/src/modules/vendor/vendor-orders/...`). The "Packed ✓"
  giant CTA on Vendor Orders cards is the existing status mutation;
  the stamp on the card header reflects the current
  `sub_orders.status`.
- **Vendor dashboard**: no module today
  (`apps/web/src/app/vendor/dashboard/page.tsx` is a placeholder).
  When this is built, KPI counts and recent-orders both belong in a
  `vendor-dashboard` module mirroring the other vendor sub-modules.
- **Account drawer / sheet**: per Q3 of 02-design-inventory the drawer
  lives on `/profile`. State (open/closed) would naturally live in the
  existing `modal-store.ts` (Zustand) under `apps/web/src/modules/core/stores/`.
  The "VERIFIED" stamp's underlying boolean (Q7 above) is read from
  the better-auth session.

No new global context or query-key namespace is implied solely by the
stamp visual — any extra aggregate endpoints (counts) would extend the
existing retailer/vendor query-key files.

---

## 5. Auth & permissions

| Surface | Auth required? | Role |
|---|---|---|
| Buyer Orders (`/profile/orders`) | Yes (middleware-gated `/profile/*`) | any authed user (`retailer` default role) |
| Buyer Reorder (NEW screen) | Yes (inferred — same `/profile/*` gate; Q3 of 02-design-inventory says reorder = order-detail) | `retailer` |
| Account drawer / sheet | Yes (inferred — drawer shows authed user data; trigger lives at `/profile`) | any authed user |
| Vendor Orders (`/vendor/orders`) | Yes (middleware-gated `/vendor/*`) | `vendor` |
| Vendor Dashboard (`/vendor/dashboard`) | Yes | `vendor` |
| Vendor topbar VENDOR badge | Yes | `vendor` (badge appears only inside the vendor shell) |

Within each surface, **the same buyer cannot see another buyer's
orders, and the same vendor cannot see another vendor's orders** —
existing API handlers already filter by session userId / vendorId
(`/api/retailer/orders`, `/api/vendor/orders`). The stamp itself does
not introduce new permission boundaries.

Ambiguity:
- "VERIFIED" on the buyer account stamp — whether this means
  phone-verified, KYC'd retailer, or a future trust tier — is not
  specified. (Q7.)
- The dashboard "Recent orders" list's per-row stamp implies a vendor
  can see across all their buyers' display-statuses; that matches the
  existing vendor scoping. No additional gating implied.

---

## 6. Build order recommendation

The stamp **primitive** already exists (`@repo/ui` `Stamp`), so this
feature is mostly about wiring it into surfaces. Suggested order:

1. **Display-status mapping util.** Add
   `mapSubOrderStatusToStamp(status)` (or analogous helper) in a
   shared spot (e.g. `apps/web/src/modules/orders/utils/` — folder
   does not exist yet) that returns `{ label, variant }`. Single
   place to settle the 6-label-vs-5-state mapping (Q1/Q2). No backend
   change.
2. **Buyer Orders list cards (`/profile/orders`).** Highest reuse:
   the same card style appears 5× on desktop and 4× on mobile, plus
   the `OrderCard` lives in `modules/retailer/retailer-orders/`. Wiring
   the stamp into the existing `OrderCard` is also the best smoke test
   for the mapping util.
3. **Buyer Orders filter tabs + counts** (mobile especially) — needs
   the count question (Q4) resolved or a client-side grouping.
4. **Buyer Reorder screen header eyebrow.** This is a NEW screen;
   the eyebrow is presentational only (mono + green-700 plain text)
   and depends on the order-detail data already fetched.
5. **Vendor Orders cards (`/vendor/orders`).** Re-use the same
   mapping util; the existing card already receives `sub_orders.status`.
6. **Vendor Orders Status segments band.** Needs the aggregate-count
   question (Q5) resolved before this can render real numbers.
7. **Vendor Dashboard KPI tiles + Recent orders.** Whole screen is
   essentially new; build on top of the new aggregate endpoint(s)
   from step 6 and a `?recent=N` extension or client-side slice (Q6).
8. **Account drawer / sheet "VERIFIED" stamp.** Depends on Q7
   resolution; otherwise trivial.
9. **Topbar VENDOR badge.** Lowest risk — single static badge in the
   admin/vendor layout shell; no data dependency.

Schema/API steps come first when needed (steps 3, 6, 7); presentational
steps follow. The existing primitives (`Stamp` for rotated stamps; for
flat status pills there is no current primitive — see Q8) gate
several of these, and any new variants must be agreed before code.

---

## 7. Open questions for me

Numbered for easy reference.

1. **OUT FOR DELIVERY label — which DB state does it map to?** Buyer
   Orders Desktop `oo2` (`qs3Gr`) and Mobile `moo2` (`VyJUI`) show an
   amber **OUT FOR DELIVERY** stamp. The DB enum has
   `pending / packed / handed_to_courier / delivered / cancelled`.
   Q9 of 02-design-inventory said "display only labels". My reading:
   `handed_to_courier` displays as **AT MNP HUB** in some cards
   (`oo4`/`moo4` — both blue) but as **OUT FOR DELIVERY** in others
   (`oo2`/`moo2` — both amber). Are these two distinct display states
   that need a sub-state on `handed_to_courier` (e.g. a
   `handedAt`-vs-`outForDeliveryAt` split, or a derivation on time
   elapsed), or is one of them an inconsistency in the design?

   answer: handed_to_courier is AT MNP HUB (blue), out_for_delivery is out of scope so remove it for now.

2. **NEW label vs DB enum.** Vendor Orders cards (`vc1Stp` etc.) show
   an amber **NEW** stamp; the dashboard recent-orders uses the same
   amber NEW pill. The DB enum's first state is `pending`, not `new`.
   Confirm `pending` should display as "NEW" on vendor surfaces,
   while it should display as something else (or nothing) on buyer
   surfaces. Buyer cards never show NEW — the earliest visible buyer
   stamp is AT MNP HUB. Is `pending` invisible to the buyer until it
   becomes `handed_to_courier`?

   answer: pending is new for vendor, and for buyer it should be visible as pending.

3. **Order card metadata fields not in current API.** Each buyer
   order card shows order weight ("42.8 kg"), an item-thumbnail strip
   (6 thumbs + "+24 more" badge), a multi-line items summary
   ("Sufi Cooking Oil 5 L · Lipton …"), and three small icon-meta
   rows (`oo1MD`/`oo1MT`/`oo1MP` — content not extracted in this
   pass). The current `/api/retailer/orders` shape (per Phase 0 map)
   doesn't surface weight or thumbnails directly. Are these new
   response fields, or computed from the existing `order_items` join?
   Treat as an **adjacent** open question — outside the strict
   stamp-display feature, but the stamp lives inside this card so
   they're tied.

   answer: yes, we can compute it from the existing `order_items` join.

4. **Mobile filter-tab counts.** `gVK0c` shows tab labels with a
   trailing count badge ("Delivered · 19", "In transit · 3").
   Should counts come from a new aggregate endpoint, a client-side
   group on the existing list, or be omitted in v1?

   answer: yes, we can compute it from the existing `order_items` join.

5. **Vendor `Status segments` aggregate counts** (8 / 14 / 286).
   These appear on Vendor Orders Desktop *and* Mobile. Today
   `/api/vendor/orders` returns a list, not aggregates. New endpoint
   (e.g. `/api/vendor/orders/summary` returning grouped counts), or
   compute client-side from the full list?

   answer: yes, we can compute it from the existing `order_items` join.

6. **Vendor dashboard "Recent orders" data source.** `/api/vendor/orders`
   returns all sub-orders. Add a `?limit=5` / `?recent=N`, add a new
   `/api/vendor/dashboard` aggregate endpoint, or render via slicing
   the existing list?

   answer: yes, we can compute it from the existing `order_items` join.

7. **"VERIFIED" stamp meaning.** Account drawer (`H5poUJ` desktop,
   `KCP4E` mobile) shows a green **VERIFIED** stamp on the user card.
   What underlies it? Candidates I see in the schema: `user.phoneNumberVerified`,
   `user.emailVerified`, vendor's `vendors.isActive`, or a future KYC
   field. Picking one changes the surface's semantics — confirm.

   answer: yes, it is verified phone number.

8. **"Status pill" (radius 99, no rotation) is a separate visual
   pattern from `Stamp`.** Vendor Dashboard KPI tiles, Vendor
   Dashboard Recent Orders rows, and the mobile Account-sheet
   `Orders` nav-row count badge all use this flat-pill shape with the
   stamp palette. There is **no** showcase frame for a "status pill" in
   `05 Components`. Is this an undocumented sibling of `Stamp` (which
   should become a second primitive `<StatusPill variant=…>` or a
   `<Stamp shape="flat" />` variant), or is the design intent that
   these pills be re-derived per-screen from raw tokens?

   answer: yes, it is a separate visual pattern from `Stamp`.

9. **Status segments band on Vendor Orders is *not* a stamp.** It
   uses the stamp palette (amber/ink/green) at 1.5px stroke radius 12,
   24-padding tile size, with the same 11/700 mono eyebrow. It's
   clearly derivative of the stamp system but is a much larger
   organism. Does this belong inside the status-stamps feature scope,
   or is it its own feature ("vendor order summary tiles")?

   answer: yes, it is a separate visual pattern from `Stamp`.

10. **Reorder header eyebrow is *not* a stamp** but uses the stamp
    palette (green-700 mono 11/700, letter-spacing 0.16, no rotation,
    no border, no fill). Same applies to the Vendor Orders Mobile
    "TODAY · 24 APRIL" eyebrow (amber palette) and Vendor Dashboard
    Mobile "MONDAY · 28 APRIL" eyebrow. Are these in scope for this
    feature, or are they a separate "colored eyebrow" pattern that
    just happens to share colors?

    answer: yes, it is a separate visual pattern from `Stamp`.

11. **Stamp rotation: showcase says `-1°`, screens use `+1°`.** The
    `05 Components → STAMPS` row defines rotation `-1°` for all five
    variants. Every actual usage in screens (buyer order cards,
    vendor order cards, account drawer, vendor topbar VENDOR badge,
    NEW vendor stamps) uses rotation `+1°`. Is the showcase wrong,
    are usages wrong, or is the rotation intentionally per-occurrence
    (a "wobble" effect)? The current `Stamp` primitive doesn't expose
    rotation as a prop.

    answer: yes it is intentionally per-occurrence (a "wobble" effect).

12. **"DELAYED" variant has no in-screen usage in this read pass.**
    The showcase declares the amber DELAYED variant, but I did not
    encounter a card using it. (`oo2`/`moo2` use OUT FOR DELIVERY in
    amber, which is a different label.) Is DELAYED still a real state
    that should be wired up (mapped from some condition, e.g.
    "expected delivery passed without `delivered`"), or is it
    aspirational?

    answer: delayed is not a state, ignore it.

13. **Topbar VENDOR badge — is this actually part of *this* feature?**
    `f4FWd`/`xf7GX` use the rotated rubber-stamp visual (radius 3,
    1.5px stroke, padding [3,8], rotation +1°, mono 10/700) but the
    *content* is a role label, not an order status. I included it as
    ICON_OR_BADGE because it visually depends on the same primitive,
    but it could equally belong to a "role badges" feature. Which
    feature owns it?

    answer: do it as a separate feature.

14. **Mobile "Orders" nav-row count badge (account sheet).** `m3n1B`
    is a flat amber pill containing the integer "3" — a count of
    in-transit orders, sharing the amber palette of the NEW/PACKED
    pills but with no stamp label. Is this the same component as
    Q8's status pill (just numeric content), or a separate
    "count badge" primitive?

    answer: yes it is a separate visual pattern from `Stamp`.

15. **`oo1Stp`/`vc1Stp` per-card stamp positioning.** All buyer order
    cards put the stamp **inside the card header next to a chevron**;
    all vendor order cards put it **inside the card header next to
    the order ID**. Treat as one shared `OrderCardHeader` molecule
    or as two separate compositions? Either approach works; want a
    preference before implementation.

    answer: treat as one shared `OrderCardHeader` molecule.

---

(End of surface map. Stopping per task instructions.)
