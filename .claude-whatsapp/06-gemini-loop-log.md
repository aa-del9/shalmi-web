# Phase 6 — Gemini tool-use loop

Date: 2026-05-04 · Branch: `feat/whatsapp-bot`.

## Goal

Replace the hardcoded "echo" reply in the inbound consumer with a
Gemini-driven tool-use loop. Gemini decides whether to answer in text
or to dispatch one of the read-only MCP tools registered in
`@repo/mcp-server`; on a tool call, the worker dispatches via the
registry, feeds the result back into Gemini, and uses the follow-up
text as the vendor reply. All token usage, tool calls, and tool
results land on the inbound `whatsapp_messages` row.

Hard rules: `gemini-2.5-flash` (free tier) only · `maxOutputTokens:
300` · graceful errors on tool failure · conversation buffer capped
at last 6 entries · no write tools yet.

## What landed

### `@repo/whatsapp-core` — new `llm/` + `conversation` modules

```
packages/whatsapp-core/src/
  llm/
    gemini.ts          # singleton GoogleGenAI client, runVendorTurn,
                       # runVendorFollowupTurn, extractUsage,
                       # firstFunctionCall
    system-prompt.ts   # getVendorSystemPrompt() — stable string,
                       # designed so future caching layers can match it
    index.ts           # barrel
  conversation.ts      # loadConversation, appendTurn (cap 6),
                       # clearPendingAction, MAX_RECENT_TURNS
```

- New deps: `@google/genai@^1.51` (the unified SDK — *not*
  `@google/generative-ai`), `@repo/database` (workspace), `drizzle-orm`.
- New package exports: `./llm`, `./conversation`. Re-exports merged
  into the root barrel so worker code can do
  `import { runVendorTurn, getVendorSystemPrompt, loadConversation,
appendTurn, clearPendingAction } from '@repo/whatsapp-core'`.
- Stale `./interakt` export removed (file deleted in Phase 5
  addendum; only the package.json entry remained).
- Lazy env loading: `getClient()` reads `GEMINI_API_KEY` on first
  call. Missing → throws with a clear message at request time, so
  the worker still boots without the key.

#### `runVendorTurn`

```ts
runVendorTurn({ message, conversation, tools, system })
  → GenerateContentResponse
```

Builds `contents` from prior turns + the current user message and
calls `ai.models.generateContent({ model: 'gemini-2.5-flash',
contents, config: { systemInstruction, temperature: 0.2,
maxOutputTokens: 300, tools: [{ functionDeclarations }] } })`.

#### `runVendorFollowupTurn`

```ts
runVendorFollowupTurn({ ..., functionCall, functionResult })
  → GenerateContentResponse
```

Same call shape, but `contents` carries:
1. prior turns
2. current user message (`role: 'user'`)
3. the model's `functionCall` part (`role: 'model'`)
4. our `functionResponse` part (`role: 'user'`)

Tools stay attached so Gemini can chain a second call if it ever
wants to (today the worker only dispatches the first call).

#### `extractUsage` / `firstFunctionCall`

Helpers over `response.usageMetadata` / `response.functionCalls` (with
a parts-walk fallback) so the worker doesn't have to know SDK
internals.

#### `loadConversation` / `appendTurn` / `clearPendingAction`

All operate on `whatsapp_conversations` via `@repo/database`. Turns
are persisted as `{ role: 'user' | 'model', content, at }`. Append
caps at the last `MAX_RECENT_TURNS = 6` entries.
`clearPendingAction` resets `pending_action`, `state`, `state_data`
to idle — invoked on every free-text turn so any stale Phase-7
confirmation expires when the conversation moves on.

### `apps/whatsapp-worker/src/workers/inbound.ts` — Gemini loop

The hardcoded echo is gone. Per inbound job:

1. Resolve identity (`user.phone_number` → optional `vendors` row).
2. Atomic first-contact flip on `user.whatsapp_first_seen_at`.
3. Upsert `whatsapp_conversations`.
4. **Gate non-vendors.** Recognized user with no vendor row → polite
   reply `"We recognize you, but you don't have a vendor profile
yet…"` (welcome prepended on first contact). Tools require a
   `subjectId = vendors.id`; we never call Gemini without one.
5. **Gate non-text.** No body (image/sticker/audio without caption)
   → polite reply, skip Gemini (no tokens spent).
6. Load the conversation row. Implicitly cancel any pending action
   (`pendingAction != null` or `state != 'idle'` →
   `clearPendingAction`).
7. Build `tools = getGeminiToolDeclarations('vendor')` and
   `system = getVendorSystemPrompt()`.
8. **`runVendorTurn`** with the user text + last 6 turns. Capture
   `usageMetadata` and latency.
