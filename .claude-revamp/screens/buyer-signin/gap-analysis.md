# Buyer · Sign-in — Gap Analysis

> **Phase:** Per-screen gap analysis (read-only, NEW screen).
> **Date produced:** 2026-05-04.
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop frame `b1fhr`, Mobile frame `P6J3f`.
> **Code source:** `apps/web/src/app/(auth)/sign-in/page.tsx` (stub `<div />`),
> `apps/web/src/app/(auth)/layout.tsx` (centered shell),
> `apps/web/src/app/auth/page.tsx` + `modules/auth/components/auth-page-content/`,
> `modules/auth/components/auth-modal/index.tsx` (the active sign-in surface today),
> `modules/auth/client/auth-client/index.ts` (better-auth + phoneNumberClient),
> `modules/auth/server/auth-client/index.ts` (better-auth server config — `otpLength: 6`, `expiresIn: 300`, `allowedAttempts: 3`, `signUpOnVerification: { getTempEmail, getTempName }`),
> `modules/auth/server/services/otp/index.ts` (Twilio sender),
> `modules/auth/utils/redirect.ts` (post-auth role routing),
> `packages/database/src/schema/auth.ts` (better-auth `user` table — `phoneNumber unique`, `role text default 'retailer'`).
>
> **Inputs read:** `01-codebase-map.md`, `02-design-inventory.md`, `04-design-system-implementation-log.md`, `05-batch-plan.md` (Batch 7 plan-level OQs already resolved — see §0), `06-scope-cut.md`, `07-default-proposals.md`.
>
> Per CLAUDE.md hard rule 1, **no implementation is proposed**. Every NEW_FIELD / REMOVED_FIELD / NEW_INTERACTION / CHANGED_INTERACTION / NEW_STATE / COPY_CHANGE / AMBIGUOUS row in §2 maps to a numbered question in §5.

---

## 0. Plan-level resolutions consumed (do not re-ask)

From `05-batch-plan.md` "Open ordering questions — Batch 7":

- **OQ-R** → add `user.retailerType` enum (`generic | shopkeeper`), nullable. `role` stays `retailer`.
- **OQ-S** → add `user.shopName` + `user.shopAddress` as nullable text cols on `user`.
- **OQ-I** → Urdu screens ignored for this batch (EN-only).
- **OQ-G** → real guest checkout: relax `/api/checkout` `requireSession()`, add `orders.guestSessionId text nullable`, persist guest carts/orders without a `user` row; address is the source of truth for user info throughout the order lifecycle.
- **OQ-V** → unified `/auth` with role auto-detection from phone (the user row already carries `role`).
- **OQ-O** → keep 6-digit OTP; render 6 boxes in the UI. The 4-box design is illustrative.
- **OQ-A** → Mart-shelf brand-grid uses generic stylized illustrations / silhouettes (not relevant to sign-in; applies to shopkeeper signup mobile).

These are **binding** for the screen below. Per-screen questions in §5 are everything that the plan-level resolutions did not nail down.

---

## 0a. Pencil components used here that were not yet inventoried

The sign-in card uses the following compound elements that are **not** in `02-design-inventory.md §3` and have **not** been built in `04-design-system-implementation-log.md`:

- **Brand mark cluster** (`D3sSR` desktop / `pBv5H` mobile) — square logo tile (`CVIm0` 32×32, ink fill, paper inner glyph) + wordmark (`CnJAv` "Shalmi" sans 23/800) + tagline (`plEN3` "Bazaar consolidation" mono 13/600). **Not in §3.** Reused across all 4 auth screens; flag once here.
- **`+92` phone-chip input** (`N02alm` desktop / `wWNNV` mobile) — split control: left `JBhwU` chip (60×52 desktop / 54×48 mobile, paper-2 fill, 1.5px rule-2 stroke, mono "+92"), right `OOBBk` input (10-digit, 1.5px rule-2 stroke, JetBrains Mono digits, ink-4 placeholder). **Not in §3.** Flagged in `05-batch-plan.md` as the molecule landing in this batch.
- **Primary green CTA** (`CO1LZ` desktop 56h / `C0M4S` mobile 52h) — full-width green-2 fill, 8 radius, sans 16/800 white label. Differs from the `02 §3.1` 40h primary in height + label weight. **Not catalogued.**
- **Dashed paper hint card** (`v5mtc` 40h / `b4ptd` 42h) — paper-2 fill, 1.5px dashed rule-2 stroke, 6 radius, leading lucide `info` icon (`LwcWX`/`VTIE5` 16×16 ink-3) + sans 13/500 ink-2 caption. **Not catalogued.**
- **Inline "Pre · Link" row** (`N3Y8qf` / `F0htC4`) — sans 14 ink-3 ("New to Shalmi?") + sans 14/700 ink ("Create an account") sitting on a single line, 8 gap. **Not catalogued.**
- **Tertiary subtle link row** (`xvTLH` / `wv3Jm`) — sans 12/600 ink-3 + middle dot + sans 12/600 ink-3 ("Sign in as Vendor · Admin login"). **Not catalogued.**
- **OR divider** (`sJA2C` / `w4buV`) — 1px rule line + 34px paper-2 chip with mono 11/700 ink-3 "OR" letter-spacing 0.12 + 1px rule line. Reused on the checkout one-time-addr card (`l0b3Ge` "OR · ONE-TIME DELIVERY") with a different chip width. **Not catalogued.**
- **Ghost / outline secondary button with leading icon** (`n4tAj` desktop 48h / `cOoS5` mobile 47h) — white fill, 1.5px ink-3 stroke, 8 radius, lucide `user-round` icon + sans 16/700 ink "Continue as Guest". Distinct from the `02 §3.1` "outline ink" variant (different height, different stroke colour). **Not catalogued.**
- **Benefits / "GUESTS MISS OUT ON" card** (`Y0l3s` 122h / `wMM4W` 115h) — paper-2 fill, 1.5px dashed rule-2 stroke, 12 radius, padding 14. Inside: eyebrow row (lucide `sparkles` green-700 + sans 13/700 green-700 "Why sign in?") + caption row (mono 10/700 ink-3 letter-spacing 0.12 "GUESTS MISS OUT ON") + 3 benefit rows, each = 16×16 lucide icon + sans 13/600 ink-2 line. Icons in order: `history`, `refresh-cw`, `truck`. Lines: "Full order history & invoices" / "One-tap reorder of past carts" / "Track every MNP delivery in real time". **Not catalogued — major new molecule.**
- **Mobile app-bar layout chrome** (`RaHHO` 56h: `H6FhyA` back chevron-left tile + brand wordmark `x6v9zr` "Shalmi" + right cluster `kY6k3` with `oL2YN` lang-toggle "EN" + `OqW2e` cart). **Not catalogued.** Reused on every mobile auth screen.

---

## 1. Layout & structure

### Desktop (`b1fhr`, 1440 × 1200)

Centered single column, vertical stacking inside a 480-wide white card (`x2n4K`, height 873):

1. **Brand cluster** (`D3sSR`, h38, y=48) — logo tile + "Shalmi" wordmark + "Bazaar consolidation" tagline.
2. **Headline + sub** (`enGSR`, h64, y=114) — "Welcome back" 30/800 + "Sign in with the phone number you registered." 15/normal ink-2.
3. **Phone field** (`cfE2Y`, h76, y=206) — label "Phone number" 13/700 + +92 chip input row.
4. **Send OTP CTA** (`CO1LZ`, h56, y=310) — full-width green-2, sans 16/800 "Send OTP".
5. **Hint card** (`v5mtc`, h40, y=394) — info icon + "You'll receive a 4-digit OTP on this number." (NOTE: copy says "4-digit" but per OQ-O resolution the implementation ships 6-digit — see Q1).
6. **Hairline rule** (`NgM3q`, 1px, y=462).
7. **"New to Shalmi? · Create an account"** (`N3Y8qf`, h18, y=491).
8. **Tertiary** (`xvTLH`, h15, y=537) — "Sign in as Vendor · Admin login".
9. **OR divider** (`sJA2C`, h19, y=580).
10. **Continue as Guest** ghost button (`n4tAj`, h48, y=627).
11. **Benefits card** (`Y0l3s`, h122, y=703).

Card sits centered in viewport via outer wrapper `LdkE1` (480×939 at x=480, y=130.5). Footer chrome below (`Zy60I` "© 2025 Shalmi · Privacy · Terms" 268w mono, y=924).

