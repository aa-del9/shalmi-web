# Buyer · Checkout — One-Time Delivery Address (Augment) — Gap Analysis

> **Phase:** Per-screen gap analysis (read-only).
> **Date produced:** 2026-05-04. **This is a follow-up addendum to `screens/buyer-checkout/gap-analysis.md` (2026-05-02).** The original analysis predates the Pencil revision that introduced the one-time delivery card; this file covers only that augment.
> **Pencil source:** `Pencil-Design/Shalmi` —
> Desktop: parent frame `S72tsk` → left column `o6t0O xLeft` → section frame `oDIdC secAddr`. The new card lives inside `oDIdC` as `FmYa4` (the `One-time delivery` card frame); divider is `l0b3Ge`.
> Mobile: parent frame `OqB5X` → section `B3khgq mxAddr`. The new card lives inside `B3khgq` as `p2iJZu` (mobile one-time delivery card); divider is `mDKz3`.
> **Code source:**
> - `apps/web/src/app/(storefront)/checkout/page.tsx`
> - `apps/web/src/modules/checkout/components/delivery-address-section/index.tsx` (Pencil radio-led saved-address cards; today the "Use a new address" outline button opens the existing `AddressDialog`).
> - `apps/web/src/modules/checkout/schemas/index.ts` (`checkoutShippingFormSchema` — name/phone/address/city, currently consumed by `AddressDialog` create flow).
> - `packages/schemas/src/orders/checkout.ts` (`shippingAddressSchema` — name/phone/address/city only; `checkoutCartPayloadSchema` already supports `addressId XOR shippingAddress` via the existing `.refine`; `riderNotes` already added).
> - `apps/web/src/app/api/checkout/route.ts` — currently writes the snapshot from `addressId` lookup OR `payloadShippingAddress`. Already supports the inline path on the wire.
> - `apps/web/src/modules/user-addresses/components/address-dialog/` (existing AddressDialog used by the checkout `+ Use a new address` button — see Q9).
>
> **Inputs read:** the existing `screens/buyer-checkout/gap-analysis.md` (2026-05-02), `05-batch-plan.md` (Batch 7 OQs already resolved — see §0), `06-scope-cut.md`, `07-default-proposals.md`.
>
> Per CLAUDE.md hard rule 1, **no implementation is proposed**. Every actionable row in §2 maps to a numbered question in §5.
>
> **Amendment 2026-05-04:** the optional `Landmark / nearest reference` field is **dropped from Batch 7 scope**. References to it remain in §0a–4 below as an audit trail (the design still draws it), but Q6's answer supersedes — see Q6 for the binding decision. The `addresses.landmark`, `orders.shippingLandmark`, and `shippingAddressSchema.landmark` additions are removed from the implementation plan; the EN form variants render without the row.

---

## 0. Plan-level resolutions consumed (do not re-ask)

- **OQ-G** → real guest checkout. `orders.guestSessionId text nullable`; `/api/checkout` `requireSession()` is relaxed to accept `(session OR guestSessionId)`; address is the source of truth for user info throughout the order lifecycle. **Guest path MUST come through this card** (guest has no saved addresses).
- **Existing buyer-checkout Q8 / Q10** (2026-05-02) — `+ Use a new address` button opens the existing `AddressDialog`; the manual shipping-form path was relocated into the dialog, and `checkoutShippingFormSchema` became part of the dialog's create flow. The one-time-addr card is a **third** address-input path (alongside saved-address-radio and dialog-create) that did not exist in the 2026-05-02 analysis.

---

## 0a. Pencil components used here that were not yet inventoried

The one-time-addr card uses the following compound elements that are **not** in `02-design-inventory.md §3` and have **not** been built in `04-design-system-implementation-log.md`:

