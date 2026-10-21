# Buyer · Signup (Shopkeeper, EN) — Gap Analysis

> **Phase:** Per-screen gap analysis (read-only, NEW screen).
> **Date produced:** 2026-05-04.
> **Pencil source:** `Pencil-Design/Shalmi` — Desktop frame `n90TBE`, Mobile frame `xazGe`. **Urdu/RTL frames `w2jcu` (Desktop) and `izPvi` (Mobile) are out of scope per OQ-I.**
> **Code source:** `apps/web/src/app/(auth)/sign-up/page.tsx` (stub `<div />`),
> `app/(auth)/layout.tsx`,
> `modules/auth/server/auth-client/index.ts`,
> `packages/database/src/schema/auth.ts` (per `auth.ts:23-25` comment, `business_name` column lands via migration 0012 in Batch 5; `shopName` + `shopAddress` per OQ-S land in this batch).
>
> **Inputs read:** `01-codebase-map.md`, `02-design-inventory.md`, `04-design-system-implementation-log.md`, `05-batch-plan.md` (Batch 7 OQs already resolved — see §0), `06-scope-cut.md`. Cross-references the generic-signup gap-analysis (this screen shares ~70% of its molecules).
>
> Per CLAUDE.md hard rule 1, **no implementation is proposed**.

---

## 0. Plan-level resolutions consumed (do not re-ask)

- **OQ-R** → `user.retailerType` enum nullable. Shopkeeper signup writes `retailerType = 'shopkeeper'`.
- **OQ-S** → add `user.shopName text nullable` + `user.shopAddress text nullable`. Both columns sit on `user` (NOT a new `shop_profiles` table). Note the existing `auth.ts:23-25` comment about `user.businessName` (Batch 5) — `shopName` is a *separate* column, not a reuse of `businessName` (Q12).
- **OQ-I** → Urdu deferred. EN-only for this batch. Mobile brand-grid hero strip (per OQ-A) uses generic stylized illustrations.
- **OQ-A** → Mart-shelf brand-grid uses generic stylized illustrations / silhouettes (no real product photos, no brand-IP).
- **OQ-G** → no Guest button on signup.
- **OQ-O** → 6-digit OTP shipped; design's "4-digit" copy is illustrative.

---

## 0a. Pencil components used here that were not yet inventoried

- **`STEP 1 OF 2 · DETAILS` eyebrow row** (mobile `D1zcT` and desktop equivalent inside `T01gJ1`) — mono 11/700 ink-3 letter-spacing 0.16. Implies a 2-step flow: "details" (this screen) → "verify" (OTP screen). Sign-in does not show "STEP 1 OF 2", but per the OTP gap analysis Q9, the eyebrow style on OTP is "STEP 2 OF 2". **Not catalogued.**
- **EN/اردو language toggle** — same as generic signup. Per OQ-I presentational only.
- **Generic ↔ Shopkeeper switcher** — same molecule as generic signup, but **Shopkeeper active** with lucide `store` icon (`GZM3Q`) + sans 13/700 white "Shopkeeper". Mobile flips: active cell on the right with `gMVsj` store icon + `gwgIl` "Shopkeeper".
- **Headline + sub block** (`d99eC` / `fs4F1`) — sans 30/800 (mobile 22/800) "Tell us about your shop" + sub "Four quick fields. We'll send a 4-digit OTP to verify." (per OQ-O ships 6-digit — see Q1).
- **Textarea** for shop address (`nzjVW` desktop / `uzkfn` mobile) — 80h field; multiline. Same primitive as the buyer-checkout rider-instructions textarea (which is also not in `02 §3` per `buyer-checkout/gap-analysis.md` §0). **Re-using the textarea molecule landing in Batch 3 is plausible but not asserted — see Q4.**
- **Mart-shelf brand-grid hero strip** (mobile-only on `xazGe`) — 3×2 grid of 8 illustration tiles inside an ink-bg strip. Per OQ-A these are generic stylized illustrations (not branded). The frame `xazGe` snapshot does not show this strip in the layout I captured — the frame is shorter (h777) than the user-message description ("3×2 grid of 8 placeholders"). The hero strip may live in the mobile chrome `O4e379` or be omitted from the EN variant. See Q9.
- **Continue CTA + OTP-info card + sign-in link + terms footer** — all reused from generic signup.

