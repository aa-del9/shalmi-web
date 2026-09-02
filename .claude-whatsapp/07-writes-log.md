# Phase 7 — write tools + confirmation flow + idempotency

Date: 2026-05-04 · Branch: `feat/whatsapp-bot`.

## Goal

Add the three vendor write tools (`update_product_price`,
`update_product_stock`, `update_order_status`) and gate every write
behind:

1. **A YES/NO confirmation prompt** generated deterministically by
   the worker (no Gemini round-trip → no tokens spent on the
   confirmation side of the loop).
2. **Idempotency** at the registry level — same `<phone>:<tool>:<input>`
   within 60 s replays the cached result instead of double-executing.

Hard rules: no write happens without confirmation · confirmation
expires in 5 min · idempotency on every write call · vendor never
specifies vendorId · confirmation message generation does NOT call
Gemini.

## What landed

### Idempotency middleware — `packages/mcp-server/src/idempotency.ts`

```ts
wrapWithIdempotency<I, O>(tool: ToolDefinition<I, O>): ToolDefinition<I, O>
```

The wrapped handler:

1. Computes `key = <phone>:<tool_name>:<sha256(stableStringify(input))[..16]>`.
2. SELECTs from `whatsapp_idempotency` where `key = ?` and
   `expiresAt > now()`.
3. If found, returns the cached `result` JSON.
4. Else runs the underlying handler, persists `(key, toolName,
   result, expiresAt = now() + 60s)` via
   `INSERT … ON CONFLICT (key) DO UPDATE SET result, expiresAt,
toolName`, returns it.

`stableStringify` recursively sorts object keys before serializing
so semantically-equal inputs hash identically. Hash is sha256 over
the stable JSON, truncated to 16 hex chars (collision domain is
scoped to `<phone>:<tool>` so the truncation is acceptable).

A best-effort `pruneExpired(toolName)` runs alongside each cache
write — non-fatal if it fails — so the table stays small without a
dedicated cron.

`buildIdempotencyKey(phone, toolName, input)` is exported from the
package for tests / introspection.

### Service helper — `getVendorProductByIdOrSku`

Added to `packages/services/src/vendor/products.ts`. Internal
`resolveProductId` was already there but private; the new exported
function wraps it and returns the fields the preview functions need:

```ts
{
  vendorId, productIdOrSku
} → {
  id, name, sku, packWholesalePriceCents, stock
}
```

Throws `ValidationError` on bad input, `NotFoundError` when the SKU
or product id isn't found within the vendor's catalog.

### Three write tools, each `requiresConfirmation: true` and wrapped

#### `tools/update-product-price.ts`

- Input: `{ productIdOrSku: string, newPrice: number }` — `newPrice`
  is in **rupees**; the handler multiplies by 100 to get cents
  before calling `updateProductPrice`.
- Output: `{ success, sku, productName, oldPrice, newPrice }` (all
  prices in rupees).
- Exports `previewUpdateProductPrice(input, ctx)` — read-only
  lookup. Returns `{ productId, productName, sku, oldPriceRupees,
newPriceRupees }`.

#### `tools/update-product-stock.ts`

- Input: `{ productIdOrSku: string, newCount: number }` — pack count.
- Output: `{ success, sku, productName, oldStock, newStock }`.
- Exports `previewUpdateProductStock`.

#### `tools/update-order-status.ts`

- Input: `{ orderId: string, status: 'packed' | 'handed_to_courier' }`.
  Enum is constrained to the two transitions a vendor is allowed to
  drive (mirrors `ALLOWED_TRANSITIONS` in
  `packages/services/src/vendor/orders.ts`).
- Output: `{ success, orderId, oldStatus, newStatus }`.
- Exports `previewUpdateOrderStatus`. Returns `{ subOrderId,
orderDisplayId, oldStatus, newStatus, customerName }`.
- `orderId` accepts a sub-order UUID. Display ids like `ORD-…` are
  not yet resolvable here — same gap flagged in Phase 4.

All three tools call `registerTool(wrapWithIdempotency(tool))` on
import. `src/index.ts` adds the three side-effect imports next to
the existing read tools.

### Registry exports (`packages/mcp-server/src/index.ts`)

- `getTool(name)` newly exported from `registry.ts` — the inbound
  consumer needs it to inspect `requiresConfirmation` before deciding
  whether to route through the YES/NO state machine.
- Re-exports of every preview function and their preview types.
- Re-exports of `wrapWithIdempotency` / `buildIdempotencyKey`.

### Conversation state-machine helpers
(`packages/whatsapp-core/src/conversation.ts`)