- **`OR · ONE-TIME DELIVERY` divider** (`l0b3Ge` desktop / `mDKz3` mobile) — same molecule class as the sign-in's OR divider (also not catalogued; see `buyer-signin/gap-analysis.md §0a`), but with a wider chip carrying mono 11/700 ink-3 letter-spacing 0.12 "OR · ONE-TIME DELIVERY" (`m1DeB4`) on desktop, and a shorter "OR" (`cazL0`) on mobile (mobile uses just "OR", not the full eyebrow). **Not catalogued.**
- **One-time delivery card frame** (`FmYa4` desktop / `p2iJZu` mobile) — paper-2 fill, 1.5px **dashed** rule-2 border, 12 radius. The dashed border echoes the receipt-paper aesthetic from the sign-in benefits card and the OTP-info card. **Not catalogued.**
- **Card header row** (`YgUNx` desktop / `OMnZV` mobile) — 3 sub-elements: (i) green-bg send-icon tile (`Jn1Kq` desktop 36×36 with lucide `send` icon `u1734`, fill probably `$green-bg`); (ii) title block (`GQyIY`/`TqSyD`) with sans 14/700 ink "One-time delivery" (`g99Vt`) + sub line directly below; (iii) rotated `WON'T BE SAVED` amber stamp (mobile uses lowercase `won't be saved` per `rEIe4` mono 10/normal ink-3 — see Q1) **OR** the user-description's amber/rotated stamp (which is on desktop). On the right end, a `Don't save` toggle switch (`PexKA` desktop with `en3tQ` mono "Don't save" + `T7NX5q` switch tile; mobile `yIr4u` is the switch only). Stamp + switch positioning differs between breakpoints.
- **Sub-line caption** (under the title) — desktop `D2olN` h54 sans/normal ink-2 lineHeight 1.4. Per user-description the copy is "Use this for gift orders or a one-off shop — we won't add it to your saved addresses." Mobile (`jsi2I` h30) — same copy but two lines. Not in batch_get yet — see Q2.
- **Stacked form rows** (`NLOuF` desktop, `St4VZ` mobile) — desktop uses 2-up / full / 3-up / full row layouts; mobile uses single column with one 2-up row (city + postal). Field labels: `whi3d` "Recipient name", `l4upfB` "Phone number" (with `+92` chip — same molecule as auth screens), `gnyZJ` "Street, house / shop number", `QYGIC` "City", `G3t6ID` "Postal code" (mono digits — see Q5), `tX52F` "Province" (dropdown), `b0luF` "Landmark / nearest reference" with `yKyT5` "Optional" mono pill on the right.
- **"Optional" mono pill** (`yKyT5`) — mono 11/600 ink-3, no border, no background; just inline text after the label. **Not catalogued; minor.**
- **Province dropdown** — primitive shape: 44h field with trailing chevron. No existing select primitive in `02 §3` shows a dropdown at this height. The province list is undrawn — see Q4.
- **Bottom hint card** (`hYNcq` desktop / `bB4IO` mobile) — paper-2 dashed card with leading lucide `info` icon (`E6qAQT`/`s3CpML` 14×14) + 2-line caption (`MxDfO` "Used only for this order." sans 12/700 ink + `JF01X` "Toggle off the switch above if you'd like us to save this address to your account for next time." sans 11 ink-3 lineHeight 1.5). **Same molecule class as the sign-in hint card; new copy.**

---

## 1. Layout & structure

### Desktop (`oDIdC secAddr`, 948 wide, h≈730 — was h≈500 before the augment)

The pre-augment section (per the 2026-05-02 analysis) was: `J6UYcA` eyebrow (`01 DELIVERY ADDRESS`) → `HoVLE` saved-addresses 2-up cards → `BJSn9` `+ Use a new address` button → end.

The augment **inserts** the following between the `+ Use a new address` button (at y=149, h36) and any subsequent section:

1. **`OR · ONE-TIME DELIVERY` divider** (`l0b3Ge`, h19, y=199) — hairline rule + chip + hairline rule.
2. **One-time delivery card** (`FmYa4`, h≈497, y=232):
   - **Header row** (`YgUNx`, y=18) — green-bg icon tile + title "One-time delivery" + rotated `WON'T BE SAVED` stamp + `Don't save` toggle.
   - **Sub line** under title (within `GQyIY`/`D2olN`).
   - **Form rows** (`NLOuF`, h300, y=107):
     - `BlKam` (h66, y=0) — 2-up: `abNaE` Recipient name + `nRJhi` Phone (`+92` chip).
     - `ttN5H` (h66, y=78) — full-width Street.
     - `x7OXP` (h66, y=156) — 3-up: `C9MgRC` City + `yJe1q` Postal code + `LAvhS` Province dropdown.
     - `hggk1` (h66, y=234) — full-width Landmark with "Optional" mono pill.
   - **Hint card** (`hYNcq`, h58, y=421) — info icon + 2-line caption.

### Mobile (`B3khgq mxAddr`, 420 wide, h757)

Pre-augment: eyebrow `GcQGG` y=8 + 2 saved-address cards (`DKw5l` y=33, `O7Qd9F` y=131 collapsed) + `T2sBY` `+ Use a new address` y=199 → end.

Augment inserts:

1. **OR divider** (`mDKz3`, h23, y=244) — narrower chip with just "OR" copy on mobile.
2. **One-time delivery card** (`p2iJZu`, h472, y=277):
   - Header `OMnZV` y=14 (icon + title + stamp + switch).
   - Sub-line `jsi2I` y=58.
   - Form `St4VZ` y=100, single column:
     - `XJZyc` (h42) Recipient name.
     - `KiHxB` (h42) Phone with `+92` chip.
     - `PjKgG` (h42) Street.
     - `F2M1b7` (h42) — 2-up: City + Postal.
     - `HzM3C` (h42) Province dropdown.
     - `n2mNW` (h36) Landmark optional.
   - Hint card `bB4IO` y=408 (h50).

### Existing code layout (`DeliveryAddressSection`)

- Lists saved addresses as Pencil radio-led cards (Batch 3 implementation).
- `+ Use a new address` button (lines 100-110) opens `AddressDialog` (existing `modules/user-addresses/components/address-dialog/`).
- The dialog writes to `POST /api/addresses` and the new address is appended to the saved list. There is no inline manual form; the `checkoutShippingFormSchema` lives inside the dialog.

### High-level layout deltas

- **NEW one-time-addr card** — a third address-input path (alongside saved-address radio + AddressDialog).
- **NEW `OR · ONE-TIME DELIVERY` divider** between saved addresses and the one-time card.
- **NEW `Don't save` toggle** that controls whether the inline address is persisted.
- **NEW form rows** beyond the existing `checkoutShippingFormSchema` (which has only name/phone/address/city): postal code, province. (Landmark dropped per 2026-05-04 amendment — see Q6.)
- **NEW mutual-exclusion behavior** between selected saved address and the one-time card.
- **NEW `WON'T BE SAVED` rotated stamp** treatment.