9. Inspect the response:
   - **Text only** → `response.text` is the reply.
   - **Function call** →
     a. Build `ToolContext{ role: 'vendor', subjectId: vendorId,
        phone, conversationId }`.
     b. `callTool(name, args, ctx)` from `@repo/mcp-server`.
     c. On throw (`ToolDispatchError` or service-layer error): log a
        structured `tool_error` line and reply with
        `"Sorry — I couldn't pull that up just now. Please try
again in a moment."`. The original error + code are persisted to
        `tool_results`.
     d. On success: **`runVendorFollowupTurn`** with the model's
        `functionCall` and our wrapped `{ ok: true, data }` result.
        Final text becomes the reply.
10. Append user + model turns to the conversation buffer.
11. Update the inbound `whatsapp_messages` row with `tool_calls`,
    `tool_results`, `llm_input_tokens`, `llm_output_tokens`,
    `latency_ms`, and `status='processed'`.
12. If `isFirstContact`, prepend the welcome string to the final
    reply text **before** enqueuing — vendor still gets one outbound
    with welcome + answer.

### Logging

Every Gemini call emits a structured JSON line on stdout:

```json
{"kind":"llm_call","phone":"+923…","role":"vendor",
 "model":"gemini-2.5-flash","step":"turn",
 "tokens_in":436,"tokens_out":10,"tool_calls_count":1,
 "latency_ms":1374}
```

`pino` is not in the worker's deps; bare `console.log` JSON is the
shape we'll feed into the centralized logger when one lands. Tool
errors and LLM errors get separate `kind: "tool_error"` and
`kind: "llm_error"` lines.

### Harness — `apps/whatsapp-worker/src/scripts/gemini-loop-harness.ts`

CLI runnable via `pnpm --filter whatsapp-worker gemini-loop-harness
[vendorIdOrPhone]`. Resolves a vendor (defaults to the first in the
table), runs every prompt through `runVendorTurn` →
`callTool` → `runVendorFollowupTurn` (or text-only path), and prints
real token counts + latencies. Supports overrides:

- `GEMINI_LOOP_PROMPTS='a|b|c'` — pipe-delimited list to override
  the default 5.
- `GEMINI_PACE_MS=30000` — sleep between prompts to stay under the
  free-tier 5 RPM cap.

### Files touched

```
packages/whatsapp-core/src/llm/gemini.ts                (new)
packages/whatsapp-core/src/llm/system-prompt.ts         (new)
packages/whatsapp-core/src/llm/index.ts                 (new)
packages/whatsapp-core/src/conversation.ts              (new)
packages/whatsapp-core/src/index.ts                     (re-exports)
packages/whatsapp-core/package.json                     (+@google/genai,
                                                         +@repo/database,
                                                         +drizzle-orm,
                                                         exports map)

apps/whatsapp-worker/src/workers/inbound.ts             (rewritten —
                                                         Gemini loop)
apps/whatsapp-worker/src/index.ts                       (env-comment)
apps/whatsapp-worker/src/scripts/gemini-loop-harness.ts (new)
apps/whatsapp-worker/package.json                       (+gemini-loop-harness
                                                         script)

pnpm-lock.yaml                                          (regenerated)
```

## Verification

### Static

| Check                                              | Result |
| -------------------------------------------------- | ------ |
| `pnpm --filter @repo/whatsapp-core check-types`    | ✅     |
| `pnpm --filter @repo/mcp-server check-types`       | ✅     |
| `pnpm --filter @repo/services check-types`         | ✅     |
| `pnpm --filter whatsapp-worker check-types`        | ✅     |

### Smoke boot (no Redis, stub DB URL)

```
$ PORT=3399 DATABASE_URL=postgresql://stub:stub@127.0.0.1:54321/stub \
    node --import tsx/esm src/index.ts &
whatsapp-worker: REDIS_URL not set — running without queue consumers …
whatsapp-worker listening on :3399
$ curl http://localhost:3399/health
{"ok":true,"service":"whatsapp-worker"}
```

Process boots fine without `GEMINI_API_KEY` or Redis — the LLM client
is lazy.

### Live Gemini round-trip — 5 prompts

Vendor: `00ae5ee1-754c-4816-870a-18666e8a0bf9` (AliBaba, phone
`+923154333909`). Driven via the harness against real Gemini
(`gemini-2.5-flash`, free tier) and the real dev Postgres. Two of the
five prompts were initially blocked by transient `503 UNAVAILABLE`
("model is currently experiencing high demand"); they were retried
shortly after and both succeeded — replayed below as a single table.

