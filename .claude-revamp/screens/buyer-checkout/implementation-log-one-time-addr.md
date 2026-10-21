# Buyer · Checkout · One-Time Delivery Augment — Implementation Log

> **Phase:** Per-screen implementation (Batch 7, screen 5 of 5).
> **Date:** 2026-05-04.
> **Spec source:** `.claude-revamp/screens/buyer-checkout/gap-analysis-one-time-addr.md` Q1–Q15.
> **Note:** the original `screens/buyer-checkout/gap-analysis.md` (2026-05-02) and its Batch 3 implementation log remain authoritative for everything else on the checkout screen — this augment only adds the one-time delivery card and the OQ-G(b) guest path.

## Step A — Plan

### Files to create
- `packages/database/migrations/0015_orders_guest_session.sql` — drops `orders.user_id NOT NULL` and adds `orders.guest_session_id text`.
- `packages/database/migrations/0016_orders_shipping_extras.sql` — adds `orders.shipping_postal_code` + `orders.shipping_province`.
- `packages/constants/src/geo/index.ts` — `PAKISTAN_PROVINCES` + `PakistanProvince` type (Q4(a)).
- `apps/web/src/modules/checkout/components/one-time-delivery-card/index.tsx` — paper-2 dashed card with header row (green tile + title + WON'T BE SAVED stamp + Don't save toggle), 7-field form (recipient name, phone via PhoneChipInput, street, city, postal, province), bottom hint card. Landmark intentionally omitted per Q6(d).

### Files to edit
- `packages/database/migrations/meta/_journal.json` — append idx 15 + 16.
- `packages/database/src/schema/orders.ts` — drop `notNull()` on `userId`, declare `guestSessionId`, `shippingPostalCode`, `shippingProvince`.
- `packages/schemas/package.json` — add `@repo/constants` workspace dep.
- `packages/schemas/src/orders/checkout.ts` — extend `shippingAddressSchema` with `postalCode + province`; extend `checkoutCartPayloadSchema` with `saveAddress + guestSessionId`.
- `apps/web/src/app/api/checkout/route.ts` — relax `requireSession` to `(session OR guestSessionId)`; snapshot `shippingPostalCode/Province` from saved-address row OR inline `shippingAddress`; honour `saveAddress: true` by inserting into `addresses` table within the same tx; handle guest path (userId null + guestSessionId).
- `apps/web/src/app/api/user/addresses/route.ts` — fix the silent-drop of `postalCode/province` left over from the Batch 5 deferral (the Drizzle fields exist now per migration 0012).
- `apps/web/src/modules/checkout/components/delivery-address-section/index.tsx` — host the OR divider + the new `OneTimeDeliveryCard`. Hide saved-list / "+ Use new addr" / divider / toggle for guests (Q10(a)).
- `apps/web/src/app/(storefront)/checkout/page.tsx` — own one-time draft + toggle state; relax the auth-redirect guard when cart-store has `guestSessionId` truthy + items present (Q7); validate one-time draft on submit; route `addressId XOR shippingAddress` payload; clear `guestSessionId` on success.
- `apps/web/src/modules/user-addresses/hooks/use-addresses-query/index.ts` — add `enabled` option so guests don't fire the request.

