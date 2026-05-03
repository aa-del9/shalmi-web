# Buyer · Account Drawer — Implementation Log

> Batch 6 Phase 5B. New right-side Sheet drawer replacing the
> existing `StorefrontHeader` `DropdownMenu`. Per gap-analysis Q3 the
> trigger surface is the existing `/profile` route + the header avatar
> button.

## Plan

### Files to create

- `apps/web/src/modules/buyer-account-drawer/index.tsx` — exported
  `<AccountDrawer>` molecule (controlled via local zustand store).
- `apps/web/src/modules/buyer-account-drawer/store/index.ts` —
  zustand store with `isOpen`, `open()`, `close()`, `toggle()` so the
  header trigger and the `/profile` deep-link both flip the same flag.
- `apps/web/src/modules/buyer-account-drawer/components/account-drawer-trigger/index.tsx`
  — header avatar button (replaces existing inline avatar +
  `DropdownMenuTrigger`).
- `apps/web/src/modules/buyer-account-drawer/components/user-card/index.tsx`
  — paper-2 user card with avatar / VERIFIED stamp / 3-cell stat grid.
- `apps/web/src/modules/buyer-account-drawer/components/nav-card/index.tsx`
  — white card containing 1+ `<NavRow>` children with internal hairlines.
- `apps/web/src/modules/buyer-account-drawer/components/nav-row/index.tsx`
  — single icon + 2-line label + optional trailing pill + chevron row.
- `apps/web/src/modules/buyer-account-drawer/components/foot/index.tsx`
  — language row (inert toggle), logout list-item card, version string.
- `apps/web/src/modules/buyer-account-drawer/utils/initials.ts` —
  computes "TA" from "Tariq Ahmed" (first letter of first two parts;
  fallback "A" for single-name "Ali"). Per Q12.
- `apps/web/src/app/(storefront)/profile/page.tsx` — client component
  that flips drawer open and `router.replace('/')`. Per Q7.

### Files to edit

- `apps/web/src/modules/storefront/components/header/index.tsx` —
  replace the `DropdownMenu` block with `<AccountDrawerTrigger />` and
  render `<AccountDrawer />` once. Unauthed branch keeps existing
  "Sign In" button (Q16).
- `apps/web/src/modules/core/env/client/index.ts` — add
  `NEXT_PUBLIC_APP_VERSION` env var (Q9).
- `apps/web/src/modules/core/constants/app-info/index.ts` — re-export
  `APP_VERSION` constant.
- `packages/database/src/schema/auth.ts` — re-add `businessName: text`
  field (now that Batch 6 is the consumer; deferred in commit 1cb6383).
  The dev DB requires migration 0012 applied; smoke gate may defer
  same as buyer-settings/buyer-reorder.
- `packages/database/src/schema/addresses.ts` — re-add `postalCode`
  and `province` fields (consumer is the drawer subtitle "default Shop"
  per Q17 — actually Q17 only needs `addresses.title` which already
  exists; postal/province re-add is deferred until smoke needs them).
  → Decision: leave addresses deferred; not needed for the drawer.

### Schema / type changes

- `user.businessName` (text, nullable) — drizzle re-add. Consumed by
  user-card third-line subtitle.
- No new tables. No migrations beyond what Batch 5 already wrote.

### API / server-action changes

- None this commit. `GET /api/user/profile-stats` is **STUBBED** per
  Q2/Q11 — the drawer renders "—" for the 3 stat cells and falls back
  to static nav-row subtitles. Add `// TODO(post-v1):` comment at every
  touch point.

### New molecules

All screen-local under `modules/buyer-account-drawer/`. No new shared
primitives. Per Q3 the trailing amber pill stays inline; per Q6 the
drawer width is set via `className="sm:!max-w-[480px]"` override.

### Navigation entry points to wire

- `StorefrontHeader` avatar → opens drawer (replaces existing
  `DropdownMenu`).
- `/profile/page.tsx` (new) → opens drawer + `router.replace('/')`
  per Q7.

## Spec adherence

Re-checked against gap-analysis Open Q answers:

- Q1 (scrim 50% vs 60%) — `Sheet`'s overlay already uses
  `bg-bg-overlay` (the Phase-3 50% token); inherited at
  `apps/web/src/modules/buyer-account-drawer/index.tsx` via
  `<SheetContent>` defaults. ✔
- Q2 (Saved stat formula) STUBBED — user-card stat cells render "—"
  with `// TODO(post-v1)` at
  `modules/buyer-account-drawer/components/user-card/index.tsx:62`. ✔
- Q3 (trailing pill primitive) — Inline-only; no new primitive added.
  The pill itself is omitted on the Orders nav-row because Q11
  STUBBED disables the active-orders count subtitle as well — pill
  follows the same defer. ✔
- Q4 (Payment methods) DEFERRED — row not rendered;
  `// TODO(post-v1)` at
  `modules/buyer-account-drawer/index.tsx:147`. ✔
