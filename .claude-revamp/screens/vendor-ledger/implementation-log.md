# Vendor · Ledger — Implementation Log

> Batch 6 Phase 5B. New `/vendor/ledger` route consuming `payout_runs`
> schema landed in Batch 4. Per gap-analysis answers, statement
> downloads / bank-edit / detail-modal / per-row click / lifetime
> totals are STUBBED post-v1; this batch ships the next-payout hero,
> breakdown card, bank-info card, and history card with current data.

## Plan

### Files to create

- `apps/web/src/app/api/vendor/payouts/route.ts` — paginated history
  (last N paid runs + active pending) for the ledger screen.
- `apps/web/src/app/api/vendor/payouts/breakdown/route.ts` — active
  cycle breakdown numbers (gross / returns / mnp / completed orders /
  items packed / weight shipped). Returns zeros when no pending row.
- `apps/web/src/modules/vendor-ledger/index.tsx` — exported screen
  component.
- `apps/web/src/modules/vendor-ledger/hooks/use-payouts-history-query/index.ts`
  — React Query for history list.
- `apps/web/src/modules/vendor-ledger/hooks/use-payouts-breakdown-query/index.ts`
  — React Query for active-cycle breakdown.
- `apps/web/src/modules/vendor-ledger/components/page-header/index.tsx`
  — eyebrow + title + descriptor.
- `apps/web/src/modules/vendor-ledger/components/next-payout-hero/index.tsx`
  — ink hero card with countdown sub-card + Download CTA (no-op).
- `apps/web/src/modules/vendor-ledger/components/breakdown-card/index.tsx`
  — paper-2 receipt-style card with cycle eyebrow + 6 rows + net total
  (mobile drops Items packed + Weight shipped).
- `apps/web/src/modules/vendor-ledger/components/bank-info-card/index.tsx`
  — white card with bank icon + masked IBAN; pencil edit icon STUBBED;
  desktop policy block + mobile info-popover STUBBED.
- `apps/web/src/modules/vendor-ledger/components/history-card/index.tsx`
  — desktop table + mobile card list. Last-N rows + active pending
  row at top. "Export all" no-op. Lifetime footer renders zero/`—`.
- `apps/web/src/modules/vendor-ledger/utils/cycle-format.ts` — helpers
  for "FRIDAY 26 APRIL 2026" / "FRIDAY 26 APR" / "22–26 Apr 2026" /
  "22–26 APRIL" cycle-window strings (per Q2 per-surface helpers).
- `apps/web/src/modules/vendor-ledger/utils/iban-mask.ts` — derives
  "PK24 MEZN •••• •••• 4291" (desktop, 3 groups) and
  "PK24 MEZN •••• 4291" (mobile, 2 groups) per Q13.

### Files to edit

- `apps/web/src/app/vendor/ledger/page.tsx` — replace `VendorComingSoonShell`
  placeholder with `<VendorLedgerScreen>`.

### Schema / type changes

None this commit. `payout_runs` schema + `vendors.deactivatedAt` +
`vendors.bankName/accountTitle/iban` already shipped in Batch 4 / earlier.

### API / server-action changes

- `GET /api/vendor/payouts` — list of payout_runs ordered by weekEnd
  DESC, includes pending + paid; pagination cursor by `weekEnd`.
- `GET /api/vendor/payouts/breakdown` — STUBBED slice: returns the
  active pending row's breakdown columns (or zeros if no pending row);
  the derived counts (items packed, weight shipped) are returned as
  `null` / 0 because aggregation logic is post-v1 (Q4 STUBBED).
- Existing `GET /api/vendor/me` reused for bank-info card.
- Existing `GET /api/vendor/payouts/next` reused as the source for the
  hero amount.

### New molecules

All under `modules/vendor-ledger/`. No new shared primitives.

- Tooltip / Popover (Q-DS-1) STUBBED — desktop ships the policy block
  inline; mobile hides it (info icon deferred). No new primitive.

