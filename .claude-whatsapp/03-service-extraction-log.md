# Phase 3 — vendor service extraction

Date: 2026-05-04 · Branch: `feat/whatsapp-bot`.

## Goal

Move vendor business logic out of the Next.js route handlers in
`apps/web/src/app/api/vendor/...` into a new `@repo/services` package
so the WhatsApp worker and MCP server can call the same code without
depending on `apps/web`.

## What landed

### New package: `packages/services`

```
packages/services/
  package.json                # @repo/services workspace package
  tsconfig.json               # extends @repo/typescript-config/base; types: ["node"]
  eslint.config.js            # re-export of @repo/eslint-config/base
  src/
    index.ts                  # barrel — re-exports errors + vendor/*
    errors.ts                 # ServiceError + UnauthorizedError, NotFoundError,
                              # ValidationError, ConflictError, InvalidStateError
    vendor/
      orders.ts               # listVendorOrders, updateOrderStatus
      products.ts             # listVendorProducts, getVendorProduct, createProduct,
                              # updateProduct, updateProductPrice, updateProductStock
```

`package.json` exports map exposes `.`, `./errors`, `./vendor/orders`,
`./vendor/products`.

Dependencies: `@repo/constants`, `@repo/database`, `@repo/schemas`,
`@repo/utils`, `drizzle-orm`, `zod`. Dev: `@repo/eslint-config`,
`@repo/typescript-config`, `@types/node`, `eslint`, `typescript`.

### Workspace dependency edges

- `apps/web/package.json` → adds `@repo/services` (alphabetical
  position between `@repo/schemas` and `@repo/storage`).
- `apps/whatsapp-worker/package.json` → adds `@repo/services`.
- `packages/mcp-server/package.json` → gains a new `dependencies`
  block with `@repo/services`. (The package previously had no runtime
  deps because it was a stub.)

### Functions moved

The seven functions in the task brief, mapped to the source code lines
they replace.

| Service function       | Source                                                                    | Notes                                                                                                                                                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listVendorOrders`     | `apps/web/src/app/api/vendor/orders/route.ts` GET                         | Drizzle query (sub-orders + items + product + parent order shipping snapshot) lifted verbatim. `pendingCount` meta preserved.                                                                                                                                                                                          |
| `updateOrderStatus`    | `apps/web/src/app/api/vendor/orders/[subOrderId]/route.ts` PATCH          | `ALLOWED_TRANSITIONS = { pending → packed, packed → handed_to_courier }` lifted verbatim. `handed_at` is set on transition to `handed_to_courier`. The user-spec signature was `{ vendorId, orderId, status }`; the existing handler operates on **sub-orders** with no input status. See "Signature deviation" below. |
| `listVendorProducts`   | `apps/web/src/app/api/vendor/products/route.ts` GET                       | Filter (`q`, `status`, `categoryId`, `sort`, `page`, `pageSize`) and `readStats` helper lifted verbatim. The route now sanitizes unknown `status`/`sort` query values to `undefined` before calling the service (preserves the pre-existing "ignore unknown filter values, default to all" behavior).                  |
| `createProduct`        | `apps/web/src/app/api/vendor/products/route.ts` POST                      | Drizzle transaction (insert into `products`, `product_pack_tiers`, `product_categories`) lifted verbatim. Postgres unique-violation is now caught inside the service and re-thrown as `ConflictError`.                                                                                                                 |
| `updateProduct`        | `apps/web/src/app/api/vendor/products/[id]/route.ts` PATCH                | Field-by-field present? logic + tier delete-then-insert + category delete-then-insert lifted verbatim. `NOT_FOUND` (string sentinel) replaced by `NotFoundError`.                                                                                                                                                       |
| `updateProductPrice`   | _new convenience wrapper_                                                 | Thin wrapper: resolves `productIdOrSku` → `productId`, then calls `updateProduct` with `packWholesalePriceCents`. Not called by any existing route.                                                                                                                                                                    |
| `updateProductStock`   | _new convenience wrapper_                                                 | Thin wrapper: resolves `productIdOrSku` → `productId`, then calls `updateProduct` with `stock`. Not called by any existing route.                                                                                                                                                                                      |
| `getVendorProduct`     | `apps/web/src/app/api/vendor/products/[id]/route.ts` GET                  | Lifted as a bonus to keep the GET handler thin and to give the worker a single-product read counterpart to `listVendorProducts`. The user-spec list omitted `getOrderDetails`/`getProductDetails` — see the "Gaps" section.                                                                                            |

Each service function:

- Takes a single `input` object.
- Validates with Zod (a per-function input schema). Throws
  `ValidationError` on bad input.
- Authorizes against `vendorId` by including it in every `WHERE` —
  rows belonging to other vendors are invisible. `NotFoundError` is
  thrown when the resource isn't found under the vendor scope (this is
  the existing 404 behavior; we deliberately don't distinguish "not
  yours" from "doesn't exist").
- Returns a typed result. Output types are exported alongside.
- Has zero knowledge of HTTP, Next.js sessions, or LLMs. `vendorId` is
  always passed in.

### Errors

`packages/services/src/errors.ts` defines:

- `ServiceError` (base, has `code: string`).
- `UnauthorizedError` (`UNAUTHORIZED`).
- `NotFoundError` (`NOT_FOUND`).
- `ValidationError` (`VALIDATION`).
- `ConflictError` (`CONFLICT`).
- `InvalidStateError` (`INVALID_STATE`).

The vendor routes catch these and translate to the existing HTTP
shapes: `NotFoundError` → 404, `ValidationError` → 400,
`ConflictError` → 409, `InvalidStateError` → 400. Existing
`AUTH_GUARD_ERRORS` flow (401/403) is left untouched in the route.

### Routes updated to be thin

Each handler now: (a) loads session, (b) `requireVendor`, (c) resolves
`vendorId`, (d) calls a single service function, (e) returns
`jsonSuccess` or maps a typed error to `jsonError`. Preserved
side-effects: `revalidatePath(VENDOR_PRODUCTS)` after `POST` /
`PATCH /vendor/products/[id]` runs in the route (Next.js cache API
cannot live in a non-Next package).

- `apps/web/src/app/api/vendor/orders/route.ts`
- `apps/web/src/app/api/vendor/orders/[subOrderId]/route.ts`
- `apps/web/src/app/api/vendor/products/route.ts`
- `apps/web/src/app/api/vendor/products/[id]/route.ts`

The `slugForProduct` import was removed from the route; the slug
generator is inlined in `services/src/vendor/products.ts` using
`@repo/utils/string` `slugify` + `@repo/utils/id` `generateId`. The
shared `apps/web/src/modules/core/utils/slug/index.ts` is left in
place because `slugForCategory` is still used by admin routes (out of
scope).

## Files touched

```
packages/services/package.json                         (new)
packages/services/tsconfig.json                        (new)
packages/services/eslint.config.js                     (new)
packages/services/src/index.ts                         (new)
packages/services/src/errors.ts                        (new)
packages/services/src/vendor/orders.ts                 (new)
packages/services/src/vendor/products.ts               (new)

