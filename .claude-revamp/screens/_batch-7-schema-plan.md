# Batch 7 — Schema Migration Plan

> **Phase:** Pre-implementation schema confirmation.
> **Date produced:** 2026-05-04.
> **Owner:** Batch 7 (`buyer-signin`, `buyer-otp`, `buyer-signup-generic`, `buyer-signup-shopkeeper`, `buyer-checkout` one-time-addr augment).
> **Inputs:** `05-batch-plan.md` Batch 7 OQ resolutions (OQ-R/S/G); per-screen gap-analysis answers in `screens/buyer-*/gap-analysis.md`.
> **Output rule:** every column listed below has an owning batch and a confirmed nullability + type. Sequencing failures (Batch 5 not yet applied) are flagged.

---

## 0. Summary

| Migration | Owner batch | Tables touched | Reversible | Sequencing risk |
|---|---|---|---|---|
| `user.retailerType` (enum-as-text, nullable) | **Batch 7** | `user` | Yes (drop column) | None — additive |
| `user.shopName` text nullable | **Batch 7** | `user` | Yes | None |
| `user.shopAddress` text nullable | **Batch 7** | `user` | Yes | None |
| `orders.guestSessionId` text nullable | **Batch 7** | `orders` | Yes | None |
| `orders.shippingPostalCode` text nullable | **Batch 7** | `orders` | Yes | None |
| `orders.shippingProvince` text nullable | **Batch 7** | `orders` | Yes | None |
| `orders.shippingLandmark` text nullable | **Batch 7** | `orders` | Yes | None |
| `addresses.postalCode` text nullable | **Batch 5** (predecessor) | `addresses` | Yes | **Hard predecessor** — Batch 7 fail-stops if missing |
| `addresses.province` text nullable | **Batch 5** (predecessor) | `addresses` | Yes | Hard predecessor |
| `addresses.landmark` text nullable | **Batch 5** (re-owned per one-time-addr Q6) | `addresses` | Yes | Hard predecessor — Batch 5 plan must be amended |

All migrations are forward-only and additive (nullable). Rollback = code revert; no data destruction risk.

---

## 1. `user` table additions (Batch 7-owned)

### 1.1 `user.retailerType` (per OQ-R)

```sql
ALTER TABLE "user"
  ADD COLUMN "retailer_type" text;

-- Application-level constraint via zod / drizzle:
-- retailerType IN ('generic', 'shopkeeper') OR NULL
```

- **Why text not enum:** easier to extend later (e.g., `wholesaler`, `franchise`) without a Postgres enum migration. Application-level constraint via `zod.enum(['generic', 'shopkeeper']).nullable()`.
- **Backfill:** none. Existing rows get `NULL` until they self-identify. Sign-in flow does NOT populate this column; only the two signup flows do.
- **Better-auth config:** add to `additionalFields` in `modules/auth/server/auth-client/index.ts` so the column is persisted via the user-create path:
  ```ts
  retailerType: { type: 'string', required: false, input: false }
  ```

### 1.2 `user.shopName` text nullable (per OQ-S)

```sql
ALTER TABLE "user"
  ADD COLUMN "shop_name" text;
```

- Populated by the shopkeeper signup form (min 2 / max 80 client-side).
- Distinct from `user.businessName` (Batch 5) per shopkeeper-signup Q12: `shopName` = retail signage entered at signup; `businessName` = legal/registered entity entered later in profile.

### 1.3 `user.shopAddress` text nullable (per OQ-S)

```sql
ALTER TABLE "user"
  ADD COLUMN "shop_address" text;
```

- Populated by the shopkeeper signup form (min 10 / max 300 client-side).
- Bricks-and-mortar shop address; NOT a delivery address. Delivery addresses live in the `addresses` table.

### 1.4 Drizzle schema patch

```ts
// packages/database/src/schema/auth.ts
export const user = pgTable('user', {
  // ... existing columns ...
  retailerType: text('retailer_type'),
  shopName: text('shop_name'),
  shopAddress: text('shop_address'),
  // businessName is added by Batch 5 migration 0012 (already noted in code comment)
});
```

---

## 2. `orders` table additions (Batch 7-owned)

### 2.1 `orders.guestSessionId` (per OQ-G)

```sql
ALTER TABLE "orders"
  ADD COLUMN "guest_session_id" text;
```

- Populated only when the order is placed without a `userId`. Mutually informational with `userId` — at least one must be non-null per `requireSessionOrGuest()` check.
- Server-side application constraint (zod refine on `checkoutCartPayloadSchema`):
  - `(session?.userId IS NOT NULL) OR (guestSessionId IS NOT NULL)`.

### 2.2 Snapshot extensions for the one-time-addr card (per one-time-addr Q14)

```sql
ALTER TABLE "orders"
  ADD COLUMN "shipping_postal_code" text,
  ADD COLUMN "shipping_province" text,
  ADD COLUMN "shipping_landmark" text;
```

- All nullable — legacy orders predate the new fields.
- Snapshot semantics: written once at order creation, never updated.
- Pencil province values constrained to the 7-element `pakistanProvinceEnum` (`packages/constants/src/geo/pakistan-provinces.ts`), but stored as `text` for flexibility.

### 2.3 `/api/checkout/route.ts` handler changes

- Replace `requireSession()` with `requireSessionOrGuest()` that returns `{ userId } | { guestSessionId }`.
- Read new payload fields from `checkoutCartPayloadSchema` (extended in §4).
- Snapshot `shippingPostalCode + shippingProvince + shippingLandmark` from either:
  - The selected saved-address row (if `addressId` was provided), or
  - The inline `shippingAddress` payload object (if the one-time-addr card was used).
- If `payload.saveAddress === true` AND the user is not a guest, run the address insert + the order insert in a single transaction.

