# Buyer · OTP Verification — Gap Analysis

> **Phase:** Per-screen gap analysis (read-only, NEW screen).
> **Date produced:** 2026-05-04.
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop frame `Ollyb`, Mobile frame `ItTRI`.
> **Code source:** `apps/web/src/app/auth/otp/page.tsx` (mounts `<OtpVerificationForm>`),
> `apps/web/src/modules/auth/components/otp-verification-form/index.tsx`,
> `modules/auth/client/auth-client/index.ts`,
> `modules/auth/server/auth-client/index.ts` (better-auth phoneNumber plugin: `otpLength: 6`, `expiresIn: 300`s, `allowedAttempts: 3`),
> `modules/auth/utils/redirect.ts` (`getPostAuthRedirectUrl`).
>
> **Inputs read:** `01-codebase-map.md`, `02-design-inventory.md`, `04-design-system-implementation-log.md`, `05-batch-plan.md` (Batch 7 OQs already resolved — see §0), `07-default-proposals.md`.
>
> Per CLAUDE.md hard rule 1, **no implementation is proposed**. Every actionable row in §2 maps to a numbered question in §5.

---

## 0. Plan-level resolutions consumed (do not re-ask)

- **OQ-O** → keep 6-digit OTP; render **6 boxes** in the UI. The 4-box design is illustrative.
- **OQ-V** → unified `/auth` with role auto-detection from phone — `getPostAuthRedirectUrl` (already implemented at `modules/auth/utils/redirect.ts:41`) handles routing post-verify to `/admin`, `/vendor`, or `/`.
- **OQ-G** → real guest checkout. The OTP screen is **not** part of the guest path (guests bypass auth entirely), so guest behavior is out of scope here.
- **OQ-I** → Urdu deferred (no Urdu OTP frame in scope).

---

## 0a. Pencil components used here that were not yet inventoried

- **Caution / advisory row** (`QQ1NP` desktop / `m48Jk` mobile) — paper-2 fill, 1px rule stroke, 8 radius, padding [10,12], gap 10, leading lucide `shield` (16×16 ink-2) + sans 13/500 ink-2 caption "Never share your OTP code with anyone." **Not catalogued.**
- **Rotated `SECURE` stamp** (`UYflJ` desktop, `dQBsq` mobile) — 1° (actually -2° per layout) tilted pill, mono 11/700 green-700 letter-spacing 0.88, with a colored stroke + tinted bg. **Not catalogued.** This is the same primitive class as `02 §3` "Status stamps"; needs a `secure` variant added.
- **OTP box grid** (`d9clH1` desktop / `GtV7l` mobile) — 4 boxes in design (per OQ-O ships 6). Each box: white fill, 1.5px rule-2 border, focused = thicker ink border (`H4PzAL` shows ink stroke + cursor `T7CIIE`), 6 radius, mono digit. Desktop 56w × 64h, mobile 48w × 56h. **Not catalogued.**
- **Resend timer + Get-help row** (`FZRfZ` / `THCoA`) — left mono 13/500 ink-3 "Resend code in 0:42" + right sans 13/700 ink "Get help". Justify-between. **Not catalogued.**
- **Verify and continue CTA** (`w84lOa` / `rh4HL`) — full-width green-2 56h, sans 16/800 white "Verify and continue", trailing chevron-right (`Jhw3m`). Same molecule class as the sign-in `Send OTP` CTA but with trailing icon. **Not catalogued.**
- **"Change number" inline link** (`BBaTU` desktop) — sans 15/700 ink, sits inline at the end of the sub copy. Mobile (`mUC03`/`DdI6O`) shows the sub on a separate line; "Change number" position not inspected — see Q11.

---

## 1. Layout & structure

### Desktop (`Ollyb`, 1440 × 900)

Centered 480-wide white card (`FqEyZ`, h530), inside outer wrapper `u8kwu` at x=480, y=152:

1. **Brand cluster + rotated SECURE stamp** (`Tb5uN`, h38, y=48) — same brand cluster as sign-in (`dpiud` clone of `D3sSR`) + tilted `UYflJ` "SECURE" stamp on the right (rotation -2°).
2. **Caution row** (`QQ1NP`, h36, y=110) — shield icon + "Never share your OTP code with anyone."
3. **Eyebrow** (`FDwNy`, h15, y=170) — mono 11/700 green-700 letter-spacing 1.4 "STEP 2 OF 2".
4. **Headline + sub with inline link** (`U0fadM`, h64, y=209):
   - `d9y3s6` "Verify your number" sans 30/800 ink.
   - `Y54p0h` h21: `s4jlS` "We sent a 4-digit code to +92 300 1234567." sans 15 ink-2 + `BBaTU` "Change number" sans 15/700 ink (NOTE: copy says "4-digit"; ships 6-digit — see Q1).
5. **OTP boxes** (`d9clH1`, h64, y=297) — 4 boxes 56×64, gap 12. First 3 filled with mono digits, 4th has thicker ink border (`H4PzAL`) showing cursor focus state (`T7CIIE`).
6. **Verify CTA** (`w84lOa`, h56, y=385) — "Verify and continue" + chevron-right.
7. **Resend + Get help** (`FZRfZ`, h17, y=465) — "Resend code in 0:42" + "Get help".

Footer copy `HPQpi` below card.

### Mobile (`ItTRI`, 420 × 539)

Mobile app-bar layout (`fiKLU` 56h header same as sign-in), main column `N1ugF` y=56:

1. Brand cluster `jAyii` y=24 + rotated `dQBsq` SECURE stamp on right.
2. Caution row `m48Jk` y=74.
3. STEP 2 OF 2 eyebrow `eFzWC` y=130.
4. Headline + sub `mUC03` y=163 (`c3TEF` headline 30h + `DdI6O` sub 40h — multi-line including "Change number").
5. OTP boxes `GtV7l` y=257 — 4 boxes 48×56, gap 10.
6. Verify CTA `rh4HL` y=331.
7. Resend + Get help `THCoA` y=401.

### Existing code layout (`OtpVerificationForm`)

- `<div className="container flex max-w-md flex-col gap-6 py-12">`:
  - `<h1>Enter verification code</h1>` + `<p>We sent a code to {phone}. Enter it below.</p>`.
  - `<form>` → `<Label>Code</Label>` + single `<Input type="text" inputMode="numeric" maxLength={6} placeholder="000000">` (one input box, not a 6-grid).
  - Error `<p role="alert">` if any.
  - `<Button>` "Verify" / "Verifying…".
- No SECURE stamp, no caution row, no STEP 2 OF 2 eyebrow, no resend timer, no "Get help" link, no "Change number" link.

### High-level layout deltas

- **Single `<Input>` becomes a 6-box grid** (`OTPInput` molecule per `05-batch-plan.md` Batch 7) with auto-advance on type, backspace-step-back, paste-to-fill.
- **NEW `STEP 2 OF 2` eyebrow** (mono green-700).
- **NEW SECURE stamp + caution row.**
- **NEW headline copy** ("Verify your number" vs "Enter verification code").
- **NEW phone preview in sub** (`+92 300 1234567`) — currently the existing form prints raw `phone` query param verbatim.
- **NEW "Change number" inline link** routing back to the sign-in screen with the phone pre-filled (or cleared — see Q5).
- **NEW resend timer with countdown** (currently no resend mechanism in code at all).
- **NEW "Get help" link** (currently no support entry point).
- **NEW Verify CTA copy** ("Verify and continue" vs "Verify").
- **NEW trailing chevron-right on the CTA.**
- **NEW mobile app-bar** (currently mobile uses the same centered container).

---