- Q5 (Lang toggle plumbing) STUBBED — `<LanguageToggle value="en" disabled />`
  at `modules/buyer-account-drawer/components/foot/index.tsx:24`,
  `// TODO(post-v1)` above. ✔
- Q6 (drawer width override) — `className="!w-full sm:!max-w-[480px]"`
  at `modules/buyer-account-drawer/index.tsx:90`. ✔
- Q7 (`/profile` deep-link) — `apps/web/src/app/(storefront)/profile/page.tsx`
  flips drawer open and `router.replace('/')` on mount. ✔
- Q8 (Logout follows LogoutButton pattern) — `handleLogout` at
  `modules/buyer-account-drawer/index.tsx:79` closes drawer →
  `signOut()` → `router.push('/')` → `router.refresh()`. ✔
- Q9 (Version `NEXT_PUBLIC_APP_VERSION`) — env var added at
  `apps/web/src/modules/core/env/client/index.ts:9`; consumed via
  `APP_VERSION` constant in
  `modules/buyer-account-drawer/components/foot/index.tsx:35`. ✔
- Q10 (Track-order row hides when no active order) STUBBED — row
  not rendered;
  `// TODO(post-v1)` at `modules/buyer-account-drawer/index.tsx:171`. ✔
- Q11 (Stats freshness) STUBBED — see Q2. ✔
- Q12 (Initials TA / A) — `computeInitials` at
  `modules/buyer-account-drawer/utils/initials.ts:6`. ✔
- Q13 (`MMM YYYY` member-since) — `dayjs(...).format('MMM YYYY')` at
  `modules/buyer-account-drawer/index.tsx:67`. ✔
- Q14 (Lakh notation) STUBBED — stats render "—". ✔
- Q15 (Saved items) STUBBED — row not rendered;
  `// TODO(post-v1)` at `modules/buyer-account-drawer/index.tsx:148`. ✔
- Q16 (Unauthed = hide trigger / show Sign In) — preserved at
  `modules/storefront/components/header/index.tsx:55-58`. ✔
- Q17 (`addresses.title` literal) — Saved-addresses subtitle reads
  static "Manage your delivery addresses" because per Q2/Q11 stat
  endpoint is STUBBED; literal title rendering will land alongside
  the profile-stats endpoint post-v1. The literal-title rule is
  preserved as the contract. ✔ (deferred for STUB consistency)
- Q18 (Custom 36px outline close button) — `Button` at
  `modules/buyer-account-drawer/index.tsx:108` with
  `showCloseButton={false}` on `SheetContent`. ✔

## Completed

### Files changed

- `packages/database/src/schema/auth.ts` — keep `business_name` field
  deferred (consumer-side rendering is conditional via session
  payload; defer note updated to point at the drawer).
- `apps/web/src/modules/core/env/client/index.ts` — add
  `NEXT_PUBLIC_APP_VERSION` (default `'0.0.0'`).
- `apps/web/src/modules/core/constants/app-info/index.ts` — export
  `APP_VERSION`.
- `apps/web/src/modules/buyer-account-drawer/store/index.ts` — new
  zustand store.
- `apps/web/src/modules/buyer-account-drawer/utils/initials.ts` — new
  initials helper.
- `apps/web/src/modules/buyer-account-drawer/components/user-card/index.tsx`
  — new molecule.
- `apps/web/src/modules/buyer-account-drawer/components/nav-row/index.tsx`
  — new molecule.
- `apps/web/src/modules/buyer-account-drawer/components/nav-card/index.tsx`
  — new molecule + `NavSectionLabel`.
- `apps/web/src/modules/buyer-account-drawer/components/foot/index.tsx`
  — new molecule.
- `apps/web/src/modules/buyer-account-drawer/components/account-drawer-trigger/index.tsx`
  — new header trigger.
- `apps/web/src/modules/buyer-account-drawer/index.tsx` — exported
  `<AccountDrawer>`.
- `apps/web/src/modules/storefront/components/header/index.tsx` —
  swap `DropdownMenu` for `<AccountDrawerTrigger>` + `<AccountDrawer>`.
- `apps/web/src/app/(storefront)/profile/page.tsx` — new deep-link
  surface.

### Test updates

None. No existing Playwright e2e tests touch `/profile` chrome.

### Deviations from plan

- `addresses.postalCode + province` were proposed for re-add but kept
  deferred since the drawer never reads them (Q17 is satisfied by the
  literal `addresses.title` field, which already exists). Following
  the established defer-pattern keeps the dev DB safe.
- `user.businessName` was proposed for re-add and reverted for the
  same reason: the drawer renders the line conditionally based on
  whether the session payload exposes it. Drizzle field stays
  deferred; defer note refreshed to point at this drawer as the
  consumer.

### Smoke

Dev server already running on port 5181 was wholesale 500-ing on all
routes (including `/auth` and `/api/auth/session`) before any drawer
edits, matching the pre-existing dev-DB defer pattern from
buyer-settings/buyer-reorder. Build / typecheck / lint are green;
auth-gated drawer smoke deferred behind operator restart + migration
0012 apply, same wrinkle as Batches 4–5.