---

## 3. Batch 5 hard predecessors (sequencing)

Batch 7 cannot ship the one-time-addr card until Batch 5's `addresses` migrations are applied to dev/staging. **The runner MUST fail-stop at Step A if any of the three columns below are missing from the `addresses` schema.**

### 3.1 `addresses.postalCode` text nullable (Batch 5 owner — already in plan)

- Per `05-batch-plan.md` cross-cutting deps table: "Batch 5 (`buyer-settings`)".
- Required at write time on the `/profile/settings/addresses` create form and on the one-time-addr toggle-OFF save path.

### 3.2 `addresses.province` text nullable (Batch 5 owner — already in plan)

- Same as 3.1.

### 3.3 `addresses.landmark` text nullable (Batch 5 owner — **plan amendment per one-time-addr Q6**)

- The original `05-batch-plan.md` Batch 5 description listed only `postalCode + province`. **Add `landmark` to that migration** so the one-time-addr card has a full target schema and Batch 5's settings/addresses page can render the field.
- One-line addition to the Batch 5 migration; no impact on Batch 5's existing scope.

### 3.4 Sequencing check (runner Step A)

Before any Batch 7 implementation begins, the runner must:

1. Read `packages/database/src/schema/addresses.ts` (or equivalent) and confirm `postalCode`, `province`, `landmark` columns exist.
2. If missing → STOP, post a STATUS note "Batch 5 not yet applied", do not improvise.

---

## 4. Cross-app schema (zod) extensions

### 4.1 `packages/schemas/src/auth/signup.ts` (NEW file, Batch 7)

```ts
import { z } from 'zod';

export const phoneE164Pakistan = z
  .string()
  .regex(/^\+923\d{9}$/, 'Phone must be a Pakistan mobile (+92 3XX XXXXXXX)');

const baseSignup = z.object({
  name: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[\p{L}\s.'-]+$/u),
  phone: phoneE164Pakistan,
});

export const signupSchema = z.discriminatedUnion('retailerType', [
  baseSignup.extend({ retailerType: z.literal('generic') }),
  baseSignup.extend({
    retailerType: z.literal('shopkeeper'),
    shopName: z.string().min(2).max(80),
    shopAddress: z.string().min(10).max(300),
  }),
]);

export type SignupPayload = z.infer<typeof signupSchema>;
```

### 4.2 `packages/schemas/src/orders/checkout.ts` (EXTEND existing)

```ts
// Existing — extend in place (per one-time-addr Q12):
export const shippingAddressSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().regex(/^\d{5}$/),                    // NEW
  province: z.enum([                                          // NEW
    'Punjab',
    'Sindh',
    'Khyber Pakhtunkhwa',
    'Balochistan',
    'Gilgit-Baltistan',
    'Azad Kashmir',
    'Islamabad Capital Territory',
  ]),
  landmark: z.string().max(200).nullable().optional(),        // NEW
});

export const checkoutCartPayloadSchema = z
  .object({
    items: z.array(lineItemSchema).min(1),
    addressId: z.string().uuid().optional(),
    shippingAddress: shippingAddressSchema.optional(),
    riderNotes: z.string().max(RIDER_NOTES_MAX_LENGTH).optional().nullable(),
    saveAddress: z.boolean().optional(),                       // NEW (one-time-addr Q11)
    guestSessionId: z.string().optional(),                     // NEW (OQ-G)
  })
  .refine(
    (data) => data.addressId != null || data.shippingAddress != null,
    { message: 'Provide addressId or shippingAddress' }
  );
```

---

## 5. Migration file ordering

Within Batch 7, run migrations in this order (each is a separate Drizzle migration file):

1. `00XX_user_retailer_type.sql` — adds `user.retailer_type`.
2. `00XX_user_shop_columns.sql` — adds `user.shop_name`, `user.shop_address`.
3. `00XX_orders_guest_session.sql` — adds `orders.guest_session_id`.
4. `00XX_orders_shipping_extras.sql` — adds `orders.shipping_postal_code`, `orders.shipping_province`, `orders.shipping_landmark`.

Files 1–4 are independent and could be merged into a single migration; keeping them separate makes diff-review easier.

**Batch 5 amendment (separate PR, lands first):**

5. `0012_addresses_landmark.sql` (or merge into Batch 5's existing `addresses` migration) — adds `addresses.landmark`. Confirms `addresses.postal_code` and `addresses.province` from the same Batch 5 migration are present.

---

## 6. Rollback plan

Every Batch 7 migration is additive and nullable. Rollback = code revert. The following destructive operations are **NOT** part of any Batch 7 migration:

- No DROP COLUMN on existing columns.
- No NOT NULL added to existing columns.
- No data backfill (every new column starts NULL).
- No constraint changes on existing rows.

If Batch 7 is reverted post-merge:
- `user.retailerType / shopName / shopAddress` orphan rows can be ignored or scrubbed in a future cleanup.
- `orders.guestSessionId / shippingPostalCode / shippingProvince / shippingLandmark` orphan values likewise.

---

## 7. Open questions (resolved at plan level — flag for runner)

None. All seven Batch 7 OQs (OQ-R/S/I/G/V/O/A) are resolved. Per-screen gap-analysis questions are answered in the respective `screens/<slug>/gap-analysis.md` files.

The only remaining unknown is **whether Batch 5 has applied `addresses.postalCode + province + landmark` by the time the runner picks up Batch 7**. That is a sequencing check, not an open question.

---

**File written to:** `D:\Moeed 8th Sem\Fyp\Code\shalmi-web\.claude-revamp\screens\_batch-7-schema-plan.md`

(End of Batch 7 schema migration plan. The runner consumes this alongside the per-screen gap-analyses at Step A.)
