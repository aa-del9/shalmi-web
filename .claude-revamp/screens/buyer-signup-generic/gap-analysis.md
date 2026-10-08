# Buyer · Signup (Generic) — Gap Analysis

> **Phase:** Per-screen gap analysis (read-only, NEW screen).
> **Date produced:** 2026-05-04.
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop frame `LXwFS`, Mobile frame `R7A69`.
> **Code source:** `apps/web/src/app/(auth)/sign-up/page.tsx` (stub `<div />`),
> `apps/web/src/app/(auth)/layout.tsx`,
> `apps/web/src/modules/auth/components/auth-modal/index.tsx` (existing phone-OTP flow — no signup distinction),
> `modules/auth/server/auth-client/index.ts` (better-auth `signUpOnVerification: { getTempEmail, getTempName }` auto-creates user on first verify),
> `packages/database/src/schema/auth.ts` (`user.name`, `user.phoneNumber unique`, `user.role text default 'retailer'`).
>
> **Inputs read:** `01-codebase-map.md`, `02-design-inventory.md`, `04-design-system-implementation-log.md`, `05-batch-plan.md` (Batch 7 OQs already resolved — see §0), `06-scope-cut.md`.
>
> Per CLAUDE.md hard rule 1, **no implementation is proposed**.

---

## 0. Plan-level resolutions consumed (do not re-ask)

- **OQ-R** → add `user.retailerType` enum (`generic | shopkeeper`) nullable. Generic signup writes `retailerType = 'generic'`.
- **OQ-V** → unified `/auth` entry. Sign-in screen hosts the "New to Shalmi? · Create an account" link that routes here.
- **OQ-G** → guest is a sign-in option, **not** a signup option. No Guest button on this screen.
- **OQ-O** → 6-digit OTP shipped; design's "4-digit" copy is illustrative.
- **OQ-I** → no Urdu variant (generic signup never had Urdu in the design).

---

## 0a. Pencil components used here that were not yet inventoried

- **`GENERIC USER` eyebrow** (`X4raN`) — mono 11/700 ink-3 letter-spacing 0.16. Sits left of the language toggle (`fuj1v` desktop; mobile has it differently). **Not catalogued.**
- **EN/اردو language toggle** (`fuj1v` desktop / `fApyj` mobile) — segmented 2-cell pill: `yiMAe` "EN" cell (active, ink fill, white text) + `lwyeD` "اردو" cell (paper-2, Noto Nastaliq Urdu glyph). Per OQ-I Urdu is deferred — toggle is presentational only on this batch (see Q3). **Not catalogued.**
- **Generic ↔ Shopkeeper segmented switcher** (`S32YR` desktop / `xRLAR` mobile) — 2-cell pill: `ThbtN` (active, green-2 fill, lucide `user` icon `vs3XP` + sans 13/700 white "Generic user") + `x2VCa` (inactive, paper-2, sans 13/600 ink-2 "Shopkeeper"). Mobile flips the icon and adjusts widths. **Not catalogued.**
- **Page headline + sub block** (`uGXhz` desktop / `d99eC` mobile) — sans 32/800 letter-spacing -0.025 "Join Shalmi" (mobile 30/800) + sans 14/normal lineHeight 1.5 ink-2 "For personal restocking. Takes 30 seconds." **Not catalogued.**
- **Labelled text input** (`X3VYbQ`/`jCoKG` desktop, `aS7N9`/`TncOh` mobile) — label sans 13/600 ink-2 + 48h field below. Text inputs use white fill, 1.5px rule-2 stroke, 6 radius, 14/12 padding (per design inventory). The phone field reuses the `+92` chip-input molecule from sign-in. **Inputs already in §3.1; the labelled-stack pattern is not.**
- **Dashed paper OTP-info card** (`ThNeb` / `kAftm`) — same as sign-in's hint card molecule, copy here is "You'll receive a 4-digit OTP on this number to verify." (per OQ-O ships 6-digit — see Q1).
- **Continue CTA** (`gJx3D` / `rmkdg`) — full-width green-2 52h/52h, sans 16/800 white "Continue" + trailing chevron-right (`ielVS` desktop / `ucaIl` mobile).
- **"Already have an account? · Sign in" link row** (`o3XQS1` / `b05U5`) — sans 14 ink-3 ("Already have an account?") + sans 14/700 ink ("Sign in"). Same molecule class as sign-in's "Create an account" row.
- **Terms footer** (`fohHr` desktop / `e9UFnb` mobile) — sans 11/normal ink-3 "By continuing you agree to our Terms & Privacy."