---

## 2. Element-by-element diff

| pencil_element | existing_element | diff_summary | category |
|---|---|---|---|
| `OR · ONE-TIME DELIVERY` divider `l0b3Ge` (desktop) / `mDKz3` (mobile) | (none) | New divider molecule. Mobile chip copy is just "OR" (not "OR · ONE-TIME DELIVERY"). | NEW_FIELD |
| One-time delivery card frame `FmYa4`/`p2iJZu` — paper-2 + 1.5px dashed rule-2 | (none — `+ Use a new address` opens a dialog instead) | New molecule. | NEW_FIELD |
| Header icon tile (green-bg send icon `u1734`) | (none) | New visual marker. | VISUAL_ONLY |
| Title `g99Vt` "One-time delivery" sans 14/700 ink | (none) | New copy. | NEW_FIELD |
| Sub-line under title (text node `D2olN` desktop / `jsi2I` mobile) — copy per user-description "Use this for gift orders or a one-off shop — we won't add it to your saved addresses." | (none) | New copy. **Verbatim batch_get of the sub-line content not yet captured — see Q2.** | COPY_CHANGE |
| `WON'T BE SAVED` rotated amber stamp (desktop, in `YgUNx`/`PexKA` cluster) — per user-description amber, 1° rotation, mono 11/700 letter-spacing 0.08 with 1.5px solid colored stroke + tinted bg | Mobile `rEIe4` reads lowercase "won't be saved" mono 10/normal ink-3 — different style, not amber, not rotated, lowercase | Two stamp variants across breakpoints (uppercase amber rotated on desktop; lowercase ink-3 inline on mobile). **Inconsistency or intentional responsive split? See Q1.** | COPY_CHANGE |
| `Don't save` toggle switch (`PexKA` desktop with `en3tQ` "Don't save" mono + `T7NX5q` switch; mobile `yIr4u`) — default state ON (per `05-batch-plan.md` Batch 7) | (none) | New toggle. Default ON confirmed at plan level, but explicit confirmation per CLAUDE.md hard rule 1 — see Q3. | NEW_INTERACTION |
| `whi3d` Recipient name + 48h text input | None inline — exists in `AddressDialog` form as `recipientName` field | New on the one-time path. Validation rule TBD. | NEW_FIELD |
| `l4upfB` Phone number + `+92` chip + 10-digit input | None inline — exists in `AddressDialog` as `recipientPhone` | Same `+92` molecule as auth screens. New on the one-time path. | NEW_FIELD |
| `gnyZJ` Street, house / shop number + 48h input (full width) | None inline — exists in `AddressDialog` as `address` | New on the one-time path. Single field replaces the dialog's "address" + "city" + "title" decomposition. | NEW_FIELD |
| `QYGIC` City + 48h input | Exists in `AddressDialog` | Same as today. | NEW_FIELD |
| `G3t6ID` Postal code + 48h input (mono) | None — `addresses` table has no `postalCode` column today | New field + new column. **`buyer-settings` (Batch 5) is owner of `addresses.postalCode + province`** per `05-batch-plan.md` Cross-cutting deps table. Confirm migration is in flight before this batch lands — see Q5. | NEW_FIELD |
| `tX52F` Province dropdown | None — `addresses` has no `province` column today | Same Batch 5 ownership as Postal code. New select primitive at 44h. Province list undrawn — see Q4. | NEW_FIELD |
| ~~`b0luF` Landmark / nearest reference + 48h input + `yKyT5` "Optional" pill~~ | ~~None — no `landmark` column anywhere~~ | **DROPPED 2026-05-04** per Q6 amendment. Field removed from implementation; design still draws it but EN variants ship without the row. | DROPPED |
| Bottom hint card `hYNcq`/`bB4IO` ("Used only for this order. Toggle off the switch above if you'd like us to save this address to your account for next time.") | (none) | New copy — same hint molecule class as sign-in / OTP-info / shopkeeper-OTP-info. Note: the hint mentions "save to your account" but a guest has no account — see Q7. | NEW_FIELD |
| Selecting a saved-address radio while one-time card has typed values | (existing radio toggles selection only — inline form values are not cleared on radio click) | New mutual-exclusion. Three plausible behaviors — see Q8. | CHANGED_INTERACTION |
| Card auto-expand for guests (per OQ-G the guest path MUST come through this card) | (none) | New conditional behavior. See Q10. | NEW_INTERACTION |
| `+ Use a new address` button (existing) above the OR divider | Existing — opens `AddressDialog` | Co-existence question: with the one-time card present, does the existing button stay (for "save and reuse" path) or get retired (one-time card covers everything)? See Q9. | CHANGED_INTERACTION |
| Toggle OFF + submit → save the entered address to user's address book | (none — current `+ Use a new address` flow uses the dialog and saves before submit) | New "save during checkout" implicit behavior. Today the dialog calls `POST /api/addresses` separately; on the one-time card with toggle OFF, does the checkout call `POST /api/addresses` first then proceed, or does `/api/checkout` accept a `saveAddress: true` flag? See Q11. | NEW_INTERACTION |
| Address validation on the one-time path | `shippingAddressSchema` validates name/phone/address/city only (`packages/schemas/src/orders/checkout.ts:8-13`) | Schema must extend to include postal/province + recipientName separation (today the dialog distinguishes `recipientName` vs `title`, but `shippingAddressSchema` flat-named fields are `name` (=recipient), `phone`, `address`, `city`). Field-by-field validation rules undrawn — see Q12. (Landmark omitted per Q6 amendment.) | NEW_FIELD |
| Server-side persistence for guest orders (per OQ-G `orders.guestSessionId` + relax `requireSession()`) | `requireSession()` enforced at route handler entry (`apps/web/src/app/api/checkout/route.ts`); no `guestSessionId` column | Already-resolved at OQ-G. Cross-reference here for completeness; the schema migration is Batch 7-owned but the call sites span the checkout route. | NEW_FIELD |

