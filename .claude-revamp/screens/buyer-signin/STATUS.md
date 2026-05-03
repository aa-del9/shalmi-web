# buyer-signin (and all of Batch 7) — status

**Stop reason:** No per-screen binding spec exists for any Batch 7 screen.

`05-batch-plan.md` lists Batch 7 (added 2026-05-04) and the seven OQs are
resolved at the plan level. But `BATCH_RUNNER.md` Step A requires reading
`screens/<slug>/gap-analysis.md` (or `feature-spec.md` for NEW screens)
and "TREAT THE ANSWERS AS BINDING SPEC" before implementing.

None of the five Batch 7 screens has any spec file:

| Slug                       | gap-analysis.md | feature-spec.md |
|----------------------------|-----------------|-----------------|
| `buyer-signin`             | ❌ missing      | ❌ missing      |
| `buyer-otp`                | ❌ missing      | ❌ missing      |
| `buyer-signup-generic`     | ❌ missing      | ❌ missing      |
| `buyer-signup-shopkeeper`  | ❌ missing      | ❌ missing      |
| `buyer-checkout` (augment) | ✅ exists (Batch 3 spec, no one-time-addr Q) | n/a |

The `buyer-checkout` gap-analysis exists from Batch 3 but does not cover
the one-time / unsaved delivery address card that Batch 7 augments — that
specific molecule is implied by the Pencil revision of 2026-05-04 and was
never put through the gap-analysis interview.

## What I tried

Nothing. Per the runner: "Stopping is the correct behavior. Do not
improvise to keep the loop going." Per CLAUDE.md hard rule 1: "Never
invent fields, copy, or behavior."

## What I need to unblock

1. Run the gap-analysis / feature-spec phase for each of the five Batch 7
   surfaces against the current Pencil frames. This is the same process
   that produced every other `screens/<slug>/gap-analysis.md` for
   Batches 1–6.

