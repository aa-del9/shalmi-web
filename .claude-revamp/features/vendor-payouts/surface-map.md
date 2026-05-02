# Vendor Weekly Payouts (Friday cycle + Ledger) — Surface Map

> **Phase:** Feature surface mapping (read-only design pass).
> **Date produced:** 2026-05-02
> **Pencil source:** `Pencil-Design\Shalmi`
> **Pairs with:** `01-codebase-map.md`, `02-design-inventory.md`,
> `04-design-system-implementation-log.md`.

This artifact maps **what the Pencil designs already show** for the
Vendor Weekly Payouts feature. It does not propose code, copy, or
behavior. Every inferred fact is marked "(inferred)" and re-surfaced
in §7.

---

## 1. Feature summary

The Vendor Weekly Payouts feature is the surface the vendor uses to see
**what they have earned this week, when it pays out, where it pays to,
and what was paid before**. The cycle is a **Friday-anchored weekly
payout** — the ledger header eyebrow says "FRIDAY PAYOUTS · WEEKLY"
(`mH2U2`) and the descriptor reads "Your earnings, paid every Friday
for orders the buyer kept (returns and MNP fees deducted)." (`jXw3D`).
The payout amount is **net** — the breakdown card explicitly subtracts
"− Returns (3 orders)" and "− MNP delivery fees" from "Gross sales" to
arrive at "Net payout" (`I3v4Q`).

Ahead of the cycle, the vendor sees their pending payout on the
**Vendor Dashboard** in two places: an inverse-ink KPI tile
(`PAYOUT · PENDING ₨ 1,12,500 · RELEASES FRI · 2 MAY`, `WQpuM`/`RxFa7`)
and a paper-2 callout at the bottom of the dashboard ("Releases
Friday, 2 May to your registered Allied Bank account ending 4291."
with a `View ledger` button, `h73sFW`/`v68Kvy`). The dedicated
**Vendor · Ledger** screen (desktop `S8BU3J`, mobile `u5iGd`) is the
deep-dive: a hero "Next payout" card with countdown + statement
download, a per-week breakdown, the registered bank info (with
edit affordance + payout policy notes), and an 8-week payout history
table with per-row TXN IDs and paid/pending status stamps. A `Ledger`
nav entry in the vendor sidebar (`Q7yOq`) and the mobile bottom-tab
bar (`FZALK`) routes to that screen.

The feature is vendor-only chrome — it appears nowhere outside the
Vendor app shell **(inferred — admin/buyer screens were not traversed
exhaustively for payout content this pass)**.

---

## 2. Touchpoint inventory

Each row is a place this feature appears in Pencil. Frame IDs are the
Pencil node IDs so they can be re-opened via `pencil:batch_get`.
`existing_screen?` reflects whether the *screen* (not the touchpoint)
already exists in code per `02-design-inventory.md` §5.