### Mobile (`P6J3f`, 420 × 1100)

App-bar layout (`MUyJC`, 420×738) with `RaHHO` 56h app-bar above. Same vertical sequence as desktop, scaled down: brand cluster (y=24), headline+sub (y=74), phone field (y=148), CTA (y=238), hint (y=308), rule (y=368), signup link (y=387), tertiary (y=423), OR divider (y=456), Guest button (y=493), benefits card (y=558), terms footer (`ac0uV` y=691).

### Existing code layout

- `app/(auth)/sign-in/page.tsx` → `export default function SignInPage() { return <div />; }`. Empty stub.
- `app/(auth)/layout.tsx` → `flex min-h-screen items-center justify-center p-4` shell.
- `app/auth/page.tsx` → `<AuthPageContent />` which mounts `<AuthModal open={true} />` modal-over-blank-page.
- `AuthModal` (`modules/auth/components/auth-modal/index.tsx`) — shadcn `Dialog` with title "Sign in", description "Enter your phone number. We'll send you a verification code.", single `<Input type="tel" placeholder="+923000000000">`, single primary `Continue` button, then router.push to `/auth/otp?phone=…&redirect=…`.

### High-level layout deltas

- **NEW route ownership.** Sign-in moves from a modal at `/auth` to a full page at `/auth` (or `/sign-in` — see Q15) with the centered card pattern. The empty stubs at `(auth)/sign-in` and `(auth)/sign-up` need to either become this page or be deleted in favour of `/auth` — see Q15.
- **NEW brand cluster** above the form. No equivalent in the modal.
- **NEW `+92` phone chip + 10-digit input.** Today `<Input type="tel">` accepts any free-form string with a placeholder hinting at full E.164.
- **NEW dashed hint card** under the CTA.
- **NEW signup CTA row** ("New to Shalmi? · Create an account") routing to the generic signup screen.
- **NEW tertiary "Sign in as Vendor · Admin login" links** (per OQ-V resolved to unified-`/auth` role auto-detection — re-purpose unclear; see Q4).
- **NEW OR divider + Continue as Guest button** (per OQ-G resolved to real guest checkout — flow shape see Q5).
- **NEW benefits card** explaining what guests miss.
- **REMOVED** modal chrome (Dialog header/footer, `DialogTitle`, `DialogDescription`).
- **REMOVED** "Sign in" page heading (replaced by "Welcome back").

---