- `setPendingAction({ conversationId, action })` — sets `state =
'awaiting_confirmation'`, `pendingAction = <PendingAction>`,
  `stateData = { startedAt }`. (`state_data` is still kept around for
  diagnostics but is not load-bearing for the YES/NO flow.)
- `bumpInvalidAttempts({ conversationId, action })` — re-persists
  the same action with `invalidAttempts++`.
- `coercePendingAction(value)` — runtime guard that turns the JSONB
  blob from the DB into a typed `PendingAction` (or `null` if the
  shape is wrong, e.g. row schema drift from a future deploy).
- `parseConfirmationReply(text)` — case-insensitive, punctuation-
  stripped match. YES/NO matchers cover English + Roman Urdu cues
  (han, haan, ji, jihan, theek, kardo, krdo, kardein on the YES
  side; nahi, nahin, nai, na, mat, ruko on the NO side). Two-pass:
  (1) full-string canonicalization for single-token replies, (2)
  per-token sweep so `"haan kar do"` is YES but `"nahi karna"` is NO
  (NO is checked first to defend against ambiguity).
- `detectLanguage(text)` — `'ur-roman' | 'en'`. Roman Urdu is
  detected when the message contains common cues (kar/kr/do/dein/ka/
  ki/kitne/han/haan/ji/nahi/etc.). Only used to pick the
  confirmation-message variant.
- `isExpired(action, now?)` — TTL check; `expires_at` is an ISO
  string.
- Constants: `AWAITING_CONFIRMATION_STATE = 'awaiting_confirmation'`,
  `CONFIRMATION_TTL_MS = 5 * 60 * 1000`,
  `MAX_INVALID_CONFIRMATION_REPLIES = 3`.
- `PendingAction` type and `ConfirmationParse` (`'yes' | 'no' |
'invalid'`) exported from the package.

### Deterministic confirmation messages
(`apps/whatsapp-worker/src/confirmation.ts`)

`buildConfirmationPrompt(action)`, `buildAppliedReply(action,
result)`, `buildCancelledReply`, `buildExpiredReply`,
`buildInvalidNudge`, `buildAutoCancelReply`. Each picks an English or
Roman Urdu variant from `action.language`. Examples:

| action                                 | en                                                                                         | ur-roman                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| price prompt (SH-1042 Rs.450 → Rs.400) | `Update <name> (SH-1042) price from Rs. 450 to Rs. 400? Reply YES to confirm or NO to cancel.` | `<name> (SH-1042) ka price Rs. 450 se Rs. 400 kar dein? YES likhain confirm ke liye, NO cancel ke liye.` |
| stock prompt (SH-1042 → 100)           | `Set <name> (SH-1042) stock from 25 to 100? …`                                              | `<name> (SH-1042) ka stock 25 se 100 kar dein? …`                                          |
| order status (ORD-… → packed)          | `Mark order ORD-… for <customer> as "packed"? …`                                            | `Order ORD-… (<customer>) ko "packed" mark kar dein? …`                                    |
| applied reply (price)                  | `Done — updated <name> (SH-1042) price to Rs. 400.`                                         | `Done — <name> (SH-1042) ka price Rs. 400 kar diya.`                                       |
| cancelled                              | `Cancelled.`                                                                                | `Cancelled. Koi update nahi hua.`                                                          |
| expired                                | `That confirmation expired. Please try again.`                                              | `Confirmation expire ho gayi. Phir se request bhejein.`                                    |
| invalid nudge                          | `Reply YES or NO to the previous question.`                                                 | `YES ya NO likh kar reply karein previous question ka.`                                    |
| auto-cancel                            | `Cancelled — too many invalid replies.`                                                     | `Cancelled — bohot zyada invalid replies aaye.`                                            |

Currency formatter is `Rs. <toLocaleString('en-PK')>` to match the
admin/vendor UI conventions; status labels render
`handed_to_courier` as `"handed to courier"`.

### Inbound consumer — pre-LLM gate + write-tool branch

`apps/whatsapp-worker/src/workers/inbound.ts` was restructured but
keeps the existing read-tool happy path verbatim. New flow:

```
identity / first-contact / upsert  (unchanged)
load conversation
   ├── if state == awaiting_confirmation AND pending parses cleanly
   │     ├── if expired           → expired reply, clearPendingAction
   │     ├── if YES               → callTool(stored input)
   │     │                           → applied reply (deterministic)
   │     │                           → clearPendingAction
   │     ├── if NO                → cancelled reply
   │     │                           → clearPendingAction
   │     └── else (invalid)
   │           ├── if next attempts >= 3 → auto-cancel,
   │           │                            clearPendingAction
   │           └── else                  → invalid nudge,
   │                                        bumpInvalidAttempts
   └── else (idle)
         ├── runVendorTurn (tools attached)
         ├── if no function call         → text reply
         ├── if function call:
         │     ├── if tool.requiresConfirmation:
         │     │     ├── runPreview() (read-only)
         │     │     │     ├── ok → setPendingAction,
         │     │     │     │       enqueue deterministic prompt
         │     │     │     └── error → runVendorFollowupTurn so
         │     │     │                  Gemini formulates the error
         │     │     └── (no follow-up Gemini call on success path)
         │     └── else                  → callTool, runVendorFollowupTurn
         └── append turns + persist tokens / tool_calls / tool_results
```

Key invariants enforced by the diff:

- **No write happens without confirmation.** The worker never calls
  `callTool` for a write tool inside `runGeminiVendorFlow`; that
  branch only runs the preview. Execution is gated through the
  pre-LLM YES/NO path.
- **Confirmation message is deterministic.** Built locally from
  `action.preview` — the worker never makes a follow-up Gemini call
  on the write happy path. (Token cost on a write turn: only the
  *initial* `runVendorTurn` that produced the function call.)
- **Free-text during awaiting_confirmation** is treated as an
  invalid reply, not a new Gemini turn — so an off-topic message
  doesn't blow away the staged action and silently drop the
  confirmation. Counter increments; after 3 invalid replies the
  action auto-cancels.
- **Idempotency runs at the registry level.** When the vendor
  confirms a write, `callTool('update_product_price', input, ctx)`
  hits the wrapped handler — first call writes through, second call
  with the same input within 60 s returns the cached result.
- **Vendor never specifies vendorId.** All three tools omit
  identity from `inputSchema`; `subjectId` comes from `ctx` in both
  `runPreview` and `callTool`.

### System-prompt update

`getVendorSystemPrompt()` now ends with:

> When the user asks for a write action (price/stock/status update),
> call the appropriate tool. The system will confirm with the user
> separately. Don't pre-confirm in your response. Don't fabricate
> that the action was done — wait for confirmation.

(Stable string preserved — caching layers can still match.)

### Files touched

```
packages/mcp-server/src/idempotency.ts                  (new)
packages/mcp-server/src/registry.ts                     (+getTool)
packages/mcp-server/src/index.ts                        (re-exports)
packages/mcp-server/src/tools/update-product-price.ts   (new)
packages/mcp-server/src/tools/update-product-stock.ts   (new)
packages/mcp-server/src/tools/update-order-status.ts    (new)

packages/services/src/vendor/products.ts                (+getVendorProductByIdOrSku)

packages/whatsapp-core/src/conversation.ts              (+state machine
                                                         helpers,
                                                         parsers,
                                                         language detect)
packages/whatsapp-core/src/llm/system-prompt.ts         (write-action rule)
packages/whatsapp-core/src/index.ts                     (re-exports)

apps/whatsapp-worker/src/confirmation.ts                (new — deterministic
                                                         prompts/replies)
apps/whatsapp-worker/src/workers/inbound.ts             (pre-LLM gate +
                                                         write-tool branch)
```

## Verification

### Static

| Check                                              | Result |
| -------------------------------------------------- | ------ |
| `pnpm --filter @repo/services check-types`         | ✅     |
| `pnpm --filter @repo/whatsapp-core check-types`    | ✅     |
| `pnpm --filter @repo/mcp-server check-types`       | ✅     |
| `pnpm --filter @repo/mcp-server lint`              | ✅ no warnings |
| `pnpm --filter whatsapp-worker check-types`        | ✅     |

### Smoke boot (no Redis, stub DB URL)

```
$ PORT=3399 DATABASE_URL=postgresql://stub:stub@… \
    node --import tsx/esm src/index.ts &
whatsapp-worker: REDIS_URL not set — running without queue consumers …
whatsapp-worker listening on :3399
$ curl http://localhost:3399/health
{"ok":true,"service":"whatsapp-worker"}
```

The new code paths are dormant at boot; the registry just gains
three new tools and the worker gains a new state branch — no extra
env vars required beyond Phase 6.

## Test plan — for operator to run via real WhatsApp

I deliberately did NOT make Gemini calls myself for Phase 7 (per
operator instruction; also, the free-tier 5 RPM cap on
`gemini-2.5-flash` makes synthetic batched runs noisy). The five
test cases below cover the hard-rule surface; document each result
under "Outcomes" once executed against the deployed worker.

Pre-reqs:

- Phase 6 + Phase 7 build deployed to Railway.
- Vendor `00ae5ee1-754c-4816-870a-18666e8a0bf9` (AliBaba) — phone
  `+923154333909`. Replace with whichever vendor you're using.
- A real product on that vendor with a known SKU. Reading from the
  current dev DB, `SH-1042` is a placeholder; substitute an actual
  SKU from `/admin/products` if it doesn't exist. (Phase 4 used
  AliBaba which has 85 products.)
- Read the product's current price + stock from `/admin/products`
  before testing so you can verify "from X to Y" deltas.

### Case 1 — Price update happy path

```
Vendor → bot:  "Update SH-1042 price to 450"
Bot → vendor:  "Update <name> (SH-1042) price from Rs. <old> to Rs. 450?
                Reply YES to confirm or NO to cancel."
Vendor → bot:  "han"
Bot → vendor:  "Done — updated <name> (SH-1042) price to Rs. 450."
```

Verify:

- `whatsapp_conversations.state` flips to `awaiting_confirmation`
  after the first message and back to `idle` after the YES.
- `whatsapp_conversations.pending_action` is set with the
  `expires_at`, `invalidAttempts: 0`, `language: 'en'`.
- After YES, `products.pack_wholesale_price_cents` = 45000 for that
  product (450 rupees × 100).
- The inbound row for the first message has `tool_calls` with
  `update_product_price` and `tool_results[0].stage === 'preview'`.
- The inbound row for the YES message has `tool_calls` with the
  stored input replayed and `tool_results[0].stage === 'execute'`.

### Case 2 — Idempotency catches duplicate

```
Vendor → bot:  "Update SH-1042 price to 500"
Bot:           confirmation prompt
Vendor → bot:  "yes"
Bot:           "Done — updated <name> (SH-1042) price to Rs. 500."
   (within 60 s)
Vendor → bot:  "Update SH-1042 price to 500"
Bot:           confirmation prompt
Vendor → bot:  "yes"
Bot:           "Done — updated <name> (SH-1042) price to Rs. 500."
```

Verify:

- Row in `whatsapp_idempotency` keyed
  `<phone>:update_product_price:<hash>` with `expiresAt ≈ now + 60s`.
- Second YES does NOT issue a fresh `UPDATE products …` — the row's
  `updated_at` is unchanged from the first run. (Inspect by reading
  `products.updated_at` before and after the second YES.)
- Second YES still returns the same applied reply text — vendor
  perception is identical.

### Case 3 — Cancel path

```
Vendor → bot:  "Update SH-1042 price to 999"
Bot:           confirmation prompt
Vendor → bot:  "nahi"
Bot:           "Cancelled. Koi update nahi hua."
                  (or "Cancelled." if the original message was
                   English-flavored)
```

Verify:

- `pack_wholesale_price_cents` is unchanged.
- `whatsapp_conversations.pending_action` is null after the NO.

### Case 4 — Roman Urdu stock update + matching tone

```
Vendor → bot:  "SH-1042 ka stock 100 kar do"
Bot:           "<name> (SH-1042) ka stock <old> se 100 kar dein?
                YES likhain confirm ke liye, NO cancel ke liye."
Vendor → bot:  "haan"
Bot:           "Done — <name> (SH-1042) ka stock 100 kar diya."
```

Verify:

- `pending_action.language === 'ur-roman'`.
- `products.stock` = 100 for that product.

### Case 5 — Expiry (5+ minutes) + interruption nudge

Two sub-cases in one thread:

**5a — interruption while awaiting:**

```
Vendor → bot:  "Update SH-1042 price to 600"
Bot:           confirmation prompt
Vendor → bot:  "what's my pending order count"     (off-topic)
Bot:           "Reply YES or NO to the previous question."
                  (counter == 1)
Vendor → bot:  "show me orders"
Bot:           "Reply YES or NO to the previous question."
                  (counter == 2)
Vendor → bot:  "actually"
Bot:           "Cancelled — too many invalid replies."
                  (counter == 3 → auto-cancel)
```

Verify each step's `pending_action.invalidAttempts` increments and
the third invalid clears the row. No Gemini call fires for the
invalid replies — token columns on those inbound rows are null.

**5b — expiry:**

```
Vendor → bot:  "Update SH-1042 price to 700"
Bot:           confirmation prompt
   (wait 6 minutes)
Vendor → bot:  "yes"
Bot:           "That confirmation expired. Please try again."
```

Verify:

- `pack_wholesale_price_cents` is unchanged.
- The "yes" message's inbound row has no `tool_calls` — the YES
  matcher didn't run because the action expired before parse.
- `pending_action` cleared after the expired check.