| pencil_location | touchpoint_type | existing_screen? |
|---|---|---|
| Vendor · Dashboard · Desktop (`VqlnC`) → `KPI row` (`JS8se`) → `k4` (`WQpuM`) — inverse-ink tile "PAYOUT · PENDING / ₨ 1,12,500 / RELEASES FRI · 2 MAY" with hourglass icon | `NEW_ELEMENT_ON_EXISTING_SCREEN` | Yes (`/vendor/dashboard`) — but current page is a placeholder, per `01-codebase-map.md` Open Q5 |
| Vendor · Dashboard · Desktop (`VqlnC`) → `Payouts callout` (`h73sFW`) — paper-2 banner with banknote icon (paper-3 round, 48px), title "Next payout · ₨ 1,12,500", body "Releases Friday, 2 May to your registered Allied Bank account ending 4291.", and `View ledger` outline button (`j36hK`) | `NEW_ELEMENT_ON_EXISTING_SCREEN` | Yes (`/vendor/dashboard`) |
| Vendor · Dashboard · Mobile (`L95K24`) → `KPI grid` (`yO8lw`) → `k4` (`RxFa7`) — inverse-ink tile "PAYOUT PENDING / ₨ 1,12,500 / RELEASES FRI · 2 MAY" | `NEW_ELEMENT_ON_EXISTING_SCREEN` | Yes (`/vendor/dashboard`) |
| Vendor · Dashboard · Mobile (`L95K24`) → `Payouts wrap` (`d0c2DA`) → `po` (`v68Kvy`) — paper-2 callout, banknote icon (paper-3 round, 40px), "Next payout / ₨ 1,12,500", body copy, full-width `View ledger` button (`loPiC`) | `NEW_ELEMENT_ON_EXISTING_SCREEN` | Yes (`/vendor/dashboard`) |
| Vendor sidebar (in `VqlnC` / `H7jii` / `jXwqE`) → `Sidebar` (`O3kVa`) → section `OPERATIONS` → `n4` (`Q7yOq`) — "Ledger" nav row, lucide `book-open` icon, sans 14/600 | `NAV_ENTRY_POINT` | Vendor sidebar exists; `Ledger` nav row is **new** |
| Vendor mobile bottom tab bar (in `L95K24` / `tXG16` / `EEK8K`) → `Tab bar` (`vJBmE`) → `tb4` (`FZALK`) — "Ledger" tab, lucide `book-open` icon, sans 10/700 (active state in ledger context, ink-3 inactive on dashboard) | `NAV_ENTRY_POINT` | Tab bar is itself **new** per `02-design-inventory.md` §3.9; the Ledger tab is one of its 5 entries |
| Vendor sidebar in Ledger context (`S8BU3J → Sidebar` `bM6JG`) → `ldsn4` (`AaIcY`) — Ledger row in active state (paper-2 fill) | `MODIFIED_ELEMENT_ON_EXISTING_SCREEN` (active-state of the same nav entry above) | — |
| **Vendor · Ledger · Desktop** (`S8BU3J`) — full screen | `NEW_SCREEN` | No — `ABSOLUTE_ROUTES.VENDOR_LEDGER` constant exists but no `app/vendor/ledger/page.tsx` file (`01-codebase-map.md` Open Q9) |
| Vendor · Ledger · Desktop → `ldHd` (`c3aeuZ`) — header: green-700 mono eyebrow "FRIDAY PAYOUTS · WEEKLY", title "Ledger" sans 36/800, descriptor "Your earnings, paid every Friday for orders the buyer kept (returns and MNP fees deducted)." | (component of NEW_SCREEN) | — |
| Vendor · Ledger · Desktop → `Next payout` (`TUZmG`) — ink card, radius 16, padding [32,40]. Left (`ldNL`/`e9jLg`): green-200 mono eyebrow "NEXT PAYOUT · FRIDAY 26 APRIL 2026", "Rs. 2,84,720" mono 64/800, white-70% sans 14 "Net of Rs. 12,400 returns and Rs. 8,640 MNP delivery fees". Right (`ldNR`/`E48AG`, 280w): countdown sub-card `ldNRTimer` (`ljWJc`, FFFFFF14 fill, FFFFFF33 1px stroke, radius 12) — "PAYS IN" eyebrow + `2 days` mono 48/800. Below it: `ldNRBtn` (`Ekad4`, green-2 fill, radius 8, file-text icon) "Download statement" sans 14/700 | (component of NEW_SCREEN) | — |
| Vendor · Ledger · Desktop → `ldRow` (`a5ZC5`) → **Breakdown** (`I3v4Q`) — paper-2 card, radius 12, 1.5px rule-2 stroke, padding 24. Centered eyebrow "THIS WEEK · 22–26 APRIL". Rows: `Completed orders (no return) → 42`, `Items packed → 284`, `Weight shipped → 512.4 kg`, hairline, `Gross sales → Rs. 3,05,760`, `− Returns (3 orders) → − Rs. 12,400` (red), `− MNP delivery fees → − Rs. 8,640` (red), 1.5px ink bottom rule, **`Net payout → Rs. 2,84,720`** (mono 18/800, value in green-700) | (component of NEW_SCREEN) | — |
| Vendor · Ledger · Desktop → `ldRow` → **Bank info** (`xng62`) — white card, radius 12, padding 24. "PAYS TO YOUR ACCOUNT" mono eyebrow. `ldBankRow` (`q2VkN`): paper-2 round 48 icon container (`ldBIc`/`P6CPQ`), text `ldBL` "Meezan Bank · Saleem Bhai" sans 14/700 + "PK24 MEZN •••• •••• 4291" mono 12, then a lucide `pencil` 18px ink-3 affordance (`XhgUz`). Hairline. `ldBkInfo` 3-row info list: calendar "Payouts every Friday", clock-fading "7-day return window before completion", life-buoy "Disputes? Call admin: 0300-SHALMI" | (component of NEW_SCREEN) | — |
| Vendor · Ledger · Desktop → **History card** (`SVyJR`) — white card, radius 12, 1px rule. Header `ldHistHd` (paper-2, 1.5px rule-2 bottom): title "Payout history" sans 18/700 + subtitle "Last 8 weeks · download PDF anytime" sans 13 ink-3, plus right-side `ldHistDl` outline button "Export all" with download icon. Column header row `ldHistCols` (paper-2): WEEK · PAID ON · COMPLETED · NET PAYOUT · TXN ID · STATUS (mono 11/700). 7 data rows (`ldHr1`–`ldHr7`); first row is current week (amber-bg fill, "pending" TXN, amber-bordered stamp at rotation 1°), the rest are paid (white fill, real TXN id e.g. `TXN-09287140`, green-bordered stamp). Footer `ldFt` (paper-2, hairline top): "Lifetime: Rs. 84,12,400 across 218 weeks" + "View older weeks" link | (component of NEW_SCREEN) | — |
| **Vendor · Ledger · Mobile** (`u5iGd`) — full screen | `NEW_SCREEN` | No — same as desktop above |
| Vendor · Ledger · Mobile → App bar (`Z6gtB`) — ink, menu icon left, title "Ledger" sans 16/700, bell + green-2 avatar right | (component of NEW_SCREEN) | — |
| Vendor · Ledger · Mobile → `Next payout` (`TDgju`) — ink card, radius 14, padding [24,20]. Green-200 mono eyebrow "NEXT PAYOUT · FRIDAY 26 APR", "Rs. 2,84,720" mono 42/800, "Pays in 2 days · 42 completed orders" sans 13 white-70%, `mlNBtn` (`IJ5ub`, green-2 full-width) "Download statement" with file-text icon | (component of NEW_SCREEN) | — |
| Vendor · Ledger · Mobile → **Breakdown** (`eIslg`) — paper-2 radius 12, padding 18. Eyebrow "THIS WEEK · 22–26 APR". Rows: `Completed orders → 42`, `Gross sales → Rs. 3,05,760`, `− Returns (3) → − Rs. 12,400` (red), `− MNP fees → − Rs. 8,640` (red), 1.5px ink bottom rule, `Net payout → Rs. 2,84,720` (mono 16/800, value in green-700). **Note:** mobile breakdown drops the `Items packed` and `Weight shipped` rows that desktop has, and uses the shorter labels "Returns (3)" / "MNP fees" (inferred — different label density at smaller width) | (component of NEW_SCREEN) | — |
| Vendor · Ledger · Mobile → **Bank info** (`z8M5h2`) — white radius 12, padding 16. "PAYS TO YOUR ACCOUNT" eyebrow. Row: paper-2 round 44 lucide `landmark` icon (`Q2kCgC`), "Meezan Bank · Saleem Bhai" sans 13/700, "PK24 MEZN •••• 4291" mono 11 (one fewer dot-group than desktop — inferred truncation, see §7), `pencil` 16px edit affordance. **Note:** mobile bank card drops the 3-row policy info list that the desktop card has | (component of NEW_SCREEN) | — |
| Vendor · Ledger · Mobile → `mlHistTitle` (`JTI9D`) + History list (`j0xdc`) — title row with "Export all" link; below it 6 history cards (`mlHr1`–`mlHr6`). Each card: top row with title (`mlHr1L`, contents truncated in this read pass) + rotated status stamp; bottom row "X completed" mono 12 / "Rs. X,XX,XXX" mono 18/800. `mlHr1` is amber-bg/amber-stroke (current pending week); `mlHr2`–`mlHr6` are white/rule-stroke with green-bordered "paid" stamps | (component of NEW_SCREEN) | — |
| Vendor · Ledger · Mobile → `mlLife` (`CM1YL`) — paper-2 pill-card, radius 8, padding [12,14]. Trophy icon ink-2 16px + two-line text "Lifetime: Rs. 84,12,400" mono 13/700 over "Across 218 weeks of payouts" sans 11 ink-3 | (component of NEW_SCREEN) | — |

