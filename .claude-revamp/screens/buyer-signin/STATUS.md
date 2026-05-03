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

(none yet — operator will fill this in once unblocked)

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
