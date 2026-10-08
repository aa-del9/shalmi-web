# Buyer · Sign-in — Implementation Log

> **Phase:** Per-screen implementation (Batch 7, screen 1 of 5).
> **Date:** 2026-05-04.
> **Spec source:** `.claude-revamp/screens/buyer-signin/gap-analysis.md` Q1–Q16.
> **Pencil source:** Desktop `b1fhr`, Mobile `P6J3f`.

## Step A — Plan

### Files to create

- `apps/web/src/modules/auth/components/sign-in/index.tsx` — full-page sign-in client component (replaces `AuthModal`).
- `apps/web/src/modules/auth/components/phone-chip-input/index.tsx` — `+92` phone chip + 10-digit input molecule (consumed by sign-in, OTP echo line, signup, checkout one-time-addr).
- `apps/web/src/modules/auth/components/auth-brand-cluster/index.tsx` — logo tile + "Shalmi" wordmark + "Bazaar consolidation" tagline (reused on every auth screen).
- `apps/web/src/modules/auth/components/auth-mobile-app-bar/index.tsx` — mobile app-bar chrome (back chevron + brand wordmark + cart icon).
- `apps/web/src/modules/auth/utils/phone-format.ts` — `formatPhoneE164ToDisplay()` `+92 NNN NNNNNNN`, `parseDigitsOnly()`, `assemblePakistanE164(digits10)`.
- `apps/web/src/modules/auth/constants.ts` — `PAKISTAN_MOBILE_REGEX = /^3\d{9}$/` (Q11 (a)).

### Files to edit

- `apps/web/src/app/auth/page.tsx` — render new `<SignIn />` (replaces `<AuthPageContent />`).
- `apps/web/src/app/(auth)/sign-in/page.tsx` — redirect to `/auth` (Q15 (a) — `/auth` is the canonical sign-in URL).
- `apps/web/src/modules/cart/stores/cart-store.ts` — add `guestSessionId: string | null`, `setGuestSessionId(id)`, `clearGuestSessionId()`; bump `STORAGE_VERSION` to 3 to migrate persist payloads.
- `apps/web/src/app/(storefront)/cart/page.tsx` — replace `openAuthModal` with `router.push('/auth?redirect=/checkout')` (Q16 (a) — repoint embedded modal triggers to the page).
- `apps/web/src/modules/cart/components/cart-summary/index.tsx` — same.
- `apps/web/src/modules/root-layout/global-modals/index.tsx` — remove `AuthModal` mount.
- `apps/web/src/modules/core/stores/modal-store.ts` — remove `openAuthModal` (becomes empty store; left in place for future modal reuse).

### Files to delete (after build green)

- `apps/web/src/modules/auth/components/auth-modal/index.tsx`
- `apps/web/src/modules/auth/components/auth-page-content/index.tsx`

### Schema / type changes

None for sign-in. (`user.retailerType` lands with the generic-signup screen; `orders.guestSessionId` lands with the checkout augment.)

### API / server-action changes

None for sign-in. The existing `authClient.phoneNumber.sendOtp` call is unchanged.

### New molecules introduced (screen-local)

- `PhoneChipInput` — composable input pair (chip + 10-digit input). Re-exported as `@/modules/auth/components/phone-chip-input` for reuse within the batch.
- `AuthBrandCluster` — visual primitive for the auth surface header.
- `AuthMobileAppBar` — mobile-only header chrome.
- Inline-only on this screen: dashed paper hint card; OR divider; benefits card; tertiary subtle link row; signup CTA row.

### Navigation entry points to wire

- `/auth` is the sign-in URL (route already exists; switching from `<AuthPageContent />` to `<SignIn />`).
- "Create an account" link → `/sign-up?type=generic` (route is currently a stub `<div />`; sign-in just references it — the actual signup screen lands in screen 3 of this batch).
- "Continue as Guest" → `/cart` if cart empty, `/checkout` if items present (Q5 (b)). Mints `guestSessionId` in cart-store first (Q6 (a)). The `/checkout` page guard relaxation to honor `guestSessionId` lands with the checkout augment (screen 5); until then, the guest path will bounce to `/auth` from `/checkout` — acceptable mid-batch state.

## Step C — Quality gate

| Gate | Result |
|---|---|
| `pnpm exec tsc --noEmit` (apps/web) | ✅ exit 0 |
| `pnpm lint` (apps/web) | ✅ "No ESLint warnings or errors" |
| `pnpm build` (apps/web, with dev `CRON_SECRET`) | ✅ exit 0 — `/auth` ships at 7.7 kB; `/sign-in` is now a 266 B redirect |
| Playwright smoke | **DEFERRED** — auth flow needs a Twilio test number and the dev DB. Same defer pattern as Batches 5/6 (vendor-ledger / buyer-account-drawer). |
| Existing e2e | n/a — no e2e covers this path; `AuthModal` had none. |

