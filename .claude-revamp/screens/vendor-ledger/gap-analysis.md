# Vendor · Ledger — Gap Analysis

> **Phase:** Per-screen gap analysis (read-only).
> **Date produced:** 2026-05-02
> **Pencil source:** `Pencil-Design\Shalmi`
> **Pencil node IDs:** Desktop `S8BU3J`, Mobile `u5iGd`
> **Existing route:** `/vendor/ledger` (constant only — `ABSOLUTE_ROUTES.VENDOR_LEDGER`; no page file)
> **Pairs with:** `01-codebase-map.md`, `02-design-inventory.md`,
> `03-token-migration.md`, `04-design-system-implementation-log.md`,
> `screens/vendor-portal.md`,
> `features/vendor-payouts/surface-map.md`.

This document is a **screen-level** delta between the Pencil designs
for Vendor · Ledger (desktop `S8BU3J` + mobile `u5iGd`) and the
existing codebase. Per CLAUDE.md hard rules: no code is proposed; no
defaults are assumed for new fields; everything implied-but-not-drawn
or different-from-code is escalated as a numbered question in §5.

> **Note on prior answers.** The Vendor Weekly Payouts feature has a
> prior surface map at `features/vendor-payouts/surface-map.md` whose
> §7 lists 15 questions the user already answered. Many of the
> questions below restate or refine those decisions at the screen
> level. Where a prior answer applies, this doc cites it (e.g.
> "(see vendor-payouts/surface-map.md §7 Q1 — answered: new table)")
> and asks the user only to confirm the answer is still binding for
> the ledger screen specifically.

---

## 0. Confirmation of existing-code state (read-only verification)