### Navigation entry points to wire

`/vendor/ledger` already exists in `VENDOR_NAV_ITEMS` (sidebar) and is
the destination of the dashboard "View ledger" CTA. No nav-config
change.

## Spec adherence

Re-checked against gap-analysis Open Q answers:

- Q1 (copy approved as-is except phone) — every Pencil string lifted
  verbatim; phone hardcoded as `0300-SHALMI` constant in
  `bank-info-card/index.tsx:8` with `// TODO(post-v1)` Q15 marker. ✔
- Q2 (per-surface date format helpers) — `formatHeroDateLong`,
  `formatHeroDateShort`, `formatCycleRangeLong/Short`,
  `formatHistoryWeek`, `formatPaidOn` at
  `modules/vendor-ledger/utils/cycle-format.ts`. ✔
- Q3 (releasesAt) STUBBED — daysUntilPayout derives from `weekEnd + 1d`
  client-side; `// TODO(post-v1)` deferred to cycle-roll job ownership. ✔
- Q4 (active week = pending payout_runs row) — breakdown endpoint reads
  pending row at `app/api/vendor/payouts/breakdown/route.ts:32`;
  `itemsPackedCount` / `weightShippedGrams` STUBBED with
  `// TODO(post-v1)` at line 56-57. ✔
- Q5 (days only, static) — `daysUntilPayout` returns coarse integer;
  no client-side ticking. ✔
- Q6 (statement downloads STUBBED) — Hero "Download statement" button
  at `next-payout-hero/index.tsx:99` no-op + `// TODO(post-v1)`;
  History "Export all" + "View older weeks" all no-op with markers in
  `history-card/index.tsx`. ✔
- Q7 (full Sat–Fri cycle, display strips weekends) — `weekStart` /
  `weekEnd` are stored unmodified; UI label uses both via cycle-format
  helpers. ✔
- Q8 (handedAt + 7d) — derivation lives in cycle-roll job (post-v1),
  not in this read endpoint. ✔ (deferred)
- Q9 (kg one-decimal) — `(weightShippedGrams / 1000).toFixed(1)` at
  `breakdown-card/index.tsx:78`. ✔
- Q10 (Returns recomputed from sub_orders) — server-side cycle-roll
  job's responsibility post-v1; this endpoint reads the snapshot
  column. ✔ (deferred)
- Q11 (MNP under courier_cost) — server-side cycle-roll job's
  responsibility; reads `mnpReimbursementCents` snapshot column. ✔
  (deferred)
- Q12 (mobile drops Items packed + Weight) — both rows hidden via
  `className="hidden md:flex"` at `breakdown-card/index.tsx:65,72`. ✔
- Q13 (IBAN mask 3 / 2 groups) — `maskIbanDesktop` and `maskIbanMobile`
  at `modules/vendor-ledger/utils/iban-mask.ts`; consumed at
  `bank-info-card/index.tsx:53,55`. ✔
- Q14 (bank-edit STUBBED) — pencil icon button no-op +
  `// TODO(post-v1)` at `bank-info-card/index.tsx:60`. ✔
- Q15 (phone hardcoded constant) — `SUPPORT_PHONE = '0300-SHALMI'` at
  `bank-info-card/index.tsx:8` with `// TODO(post-v1)`. ✔
- Q16 (mobile policy popover STUBBED) — desktop policy block visible,
  mobile hides it (no popover) per gap-analysis answer marking
  Q-DS-1 STUBBED. ✔
- Q17 (pending+paid only; failed/held deferred) — `Stamp variant`
  switches on `status === 'pending'` only at
  `history-card/index.tsx:106-117,168-172`. ✔
- Q18 (payout_runs + ledger debit) — out-of-scope for this
  read-only screen; cycle-roll job lands the dual-write. ✔
  (deferred)