---

## 3. Schema / type implications

### 3.1 `shippingAddressSchema` extension

Today (`packages/schemas/src/orders/checkout.ts:8-13`):
```ts
shippingAddressSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
});
```

The one-time card's data shape is broader. Three plausible extensions (see Q12):

(a) Extend `shippingAddressSchema` with `postalCode`, `province` (landmark dropped per Q6 amendment):
```ts
{ name, phone, address, city, postalCode: string, province: string }
```

(b) Two separate schemas: `shippingAddressSchema` (legacy 4 fields, used by saved-addresses snapshot) and `oneTimeShippingAddressSchema` (full 7 fields).

(c) Single `shippingAddressSchema` with the new fields all optional, allowing both legacy and new shapes through the same schema.

The choice affects `checkoutCartPayloadSchema` and `/api/checkout/route.ts`'s snapshot writes into the `orders` table.

### 3.2 `orders` snapshot fields

Today the `orders` table holds the address snapshot via `shippingName / shippingPhone / shippingAddress / shippingCity` (per `01-codebase-map.md §5`). New fields imply new columns:
- `orders.shippingPostalCode text` — required-or-nullable per Q5.
- `orders.shippingProvince text` — required-or-nullable per Q4.
- ~~`orders.shippingLandmark text nullable`~~ — **DROPPED 2026-05-04** per Q6.