---

## 1. Layout & structure

### Desktop (`LXwFS`, 1440 × 900)

Centered single column, 520-wide white card (`S9TIhn`, h729) inside outer `S7m8fW` x=460 y=85.5:

1. **Brand cluster** (`F0ZtI`, h38, y=40) — same as sign-in.
2. **Eyebrow + language toggle row** (`V8YAu`, h43, y=98) — `X4raN` "GENERIC USER" mono 11/700 ink-3 left + `fuj1v` EN/اردو toggle right.
3. **Generic ↔ Shopkeeper switcher** (`S32YR`, h40, y=161) — pill segmented control.
4. **Headline + sub** (`uGXhz`, h67, y=221) — `WCkkJ` "Join Shalmi" 32/800 ink + `gP6cD` "For personal restocking. Takes 30 seconds." sans 14 ink-2.
5. **Two stacked labelled fields** (`P1OJQG`, h154, y=308):
   - `X3VYbQ` "Full name" label + 48h text input.
   - `jCoKG` "Phone number" label + 48h `+92` chip + 10-digit input.
6. **Continue CTA** (`gJx3D`, h52, y=482).
7. **Dashed OTP-info card** (`ThNeb`, h42, y=554).
8. **Sign-in link row** (`o3XQS1`, h16, y=616).

Footer terms (`fohHr`, y=715).

### Mobile (`R7A69`, 420 × 649)

App-bar layout (`H8TsQb` 71h with logo + EN/اردو + cart) then card column `NhcLb` y=71:

1. Eyebrow + language toggle within `w9qjyD` y=24 (different layout from desktop — eyebrow + brand mark inline left, toggle right).
2. Switcher `xRLAR` y=76.
3. Headline `d99eC` y=134.
4. 2 fields `q2Plpm` y=206 (same shape as desktop, 60h field rows).
5. CTA `rmkdg` y=374.
6. Dashed OTP-info card `kAftm` y=444.
7. Sign-in link `b05U5` y=499.
8. Terms `e9UFnb` y=532.

### Existing code layout

- `app/(auth)/sign-up/page.tsx` → empty stub.
- The current "signup" path is implicit: `signUpOnVerification` in `auth-client/index.ts:40-44` auto-creates a `user` row on first OTP verify, with `name = phoneNumber` and `email = ${digits}@phone.shalmi.local`. There is no actual signup form.

### High-level layout deltas