## 2. Element-by-element diff

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Brand cluster + SECURE stamp `Tb5uN`/`rF8YC` | (none) | Brand cluster reused from sign-in; SECURE stamp is new. | NEW_FIELD |
| Caution row `QQ1NP`/`m48Jk` ("Never share your OTP code with anyone.") | (none) | New advisory molecule, paper-2 with shield icon. | NEW_FIELD |
| Eyebrow `FDwNy`/`eFzWC` "STEP 2 OF 2" mono 11/700 green-700 letter-spacing 1.4 | (none) | New copy + style. Implies a 2-step flow, but sign-in does not show "STEP 1 OF 2" — only signup screens do. See Q9. | NEW_FIELD |
| Headline `d9y3s6`/`c3TEF` "Verify your number" 30/800 (desktop) | `<h1>Enter verification code</h1>` | Copy + size change. | COPY_CHANGE |
| Sub `s4jlS`/`DdI6O` "We sent a 4-digit code to +92 300 1234567." | `<p>We sent a code to {phone}. Enter it below.</p>` | Copy adds "4-digit" (illustrative; per OQ-O ships 6-digit — see Q1) and a formatted phone preview ("+92 300 1234567" with space groupings). Today phone is rendered as the raw query string. | COPY_CHANGE |
| Inline link `BBaTU` "Change number" | (none) | New navigation back to sign-in. Behaviour: clear the phone? pre-fill the phone? both? See Q5. | NEW_INTERACTION |
| 6-box (per OQ-O) OTP grid `d9clH1`/`GtV7l` — auto-focus first box, auto-advance on type, mono digits, focused box has thicker ink border | Single `<Input>` accepting up to 6 digits via maxLength | Whole UX change. Schema-level submit value is identical (6-char digit string) so wire format unchanged. New molecule. | CHANGED_INTERACTION |
| Verify CTA `nem5m` "Verify and continue" + chevron-right | `<Button>` "Verify" / "Verifying…" | Copy change ("Verify and continue" vs "Verify"); leading/trailing icon (chevron-right) added. Loading copy not drawn. See Q4. | COPY_CHANGE |
| Resend timer `RiY4W` "Resend code in 0:42" mono 13/500 ink-3 | (no resend) | New countdown timer with eventual transition to a clickable "Resend code" link when timer expires. Default duration 42s? 60s? See Q2 + Q3. | NEW_INTERACTION |
| "Get help" link `mNseP` sans 13/700 ink | (none) | New support entry point. Target undrawn — see Q6. | NEW_INTERACTION |
| Mobile app-bar `fiKLU` (back chevron + "OTP" eyebrow + EN toggle + cart) | (none) | New mobile chrome. Back chevron behaviour same question as sign-in Q13. See Q12. | NEW_INTERACTION |
| Inline error after wrong code | `setError(verifyError.message ?? 'Verification failed')` red text | Today red helper text. Design has no error frame. See Q7. | AMBIGUOUS |
| Lockout after `allowedAttempts: 3` | (no UI handling — error message returned by better-auth surfaces verbatim) | Per server config, after 3 wrong attempts the OTP is invalidated. UI behavior on lockout undrawn. See Q8. | NEW_STATE |
| Auto-advance on type / backspace step-back / paste-to-fill | (single input — none of these patterns) | New OTP grid behavior. Standard, but exact behaviors undrawn. See Q10. | NEW_INTERACTION |
| Missing-phone fallback (today: "Missing phone number. Please start by entering your phone number…") | `OtpVerificationForm:50-63` renders a fallback link to `/auth` | Design has no fallback frame. Implied: the design assumes the phone is always present (because the only entry to this page is via `/auth` Send OTP). See Q14. | AMBIGUOUS |

---

## 3. Schema / type implications

### 3.1 OTP code length: 6 (per OQ-O)

- No schema change. `better-auth` phoneNumber plugin is already configured `otpLength: 6` (`auth-client/index.ts:49`). The 6-box grid is a UI-only molecule.