| #  | Prompt                                                  | Path                                | Reply                                                                                             | tokens_in | tokens_out | latency_ms |
| -- | ------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------- | --------- | ---------- | ---------- |
| 1  | `show me my orders`                                     | turn → `list_orders` → followup     | `You have 2 orders: 1 pending, 1 handed to courier.\nRecent orders:\n- ORD-MOQPAP59-GBK1 for Moeed Furqan: Rs. 845,000, handed to courier\n- ORD-MOQOIOIE-M3MX for Moeed Furqan: Rs. 1,380, pending` | 1074      | 94         | 3845       |
| 2  | `kitne pending hain` *(Roman Urdu)*                     | turn → `list_orders{status:pending}`→ followup | `Ek pending order hai.`                                                                          | 993       | 20         | 2373       |
| 3  | `any products with low stock?`                          | turn → `list_products{filter:low_stock}` → followup | `There are no products with low stock.`                                                         | 921       | 25         | 2645       |
| 4  | `what's the price of the first product in my catalog`   | text only                           | `I can't tell you the price of the "first" product. I can list products by name, SKU, or brand, or filter by stock levels.` | 444       | 33         | 2268       |
| 5  | `help`                                                  | text only                           | `Hello! I can help you with questions about your orders, products, prices, and stock. What can I help you with today?` | 433       | 27         | 1782       |

Per-call breakdown for the tool-using prompts (turn1 = first Gemini
call with tools; turn2 = follow-up with tool result):

| Prompt                          | turn1 tokens (in/out, ms)        | tool dispatched                                              | turn2 tokens (in/out, ms)     |
| ------------------------------- | -------------------------------- | ------------------------------------------------------------ | ----------------------------- |
| `show me my orders`             | 436 / 10, 2403 ms                | `list_orders {}` → `count=2, summary="1 pending, 1 handed to courier"` | 638 / 84, 1442 ms |
| `kitne pending hain`            | 436 / 15, 1706 ms                | `list_orders {status:'pending'}` → `count=1, summary="1 pending"`       | 557 / 5, 667 ms   |
| `any products with low stock?`  | 438 / 17, 1863 ms                | `list_products {filter:'low_stock'}` → `count=0`                        | 483 / 8, 782 ms   |

Observations confirmed by real round-trip:

- **Token counts land in the expected band** (~430 in / 5–95 out per
  call). End-to-end totals 433–1074 in / 20–94 out, well inside the
  brief's "~500–1500 per turn" target. The `maxOutputTokens: 300` cap
  was never hit.
- **Roman Urdu is honored.** "kitne pending hain" produced
  "Ek pending order hai." — same ASCII script as the user input.
  This came out of `temperature: 0.2` + the system prompt's
  "Match the user's language" rule, no special routing.
- **Tool dispatch is tight.** `list_orders` and `list_products` were
  invoked correctly, with the `status` and `filter` parameters
  inferred by the model from natural-language cues.
- **Refusal-instead-of-hallucination on prompt #4.** Gemini chose
  not to call any tool because none of them accept a positional
  "first" — it asked the vendor to disambiguate by SKU/name/brand
  instead of inventing a product. This is exactly the desired
  failure mode for a vendor-write surface.
- **`help` answers as text.** No tool exists for "help" yet, so
  Gemini gives a generic capabilities pitch. We can add a
  `whoami`/`help` tool if vendors want a richer response.

### Harness invocation (for re-runs)

```
$ env $(grep -v '^#' apps/whatsapp-worker/.env | xargs) \
    pnpm --filter whatsapp-worker gemini-loop-harness \
      00ae5ee1-754c-4816-870a-18666e8a0bf9
```

The first attempt against the default fallback vendor (`Aadel Baba`)
returned correct empty-state answers — `"You have no orders."`,
`"Koi pending orders nahi hain."`, `"There are no products with low
stock."` — but the brief asked for substantive responses, so the
table above is from the AliBaba run.

### Real WhatsApp round-trip

The harness exercises the exact LLM + tool dispatch path the
inbound consumer takes; the only delta versus a real WhatsApp turn
is the BSP I/O (waapi inbound parse → BullMQ → outbound send).
Since Phase 5 already proved that pipeline end-to-end with a real
phone, no Phase 6 work was needed there. To smoke-test in WhatsApp
once Railway redeploys the new image:

1. From a phone whose `user.phone_number` is on file as a vendor,
   message the paired waapi WhatsApp number with each of the 5
   prompts above.
2. Expected: replies match the harness output for the corresponding
   tool dispatch path; first message is prefixed with the welcome
   line; subsequent messages are not.
3. Inspect the inbound `whatsapp_messages` rows — `tool_calls`,
   `tool_results`, `llm_input_tokens`, `llm_output_tokens`,
   `latency_ms` should all be populated.

