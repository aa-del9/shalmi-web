# Buyer · OTP Verification — Implementation Log

> **Phase:** Per-screen implementation (Batch 7, screen 2 of 5).
> **Date:** 2026-05-04.
> **Spec source:** `.claude-revamp/screens/buyer-otp/gap-analysis.md` Q1–Q14.

## Step A — Plan

### Files to create

- `apps/web/src/modules/auth/components/otp-grid/index.tsx` — 6-box OTP input molecule with auto-focus, auto-advance on type, backspace step-back, paste-to-fill, auto-submit on 6th digit (Q10(a)).
- `apps/web/src/modules/auth/components/otp-help-dialog/index.tsx` — static FAQ dialog opened by "Get help" (Q6(c)).
- `apps/web/src/modules/auth/components/otp-verification/index.tsx` — full new screen (replaces `OtpVerificationForm`).
- `.claude-revamp/screens/buyer-otp/implementation-log.md`.

### Files to edit

- `apps/web/src/app/auth/otp/page.tsx` — render `<OtpVerification />` instead of legacy `<OtpVerificationForm />`.

### Files to delete (after gate green)

- `apps/web/src/modules/auth/components/otp-verification-form/index.tsx`

### Schema / type changes

None. Per gap-analysis §3.1 the existing better-auth `otpLength: 6` config is unchanged; the 6-box grid is UI-only.

### API / server-action changes

None. The OTP grid still calls `authClient.phoneNumber.verify` exactly as the legacy form did.

### New molecules introduced (screen-local)

- `OtpGrid` — accepts `length`, `value`, `onChange`, `onComplete`, `disabled`, `invalid`. Auto-focus first box on mount.
- `OtpHelpDialog` — Sheet/Dialog with static FAQ.
- Inline-only on this screen: SECURE stamp (uses `Stamp variant="success"` rotated -2°), caution row, resend timer.

## Step C — Quality gate

| Gate | Result |
|---|---|
| `pnpm exec tsc --noEmit` (apps/web) | ✅ exit 0 |
| `pnpm lint` | ✅ "No ESLint warnings or errors" |
| `pnpm build` (with dev `CRON_SECRET`) | ✅ exit 0 — `/auth/otp` ships at 4.51 kB→ now ~5 kB after molecule swap |
| Playwright smoke | DEFERRED — same Twilio/dev-DB defer as buyer-signin. |
| Existing e2e | n/a — no e2e covers this path. |

## Spec adherence (Q1–Q14 → file:line)

- **Q1 — "6-digit code" sub copy:** `otp-verification/index.tsx:158`.
- **Q2 — 42s countdown:** `auth/constants.ts:11`; `otp-verification/index.tsx:33` initialises from constant.
- **Q3 — Cap at 3 resends, foreground Get help:** `auth/constants.ts:14`; `otp-verification/index.tsx:38-40` + the timer label / Resend button branch on `resendsExhausted`.
- **Q4 — Verify CTA copy stays + spinner replaces chevron:** `otp-verification/index.tsx:185-200`.
- **Q5 — Change number → /auth (no query):** `otp-verification/index.tsx:163, 169`.
- **Q6 — Help dialog with static FAQ:** `otp-help-dialog/index.tsx`; trigger at `otp-verification/index.tsx:227-235`.
- **Q7 — Inline red helper for wrong code; toast for resend network errors:** `otp-verification/index.tsx:178` (inline) + `otp-verification/index.tsx:99` (toast on resend send).
- **Q8 — Lockout: disable grid + Verify, keep on page, reset timer:** `otp-verification/index.tsx:69-76`.
- **Q9 — STEP 2 OF 2 always rendered:** `otp-verification/index.tsx:148`.
- **Q10 — Auto-submit on 6th digit:** `otp-grid/index.tsx:74` calls `onComplete` when `cleaned.length === length`; `otp-verification/index.tsx:174` wires to `handleVerify`.
- **Q11 — Mobile "Change number" on a separate line:** `otp-verification/index.tsx:166-171` uses `md:hidden` / `md:inline` siblings.
- **Q12 — Mobile back chevron `router.back()`:** inherited from `auth-mobile-app-bar/index.tsx:34`.
- **Q13 — Phone preview format `+92 NNN NNNNNNN`:** `auth/utils/phone-format.ts:21` `formatPakistanE164ForDisplay`; consumed at `otp-verification/index.tsx:35`.
- **Q14 — Missing-phone fallback verbatim:** `otp-verification/index.tsx:108-126`.

## Completed

### Files created
- `apps/web/src/modules/auth/components/otp-grid/index.tsx`
- `apps/web/src/modules/auth/components/otp-help-dialog/index.tsx`
- `apps/web/src/modules/auth/components/otp-verification/index.tsx`

### Files edited
- `apps/web/src/app/auth/otp/page.tsx` — render `<OtpVerification />`.
- `apps/web/src/modules/auth/constants.ts` — `OTP_RESEND_COUNTDOWN_SECONDS`, `OTP_RESEND_MAX_ATTEMPTS` were added in the buyer-signin commit so they were ready here.

### Files deleted
- `apps/web/src/modules/auth/components/otp-verification-form/index.tsx` + dir.

### Test updates
None.

### Deviations from plan
- The lockout sniff (`/too many|invalid attempts|exceed/i`) is a heuristic on the better-auth error message because the SDK doesn't expose a typed lockout code. If the message wording changes in a better-auth upgrade the substring match needs to follow.