### 3.2 Resend cooldown

- No schema change required if implemented purely client-side as a setTimeout countdown.
- A server-side rate-limit on `authClient.phoneNumber.sendOtp` is implicit in better-auth's resend semantics (re-sending creates a new verification row in the `verification` table). No new column, but the resend duration default and lockout-after-N-resends UX must be specified — see Q3.

### 3.3 "Change number" navigation

- No schema change. A `<Link>` to `/auth?phone=…` (pre-filled) or `/auth` (empty). See Q5.

### 3.4 Post-verify redirect

- No schema change. Existing `getPostAuthRedirectUrl(redirectUrl, role)` already handles role-based routing. Per OQ-V, this is the unified entry-point — same behaviour applies for buyer / vendor / admin flows.

---

## 4. Behavior implications

### 4.1 6-box OTP grid

- New `OTPInput` molecule (per `05-batch-plan.md` Batch 7 watchout). Behaviors needed: auto-focus first box on mount; on key digit → write + focus next; on backspace empty box → focus + clear previous; on paste → distribute digits across boxes.
- On 6 boxes filled → either auto-submit verify or wait for explicit Verify button click. See Q10.

### 4.2 Resend countdown

- On mount, start countdown from N seconds. Render mono "Resend code in 0:42". When 0 → swap to a clickable "Resend code" link.
- On click after expiry → call `authClient.phoneNumber.sendOtp({ phoneNumber: phone })` again, restart countdown, optionally show a toast ("Code re-sent").
- Lockout after K resends? See Q3.

### 4.3 Change number navigation

- `<Link href="/auth">` (clearing the phone) or `<Link href="/auth?phone=…">` (pre-filled) — behavior undrawn. See Q5.

### 4.4 Get help

- Either a `<Link href="mailto:?…">` (support email), a `<Link>` to a `/help` route, or a `useModalStore` open → support modal. Existing code has none of these. See Q6.

### 4.5 Error & lockout

- Wrong code: today inline red helper text. Per OQ-O resolution + design omission, see Q7.
- Lockout after 3 wrong attempts: better-auth returns an error; UX TBD — see Q8.

---

## 5. Open questions for me

### Copy

1. **Hint copy "4-digit code" vs ship-time 6-digit.**
   - **Observed in design:** Sub `s4jlS` "We sent a 4-digit code to +92 300 1234567."
   - **Observed in code:** Shipping with 6-digit (per OQ-O).
   - **Question:** Update sub copy to "6-digit code", strip the digit count entirely, or keep "4-digit" verbatim?
   - **Plausible answers:** (a) "We sent a 6-digit code to {phone}." (b) "We sent a code to {phone}." (c) Keep "4-digit" verbatim.
**Answer:** (a) "We sent a 6-digit code to {phone}." Match implementation per OQ-O. Mirrors the sign-in Q1 resolution.

2. **Resend countdown duration.**
   - **Observed in design:** Timer label `RiY4W` reads "Resend code in 0:42" — implies 42s static or current-state snapshot.
   - **Observed in code:** No resend.
   - **Question:** Initial countdown duration?
   - **Plausible answers:** (a) 42s — match the design literally. (b) 60s — common SMS cooldown. (c) 30s — minimum reasonable cooldown given Twilio rate limits.
**Answer:** (a) 42s — match the design literally. Stored as a constant; easy to change later if Twilio costs spike.

3. **Resend cooldown lockout behavior.**
   - **Observed in design:** Single timer; no "max resends" copy drawn.
   - **Observed in code:** None.
   - **Question:** Allow infinite resends with a fixed cooldown each time, cap at N total resends per session, or escalate cooldown after each resend (42s → 90s → 180s)?
   - **Plausible answers:** (a) Infinite, fixed cooldown. (b) Cap at 3 resends per session, then disable + show "Get help" prominently. (c) Escalating cooldown.