These are owned by Batch 5 per the cross-cutting deps table for `addresses.postalCode + province`. The orders-snapshot extension is **a parallel migration this batch needs** unless the `orders` snapshot is changed to JSON or to FK lookup.

### 3.3 `addresses.postalCode + province` (Batch 5 owner)

Per `05-batch-plan.md` cross-cutting deps, Batch 5 (`buyer-settings`) owns the `addresses.postalCode + province` migration. **This Batch 7 augment depends on that migration to land first** for the toggle-OFF path to write postal/province to `addresses`. Sequencing risk: see Q13.

### 3.4 Guest path (per OQ-G)

- New `orders.guestSessionId text nullable` — already resolved at plan level. Schema migration owned by Batch 7.
- `checkoutCartPayloadSchema` gains `guestSessionId?: string`.
- `/api/checkout/route.ts` `requireSession()` becomes `requireSessionOrGuest()`.

The one-time card is the only address-entry path for guests because they have no saved addresses.

### 3.5 `landmark` persistence — **DROPPED 2026-05-04**

The original §3.5 carried the landmark column from this card into the `addresses` table on toggle-OFF saves. Per the 2026-05-04 amendment (Q6 below), landmark is omitted from Batch 7 entirely; no column work is required. Toggle-OFF saves write only `name / phone / address / city / postalCode / province`.

---

## 4. Behavior implications

### 4.1 Toggle ON (default) — ephemeral

- Form values populate the checkout payload's `shippingAddress` object.
- `addressId` is cleared (mutual exclusion — Q8).
- `/api/checkout` snapshots the address into `orders.shipping*` columns.
- Nothing writes to `addresses` table — the one-time card stays out of the user's address book.

### 4.2 Toggle OFF — persist on submit

- On submit, the address is `POST`ed to `/api/addresses` first; the returned `addressId` is then sent in the checkout payload.
- Or: a single `/api/checkout` call carries `saveAddress: true` and the route handler does both inserts in one transaction (atomicity).
- See Q11.

### 4.3 Mutual exclusion with saved-address radio

When a saved address is selected (`addressId` set):
- Either: the one-time card collapses / dims / hides.
- Or: the one-time card stays editable, but its values are ignored on submit.
- Or: typing in the one-time card de-selects the saved-address radio.

See Q8.

### 4.4 Guest auto-expansion