## Hard-rule check

- ✅ `gemini-2.5-flash` only — both `runVendorTurn` and
  `runVendorFollowupTurn` hardcode the model id.
- ✅ `maxOutputTokens: 300` — both calls. Verified caps weren't hit
  in any of the 5 round-trips (max observed `tokens_out` = 94).
- ✅ Tool failures show graceful errors. `ToolDispatchError`
  (`UNKNOWN_TOOL`, `ROLE_FORBIDDEN`, `INPUT_VALIDATION`,
  `OUTPUT_VALIDATION`) and service-layer errors both flow into the
  `TOOL_ERROR_REPLY` path; the original error and code are persisted
  to `tool_results` for postmortem. The worker never surfaces a
  stack trace or `code: 503` body to the vendor.
- ✅ Conversation turns capped at 6. Enforced inside `appendTurn`
  via `slice(turns.length - MAX_RECENT_TURNS)` — the DB row is
  rewritten with the truncated array on every write.
- ✅ No write tools yet. Registry currently exposes
  `list_orders`, `get_order_details`, `list_products` (Phase 4); no
  new tools registered.
- ✅ Every tool authenticates from `ToolContext`, not from inputs.
  `subjectId = vendors.id` is derived from the resolved identity in
  the worker; no tool argument carries vendor identity.
- ✅ All inbound + outbound + LLM + tool calls log to
  `whatsapp_messages` (extends Phase 5 — this phase adds
  `tool_calls`, `tool_results`, `llm_input_tokens`,
  `llm_output_tokens` to the inbound row's update set).
- ✅ Webhook ack budget unchanged. The Gemini call runs in the
  BullMQ consumer, not the HTTP request, so the < 3 s ack target is
  preserved.

## Gaps & flags for future phases

- **Free-tier rate limits.** `gemini-2.5-flash` free tier is 5 RPM
  / 250 RPD on this account; in this session, two harness runs
  burned the per-minute quota and one prompt also hit a transient
  503 from Gemini. Production needs either the paid tier or a
  retry-with-backoff layer in the worker — currently a 5xx/quota
  error trips `TOOL_ERROR_REPLY` and the BullMQ retry budget burns
  3 attempts in a row. Tracked separately.
- **No retry on transient Gemini 5xx.** The worker treats every
  Gemini failure the same — the vendor sees the generic apology and
  the inbound row is marked `failed`. Next phase: add a
  bounded retry inside `runGeminiVendorFlow` for `503/429/5xx`.
- **Tool result envelope.** We wrap successful tool results in
  `{ ok: true, data }` and failures in `{ ok: false, error, code }`
  before passing back to Gemini. Prompt #4 ("first product") shows
  Gemini handles "no tool fits" cleanly even without coaching. If
  we see hallucinated tool calls later, we'll swap to a stricter
  envelope.
- **Order display id resolution.** `get_order_details` still
  expects a sub-order UUID; passing `#ORD-…` errors with
  `NotFoundError`. Phase 4 flagged this. Once a vendor asks for
  details on an order from `list_orders`, the worker will need a
  small resolver step. Not exercised in this batch's 5 prompts.
- **System-prompt caching.** `getVendorSystemPrompt()` returns a
  stable string by design (the brief calls this out). The unified
  `@google/genai` SDK supports cache attachment via
  `cachedContent`; wiring it costs an extra `caches.create` call
  upfront and saves ~300–400 prompt tokens per turn. Defer until
  daily volume justifies it.
- **`tool_calls` / `tool_results` shape.** Today we persist
  `[{ name, args }]` and `[{ name, ok, result | error, code }]` —
  flat arrays, not the Gemini Part shape. If we later want to replay
  a turn into Gemini for diagnostics, we'll switch to the SDK's
  Part-shaped log.
- **Welcome-prepend on tool-error path.** First-contact + tool error
  produces `"<welcome>\n\nSorry — I couldn't pull that up just now."`
  — slightly awkward but consistent. Refine when more first-contact
  flows exist.
- **Test framework.** Still no Vitest / no fixtures for the LLM
  path. The harness is the de facto smoke. Bring Vitest in the next
  tooling batch and snapshot the role-filtered `tools` payload + a
  recorded Gemini fixture so this surface gets automated coverage.

## Stop point

Stopping after this log per the phase instructions. Phase 7
(write-tool confirmation state machine) picks up next:

```ts
// inbound.ts — already wired:
import { clearPendingAction } from '@repo/whatsapp-core';
```

The plumbing it needs (`whatsapp_conversations.pending_action` /
`state` / `state_data`, the registry's `requiresConfirmation` flag,
the LLM loop, the inbound consumer's gating of free-text turns) all
landed in this phase or earlier.