**Answer:** (b) Cap at 3 resends per session, then disable Resend + foreground "Get help". Matches better-auth's `allowedAttempts: 3` semantics — a buyer who can't get the code in 3 sends has a Twilio/SIM problem, not a UX problem.

4. **Verify CTA copy + trailing icon during loading.**
   - **Observed in design:** "Verify and continue" + chevron-right. No loading frame.
   - **Observed in code:** "Verifying…" replaces the label; no icon.
   - **Question:** During submit, what does the CTA look like?
   - **Plausible answers:** (a) Swap to inline Spinner + "Verifying…", drop the chevron. (b) Keep "Verify and continue" copy + spinner replaces chevron. (c) Disabled with no copy change, spinner overlay.
**Answer:** (b) Keep "Verify and continue" copy; swap the trailing chevron-right for an inline spinner; button disabled. Cleanest visual; doesn't reflow the label.

### Navigation

5. **"Change number" target.**
   - **Observed in design:** Inline ink link `BBaTU` next to the sub.
   - **Observed in code:** None.
   - **Question:** Where does it route, and does it preserve the phone?
   - **Plausible answers:** (a) `/auth` with no query params (clears phone). (b) `/auth?phone={current}` (pre-fills the chip+input — but the user wants to *change* it, so pre-filling is counter-productive). (c) `router.back()` — bounces to whatever sent the user here.
**Answer:** (a) `/auth` with no query params. The user clicked "Change number" because the current number is wrong; pre-filling defeats the purpose. They start a fresh sign-in.

6. **"Get help" target.**
   - **Observed in design:** Sans 13/700 ink link `mNseP` "Get help".
   - **Observed in code:** None.
   - **Question:** Target?
   - **Plausible answers:** (a) `mailto:` to a support address. (b) Internal `/help` route (does not exist yet). (c) Open a help dialog with a static FAQ.
**Answer:** (c) Open a help dialog with a static FAQ ("Didn't get the code? — wait 60s, check signal, try Change number, contact support"). No new route; bounded scope.

### States

7. **Wrong-code error display.**
   - **Observed in design:** No error frame.
   - **Observed in code:** Inline red `<p role="alert">` under the form.
   - **Question:** Inline red helper, toast, or shake-the-grid red border?
   - **Plausible answers:** (a) Inline red helper text under the OTP grid (current pattern). (b) Sonner toast + red border on the OTP boxes. (c) Both — inline red helper text *and* red border on each box.
**Answer:** (a) Inline red helper text under the OTP grid. Match the existing pattern; no shake animation, no toast for a wrong-code (validation, not network). Network/Twilio errors still go to a Sonner toast (mirrors sign-in Q9 / `buyer-checkout` Q20).

8. **Lockout after 3 wrong attempts.**
   - **Observed in design:** No lockout frame.
   - **Observed in code:** Server returns an error (better-auth `allowedAttempts: 3`). UI surfaces it verbatim.
   - **Question:** UX on lockout?
   - **Plausible answers:** (a) Disable the OTP grid + Verify button, show "Too many attempts. Resend code or try again later" with a prominent Resend button (timer reset). (b) Force-redirect to `/auth` with a toast ("Too many attempts. Please request a new code."). (c) Show a modal explaining the lockout with a "Get help" CTA.
**Answer:** (a) Disable the grid + Verify; show "Too many attempts — resend the code or try again in a moment." Reset the resend timer to its initial duration. Keeps the user on the same page with a clear next step.

9. **STEP 2 OF 2 eyebrow on a route accessible without a STEP 1.**
   - **Observed in design:** "STEP 2 OF 2" implies a 2-step flow. Sign-in does not show "STEP 1 OF 2" — only the signup screens do.
   - **Observed in code:** None.
   - **Question:** Is the eyebrow shown only when arriving from a signup flow (where step 1 is "details"), or always?
   - **Plausible answers:** (a) Always — the "step 1" was implicitly "phone entry" on `/auth`. (b) Conditional — show "STEP 2 OF 2" only when arriving from `/auth/sign-up` (need a query param or referrer hint), hide otherwise. (c) Drop the eyebrow on the OTP screen reached from sign-in; keep only on the signup → OTP transition.