---

## 1. Layout & structure

### Desktop EN (`n90TBE`, 1440 × 1100)

Centered 480-wide white card (`ucDfO`, h799) inside outer wrapper `jQE7N` x=480 y=64. Per the user's task description, the previous left-side image/mart-shelf panel was **removed** from the Shopkeeper Desktop screens (the form now uses `justifyContent: center` with a 480-wide vertical wrapper rather than spanning 880w):

1. **Eyebrow + language toggle row** (`pLWAF`, h45, y=0) — `CZT7Y` "STEP 1 OF 2 · DETAILS" left + `rGywI` EN/اردو toggle right.
2. **Generic ↔ Shopkeeper switcher** (`T01gJ1`, h46, y=67) — `q0oPI` (inactive Generic) + `dk8vn` (active Shopkeeper, store icon `O7jMM1` + `HnFoC` "Shopkeeper").
3. **Headline + sub** (`aUWkR`, h76, y=135) — `GZS8N` "Tell us about your shop" 30/800 (mobile 22/800) + `KVbtA` sub.
4. **4 stacked labelled fields** (`o4WKr`, h354, y=233):
   - `J3xp6` (h70) — `MMw2n` "Shopkeeper name" + 48h text input.
   - `Uh4n2` (h70) — `X1sQEe` "Shop name" + 48h text input.
   - `nzjVW` (h102) — `q3t8BP` "Shop address" + 80h textarea.
   - `Y2Q8i` (h70) — `iDZGq` "Phone number" + 48h `+92` chip + 10-digit input.
5. **Continue CTA** (`m7IbE3`, h52, y=609).
6. **Dashed OTP-info card** (`W4CE9`, h42, y=683) — copy "You'll receive a 4-digit OTP on this number to verify your shop." (see Q1).
7. **Sign-in link** (`rnUV6`, h16, y=747).
8. **Terms footer** (`Lgauv`, y=785).

### Mobile EN (`xazGe`, 420 × 777)

App-bar `O4e379` 71h header + card column `acgRk` y=71:

1. **Switcher** `D1zcT` y=20 (Shopkeeper active, store icon on the right cell).
2. **Headline + sub** `fs4F1` y=76 — `p3vMpB` "Tell us about your shop" 22/800 + `LiBSM` "Four quick fields. We'll send a 4-digit OTP to verify."
3. **4 fields** `VlicW` y=144:
   - `JXZRr` (h68) Shopkeeper name "Saleem Bhai" placeholder.
   - `QSAei` (h68) Shop name "Saleem Snacks Co." placeholder.
   - `uzkfn` (h102) Shop address textarea — placeholder "Block 4, Satellite Town, Gujranwala 52250, Punjab".
   - `YY405` (h68) Phone with `+92` chip.
4. **Continue CTA** `f0Sg3h` y=508.
5. **Dashed OTP-info card** `hipAB` y=576.
6. **Sign-in link** `ALrAY` y=629.
7. **Terms footer** `Vbf8U` y=660.

The user-description states mobile EN should include a "stylized mart-shelf hero strip (3×2 grid of Pakistani brand product placeholders)" with overlaid headline. **The mobile frame `xazGe` snapshot I read does NOT include this hero strip** — the layout starts directly with the switcher at y=20. Either the strip lives in the chrome `O4e379` and was not captured, or the mobile EN frame is missing the strip the user-description claims. See Q9.

### Existing code layout

Same as generic signup — empty stub `<div />`. No shopkeeper-specific path exists.

### High-level layout deltas

- **NEW signup form** with shopkeeper-specific fields (Shopkeeper name + Shop name + Shop address textarea + Phone).
- **NEW textarea primitive** for shop address (also needed for checkout rider notes — Batch 3 — see Q4).
- **NEW `STEP 1 OF 2 · DETAILS` eyebrow** on this screen, with "STEP 2 OF 2" on the OTP screen. Implies a single flow but raises the OTP-from-sign-in inconsistency (see `buyer-otp/gap-analysis.md` Q9).
- **Mobile-only hero strip** with 8 generic illustrations (per OQ-A) — possibly only visible in a different mobile frame variant; see Q9.
- **REMOVED left-side image/mart-shelf panel** from desktop (per user-description "The previous left-side image/mart-shelf panel was removed from the Shopkeeper Desktop screens per your 'remove selected design' instruction").