| Surface | Status | Source |
|---|---|---|
| `apps/web/src/app/vendor/ledger/page.tsx` | **Does not exist.** No `app/vendor/ledger/**` files. | Glob `apps/web/src/app/vendor/ledger/**` → 0 files |
| `app/api/vendor/ledger/**` | **Does not exist.** | Glob → 0 files |
| `app/api/vendor/payouts/**` | **Does not exist.** | Glob → 0 files |
| `ABSOLUTE_ROUTES.VENDOR_LEDGER` constant | Exists (`'/vendor/ledger'`) | `apps/web/src/modules/core/constants/absolute-routes/index.ts:17` |
| `VENDOR_NAV_ITEMS` includes `Ledger` | Exists (label `Ledger`, href = `ABSOLUTE_ROUTES.VENDOR_LEDGER`) | `apps/web/src/modules/vendor/vendor-layout/vendor-sidebar/vendor-sidebar.constants.ts:8` |
| Sidebar `Ledger` icon mapping | Exists (`BookOpenIcon` from `lucide-react`) | `apps/web/src/modules/vendor/vendor-layout/vendor-sidebar/index.tsx:32` (matches Pencil's `book-open`) |
| `vendor_ledger` table | Exists. Columns: `id`, `vendorId`, `direction` (`credit`/`debit`), `amount`, `type` (`sale_revenue`/`logistics_reimbursement`/`payout`/`penalty`), `referenceId`, `description`, `createdAt`. | `packages/database/src/schema/vendor-ledger.ts` |
| `vendors` bank fields | `bankName`, `accountTitle`, `iban`. No `last4`, no GST, no payout-release fields. | `packages/database/src/schema/vendors.ts` |
| Vendor app shell (top bar + sidebar) | `apps/web/src/modules/vendor/vendor-layout/index.tsx` ships the current shell (white border-bottom header with "Vendor" title + `LogoutButton`, plus the existing `Sidebar` primitive). The shell already exists; the **chrome styling does not yet match Pencil's ink top bar / paper-2-active sidebar described in 02 §3.7**. | Read of `vendor-layout/index.tsx` |

**Bottom line for this screen:** every UI element on the ledger
screen below is **brand new code** (no `app/vendor/ledger/page.tsx`,
no `/api/vendor/payouts*`). The chrome (top bar + sidebar) is partly
present but visually divergent from Pencil; chrome diffs are noted
inline but are tracked as a separate vendor-shell concern, not as a
ledger-specific delta (see §5 Q-CHROME-1).

**Design system components needed by this screen — coverage check:**

| Component used in ledger | In `02-design-inventory.md` / `04-design-system-implementation-log.md`? |
|---|---|
| Card (white, `rule`, radius 8/12) | ✅ `Card` primitive retoken'd (04 §card.tsx). Note the ledger uses radius 12; `Card` defaults to radius 8 — Phase 4 may need a variant or per-instance override. |
| Card (paper-2 receipt-style, 1.5px `rule-2`) | ⚠️ Implementation log §card.tsx flagged this as a deferred variant ("Receipt-style and inverse Card variants may need to be added in Phase 4"). |
| Card (ink/inverse, radius 16, 32/40 padding) | ⚠️ Same deferred-variant note. |
| `Stamp` (intent variants) | ✅ `Stamp` primitive shipped (04 §stamp.tsx). Pencil ledger uses `success` (paid/green) and `warning` (pending/amber) intents. |
| `Button` (outline ink "Export all" / "View ledger") | ✅ `outline` variant present (04 §button.tsx). |
| `Button` (primary green "Download statement") | ✅ `default` (primary green) variant present. |
| `Button` (primary inverse / "Place order"-style) | ✅ Not used on ledger. (Open ask `Q-BUTTON-1` from 04 stays out-of-scope here.) |
| `Table` primitive | ✅ retoken'd (04 §table.tsx). Note: implementation log explicitly resisted re-styling table headers to mono-uppercase eyebrow style. The ledger history table uses **paper-2 fill on header row + mono 11/700 column labels with 0.08 letter-spacing** — see Q12. |
| `Tooltip` primitive | ❌ **NOT in design inventory and NOT in implementation log.** Mobile bank-info card relies on a tooltip for the policy block (per `vendor-payouts/surface-map.md` §7 Q8 answer: "a tooltip on the card"). See Q-DS-1. |
| `Dialog` primitive (per-run detail modal) | ✅ retoken'd (04 §dialog.tsx). Used for the history-row-click detail modal (per surface-map §7 Q10 answer: "rows are interactive and open a per-run detail modal"). The detail-modal layout itself is **not drawn in Pencil** — see Q22. |
| Sidebar nav (`paper-2` active row) | ✅ Sidebar primitive retoken'd (04 §sidebar.tsx). |
| Vendor mobile bottom tab bar | ⚠️ Listed in 02 §3.9; deferred in 04 ("organism — defer"). The Ledger tab is one of its 5 entries — out of scope for the ledger screen itself, but needed before the screen is reachable on mobile beyond direct URL. |
| Vendor mobile app bar (ink top bar) | ⚠️ Same deferred-organism note. |

---

## 1. Layout & structure

### 1.1 Desktop (`S8BU3J`, 1440 wide, `paper` page bg)

Top → bottom:

1. **`ssMqe` — Vendor desktop top bar** (chrome, ink, 60h). Same chrome as `VqlnC` / `H7jii` / `jXwqE`. Ledger does not draw a unique variant.
2. **`fHuW9` — Body** (ink-stripe-below-topbar at y=60, 1387.6h):
   1. **`bM6JG` — Sidebar** (left, 240w, white, 1px right hairline). 4 sections (`OVERVIEW` / `CATALOG` / `OPERATIONS` / `ACCOUNT`) and 5 nav rows (Dashboard / Products / Orders / **Ledger (active)** / Settings). The Ledger row (`AaIcY`) is the active state — paper-2 fill.
   2. **`l1EHZO` — Main column** (1200w, padding `[40, 48, 80, 48]`, gap derived from per-section spacing), with four blocks stacked vertically:
      1. **`c3aeuZ` — `ldHd` (Page header)** — eyebrow + title + descriptor.
      2. **`TUZmG` — `Next payout` block** — ink card, radius 16, padding `[32, 40]`, two columns (`ldNL` left fill, `ldNR` right fixed 280w).
      3. **`a5ZC5` — `ldRow` two-col** — left column `I3v4Q` (Breakdown card, paper-2) + right column `xng62` (Bank info card, white).
      4. **`SVyJR` — `History card`** — white card, radius 12, 1px `rule`. Contains a 4-row composite: header `ldHistHd` (paper-2, 1.5px rule-2 bottom) → column header row `ldHistCols` (paper-2, 1px rule bottom, mono 11/700 labels) → 7 data rows (`ldHr1`–`ldHr7`) → footer `ldFt` (paper-2, hairline top: lifetime line + "View older weeks" link).

### 1.2 Mobile (`u5iGd`, 420 wide)

Top → bottom (single scrolling column, gap derived from per-section padding):

1. **`Z6gtB` — App bar** (chrome, ink, 56h). Menu icon + "Ledger" title (sans 16/700) + bell + avatar.
2. **`C6edO` — Scroll body** (gap inherited from per-section spacing):
   1. **`TDgju` — `Next payout`** — ink card, radius 14, padding `[24, 20]`. Eyebrow + Rs. amount (mono 42/800) + descriptor + full-width `IJ5ub` "Download statement" button.
   2. **`eIslg` — Breakdown** — paper-2 card, radius 12, padding 18. Eyebrow + 4 financial rows + Net payout total. **Drops `Items packed` and `Weight shipped` rows that desktop has** (intentional density choice, surface-map §7 Q11).
   3. **`z8M5h2` — Bank info** — white card, radius 12, padding 16. Eyebrow + bank row + edit pencil icon. **Omits the desktop's 3-row policy block (`ldBkInfo`); per surface-map §7 Q8, the policies are surfaced via a tooltip on the card.**
   4. **`JTI9D` — `mlHistTitle`** + **`j0xdc` — History list** — section title row "Payouts · last 8 weeks" + "Export all" link, then 6 history cards (`mlHr1`–`mlHr6`). Card 1 is amber-bg (current pending week with `PENDING` stamp); cards 2–6 are white with `PAID` stamp.
   5. **`CM1YL` — `mlLife`** — paper-2 pill-card, radius 8, padding `[12, 14]`. Trophy icon + 2-line lifetime line.

The mobile design has **no bottom tab bar drawn inside `u5iGd`** — the tab bar (`vJBmE`) is a shared chrome component referenced by other vendor mobile screens but its instance was not enumerated in this snapshot. Per `02 §3.9` and `surface-map.md` §2, the Ledger tab is one of its 5 entries.

---

## 2. Element-by-element diff

`pencil_element` columns reference Pencil node IDs where useful;
`existing_element` is the closest match in `apps/web/src/**` or
`packages/**`. Categories:

- **VISUAL_ONLY** — cosmetic difference; behavior unchanged
- **COPY_CHANGE** — wording differs from existing copy
- **NEW_FIELD** — design surfaces a value not stored anywhere today
- **REMOVED_FIELD** — codebase has data the design omits
- **NEW_INTERACTION** — design implies a click/edit/download path that doesn't exist
- **CHANGED_INTERACTION** — same affordance, different behavior
- **NEW_STATE** — design implies an empty/loading/error/edge state without rendering it
- **AMBIGUOUS** — design is internally inconsistent or under-specified

### 2.1 Chrome (top bar + sidebar) — context only; tracked separately

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| `ssMqe` Vendor desktop top bar (ink, 60h, brand cluster, dark search 320w `#FFFFFF1A` fill, bell, avatar, name + chevron) | `apps/web/src/modules/vendor/vendor-layout/index.tsx:14` — current header is white border-bottom, "Vendor" title text + `LogoutButton`. No dark search, no bell, no avatar/name. | Whole top bar visually differs. Shared across all vendor screens, not ledger-specific. | VISUAL_ONLY (chrome) — see Q-CHROME-1 |
| `bM6JG` Vendor sidebar (240w white, 4 grouped sections, paper-2 active row) | `vendor-sidebar/index.tsx` — single "Navigation" group, no section eyebrows, header reads "Shalmi Vendor". | Section grouping (`OVERVIEW` / `CATALOG` / `OPERATIONS` / `ACCOUNT`), header content, and paper-2 active styling differ. Not ledger-specific. | VISUAL_ONLY (chrome) — see Q-CHROME-1 |
| Sidebar Ledger row active state (`AaIcY`, paper-2 fill, `book-open` icon) | `VENDOR_NAV_ITEMS` includes Ledger → `BookOpenIcon` already mapped (`vendor-sidebar/index.tsx:32`). | Active visual state will resolve correctly once the page exists; nav row exists today and points to a 404 route. | (none — already implemented) |
| `Z6gtB` Vendor mobile app bar (ink, menu + "Ledger" title + bell + avatar) | (none — no mobile vendor chrome shipped; current `vendor-layout` is desktop-style only) | Mobile app bar is a deferred organism per `04 — Atoms intentionally NOT added`. | NEW_INTERACTION (chrome) — out of scope for this screen, see Q-CHROME-1 |
| Vendor mobile bottom tab bar (5 tabs incl. Ledger) | (none) | Same as above. | NEW_INTERACTION (chrome) — see Q-CHROME-1 |

### 2.2 Page header (`ldHd` / `c3aeuZ`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Eyebrow `mH2U2` "FRIDAY PAYOUTS · WEEKLY" (mono 11/700, letter-spacing 0.16, fill `green-700`) | (none — new route) | New copy and styling. | COPY_CHANGE / NEW_FIELD (display string is hardcoded copy, not a stored field) — see Q1 |
| Title `hT5Xi` "Ledger" (sans 36/800, fill `ink`) | (none) | New copy. | COPY_CHANGE — see Q1 |
| Descriptor `jXw3D` "Your earnings, paid every Friday for orders the buyer kept (returns and MNP fees deducted)." (sans 15, ink-2, width 600) | (none) | New copy. Asserts payout policy in microcopy. | COPY_CHANGE — see Q1 |

### 2.3 Next payout hero block (`TUZmG`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Container — ink fill, radius 16, padding `[32, 40]`, gap 32, two-column flex | (none) | Brand-new "inverse" surface card style; not a current `Card` variant. | (visual only — covered by Card variant gap noted in §0) |
| Left col `e9jLg` eyebrow `fTRMY` "NEXT PAYOUT · FRIDAY 26 APRIL 2026" (mono 11/700, ls 0.16, fill `green-200`) | (none) | The date string is a derived display of the **next Friday** payout date for the signed-in vendor. No `payout_release_date` column exists today on `vendors` or anywhere else. | NEW_FIELD (date is derived; whether it's stored or computed each request — see Q3) — see Q2, Q3 |
| Left col `dP9FZ` "Rs. 2,84,720" (mono 64/800, fill `white`) | (none) | The headline net-payout amount is the sum of credits in the active payout cycle minus the deductions shown below. No `vendor_payouts.netPayoutCents` or equivalent field exists. | NEW_FIELD — see Q4 |
| Left col `SwurV` "Net of Rs. 12,400 returns and Rs. 8,640 MNP delivery fees" (sans 14, fill `#FFFFFFB3`) | (none) | Same numbers as the Breakdown card; embeds derived totals into prose. | NEW_FIELD (derived) — see Q4 |
| Right col `ljWJc` `ldNRTimer` (radius 12, fill `#FFFFFF14`, 1px `#FFFFFF33` stroke, padding 18) — eyebrow `auz4G` "PAYS IN" (mono 10/700) + row `XGfNz`: number "2" (mono 48/800 white) + "days" (sans 16/600 #FFFFFFB3) | (none) | A live countdown derived from `payout_release_date − now()`. No source of truth for the release date. | NEW_FIELD + NEW_INTERACTION (live countdown re-render or tick) — see Q3, Q5 |
| Right col `Ekad4` `ldNRBtn` "Download statement" (green-2 fill, radius 8, padding `[14, 18]`, file-text icon + sans 14/700 white) | (none) | Triggers a per-run statement download. No download endpoint exists; surface-map §7 Q6 was answered "ignore it for now." Confirm whether the ledger ships with the button rendered-but-disabled, hidden, or the endpoint stubbed. | NEW_INTERACTION — see Q6 |

### 2.4 Mobile next payout hero (`TDgju`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Container — ink, radius 14, padding `[24, 20]` | (none) | Mobile-tuned variant of desktop hero. | (visual only) |
| Eyebrow `jTND9` "NEXT PAYOUT · FRIDAY 26 APR" | (none) | Shorter date string than desktop's "FRIDAY 26 APRIL 2026". | COPY_CHANGE (vs desktop equivalent) — see Q1 |
| Headline `M6Tb0D` "Rs. 2,84,720" (mono 42/800) | (none) | Same value as desktop, smaller size. | (visual only) |
| Sub `nQ3ji` "Pays in 2 days · 42 completed orders" | (none) | Mobile sub-line **combines countdown and completed-orders count**, both of which are separate fields on desktop (countdown in timer card, "42" in breakdown). | NEW_FIELD (combined display string) — see Q3, Q4 |
| Button `IJ5ub` "Download statement" (green-2 full-width 348w) | (none) | Same affordance as desktop. | NEW_INTERACTION — see Q6 |

### 2.5 Breakdown card desktop (`I3v4Q`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Container — paper-2 fill, radius 12, 1.5px `rule-2` stroke, padding 24 | (none) | Receipt-cream Card variant deferred per `04 §card.tsx`. | (visual only) |
| Eyebrow `Zb8uX` "THIS WEEK · 22–26 APRIL" (mono 11/700, ls 0.08, ink-2, centered) | (none) | The week-window label is derived from the active payout cycle's start/end dates. | NEW_FIELD (week start, week end) — see Q7 |
| Row `ldBr1` "Completed orders (no return)" → 42 | (none — derivable) | Count of `sub_orders` rows in the cycle window with `status = delivered` AND not in the return-cancellation set. Aggregation logic does not exist. | NEW_FIELD (derived count) — see Q4, Q8 |
| Row `ldBr2` "Items packed" → 284 | (none — derivable) | Count of `order_items.quantity` summed across the cycle's delivered sub-orders. | NEW_FIELD (derived count) — see Q4 |
| Row `ldBr3` "Weight shipped" → "512.4 kg" | (none — derivable from `sub_orders.weightGrams`) | Aggregate of `sub_orders.weightGrams` for the cycle's delivered orders, formatted to one decimal kg. | NEW_FIELD (derived; formatting rule) — see Q4, Q9 |
| Row `ldBr4` "Gross sales" → "Rs. 3,05,760" | (none — derivable from `vendor_ledger.amount` where `direction = credit AND type = sale_revenue`) | Sum of credit/sale_revenue ledger lines in the cycle window. | NEW_FIELD (derived) — see Q4 |
| Row `ldBr5` "− Returns (3 orders)" → "− Rs. 12,400" (red) | The current `sub_orders.status` enum has no `returned`. Per `surface-map §7 Q4` answer: `cancelled` sub-orders are treated as returns (label is presentational only). No corresponding ledger-line `type` exists either (`penalty` is the closest). | The wording "Returns" maps onto cancelled sub-orders; whether the deduction amount comes from `vendor_ledger` debits or is recomputed from cancelled sub-order totals is unspecified. | AMBIGUOUS / NEW_FIELD — see Q10 |
| Row `ldBr6` "− MNP delivery fees" → "− Rs. 8,640" (red, 1.5px ink bottom rule) | Implied to come from `vendor_ledger.type = logistics_reimbursement` debits (or a `sub_orders` cost-breakdown column). 01-codebase-map.md §5 mentions `sub_orders` "COD/payout/cost breakdown ints" but the column names were not enumerated. | The MNP fee total per cycle is derivable but the source-of-truth column is not confirmed. | NEW_FIELD (source-of-truth) — see Q11 |
| Total `ldBrTot` "Net payout" → "Rs. 2,84,720" (mono 18/800, value `green-700`) | (none) | The displayed grand total. Server-side authoritative. | NEW_FIELD — see Q4 |

### 2.6 Breakdown card mobile (`eIslg`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Container — paper-2, radius 12, padding 18 | (none) | Smaller padding than desktop (18 vs 24). | (visual only) |
| Eyebrow `X28FaX` "THIS WEEK · 22–26 APR" | (none) | Shorter week label format than desktop. | COPY_CHANGE — see Q1 |
| Mobile **omits** `Items packed` and `Weight shipped` rows | Desktop has them. | Per `surface-map §7 Q11` answered: "intentional information-density decision." | REMOVED_FIELD — see Q12 |
| Mobile uses shorter labels "Returns (3)" / "MNP fees" | Desktop uses "Returns (3 orders)" / "MNP delivery fees". | Different microcopy at smaller width. | COPY_CHANGE — see Q1 |
| Net payout total at mono 16/800 (vs 18/800 desktop) | (none) | Smaller size. | (visual only) |

### 2.7 Bank info card desktop (`xng62`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Container — white, radius 12, 1px `rule`, padding 24 | (none) | New surface. | (visual only) |
| Eyebrow `ElqR5` "PAYS TO YOUR ACCOUNT" (mono 11/700, ls 0.12, ink-3) | (none) | New copy. | COPY_CHANGE — see Q1 |
| `ldBIc` (`P6CPQ`) — paper-2 round 48px container, lucide `landmark` icon (24px, ink) | (none) | Decorative icon container. | (visual only) |
| `z7vBC` "Meezan Bank · Saleem Bhai" (sans 14/700, ink) | `vendors.bankName` + `vendors.accountTitle` exist. | Display string concatenates `bankName + " · " + accountTitle`. | (mapping only) — see Q13 |
| `t5G4wD` "PK24 MEZN •••• •••• 4291" (mono 12, ink-3) | `vendors.iban` exists. | Display masks all but the country/bank prefix and the last-4 digits. **No `last4` column** — must be derived from `iban` at render time. | NEW_FIELD (derivation rule) — see Q13 |
| `XhgUz` lucide `pencil` 18px ink-3 — edit affordance | No vendor self-edit endpoint. Admin path `PATCH /api/admin/vendors/[id]` exists but is not the same flow. Per `surface-map §7 Q5` answer: "yes implement a self-service edit endpoint for the vendor." | New self-service mutation surface. The edit flow itself (modal? inline form? dispatch to admin approval?) is **not drawn**. | NEW_INTERACTION — see Q14 |
| `ldBkInfo` 3-row policy list — calendar "Payouts every Friday" / clock-fading "7-day return window before completion" / life-buoy "Disputes? Call admin: 0300-SHALMI" | (none) | Each row is hardcoded marketing/policy copy with a Lucide icon. The phone number `0300-SHALMI` is also new. | COPY_CHANGE — see Q1, Q15 |

### 2.8 Bank info card mobile (`z8M5h2`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Container — white, radius 12, padding 16 | (none) | Smaller padding (16 vs 24). | (visual only) |
| `xJ7p8` "PK24 MEZN •••• 4291" (mono 11, ink-3) | `vendors.iban` exists. | Mobile uses **one fewer dot-group** than desktop ("•••• •••• 4291" vs "•••• 4291"). Different IBAN-mask rule. | AMBIGUOUS (which mask is canonical?) — see Q13 |
| Mobile **omits** `ldBkInfo` policy block | Desktop has 3-row policy block. | Per `surface-map §7 Q8` answered: "a tooltip on the card." | REMOVED_FIELD + NEW_INTERACTION (tooltip) — see Q16 |
| Edit pencil icon `Zoj1Y` (16px) | Same as desktop. | Smaller icon. Same NEW_INTERACTION. | NEW_INTERACTION — see Q14 |

### 2.9 History card desktop (`SVyJR`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Container — white, radius 12, 1px `rule`, vertical layout | (none) | New surface. | (visual only) |
| `ldHistHd` (paper-2, padding `[18, 24]`, 1.5px rule-2 bottom): title `PIl0J` "Payout history" (sans 18/700) + subtitle `E6Z3rT` "Last 8 weeks · download PDF anytime" (sans 13, ink-3) + button `D6CRv1` `ldHistDl` "Export all" (outline, sans 13/600, download icon) | (none) | New copy + new "Export all" affordance. Per `surface-map §7 Q6` answered: "ignore it for now." | COPY_CHANGE + NEW_INTERACTION — see Q1, Q6 |
| `ldHistCols` (paper-2, padding `[12, 24]`, 1px rule bottom): WEEK (160w) / PAID ON (130w) / COMPLETED (120w) / NET PAYOUT (160w) / TXN ID (fill) / STATUS (120w) — all mono 11/700 ink-3 ls 0.08 | `Table` primitive exists but `04 §table.tsx` explicitly resisted styling headers as mono-uppercase eyebrow. | Header styling is per-instance, not a primitive change. | VISUAL_ONLY |
| Row `ldHr1` (current week, **amber-bg fill**, padding `[14, 24]`, 1px rule bottom): `IpvtM` "22–26 Apr 2026" sans 13/700 / `HYL5z` "Fri 26 Apr" mono 13 / `O3CS5A` "42" mono 13/700 / `R3n9n` "Rs. 2,84,720" mono 14/700 / `Xixka` "pending" mono 12 ink-3 / amber-bordered stamp `O8yQas` (rotation 1°) | (none) | Pending-payout row uses a different background fill, a placeholder TXN string `"pending"`, and an `amber-bordered` stamp. Rotation is +1° vs the canonical −1° on stamps (02 §3.2). | NEW_STATE (pending row variant) — see Q17 |
| Rows `ldHr2`–`ldHr7` (white fill, 6 rows): real TXN id (e.g. `TXN-09287140` mono 12 ink-3), green-bordered "PAID" stamp (rotation 1°) | (none) | Each row corresponds to one past payout run. Confirmed in `surface-map §7 Q1` to be a **new `payout_runs` table**. The TXN id is a stable per-run identifier. | NEW_FIELD (run table) — see Q18 |
| Row click affordance | (none) | Per `surface-map §7 Q10` answered: "rows are interactive and open a per-run detail modal." Detail modal layout is **not drawn anywhere in Pencil**. | NEW_INTERACTION + NEW_STATE (detail modal contents) — see Q22 |
| `ldFt` footer (paper-2, padding `[14, 24]`, hairline top): left "Lifetime: Rs. 84,12,400 across 218 weeks" (mono 12 ink-3) + right "View older weeks" (sans 13/600, ink) | (none) | Lifetime aggregate (sum of all paid runs ever, count of weeks). "View older weeks" is a navigation/load-more affordance. | NEW_FIELD (lifetime totals) + NEW_INTERACTION (load older) — see Q19, Q20 |

### 2.10 History list mobile (`j0xdc` + `JTI9D`)

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| `JTI9D` section title row — title 128w (`aRwRw`) + "Export all" link 54w (`nbjFI`) | Desktop is an outline button; mobile is a text link only. | Visual treatment differs from desktop. | VISUAL_ONLY (subject to NEW_INTERACTION on Export all per Q6) |
| Cards `mlHr1`–`mlHr6` (94h each, gap 10) — vertical stack of two rows: `mlHrXTop` (week label + status stamp) + `mlHrXBot` (`X completed` + amount mono 18/800) | (none) | Compact card representation of the desktop table row. | (visual only) |
| `mlHr1L` title format on **pending row**: line 1 "22–26 Apr 2026" sans 14/700, line 2 "Pays Friday 26 Apr" mono 11/600 amber | (none) | Distinct two-line label for the active week. | COPY_CHANGE — see Q1 |
| `mlHr1L` title format on **paid rows** (`mlHr2`+): line 1 "15–19 Apr 2026" sans 14/700, line 2 "Paid Fri 19 Apr · TXN-09287140" mono 11/600 ink-3 | (none) | Combines paid date and TXN id on the second line of the title block. Per `surface-map §7 Q12` answered: confirmed format. | COPY_CHANGE / NEW_FIELD — see Q18 |
| Stamps: `T5laqm` PENDING (amber-bg, amber stroke, rotation 1°) and `qOM9K` PAID (green-bg, green stroke, rotation 1°). Note: `T5laqm` fill is hardcoded `#FBFAF5` (paper) instead of `$amber-bg` — minor variable-vs-hex inconsistency. | `Stamp` primitive exists with intent variants. | The hardcoded `#FBFAF5` instead of `$amber-bg` is likely an authoring slip. | AMBIGUOUS — see Q21 |
| `CM1YL` `mlLife` pill-card (paper-2, radius 8, padding `[12, 14]`, gap 16ish) — trophy icon 16px + 2-line text "Lifetime: Rs. 84,12,400" (mono 13/700) over "Across 218 weeks of payouts" (sans 11 ink-3) | (none) | Mobile equivalent of desktop `ldFt` footer; replaces the inline "View older weeks" link with no navigation affordance shown. | REMOVED_FIELD ("View older weeks" missing on mobile) — see Q20 |

### 2.11 Existing-code elements with no Pencil counterpart

These are facets of the existing data model that the design does not surface anywhere on the ledger screen.

| existing_element | pencil_element | diff_summary | category |
|---|---|---|---|
| `vendor_ledger.direction = debit, type = penalty` (rows representing vendor penalties — e.g. wrong-pack penalties) | (none drawn) | The breakdown surfaces "Returns" and "MNP delivery fees" as deductions, but there is **no row for `penalty` debits**. Either `penalty` rows are folded into another bucket, or they are never expected to occur in a ledger window, or they are hidden by design. | REMOVED_FIELD — see Q23 |
| `vendor_ledger.referenceId` (sub-order id or payout id pointer) | (none drawn) | Per-line ledger reference IDs are not exposed in the ledger UI; the only IDs surfaced are per-run `TXN ID`s on the history table. | REMOVED_FIELD — see Q24 |
| `vendor_ledger.description` text column | (none drawn) | Per-line free-form description not exposed anywhere. | REMOVED_FIELD — see Q24 |
| `vendor_ledger.type = payout` debit lines (representing the bank transfer event) | (none directly drawn) | Each paid run on the history table presumably corresponds to one or more `payout`-type ledger debits. Whether the run is sourced from the new `payout_runs` table (per surface-map §7 Q1) or from the `payout`-type ledger lines is the underlying data model question. | AMBIGUOUS (data sourcing) — see Q18 |
| `vendors.iban` full IBAN | only masked "PK24 MEZN •••• •••• 4291" rendered | Full IBAN never displayed; only used to derive the masked string. | (intentional — no question) |

---

## 3. Schema / type implications

Every NEW_FIELD or REMOVED_FIELD from §2 plus the schema-shape questions noted in `vendor-payouts/surface-map.md`. **No code is proposed**; this section catalogs what schema/API would need to exist for each field to be sourced.

### 3.1 New entity: `payout_runs` (or equivalent)

Per `surface-map §7 Q1` (answered: "yes a new table"), the history table requires a new entity that is **not a row in `vendor_ledger`**. The fields the design exposes per row are:

| Drawn field | Required column shape | Notes |
|---|---|---|
| Week label "22–26 Apr 2026" | `weekStart`, `weekEnd` (date) | Surface-map §7 Q2 answered: "whole week" — i.e. seven-day cycle ending Friday. The drawn ranges (Mon–Fri) appear to be *display-only* labels, but per the answered Q2, the *cycle* spans a full week. **Confirm display-vs-cycle decoupling** — see Q7. |
| "Paid on" date "Fri 26 Apr" | `paidOn` (date or timestamp) | Null for the active pending row. |
| "Completed" count "42" | `completedOrdersCount` (int) | Snapshotted at run-creation time. |
| "Net payout" "Rs. 2,84,720" | `netPayoutCents` (int) | Authoritative payout amount, snapshotted. |
| "TXN ID" `TXN-09287140` | `txnId` (string, nullable) | Null/`"pending"` for the active row. Format `TXN-NNNNNNNN` is implied — confirm format and length. |
| Stamp PAID / PENDING | `status` enum | Drawn states: `pending`, `paid`. Surface-map §7 Q9 answered: "implement all the empty states", which presumably includes failed/held — but **no failed/held visual is drawn**. See Q17. |
| Pending-row breakdown numbers (Returns count + amount, MNP fees, gross sales, items packed, weight shipped) | `grossSalesCents`, `returnsCents`, `returnsOrderCount`, `mnpFeesCents`, `itemsPackedCount`, `weightGrams` | Snapshotted at run-creation time so historical detail-modal can render the same breakdown. |
| Bank info at time of payout | (likely a snapshot of `vendors.bankName/accountTitle/iban` at run time) | Not explicitly drawn — but a per-run detail modal (Q22) would benefit from snapshotted bank info if the vendor's bank account changes between runs. |
| FK `vendorId` | references `vendors.id` | Standard. |
| Audit fields | `createdAt`, `updatedAt` | Standard. |

Open question: whether `payout_runs` *replaces* or *supplements* the `vendor_ledger`'s `type = payout` debits. Two valid models:
- **Supplements:** every paid run also writes a single `payout`-type debit ledger line whose `referenceId` = `payout_runs.id`. (One source of truth for the bank-transfer event; ledger remains the authority for cash flow.)
- **Replaces:** the `payout` enum value on `vendor_ledger.type` becomes unused (or `vendor_ledger` only carries the `credit` lines and `payout_runs` is the debit source).

The design alone cannot pick. See Q18.

### 3.2 Bank info — `last4` derivation

Pencil renders `"PK24 MEZN •••• •••• 4291"` (desktop) and `"PK24 MEZN •••• 4291"` (mobile) — i.e. the country/bank prefix is shown, the middle is masked, and the last four digits are exposed. `vendors.iban` is the source. Two choices:

- **Derive at render time** from `iban` (slice first 8 chars + masked groups + last 4). No schema change.
- **Store `last4` and `bankShortCode`** explicitly. Adds normalisation cost; useful only if other surfaces need them.

Per surface-map §3 (data model) the answer is "OK to derive from iban" — but the **mask format itself differs between desktop and mobile** (one fewer dot-group on mobile), which is a display rule rather than a storage rule. See Q13.

### 3.3 Payout-release date / countdown

The hero countdown ("PAYS IN · 2 days") and the dashboard's "RELEASES FRI · 2 MAY" (per `vendor-payouts/surface-map.md` §2) both require a single per-vendor "next-payout-release date." Three possible shapes:

- **Computed** from "next Friday after today, after the configured cutoff" — pure server-side rule, no column.
- **Stored** as `vendor_payouts.releasesAt` on the **active** (pending) `payout_runs` row.
- **Configurable** at the org level (e.g., `payout_cycle_settings` table) so the cycle can be changed without a code deploy.

`vendor-portal.md` Q1 already flagged `payout_release_date` as a possibly-needed column. See Q3.

### 3.4 Returns / cancellations as ledger deductions

The breakdown subtracts "− Returns (3 orders)" but `sub_orders.status` has no `returned` value. Per `surface-map §7 Q4` answered (a): cancelled sub-orders are treated as returns; the label is presentational only. This implies:

- The "3 orders" count is `count(sub_orders WHERE vendorId AND status = 'cancelled' AND fallsInCycleWindow)` (or some narrower variant — e.g., only `cancelled` after `delivered`). The exact filter is not in the design.
- The "Rs. 12,400" amount is presumably the credit reversal — i.e. a `direction = debit` ledger line tied to the cancelled sub-order. **No `return` or `cancellation` `type` value exists in the `vendor_ledger.type` enum** today. Either an existing type (e.g. `penalty`) is repurposed, a new type is added, or the amount is recomputed from cancelled sub-orders without a ledger-line backing. See Q10.

### 3.5 MNP delivery fees source

The breakdown subtracts "− MNP delivery fees · − Rs. 8,640." `vendor_ledger.type = logistics_reimbursement` is a **credit** type (rebates the vendor for shipping); this likely runs *opposite* to the design's deduction-from-gross framing. Either:

- The line is sourced from `sub_orders` cost-breakdown columns directly (per 01-codebase-map.md §5: "COD/payout/cost breakdown ints"), or
- A separate `vendor_ledger` debit line type for MNP-fee deduction is implied.

Column names in `sub_orders` were not enumerated in this read pass. See Q11.

### 3.6 Aggregations the breakdown depends on

| Breakdown row | Required aggregation |
|---|---|
| Completed orders (no return) | `count(sub_orders WHERE vendorId AND status='delivered' AND deliveredAt IN cycleWindow AND notInReturnSet)` |
| Items packed | `sum(order_items.quantity WHERE subOrder IN delivered set above)` |
| Weight shipped | `sum(sub_orders.weightGrams WHERE in delivered set above) → kg with one decimal` |
| Gross sales | `sum(vendor_ledger.amount WHERE direction='credit' AND type='sale_revenue' AND createdAt IN cycleWindow)` |
| Returns | `count(...)` and `sum(amount)` for the cancelled-as-return set — see §3.4 |
| MNP delivery fees | `sum(...)` — see §3.5 |
| Net payout | Server-authoritative grand total — must equal cross-check of `gross − returns − mnp` |

Each aggregation needs a server endpoint or precomputed snapshot (the `payout_runs` row carries the snapshot for historical weeks; the active week recomputes on demand). No such endpoint exists today.

### 3.7 Lifetime totals

Footer reads "Lifetime: Rs. 84,12,400 across 218 weeks." Two derivations:

- `sum(payout_runs.netPayoutCents WHERE vendorId AND status='paid')` and `count(payout_runs WHERE … status='paid')`.
- Alternatively, `sum(vendor_ledger.amount WHERE direction='debit' AND type='payout')` for the cash-flow figure, and a separate count of weeks elapsed.

Whichever is canonical, both fields are derived and need an endpoint. See Q19.

### 3.8 API endpoints implied

(Restated from `vendor-payouts/surface-map.md` §3 for completeness.) Nothing exists today. Implied:

- `GET /api/vendor/payouts/next` — active run with breakdown numbers.
- `GET /api/vendor/payouts` — paginated history.
- `GET /api/vendor/payouts/[id]` — per-run detail (drives the click-to-modal interaction in Q22).
- `GET /api/vendor/payouts/lifetime` (or merged into `next`) — lifetime aggregate.
- `GET /api/vendor/payouts/[id]/statement.pdf` and/or `GET /api/vendor/payouts/export` — statement download surfaces; per surface-map §7 Q6 answered "ignore it for now" — see Q6.
- `PATCH /api/vendor/me/bank` — vendor-self-edit per surface-map §7 Q5 — see Q14.

---

## 4. Behavior implications

### 4.1 New page route

`apps/web/src/app/vendor/ledger/page.tsx` does not exist and must be created. Constants and middleware already cover it (`ABSOLUTE_ROUTES.VENDOR_LEDGER` and `middleware.ts` `/vendor/:path*` role gate).

The current vendor sidebar (`vendor-sidebar/index.tsx`) already includes the Ledger nav row pointing at `/vendor/ledger`; clicking it today resolves to a 404. No nav-config change is required — only the page file.

### 4.2 Data fetching

Two distinct calls per render:

- One for the active payout (next-payout hero + breakdown card content). Likely `GET /api/vendor/payouts/next`. Read-mostly; fits the existing React Query pattern (`useVendorOrdersQuery`, `useVendorProductsQuery`).
- One for history (history card body + lifetime footer). Likely `GET /api/vendor/payouts`. Paginated by `weeksBack` or cursor; design draws "last 8 weeks" in the subtitle and shows 7 rows + 1 active = 8 total on desktop / 1 active + 5 paid = 6 on mobile. **Pagination size and shape are not specified** — see Q20.
- A third call for bank info — but if the vendor session payload already includes shop/bank fields, this can be reused. Whether it does was not verified in this pass — see Q-DATA-1.

### 4.3 Live countdown

`PAYS IN · 2 days` requires a re-render at midnight (or finer). Two options:

- **Coarse** ticking on `dayjs(release).fromNow()` once per minute or once per visibility change.
- **Static** server-rendered count, not updated until route revisit.

The design draws "2 days" as a coarse integer; finer granularity ("hours" for the day-of) is not drawn. See Q5.

### 4.4 Friday-anchored payout cycle business logic

The cycle window must be derived consistently across:

- Active-payout endpoint (which week is "this week"?).
- History endpoint (per-row `weekStart`/`weekEnd` snapshots).
- Cycle-roll job (which midnight-Friday creates the next `payout_runs` row).
- The 7-day return window referenced in the desktop policy block (`ldBkInfo`, "7-day return window before completion").

`surface-map §7 Q2` answer: "whole week" — i.e. a Sat-thru-Fri 7-day cycle anchored on close-of-Friday, *displayed* as Mon-thru-Fri labels. **The display label drops Saturday and Sunday;** if a real Saturday/Sunday delivery occurred, it must roll into the *next* cycle's window. This needs a clear rule. See Q7.

The 7-day return window also implies a delivered sub-order is **not eligible for inclusion in a payout** until 7 days have elapsed since `handedAt` (or `deliveredAt`). No `eligibleForPayoutAt` column exists on `sub_orders`. See Q8.

### 4.5 Bank-edit interaction

Per `surface-map §7 Q5` answered: "yes implement a self-service edit endpoint for the vendor." The edit affordance is the `pencil` icon next to the bank row on both desktop and mobile. The flow itself is **not drawn** — no modal, no inline form, no confirmation step is visible. Decisions needed:

- Modal (Dialog) vs inline edit vs full subroute (`/vendor/ledger/bank`)?
- Confirmation (e.g., re-enter password, OTP, admin-approval queue) given the fund-routing risk?
- Validation rules (IBAN format, bank short-code mapping)?

See Q14.

### 4.6 Statement downloads

Three download affordances are drawn: the hero "Download statement" button (per-cycle?), the history-card subtitle "download PDF anytime" (for any historical run?), and the `Export all` outline button (ZIP of all runs? CSV?). Per `surface-map §7 Q6` answered "ignore it for now." Decision needed for whether to render the buttons disabled, hidden, or pointing at a stub. See Q6.

### 4.7 Per-run history-row detail modal

Per `surface-map §7 Q10` answered: "rows are interactive and open a per-run detail modal." The modal layout is **not drawn anywhere in Pencil**. Decisions needed:

- Modal contents (full breakdown for that historical week? sub-order list? statement download?).
- Trigger surface — entire row clickable on desktop and mobile, or only an explicit affordance?
- Cursor/hover/focus styling (none drawn).

See Q22.

### 4.8 Empty / loading / error / edge states

Per `surface-map §7 Q9` answered: "implement all the empty states." None are drawn. The states implied:

- **Brand-new vendor with zero payouts** — hero and breakdown have no data; history is empty; lifetime is "0".
- **Cycle with zero completed orders** — breakdown rows show 0; net payout is 0; "Download statement" suppressed?
- **Pending run that failed/held** — no visual drawn; surface-map §3 flags `failed` as inferred-only.
- **Bank account not configured** — design assumes bank is always present.
- **Network/server error** — none drawn.
- **Stale-paid (paid by us but not yet cleared by bank)** — none drawn.

See Q17, Q23.

### 4.9 Mobile-tooltip for policy block

Mobile bank card omits the desktop's 3-row policy block. Per `surface-map §7 Q8` answered: "a tooltip on the card." This requires a `Tooltip` primitive that does not exist in `@repo/ui` today (not in `02 §3` design inventory, not in `04` implementation log). On mobile, native tooltips are non-trivial — they require a tap-to-show (since hover doesn't exist) and must not collide with the row's tap-to-edit. See Q-DS-1.

### 4.10 Navigation from Vendor Dashboard "View ledger" CTA

`features/vendor-payouts/surface-map.md` documents two dashboard touchpoints (KPI tile + paper-2 callout) that link here. Both must navigate to `/vendor/ledger`. The dashboard itself is currently a placeholder per `01 §7 Q5` — implementing the ledger before the dashboard CTA's destination is correct sequencing (per surface-map §6).

---

## 5. Open questions for me

Numbered for easy reference. Format: **What I observed → Specific question → 2–3 plausible answers** (no recommendation chosen).

### Copy & microcopy

**Q1. New / changed copy across the entire screen.** Almost every text node is new copy that has no equivalent in the codebase: page eyebrow ("FRIDAY PAYOUTS · WEEKLY"), title ("Ledger"), descriptor ("Your earnings, paid every Friday for orders the buyer kept (returns and MNP fees deducted)."), hero eyebrow ("NEXT PAYOUT · FRIDAY 26 APRIL 2026" desktop / "NEXT PAYOUT · FRIDAY 26 APR" mobile), countdown eyebrow ("PAYS IN"), Download CTA ("Download statement"), breakdown eyebrow ("THIS WEEK · 22–26 APRIL"), breakdown row labels (incl. shorter mobile variants "Returns (3)" / "MNP fees"), bank eyebrow ("PAYS TO YOUR ACCOUNT"), policy lines ("Payouts every Friday" / "7-day return window before completion" / "Disputes? Call admin: 0300-SHALMI"), history title ("Payout history" / "Last 8 weeks · download PDF anytime"), `Export all`, footer ("Lifetime: Rs. X,XX,XXX across N weeks" / "View older weeks"), mobile pending-card subtitle ("Pays Friday 26 Apr"), mobile paid-card subtitle format ("Paid Fri 19 Apr · TXN-09287140").

Per CLAUDE.md, copy is not assumed intentional. **Question: is every Pencil string above approved as final copy as-is for the implementation, or are any of them placeholder strings to be replaced (especially the phone number `0300-SHALMI` and the marketing-tone descriptor)?**
Plausible answers:
1. All approved as-is.
2. All approved except the phone number (real number TBD by the user).
3. Use as placeholder until i18n / copy review pass.

### Hero block

**Q2. Next-payout date format.** Desktop renders "FRIDAY 26 APRIL 2026"; mobile renders "FRIDAY 26 APR"; vendor dashboard (per `vendor-payouts/surface-map.md`) renders "FRI · 2 MAY". **Question: is each format intentional per surface, and which is the canonical formatter rule (locale-style abbreviation rules)?**
Plausible answers:
1. Each surface owns its format string verbatim from Pencil; build per-surface format helpers.
2. One global formatter with `variant: 'long' | 'short' | 'kpi'` parameters.
3. Server returns pre-formatted strings.

**Q3. Source of truth for `next payout release date`.** Drawn but not in any column. Per `vendor-portal.md` §1 Q1 flagged. **Question: should the release date be (a) computed at request time as "next Friday after now, accounting for cutoff", (b) stored as `payout_runs.releasesAt` on the active row, or (c) stored at the org level so the cycle is configurable?** (See `surface-map §7 Q1` answered "yes a new table" — but does that new table own this date, or is it computed?)
Plausible answers:
1. Computed each request; pure helper, no column.
2. Stored on the active `payout_runs` row.
3. Org-level `payout_cycle_settings` table.

**Q4. All Net-payout / Gross-sales / Returns / MNP-fees / counts are NEW_FIELDs.** None exist in any existing endpoint or column today. Per `surface-map §7 Q1` answered "new table." **Question: confirm the active week reads from a "draft" `payout_runs` row that is upserted continuously as the week accrues — versus recomputed-on-read with no DB row until cycle-close?**
Plausible answers:
1. Active week has a draft `payout_runs` row (status `pending`) that's upserted on each new sale/return.
2. Active week is recomputed on every read (no DB row); only cycle-close materializes a row.
3. Hybrid — header counts cached, breakdown recomputed.

**Q5. Countdown granularity and re-render policy.** Drawn as "2 days". **Question: is "days" the only unit ever shown, or does the day-of payout switch to "hours" / "minutes"? And on the client, is the countdown live-tickering (per minute / per visibility change) or static-server-rendered (refreshes on navigation only)?**
Plausible answers:
1. Days only; static (no client tick).
2. Days only; client-tick once per midnight.
3. Days→hours→minutes; live-tick.

**Q6. Statement download buttons.** Three download affordances drawn (hero "Download statement", history subtitle "download PDF anytime", history `Export all`). Per `surface-map §7 Q6` answered "ignore it for now." **Question: confirm — for this implementation phase, should the buttons be (a) hidden entirely, (b) rendered but disabled (with a tooltip "Coming soon"), or (c) rendered and POST to a stub endpoint that returns 501?**
Plausible answers:
1. Hidden until backend ships.
2. Disabled with a "coming soon" affordance.
3. Stubbed endpoint that returns a fixture PDF or 501.

### Breakdown card

**Q7. Cycle window — display vs cycle.** Per `surface-map §7 Q2` answered "whole week" — yet every drawn label shows Mon–Fri ranges (`22–26 Apr`, `15–19 Apr`, `08–12 Apr`, …). **Question: is the cycle window full Sat–Fri (7 days) but the *display* always strips weekends to Mon–Fri, or is the display label literal (i.e., the cycle is actually only Mon–Fri and weekend orders count toward the next cycle)?** This determines the `weekStart` field semantics on `payout_runs`.
Plausible answers:
1. Full 7-day cycle; display label strips weekends as a presentation rule.
2. Mon–Fri cycle; weekend orders carry to next cycle.
3. Configurable per market (`payout_cycle_settings`).

**Q8. 7-day return window before payout-eligibility.** Implied by the policy line "7-day return window before completion." Today, `sub_orders.handedAt` is set when the order is handed to courier; there is no `deliveredAt` or `eligibleForPayoutAt`. **Question: should payout-eligibility be (a) `delivered AND handedAt < now − 7d`, (b) a new `deliveredAt` column with the rule against it, or (c) a new `eligibleForPayoutAt` column written when the 7-day timer fires?**
Plausible answers:
1. Reuse `handedAt` (or its delta against `now`).
2. New `deliveredAt` + business rule.
3. New `eligibleForPayoutAt` column.

**Q9. Weight format "512.4 kg".** No unit/precision rule exists today. **Question: is "kg with one decimal" the canonical format, or does the design imply something more flexible (kg with no decimals when integer; tonnes for very large vendors)?**
Plausible answers:
1. Always "X.X kg" (fixed 1-decimal).
2. "X kg" when integer, else "X.X kg".
3. Format-from-grams helper with thresholding (kg → tonnes at ≥ 1000 kg).

**Q10. "Returns" semantics in the breakdown row.** Per `surface-map §7 Q4` answered (a): cancelled sub-orders are treated as returns; the label is presentational only. **Question: is the deduction amount (a) recomputed by summing `cancelled` sub-orders' totals each request, or (b) sourced from a `vendor_ledger` debit line written when the cancellation is recorded? If (b), which `vendor_ledger.type` value?** (Today's enum has no `return`-style entry.)
Plausible answers:
1. Recomputed from `sub_orders` totals on read.
2. Stored as `vendor_ledger` debits with a new `type = 'return'` enum value.
3. Stored as `vendor_ledger` debits using existing `type = 'penalty'` repurposed.

**Q11. "MNP delivery fees" source column.** `vendor_ledger.type = logistics_reimbursement` is a *credit* type today (vendor receives reimbursement). The design's "− MNP delivery fees" row is a *deduction*. **Question: is the deduction sourced from (a) per-sub-order cost-breakdown columns on `sub_orders` (and which?), (b) `vendor_ledger` debit lines with a new type, or (c) a separate fee-table not yet present?**
Plausible answers:
1. Aggregated from a `sub_orders` column (e.g., one of the existing "COD/payout/cost breakdown ints" — column needs to be identified).
2. New `vendor_ledger.type = 'mnp_fee'` debit lines.
3. Standalone `mnp_fees` table.

**Q12. Mobile breakdown drops `Items packed` and `Weight shipped`.** Per `surface-map §7 Q11` answered "intentional information-density decision." **Question: confirm — neither value is reachable on mobile (e.g., not behind a tooltip or accordion), and the per-run detail modal (Q22) is the only mobile path to those numbers?**
Plausible answers:
1. Confirmed — mobile users see them only in the detail modal.
2. Tooltip on the breakdown card surfaces them.
3. Accordion / "Show details" toggle.

### Bank info card

**Q13. IBAN mask format desktop vs mobile.** Desktop: `"PK24 MEZN •••• •••• 4291"` (3 dot-groups). Mobile: `"PK24 MEZN •••• 4291"` (2 dot-groups). **Question: is each mask intentional per width (i.e., a per-surface formatter), or is one a typo? And what's the canonical rule — full IBAN compressed to "prefix + N masked groups + last4"?**
Plausible answers:
1. Both intentional; desktop uses 3 mask groups, mobile uses 2 (per width budget).
2. The mobile shorter form is canonical for both (typo on desktop / vice versa).
3. Single canonical mask "PKNN BBBB •••• •••• NNNN" everywhere.

**Q14. Bank-edit flow.** Per `surface-map §7 Q5` answered "yes implement a self-service edit endpoint." The pencil icon affordance is drawn but the **flow is not**. **Question: choose between (a) a modal Dialog with form, (b) an inline-on-card edit, (c) a separate subroute `/vendor/ledger/bank`, and choose security posture (a) password re-entry, (b) OTP via existing Twilio plugin, (c) admin-approval queue?**
Plausible answers:
1. Dialog modal + OTP confirmation (reuse existing better-auth phone OTP).
2. Inline edit on card + admin-approval queue.
3. Separate `/vendor/ledger/bank` subroute + password re-entry.

**Q15. Phone number `0300-SHALMI`.** Drawn verbatim in the policy row. **Question: is this a placeholder or the actual support line? If actual, is it stored anywhere centrally (env var? `org_settings` table?) or hardcoded in the copy?**
Plausible answers:
1. Placeholder — replace with real number at copy review.
2. Real — hardcoded in the copy.
3. Real — sourced from a config/env var.

**Q16. Mobile policy-block tooltip.** Per `surface-map §7 Q8` answered "a tooltip on the card." **Question: which icon or area triggers it (the bank icon? a separate info icon? long-press the whole row?), and on mobile (where there's no hover) is it a tap-to-toggle popover or a sheet?**
Plausible answers:
1. New info-icon (`info` lucide) on the bank row triggers a Popover.
2. Tap-and-hold on the bank row opens a bottom sheet.
3. A separate "View payout policies" link surfaces.

### History card

**Q17. Pending row stamp + state vs failed/held states.** Pending row uses amber-bg fill, amber-bordered stamp, and `"pending"` placeholder TXN. **No drawn state for failed/held/clearing.** Per `surface-map §7 Q9` answered "implement all the empty states." **Question: what visual variants are needed for `failed`, `held`, and `clearing`/`in transit`, and what copy goes in each?**
Plausible answers:
1. Reuse the amber-pending row variant for held/clearing; introduce a red-bordered stamp for failed.
2. Three new visual variants — held (blue), clearing (blue), failed (red).
3. Surface only `pending` and `paid` initially; defer failed/held to a later phase.

**Q18. `payout_runs` ↔ `vendor_ledger.type='payout'` duplication.** Per `surface-map §7 Q1` answered "yes a new table." **Question: when a run is paid, is a `vendor_ledger` debit row also written (so the ledger remains the cash-flow authority), or does `payout_runs` replace the `payout` enum value entirely?**
Plausible answers:
1. Both: `payout_runs` carries display + status; `vendor_ledger` writes one debit row per paid run with `referenceId = payout_runs.id`.
2. `payout_runs` only; `vendor_ledger.type='payout'` becomes unused / removed.
3. `vendor_ledger` only with a "run grouping" view; no `payout_runs` table.

**Q19. Lifetime totals source.** Footer reads "Lifetime: Rs. 84,12,400 across 218 weeks." **Question: is the amount sourced from `sum(payout_runs.netPayoutCents WHERE status='paid')` or `sum(vendor_ledger.amount WHERE type='payout' AND direction='debit')`? And is the count "218 weeks" `count(payout_runs WHERE status='paid')` or `weeks-since-vendor-onboarded`?**
Plausible answers:
1. Both are over `payout_runs` (recommended for consistency with the table).
2. Amount over `vendor_ledger`, count over weeks-since-onboarded.
3. Pre-aggregated into a `vendor_lifetime_stats` cache.

**Q20. "View older weeks" pagination + mobile-omission.** Desktop has a "View older weeks" link; mobile drops it (only the lifetime pill remains). **Question: is this intentional (mobile users never see beyond the visible cards), or design churn? And what's the pagination model — cursor by week-end date? page-of-N?**
Plausible answers:
1. Intentional; mobile is fixed-window 6 cards, link omitted by design.
2. Design churn; mobile should also expose "View older weeks" as a button.
3. Reachable on mobile but via a different surface (e.g., scroll-to-end triggers infinite-scroll fetch).

**Q21. Mobile pending-stamp fill `#FBFAF5` (paper) instead of `$amber-bg`.** Likely an authoring slip. **Question: is the intended fill `$amber-bg` (consistent with desktop), or is the paper-on-amber-bg-card mismatch intentional for visual contrast?**
Plausible answers:
1. Authoring slip — should be `$amber-bg`.
2. Intentional — pending stamp uses paper fill specifically on mobile.
3. Either is acceptable; defer to design system rule for "stamp on tinted surface."

**Q22. Per-run detail modal.** Per `surface-map §7 Q10` answered "rows are interactive and open a per-run detail modal." **The modal layout is not drawn.** **Question: what does the modal show — the same Breakdown component as the active week (re-rendered against the historical run snapshot), or a different layout (e.g., a per-sub-order list)? And is the row's entire height the click target, or only an explicit "View details" affordance?**
Plausible answers:
1. Same Breakdown layout, hydrated from the run snapshot; full row clickable.
2. Sub-order-level drill-down list; explicit affordance.
3. Compact summary + Download statement button only; full row clickable.

### Existing-code elements absent from design

**Q23. `vendor_ledger.type = penalty` rows.** No row for penalties is drawn in the breakdown or anywhere on the ledger. **Question: are penalty debits (a) folded into the "Returns" row (silently), (b) folded into the "MNP delivery fees" row, (c) silently subtracted from net payout without a labeled line, or (d) separately surfaced in a row not yet drawn?**
Plausible answers:
1. Folded into "Returns".
2. Folded into a "Penalties" row not yet drawn — design omission.
3. Silently deducted in `Net payout` math only.

**Q24. `vendor_ledger.referenceId` and `description` per-line metadata.** Not surfaced anywhere on the screen. **Question: are these intentionally hidden from vendors (admin-only), or expected to surface inside the per-run detail modal (Q22) as a transaction list?**
Plausible answers:
1. Hidden from vendors — admin-only.
2. Expected in the detail modal as a transaction list.
3. Surfaced in the statement PDF only (deferred per Q6).

### Cross-surface / chrome / design-system gaps

**Q-CHROME-1. Vendor app shell visual mismatch.** Desktop top bar in code is white with a "Vendor" text + LogoutButton; Pencil shows ink chrome with brand cluster, dark search, bell, avatar. Vendor sidebar in code is single-group "Navigation"; Pencil shows 4 grouped sections with paper-2 active state. Vendor mobile chrome (ink app bar + bottom tab bar) does not exist in code. **Question: is the chrome-revamp tracked as a separate feature, and the ledger screen ships against the *current* (code) chrome until then? Or must the chrome be revamped first so the ledger ships against the Pencil chrome?**
Plausible answers:
1. Ledger ships against current chrome; chrome revamp is a separate ticket.
2. Chrome revamp blocks ledger.
3. Partial — ship the ink top bar + paper-2 active sidebar entries with this ticket; defer mobile bottom tab bar.

**Q-DS-1. Tooltip primitive missing.** Mobile bank-info policy block requires a tooltip (per `surface-map §7 Q8` answered). No `Tooltip` primitive exists in `@repo/ui` or in the design inventory. Per `02 §7 Q8` answer, missing primitives may be added via shadcn or built from scratch. **Question: install shadcn `tooltip` (Radix-backed) before this screen ships?**
Plausible answers:
1. Install shadcn `tooltip` now.
2. Build a minimal Tooltip atom from Radix Primitives in `@repo/ui`.
3. Use a Popover (already implied by shadcn's primitives — verify availability) instead of a Tooltip on mobile.

**Q-DATA-1. Vendor session payload shape.** It is unclear whether the current better-auth session payload exposes the vendor's bank fields (`bankName`, `accountTitle`, `iban`) or whether a separate query is required. **Question: confirm the session shape so the bank-info card can decide between reusing the session and issuing a dedicated `GET /api/vendor/me` query.**
Plausible answers:
1. Session already exposes bank fields — reuse.
2. Issue a new `GET /api/vendor/me` query; cache via React Query.
3. Bake bank info into the same `GET /api/vendor/payouts/next` response.

---

(End of Vendor · Ledger gap analysis. Stopping here per instructions —
no implementation, no code proposals, no defaults assumed.)