- **NEW signup form** (Full name + Phone) — today there is no form at all; `name` defaults to the phone number string until the user fills it in via Profile (which itself doesn't exist yet, see `buyer-settings`).
- **NEW segmented switcher** (Generic ↔ Shopkeeper).
- **NEW EN/اردو language toggle** (presentational only per OQ-I; see Q3).
- **NEW retailerType field** captured implicitly by selecting "Generic user" before submit.
- **REMOVED Guest option** (per OQ-G — Guest only on sign-in).

---

## 2. Element-by-element diff

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Brand cluster `F0ZtI` (logo + Shalmi + tagline) | (none) | New chrome. | NEW_FIELD |
| Eyebrow `X4raN` "GENERIC USER" mono 11/700 ink-3 letter-spacing 0.16 | (none) | Identifies which signup variant the user is on. | NEW_FIELD |
| EN/اردو language toggle `fuj1v`/`fApyj` | (none) | Per OQ-I Urdu is deferred. Behaviour: hide / static / interactive — see Q3. | NEW_INTERACTION |
| Generic ↔ Shopkeeper switcher `S32YR`/`xRLAR` (Generic active, lucide `user` icon + "Generic user"; Shopkeeper inactive "Shopkeeper") | (none) | Toggles between this screen and the Shopkeeper signup. Interaction shape: route push, in-page form swap, or query-state? See Q4. | NEW_INTERACTION |
| Headline `WCkkJ` "Join Shalmi" 32/800 + sub `gP6cD` "For personal restocking. Takes 30 seconds." | (none) | New copy + style. | NEW_FIELD |
| Field `nIsmV` "Full name" label + 48h text input | (none — `signUpOnVerification` synthesizes `name = phoneNumber`) | New field captured at signup. Validation rules undrawn — min/max length, allowed characters? See Q5. | NEW_FIELD |
| Field `gv2IY` "Phone number" label + `+92` chip + 10-digit input | `<Input type="tel">` in `AuthModal` | Same chip+input molecule as sign-in. Validation rules same as sign-in Q11 (Pakistan mobile). | CHANGED_INTERACTION |
| Continue CTA `xZpu6` "Continue" + chevron-right (`ielVS`/`ucaIl`) | (none) | New CTA. Loading state copy/icon undrawn — see Q6. | NEW_INTERACTION |
| Dashed OTP-info card `xC8OY` "You'll receive a 4-digit OTP on this number to verify." | (none) | Same hint molecule as sign-in. **Copy says 4-digit; ships 6-digit per OQ-O — see Q1.** | NEW_FIELD |
| Sign-in link row `o3XQS1`/`b05U5` "Already have an account? · Sign in" sans 14/700 ink | (none) | Routes to `/auth` (sign-in screen). | NEW_INTERACTION |
| Terms footer `fohHr`/`Lgauv` "By continuing you agree to our Terms & Privacy." | (none) | New legal copy. Are "Terms" and "Privacy" individual links or a single legal pointer? See Q7. | NEW_FIELD |
| Existing `signUpOnVerification` (silently auto-creates user with `name = phoneNumber`) | (Continue button now writes name + retailerType; phoneNumber+code is verified in the OTP step, then user is upserted) | Behavior diverges: today auto-signup happens at verify time with no name/retailerType collection. With this screen, the form must persist `name` + `retailerType` such that they land on the `user` row when the OTP verifies. Architecture choice: write to a pending-signup table, write directly post-verify, or pass via the OTP step's URL params/storage. See Q8. | CHANGED_INTERACTION |
| Phone-already-registered conflict | None — better-auth's `unique` constraint on `user.phoneNumber` will throw a DB error, surfaced verbatim | New error state. Design omits — see Q9. | NEW_STATE |
| Mobile app bar `H8TsQb` (logo + EN/اردو + cart) | (none) | New mobile chrome. Same shape as sign-in mobile but with logo (not chevron-left back). Back affordance from this screen? See Q10. | NEW_INTERACTION |
| Empty `(auth)/sign-up/page.tsx` stub | (kept) | Routing decision — fill the stub or use `/auth/sign-up`? See Q11. | AMBIGUOUS |

---

## 3. Schema / type implications

### 3.1 `user.name` (existing column)

- Already a `notNull` column on `user`. Today populated as `getTempName(phone) = phone` by better-auth. The new form collects a real value at signup time.
- No schema change. Column already exists.

### 3.2 `user.retailerType` (per OQ-R)

- New nullable column on `user`: `retailerType text` constrained to `generic | shopkeeper`. Drizzle schema migration.
- Better-auth `additionalFields.retailerType` config addition so it is persisted via the user-create path.
- Generic signup always writes `'generic'`; Shopkeeper signup writes `'shopkeeper'`. Existing users (pre-migration) get NULL until they self-identify (no migration backfill needed; the field is nullable).

### 3.3 Capturing `name` + `retailerType` across the OTP boundary

- Today the OTP step is the only thing that creates the user row (`signUpOnVerification`).
- The signup form must hand `name` + `retailerType` to the OTP step somehow, then the verify handler upserts those onto the user row.
- Three plausible architectures (Q8): (a) URL params on the OTP page; (b) sessionStorage write on submit + read on OTP success; (c) `pendingSignup` server-side table that the verify handler reads.

### 3.4 Phone-already-registered

- `user.phoneNumber` is `unique`. A duplicate insert throws a DB unique-violation. Better-auth wraps this as an error response. Today the modal surfaces the error verbatim.
- New UX needed for the conflict (Q9). No schema change.

---

## 4. Behavior implications

### 4.1 Switcher route shape

- Click "Shopkeeper" while on Generic → route to the Shopkeeper signup screen. Plausibly `/auth/sign-up` is one route with a `?type=shopkeeper` query (in-page form swap), or two distinct routes `/auth/sign-up/generic` + `/auth/sign-up/shopkeeper`. See Q4.

### 4.2 Continue submit behavior

1. Validate Full name (min length TBD — see Q5) + Phone (same rule as sign-in).
2. Call `authClient.phoneNumber.sendOtp({ phoneNumber })`.
3. On success → push to `/auth/otp?phone=…` with `name` + `retailerType` carried via the chosen architecture (Q8).
4. On phone-already-registered error → see Q9.

### 4.3 Auto-signup on verify

- Per OQ-V the same OTP verify handler is used for buyer / vendor / admin sign-in. The signup branch must distinguish itself so the OTP success handler upserts `name + retailerType` onto the new user row but does **not** touch them on a returning user. Mechanism TBD — see Q8.

### 4.4 Language toggle

- Per OQ-I, toggle is presentational. Click → no-op or "Coming soon" toast. See Q3.

---

## 5. Open questions for me

### Copy

1. **OTP-info card "4-digit" vs ship-time 6-digit.** Same as sign-in Q1 / OTP Q1.
   - **Plausible answers:** (a) Update to "6-digit". (b) Strip digit count: "You'll receive an OTP…". (c) Keep "4-digit" verbatim.
**Answer:** (a) Update to "6-digit OTP". Mirrors sign-in Q1 / OTP Q1.

2. **"For personal restocking. Takes 30 seconds." sub copy commitment.**
   - **Observed in design:** `gP6cD` sans 14 ink-2.
   - **Observed in code:** None.
   - **Question:** Is the "30 seconds" claim a literal commitment (so we should performance-budget the form to actually take 30s end-to-end), or marketing copy that survives even if the OTP step takes longer?
   - **Plausible answers:** (a) Marketing copy, ship verbatim. (b) Tighten copy to "Takes a minute." (c) Drop the timing claim.
**Answer:** (a) Marketing copy, ship verbatim. Aspirational benchmark; no perf budget required.

### Behavior / states

3. **EN/اردو toggle behavior on this batch (OQ-I deferred).**
   - **Observed in design:** Active EN cell + اردو cell with Noto Nastaliq Urdu glyph.
   - **Observed in code:** None.
   - **Question:** Hide entirely, render as a static EN-only pill (no اردو cell drawn), render the full toggle but اردو click is a no-op, or render with a "Coming soon" toast on اردو click?
   - **Plausible answers:** (a) Render full toggle, اردو click is a no-op. (b) Render only the EN cell, hide the اردو half. (c) Render the full toggle, اردو click shows a Sonner "Urdu coming soon" toast.
**Answer:** Hide the toggle entirely on auth screens for this batch — same resolution as sign-in Q3. Per OQ-I Urdu is deferred; rendering a no-op toggle is misleading.

4. **Generic ↔ Shopkeeper switcher route shape.**
   - **Observed in design:** Two segmented cells; clicking the inactive one is implied to switch flows.
   - **Observed in code:** Neither route exists.
   - **Question:** One route with `?type=generic|shopkeeper` and an in-page form swap, two distinct routes (`/auth/sign-up/generic`, `/auth/sign-up/shopkeeper`), or a single component switching state without route change?
   - **Plausible answers:** (a) One route `/auth/sign-up?type=…` with in-page form swap (cheapest; no extra page file). (b) Two distinct routes; switcher is a `<Link>` between them. (c) Single client component with internal state; URL doesn't change.
**Answer:** One route `/sign-up?type=generic|shopkeeper` (NOT `/auth/sign-up`) with in-page form swap. Fills the existing `(auth)/sign-up/page.tsx` stub; route group provides the centered shell. Switcher updates the `type` query so deep-links work. Default `?type=generic`.

5. **"Full name" validation rule.**
   - **Observed in design:** Label sans 13/600 ink-2; placeholder copy not in batch_get.
   - **Observed in code:** None. `user.name` is `notNull text`.
   - **Question:** Min length, max length, allowed characters?
   - **Plausible answers:** (a) Min 2, max 80, `/^[\p{L}\s.'-]+$/u` (letters, spaces, dot, apostrophe, hyphen). (b) Min 1, max 120, no character restriction. (c) Min 3, max 60, ASCII-only.
**Answer:** (a) Min 2, max 80, regex `/^[\p{L}\s.'-]+$/u`. Unicode-aware so non-Latin names are accepted; punctuation set covers Pakistani naming conventions ("Saleem Bhai", "Mian Saleem", "M.A. Khan").

6. **Continue CTA loading state.**
   - **Observed in design:** No loading frame.
   - **Observed in code:** None for this screen.
   - **Question:** Loading copy + icon during sendOtp?
   - **Plausible answers:** (a) "Sending OTP…" + spinner replacing chevron. (b) "Continue" copy stays, spinner replaces chevron. (c) Disabled with no copy change.
**Answer:** (b) "Continue" copy stays, spinner replaces the trailing chevron, button disabled. Mirrors OTP Q4.

7. **Terms footer link wiring.**
   - **Observed in design:** `fohHr` "By continuing you agree to our Terms & Privacy."
   - **Observed in code:** No /terms or /privacy routes.
   - **Question:** Are "Terms" and "Privacy" two separate links to two separate routes, a single link to a combined `/legal` page, or static text without hrefs?
   - **Plausible answers:** (a) Two separate `<Link>`s to `/terms` and `/privacy` (routes don't exist yet — block on routes existing). (b) Single `<Link>` to `/legal`. (c) Static text, no links — defer link wiring to a follow-up batch.
**Answer:** (c) Static text, no links — defer link wiring until `/terms` and `/privacy` routes exist. Don't ship dead anchors. Same resolution applies to sign-in Q14 and shopkeeper signup terms.

8. **Architecture for carrying `name + retailerType` across the OTP boundary.**
   - **Observed in design:** None (purely backend concern).
   - **Observed in code:** Today `signUpOnVerification` synthesises `name = phoneNumber` at verify time; nothing to carry.
   - **Question:** Where do `name + retailerType` live between Continue click and OTP-verify success?
   - **Plausible answers:** (a) URL params on `/auth/otp?phone=…&name=…&retailerType=…` (simple but exposes data in the URL). (b) `sessionStorage.setItem('pendingSignup', { name, retailerType })`; OTP success reads + clears. (c) Server-side `pendingSignup` table keyed by phone, written on Continue, consumed by the verify handler.
**Answer:** (b) `sessionStorage.setItem('pendingSignup', { name, retailerType, shopName?, shopAddress? })` on Continue; OTP success handler reads, upserts onto `user`, clears. No URL leakage of PII; no schema change. Cleared on tab close which is correct semantics — abandoned signups don't leave server state.

9. **Phone-already-registered UX.**
   - **Observed in design:** No conflict state.
   - **Observed in code:** Better-auth surfaces unique-violation as an error string.
   - **Question:** UX on conflict?
   - **Plausible answers:** (a) Inline red helper text under the phone input: "This number is already registered. Sign in instead." with the "Sign in" word linked to `/auth?phone=…`. (b) Sonner toast + automatic redirect to `/auth?phone=…` after 2s. (c) Replace the form with a one-shot card "We already know this number — sign in" + a single CTA.
**Answer:** (a) Inline red helper text under the phone input: "This number is already registered. **Sign in** instead." — with `Sign in` linked to `/auth?phone={current}`. Lets the user keep the typed phone, switch flows in one click.

10. **Mobile back affordance.**
    - **Observed in design:** Mobile header `H8TsQb` shows logo + lang toggle + cart on the right. No back chevron.
    - **Observed in code:** None.
    - **Question:** No back button at all, browser-back-only, or add a chevron-left tile not in the design?
    - **Plausible answers:** (a) No back button — match design. (b) Browser-back-only via the app bar (no UI, just hardware/gesture). (c) Add a chevron-left even though the design omits it.
**Answer:** (a) No back button on mobile signup — match the design. The app bar shows logo + cart only; users use platform back gesture / browser back. Sign-in is reachable via the inline "Already have an account? · Sign in" link.

11. **Route address for the signup page.**
    - **Observed in design:** Frame name "Auth · Generic User Signup". No URL specified.
    - **Observed in code:** Empty stub at `/sign-up` (`app/(auth)/sign-up/page.tsx`); no other signup route.
    - **Question:** `/sign-up` (fill stub) or `/auth/sign-up` (new route)?
    - **Plausible answers:** (a) `/sign-up` — fill the existing stub; the `(auth)` route group provides the centered shell. (b) `/auth/sign-up` — sibling of `/auth/otp`; delete the `(auth)/sign-up` stub. (c) Both with one redirecting to the other.
**Answer:** (a) `/sign-up` — fill `app/(auth)/sign-up/page.tsx`. The `(auth)` route group provides the centered shell. `ABSOLUTE_ROUTES` gains `AUTH_SIGN_UP = '/sign-up'`. The "Create an account" link on sign-in routes here; switcher toggles `?type=…`.

---

**File written to:** `D:\Moeed 8th Sem\Fyp\Code\shalmi-web\.claude-revamp\screens\buyer-signup-generic\gap-analysis.md`

(End of Buyer · Generic Signup gap analysis. Stopping per `BATCH_RUNNER.md` Step A.)