**Answer:** (a) Always render "STEP 2 OF 2". Sign-in's phone entry counts as step 1 implicitly; matches the design literally and avoids referrer plumbing. The minor copy inaccuracy is acceptable.

### Behavior

10. **Auto-submit on 6th digit?**
    - **Observed in design:** No frame for auto-submit.
    - **Observed in code:** No auto-submit (single input + manual button click).
    - **Question:** Once all 6 boxes are filled, does verification fire automatically, or does the user click Verify?
    - **Plausible answers:** (a) Auto-submit on 6th digit (fewer clicks; matches platform conventions like iOS SMS auto-fill). (b) Always require explicit click. (c) Auto-submit only when the input came from a paste; require click otherwise.
**Answer:** (a) Auto-submit on 6th digit. Matches platform convention; the Verify CTA stays in the layout for accessibility / fallback.

11. **"Change number" placement on mobile.**
    - **Observed in design:** Desktop has it inline at the end of the sub. Mobile (`mUC03`/`DdI6O`) shows the sub on its own with `DdI6O` h40 — couldn't confirm in the snapshot whether "Change number" sits inline or on a separate line.
    - **Observed in code:** None.
    - **Question:** Inline vs separate line on mobile?
    - **Plausible answers:** (a) Inline at the end of the sub (matches desktop). (b) Separate line below the sub. (c) Trailing chevron icon-only button next to the phone.
**Answer:** (b) Separate line below the sub on mobile (the layout `mUC03` already shows a 40h block consistent with two-line stacking); inline on desktop. Honors the responsive split implied by the frame heights.

12. **Mobile app-bar back chevron target.**
    - **Observed in design:** Back chevron (`PiXHw` lucide chevron-left).
    - **Observed in code:** None.
    - **Question:** Target?
    - **Plausible answers:** (a) `router.back()` (likely → sign-in). (b) Always `/auth` (sign-in). (c) `router.back()` but if no history → `/auth`.
**Answer:** (a) `router.back()`. Matches sign-in Q13. The OTP screen always has a non-empty history because `/auth` Send-OTP got the user here.

13. **Phone preview format.**
    - **Observed in design:** Sub renders "+92 300 1234567" — i.e. spaces grouped `(+92) (XXX) (XXXXXXX)`.
    - **Observed in code:** Renders raw `phone` query value verbatim (`+923001234567`).
    - **Question:** Adopt the design's grouping format?
    - **Plausible answers:** (a) `+92 NNN NNNNNNN` exact format from design. (b) `+92-NNN-NNNNNNN` dashed. (c) Raw E.164 (current behaviour).
**Answer:** (a) `+92 NNN NNNNNNN` — exactly the design's space-grouped format. Small client-side formatter; no schema impact.

14. **Missing-phone fallback frame.**
    - **Observed in design:** None — design assumes phone is always present.
    - **Observed in code:** A "Missing phone number" panel with a link back to sign-in.
    - **Question:** Keep the existing fallback panel, or hard-redirect to `/auth` server-side?
    - **Plausible answers:** (a) Keep the existing inline fallback panel verbatim. (b) Server-side redirect to `/auth` if `phone` query is missing. (c) Render the OTP grid disabled with an inline error pointing back to sign-in.
**Answer:** (a) Keep the existing inline fallback panel verbatim. Smallest delta; the design omits this state, so re-using the established copy is the safe default.

---

**File written to:** `D:\Moeed 8th Sem\Fyp\Code\shalmi-web\.claude-revamp\screens\buyer-otp\gap-analysis.md`

(End of Buyer · OTP gap analysis. Stopping per `BATCH_RUNNER.md` Step A.)