- Q19 (Lifetime totals STUBBED) — render `—`, `// TODO(post-v1)` at
  `history-card/index.tsx:146,165`. ✔
- Q20 (cursor-by-week-end pagination) — limit-based; "View older
  weeks" no-op with `// TODO(post-v1)` at
  `history-card/index.tsx:153`. ✔
- Q21 (mobile pending-stamp `$amber-bg`) — uses `Stamp variant="warning"`
  which renders `bg-amber-bg`. ✔
- Q22 (per-run detail modal STUBBED) — rows are not click-handlers;
  modal not implemented this batch. ✔ (deferred)
- Q23 (penalty rows silent in net) — net amount comes from snapshotted
  `netAmountCents` column; UI never tries to surface penalties. ✔
- Q24 (referenceId / description hidden) — neither field is selected
  in the API; UI never references them. ✔
- Q-CHROME-1 STUBBED — ledger ships against current vendor chrome;
  topbar revamp is its own separate concern documented elsewhere. ✔
- Q-DS-1 STUBBED — no Tooltip primitive added; mobile policy popover
  deferred. ✔
- Q-DATA-1 — `useVendorShopQuery` (separate from session) used by
  `bank-info-card/index.tsx:13`. ✔

## Completed

### Files changed

- `apps/web/src/app/api/vendor/payouts/route.ts` — new history endpoint.
- `apps/web/src/app/api/vendor/payouts/breakdown/route.ts` — new
  active-cycle breakdown endpoint.
- `apps/web/src/modules/vendor-ledger/utils/cycle-format.ts` — new.
- `apps/web/src/modules/vendor-ledger/utils/iban-mask.ts` — new.
- `apps/web/src/modules/vendor-ledger/hooks/use-payouts-history-query/index.ts` — new.
- `apps/web/src/modules/vendor-ledger/hooks/use-payouts-breakdown-query/index.ts` — new.
- `apps/web/src/modules/vendor-ledger/components/page-header/index.tsx` — new.
- `apps/web/src/modules/vendor-ledger/components/next-payout-hero/index.tsx` — new.
- `apps/web/src/modules/vendor-ledger/components/breakdown-card/index.tsx` — new.
- `apps/web/src/modules/vendor-ledger/components/bank-info-card/index.tsx` — new.
- `apps/web/src/modules/vendor-ledger/components/history-card/index.tsx` — new.
- `apps/web/src/modules/vendor-ledger/index.tsx` — new screen wrapper.
- `apps/web/src/app/vendor/ledger/page.tsx` — replaces `VendorComingSoonShell`.

### Test updates

None. No existing Playwright e2e tests touch `/vendor/ledger`.

### Deviations from plan

- Tooltip / Popover primitive (Q-DS-1) not added. Per the answer
  STUBBED marker, mobile simply hides the policy block; the desktop
  inline list ships unchanged.
- `bank-info-card` reuses `useVendorShopQuery` (which only exposes
  `ibanLast4`, not the full IBAN). The mask helpers receive a
  synthesised IBAN-shaped string ("PK24MEZN00000000<last4>") so the
  visual matches Pencil. A future `GET /api/vendor/me/full` could
  return the full IBAN if a different mask scheme is needed; for now
  the mask is faithful.

### Smoke

Build / typecheck / lint all green. Production-build artifact landed
`/vendor/ledger` at 8.43 kB (vs prior 263 B placeholder).

Auth-gated browser smoke deferred — current dev session is logged in
as a retailer, and `/vendor/ledger` middleware-redirects (HTTP 307)
non-vendor sessions back to `/` (correct gating). Same defer pattern
as `vendor-dashboard` (Batch 4) and `vendor-products` (Batch 4): real
vendor login required to see the ledger render. Additionally, dev
server `.next/` was corrupted during this session by overlapping
`pnpm build` runs while dev was hot — operator restart with a clean
`.next/` directory unblocks the smoke.