The repo-level `pnpm check-types` fails on a pre-existing `minimatch` type-defs issue in `@repo/{schemas,constants,hooks,contexts}` that is unrelated to Batch 7. The `apps/web` `pnpm exec tsc --noEmit` covers the screen's surface area cleanly.

## Spec adherence (Q1–Q16 → file:line)

- **Q1 — 6-digit hint:** `apps/web/src/modules/auth/components/sign-in/index.tsx:172` renders "You'll receive a 6-digit OTP on this number."
- **Q2 — "Welcome back" headline:** `sign-in/index.tsx:111`.
- **Q3 — EN/اردو toggle hidden:** `auth-mobile-app-bar/index.tsx` (no `LanguageToggle` rendered).
- **Q4 — Vendor/Admin tertiary as decorative text:** `sign-in/index.tsx:188` (no `<a>` tag).
- **Q5 — Continue-as-Guest target:** `sign-in/index.tsx:81` branches on `items.length`.
- **Q6 — Mint guestSessionId via crypto.randomUUID + cart-store persistence:** `sign-in/index.tsx:74-83` mints; `cart-store.ts:65-74` persists alongside `items`.
- **Q7 — Cart-store guestSessionId truthy bypass:** lands with the checkout one-time-addr screen (Batch 7 screen 5). Mid-batch state — guest will bounce to `/auth` from `/checkout` until that lands, and that's the only screen authorised to relax the guard.
- **Q8 — Benefits card always visible:** `sign-in/index.tsx:198-227` (no breakpoint conditionals).
- **Q9 — Inline red helper for validation, toast for backend:** `sign-in/index.tsx:140-148` (inline) + `sign-in/index.tsx:69` (toast on `sendOtp` failure).
- **Q10 — Silent auto-signup preserved:** no change to `signUpOnVerification` config; sign-in submits via existing `authClient.phoneNumber.sendOtp` (`sign-in/index.tsx:64`).
- **Q11 — `/^3\d{9}$/` validation:** `constants.ts:5` defines `PAKISTAN_MOBILE_REGEX`; `sign-in/index.tsx:55` enforces.
- **Q12 — "Sending code…" copy preserved:** `sign-in/index.tsx:156`.
- **Q13 — `router.back()` for mobile chevron:** `auth-mobile-app-bar/index.tsx:34`.
- **Q14 — Identical footer copy across breakpoints:** `sign-in/index.tsx:233`.
- **Q15 — `/auth` is the canonical sign-in URL:** `app/auth/page.tsx` renders `<SignIn />`; `app/(auth)/sign-in/page.tsx` redirects to `/auth`.
- **Q16 — Retire AuthModal + AuthPageContent + openAuthModal:** removed from `cart/page.tsx`, `cart-summary/index.tsx`, `global-modals/index.tsx`, `modal-store.ts`. Files deleted: `auth-modal/`, `auth-page-content/`. Embedded triggers repointed to `<Link href="/auth?redirect=…">`.

## Completed

### Files created
- `apps/web/src/modules/auth/components/sign-in/index.tsx` (236 lines)
- `apps/web/src/modules/auth/components/phone-chip-input/index.tsx`
- `apps/web/src/modules/auth/components/auth-brand-cluster/index.tsx`
- `apps/web/src/modules/auth/components/auth-mobile-app-bar/index.tsx`
- `apps/web/src/modules/auth/utils/phone-format.ts`
- `apps/web/src/modules/auth/constants.ts`

### Files edited
- `apps/web/src/app/auth/page.tsx` — render `<SignIn />` instead of `<AuthPageContent />`.
- `apps/web/src/app/(auth)/sign-in/page.tsx` — server-side redirect to `/auth`.
- `apps/web/src/modules/cart/stores/cart-store.ts` — `guestSessionId` field, `setGuestSessionId`, `clearGuestSessionId`; bumped `STORAGE_VERSION` to 3; added `partialize` to keep persisted shape explicit.
- `apps/web/src/app/(storefront)/cart/page.tsx` — `openAuthModal → router.push('/auth?redirect=/checkout')`.
- `apps/web/src/modules/cart/components/cart-summary/index.tsx` — same.
- `apps/web/src/modules/root-layout/global-modals/index.tsx` — empty placeholder; `AuthModal` mount removed.
- `apps/web/src/modules/core/stores/modal-store.ts` — `openAuthModal` removed; `ModalType` collapsed to `null`.

### Files deleted
- `apps/web/src/modules/auth/components/auth-modal/index.tsx` + dir
- `apps/web/src/modules/auth/components/auth-page-content/index.tsx` + dir

### Test updates
None.

### Deviations from plan
None.

### Mid-batch state notes
- "Continue as Guest" mints `guestSessionId` and pushes to `/checkout`, but `/checkout` still enforces `requireSession` server-side and `useEffect`-redirects unauthenticated users to `/auth`. The relaxation lands with the buyer-checkout one-time-addr augment (Batch 7 screen 5). Until then, the guest button is functionally a sign-in bounce.