apps/web/package.json                                  (+1 dep: @repo/services)
apps/web/src/app/api/vendor/orders/route.ts            (rewritten — thin)
apps/web/src/app/api/vendor/orders/[subOrderId]/route.ts (rewritten — thin)
apps/web/src/app/api/vendor/products/route.ts          (rewritten — thin)
apps/web/src/app/api/vendor/products/[id]/route.ts     (rewritten — thin)

apps/whatsapp-worker/package.json                      (+1 dep: @repo/services)
packages/mcp-server/package.json                       (+1 dep: @repo/services)
packages/mcp-server/tsconfig.json                      (compilerOptions.types: [])

pnpm-lock.yaml                                         (regenerated by pnpm install)
```

## Verification

| Check                                              | Result                                                                                         |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `pnpm --filter @repo/services check-types`         | ✅ clean                                                                                        |
| `pnpm --filter @repo/services lint`                | ✅ clean (no ESLint warnings or errors)                                                         |
| `pnpm --filter web check-types`                    | ✅ clean                                                                                        |
| `pnpm --filter web lint`                           | ✅ clean (`No ESLint warnings or errors`)                                                       |
| `pnpm --filter web build`                          | ✅ succeeded; `/api/vendor/orders`, `/api/vendor/orders/[subOrderId]`, `/api/vendor/products`, `/api/vendor/products/[id]` all in the route table |
| `pnpm --filter whatsapp-worker check-types`        | ✅ clean                                                                                        |
| `pnpm --filter @repo/mcp-server check-types`       | ✅ clean (after `compilerOptions.types: []` to avoid pre-existing `minimatch` resolution noise) |

Pre-existing repo-wide TS2688 (`Cannot find type definition file for 'minimatch'`) still affects `@repo/database`, `@repo/whatsapp-core`, `@repo/hooks`, `@repo/contexts`, `@repo/constants`, `@repo/schemas` — same condition flagged in `02-schema-log.md`. Out of scope for this batch. `@repo/services` and `@repo/mcp-server` avoid it via an explicit `compilerOptions.types` list.

No tests existed in the codebase for the moved code (the audit in `00-codebase-map.md` confirmed there is no test framework wired in anywhere). Nothing to relocate.

## Behavior parity — claims and risks

The refactor is structural. The handler bodies were moved into named
functions and the routes call them. Specific items to double-check
during smoke testing:

1. **`GET /api/vendor/orders`** — response payload preserved
   verbatim: `{ subOrders: VendorSubOrder[], meta: { pendingCount } }`.
   `subOrders[*].items[*].product.imageUrl` still derived from the
   first image in `products.images`.
2. **`PATCH /api/vendor/orders/[subOrderId]`** — request shape
   unchanged (no body required). Response unchanged
   (`{ id, status }`). HTTP statuses unchanged: 400 on
   `Cannot advance from status "<x>"`, 404 on missing sub-order, 401
   if no session, 403 if non-vendor.
3. **`GET /api/vendor/products`** — same query params, same payload
   (`{ rows, total, page, pageSize, stats }`). Unknown `status` /
   `sort` values are ignored (sanitized to `undefined`); the
   `pageSize` clamp at `min(30, max(1, requested))` happens inside
   the service rather than the route — same effective bounds.
4. **`POST /api/vendor/products`** — Zod errors now carry the same
   message as before (`flatten().formErrors[0] ?? 'Invalid input'`).
   `revalidatePath(VENDOR_PRODUCTS)` still runs on success. 201
   status preserved. 409 on Postgres unique violation preserved.
5. **`GET /api/vendor/products/[id]`** — response shape preserved
   (`{ ...product, categoryIds, packTiers }`). 404 on missing.
6. **`PATCH /api/vendor/products/[id]`** — partial update semantics
   preserved (each field guarded by `data.X !== undefined` exactly as
   before). Tier replacement is still delete-then-insert inside the
   tx. Category replacement still delete-then-insert. `revalidatePath`
   for `VENDOR_PRODUCTS` and `${VENDOR_PRODUCTS}/${id}/edit` still run
   in the route on success. 404, 409, 400 statuses preserved.

## Signature deviations from the task spec

The task brief listed these signatures. Where the existing behavior
demanded a different shape, I preserved behavior:

- `updateOrderStatus({ vendorId, orderId, status })` →
  **`updateOrderStatus({ vendorId, subOrderId, status? })`**.
  The existing route advances a **sub-order**, not an order, and does
  not accept a `status` argument (it computes the next status from
  the allowed-transitions map). The service takes `subOrderId`
  because the database-level identifier is the sub-order id, and
  `status` is optional — when present, the service validates that it
  matches the next allowed transition; when absent, it just advances
  (preserves the existing route's behavior). Open question §6 of
  `00-codebase-map.md` calls out the order-vs-sub-order vocabulary
  question for the WhatsApp UX; rename if/when that's resolved.
- `updateProductPrice({ vendorId, productIdOrSku, newPrice })` and
  `updateProductStock({ vendorId, productIdOrSku, newCount })` are
  **net-new** convenience wrappers — there is no existing route that
  mutates a single product field. They delegate to `updateProduct` so
  no new business logic is introduced. SKU lookup uses a simple
  fallback query (find by `id`, then by `sku` within the vendor's
  catalog). `newPrice` updates `packWholesalePriceCents` — the
  primary vendor-facing price field; `packMrpCents` and
  `pricePerUnitCents` are not touched. Flag for confirmation when the
  WhatsApp tool surface lands.

## Gaps relative to the task spec

- **`getOrderDetails({ vendorId, orderId })`** was in the task brief
  but does **not** correspond to anything in section 4 of the
  codebase map: there is no per-order vendor read endpoint today.
  Skipped to honor the "do not add new business logic" rule.
  `listVendorOrders` returns full items per sub-order, which is the
  current source of truth for vendor-side order detail. When the
  WhatsApp UX needs a single-order read, add `getVendorSubOrder` (or
  `getVendorOrderById`) in a follow-up batch.
- **`createProduct` signature** stays as-is: it accepts the
  `createProductSchema` payload as currently defined in
  `@repo/schemas/catalog/product` plus `vendorId`. The brief noted
  "signature can stay TBD if existing code is messy — just preserve
  current behavior."

## Side-effects preserved (and ones not preserved)

- **`revalidatePath`** — preserved in the route, not in the service
  (services do not import `next/cache`). Same paths revalidated as
  before: `VENDOR_PRODUCTS` after create, `VENDOR_PRODUCTS` plus
  `${VENDOR_PRODUCTS}/${id}/edit` after update.
- **Postgres unique-violation** — preserved. Caught in the service
  and re-thrown as `ConflictError`; the route maps to 409 with the
  same message text.
- **`AUTH_GUARD_ERRORS`** — preserved. Not lifted into the service
  package because session/auth concerns are HTTP-side; routes still
  catch these.
- **Logging** — `console.error` calls in the routes are preserved
  with the same prefixes (`'GET /api/vendor/orders error:'`, etc.)
  for parity with existing log search patterns.

I did not find any side-effects in the original handlers (events,
audit-log writes, hooks) that the codebase map missed for these seven
flows. If the WhatsApp tool surface later discovers one (e.g. a
catalog index that needs a refresh on stock change), it should be
moved into the service alongside the mutation, not added back to the
route.

## Stop point

Stopping after this log per the phase instructions. Phase 4 (worker
plumbing / webhook ingress) picks up next. The worker can now
`import { listVendorOrders, updateProductStock, ... } from
'@repo/services'` and the MCP server can do the same for its tool
implementations.