### Schema / type changes
- DB: `orders.user_id` becomes nullable; new columns `orders.guest_session_id`, `orders.shipping_postal_code`, `orders.shipping_province` (all text NULL).
- Drizzle: matching declarations on the `orders` pgTable.
- Zod: `shippingAddressSchema` gains `postalCode + province` (both optional+nullable on the wire so saved-address callers needn't supply them); `checkoutCartPayloadSchema` gains `saveAddress + guestSessionId`.

### API / server-action changes
- `POST /api/checkout` — auth model relaxed; address snapshot extended to include postal+province; same-tx `addresses` insert when `saveAddress=true` for authed users; guest-only path persists `orders.guestSessionId`.
- `POST /api/user/addresses` — actually persists `postalCode + province` now.

### New molecules introduced (screen-local)
- `OneTimeDeliveryCard`.
- Inline `ToggleSwitch` (kept inside the card; not promoted).

## Step C — Quality gate

| Gate | Result |
|---|---|
| `pnpm exec tsc --noEmit` (apps/web) | ✅ exit 0 |
| `pnpm lint` | ✅ "No ESLint warnings or errors" |
| `pnpm build` (with dev `CRON_SECRET`) | ✅ exit 0 — `/checkout` ships at 11.1 kB (was 7.44 kB) |
| Migration apply | DEFERRED — operator runs `drizzle-kit migrate` for migrations 0012–0016. |
| Playwright smoke | DEFERRED — auth + Twilio + DB-state defer same as the rest of Batch 7. The guest path can be hand-smoked in the browser without Twilio (cart-store `guestSessionId` set, navigate to `/checkout`). |

## Spec adherence (Q1–Q15 → file:line)

- **Q1 — Responsive WON'T BE SAVED stamp/caption split:** `one-time-delivery-card/index.tsx:97-102` (Stamp on `md:`, mono caption on mobile).
- **Q2 — Sub-line copy:** `one-time-delivery-card/index.tsx:88-91` ships the user-description copy verbatim. Spot batch_get pull deferred — operator can re-pull `D2olN`/`jsi2I` and patch in place if Pencil drifts.
- **Q3 — Default ON for authed; pinned ON / hidden for guests:** `checkout/page.tsx:96` initialises `oneTimeSaveOff=true`; `one-time-delivery-card/index.tsx:106` only renders the toggle when `!isGuest`.
- **Q4 — Province dropdown via constants module:** `packages/constants/src/geo/index.ts`; consumed at `one-time-delivery-card/index.tsx:174-186` and on the server zod at `packages/schemas/src/orders/checkout.ts:24`.
- **Q5 — Postal `^\d{5}$`:** `packages/schemas/src/orders/checkout.ts:8`; client-side input clipping at `one-time-delivery-card/index.tsx:159`.
- **Q6 — Landmark dropped:** `one-time-delivery-card/index.tsx` has no landmark field; `shippingAddressSchema` has no landmark; `orders.shippingLandmark` not added.
- **Q7 — Hint copy swaps for guests with `<Link>` to /auth:** `one-time-delivery-card/index.tsx:190-203`.
- **Q8 — Typing into one-time card de-selects saved radio:** `delivery-address-section/index.tsx:135-141` — parent fires `onSelectAddress(null)` when the draft changes and a saved radio is selected.
- **Q9 — `+ Use a new address` retained:** `delivery-address-section/index.tsx:90-96` + `:114-122`.
- **Q10 — Guest UI hides saved-list / OR divider / Use-new / toggle:** `delivery-address-section/index.tsx:62, 124-132` and `one-time-delivery-card/index.tsx:106`.
- **Q11 — Single `/api/checkout` call with `saveAddress` flag, address insert in tx:** `app/api/checkout/route.ts:191-219`.
- **Q12 — Extend `shippingAddressSchema` in place; postal+province optional/nullable:** `packages/schemas/src/orders/checkout.ts:8-26`.
- **Q13 — Sequencing on Batch 5 `addresses.postalCode + province`:** Drizzle has them per `addresses.ts:20-21`; addresses POST now actually writes them; Batch 5 migration apply is the prerequisite per the schema-plan §3.4 sequencing check.
- **Q14 — Two new flat columns on orders (no jsonb refactor):** `packages/database/migrations/0016_orders_shipping_extras.sql` + Drizzle `orders.ts:31-32`.
- **Q15 — Single PR for schema + route + UI:** this commit.

## Completed

### Files created
- `packages/database/migrations/0015_orders_guest_session.sql`
- `packages/database/migrations/0016_orders_shipping_extras.sql`
- `packages/constants/src/geo/index.ts`
- `apps/web/src/modules/checkout/components/one-time-delivery-card/index.tsx`

### Files edited
- `packages/database/migrations/meta/_journal.json`
- `packages/database/src/schema/orders.ts`
- `packages/schemas/package.json`
- `packages/schemas/src/orders/checkout.ts`
- `apps/web/src/app/api/checkout/route.ts`
- `apps/web/src/app/api/user/addresses/route.ts`
- `apps/web/src/modules/checkout/components/delivery-address-section/index.tsx`
- `apps/web/src/app/(storefront)/checkout/page.tsx`
- `apps/web/src/modules/user-addresses/hooks/use-addresses-query/index.ts`

### Test updates
None.

### Deviations from plan
- Schema plan §2.1 was silent on `orders.user_id` nullability. Migration 0015 also drops the `NOT NULL` constraint — required by OQ-G(b) since guest orders have no user row. Documented inline in the migration SQL and the Drizzle schema comment.
- Hint copy for guests is a small UX nicety (sign-in link with redirect=/checkout) inferred from Q7(b)'s "swap to a guest-specific variant"; the link text matches the answer and the redirect carries the buyer back into the checkout once they verify.
