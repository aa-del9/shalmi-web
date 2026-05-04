# Buyer · Signup (Generic) — Implementation Log

> **Phase:** Per-screen implementation (Batch 7, screen 3 of 5).
> **Date:** 2026-05-04.
> **Spec source:** `.claude-revamp/screens/buyer-signup-generic/gap-analysis.md` Q1–Q11.

## Step A — Plan

### Files to create
- `packages/database/migrations/0013_user_retailer_type.sql` — `ALTER TABLE "user" ADD COLUMN "retailer_type" text;`.
- `packages/schemas/src/auth/signup.ts` — single `signupSchema = z.discriminatedUnion('retailerType', [generic, shopkeeper])`. The shopkeeper variant ships ahead of its UI (screen 4) — schema-only, server route already validates both.
- `apps/web/src/app/api/auth/post-signup/route.ts` — drains the sessionStorage hand-off and writes `name + retailerType` (and shop fields when shopkeeper) onto the now-authenticated user row.
- `apps/web/src/modules/auth/utils/pending-signup.ts` — sessionStorage helpers (`set/read/clearPendingSignup`).
- `apps/web/src/modules/auth/components/signup/index.tsx` — page shell wrapping the variant-specific form.
- `apps/web/src/modules/auth/components/signup/generic-form.tsx` — generic signup form (Full name + Phone).
- `apps/web/src/modules/auth/components/signup-type-switcher/index.tsx` — segmented Generic ↔ Shopkeeper switcher (Q4(a)).

### Files to edit
- `packages/database/migrations/meta/_journal.json` — append idx 13.
- `packages/database/src/schema/auth.ts` — declare `retailerType: text('retailer_type')`.
- `packages/schemas/package.json` — export `./auth/signup`.
- `apps/web/src/modules/auth/server/auth-client/index.ts` — add `retailerType` to `additionalFields`.
- `apps/web/src/modules/auth/components/otp-verification/index.tsx` — drain `pendingSignup` after a successful verify and POST it to `/api/auth/post-signup`.
- `apps/web/src/app/(auth)/sign-up/page.tsx` — render `<Signup />` (replaces the empty `<div />` stub).
- `apps/web/src/app/(auth)/layout.tsx` — collapse the legacy centered-modal shell to a pass-through; `/sign-up` now owns its own page chrome.

### Schema / type changes
- DB: `user.retailer_type text NULL`.
- Drizzle: `user.retailerType: text('retailer_type')`.
- Better-auth `additionalFields.retailerType` (input: false — written by post-signup route, never by the auto-create path).
- Zod: `@repo/schemas/auth/signup` discriminated union (generic + shopkeeper variants both defined; only generic UI ships in this commit).

### API / server-action changes
- `POST /api/auth/post-signup` — session-guarded; body validated by `signupSchema`; writes `name`, `retailerType`, and (when `shopkeeper`) `shopName + shopAddress`. The shopkeeper path will write to columns that don't exist until screen 4 ships migration `0014_user_shop_columns`; safe because the shopkeeper UI doesn't ship until that commit either.

### New molecules introduced (screen-local)
- `SignupTypeSwitcher` — segmented control.
- `GenericSignupForm` — generic-variant form.

## Step C — Quality gate

| Gate | Result |
|---|---|
| `pnpm exec tsc --noEmit` (apps/web) | ✅ exit 0 |
| `pnpm lint` | ✅ "No ESLint warnings or errors" |
| `pnpm build` (with dev `CRON_SECRET`) | ✅ exit 0 — `/sign-up` ships at 7.73 kB |
| Migration apply on dev DB | DEFERRED — Batch 5 / 6 precedent (operator runs `drizzle-kit migrate`). Drizzle and migration file are in sync. |
| Playwright smoke | DEFERRED — same Twilio/dev-DB defer as buyer-signin / buyer-otp. |

## Spec adherence (Q1–Q11 → file:line)

- **Q1 — "6-digit OTP" hint:** `signup/generic-form.tsx:163`.
- **Q2 — "30 seconds" sub copy verbatim:** `signup/index.tsx:67`.
- **Q3 — EN/اردو toggle hidden:** `signup/index.tsx:54-55` (no toggle rendered).
- **Q4 — Single `/sign-up?type=...` route + in-page form swap:** `signup-type-switcher/index.tsx:23` updates the `type` query.
- **Q5 — Name validation min 2 / max 80 / `/^[\p{L}\s.'-]+$/u`:** `packages/schemas/src/auth/signup.ts:14-22`; consumed at `generic-form.tsx:51`.
- **Q6 — Continue copy stays + spinner replaces chevron:** `generic-form.tsx:151-159`.
- **Q7 — Static Terms & Privacy text:** `signup/index.tsx:79`.
- **Q8 — sessionStorage hand-off:** `pending-signup.ts` + `generic-form.tsx:60` writes; `otp-verification/index.tsx:84-99` drains.
- **Q9 — Inline conflict error with linked Sign in:** `generic-form.tsx:120-129`.
- **Q10 — No back button on mobile signup:** `signup/index.tsx:46` passes `showBack={false}` to `AuthMobileAppBar`.
- **Q11 — Fill `/sign-up` stub:** `app/(auth)/sign-up/page.tsx`.

## Completed

### Files created
- `packages/database/migrations/0013_user_retailer_type.sql`
- `packages/schemas/src/auth/signup.ts`
- `apps/web/src/app/api/auth/post-signup/route.ts`
- `apps/web/src/modules/auth/utils/pending-signup.ts`
- `apps/web/src/modules/auth/components/signup/index.tsx`
- `apps/web/src/modules/auth/components/signup/generic-form.tsx`
- `apps/web/src/modules/auth/components/signup-type-switcher/index.tsx`

### Files edited
- `packages/database/migrations/meta/_journal.json`
- `packages/database/src/schema/auth.ts`
- `packages/schemas/package.json`
- `apps/web/src/modules/auth/server/auth-client/index.ts`
- `apps/web/src/modules/auth/components/otp-verification/index.tsx`
- `apps/web/src/app/(auth)/sign-up/page.tsx`
- `apps/web/src/app/(auth)/layout.tsx`

### Test updates
None.

### Deviations from plan
- Shopkeeper zod variant lands ahead of its UI (Q11(a) prescribes a single discriminated union; doing it now avoids a schema rewrite in screen 4). The `/api/auth/post-signup` route already accepts both variants — the shopkeeper write path references `user.shopName / user.shopAddress` columns that land in screen 4.
- `?type=shopkeeper` currently falls through to the generic form (with the switcher visually flipped) until screen 4 lands the shopkeeper UI. Mid-batch state — no 404, just a fallback rendering.
