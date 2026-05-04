# Phase 4 — MCP read-only tool registry

Date: 2026-05-04 · Branch: `feat/whatsapp-bot`.

## Goal

Stand up the MCP tool registry inside `packages/mcp-server` and ship
the three vendor read tools (`list_orders`, `get_order_details`,
`list_products`) as thin wrappers around `@repo/services`. No LLM in
this phase — the worker will plug into the registry in a later batch.

## What landed

### Dependencies

`packages/mcp-server/package.json` now has:

| Dep                          | Version    | Purpose                                                                            |
| ---------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| `@modelcontextprotocol/sdk`  | `^1.18.1`  | Reserved for the MCP-over-stdio transport in a later batch (not used by registry). |
| `zod`                        | `^3.23.8`  | Tool input/output schemas.                                                         |
| `zod-to-json-schema`         | `^3.24.5`  | Converts the input Zod schema into a Gemini `FunctionDeclaration.parameters` shape. |
| `@repo/database`             | workspace  | Used by the test-harness to look up a vendor (the tools themselves only use `@repo/services`). |
| `@repo/services`             | workspace  | Already wired in Phase 3.                                                          |

Devdeps: `@repo/eslint-config`, `@repo/typescript-config`,
`@types/node`, `eslint`, `tsx`, `typescript`. Resolved versions per
`pnpm-lock.yaml`: MCP sdk `1.29.0`, zod-to-json-schema `3.25.2`, zod
`3.25.76` (workspace-wide).

`tsconfig.json` switched from `compilerOptions.types: []` to
`["node"]` because the harness uses `process.argv` / `process.exit`.
This still works around the repo-wide `TS2688: minimatch` glitch
(scoped to other packages).

### Tool contract

`packages/mcp-server/src/types.ts`

```ts
export interface ToolContext {
  role: 'vendor' | 'buyer';
  subjectId: string;       // vendorId or userId
  phone: string;
  conversationId: string;
}

export interface ToolDefinition<I, O> {
  name: string;
  description: string;
  inputSchema: z.ZodType<I>;
  outputSchema: z.ZodType<O>;
  roles: ToolRole[];
  handler: (input: I, ctx: ToolContext) => Promise<O>;
  requiresConfirmation?: boolean; // wired to Phase 7
}

export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}
```

The `GeminiFunctionDeclaration` shape is inlined locally so the
package doesn't depend on `@google/generative-ai` (the worker can
adapt — same field names).

### Registry

`packages/mcp-server/src/registry.ts` exports:

| Export                          | Behavior                                                                                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `registerTool(tool)`            | Adds to an in-memory `Map<string, ToolDefinition>`. Re-registering the same name is allowed (last write wins) so HMR/test-harness reloads don't blow up. Clears the Gemini declaration cache.            |
| `getRegisteredToolNames()`      | Sorted array of names — used by the harness for visibility.                                                                                                                                              |
| `getToolsForRole(role)`         | Filters by `tool.roles.includes(role)`.                                                                                                                                                                  |
| `callTool(name, input, ctx)`    | Looks up by name → role-gates against `ctx.role` → input-validates → invokes handler with the validated input + the same `ctx` → output-validates → returns. Throws `ToolDispatchError` with a typed `code`. |
| `getGeminiToolDeclarations(role)` | Walks the role's tools, runs `zodToJsonSchema(inputSchema, { target: 'openApi3', $refStrategy: 'none' })`, strips `$schema`, returns `{ name, description, parameters }[]`. Cached per role; cache cleared on registration. |
| `ToolDispatchError`             | `code: 'UNKNOWN_TOOL' | 'ROLE_FORBIDDEN' | 'INPUT_VALIDATION' | 'OUTPUT_VALIDATION'`.                                                                                                                                                       |
| `_resetRegistryForTesting()`    | Drops the registry for harness/dev-only use.                                                                                                                                                            |

`callTool` never reads identity from `input` — only from `ctx`. This
is the CLAUDE.md rule "every tool authenticates the caller from the
conversation context — never accept user_id/vendor_id as a tool
argument" enforced at the registry level.

### Read tools (one file each)

All three live in `src/tools/`. Each file calls `registerTool(...)`
on import. The package's `src/index.ts` performs the side-effect
imports so that `import '@repo/mcp-server'` is enough to populate
the registry.