Per OQ-G, a guest reaching `/checkout` has no saved addresses (saved addresses are user-bound). The card should be:
- Auto-focused for the guest (since it's their only path).
- Possibly with the toggle hidden or pinned ON (no "save" option for guests since they have no account).

See Q10.

### 4.5 The existing `+ Use a new address` button

It still exists above the OR divider. Co-existence:
- (a) Keep both — `+ Use a new address` for "save AND use this address now"; one-time card for "use without saving". Distinct UX intents.
- (b) Drop the button — toggle OFF on the one-time card replaces it.

See Q9.

### 4.6 Validation timing

- Required fields per Q12. Validation triggers on submit (current pattern) or on blur (richer feedback).

---

## 5. Open questions for me

### Copy

1. **`WON'T BE SAVED` stamp variant differences.**
   - **Observed in design:** Desktop has a rotated amber `WON'T BE SAVED` stamp (per user-description). Mobile shows `rEIe4` lowercase "won't be saved" mono 10/normal ink-3, no rotation, no amber.
   - **Question:** Are the two variants intentional (desktop bold/amber stamp vs mobile subtle inline mono caption), or accidental drift?
   - **Plausible answers:** (a) Honor the responsive split: bold amber stamp desktop, inline subtle mono mobile. (b) Standardise to the bold amber stamp on both. (c) Standardise to the inline subtle treatment on both.
**Answer:** (a) Honor the responsive split. Desktop has space for the rotated amber stamp; mobile collapses to inline mono caption. Treat both as different rendering of the same conceptual "won't be saved" affordance, not a copy fork.

2. **Sub-line copy under "One-time delivery" title.**
   - **Observed in design:** Per user-description: "Use this for gift orders or a one-off shop — we won't add it to your saved addresses." The verbatim text node `D2olN` content not pulled in this analysis pass.
   - **Question:** Adopt the user-description copy verbatim, or re-pull from Pencil before binding?
   - **Plausible answers:** (a) Adopt user-description copy verbatim; spot-check via batch_get during implementation. (b) Pull verbatim text node `D2olN`/`jsi2I` content via `pencil:batch_get` and bind that. (c) Rewrite the copy for clarity ("Address used for this order only — not saved to your account.").
**Answer:** (b) Pull verbatim from Pencil text nodes `D2olN` (desktop) and `jsi2I` (mobile) via `pencil:batch_get` during implementation. Pencil is source of truth per CLAUDE.md.

3. **`Don't save` toggle default state.**
   - **Observed in design:** Per `05-batch-plan.md` Batch 7 description: "Don't save toggle on the right (green-2 ON state)" — implies ON by default.
   - **Observed in code:** None.
   - **Question:** Confirm default = ON (won't be saved) on initial render, both for logged-in users and guests?
   - **Plausible answers:** (a) Default ON for everyone. (b) Default ON for logged-in users; pinned ON (read-only) for guests. (c) Default OFF (so users save unless they opt out).
**Answer:** (b) Default ON for logged-in users; **pinned ON (read-only/hidden)** for guests. Per Q10, guests have no account so the toggle is meaningless to them; matches OQ-G's "address as source of truth" model.

### Form fields

4. **Province dropdown — list source + format.**
   - **Observed in design:** Dropdown field `LAvhS`/`HzM3C`, no list drawn.
   - **Observed in code:** `addresses.province` doesn't exist yet (Batch 5 owner).
   - **Question:** Hardcoded list of Pakistani provinces, fetched from a server-side enum, or free-text?
   - **Plausible answers:** (a) Hardcoded constants module: ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Gilgit-Baltistan", "Azad Kashmir", "Islamabad Capital Territory"]. (b) Free-text input (no dropdown). (c) Postgres enum `pakistan_province` with the same 7 values.
**Answer:** (a) Hardcoded constants module in `packages/constants/src/geo/pakistan-provinces.ts` with the 7-value list. Stored as `text` on `addresses.province` + `orders.shippingProvince` (no Postgres enum — easier to mutate later if a new territory is added).

5. **Postal code validation.**
   - **Observed in design:** 48h field, mono digits.
   - **Observed in code:** Column doesn't exist (Batch 5 owner).
   - **Question:** Strict 5-digit Pakistan postcode, optional, or free-text?
   - **Plausible answers:** (a) Strictly `^\d{5}$` (Pakistan's standard). (b) Optional `^\d{5}$` if provided. (c) Free-text up to 10 chars.
**Answer:** (a) Strictly `^\d{5}$`. Pakistan's postal code is uniformly 5 digits; client-side regex + zod validator. Required field on the one-time card form.

6. **Landmark column ownership and persistence.**
   - **Observed in design:** Optional landmark field on the one-time card.
   - **Observed in code:** No `landmark` column anywhere.
   - **Question:** Where does landmark live when toggle OFF saves the address?
   - **Plausible answers:** (a) New `addresses.landmark text nullable` (parallel to postalCode/province) — Batch 7 owns it. (b) Add to Batch 5's `addresses` migration (move ownership to `buyer-settings`). (c) Don't persist landmark to `addresses` — only snapshot it on `orders.shippingLandmark`. The user can re-enter on next checkout. (d) **Drop the landmark field from Batch 7 entirely; revisit later.**
**Answer (revised 2026-05-04):** (d) **Drop landmark from Batch 7.** The form row is removed from both EN variants; no `addresses.landmark`, no `orders.shippingLandmark`, no zod schema entry. The Pencil design still draws the row — it is intentionally not implemented this batch and will be revisited when its column ownership is decided. Supersedes the original answer (b). Rationale: landmark column was the sole blocker forcing a Batch 5 amendment + migration 0013; dropping it lets Batch 7 proceed against migration 0012 alone.

7. **Hint card copy mentioning "save to your account" while a guest has no account.**
   - **Observed in design:** Hint card copy "Toggle off the switch above if you'd like us to save this address to your account for next time."
   - **Observed in code:** None.
   - **Question:** Hide the hint card for guests, swap copy to a guest-specific variant, or keep the same copy regardless?
   - **Plausible answers:** (a) Hide the hint entirely for guests. (b) Swap to "Sign in next time to save addresses for one-tap reuse." (c) Keep the same copy — accept the irrelevance for guests (cheapest).
**Answer:** (b) Swap to a guest-specific variant: "Sign in next time to save addresses for one-tap reuse." Couples the hint with a `<Link href="/auth?redirect=/checkout">` on the "Sign in" word so guests can convert without losing form state (form state lives in cart-store + sessionStorage).

### Behavior

8. **Mutual exclusion between saved-address radio and one-time card.**
   - **Observed in design:** Both visible; design doesn't show a state where they interact.
   - **Observed in code:** None.
   - **Question:** What happens when (i) a saved address is selected and (ii) the user types into the one-time card?
   - **Plausible answers:** (a) Typing into the one-time card de-selects the saved-address radio. (b) Selecting a saved-address radio clears the one-time card form. (c) Both stay populated; submit prefers `addressId` (saved) over inline `shippingAddress` (one-time).
**Answer:** (a) Typing into the one-time card de-selects the saved-address radio. The most recent intent wins; preserves the one-time card's typed values if the user is mid-edit and accidentally clicks a radio (radio click clears the form, per (b), would lose data).

9. **Co-existence with the existing `+ Use a new address` button.**
   - **Observed in design:** Both the button (above OR divider) and the one-time card (below OR divider) coexist.
   - **Observed in code:** `+ Use a new address` opens `AddressDialog` (today the only "add" path).
   - **Question:** Both retained, button retired, or button repurposed?
   - **Plausible answers:** (a) Both retained — distinct intents (`+ Use a new address` = save and use; one-time card = use without saving). (b) Button retired; toggle-OFF on the one-time card replaces it. (c) Both retained but the button now also calls into the one-time-card path (unifies the dialog into the inline card).
**Answer:** (a) Both retained. The dialog is for the "I want to add this address to my account permanently" intent; the one-time card is for "use this just once". The toggle on the one-time card lets the user opt INTO save-mid-checkout without leaving the page — a third path with distinct UX.

10. **Card behavior for guests (per OQ-G).**
    - **Observed in design:** No guest-specific frame.
    - **Observed in code:** Guest path doesn't exist yet.
    - **Question:** For a guest reaching `/checkout`, what does the address section look like?
    - **Plausible answers:** (a) Saved-address list section is hidden entirely; only the one-time card shows, auto-focused, with toggle hidden (always ephemeral). (b) Saved-address section shows an empty state ("Sign in to use saved addresses") + the one-time card with toggle hidden. (c) Same UI as logged-in users; the saved-address section is empty (no addresses to show), the toggle is visible but pinned ON read-only.
**Answer:** (a) For guests: hide the saved-addresses list and the OR divider entirely; show only the one-time-delivery card, auto-focused on the recipient-name field, with the `Don't save` toggle and the `+ Use a new address` button hidden (guests have no addresses to save into). The hint card swaps to the guest-specific copy from Q7.

11. **Toggle-OFF persistence semantics.**
    - **Observed in design:** None drawn.
    - **Observed in code:** None.
    - **Question:** On submit with toggle OFF, is the address saved before order placement (separate `POST /api/addresses` then `POST /api/checkout`), atomically inside `/api/checkout` (single tx, address insert + order insert), or after order success?
    - **Plausible answers:** (a) Two-step: `POST /api/addresses` (await), then `POST /api/checkout` with the new `addressId`. (b) Single `/api/checkout` call with `saveAddress: true`; route handler does both writes in one tx. (c) Save after order success (post-checkout webhook style).
**Answer:** (b) Single `/api/checkout` call with a `saveAddress: true` flag in the payload; route handler runs both writes in one transaction. Atomic — if order insert fails, the address insert rolls back. `checkoutCartPayloadSchema` gains `saveAddress?: boolean` (default `false`).

### Schema

12. **`shippingAddressSchema` extension shape.**
    - **Observed in design:** 7 fields drawn — recipient name, phone, street (single full-width input), city, postal, province, landmark optional.
    - **Observed in code:** `shippingAddressSchema` has 4 (name, phone, address, city); the dialog has its own form via `AddressDialog`.
    - **Question:** Extend the existing schema, fork to a separate `oneTimeShippingAddressSchema`, or make all new fields optional on the existing one?
    - **Plausible answers:** (a) Extend in place; `postalCode + province` required (consistent with Batch 5 columns being nullable for legacy data but new-write required); `landmark` optional/nullable. (b) Fork to `oneTimeShippingAddressSchema` (clearer per-path validation). (c) Make new fields optional on the existing schema (loosest — no breakage of existing snapshot consumers).
**Answer:** (a) Extend `shippingAddressSchema` in place. Add `postalCode: string.regex(/^\d{5}$/)`, `province: pakistanProvinceEnum`. (Landmark omitted per Q6 amendment 2026-05-04.) The legacy 4-field shape (used by saved-address snapshots before Batch 5) becomes incompatible — but Batch 5 ships the columns first, so by the time this batch lands, all saved addresses have nullable postal/province. Existing snapshot writers in `/api/checkout/route.ts` get updated in the same PR.

13. **Sequencing dependency on Batch 5 `addresses.postalCode + province` migration.**
    - **Observed in design:** N/A.
    - **Observed in code:** Per `05-batch-plan.md` Cross-cutting deps, Batch 5 (`buyer-settings`) owns `addresses.postalCode + province`.
    - **Question:** Has Batch 5 shipped that migration? If not, what's the safe sequencing for this Batch 7 augment?
    - **Plausible answers:** (a) Confirm Batch 5 migration is in dev/staging before Batch 7 lands; postpone this card until Batch 5 confirms. (b) Skip postal/province on the one-time card for now (drop them from the design); add later when columns exist. (c) Land the columns under Batch 7 and update Batch 5 plan to consume them (re-own).
**Answer:** (a) Confirm Batch 5 migration (`addresses.postalCode + province`) is applied to dev/staging before Batch 7 implementation begins. Batch 5 is a hard predecessor; if it slips, this augment slips with it. The runner should fail-stop at Step A if `addresses.postalCode` doesn't exist in the schema. (Landmark predecessor dropped per Q6 amendment.)

14. **`orders.shipping*` snapshot extension.**
    - **Observed in design:** N/A.
    - **Observed in code:** `orders` table has `shippingName / shippingPhone / shippingAddress / shippingCity` (per `01-codebase-map.md §5`).
    - **Question:** Add `shippingPostalCode + shippingProvince + shippingLandmark` columns, or refactor the snapshot into a `jsonb` blob?
    - **Plausible answers:** (a) Three new flat columns on `orders` (additive, simplest). (b) Refactor the snapshot into a single `jsonb` column `shippingAddressSnapshot` (cleaner long-term but invasive). (c) Move the snapshot into a separate `order_addresses` table.
**Answer (revised 2026-05-04):** (a) Two new flat nullable columns on `orders`: `shippingPostalCode text`, `shippingProvince text`. (`shippingLandmark` dropped per Q6 amendment.) Additive, matches the existing `shippingName / shippingPhone / shippingAddress / shippingCity` flat-column pattern. No refactor.

15. **Server-side handling of `shippingAddress` payload that includes new fields.**
    - **Observed in design:** N/A.
    - **Observed in code:** `apps/web/src/app/api/checkout/route.ts` reads `payloadShippingAddress` (4-field shape) when no `addressId` is provided.
    - **Question:** With the schema extended (Q12), the route handler must accept the new fields and persist to the new snapshot columns (Q14). Confirm both extensions land in the same PR to avoid a partial state.
    - **Plausible answers:** (a) Single PR for schema + route handler + UI. (b) Two PRs: schema/migration first, then route + UI. (c) Schema + route in PR 1; UI in PR 2 (route accepts but ignores new fields until UI ships — risky).
**Answer:** (a) Single PR for schema migration + zod schema extension + route handler + UI. The Batch-7 augment is small enough to land atomically; no partial states allowed. Migration is forward-only (additive nullable cols) so rollback is just a code revert.

---

**File written to:** `D:\Moeed 8th Sem\Fyp\Code\shalmi-web\.claude-revamp\screens\buyer-checkout\gap-analysis-one-time-addr.md`

**Cross-reference:** the original `screens/buyer-checkout/gap-analysis.md` (2026-05-02) covers everything else (step indicator, rider notes, payment selector, order summary, place-order CTA, mobile sticky bar). That file's resolutions remain binding; **this file augments it for the one-time-addr card only.**

(End of Buyer · Checkout one-time-addr follow-up gap analysis. Stopping per `BATCH_RUNNER.md` Step A.)