The feature has **no** `ICON_OR_BADGE` touchpoints in this pass.

---

## 3. Data model implications

Anchored to `01-codebase-map.md` §5. The DB already has groundwork —
the surface needs derivation, not invention.

### Schema that already exists

- **`vendor_ledger`** (`packages/database/src/schema/vendor-ledger.ts`) —
  rows tagged with `direction: credit/debit` and `type:
  sale_revenue | logistics_reimbursement | payout | penalty`, plus
  `amount`, `referenceId`, `description`, `createdAt`. The breakdown
  card's "Gross sales", "Returns", "MNP delivery fees", and "Net
  payout" lines map onto this enum (`sale_revenue`,
  inferred → `penalty`/return-credit, `logistics_reimbursement`,
  `payout`) — though no `return` type exists in the enum (see §7 Q4).
- **`vendors`** (`packages/database/src/schema/vendors.ts`) — already
  has `bankName`, `accountTitle`, `iban`. The desktop bank-info card
  reads "Meezan Bank · Saleem Bhai" + "PK24 MEZN •••• •••• 4291"
  which maps onto `bankName + accountTitle` and a masked `iban`
  (inferred — design only shows the rendered string, not the field
  source).
- **`sub_orders`** (`packages/database/src/schema/sub-orders.ts`) —
  already has `weightGrams` and COD/payout/cost breakdown ints, plus
  `status` enum including `delivered`. The breakdown's "Completed
  orders (no return) 42", "Items packed 284", and "Weight shipped
  512.4 kg" can be aggregated from `sub_orders` rows whose `status =
  delivered` and that fall inside the Friday-anchored week window
  **(inferred derivation — design just shows the aggregate values)**.
- **`orders`** + **`order_items`** — referenced by sub-orders for the
  per-item totals.

### Schema gaps the design implies

- **A "payout cycle" / "payout run" record.** The history table shows
  one row per past Friday with a `TXN ID` (e.g. `TXN-09287140`), a
  `paid on` date, a `net payout` amount, and a paid/pending stamp.
  The current `vendor_ledger` table has individual ledger lines but
  has no concept of a *paid bundle*. To render this table, the system
  needs either:
  (a) a new `payout_runs` (or `vendor_payouts`) table with
  `(id, vendorId, weekStart, weekEnd, paidOn, completedOrders,
  itemsPacked, weightGrams, grossSalesCents, returnsCents,
  mnpFeesCents, netPayoutCents, txnId, status: pending|paid|failed,
  createdAt, updatedAt)`, **or**
  (b) a server-side aggregation over `vendor_ledger` keyed by week,
  with the `txnId` stored elsewhere.
  Option (a) is closer to what the design draws (one row = one run,
  with a stable TXN id), but the design alone cannot decide. (See §7
  Q1.)
- **`txnId` field for paid runs.** Whatever shape the run record
  takes, it needs a transactional reference string. No such column
  exists today.
- **Status enum for a payout run.** Design draws two states:
  pending (current week, amber-bg row, amber-bordered stamp) and
  **paid** (green-bordered stamp). A `failed` / `held` state is not
  drawn but is implied by the `Disputes? Call admin: 0300-SHALMI` row
  and by the absence of any "retry" affordance (inferred — see §7 Q9).
- **"Returns" classification.** The breakdown explicitly subtracts
  "Returns (3 orders)" — this is a separate count from "Completed
  orders (no return)". The current `sub_orders.status` enum is
  `pending / packed / handed_to_courier / delivered / cancelled` —
  there is no `returned` status. Either `cancelled` is being
  re-labeled as "returns" in the breakdown (inferred mapping),
  or the system needs a `returned` status (or a separate returns
  table). See §7 Q4.
- **"7-day return window before completion"** policy copy
  (`jx0iQ`). Implies a server-side rule: a `delivered` sub-order is
  not eligible for payout-inclusion until 7 days have elapsed. No
  field today encodes this — `sub_orders.handedAt` exists but no
  `eligibleForPayoutAt` / `completedAt` field.
- **MNP delivery fee per sub-order.** The breakdown deducts `Rs.
  8,640` total. `sub_orders` already has cost-breakdown ints (per
  `01-codebase-map.md` §5) — verify which column carries the MNP
  fee specifically. (Inferred — column inspection deferred.)

### API endpoints implied

Nothing exists today for the vendor side of payouts. The design
implies at least:

- `GET /api/vendor/payouts/next` — returns the active (pending)
  weekly run for the signed-in vendor, with the breakdown numbers
  shown on the ledger hero + breakdown card and on the dashboard KPI
  + callout. (inferred shape.)
- `GET /api/vendor/payouts` — paginated list of past runs for the
  history table (design shows 7 rows, header says "Last 8 weeks",
  footer says "View older weeks" and "Lifetime: Rs. 84,12,400 across
  218 weeks", which implies the endpoint supports pagination /
  range filters). (inferred.)
- `GET /api/vendor/payouts/[id]/statement.pdf` — implied by both the
  desktop "Download statement" button on the Next-payout card and the
  ledger header "download PDF anytime" subtitle, plus the `Export
  all` button. (inferred — design draws a statement-download
  affordance but does not specify per-run vs. all-time.)
- `PATCH /api/vendor/me/bank` (or similar) — implied by the pencil
  edit icon on the Bank info card on both desktop and mobile.
  Existing admin path `PATCH /api/admin/vendors/[id]` already updates
  vendor records (incl. bank fields); this would be the vendor-side
  self-edit equivalent. (inferred — design only shows an edit
  affordance, not a flow; could also be modal/inline.)

### Endpoints that exist and are reusable

- The `vendor_ledger` table already exists; if the implementation
  goes route (b) (aggregation), it can be queried directly from the
  new endpoints.

---

## 4. State & ownership

- **Server state.** Both the dashboard summary (`PAYOUT · PENDING`
  tile + Payouts callout) and the ledger screen are read-mostly,
  per-vendor data. They fit the existing **React Query** pattern used
  by other vendor surfaces (`useVendorOrdersQuery`,
  `useVendorProductsQuery`). New hooks would live under
  `apps/web/src/modules/vendor/vendor-ledger/hooks/`:
  - `useVendorNextPayoutQuery` (consumed by both dashboard and
    ledger hero)
  - `useVendorPayoutsHistoryQuery` (consumed by ledger history
    card; supports pagination)
  - Possibly `useVendorBankQuery` if bank info isn't already part
    of the vendor session payload (see §7 Q5).
- **No new global / context store is required by the design.** The
  dashboard tiles and the ledger screen each read independently;
  there is no shared client state implied (no filters, no selection,
  no cross-screen sync drawn).
- **Module placement** mirrors the existing
  `modules/vendor/vendor-orders/` pattern: a feature folder with
  `components/`, `hooks/`, `query-keys.ts`, `types.ts`, plus a
  page-level `index.tsx` that the route file imports. The dashboard
  KPI tile + callout are smaller pieces — they fit either in
  `modules/vendor/vendor-dashboard/components/` (alongside the other
  KPI tiles) or in `vendor-ledger/components/` and re-imported
  cross-feature; the design draws them at parity with the other
  dashboard tiles, so co-location with dashboard is a reasonable
  default. (inferred.)
- **Mutations.** The bank-edit pencil affordance, if implemented as a
  React Query mutation against `PATCH /api/vendor/me/bank`, fits the
  existing mutation pattern used by `useUpdateVendorMutation` on the
  admin side. Statement download is a plain `<a href=…>` link — no
  client state.
- **Server-side authoritative payout math.** The ledger's "Net
  payout" is computed by the server (it must agree with the actual
  bank transfer). The route handlers must not trust client-side
  math — same pattern as the existing `POST /api/checkout` shipping
  math (which is the only existing point that has a similar
  authority requirement).

---

## 5. Auth & permissions

- **Vendor-only.** Both the dashboard tiles and the ledger screen
  appear inside the Vendor app shell (`top bar` says "Vendor" badge,
  sidebar/tab bar are the vendor variants). Access is gated by the
  existing `middleware.ts` (`/vendor/:path*` requires
  `role === 'vendor'`).
- **Vendor-scoped data.** Every value drawn (next payout,
  breakdown, bank info, history) is the signed-in vendor's own. No
  cross-vendor or aggregate views are drawn.
- **No admin or buyer surface for this feature** is drawn anywhere
  in this pass. (inferred completeness — admin screens were not
  re-traversed for payout-management content; admin payout actions,
  if any, are unspecified by the designs reviewed here.)
- **The bank-edit pencil affordance has no permission state drawn**
  — there's no read-only variant or "request change" flow. This
  matters because allowing a vendor to self-edit their own payout
  account is a security-sensitive change. (See §7 Q5.)
- **Statement download** is presented as if always available; no
  auth/eligibility checks are drawn.
- **No empty / loading / error states** are drawn on either screen
  (no "no payouts yet" frame, no "bank not configured" frame, no
  "this week has zero completed orders" frame). See §7 Q9.

---

## 6. Build order recommendation

Recommended order with brief justification:

1. **Schema decision and migration** — resolve §7 Q1 (run table vs.
   aggregation) and §7 Q4 (returns mapping) and add columns /
   tables. Without this, every consumer ships hardcoded data.
2. **Server-side payout math + pure utilities** — week-window
   boundary (Friday-anchored), 7-day return window
   eligibility filter, breakdown aggregation. These should be pure
   functions in a new `modules/vendor/vendor-ledger/utils/` (or
   server-side equivalent under `apps/web/src/app/api/vendor/...`).
   Unit-testable independently of UI.
3. **API endpoints**: `GET /api/vendor/payouts/next`, `GET
   /api/vendor/payouts`, statement-download route, and (if scope
   includes it per §7 Q5) `PATCH /api/vendor/me/bank`.
4. **Vendor · Ledger screen (`/vendor/ledger`)** — desktop and
   mobile. New route at `apps/web/src/app/vendor/ledger/page.tsx`
   plus the feature module under
   `apps/web/src/modules/vendor/vendor-ledger/`. The route already
   exists in the constants file (`ABSOLUTE_ROUTES.VENDOR_LEDGER`)
   so no constants change is needed. Build the ledger before the
   dashboard touchpoints because the dashboard CTA destination
   (`View ledger`) is meaningless without it.
5. **Sidebar + bottom-tab nav entries** — add the `Ledger` row to
   the vendor sidebar (`O3kVa` → new `n4` entry, `book-open` icon)
   and the `Ledger` tab to the mobile bottom-tab bar
   (`vJBmE` → `tb4`). These are nav-only edits to existing chrome.
6. **Vendor · Dashboard touchpoints** — the inverse-ink KPI tile
   and the paper-2 Payouts callout. These consume
   `useVendorNextPayoutQuery` (already built in step 3). They are
   small additions, but they sit on a screen
   (`/vendor/dashboard`) that is presently a placeholder per
   `01-codebase-map.md` Open Q5; sequencing depends on whether the
   dashboard revamp is happening in parallel (see §7 Q3).
7. **Empty / loading / error states** — backfill the states the
   design does not draw (see §7 Q9), once the happy path is
   wired.

Justification: schema-first because the wire shape determines every
downstream surface; pure utilities next because they are
self-testable; API-then-UI because every UI state below maps
1:1 onto an endpoint response. The ledger ships before the dashboard
touchpoints because the CTA on the dashboard depends on a
destination existing.

---

## 7. Open questions

Numbered for easy reference.

1. **Source-of-truth shape for payout history rows.** The design
   draws each row as if it has a stable identity (TXN id, paid-on
   date, net amount frozen at pay time). Should this be a new
   `payout_runs` table with denormalised totals, or computed each
   read by aggregating `vendor_ledger`? The latter is cheaper to
   ship but means historical numbers can drift if the underlying
   ledger lines are corrected. Design alone cannot answer.

2. **Friday-anchored week window** — the eyebrow says "FRIDAY
   PAYOUTS · WEEKLY" and the breakdown header says "THIS WEEK ·
   22–26 APRIL" (Mon–Fri). Is a payout week defined as
   Mon–Fri (close-of-business Friday), or Sat–Fri (full
   seven-day cycle ending Friday), or something else? The drawn
   range `22–26 April` is Mon–Fri, but `15–19 Apr`, `08–12 Apr`,
   `01–05 Apr`, `25–29 Mar`, `18–22 Mar`, `11–15 Mar` history rows
   are also Mon–Fri — so likely Mon–Fri close (inferred).
   Confirm.

3. **Dashboard data inconsistency vs ledger data.** The
   dashboard's pending tile and callout show `₨ 1,12,500 ·
   RELEASES FRI · 2 MAY`, while the ledger's hero and breakdown
   show `Rs. 2,84,720 · FRIDAY 26 APRIL`. These differ in **both
   amount and date**, and use **two different currency glyphs**
   (`₨` U+20A8 on dashboard, `Rs.` on ledger). Per
   `02-design-inventory.md` Q17 the user already chose to
   standardise to one glyph, but the *date and amount* mismatch
   is unanswered: are these supposed to be two different
   in-flight cycles (a paid-but-not-yet-cleared cycle vs. the
   currently-accruing one), or design churn between frames?

4. **`Returns` semantics in the breakdown.** The breakdown
   subtracts "− Returns (3 orders) · − Rs. 12,400". The current
   `sub_orders.status` enum has no `returned` — only `cancelled`.
   Are these:
   (a) `cancelled` sub-orders treated as returns (i.e. the
   label is presentational only),
   (b) a brand-new status / table that needs schema work, or
   (c) something handled at order-level via a refund record
   that does not exist today?

5. **Vendor self-edit of bank info.** The pencil icon on the bank
   card is drawn on both desktop and mobile but no edit flow
   (modal? inline form? dispatch to admin approval?) is drawn.
   This is also a security-sensitive change because the field
   determines where money is sent. Should the revamp implement a
   self-service edit endpoint for the vendor, or is the icon
   purely decorative and an admin-side change is required (per
   the existing `PATCH /api/admin/vendors/[id]` endpoint)?

6. **"Download statement" output.** The desktop hero and mobile
   hero both have a "Download statement" button. The history
   header subtitle says "download PDF anytime" and an `Export all`
   button is drawn. So there are at least two
   download surfaces — per-run statement and full export. What
   format(s) are expected (PDF only? PDF + CSV?), and is per-row
   download from the history table also available (no per-row
   download icon is drawn)?

7. **Dashboard KPI tile vs. callout — is one redundant?** The
   dashboard surfaces the pending payout in *two* places (KPI
   tile and full-width callout). Both repeat the amount and date
   and the callout has a `View ledger` CTA. Is this intentional
   double-surfacing, or should the callout replace the tile (or
   vice versa) in code?

8. **Bank info policy block — desktop only.** The desktop bank
   card has the 3-row info list ("Payouts every Friday",
   "7-day return window", "Disputes? Call admin: 0300-SHALMI").
   The mobile bank card omits this block entirely. Intentional
   density choice, or did the policy block get dropped on mobile
   in error? If intentional, where do these policies live on
   mobile (a tooltip on the card? a separate mobile-only screen?
   nowhere)?

9. **Empty / loading / error states are not drawn.** No frame
   shows: a brand-new vendor with zero payouts, a week with zero
   completed orders, a payout that failed/held, a bank account
   that hasn't been configured yet, a network/server error on
   the ledger screen, or a stale payout (e.g., paid but not yet
   cleared by the bank). Behavior not inferable from designs.

10. **History row click affordance.** The desktop history table's
    7 rows look tappable but no hover, focus, or click-state is
    drawn, and no per-run detail screen exists in Pencil. Mobile
    history cards likewise. Are rows interactive (open a per-run
    detail or modal), or read-only (with download driven by the
    "Export all" header button only)?

11. **Mobile breakdown drops `Items packed` and `Weight
    shipped`.** Desktop has 3 detail rows above gross sales
    (`Completed orders (no return)`, `Items packed`, `Weight
    shipped`) plus the financial rows. Mobile has only
    `Completed orders` plus the financial rows. Intentional
    information-density decision, or design churn?

12. **`mlHr1L` and other mobile history-card titles were
    abbreviated by the read pass.** Each mobile history card has
    a title node (`mlHr1L`/`mlHr2L`/etc.) that this read pass
    saw only as `"..."` because of the readDepth cap. Confirm
    the title format on mobile cards before implementation
    (likely "WW–WW MMM" mono per the desktop column, but
    inferred). Re-read with deeper readDepth if needed.

13. **`More` tab and bell icon** — out of scope per
    `02-design-inventory.md` Q19, but worth restating: the mobile
    bottom tab bar's `More` tab and the bell on the topbar are
    not wired anywhere in the payouts feature. Confirm we are
    not silently relying on either to access ledger.

14. **Sidebar item count discrepancy.** `02-design-inventory.md`
    §4.4 records "Sidebar (4 sections, 5 nav items)" for the
    vendor screens. The actual `O3kVa` sidebar I read in this
    pass shows 4 sections (`OVERVIEW / CATALOG / OPERATIONS /
    ACCOUNT`) but only **5 visible nav rows**:
    Dashboard / Products / Orders / Ledger / Settings. So the
    Ledger entry is the 4th of 5 rows, not a new addition to a
    pre-existing 5-item set. Confirm the sidebar always has
    Ledger in its drawn state (i.e. nothing is being *added*
    from a 4-row baseline) and that this matches the user's
    intent for this revamp.

15. **`Pencil-Design/Shalmi` vs `Pencil-Design/Shalmi - Copy.pen`.**
    Same caveat as `02-design-inventory.md` Q20 — confirmed
    canonical, `Shalmi - Copy.pen` ignored.

---

(End of vendor-payouts surface map. Stopping here per instructions —
no code, no implementation.)