#### `tools/list-orders.ts`

- Wraps `listVendorOrders` from `@repo/services/vendor/orders`.
- Input: `{ status?: 'pending'|'packed'|'handed_to_courier'|'delivered'|'cancelled', dateRange?: 'today'|'week'|'month' }`.
- Output: `{ count, summary, recent }` where `summary` is a
  human-readable status breakdown ("8 pending, 14 packed, 18
  dispatched") and `recent` is the top 5 sub-orders sorted newest
  first with `{ id, customerName, total, status, placedAt }`.
- `id` is the parent `order.displayId` (`#ORD-…`) when present, else
  the sub-order UUID — chosen because vendors recognize the order
  number, not the sub-order id (per codebase-map open question §6).

#### `tools/get-order-details.ts`

- Wraps `getOrderDetails` (added in this phase — see "Service-layer
  addition" below).
- Input: `{ orderId: string }` (sub-order id; the LLM is told it can
  also be a display id like `#ORD-101` — the worker will normalize).
- Output: `{ id, orderDisplayId, status, customerName, customerPhone, shippingAddress, shippingCity, itemsTotal, codAmount, weightGrams, placedAt, items: [{ name, quantity, unitPrice, totalPrice }] }`.
- Vendor scope is enforced inside the service via
  `WHERE vendorId = ctx.subjectId`. `NotFoundError` propagates as a
  thrown error; the worker catches it and surfaces a friendly
  message.

#### `tools/list-products.ts`

- Wraps `listVendorProducts`.
- Input: `{ query?: string, filter?: 'low_stock'|'out_of_stock'|'all' }`.
- Output: `{ count, products: [{ id, sku, name, price, stock }] }`,
  capped at 20.
- `query` maps to `filter.q` (the service ILIKEs against name, sku,
  brand). `low_stock` maps to the existing `'low-stock'` service
  filter. `out_of_stock` is post-filtered (`stock === 0`) on a
  30-row pull because the service has no native filter for it —
  flagged below.

### Service-layer addition: `getOrderDetails`

`packages/services/src/vendor/orders.ts` gained `getOrderDetails(input)`:

```ts
{ vendorId: string; subOrderId: string; }
→ VendorSubOrderDetail
```

Returns the same projection as `listVendorOrders` for the matching
sub-order plus settlement-relevant fields (`handedAt`,
`courierTrackingId`, `shippingFeeCustomer`, `coolieFeeReimbursement`,
`courierCost`, `platformCommission`) and the line items. Matches the
existing list query verbatim — no new business logic, just a
single-row read with vendor scoping.

Phase 3 deliberately skipped this function ("no per-order vendor read
endpoint exists today, so we don't synthesize one"). Phase 4 needs it
because the rule "tools NEVER bypass the service layer" forbids the
tool from doing its own SQL. So we add a thin lookup that mirrors the
existing list projection — that's still in the spirit of "no new
business logic."

### Auto-registration

`src/index.ts`:

```ts
import './tools/list-orders';
import './tools/get-order-details';
import './tools/list-products';

export { ... } from './registry';
export type { ... } from './types';
```

The order is incidental — the registry is a `Map`, not a list. Add
new tool files to this list when introducing them; the harness will
list them automatically.

### Test harness — `src/test-harness.ts`

CLI runnable via `pnpm --filter @repo/mcp-server test-harness <arg>`,
where `<arg>` is a vendor id, user id, user email, or user phone.

It:

1. Resolves the vendor (4-step lookup: vendor.id → user.email →
   user.phone_number → user.id), or picks the first vendor when no
   argument is provided.
2. Builds `ToolContext{ role:'vendor', subjectId: vendor.id, phone,
   conversationId:'harness-conversation' }`.
3. Prints registered tool names and the Gemini declarations.
4. Calls every tool with sample inputs, plus negative-path probes
   (unknown order id, invalid enum value).
5. Exits 0 on success, 1 on crash.

Print format uses `process.stdout.write` (no `console.*`) to satisfy
the typescript ruleset.

## Files touched

```
packages/mcp-server/package.json                 (deps + scripts)
packages/mcp-server/tsconfig.json                (types: ['node'])
packages/mcp-server/eslint.config.js             (new — re-exports @repo/eslint-config/base)
packages/mcp-server/src/index.ts                 (auto-register + re-export registry)
packages/mcp-server/src/types.ts                 (new — ToolContext / ToolDefinition / GeminiFunctionDeclaration)
packages/mcp-server/src/registry.ts              (new)
packages/mcp-server/src/tools/list-orders.ts     (new)
packages/mcp-server/src/tools/get-order-details.ts (new)
packages/mcp-server/src/tools/list-products.ts   (new)
packages/mcp-server/src/test-harness.ts          (new)
packages/mcp-server/src/tools/.gitkeep           (deleted — dir is no longer empty)

packages/services/src/vendor/orders.ts           (+ getOrderDetails / VendorSubOrderDetail / GetOrderDetailsInput)

pnpm-lock.yaml                                   (regenerated)
```

## Verification

| Check                                           | Result                                                                  |
| ----------------------------------------------- | ----------------------------------------------------------------------- |
| `pnpm --filter @repo/services check-types`      | ✅ clean                                                                 |
| `pnpm --filter @repo/services lint`             | ✅ clean                                                                 |
| `pnpm --filter @repo/mcp-server check-types`    | ✅ clean                                                                 |
| `pnpm --filter @repo/mcp-server lint`           | ✅ clean (`No ESLint warnings or errors`)                                |
| `pnpm --filter @repo/mcp-server build`          | ✅ clean (emits `dist/` via `tsc`)                                       |
| `pnpm --filter web check-types`                 | ✅ clean                                                                 |
| `pnpm --filter whatsapp-worker check-types`     | ✅ clean                                                                 |

### Registry behavior — pure dry-run (no DB)

I wrote an in-process check that imports the package, lists the
registered tools, calls a tool with a wrong role and an unknown name,
and feeds an invalid enum value. (Removed after capturing output —
this was a one-shot verification, not a permanent script.)

```
registered: [ 'get_order_details', 'list_orders', 'list_products' ]
vendor tools: [ 'list_orders', 'get_order_details', 'list_products' ]
buyer tools (none expected): []
gemini decls: 3 [ 'list_orders', 'get_order_details', 'list_products' ]
role gate ok: Tool "list_orders" is not available for role "buyer"
unknown tool gate ok: Unknown tool: does_not_exist
input validation ok: Invalid enum value. Expected
  'pending' | 'packed' | 'handed_to_courier' | 'delivered' | 'cancelled',
  received 'nope'
dry run OK — registry behaves correctly without DB.
```

Sample Gemini declaration produced for `list_orders` (the worker can
hand this directly to Gemini's `tools[0].functionDeclarations[]`):

```json
{
  "name": "list_orders",
  "description": "List the vendor's orders. Returns a count, a one-line status summary across all matching orders, and the five most recent orders. Use this for \"how are my orders today\" or \"show me pending orders\".",
  "parameters": {
    "type": "object",
    "properties": {
      "status": { "type": "string", "enum": ["pending","packed","handed_to_courier","delivered","cancelled"] },
      "dateRange": { "type": "string", "enum": ["today","week","month"] }
    },
    "additionalProperties": false
  }
}
```

### Live test-harness run — passed

Once the pooler was reachable, the harness ran end-to-end against
the dev DB. Vendor `00ae5ee1-754c-4816-870a-18666e8a0bf9` (AliBaba)
was selected because it has 5 sub-orders and 85 products.

```
$ env $(grep -v '^#' packages/database/.env | xargs) \
    pnpm --filter @repo/mcp-server test-harness 00ae5ee1-754c-4816-870a-18666e8a0bf9
```

Results captured (abridged):

- `list_orders {}` →
  `{ count: 5, summary: "4 pending, 1 handed to courier", recent: [...5 items] }`.
  `recent[].id` correctly carries the `ORD-…` display id, not the
  sub-order UUID — this is what the LLM should surface to the
  vendor.
- `list_orders { status: 'pending' }` → 4 rows, summary
  `"4 pending"`.
- `list_orders { dateRange: 'week' }` → all 5 (everything was
  placed within the last week).
- `list_products {}` → `{ count: 85, products: [...20 capped] }`.
- `list_products { filter: 'low_stock' }` → 0 (catalog is
  freshly seeded with stock=500 / 487-498).
- `list_products { filter: 'out_of_stock' }` → 0.
- `list_products { query: 'a' }` → `count: 63`, 20 capped rows
  (ILIKE on name/sku/brand).
- `get_order_details { orderId: '<sub-order UUID>' }` → full
  detail payload:
  ```json
  {
    "id": "0ecbc676-bb43-409d-abd8-e6a96005c22b",
    "orderDisplayId": "ORD-MOPNYLN6-DD8Z",
    "status": "pending",
    "customerName": "Aadel Asad",
    "customerPhone": "03154333909",
    "shippingAddress": "Ghazali Hostel",
    "shippingCity": "Lahore",
    "itemsTotal": 5472000,
    "codAmount": 5472000,
    "weightGrams": 9600,
    "placedAt": "2026-05-03T11:04:46.300Z",
    "items": [
      { "name": "Dairy Milk 160g", "quantity": 5, "unitPrice": 1094400, "totalPrice": 5472000 }
    ]
  }
  ```
- Negative paths fired correctly:
  - `get_order_details { orderId: 'nonexistent' }` →
    `NotFoundError: Sub-order not found`.
  - `get_order_details { orderId: 'ORD-MOQPAP59-GBK1' }` (passing
    the display id from `list_orders`) → also `NotFoundError`,
    because the service expects a sub-order UUID. This is the
    documented sub-order-vs-order vocabulary gap below — the worker
    will need a small resolver step before calling this tool.
  - `list_orders { status: 'badvalue' }` →
    `ToolDispatchError [INPUT_VALIDATION]: Invalid enum value …`.

To re-run later:

```
pnpm --filter @repo/mcp-server test-harness <vendor-id-or-email-or-phone>
```

(no argument falls back to "first vendor in the table"; that
vendor — Aadel Baba — has no orders/products in dev, so prefer an
explicit id like AliBaba's above when you want non-empty payloads.)

## Hard-rule check

- ✅ Tools never accept `vendorId` / `userId` as input — only via `ctx`.
  All three input schemas omit any identity field; `callTool` does
  not pass `input` containing identity to the handler beyond what the
  schema validated.
- ✅ Tools never bypass the service layer. Every handler is a thin
  shape-mapping over `@repo/services` exports. No Drizzle imports
  inside `src/tools/*`.
- ✅ Output shapes are LLM-friendly summaries, not raw DB rows.
  `summary` is a human string for `list_orders`, prices are rendered
  as integer cents (LLM is told elsewhere to format), recents are
  capped at 5 / 20.

## Gaps & flags for future phases

- **`out_of_stock` filter is post-filtered.** `listVendorProducts`
  has no native zero-stock filter. The MCP tool fetches 30 rows then
  filters in memory. If catalogs grow larger, push this into the
  service: extend `VENDOR_PRODUCT_STATUS_FILTERS` with
  `'out-of-stock'` and the matching `WHERE stock = 0` clause. Doing
  it here would have been a service-layer change — phase 3 froze
  that surface, so we kept the workaround until a write-tools batch
  needs it anyway.
- **Sub-order vs order vocabulary.** `list_orders.recent[].id` uses
  `orderDisplayId` (the `#ORD-…` form vendors recognize), but
  `get_order_details` requires the actual sub-order UUID. The worker
  will need a small resolver step ("user said `#ORD-101` → look up
  the vendor's sub-order under that order"). Out of scope for this
  phase. Open question §6 in 00-codebase-map.md still applies.
- **`requiresConfirmation` on `ToolDefinition`** is declared but the
  registry currently ignores it. Phase 7 wires the conversation
  state-machine gate.
- **MCP transport.** The `@modelcontextprotocol/sdk` install is
  reserved for the stdio/in-process transport. The current registry
  is process-local — fine for the worker, where the LLM runs in the
  same Node process. If we later split LLM into another service, we
  expose this registry over MCP.

## Stop point

Stopping after this log per the phase instructions. Phase 5 (LLM /
Gemini tool-use loop wiring) picks up next. The worker can now
import the registry and call:

```ts
import {
  getGeminiToolDeclarations,
  callTool,
  ToolDispatchError,
} from '@repo/mcp-server';
```

with no further plumbing.