---

## 2. Element-by-element diff

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| Brand cluster (implicit in chrome — desktop frame uses centered card without explicit brand mark in `pLWAF`; mobile chrome `O4e379` carries the logo) | (none) | Reused from sign-in. | NEW_FIELD |
| Eyebrow `CZT7Y` "STEP 1 OF 2 · DETAILS" mono 11/700 ink-3 letter-spacing 0.16 | (none) | New step indicator copy. Implies the OTP screen is "STEP 2 OF 2" (consistent with OTP design). | NEW_FIELD |
| EN/اردو language toggle | (none) | Per OQ-I deferred. Behavior same as generic signup Q3. | NEW_INTERACTION |
| Generic ↔ Shopkeeper switcher (Shopkeeper active, store icon) | (none) | Same molecule as generic; toggling routes to the generic flow. See generic Q4. | NEW_INTERACTION |
| Headline `GZS8N`/`p3vMpB` "Tell us about your shop" + sub `KVbtA`/`LiBSM` "Four quick fields. We'll send a 4-digit OTP to verify." | (none) | New copy. **Sub copy says 4-digit; ships 6-digit per OQ-O — see Q1.** | NEW_FIELD |
| Field `MMw2n`/`ESTAt` "Shopkeeper name" + 48h text input | (none — `user.name` synthesized as phone number today) | Same field as generic signup's "Full name" but with shopkeeper-specific label copy. Persists to `user.name` (existing column). Validation rule per Q5. | NEW_FIELD |
| Field `X1sQEe`/`awIDg` "Shop name" + 48h text input | (none — `shopName` column does not exist) | New nullable column per OQ-S. Validation rule + max length undrawn — see Q6. | NEW_FIELD |
| Field `q3t8BP`/`oZCnA` "Shop address" + 80h textarea | (none — `shopAddress` column does not exist) | New nullable text column per OQ-S. Textarea molecule new (also needed for rider notes Batch 3). Min/max length undrawn, row-count undrawn — see Q6. Distinct from `addresses` table delivery rows; this is shopkeeper's bricks-and-mortar address, not delivery-bound. | NEW_FIELD |
| Field `iDZGq`/`tc1OY` "Phone number" + `+92` chip + 10-digit input | `<Input type="tel">` in `AuthModal` | Same molecule as sign-in / generic signup. | CHANGED_INTERACTION |
| Continue CTA `S9j3u` "Continue" + chevron-right (`ielVS`/`ucaIl` mobile) | (none) | Same as generic signup. Loading state Q7. | NEW_INTERACTION |
| Dashed OTP-info card `PBJX5`/`xC8OY` "You'll receive a 4-digit OTP on this number to verify your shop." | (none) | Note: copy here is **"to verify your shop."** vs generic's "to verify." Subtle copy variation — intentional? See Q3. | COPY_CHANGE |
| Sign-in link `T21vue`+`jFWuC` / `fnsI3`+`hm6C7` "Already have an account? · Sign in" | (none) | Same as generic. | NEW_INTERACTION |
| Terms footer `Lgauv`/`Vbf8U` "By continuing you agree to our Terms & Privacy." | (none) | Same as generic — see generic Q7. | NEW_FIELD |
| Mobile mart-shelf brand-grid hero strip (claimed in user-description; not in `xazGe` snapshot) | (none) | Possibly missing from the EN frame, or in a different node. Per OQ-A uses generic illustrations. Asset list: 8 silhouettes (Lays / Tapal / Knorr / Olper's / Sufi / Surf / Philips / Lifebuoy per user description — but per OQ-A these become *generic* silhouettes, not branded). See Q9, Q10. | NEW_FIELD |
| `auth.ts:23-25` comment about `business_name` (Batch 5) | (`businessName` column lands via migration 0012 in Batch 5; not yet applied per the comment) | Per OQ-S, `shopName` + `shopAddress` are **separate** columns from `businessName`. Need to confirm they are not the same — see Q12. | AMBIGUOUS |
| Phone-already-registered (same as generic) | (none) | Same handling decision as generic Q9. | NEW_STATE |

---

## 3. Schema / type implications

### 3.1 New columns on `user` (per OQ-R + OQ-S)

```
ALTER TABLE "user"
  ADD COLUMN "retailer_type" text,           -- enum: 'generic' | 'shopkeeper'
  ADD COLUMN "shop_name" text,
  ADD COLUMN "shop_address" text;
```

- All three nullable. Existing rows get NULL.
- Drizzle schema (`packages/database/src/schema/auth.ts`) extends the `user` `pgTable` definition with three columns.
- Better-auth `additionalFields` configuration extends to include `retailerType`, `shopName`, `shopAddress` so they are persisted via the user-create path.

### 3.2 Validation schema

- New zod schema for the form payload — likely `signupShopkeeperSchema` or shared with generic `signupGenericSchema` discriminated by `retailerType`. See Q11 for whether to keep two schemas or one discriminated.

### 3.3 Carrying form state across the OTP boundary

- Same problem as generic signup §3.3 / Q8. Shopkeeper carries 4 fields (shopkeeperName, shopName, shopAddress, phone) instead of 2.

### 3.4 `businessName` (Batch 5) vs `shopName` (this batch) — Q12

- Per `auth.ts:23-25` comment, `businessName` lands via migration 0012 in Batch 5 (`buyer-settings`).
- Per OQ-S, `shopName` is a separate column on `user`.
- Need confirmation that `shopName` and `businessName` are intentionally distinct (e.g., `shopName` = retail shop signage; `businessName` = legal/registered entity), not synonyms. See Q12.

---

## 4. Behavior implications

### 4.1 Continue submit

1. Validate 4 fields (see Q5, Q6).
2. Call `authClient.phoneNumber.sendOtp({ phoneNumber })`.
3. On success → push to `/auth/otp?phone=…` carrying `name + retailerType='shopkeeper' + shopName + shopAddress` per the chosen architecture (generic signup Q8).
4. On phone-already-registered → see generic Q9.

### 4.2 Switcher flow

- Toggling to "Generic" routes to `/auth/sign-up?type=generic` (or alternative per generic Q4) with form state cleared.

### 4.3 Mobile mart-shelf hero strip (per OQ-A generic illustrations)

- 8 generic stylized silhouettes / illustrations on an ink-bg strip with overlaid "Set up your shop" headline. Asset hosting: `apps/web/public/`? `packages/ui/src/assets/`? See Q10.

### 4.4 Language toggle

- Same as generic — presentational only per OQ-I. See generic Q3.

---

## 5. Open questions for me

### Copy

1. **OTP-info card "4-digit OTP to verify your shop." vs ship-time 6-digit.**
   - **Plausible answers:** (a) "6-digit OTP". (b) "OTP". (c) Keep "4-digit" verbatim.
**Answer:** (a) "6-digit OTP". Mirrors sign-in Q1 / OTP Q1 / generic-signup Q1.

2. **"Tell us about your shop" headline placement.**
   - **Observed in design:** Desktop 30/800 (`GZS8N`), mobile 22/800 (`p3vMpB`).
   - **Observed in code:** None.
   - **Question:** The mobile typography is significantly smaller than desktop (22 vs 30). Is this intentional responsive scaling, or should mobile match desktop's 30/800?
   - **Plausible answers:** (a) Honor the responsive split: 30/800 desktop + 22/800 mobile. (b) Match desktop 30/800 across breakpoints. (c) Use a fluid-type token that lands somewhere between.
**Answer:** (a) Honor the responsive split. The mobile reduction is intentional given the four-field form below; matching desktop on mobile would push fields below the fold.

3. **Sub copy variation: "to verify your shop." (shopkeeper) vs "to verify." (generic).**
   - **Observed in design:** Shopkeeper sub `PBJX5` ends "to verify your shop." Generic sub `xC8OY` ends "to verify."
   - **Question:** Is the "your shop" specifier intentional copy refinement, or accidental drift?
   - **Plausible answers:** (a) Adopt verbatim — shopkeeper says "your shop", generic says nothing. (b) Standardise to "to verify." across both. (c) Standardise to a more specific shared variant ("to verify your number").
**Answer:** (a) Adopt verbatim. The shopkeeper variant's "to verify your shop" deliberately contextualises the form's purpose; the generic variant stays terse.

### Behavior / molecule

4. **Textarea molecule sourcing.**
   - **Observed in design:** 80h textarea on `nzjVW`/`uzkfn`. Buyer-checkout rider notes (Batch 3) also lands a textarea. Currently no textarea primitive in `@repo/ui`.
   - **Question:** Does this batch land the textarea primitive (consumed by checkout in Batch 3 — but Batch 3 already shipped) or has Batch 3 already provided it?
   - **Plausible answers:** (a) Batch 3 already shipped the textarea primitive when checkout rider notes landed; reuse from `@repo/ui/components/textarea`. Verify by grep before writing this screen. (b) Batch 3 inlined a textarea without making it a primitive; this batch promotes it. (c) Build a fresh textarea primitive only if neither (a) nor (b).
**Answer:** (a) Reuse `@repo/ui/components/textarea` if Batch 3 promoted it; otherwise (b) promote whatever Batch 3 inlined. The runner must `grep` first per CLAUDE.md hard rule 3 before assuming a primitive exists. Do not build a new primitive without verifying.

### Validation

5. **"Shopkeeper name" validation (vs generic Q5 "Full name").**
   - **Observed in design:** Label only.
   - **Question:** Identical rule to generic Q5, or shopkeeper-specific (e.g., honorifics like "Bhai" allowed)?
   - **Plausible answers:** (a) Identical to generic. (b) Looser — allow more punctuation common in colloquial Pakistani forms ("Saleem Bhai", "Mian Saleem"). (c) Stricter — require both first + last word.
**Answer:** (a) Identical to generic Q5 (min 2 / max 80 / `/^[\p{L}\s.'-]+$/u`). The generic regex already covers honorifics like "Bhai" and "Mian" — no shopkeeper-specific loosening needed.

6. **"Shop name" + "Shop address" validation rules.**
   - **Observed in design:** Labels + placeholders ("Saleem Snacks Co.", "Block 4, Satellite Town, Gujranwala 52250, Punjab"). Field shapes: 48h text + 80h textarea.
   - **Observed in code:** Columns don't exist yet (per OQ-S land in this batch).
   - **Question:** Min/max length, allowed characters, required vs optional?
   - **Plausible answers:** (a) Both required at signup; shop name min 2 / max 80; shop address min 10 / max 300. (b) Both required; loose validation (min 1 / max 200). (c) Make both optional at signup; capture later in profile (matches the column being nullable).
**Answer:** (a) Both required client-side at signup; `shopName` min 2 / max 80; `shopAddress` min 10 / max 300. Columns stay `nullable` server-side per OQ-S so legacy users (pre-migration) get NULL, but the signup form enforces presence.

7. **Continue CTA loading state.** Same as generic Q6.
**Answer:** Same as generic Q6 — "Continue" copy stays, spinner replaces the trailing chevron, button disabled.

### Mobile chrome / hero

8. **Mobile back affordance.**
   - **Observed in design:** Mobile header `O4e379` shows logo + lang toggle + cart on right. No back chevron.
   - **Question:** Same as generic Q10 — no back, browser-back-only, or add chevron-left?
**Answer:** Same as generic Q10 — no back button, match the design.

9. **Mobile mart-shelf hero strip presence.**
   - **Observed in design:** The user-description claims a 3×2 brand-grid hero strip with overlaid "Set up your shop" headline on the mobile EN screen. The `xazGe` snapshot I captured **does not show this strip** — the layout starts with the switcher at y=20.
   - **Question:** Is the strip in `xazGe` and I missed it (different node), in a separate frame I haven't located, or only on the Urdu mobile variant (which is out of scope per OQ-I)?
   - **Plausible answers:** (a) The strip is on `xazGe` somewhere I missed — re-snapshot at deeper depth. (b) The strip is only on the Urdu mobile frame `izPvi`; EN mobile has no strip. (c) The strip is in a separate revision of the mobile EN frame that the user has not committed.
**Answer:** (a) Re-snapshot `xazGe` at deeper depth during implementation; the user-description asserts the strip is present on EN mobile. If the deeper snapshot still does not surface it, fall back to (b) — drop the strip from EN mobile and revisit when the Urdu variant lands.

10. **Mart-shelf asset list, hosting, and arrangement (only relevant if Q9 confirms strip is in EN scope).**
    - **Observed in design:** Per user-description, 8 tiles arranged 3×2 (which is 6, not 8 — see Q10b). Per OQ-A → generic stylized silhouettes / illustrations.
    - **Question:** Asset count (3×2 = 6 vs the user's text says 8), arrangement (which goes where), and hosting location?
    - **Plausible answers:** (a) 8 tiles in a 4×2 grid (the user's text "3×2 grid" is a typo) hosted in `apps/web/public/auth/shopkeeper-mart-shelf/*.svg`. (b) 6 tiles in a 3×2 grid (literal) hosted in `packages/ui/src/assets/`. (c) Defer arrangement until Q9 resolves.
**Answer:** (a) 8 tiles in a 4×2 grid hosted in `apps/web/public/auth/shopkeeper-mart-shelf/*.svg`. Per OQ-A use **generic stylized silhouettes** (not branded products) — `tile-1.svg` … `tile-8.svg` rendered as ink-on-paper line art. No legal sign-off needed. Resolve only after Q9 confirms the strip is in EN scope.

### Schema

11. **Shared signup zod schema vs separate.**
    - **Question:** One `signupSchema` discriminated by `retailerType`, or two distinct `signupGenericSchema` + `signupShopkeeperSchema`?
    - **Plausible answers:** (a) Single discriminated union (`zod.discriminatedUnion('retailerType', [...])`). (b) Two distinct schemas — clearer per-screen surface. (c) Shared base schema + extension for shopkeeper-only fields.
**Answer:** (a) Single `zod.discriminatedUnion('retailerType', [genericVariant, shopkeeperVariant])`. DRY; the server can `parse` once and TypeScript narrows on the discriminator. Lives in `packages/schemas/src/auth/signup.ts`.

12. **`shopName` (this batch) vs `businessName` (Batch 5).**
    - **Observed in design:** "Shop name" field on this screen.
    - **Observed in code:** `auth.ts:23-25` notes that `business_name` lands in Batch 5 migration 0012 and is consumed by the account drawer (Batch 6).
    - **Question:** Are `shopName` and `businessName` intentionally distinct columns, or is one of them redundant?
    - **Plausible answers:** (a) Distinct: `shopName` is the retail signage name (e.g., "Saleem Snacks Co."), `businessName` is the legal/registered entity (filled later in profile). Keep both columns. (b) Redundant — drop the Batch 5 `businessName` migration plan and reuse `shopName` (would require revisiting `buyer-settings` and `buyer-account-drawer` gap-analyses). (c) Distinct, but the account drawer should display `shopName` if `businessName` is null.
**Answer:** (c) Distinct columns, drawer prefers `businessName` and falls back to `shopName` when null. `shopName` = retail signage entered at signup; `businessName` = legal/registered entity entered later in `/profile/settings`. Drawer identity card: `businessName ?? shopName ?? user.name`.

### Routing

13. **Shopkeeper signup route address.**
    - **Question:** `/sign-up/shopkeeper` (sibling of `/sign-up`), `/auth/sign-up?type=shopkeeper` (single route + query), or shared `/sign-up` with internal switcher state?
    - **Plausible answers:** Same set as generic Q4, applied to this screen.
**Answer:** Same as generic Q4 — single route `/sign-up?type=shopkeeper` (NOT `/sign-up/shopkeeper`). One page file, in-page form swap via the segmented switcher.

---

**File written to:** `D:\Moeed 8th Sem\Fyp\Code\shalmi-web\.claude-revamp\screens\buyer-signup-shopkeeper\gap-analysis.md`

(End of Buyer · Shopkeeper Signup gap analysis. Stopping per `BATCH_RUNNER.md` Step A. Urdu/RTL frames `w2jcu`/`izPvi` deliberately not analysed per OQ-I.)