2. The plan-level OQ answers (already captured in `05-batch-plan.md`)
   feed the spec interviews — they don't replace them. Per-screen specs
   still need to nail down:

   - **buyer-signin** — exact field labels, validation messages, the
     `Continue as Guest` button copy + post-click behaviour (per OQ-G(b)
     guest is real, not flag-only — does the button skip auth and route
     straight to checkout? does it persist a guest cart key?), the
     `Sign in as Vendor · Admin login` link wording (per OQ-V(b) the
     unified `/auth` does role auto-detection — are these tertiary links
     dropped, or kept as a passive hint?), benefits-card copy, error
     states (phone not registered, network failure), retailer-vs-other
     role detection on submit.

   - **buyer-otp** — confirm 6-digit grid (per OQ-O(b)), exact resend
     timer interval + copy, `SECURE` stamp position, `Never share your
     OTP` caution exact copy, error state for wrong code, what happens
     after N wrong attempts.

   - **buyer-signup-generic** — `Generic ↔ Shopkeeper` switcher
     interaction (resets form? swaps route? collapses fields?), exact
     field validation (full name min/max, phone format), how
     `user.retailerType = 'generic'` is written (per OQ-R(a) the column
     name is `retailerType` not `accountType`), Continue button error
     states, what happens if the phone is already registered.

   - **buyer-signup-shopkeeper** — only the EN variant is in scope (per
     OQ-I "ignore Urdu screens for now"). Need: exact field labels,
     textarea row count for shop address, validation rules for
     `shopName` + `shopAddress` (per OQ-S(a) both as nullable cols on
     `user`), language toggle behaviour given Urdu is deferred (hide?
     show but disabled? show but no-op?), brand-grid asset list (per
     OQ-A(a) generic illustrations — but which 8 silhouettes,
     in what arrangement, hosted where).

   - **buyer-checkout one-time-addr augment** — exact divider chip copy,
     `WON'T BE SAVED` stamp angle/position, `Don't save` switch default
     state confirmation (plan says ON), hint card exact copy, validation
     for the inline address fields (recipient, phone, street, city,
     postal, province, optional landmark — what's required?), how the
     form interacts with the existing saved-address radio group (does
     selecting a saved address clear this card's state?
     mutually-exclusive radios?), and per OQ-G how the guest path
     intersects this card (a guest checkout MUST come through this card
     since they have no saved addresses — does the card auto-expand?).

3. Schema migration files for OQ-R + OQ-S. Per the resolutions:
   - `user.retailerType` enum (`generic | shopkeeper`) nullable.
   - `user.shopName` text nullable.
   - `user.shopAddress` text nullable.
   - `user.businessName` already lands in Batch 5 — confirm it is
     additive to the shopkeeper signup (filled? blank? same field?).
   - `orders.guestSessionId` text nullable + relax
     `/api/checkout` `requireSession()` (OQ-G(b) — non-trivial; the
     server route, the Zod schema, the cart store, and the order
     write-side all change). This is a **second large schema change in
     this batch** alongside the `user.*` columns; deserves its own
     pre-implementation review.

4. Pencil node IDs for each of the four auth frames + the checkout
   one-time-address card — without them I cannot use `pencil:batch_get`
   for the binding measurement / copy values.

## Gap-analysis question that should have covered this

None — this is structural (the spec phase for Batch 7 has not been run).

## Resolution

**Date resolved:** 2026-05-04.

All five Batch 7 surfaces have binding spec files with every §5 question answered. The runner can pick the batch back up subject to the sequencing check in §3 below.

### Per-screen specs delivered (with answer counts)

| Slug | gap-analysis.md | §5 answers | Notes |
|---|---|---|---|
| `buyer-signin` | ✅ | 16/16 | This file's parent. |
| `buyer-otp` | ✅ | 14/14 | OQ-O resolved 6-digit; design's 4-box grid is illustrative. |
| `buyer-signup-generic` | ✅ | 11/11 | Single `/sign-up?type=generic\|shopkeeper` route. |
| `buyer-signup-shopkeeper` | ✅ | 13/13 | EN-only per OQ-I; Urdu (`w2jcu`/`izPvi`) explicitly out of scope. |
| `buyer-checkout` (one-time-addr augment) | ✅ as sibling `gap-analysis-one-time-addr.md` | 15/15 | Original 2026-05-02 `gap-analysis.md` remains binding for everything else. |

### Plan-level OQ resolutions consumed by the specs

Captured in `05-batch-plan.md` "Open ordering questions — Batch 7" and re-stated in §0 of each gap-analysis file:

- **OQ-R** → `user.retailerType` enum (`generic | shopkeeper`), nullable.
- **OQ-S** → `user.shopName` + `user.shopAddress` as nullable text columns on `user`.
- **OQ-I** → Urdu screens deferred (EN-only this batch).
- **OQ-G** → real guest checkout: `orders.guestSessionId` nullable, `/api/checkout` `requireSession()` relaxed, address as source of truth.
- **OQ-V** → unified `/auth` with role auto-detection from phone.
- **OQ-O** → keep 6-digit OTP (illustrative 4-box grid in design).
- **OQ-A** → mart-shelf brand-grid uses generic stylized illustrations.

### Schema migration plan

Consolidated in `screens/_batch-7-schema-plan.md`. Owner-batch table:

- **Batch 7-owned:** `user.retailerType`, `user.shopName`, `user.shopAddress`, `orders.guestSessionId`, `orders.shippingPostalCode`, `orders.shippingProvince`, `orders.shippingLandmark`.
- **Batch 5 hard predecessor:** `addresses.postalCode`, `addresses.province`, `addresses.landmark` (the third was re-owned to Batch 5 per `gap-analysis-one-time-addr.md` Q6 — a one-line amendment to Batch 5's plan).

All migrations are forward-only and additive (nullable). Rollback = code revert.

### Sequencing check (runner Step A)

The one-time-addr augment depends on Batch 5's `addresses` migrations being applied to dev/staging. **The runner MUST fail-stop at Step A** if `addresses.postalCode / province / landmark` columns are missing. See `_batch-7-schema-plan.md §3`.

### Implementation prerequisites

Beyond the sequencing check, Batch 7 implementation has three small verification steps before code is written:

1. Per CLAUDE.md hard rule 3, runner greps for `AuthModal` consumers across the codebase before retiring it (`buyer-signin/gap-analysis.md` Q16). If grep finds an embedded use (e.g. a header "Sign in" trigger), repoint it to `<Link href="/auth?redirect=…">` rather than re-skin the modal.
2. Per `buyer-signup-shopkeeper/gap-analysis.md` Q4, runner verifies whether Batch 3 promoted a `Textarea` primitive in `@repo/ui/components/textarea`. If yes — reuse. If no — promote whatever Batch 3 inlined. Do NOT build a new primitive without verifying.
3. Per `buyer-signup-shopkeeper/gap-analysis.md` Q9, runner re-snapshots Pencil frame `xazGe` at deeper depth to confirm the mart-shelf hero strip presence on EN mobile. If the strip is absent in the deeper snapshot, fall back to dropping the strip from EN scope (Q9 plausible answer (b)).

### Spot copy pulls during implementation

Per `gap-analysis-one-time-addr.md` Q2, the sub-line copy under "One-time delivery" must be pulled verbatim from Pencil text nodes `D2olN` (desktop) and `jsi2I` (mobile) via `pencil:batch_get` — those reads were not done during the gap-analysis phase to keep token costs low.

### Status

**Unblocked.** No remaining plan-level or per-screen specs blocking the batch. Implementation may begin pending the three verification steps above and the Batch 5 sequencing check.

---

## 2026-05-04 retry attempt — still blocked

Re-ran the batch on 2026-05-04 after noticing the operator added
gap-analysis files for all 5 Batch 7 surfaces:

- `screens/buyer-signin/gap-analysis.md`
- `screens/buyer-otp/gap-analysis.md`
- `screens/buyer-signup-generic/gap-analysis.md`
- `screens/buyer-signup-shopkeeper/gap-analysis.md`
- `screens/buyer-checkout/gap-analysis-one-time-addr.md`

That addresses item **1** of the original unblock list above (the gap-
analysis phase has been run). It does **not** address item **2** (the
per-screen open questions still need binding answers). Each new
gap-analysis ends with a numbered §5 "Open questions for me" block:

| Slug                              | Open Q count |
|-----------------------------------|--------------|
| `buyer-signin`                    | 16 (Q1–Q16)  |
| `buyer-otp`                       | 14 (Q1–Q14)  |
| `buyer-signup-generic`            | 11 (Q1–Q11)  |
| `buyer-signup-shopkeeper`         | 13 (Q1–Q13)  |
| `buyer-checkout` one-time-addr    | 15 (Q1–Q15)  |

Each file explicitly self-stops: *"no implementation begins until the
questions above are answered."* Per CLAUDE.md hard rule 1 ("Never invent
fields, copy, or behavior") and BATCH_RUNNER.md Step A ("TREAT THE
ANSWERS AS BINDING SPEC"), the runner cannot proceed.

The Resolution section above is also still the placeholder — per
BATCH_RUNNER.md "The runner will pick up the screen for retry only
after this section contains real content."

### What I need to unblock (updated)

1. ~~Run the gap-analysis / feature-spec phase for each of the five
   Batch 7 surfaces.~~ **Done.**
2. Provide binding **Answers** to every numbered question in each of
   the 5 §5 blocks. Once answered, prepend each Answer below the
   Question in the same gap-analysis file (the same convention every
   other shipped batch followed).
3. Confirm the schema-migration plan (still as item 3 of the original
   list above): `user.retailerType / shopName / shopAddress`,
   `orders.guestSessionId`, `orders.shippingPostalCode / shippingProvince
   / shippingLandmark` (or jsonb refactor — per checkout one-time-addr
   Q14), and the Batch-5-vs-Batch-7 sequencing for `addresses.postalCode
   + province + landmark` (per checkout one-time-addr Q13).
4. Pencil node IDs are referenced in the gap-analyses now — that item
   is satisfied at the structural level, though batch_get reads of
   verbatim copy strings (e.g. checkout one-time-addr Q2 sub-line) are
   still pending and may need spot pulls during implementation.
5. Update **this Resolution section** with real content once the above
   are addressed; only then will the runner pick the batch back up.

---

## 2026-05-04 retry attempt #2 — Batch 5 sequencing check FAILED

The operator filled in the Resolution section above with a substantive
unblock note. The runner picked the batch back up and immediately ran
the schema sequencing check from `_batch-7-schema-plan.md §3.4`:

> "Before any Batch 7 implementation begins, the runner must:
> 1. Read `packages/database/src/schema/addresses.ts` (or equivalent)
>    and confirm `postalCode`, `province`, `landmark` columns exist.
> 2. **If missing → STOP, post a STATUS note 'Batch 5 not yet applied',
>    do not improvise.**"

State of the Drizzle schema at retry time:

| Column | Migration file | Drizzle schema | Status |
|---|---|---|---|
| `addresses.postal_code` | ✅ `0012_buyer_settings.sql` | ❌ deferred | **Migration not applied to dev DB** (per `addresses.ts:20-25` comment + commit `67cb1a4`) |
| `addresses.province` | ✅ `0012_buyer_settings.sql` | ❌ deferred | Same |
| `addresses.landmark` | ❌ **MISSING from migration** | ❌ MISSING | Batch 5 plan amendment required (per `_batch-7-schema-plan.md §3.3`); column never added |
| `user.business_name` | ✅ `0012_buyer_settings.sql` | ❌ deferred | Migration not applied (per `auth.ts:20-24` comment + commit `1cb6383`) |

Two distinct blockers:

1. **Migration 0012 has not been applied to dev/staging** — the
   pattern is consistent with prior Batch 5 / Batch 6 ledger entries
   ("smoke deferred pending dev-DB apply of migration 0012"). For
   Batch 7 the schema plan upgrades this from "smoke deferred" to
   "implementation must not begin." Strictly per the plan, this is a
   STOP.

2. **`addresses.landmark` was never added.** The schema plan §3.3
   amends Batch 5 to add this column — but Batch 5 already shipped
   (commit `5950add` per batch-progress ledger). The amendment is a
   Batch 5 follow-up that must land BEFORE Batch 7 can run, since
   Batch 7 is the first consumer.

### What I need to unblock (3rd revision)

a. Apply migration `0012_buyer_settings.sql` to dev/staging.
b. Reinstate the deferred Drizzle field declarations:
   - `addresses.ts`: `postalCode: text('postal_code')`,
     `province: text('province')`.
   - `auth.ts`: `businessName: text('business_name')` (required by
     account drawer Batch 6 too, currently rendered as graceful no-op).
c. Author + apply migration `0013_addresses_landmark.sql`:
   `ALTER TABLE addresses ADD COLUMN landmark text;`. Add the matching
   Drizzle field. This closes the §3.3 plan amendment.
d. Confirm via `pnpm db:check` (or equivalent) that all three columns
   exist on the dev DB.
e. Update **this Resolution section** with the new state ("Batch 5
   sequencing satisfied; columns confirmed on dev DB; Drizzle reflects
   schema") so the runner retries. Per BATCH_RUNNER.md, the runner
   only picks the batch back up after this section is updated.

### What I did NOT do

- Did NOT improvise around the missing migration (CLAUDE.md hard
  rule 1 + the schema plan's explicit STOP).
- Did NOT touch `addresses.ts` or `auth.ts` Drizzle declarations
  (they're deferred for a documented reason — applying them without
  the DB migration would break existing routes).
- Did NOT author migration 0013 (Batch 5 amendment is owned by the
  operator, not Batch 7's runner).
- Did NOT begin reading per-screen §5 answers — even if those answers
  are now in place, the schema layer must be settled before any
  implementation step in BATCH_RUNNER.md Step B is meaningful.