## 2. Element-by-element diff

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| `(auth)/layout.tsx` centered shell | (kept) | Behavior preserved — centered card is the layout the design assumes. | VISUAL_ONLY |
| Brand cluster `D3sSR` / `pBv5H` (logo tile + "Shalmi" + tagline "Bazaar consolidation") | (none in `AuthModal`) | New chrome above the form. Reused across all 4 auth screens. | NEW_FIELD |
| Headline `RNWAE` "Welcome back" 30/800 + sub `FEeYA` "Sign in with the phone number you registered." 15/normal | `DialogTitle` "Sign in" + `DialogDescription` "Enter your phone number. We'll send you a verification code." | Copy and typography both change. | COPY_CHANGE |
| Phone field label `Gkqwk` "Phone number" 13/700 + `+92` chip + 10-digit input (`N02alm`) | `<Label>` "Phone number" + `<Input type="tel" placeholder="+923000000000">` | Splits the single input into a fixed-prefix chip + 10-digit body. Validation/format change: input now accepts only 10 digits (no leading 0, no leading +92). Submission concatenates `+92` + digits server-side / client-side before calling `authClient.phoneNumber.sendOtp`. | CHANGED_INTERACTION |
| Primary CTA `CO1LZ`/`C0M4S` — green-2, 56h/52h, sans 16/800 "Send OTP" | `<Button>` "Continue" / "Sending code…" | Copy ("Send OTP" vs "Continue"), height (56 vs default 40), weight (800 vs 700). Loading copy not drawn — see Q12. | COPY_CHANGE |
| Hint card `v5mtc`/`b4ptd` "You'll receive a 4-digit OTP on this number." (info icon + paper-2 dashed) | (none) | New microcopy + new molecule. **Copy says 4-digit; ships 6-digit per OQ-O.** | NEW_FIELD |
| Hairline rule `NgM3q`/`VTold` (1px) | (none) | Visual divider only. | VISUAL_ONLY |
| Signup CTA row `N3Y8qf`/`F0htC4` "New to Shalmi? · Create an account" | (no link to signup in modal) | Adds an inline navigation to the generic signup screen. | NEW_INTERACTION |
| Tertiary `xvTLH`/`wv3Jm` "Sign in as Vendor · Admin login" | (none) | Two passive subtle text links. Per OQ-V, `/auth` does role auto-detection from phone — so what do these links target? See Q4. | NEW_INTERACTION |
| OR divider `sJA2C`/`w4buV` | (none) | New visual divider with mono "OR" chip. | VISUAL_ONLY |
| Continue as Guest button `n4tAj`/`cOoS5` (lucide `user-round` icon + sans 16/700 "Continue as Guest", outline ink-3) | (none) | Adds a guest checkout path. Per OQ-G the path is real (relax `requireSession()`, write `orders.guestSessionId`, address as source of truth) — but UX shape (does it route directly to `/checkout`? does it persist a guest session id in cart-store first? what happens if cart is empty?) is not drawn. See Q5–Q7. | NEW_INTERACTION |
| Benefits card `Y0l3s`/`wMM4W` — eyebrow "Why sign in?" + label "GUESTS MISS OUT ON" + 3 lines (history → "Full order history & invoices", refresh-cw → "One-tap reorder of past carts", truck → "Track every MNP delivery in real time") | (none) | New educational card. Always-visible? Or hide on small screens / after Guest is clicked? See Q8. | NEW_FIELD |
| Footer "© 2025 Shalmi · Privacy · Terms" `Zy60I` (desktop) / Terms-only `ac0uV` (mobile) | (none) | New legal/terms copy at page bottom. Mobile shows different copy than desktop — see Q14. | NEW_FIELD |
| `AuthModal` Dialog open-state + `closeModal` from `useModalStore` | (still mounted at `/auth` route via `AuthPageContent`) | Modal pattern is replaced by a full page. The store, the Dialog wrapper, and `AuthPageContent` become unused for buyer flow — but `AuthModal` may still be used elsewhere (e.g. embedded in `Header` to prompt sign-in mid-flow). Grep before deletion. See Q16. | REMOVED_FIELD |
| Phone-format-not-recognized error / network failure / "phone not registered" — design has no error frame | `setError(sendError.message ?? 'Failed to send code')` + `<p role="alert">` under the field | Error state styling not in Pencil. Sticking with red helper text under input vs surfacing in a toast — see Q9. Phone-not-registered is a special case: better-auth's `signUpOnVerification` auto-creates a user on first verify, so "not registered" is not actually surfaced today — but design's "Welcome back" headline implies a registered-user path. See Q10. | AMBIGUOUS |
| Loading state during sendOtp — design has no frame | `isLoading` swaps button copy to "Sending code…" + disables input | Copy unspecified in design; spinner unspecified. See Q12. | AMBIGUOUS |
| Mobile app-bar `RaHHO` (back chevron + brand + EN toggle + cart icon) | (none — modal has no app bar) | New chrome on mobile. Back chevron behavior + cart icon behavior both undrawn. See Q13. | NEW_INTERACTION |
| Empty `(auth)/sign-in` page stub (`<div />`) | (kept; design implies this is where the new sign-in page lives — or `/auth`) | Routing decision — see Q15. | AMBIGUOUS |
| Existing `getPostAuthRedirectUrl(redirectUrl, role)` (utils/redirect.ts:41) | (kept; design doesn't show post-OTP redirect) | Per OQ-V (unified `/auth` with role auto-detection), this util's role branch is the existing implementation. Keep verbatim. | VISUAL_ONLY |

---

## 3. Schema / type implications

### 3.1 `user.retailerType` enum (per OQ-R)

- New nullable column on `user` (`packages/database/src/schema/auth.ts`): `retailerType text` constrained to `generic | shopkeeper` (Drizzle enum or text + zod parse). **Sign-in screen does not write this column** — the column is populated by the signup screens. Sign-in is read-only of the user row.
- No change to the better-auth `additionalFields` config required for sign-in. (Signup will need it.)

### 3.2 Guest checkout (per OQ-G)

The sign-in screen's `Continue as Guest` button is the **entry point** to the guest path, but the schema migration is owned by the checkout route, not by sign-in. Touched here only as a forward reference:
- New nullable column on `orders`: `guestSessionId text nullable` (consumer schema).
- `/api/checkout/route.ts` `requireSession()` is relaxed to accept `(session OR guestSessionId)`.
- `checkoutCartPayloadSchema` (`packages/schemas/src/orders/checkout.ts`) gains a `guestSessionId?: string` field; the existing `addressId XOR shippingAddress` refine still applies but a guest can only use `shippingAddress` (they have no saved addresses).
- Address is the source of truth for user info throughout the order lifecycle (per OQ-G(b)) — the existing `orders.shippingName / shippingPhone / shippingAddress / shippingCity` snapshot fields are sufficient; no `users.name / phone` lookup needed for guests.

These are owned by the checkout one-time-addr screen and the `/api/checkout` route handler, not this screen. The sign-in screen's only behavior is to mint / persist a `guestSessionId` in the cart-store before navigating away. See Q6.

### 3.3 Phone-only sign-in vs better-auth signup path

- `modules/auth/server/auth-client/index.ts:40-44` configures `signUpOnVerification: { getTempEmail, getTempName }`. **This means any verified phone gets a `user` row created automatically.**
- Design's "Welcome back" headline implies a *registered-user-only* path. There is no observed schema-level mechanism for "phone not registered" today — the OTP verify silently signs the user up.
- Two paths to reconcile (Q10):
  - (a) Disable `signUpOnVerification` and add a "phone not registered → bounce to signup" branch in the OTP verify handler.
  - (b) Keep auto-signup, treat "Welcome back" as marketing copy. Existing-vs-new user is invisible to the buyer.
- No schema change either way.

### 3.4 No other schema changes for sign-in

The phone field shape is unchanged on the wire — better-auth still accepts `phoneNumber: string`. The chip+input split is purely a UI concern; submission concatenates `+92` + 10 digits to form the full E.164 string. No `user.phoneNumber` migration.

---

## 4. Behavior implications

### 4.1 Phone chip + 10-digit input

- Client-side: input accepts only digits, max length 10, leading 0 stripped (per Pakistan mobile convention `300 1234567` not `0300 1234567`). On submit, prepend `+92` to form `+923001234567` and pass to `authClient.phoneNumber.sendOtp({ phoneNumber })`.
- Validation: 10 digits exactly; first digit `3` (Pakistan mobile prefix). Rule TBD — see Q11.
- Mono digit display: `font-mono` on the input value to match design.

### 4.2 Send OTP submit behavior

Today (`AuthModal:46-67`):
1. `sendOtp({ phoneNumber })` — fire-and-validate on the better-auth phoneNumber plugin.
2. On error → `setError`. On success → push to `/auth/otp?phone=…&redirect=…`.
3. The route `/auth/otp` mounts `<OtpVerificationForm>` which renders the next screen (covered in `buyer-otp/gap-analysis.md`).

Design behavior is identical at the API/router layer; only the wrapper UI changes. **Confirmed unchanged.** (The 4-digit copy in the hint card lies — actual code is 6-digit, per OQ-O — see Q1.)

### 4.3 Continue as Guest flow

Per OQ-G(b), guest is real, not flag-only. Cheapest plumbing:
1. Click → cart-store `setGuestSessionId(crypto.randomUUID())` (or equivalent).
2. router.push to `/cart` (if cart is empty) or `/checkout` (if cart has items).
3. The `/api/checkout` route handler accepts `guestSessionId` in the payload; the checkout one-time-addr card is the only address-entry path (saved addresses are user-bound).

Open shape questions: Q5, Q6, Q7.

### 4.4 Tertiary "Vendor · Admin" links

Per OQ-V(b), `/auth` already auto-detects role from phone — so a buyer typing an admin-registered phone lands on `/admin` after OTP verify (existing `getPostAuthRedirectUrl` handles this). The tertiary links may therefore be:
- (a) Decorative passive hints (just text, no `<a>` href) saying "you can also sign in as a vendor or admin here — same form".
- (b) `<a>` links to legacy `AuthModal`-mounted routes that still exist (`/auth?role=vendor`, etc.) — but per OQ-V the unified `/auth` is the path, so these would just `?focus=role` on the same form.
- (c) Remove entirely (design intent unclear — see Q4).

### 4.5 New-user signup CTA "Create an account"

Routes to the generic signup screen at `/auth/sign-up` (or `/sign-up` — see Q15). Today the `(auth)/sign-up/page.tsx` is an empty stub.

### 4.6 Mobile app bar

- Back chevron `H6FhyA` — target undrawn. Plausible: `router.back()` (browser back) or `/` (storefront home). See Q13.
- "EN" lang toggle `oL2YN` — per OQ-I, Urdu is deferred. Toggle is presentational only or hidden — see Q3.
- Cart icon `OqW2e` — opens `/cart` (existing route). Cart count badge not drawn.

### 4.7 Loading & error states

Page-level loading: undrawn. Existing `<Spinner>` primitive (`packages/ui/src/components/spinner.tsx`) is the implied default.
Submission loading: existing pattern is "Sending code…" copy + `disabled`. Design omits — see Q12.
Validation errors: today `<p role="alert">` red text under the input. Design omits — see Q9.

---

## 5. Open questions for me

Numbered. Every actionable category row in §2 maps to at least one entry below.

### Copy

1. **Hint card 4-digit vs ship-time 6-digit copy.**
   - **Observed in design:** Hint card `kQknj` reads "You'll receive a 4-digit OTP on this number." (mobile + desktop identical).
   - **Observed in code:** `modules/auth/server/auth-client/index.ts:49` `otpLength: 6`. Per OQ-O resolved → keep 6-digit; render 6 OTP boxes; treat the design as illustrative.
   - **Question:** Does the hint card copy change to "6-digit" (because the actual OTP is 6 digits), or stay "4-digit" (matching the design verbatim, knowing it is wrong)?
   - **Plausible answers:** (a) Update hint copy to "You'll receive a 6-digit OTP on this number." (b) Keep "4-digit" verbatim per design. (c) Remove the digit count: "You'll receive an OTP on this number."

2. **"Welcome back" copy on a screen that auto-signs-up unknown phones.**
   - **Observed in design:** Headline `RNWAE` "Welcome back" 30/800.
   - **Observed in code:** `signUpOnVerification` is enabled — any unrecognised phone is silently registered on first OTP verify. So "Welcome back" is sometimes a lie.
   - **Question:** Is the headline a deliberate marketing skew toward returning users, or should it switch based on a phone-known check before sending the OTP (e.g. "Welcome back" vs "Sign in to Shalmi")?
   - **Plausible answers:** (a) Keep "Welcome back" verbatim, accept the inaccuracy for new users. (b) Pre-check phone existence before sending OTP and toggle the headline. (c) Use a neutral "Sign in to Shalmi" headline.

3. **EN/Urdu language toggle on mobile (`oL2YN`).**
   - **Observed in design:** Mobile app-bar shows an "EN" toggle chip on the right (`oL2YN` → text `AI2NG` "EN"). Desktop has no toggle.
   - **Observed in code:** No i18n. Per OQ-I, Urdu is deferred for this batch.
   - **Question:** Is the EN toggle hidden, shown-but-disabled, or shown as a no-op pill on mobile auth screens?
   - **Plausible answers:** (a) Hide the toggle entirely on auth screens. (b) Render it as a static "EN" pill with no click handler. (c) Render it as an interactive toggle that shows a "Urdu coming soon" toast on click.

4. **Tertiary "Sign in as Vendor · Admin login" link target.**
   - **Observed in design:** Two subtle text links separated by a dot: `Wlc13` "Sign in as Vendor" and `f7xfb` "Admin login", both sans 12/600 ink-3.
   - **Observed in code:** No equivalent. Per OQ-V resolved → unified `/auth` with role auto-detection from phone.
   - **Question:** Given role auto-detection, what do these links do?
   - **Plausible answers:** (a) Decorative hint text only, no href — purely informational. (b) Href to the same `/auth` page with a query param like `?role=vendor` that re-titles the headline ("Sign in as Vendor") but otherwise behaves identically. (c) Remove the tertiary row entirely (design intent unclear once OQ-V is resolved).

### Guest flow

5. **Continue as Guest target route (cart empty vs not empty).**
   - **Observed in design:** Outline button `n4tAj` "Continue as Guest" with lucide `user-round`. No post-click route drawn.
   - **Observed in code:** None.
   - **Question:** Where does the guest path land — directly at `/checkout`, at `/cart` first, at `/`, or context-dependent?
   - **Plausible answers:** (a) Always `/checkout` (matches OQ-G premise that guest is for checkout). If cart is empty, the checkout page bounces to `/cart` via existing guard. (b) `/cart` when empty, `/checkout` when items exist. (c) Always `/` and let the buyer build their cart.

6. **Guest session id minting and persistence.**
   - **Observed in design:** None drawn — purely a backend/cart-store concern.
   - **Observed in code:** No `guestSessionId` exists today. Per OQ-G(b), `orders.guestSessionId text nullable` is added.
   - **Question:** When and where is `guestSessionId` minted, and where is it persisted client-side?
   - **Plausible answers:** (a) Mint on click in the sign-in screen, persist in `cart-store` Zustand state; cart-store sends it on the checkout payload. (b) Mint server-side on the first `/api/checkout` POST that arrives without a session, return it via `Set-Cookie` and store in a httpOnly cookie. (c) Mint client-side and persist in localStorage outside cart-store (so it survives cart clears).

7. **Guest path interaction with existing AUTH redirect on `/checkout`.**
   - **Observed in design:** None.
   - **Observed in code:** `apps/web/src/app/(storefront)/checkout/page.tsx:90-96` redirects unauthenticated users to `/auth?redirect=/checkout`. With OQ-G(b), the guest path must bypass that redirect.
   - **Question:** What is the bypass mechanism — a `?guest=1` query, a presence-of-`guestSessionId`-in-cart-store check, a server-side cookie?
   - **Plausible answers:** (a) Cart-store `guestSessionId` truthy → page-level guard skips the auth redirect. (b) `?guest=1` query forces guest mode. (c) Add a server-side `guestSessionId` cookie checked in the page guard.

8. **Benefits card visibility across breakpoints + after Guest click.**
   - **Observed in design:** Always rendered on both desktop (`Y0l3s`, h122) and mobile (`wMM4W`, h115) below the Guest button.
   - **Observed in code:** None.
   - **Question:** Does the benefits card hide on smaller mobile screens, or after the user clicks Guest (to confirm awareness of the trade-off)?
   - **Plausible answers:** (a) Always render on both breakpoints, no conditional. (b) Hide below 360w mobile to save vertical space. (c) Hide after a Guest-confirm dialog warns the user once.

### States & errors

9. **Validation error display style.**
   - **Observed in design:** No error state drawn for the phone field.
   - **Observed in code:** `<p className="text-destructive text-sm" role="alert">` under the field.
   - **Question:** Inline red helper text under the field, toast, or both?
   - **Plausible answers:** (a) Inline red helper text under the field (current pattern). (b) Sonner toast. (c) Both — inline for validation, toast for network/backend failures (matches `buyer-checkout` Q20 resolution).

10. **"Phone not registered" branching.**
    - **Observed in design:** "Welcome back" headline implies a returning user; no error state for unrecognised phone.
    - **Observed in code:** `signUpOnVerification` makes "phone not registered" a non-state — any phone gets auto-signed-up on first verify.
    - **Question:** Should an unrecognised phone be bounced to the signup flow (with a toast/inline error like "We don't recognise this number — create an account?"), or silently auto-sign-up as today?
    - **Plausible answers:** (a) Silent auto-signup, behaviour unchanged from today (matches OQ-V unified entry). (b) Pre-check existence, route unknown phones to `/auth/sign-up?phone=…`. (c) After OTP verify, if `user.createdAt === user.updatedAt`, redirect to a profile-completion screen.

11. **Phone validation rule.**
    - **Observed in design:** 10-digit input next to a `+92` chip. No format hint beyond the chip.
    - **Observed in code:** `<Input type="tel">` accepts free-form text; no length or prefix validation.
    - **Question:** What's the exact validation rule — strictly 10 digits, first digit `3` (Pakistan mobile carriers), or just "non-empty after concatenating +92"?
    - **Plausible answers:** (a) Strictly `^3\d{9}$` (Pakistan mobile only). (b) Strictly `^\d{10}$` (any 10 digits, including landline). (c) Loose: any 7–13 digits, defer to better-auth/Twilio for definitive validation.

12. **Loading state during Send OTP.**
    - **Observed in design:** No loading frame.
    - **Observed in code:** Button copy → "Sending code…", input + button disabled.
    - **Question:** Keep "Sending code…" copy or use a spinner-only pattern, and what's the new loading copy if changed?
    - **Plausible answers:** (a) Keep "Sending code…" verbatim. (b) Inline `<Spinner>` + "Send OTP" copy stays, button disabled. (c) Sentence-cased "Sending OTP…" to match the design's copy convention.

### Mobile chrome

13. **Mobile app-bar back chevron target.**
    - **Observed in design:** `H6FhyA` chevron-left tile in app-bar (`o4FcB` 22×22 ink).
    - **Observed in code:** None.
    - **Question:** Does it call `router.back()` or always navigate to `/`?
    - **Plausible answers:** (a) `router.back()` (matches typical Android/iOS chevron). (b) Always `/`. (c) `/` if `history.length === 1`, else `router.back()`.

14. **Footer copy mobile vs desktop.**
    - **Observed in design:** Desktop footer `Zy60I` is a wider "© 2025 Shalmi · Privacy · Terms" mono line. Mobile `ac0uV` is shorter (the snapshot does not render content — see batch_get pending). Heights differ (15 vs 15 same) but desktop has 268w while mobile has full 380w.
    - **Observed in code:** None.
    - **Question:** Is mobile copy a strict subset (Terms only?), an identical line, or a separate Terms agreement variant?
    - **Plausible answers:** (a) Identical copy across breakpoints, just different widths. (b) Mobile shows only Terms link. (c) Mobile shows the same legal copy in a different layout.

### Routing

15. **Sign-in route address: `/auth` vs `/sign-in`.**
    - **Observed in design:** Frame name is "Auth · Sign in"; no URL specified.
    - **Observed in code:** Two coexisting roots: (i) `app/(auth)/sign-in/page.tsx` (empty stub) at `/sign-in`, (ii) `app/auth/page.tsx` at `/auth` (mounts `<AuthModal>`). Per `ABSOLUTE_ROUTES`, `AUTH = '/auth'`.
    - **Question:** Where does the new sign-in page live?
    - **Plausible answers:** (a) `/auth` (replaces `AuthPageContent` + `AuthModal`); delete `(auth)/sign-in/page.tsx` empty stub. (b) `/sign-in` (fill the empty stub); redirect `/auth` → `/sign-in`; the `(auth)` route group provides the centered shell. (c) Both — `/auth` for the unified entry from links, `/sign-in` as an alias.

16. **Fate of the existing `AuthModal`.**
    - **Observed in design:** N/A.
    - **Observed in code:** `AuthModal` is currently mounted via `AuthPageContent` and *may* be triggered elsewhere (e.g. mid-flow sign-in prompts from `Header`/storefront). Need to grep before deletion (CLAUDE.md hard rule 3).
    - **Question:** Is `AuthModal` retired entirely, retained as an embedded modal trigger in some surfaces (e.g. clicking "Sign in" in a header dropdown opens the modal instead of routing), or repointed at the new full-page sign-in?
    - **Plausible answers:** (a) Retire `AuthModal` + `AuthPageContent` + `useModalStore.openAuthModal` if applicable; all sign-in entry points route to `/auth`. (b) Keep `AuthModal` as an embedded shortcut for high-friction surfaces (cart drawer, etc.); the standalone `/auth` page becomes the canonical destination. (c) Re-skin `AuthModal` to mirror the new design (less consistent, more code duplication).

---

**File written to:** `D:\Moeed 8th Sem\Fyp\Code\shalmi-web\.claude-revamp\screens\buyer-signin\gap-analysis.md`

(End of Buyer · Sign-in gap analysis. Stopping here per `BATCH_RUNNER.md` Step A — no implementation begins until the Q1–Q16 above are answered.)