### Outcomes — to be filled after testing

```
Case 1 (price happy path):     [ ]
Case 2 (idempotency):          [ ]
Case 3 (cancel):               [ ]
Case 4 (Roman Urdu stock):     [ ]
Case 5a (invalid → autocancel):[ ]
Case 5b (expiry):              [ ]
```

(Capture `whatsapp_conversations.pending_action`,
`whatsapp_idempotency` rows, and `products.updated_at` deltas with
each case so we have a paper trail when this surface graduates to
production.)

## Hard-rule check

- ✅ **No write happens without confirmation.** The Gemini path runs
  `previewUpdateProduct…` (a service-layer SELECT), then stores
  `pending_action`. Execution only happens inside the YES branch of
  `handleAwaitingConfirmation` and that branch is unreachable
  unless `state === 'awaiting_confirmation'` AND the pending action
  parses AND it hasn't expired AND `parseConfirmationReply` returns
  `'yes'`.
- ✅ **Confirmation expires in 5 min.** `CONFIRMATION_TTL_MS =
5 * 60 * 1000`; `setPendingAction` writes `expires_at = now() + TTL`
  and `isExpired(action)` is the first check inside the YES/NO gate.
- ✅ **Idempotency on every write call.** Each write tool's
  `index.ts` registers `wrapWithIdempotency(tool)` — the un-wrapped
  tool is never put into the registry. The registry's `callTool`
  always invokes the wrapped handler.
- ✅ **Vendor never specifies vendorId.** All three input schemas
  exclude any identity field. `runPreview` and `callTool` both pass
  `subjectId` only via `ctx`.
- ✅ **Confirmation message generation does NOT call Gemini.**
  `runGeminiVendorFlow` returns immediately after `setPendingAction`
  with `awaitingConfirmation: true` — the follow-up `runVendorFollowupTurn`
  is skipped on the write happy path. The YES/NO/expired/invalid
  responses are also all built locally.

## Gaps & flags for future phases

- **Display-id resolution for `update_order_status`.** Today the
  tool only accepts the sub-order UUID. If the vendor messages
  "mark ORD-MOQOIOIE-M3MX as packed", Gemini will pass that string
  to `orderId`, the preview lookup will throw `NotFoundError`, and
  Gemini's follow-up will surface the error. A small resolver from
  `orders.display_id → sub_orders.id` for `vendorId` would close
  this. Carry-over from Phase 4.
- **Pending-action lock between worker concurrency.** The state
  machine is per-conversation, but the BullMQ worker uses
  `concurrency: 5`. Two inbound jobs for the same phone could race
  the gate (e.g. vendor sends "yes" twice quickly). The
  idempotency layer absorbs the double-execute, but the *invalid
  attempts counter* could go negative-noise if the first job sees
  state = idle (post-clear) and the second still sees
  awaiting_confirmation. Not load-bearing today; consider a
  per-conversation Redis lock when concurrency × volume goes up.
- **No retry on transient Gemini 5xx still applies** — same as
  Phase 6. A confirmation prompt is already deterministic so a 503
  on the *initial* turn (the one that produces the function call)
  is the only window where a 5xx affects the write path.
- **`orderId` enum is currently `'packed' | 'handed_to_courier'`**
  on the tool surface, but the underlying service still validates
  the `pending → packed → handed_to_courier` chain. Telling Gemini
  the user can ask for `'cancelled'` would lead to a tool input
  that gets rejected by the service with `InvalidStateError`. The
  enum on the tool surface is the safe minimum — extend when the
  service exposes more transitions.
- **Test framework still missing.** The worker still has no Vitest
  rig; this phase's verification is structural (type-check, lint)
  + the operator-driven plan above. Bring Vitest + a Postgres
  container in the next tooling batch and fixturize:
    - The YES/NO matcher (English + Roman Urdu).
    - `runPreview` for each tool against a seeded vendor.
    - The full pre-LLM gate against a fixed `pending_action` row.
- **Roman Urdu detector is naive** — token allowlist, no morphology.
  Will misclassify English messages like "set the price to 1000"
  (no Roman Urdu cues → en, correct) but also "kindly do this" (no
  cues → en, also correct). Acceptable for now; revisit if vendors
  start mixing scripts inside one message.

## Stop point

Stopping after this log per the phase instructions. Phase 8 (or
whatever follows) inherits a worker that:

- exposes 3 read tools + 3 write tools to vendors,
- never executes a write without a YES,
- pays Gemini tokens only for the *initial* turn on write actions,
- caches write results for 60 s by `<phone>:<tool>:<input>`,
- speaks back in the user's last language flavor.
