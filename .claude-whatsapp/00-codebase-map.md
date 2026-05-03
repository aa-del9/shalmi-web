# Codebase Map — shalmi-web (read-only audit for WhatsApp build)

Audit date: 2026-05-03 · Branch: `Design-Revamp`.

This map is the prerequisite reference for the upcoming WhatsApp + MCP
build. Everything below was confirmed by reading source. Anything that
could not be confirmed is in §8 _Open questions_.

---

## 1. Stack

| Layer             | Detected value                                                                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Package manager   | **pnpm 9** (`packageManager: pnpm@9.0.0`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`). `engine-strict=true`, `node-linker=hoisted`.                               |
| Monorepo runner   | **Turborepo 2.7.3** (`turbo.json` at root, per-package `turbo.json` overrides allowed).                                                                        |
| Workspaces        | `apps/*` and `packages/**` (recursive in packages).                                                                                                            |
| Node              | **>=22.0.0 <25.0.0** at root `engines`; `.nvmrc` pins `v22.14.0`.                                                                                              |
| TypeScript        | **5.9.2** at root devDep; per-package mostly `^5.8.0`/`^5.9.3`. Shared base in `packages/typescript-config`.                                                   |
| Lint              | ESLint 9.39.1 flat config; shared in `packages/eslint-config`. Prettier 3.7.4 + tailwind plugin.                                                               |
| Frontend          | Next.js 15 (App Router, Turbopack dev), React 19, TanStack Query 5, Zustand, Tailwind v4, shadcn-style UI in `packages/ui`.                                    |
| Auth              | **Better-Auth 1.2+** with Drizzle adapter and the `phoneNumber` plugin (OTP via Twilio).                                                                       |
| ORM               | **Drizzle ORM 0.45.1** + `drizzle-kit 0.31.8` over `postgres-js` 3.4.8.                                                                                        |
| Database host     | Supabase Postgres (connection string is **hardcoded in `packages/database/src/client.ts`** — flagged in open questions).                                       |
| Hosting           | Vercel (turbo `vercel:*` tasks per env).                                                                                                                       |
| Notable globalEnv | `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID`, `TWILIO_PHONE_NUMBER`. |

There is **no test framework wired in** at the time of audit (no
Jest/Vitest/Playwright deps in any `package.json`, no `test` script
anywhere). New code will need to bring its own test toolchain.

---

## 2. Workspace layout

### `apps/`

| Path       | Purpose                                                                                                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web` | The single Next.js 15 app. Hosts buyer storefront, vendor portal (`/vendor`), admin panel (`/admin`), all REST routes under `/api/...`, Better-Auth handler, middleware. Dev port 5181. |

There is **no `apps/whatsapp-worker`** today. The CLAUDE.md WhatsApp
rules describe one as a future addition.

### `packages/`

| Path                         | Purpose                                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/database`          | Drizzle schema, client, migrations, seeds. Exports `db`, all tables, and `authSchema`.                                                                                                      |
| `packages/schemas`           | Cross-package Zod schemas. Today: `catalog/product`, `catalog/product-pack-tiers`, `cart/line-item`, `orders/checkout`, plus `metadata`, `page-based-pagination`, `service-error-response`. |
| `packages/types`             | Shared TS types (no business logic).                                                                                                                                                        |
| `packages/utils`             | Shared utility helpers.                                                                                                                                                                     |
| `packages/constants`         | Shared constants (e.g. `@repo/constants/postgres` exports `POSTGRES_UNIQUE_VIOLATION`).                                                                                                     |
| `packages/hooks`             | Shared React hooks.                                                                                                                                                                         |
| `packages/contexts`          | Shared React contexts.                                                                                                                                                                      |
| `packages/ui`                | Component library (shadcn-style + Tailwind v4).                                                                                                                                             |
| `packages/storage`           | Supabase storage helpers (image upload, etc).                                                                                                                                               |
| `packages/eslint-config`     | Shared ESLint flat config.                                                                                                                                                                  |
| `packages/typescript-config` | Shared `tsconfig` bases.                                                                                                                                                                    |

There is **no `packages/services`** today. There is **no
`packages/mcp-server`** today. There is **no `packages/whatsapp-core`**
today. Per the CLAUDE.md rule, those still need to be created and
business logic needs to be lifted out of `apps/web`.

---

## 3. Database

### Owner

`packages/database`. Drizzle schema files live under
`packages/database/src/schema/*.ts` and are aggregated by
`src/schema/index.ts`. Migrations are SQL files under
`packages/database/migrations/` (current: `0000_…` through `0012_buyer_settings.sql`). There is also a (likely stale) `drizzle/` folder with `0000_purple_sunspot.sql` from an earlier generator run.

The Drizzle client is `packages/database/src/client.ts`, exported as
`db` from `@repo/database`. **Connection string is hardcoded** there
(Supabase pooler URL with embedded password) — see open questions.

### Vendor-relevant tables

All amounts are **integer cents** unless noted. PKs are `text` UUIDs
generated via `crypto.randomUUID()` unless noted.

#### `user` — Better-Auth core (`schema/auth.ts`)

- `id` text PK
- `name` text NOT NULL
- `email` text (nullable in current Drizzle defn; the very first
  migration declared it NOT NULL UNIQUE — open question)
- `email_verified` boolean default false
- `image` text
- **`phone_number` text UNIQUE** (nullable)
- `phone_number_verified` boolean default false
- `role` text default `'retailer'` — values are from
  `USER_ROLES` constant: `retailer | vendor | admin` (vendor used as
  the gate for `/vendor/*`).
- `created_at`, `updated_at`
- A `business_name` column is mentioned as added by migration 0012 but
  the Drizzle definition has it deferred — see open questions.

`session`, `account`, `verification` follow standard Better-Auth shape
(see `schema/auth.ts`).

##### `users.phone` confirmation

Yes — `user.phone_number` exists, is `UNIQUE`, and is the canonical
phone field. **E.164 format is NOT enforced at the schema level.**
The `createVendorSchema` only constrains length to ≤13 chars (no
regex). Better-Auth's `phoneNumber` plugin manages OTP/sign-in around
this column. Whether existing rows are normalized to E.164 needs
confirmation — open question.

#### `vendors` (`schema/vendors.ts`)

- `id` text PK · `user_id` text → `user.id` ON DELETE CASCADE
- `display_id` text UNIQUE (e.g. `VND-0001`, generated by
  `generateNextDisplayId()` in admin POST route)
- `full_name` text · `shop_name` text NOT NULL
- `city` text NOT NULL default `''` (admin form currently hardcodes
  `'Lahore'`)
- `address` text · `hub` text NOT NULL · `logo_url` text
- `bank_name`, `account_title`, `iban` — all NOT NULL
- `is_active` boolean default true
- `deactivated_at` timestamp (set when admin flips `isActive=false`)
- `deleted_at` timestamp (soft delete)
- `created_at`, `updated_at`

#### `products` (`schema/products.ts`)

- `id` text PK · `vendor_id` → `vendors.id` ON DELETE CASCADE
- `name` text · `slug` text UNIQUE
- Pack-pricing model: `pack_weight_grams` int NOT NULL,
  `pack_size` int NOT NULL default 1, `unit_weight_grams` int,
  `unit_label` text, `pack_mrp_cents` int, `pack_wholesale_price_cents`
  int NOT NULL default 0, `price_per_unit_cents` int.
- `images` jsonb default `[]` (array of `{ url, blurHash }`).
- `stock` int NOT NULL default 0
- Vendor enrichment: `sku` text (per-vendor partial unique),
  `brand` text, `low_stock_threshold` int default 10,
  `status` text — `'active' | 'draft'`.
- `version` int default 0 · `created_at`, `updated_at`.

#### `product_pack_tiers` (`schema/product-pack-tiers.ts`)

- `id` PK · `product_id` → products
- `pack_qty` int · `price_per_pack_cents` int
- `badge` text (`save | best | null`)
- `is_default` boolean default false
- timestamps

#### `categories` + `product_categories`

- `categories(id, name, slug UNIQUE, image_url, icon_key, is_active, …)`
- `product_categories(product_id, category_id)` composite PK — M2M.

#### `orders` (`schema/orders.ts`) — buyer order

- `id` text PK · `display_id` text UNIQUE (e.g. `#ORD-101`)
- `user_id` → user
- Shipping snapshot: `shipping_name`, `shipping_phone`,
  `shipping_address`, `shipping_city`, `address_id` uuid → `addresses`
- `total_items_cost`, `total_shipping_cost`, `grand_total` (int cents)
- `status` text — values used in code: `processing |
partially_fulfilled | completed`
- `rider_notes` text (max 500 chars enforced at API layer)
- `created_at`, `updated_at`

#### `sub_orders` (`schema/sub-orders.ts`) — one per vendor inside an order

- `id` text PK · `order_id` → orders · `vendor_id` → vendors
- `status` text — values used in code:
  `pending | packed | handed_to_courier | delivered | cancelled`
- `courier_tracking_id` text · `weight_grams` int
- Financials: `cod_amount`, `items_total`, `shipping_fee_customer`,
  `coolie_fee_reimbursement`, `courier_cost`, `platform_commission`
  (all int cents)
- `handed_at` timestamp (set when vendor advances to
  `handed_to_courier`)
- `created_at`, `updated_at`

#### `order_items` (`schema/order-items.ts`)

- `id` PK · `sub_order_id` → sub_orders · `product_id` → products
- `quantity` int (counts **packs**, not units)
- `unit_price` int (price-per-pack snapshot)
- `total_price` int
- `pack_size_at_purchase` int default 1, `price_per_unit_at_purchase` int
- `created_at`

#### `payout_runs` (`schema/payout-runs.ts`)

- `id` PK · `vendor_id` → vendors
- `week_start` date · `week_end` date · UNIQUE (vendor, week_start)
- `paid_on` ts · `txn_id` text
- `completed_orders_count` int
- `gross_amount_cents`, `returns_amount_cents`,
  `mnp_reimbursement_cents`, `net_amount_cents` (int)
- `status` text default `'pending'` — `pending | paid | held | failed`
- timestamps

#### Other tables present (not directly in scope but worth knowing)

- `wallet(user_id UNIQUE, balance_cents, …)`
- `vendor_ledger(id, vendor_id, direction credit|debit, amount,
type sale_revenue|logistics_reimbursement|payout|penalty,
reference_id, description, created_at)`
- `addresses(id uuid, user_id, title, recipient_name, recipient_phone,
address, city, is_default, …)` — `postal_code`/`province` deferred
  pending migration 0012.
- `admin_audit_log(admin_id, action, target_type, target_id, metadata
jsonb, …)`
- `promotional_banners`, `product_reviews`, `relations.ts`.

---

## 4. Service layer

**There is no `packages/services` today.** Vendor business logic lives
inline in Next.js route handlers under
`apps/web/src/app/api/vendor/*` and (for admin operations on vendors)
`apps/web/src/app/api/admin/vendors/*`. UI module folders under
`apps/web/src/modules/vendor/...` are presentation/query-hook only.

The CLAUDE.md WhatsApp rule explicitly requires lifting this logic
into `packages/services` so the new worker can reuse it. Today, every
function below would need to be extracted.

| Capability                                                     | File                                                                              | Exported handler | Notes                                                                                                                                                                                                                                  |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List a vendor's sub-orders (incl. items)                       | `apps/web/src/app/api/vendor/orders/route.ts`                                     | `GET`            | Joins `sub_orders` + `orders` (shipping snapshot) + `order_items` + `products`. Resolves vendor via `getVendorIdFromSession`. Sorted oldest-first. Returns `{ subOrders, meta: { pendingCount } }`.                                    |
| Update sub-order status (advance the state machine)            | `apps/web/src/app/api/vendor/orders/[subOrderId]/route.ts`                        | `PATCH`          | Hardcoded `ALLOWED_TRANSITIONS = { pending → packed, packed → handed_to_courier }`. Sets `handed_at` when transitioning to `handed_to_courier`. **No transition exists in vendor code for `delivered` / `cancelled`** — open question. |
| List a vendor's products (paginated, filterable, with stats)   | `apps/web/src/app/api/vendor/products/route.ts`                                   | `GET`            | Filters: `q` (name/sku/brand ILIKE), `status=all\|active\|low-stock\|drafts`, `categoryId`, `sort=newest\|oldest\|stock-asc\|stock-desc`. Helper `readStats(vendorId)` is the place that returns `{ all, active, lowStock, drafts }`.  |
| Create a product (with tiers + categories)                     | same file                                                                         | `POST`           | Zod-validates `createProductSchema` from `@repo/schemas/catalog/product`. Single transaction inserts into `products` + `product_pack_tiers` + `product_categories`. Calls `revalidatePath(VENDOR_PRODUCTS)`.                           |
| Read one of a vendor's products                                | `apps/web/src/app/api/vendor/products/[id]/route.ts`                              | `GET`            | Scoped by `vendorId`. Returns product + tiers + `categoryIds`.                                                                                                                                                                         |
| Update product (price / stock / metadata / tiers / categories) | same file                                                                         | `PATCH`          | Zod-validates `updateProductSchema`. Per-field present? logic. Tier replacement is delete-then-insert in tx. **No field-level diffing** → callers must send the whole object pattern.                                                  |
| Vendor dashboard KPIs / low-stock / recent-orders              | `apps/web/src/app/api/vendor/dashboard/{kpis,low-stock,recent-orders}/route.ts`   | `GET` each       | Not read in detail in this audit.                                                                                                                                                                                                      |
| Vendor payout summary                                          | `apps/web/src/app/api/vendor/payouts/{route.ts,next/route.ts,breakdown/route.ts}` | `GET` each       | Reads `payout_runs`. Not read in detail in this audit.                                                                                                                                                                                 |
| Vendor self profile                                            | `apps/web/src/app/api/vendor/me/route.ts`                                         | `GET`            | Returns the vendor row for the current session.                                                                                                                                                                                        |
| Vendor image upload                                            | `apps/web/src/app/api/vendor/upload/route.ts`                                     | unknown          | Likely Supabase storage proxy.                                                                                                                                                                                                         |

There is **no separately-named service function** for any of these —
the route handler is the function. To use them from a WhatsApp worker
today, the worker would have to either re-implement the logic or
HTTP-call the route (which loses the trust-phone auth model).

---

## 5. Auth model

- **Better-Auth** session cookies, configured in
  `apps/web/src/modules/auth/server/auth-client/index.ts` with the
  Drizzle adapter and the `phoneNumber` plugin.
- `additionalFields.role` is required on every user (default
  `retailer`, `input: false` so clients can't self-promote).
- OTP is sent via `sendOtpSms` in `auth/server/services/otp/index.ts`
  (Twilio); `verifyOTP` currently returns `true` unconditionally —
  flagged.

### How a request resolves a vendor

There are three composable layers, all under
`apps/web/src/modules/auth/server/`:

1. `session-from-request.ts` → `getSessionFromRequest(req)` calls
   `auth.api.getSession({ headers: request.headers })`.
2. `guards/require-role.ts` → `requireVendor(session)` /
   `requireAdmin(session)` / `requireRole(session, role)`. They
   `assert` the session and throw
   `AUTH_GUARD_ERRORS.SESSION_REQUIRED` (401) or
   `AUTH_GUARD_ERRORS.ADMIN_REQUIRED` (403).
3. `get-vendor-id-from-session.ts` →
   `getVendorIdFromSession(session)` selects
   `vendors.id WHERE user_id = session.user.id` and returns
   `string | null`. Returning `null` → caller responds 403 "Vendor
   record not found".

### Middleware

`apps/web/src/middleware.ts` runs on `/admin/:path*`, `/vendor/:path*`,
`/profile/:path*`. It loads the Better-Auth session, redirects to
`/auth?redirect=…` when missing, and enforces role for admin/vendor
prefixes.

### "Current vendor in context"

There is no React context / async-local-storage notion of "current
vendor". Every server route resolves the vendor from the request
session at the top of the handler. The WhatsApp worker will need its
own equivalent that resolves a vendor from the inbound phone number
(no Better-Auth session in that path).

---

## 6. Existing API surface (vendor flows)

All routes live in `apps/web/src/app/api/`. They return
`jsonSuccess(data, meta?, status?)` / `jsonError(message, status)`
from `@/modules/core/api`.

### `/api/vendor/*` — vendor-scoped (requires `role=vendor` session)

| Method · Path                             | Purpose                                                            |
| ----------------------------------------- | ------------------------------------------------------------------ |
| `GET /api/vendor/me`                      | Current vendor row.                                                |
| `GET /api/vendor/dashboard/kpis`          | KPI tiles.                                                         |
| `GET /api/vendor/dashboard/low-stock`     | Low-stock list.                                                    |
| `GET /api/vendor/dashboard/recent-orders` | Recent orders.                                                     |
| `GET /api/vendor/orders`                  | List sub-orders + items.                                           |
| `PATCH /api/vendor/orders/[subOrderId]`   | Advance sub-order status (`pending → packed → handed_to_courier`). |
| `GET /api/vendor/products`                | List vendor products + stats.                                      |
| `POST /api/vendor/products`               | Create product.                                                    |
| `GET /api/vendor/products/[id]`           | Read one product.                                                  |
| `PATCH /api/vendor/products/[id]`         | Update product (price, stock, tiers, categories, status, …).       |
| `POST /api/vendor/upload`                 | Upload (likely product images).                                    |
| `GET /api/vendor/payouts`                 | Payout runs list.                                                  |
| `GET /api/vendor/payouts/next`            | Next/upcoming payout.                                              |
| `GET /api/vendor/payouts/breakdown`       | Per-payout breakdown.                                              |

### `/api/admin/*` — admin-only (requires `role=admin` session)

| Method · Path                                | Purpose                                                                                                           |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `GET /api/admin/vendors`                     | Paginated/filterable vendor list with totals.                                                                     |
| `POST /api/admin/vendors`                    | Create a vendor (creates `user` row with `role=vendor` AND `vendors` row in one tx; auto-generates `display_id`). |
| `GET /api/admin/vendors/[id]`                | Vendor detail (joined with `user.phone_number`, `user.email`).                                                    |
| `PATCH /api/admin/vendors/[id]`              | Edit vendor + linked user fields (phone, email, name, hub, address, logo, bank, isActive).                        |
| `DELETE /api/admin/vendors/[id]`             | Soft delete (sets `deleted_at`, `is_active=false`).                                                               |
| `GET /api/admin/vendors/hubs`                | Distinct hub list.                                                                                                |
| `GET /api/admin/dashboard/kpis`              | Admin KPIs.                                                                                                       |
| `GET /api/admin/orders/recent`               | Recent orders across vendors.                                                                                     |
| `… /api/admin/{categories,banners,upload}/…` | Categories, promo banners, asset upload.                                                                          |

### Other top-level routes (for reference)

`/api/auth/[...all]` (Better-Auth handler), `/api/products/[slug]`,
`/api/categories`, `/api/banners`, `/api/checkout`, `/api/cron`,
`/api/retailer/*`, `/api/revalidate`, `/api/user`.

---

## 7. Admin panel

### Hosting

The admin panel is **NOT a separate app** — it's a route segment of
`apps/web` at `app/admin/...`. Page routes:
`/admin/(dashboard,vendors,products,orders,categories,promo-banners,sales-reports,users,audit-log)`.
`apps/web/src/app/admin/layout.tsx` wraps them.

### Auth

Admin auth uses the **same Better-Auth session** as the rest of the
app, gated by `role === 'admin'`. Enforcement happens in two places:

- Page-level: `middleware.ts` redirects non-admins on `/admin/*`.
- Route-level: every `app/api/admin/...` handler calls
  `requireAdmin(session)` from `auth/server/guards/require-role.ts`.

There is no separate admin login page or admin token system.

### Vendor create/edit form

- Route: `apps/web/src/app/admin/vendors/page.tsx` (list) and
  `apps/web/src/app/admin/vendors/[id]/` (detail).
- UI module: `apps/web/src/modules/admin/admin-vendors/`
  - Top-level: `index.tsx` (`AdminVendors` page component).
  - Form components:
    - `components/vendor-edit-panel/index.tsx` (desktop side panel)
    - `components/vendor-edit-sheet/index.tsx` (mobile/sheet variant)
    - `components/vendor-row/`, `vendor-row-menu/`,
      `vendor-remove-dialog/`, etc.
  - Validation schemas: `modules/admin/admin-vendors/schemas/index.ts`
    exports `createVendorSchema`, `updateVendorSchema`,
    `bankDetailsSchema` (Zod). **Phone** is constrained only to
    `min(1).max(13)` — no E.164 regex.
  - Mutations: `hooks/use-create-vendor-mutation`,
    `use-update-vendor-mutation`, `use-delete-vendor-mutation`,
    `use-bulk-update-vendors-mutation`.

When the admin creates a vendor, the POST handler manually inserts
both a `user` row (with a `crypto.randomUUID()` id and `role=vendor`)
and a `vendors` row in one Drizzle transaction. **No password is
set, no Better-Auth account row is created** — the vendor logs in via
the phone-OTP flow against the `user.phone_number` column. This is
relevant for the WhatsApp "phone-trust" model: the admin-entered
phone is already the canonical identity.

---

## 8. Open questions (blocking or near-blocking)

1. **Database connection string is hardcoded** in
   `packages/database/src/client.ts` (`postgresql://postgres.hnquy…`)
   with the password embedded, even though `DATABASE_URL` is listed
   in `turbo.json` `globalEnv`. The `if (!connectionString)` check
   below the literal can never fire. Is this intentional (dev-only
   shortcut) or should the worker be expected to read
   `DATABASE_URL`? If hardcoded, the credential is in the repo.
2. **`user.phone_number` E.164 normalization.** Schema is `text`,
   `UNIQUE`, with no regex. Admin form caps at 13 chars. Are existing
   rows guaranteed E.164 (`+92…`), or do we need a normalization
   pass before the WhatsApp worker can do exact lookups?
3. **`user.email`** — Drizzle definition has it nullable, but the
   first migration `0000_nasty_terrax.sql` declared
   `email text NOT NULL UNIQUE`. Did a later migration drop NOT NULL?
   Vendor-create POST inserts users without email today, which would
   fail under the original constraint.
4. **`user.business_name`** — referenced in a code comment as added
   by migration 0012 but the Drizzle field is deferred. Is the
   column currently in dev/staging/prod, and should the WhatsApp
   profile commands surface it?
5. **Sub-order status transitions beyond `handed_to_courier`.** The
   vendor PATCH handler only allows `pending → packed →
handed_to_courier`. Who advances to `delivered` / `cancelled` —
   a cron, the courier webhook, the admin? The WhatsApp tool surface
   needs to know which transitions a vendor is allowed to drive.
6. **Order-level vs sub-order-level vocabulary in WhatsApp.**
   Buyers see `orders.display_id` (`#ORD-…`) and one parent status;
   vendors operate on `sub_orders` (no display_id of their own).
   Should the WhatsApp UX expose the `ORD-…` id, a synthetic
   per-vendor id, or the raw sub-order UUID?
7. **No service layer / no test setup.** Per CLAUDE.md WhatsApp
   rules, business logic must move to `packages/services`. That
   refactor will touch every vendor route. Confirm:
   (a) we extract first, then build the worker against the
   extracted services; or (b) the worker calls the existing routes
   over HTTP for v0 and we extract later.
8. **MCP tool boundaries.** The CLAUDE rule says "every tool
   authenticates the caller from the conversation context — never
   accept user_id/vendor_id as a tool argument." Does that mean the
   MCP server is process-local to the worker (so it can read worker
   state), or remote (so we need a session token shape)?
9. **OTP in current code is a no-op.** Better-Auth's `verifyOTP`
   returns `true` unconditionally. The WhatsApp phone-trust model
   bypasses OTPs anyway, but anyone who knows a vendor's phone can
   sign into the web app today. Should fixing this be on the
   WhatsApp critical path or tracked separately?
10. **No `whatsapp_messages` table exists yet.** The CLAUDE rule
    requires logging all inbound, outbound, LLM, and tool calls to
    `whatsapp_messages`. We will need to design and migrate this
    table — confirm it should live in `packages/database` alongside
    the rest (vs in the worker's own DB).
11. **Webhook ingress location.** The CLAUDE rule says the webhook
    must ack within 3s and push heavy work to a queue. Should the
    Twilio/Meta webhook live in `apps/web/src/app/api/whatsapp/...`
    (reusing existing Vercel infra) or in `apps/whatsapp-worker`
    directly? And what queue (Upstash QStash, Inngest, raw Postgres,
    Redis)?
12. **Approval-state model for sensitive writes.** CLAUDE.md
    references "a future approval state model" for sensitive
    actions. None exists today. We need to know which vendor
    actions count as "sensitive" (price change? stock zero-out?
    payout-related?) before designing tool confirmations.
