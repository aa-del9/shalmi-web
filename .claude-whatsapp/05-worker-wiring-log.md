# Phase 5 — worker wiring (Interakt round-trip, no LLM)

Date: 2026-05-04 · Branch: `feat/whatsapp-bot`.

## Goal

Wire `apps/whatsapp-worker` to the Interakt BSP end-to-end: receive
inbound webhook events, dedupe + enqueue, drive a hardcoded vendor
reply through the outbound queue, send via Interakt's REST API.
Phase 6 swaps the hardcoded echo for the Gemini tool-use loop.

## What landed

### `packages/whatsapp-core` — phone helpers, types, Interakt client

Three new modules + a new exports map. The package was previously a
TODO stub.

- `src/types.ts` — shared types:
  - `InboundMessage { phone, metaMessageId, body, messageType,
    rawPayload, receivedAt }`
  - `OutboundMessage { messageId, status }`
  - `InboundJobPayload { message }` and
    `OutboundJobPayload { phoneE164, body, userId?,
    inReplyToMessageId? }` for BullMQ.
  - `InboundMessageType` union covers `text | image | audio | video |
    document | sticker | location | contacts | interactive | button |
    template_reply | unknown`.
- `src/phone.ts` — three exports:
  - `normalizeToE164(input)` — handles `03001234567` /
    `923001234567` / `+923001234567` / `0092 300 1234567` /
    spaces / dashes / parens. Default country is Pakistan (+92).
    Throws when the result fails the `^\+[1-9]\d{6,14}$` E.164
    regex.
  - `splitE164(e164)` — returns
    `{ countryCode, phoneNumber }` for Interakt's REST API. Uses a
    longest-match table of common country codes (BD, AE, SA, PK, IN,
    TR, DE, UK, ES, FR, NL, US/CA). Falls back to a 2-digit slice if
    no match — surfaces unknown country codes as a noisy default
    rather than silently mis-routing.
  - `parseInteraktInbound(payload)` — joins
    `data.customer.country_code + data.customer.phone_number` →
    normalized E.164, picks `data.message.id` (with
    `data.message.message_id` fallback), classifies the
    message type from the `data.message.message.*` shape, extracts
    a body string for text / caption / interactive replies / button
    payloads. Throws on missing customer or missing message id.
    `rawPayload` is preserved verbatim for audit + future extraction.
- `src/interakt-client.ts` — REST client. Lazy env loading: every
  helper reads `process.env.INTERAKT_*` inside the function, never
  at module top.
  - `sendTextMessage({ phoneE164, body, callbackData? })` — POSTs
    `{ countryCode, phoneNumber, type: 'Text', data: { message } }`
    with `Authorization: Basic ${INTERAKT_API_KEY}`. Returns
    `{ messageId, status }`.
  - `sendTemplateMessage({ phoneE164, templateName, languageCode,
    headerValues?, bodyValues?, buttonValues?, fileName?,
    callbackData? })` — POSTs the `type: 'Template'` shape so future
    proactive notifications (Phase 7+) can call this without further
    plumbing. Not invoked in Phase 5.
  - `verifyWebhookSignature({ rawBody, signatureHeader })` —
    computes `sha256=` + hex(HMAC_SHA256(secret, rawBody)) and
    compares constant-time via `crypto.timingSafeEqual`. Accepts
    the header as `sha256=<hex>` or bare `<hex>`. Returns false (no
    throw) when secret/header missing — the route handler converts
    that to 401.
  - Errors: `InteraktConfigError` (missing env), `InteraktApiError`
    (non-2xx or `result: false`). The latter carries
    `isOutsideWindow: boolean` for "tried to message outside the
    24-hour customer service window" so the outbound consumer can
    fail unrecoverably rather than retry.

`packages/whatsapp-core/package.json` exports map: `.`, `./phone`,
`./interakt`, `./types`. Adds `zod` as a runtime dep (reserved for
future inbound parsing) and `@types/node` for `node:crypto`. Lint
script removed for now — the harness's config-protection hook blocks
adding a new `eslint.config.js`; type-check is gating instead.

### `apps/whatsapp-worker` — Hono server, queues, two BullMQ workers

```
apps/whatsapp-worker/src/
  index.ts                # bootstrap: serve Hono app, start workers,
                          # register SIGTERM/SIGINT shutdown
  webhook.ts              # buildApp(): GET /health, GET+POST
                          # /webhook/whatsapp, POST /internal/send-message
  queues/index.ts         # lazy IORedis + BullMQ Queue factories
                          # (inbound + outbound)
  workers/inbound.ts      # 5x concurrent consumer for the inbound
                          # queue
  workers/outbound.ts     # 5x concurrent consumer for the outbound
                          # queue
```

#### `queues/index.ts`

Single shared `Redis` connection (`maxRetriesPerRequest: null`,
`enableReadyCheck: false` — BullMQ requirements). Two queues:
`whatsapp:inbound`, `whatsapp:outbound`. Default job options: 3
attempts, exponential backoff starting at 2 s, jobs auto-pruned at 24 h
(complete) / 7 d (failed). Redis URL is read inside the factory so
`getInboundQueue()` etc. throw with a clear message instead of crashing
boot.

`closeQueues()` drains and quits the connection — wired to the
SIGTERM/SIGINT shutdown path.

#### `workers/inbound.ts`

Consumer for `whatsapp:inbound`. Each job carries the
`InboundMessage` produced by the webhook handler. Steps:

1. **Resolve identity** by E.164 phone via
   `LEFT JOIN vendors ON vendors.user_id = user.id` so non-vendor
   users still get the welcome path when they message us.
2. **Unrecognized phone**: mark the inbound row `processed`,
   enqueue a single outbound `"We don't recognize this number.
   Please contact Shalmi support."` reply, and stop. The inbound
   row's `user_id` stays null so `/admin/whatsapp-unrecognized`
   surfaces it.
3. **Atomic first-contact flip** — single SQL:

   ```sql
   UPDATE "user"
   SET whatsapp_first_seen_at = now(),
       whatsapp_last_seen_at  = now()
   WHERE id = ? AND whatsapp_first_seen_at IS NULL
   RETURNING id
   ```

   When a row comes back, this is the first contact. Otherwise we
   `UPDATE … SET whatsapp_last_seen_at = now()`. Race-safe even
   under concurrent inbound jobs.
4. **`whatsapp_conversations` upsert**: SELECT-by-phone, then
   INSERT (with `onConflictDoUpdate(target=phone)`) or UPDATE the
   existing row. Sets `userId`, bumps `lastMessageAt` /
   `updatedAt`, defaults role to `'vendor'`, state to `'idle'`.
5. **Update inbound `whatsapp_messages` row** with `userId` and
   `status='processed'`.
6. **Build the hardcoded reply**:
   - `welcome = "Hi <shopName/name/'there'>, this is Shalmi. You can
     ask about your orders, update stock and prices, change order
     status, and more. Type 'help' anytime to see what I can do."`
   - `echo = 'You said: "<body>". The bot brain is coming online
     soon.'` — falls back to `"Got your message. The bot brain is
     coming online soon."` when the inbound has no text body
     (image without caption, sticker, etc.).
   - First contact → `welcome + "\n\n" + echo`. Otherwise just
     `echo`.
7. **Enqueue outbound** with the reply and `userId`.

`worker.on('failed')` logs the job id + error.

#### `workers/outbound.ts`

Consumer for `whatsapp:outbound`. Each job is an
`OutboundJobPayload`. Steps:

1. **INSERT pending row** in `whatsapp_messages`
   (`direction='outbound'`, `status='pending'`, `body`, `userId`).
2. **Call `sendTextMessage`**.
3. **On success**: UPDATE the row with `metaMessageId` (Interakt's
   id), `status='sent'`, `latencyMs`.
4. **On failure**: UPDATE the row with `error` (truncated 1 KB),
   `latencyMs`, and `status='failed'` (or
   `'failed_outside_window'` when `InteraktApiError.isOutsideWindow`
   is true). Outside-window failures are wrapped in BullMQ's
   `UnrecoverableError` so they don't burn retry budget — vendor
   has to message us first to reopen the 24 h window. All other
   failures bubble for retry (3 attempts, exponential backoff).

#### `webhook.ts` — Hono app

- **`GET /health`** — `{ ok: true, service: 'whatsapp-worker' }`
  (Railway health probe).
- **`GET /webhook/whatsapp`** — `{ ok: true, hint: '…' }`. Interakt
  has no Meta-style verification handshake; this is purely a smoke
  probe.
- **`POST /webhook/whatsapp`** — verify signature → parse JSON →
  dedupe → log inbound → enqueue → 200. Skips events where
  `type !== 'message_received'` (template delivery / status
  callbacks ack 200 with `{ skipped }`). Reads the signature from
  either `Interakt-Signature` or `X-Interakt-Signature` (Interakt's
  docs vary). The whole handler runs under the 3 s ack budget when
  Postgres + Redis are healthy.
- **`POST /internal/send-message`** — gated by
  `x-internal-api-key` matching `INTERNAL_API_KEY`. Body
  `{ to, body }`. Normalizes `to` to E.164 then enqueues an
  outbound job. Returns 503 when the key isn't configured (so
  `apps/web` can detect a misconfigured environment instead of
  silently 401ing).

#### `index.ts` — bootstrap

- Starts the Hono server on `process.env.PORT || 3000`.
- Starts both BullMQ workers when `REDIS_URL` is set; logs a
  warning and continues without consumers when it isn't (the
  webhook can still ingest for diagnostics — useful while
  verifying the URL with Interakt before Redis is provisioned).
- SIGTERM / SIGINT handler closes both workers, drains the queue
  factory, and stops the HTTP server before exiting 0.

### Runtime resolution: tsx (not `node dist/`)

Every workspace package in this repo (`@repo/database`,
`@repo/services`, `@repo/mcp-server`, `@repo/whatsapp-core`, …)
exports `./src/*.ts` directly via its `package.json` `exports` map
— there's no compiled `dist/index.js` for cross-package consumers
to import. Native Node ESM can't resolve TS source.

Phase 5 fixes this for the worker by running it through `tsx` in
production:

- `apps/whatsapp-worker/package.json` — `tsx` moved from `dev` to
  runtime deps; `start` is now `tsx src/index.ts` (the `build`
  script still runs `tsc` for type-check + caches a dist for any
  future bundler).
- `apps/whatsapp-worker/Dockerfile` — runtime stage now ships the
  `src/` tree (and `tsconfig.json`) plus all transitive workspace
  package directories. The `CMD` is `node --import tsx/esm
  apps/whatsapp-worker/src/index.ts`.

Pre-existing transitive workspace deps (`packages/services`,
`packages/database`, `packages/utils`, `packages/constants`,
`packages/schemas`, `packages/types`) were already wired into the
Dockerfile in earlier phases; this phase keeps them and adds the
worker `src/` copy.

### Env / config

- `apps/whatsapp-worker/.env.example` rewritten to match the new
  shape: `REDIS_URL`, `INTERAKT_API_KEY`,
  `INTERAKT_BASE_URL` (defaults to
  `https://api.interakt.ai/v1/public/`),
  `INTERAKT_WEBHOOK_SECRET`, `INTERNAL_API_KEY`. The Meta WhatsApp
  Cloud variables (`WHATSAPP_*`) are dropped from the worker's env
  example since Interakt is the BSP — they remain in
  `turbo.json globalEnv` for now in case other surfaces still
  reference them.
- `turbo.json globalEnv` adds `REDIS_URL`, `INTERAKT_API_KEY`,
  `INTERAKT_BASE_URL`, `INTERAKT_WEBHOOK_SECRET`,
  `INTERNAL_API_KEY` so turbo doesn't strip them from caches.

## Files touched

```
apps/whatsapp-worker/.env.example                          (rewritten)
apps/whatsapp-worker/Dockerfile                            (CMD + COPY)
apps/whatsapp-worker/package.json                          (deps + start)
apps/whatsapp-worker/src/index.ts                          (bootstrap)
apps/whatsapp-worker/src/webhook.ts                        (new)
apps/whatsapp-worker/src/queues/index.ts                   (new)
apps/whatsapp-worker/src/workers/inbound.ts                (new)
apps/whatsapp-worker/src/workers/outbound.ts               (new)

packages/whatsapp-core/package.json                        (deps, exports)
packages/whatsapp-core/tsconfig.json                       (types: ['node'])
packages/whatsapp-core/src/index.ts                        (rewritten — barrel)
packages/whatsapp-core/src/types.ts                        (new)
packages/whatsapp-core/src/phone.ts                        (new)
packages/whatsapp-core/src/interakt-client.ts              (new)

turbo.json                                                 (+5 globalEnv vars)

pnpm-lock.yaml                                             (regenerated)
```

## Verification

### Static

| Check                                              | Result                                         |
| -------------------------------------------------- | ---------------------------------------------- |
| `pnpm --filter @repo/whatsapp-core check-types`    | ✅                                              |
| `pnpm --filter whatsapp-worker check-types`        | ✅                                              |
| `pnpm --filter @repo/services check-types`         | ✅ (no regression)                              |
| `pnpm --filter @repo/mcp-server check-types`       | ✅ (no regression)                              |
| `pnpm --filter web check-types`                    | ✅ (no regression)                              |
| `pnpm --filter web build`                          | ✅ — full Next.js 15 build                      |
| `pnpm --filter web lint`                           | ✅ no warnings                                  |
| `pnpm --filter @repo/services lint`                | ✅ no warnings                                  |
| `pnpm --filter @repo/mcp-server lint`              | ✅ no warnings                                  |

The pre-existing `TS2688: minimatch` problem in
`@repo/database` / `@repo/constants` / `@repo/schemas` /
`@repo/utils` (flagged in `02-schema-log.md` and
`03-service-extraction-log.md`) still reproduces and is still out
of scope. The worker, services, and mcp-server avoid it via
explicit `compilerOptions.types`.

### Runtime smoke (no Redis, no Interakt vars, stub DB URL)

```
$ PORT=3399 \
  DATABASE_URL=postgresql://stub:stub@127.0.0.1:54321/stub \
  node --import tsx/esm src/index.ts &

whatsapp-worker: REDIS_URL not set — running without queue consumers …
whatsapp-worker listening on :3399

$ curl http://localhost:3399/health
{"ok":true,"service":"whatsapp-worker"}

$ curl http://localhost:3399/webhook/whatsapp
{"ok":true,"hint":"POST events from Interakt only — Interakt has no GET handshake."}

$ curl -i -X POST -d '{"type":"message_received"}' \
       -H 'content-type: application/json' \
       http://localhost:3399/webhook/whatsapp
HTTP/1.1 401 Unauthorized
{"ok":false,"error":"invalid signature"}

$ curl -i -X POST http://localhost:3399/internal/send-message
HTTP/1.1 503 Service Unavailable
{"ok":false,"error":"INTERNAL_API_KEY not configured"}
```

The worker boots without `INTERAKT_*`, without `REDIS_URL`, and
with a non-routable `DATABASE_URL` — confirming the lazy-env
contract for Interakt + Redis. The DB is the only hard
boot-time dependency (the existing `@repo/database` client throws
when `DATABASE_URL` is missing — pre-existing pattern, owned by
that package).

### Signature-verification + payload parsing — pure unit check

```
03001234567       → +923001234567
923001234567      → +923001234567
+923001234567     → +923001234567
0300 123 4567     → +923001234567
00 92 300 1234567 → +923001234567

split +923001234567 → {"countryCode":"92","phoneNumber":"3001234567"}
split +12025551234  → {"countryCode":"1","phoneNumber":"2025551234"}

parseInteraktInbound({ ... })  → {
  phone: '+923001234567',
  metaMessageId: 'interakt-internal-id',
  body: 'hi',
  messageType: 'text',
  receivedAt: '2026-05-04T06:00:00Z',
  rawPayload: <verbatim>
}

valid signature       → true
wrong signature       → false
missing signature     → false
valid signature (bare hex, no 'sha256=' prefix) → true
```

### Live signature accept-path smoke (against stub DB)

POSTing a payload with a valid HMAC + the correct
`Interakt-Signature` header passes verification, parses,
attempts the dedupe SELECT, and fails at the database (because
the stub `DATABASE_URL` is unreachable). The stack trace shows
the request reached `webhook.ts:81` (the dedupe `select`),
proving the verify → parse → DB-touch path works:

```
DrizzleQueryError: select "id" from "whatsapp_messages"
where "whatsapp_messages"."meta_message_id" = $1 limit $2
  cause: connect ECONNREFUSED 127.0.0.1:54321
```

### Tests not yet captured

Phase 5 has no automated test suite (the repo doesn't have a test
framework wired in — confirmed in `00-codebase-map.md`). The
end-to-end Interakt → DB → reply round-trip is the deploy step
below.

## Interakt webhook configuration (manual, not code)

After Railway redeploys with the new `Dockerfile`, configure the
webhook in Interakt:

1. Settings → Developer Settings → Webhook Configuration
2. **Webhook URL**: `https://<railway-public-url>/webhook/whatsapp`
   (the exact public URL Railway assigns the worker service —
   capture in this log once known).
3. **Secret Key**: paste the value of `INTERAKT_WEBHOOK_SECRET`
   set in the Railway service's env (must match exactly).
4. **Subscribed events**: at minimum "Incoming Messages". Optional:
   "Template Delivery Status" — useful later for tracking the
   `whatsapp_messages.status` lifecycle of proactive notifications.
5. Save.

Document the URL + the exact event-subscription set here once
configured:

```
Webhook URL:       (TBD — fill after Railway deploys + Interakt config)
Subscribed events: (TBD)
```

## Local + deployed test plan

Until Railway redeploys, the worker has not been run against the
real Interakt webhook. Once deployed:

1. Hit `https://<railway-public-url>/health` — expect
   `{ ok: true, service: 'whatsapp-worker' }`.
2. Configure the webhook per the section above.
3. Pre-seed the test vendor's phone (E.164) into
   `user.phone_number` for a real vendor row.
4. **Test 1 — recognized vendor, first contact**: from the seeded
   phone, message Interakt's WhatsApp number. Expect:
   - Webhook hits Railway logs (`whatsapp-worker listening` is
     followed by request lines).
   - Inbound row in `whatsapp_messages` with `direction='inbound'`,
     `meta_message_id` populated, `status='processed'` after the
     consumer runs.
   - User row's `whatsapp_first_seen_at` flips to a timestamp.
   - WhatsApp client receives the welcome + echo combo.
5. **Test 2 — same vendor, second message**: send another text.
   Expect echo only (no welcome), no duplicate
   `whatsapp_first_seen_at` movement.
6. **Test 3 — unknown phone**: from a phone not on file, message
   Interakt. Expect:
   - The "We don't recognize this number…" reply.
   - An inbound row with `user_id IS NULL` visible at
     `/admin/whatsapp-unrecognized`.

Capture below once executed:

```
Sample Interakt inbound payload (from Railway logs):
  (TBD)

Test 1 (recognized, first contact): (TBD)
Test 2 (recognized, repeat):       (TBD)
Test 3 (unknown phone):             (TBD)
```

## Hard-rule check

- ✅ Webhook handler ack target is < 3 s. Path: signature verify
  (sync) → JSON parse → 1× SELECT (`whatsapp_messages` dedupe) →
  1× INSERT (inbound row) → BullMQ `Queue.add` (single Redis
  ZADD/HSET pipeline) → 200. No identity resolution / state
  upsert / outbound send happens inside the request — those run
  in the consumer.
- ✅ `Interakt-Signature` verification is mandatory on POST. 401
  on missing / mismatched. Constant-time compare via
  `timingSafeEqual` after length match.
- ✅ Dedupe by `metaMessageId` (the `data.message.id` field —
  Interakt's internal id, not the Meta `wamid`) before insert +
  enqueue. The job is also keyed by `metaMessageId` so BullMQ
  silently no-ops a same-id retry that races past the SELECT.
- ✅ Atomic first-contact flip — `WHERE id = ? AND
  whatsapp_first_seen_at IS NULL` with `RETURNING id`. Concurrent
  inbound jobs for the same user observe at most one
  `isFirstContact = true`.
- ✅ No LLM. The hardcoded welcome + echo is the entire reply
  generator.
- ✅ Lazy env loading for Interakt:
  `getInteraktConfig()` and `getWebhookSecret()` read
  `process.env` at call time. The worker boots when
  `INTERAKT_API_KEY` / `INTERAKT_WEBHOOK_SECRET` are missing —
  webhook POSTs return 401 (signature fail) and the outbound
  consumer fails the job loudly when it actually tries to send.
- ✅ Lazy env loading for Redis:
  `getRedisUrl()` reads at queue-construction time. The worker
  boots without `REDIS_URL` (logs a warning, skips workers).
- ✅ All inbound + outbound writes log to `whatsapp_messages`.

## Gaps & flags for future phases

- **`apps/web` → `/internal/send-message` glue.** The endpoint and
  the `INTERNAL_API_KEY` gate exist; no caller in `apps/web` uses
  it yet. Phase 7+ proactive notifications (e.g. order status
  changes) will fetch from `apps/web` server actions and POST here.
- **Outside-window detection** is best-effort (substring match on
  the response body for `"24"` + `"window"`, or `"re-engagement"`,
  or `"outside the customer service window"`). When the first
  real failure is captured from Interakt, tighten the matcher to
  the exact code/message they return.
- **Redis backpressure / connection retry policy.** Defaults plus
  BullMQ's reconnect logic. If Railway's Redis plugin starts
  flapping, we'll need explicit `retryStrategy` on `IORedis`.
- **Sub-order vs order vocabulary** (carried over from Phase 4) —
  not yet exercised because Phase 5 doesn't run any tools. Phase 6
  needs the resolver step.
- **Build artifact (`dist/`) vs `tsx` runtime.** The repo's
  workspace packages export TS source, so even after `tsc`
  emits to `dist/`, native Node ESM can't resolve cross-package
  imports. Running the worker through `tsx` in production
  (`node --import tsx/esm src/index.ts`) is the smallest fix that
  doesn't require building every workspace dep to JS. Future
  optimisation: bundle the worker with `esbuild` so the runtime
  image can drop `tsx` + `typescript`.
- **`raw body for HMAC`** — Hono's `c.req.text()` is called
  before any other body access; we never `c.req.json()` first
  (which would consume the stream). Don't reorder these in the
  webhook handler.
- **`whatsapp_conversations.recentTurns`** is initialized to `[]`.
  Phase 6 will start populating it as the LLM context buffer.
- **Test framework still missing.** The runtime smoke above is
  ad-hoc. Phase 7 or a dedicated tooling batch should bring in
  Vitest + a Postgres test container so this surface gets
  automated coverage.

## Stop point

Stopping after this log per the phase instructions. Phase 6 (LLM /
Gemini tool-use loop) wires the registry from
`@repo/mcp-server` into the inbound consumer in place of the
hardcoded echo:

```ts
import {
  getGeminiToolDeclarations,
  callTool,
  ToolDispatchError,
} from '@repo/mcp-server';
```

The plumbing it needs (`whatsapp_conversations.recent_turns`,
`whatsapp_messages.tool_calls / tool_results / llm_input_tokens /
llm_output_tokens`, the inbound + outbound queues, the Interakt
client) all landed in this phase.

---

## Addendum — BSP swapped from Interakt → waapi.app

Date: 2026-05-04 (same day, later).

### Why

Interakt's free trial doesn't include webhooks, and **inbound
customer-message webhooks are gated to their Advanced plan** (Growth
only enables outbound + delivery-status events). The user's webhook
configuration form was rejected by Interakt because of this gate.

waapi.app gives the same surface during a 3-day no-credit-card
trial and $10 USD/month per instance afterwards. Tradeoff: it's
**unofficial** (QR-paired WhatsApp Web automation under the hood,
likely `whatsapp-web.js` over Puppeteer) — long-term ban risk is real
and the bot needs a planned migration to an official BSP before it
becomes load-bearing for real vendors.

### What changed

Architecture stayed identical — only the BSP-adapter layer was
swapped.

- `packages/whatsapp-core/src/interakt-client.ts` **deleted**.
- `packages/whatsapp-core/src/waapi-client.ts` **new** —
  `sendTextMessage` (Bearer auth, `chatId: <digits>@c.us`),
  `setInstanceWebhook`, `getInstance`, `getInstanceClientStatus`,
  `verifyWebhookToken` (constant-time path-token compare),
  `parseWaapiInbound`, `readWaapiEventType`, `e164ToWaapiChatId`,
  typed `WaapiApiError` / `WaapiConfigError` / `WaapiInboundError`.
  Lazy env loading throughout (`WAAPI_*` reads inside functions, not
  module top).
- `packages/whatsapp-core/src/phone.ts` — Interakt-specific parser +
  types removed. Pure phone helpers remain (`normalizeToE164`,
  `isE164`, `splitE164`).
- `packages/whatsapp-core/src/index.ts` — re-exports the waapi
  surface. `splitE164` stays exported as a generic helper.
- `apps/whatsapp-worker/src/webhook.ts` — webhook is now
  `GET|POST /webhook/whatsapp/:token`. The path token is compared
  via `verifyWebhookToken`. Event filter: only `event === 'message'`
  is processed; `ready` / `qr` / `disconnected` / status callbacks
  are ack'd with `{ skipped }`. The parser returns `null` for group
  messages (`@g.us`) and self-authored messages (`fromMe: true`),
  which the handler ack-and-skips.
- `apps/whatsapp-worker/src/workers/outbound.ts` — calls the new
  `sendTextMessage`; removed the Interakt-specific
  `isOutsideWindow` branch and `failed_outside_window` status (waapi
  has no 24-hour window concept). Three retries with exponential
  backoff stays.
- `apps/whatsapp-worker/src/scripts/setup-webhook.ts` — **new** CLI.
  waapi has no dashboard for webhook config; this script reads
  `WORKER_PUBLIC_URL` + `WAAPI_WEBHOOK_TOKEN` and PUTs
  `/api/v1/instances/{id}` with
  `{ webhook: { url, events } }`. Defaults events to
  `message,ready,qr,disconnected,authenticated`.
- `apps/whatsapp-worker/src/scripts/waapi-status.ts` — **new** CLI to
  read the current instance + client status (useful while pairing
  the QR or debugging an outage).
- `apps/whatsapp-worker/package.json` — `setup-webhook` and
  `waapi-status` scripts.
- `apps/whatsapp-worker/.env.example` — Interakt vars dropped,
  `WAAPI_API_TOKEN`, `WAAPI_INSTANCE_ID`, `WAAPI_BASE_URL`,
  `WAAPI_WEBHOOK_TOKEN`, `WORKER_PUBLIC_URL`,
  `WAAPI_WEBHOOK_EVENTS` added.
- `turbo.json` — Interakt vars dropped from `globalEnv`, waapi vars
  added.

### Inbound payload shape (for reference)

```json
{
  "event": "message",
  "instanceId": 99,
  "data": {
    "message": {
      "id": { "_serialized": "false_923001234567@c.us_3EB0123",
              "id": "3EB0123", "fromMe": false },
      "from": "923001234567@c.us",
      "to":   "923009999999@c.us",
      "body": "hello shalmi",
      "type": "chat",
      "timestamp": 1714838400,
      "fromMe": false,
      "hasMedia": false
    }
  }
}
```

The parser maps:
- `phone`           → normalize `data.message.from` (strip `@c.us`,
                       prepend `+`)
- `metaMessageId`   → `data.message.id._serialized` (globally
                       unique; falls back to `id.id`)
- `body`            → `data.message.body`
- `messageType`     → derived from `type` + `hasMedia`

### Outbound shape (for reference)

```
POST /api/v1/instances/{instanceId}/client/action/send-message
Authorization: Bearer <WAAPI_API_TOKEN>
Content-Type: application/json

{ "chatId": "923001234567@c.us", "message": "hello" }
```

Response `data.data.id._serialized` is recorded as
`whatsapp_messages.meta_message_id` so an outbound row is joinable
with any future delivery-status callback.

### Verification

| Check                                              | Result |
| -------------------------------------------------- | ------ |
| `pnpm --filter @repo/whatsapp-core check-types`    | ✅     |
| `pnpm --filter whatsapp-worker check-types`        | ✅     |
| `pnpm --filter @repo/services check-types`         | ✅     |
| `pnpm --filter @repo/mcp-server check-types`       | ✅     |
| `pnpm --filter web check-types`                    | ✅     |
| `pnpm --filter web build`                          | ✅     |

Runtime smoke (no Redis, no `WAAPI_*` set, stub DB URL,
`WAAPI_WEBHOOK_TOKEN=testtoken`):

```
GET  /health                                              → 200 {ok}
GET  /webhook/whatsapp/wrong                              → 401 invalid token
GET  /webhook/whatsapp/testtoken                          → 200
POST /webhook/whatsapp/wrong   (msg event, valid body)    → 401
POST /webhook/whatsapp/testtoken (event=ready)            → 200 skipped: ready
POST /webhook/whatsapp/testtoken (msg from @g.us group)   → 200 skipped: group_or_self
POST /webhook/whatsapp/testtoken (msg with fromMe=true)   → 200 skipped: group_or_self
```

Pure-unit checks:

```
e164ToWaapiChatId('+923001234567') → '923001234567@c.us'
parseWaapiInbound(realMsg)         → InboundMessage { phone: '+923001234567', … }
parseWaapiInbound(groupMsg)        → null
parseWaapiInbound(selfMsg)         → null
verifyWebhookToken('topsecret')    → true
verifyWebhookToken('nope')         → false
```

### Hard-rule check (re-verified)

- ✅ Webhook handler ack target is < 3 s — same path as before
  (verify path-token → JSON parse → 1× SELECT dedupe → 1× INSERT →
  `Queue.add` → 200).
- ✅ Webhook auth is mandatory — 401 on bad / missing path token,
  constant-time compare via `timingSafeEqual`.
- ✅ Dedupe by `metaMessageId` (`data.message.id._serialized`).
  BullMQ jobId mirrors the same id so a same-id retry races to a
  no-op.
- ✅ Atomic first-contact flip is unchanged (BSP-agnostic logic).
- ✅ No LLM. Hardcoded welcome + echo.
- ✅ Lazy env loading throughout (`WAAPI_*`, `REDIS_URL`).
- ✅ All inbound + outbound writes log to `whatsapp_messages`.

### Operator runbook (for the trial)

1. **Pair the WhatsApp number** in waapi.app's dashboard — scan the
   QR with the business phone.
2. **Generate `WAAPI_WEBHOOK_TOKEN`** locally:
   ```
   openssl rand -hex 32
   ```
3. **Set env on Railway**: `WAAPI_API_TOKEN`, `WAAPI_INSTANCE_ID`,
   `WAAPI_WEBHOOK_TOKEN`, `WORKER_PUBLIC_URL`, plus
   `DATABASE_URL`, `REDIS_URL`, `INTERNAL_API_KEY`. Redeploy.
4. **Register the webhook** (locally, with `.env` filled):
   ```
   pnpm --filter whatsapp-worker setup-webhook
   ```
   This PUTs `webhook.url` to
   `${WORKER_PUBLIC_URL}/webhook/whatsapp/${WAAPI_WEBHOOK_TOKEN}`
   and subscribes to `message,ready,qr,disconnected,authenticated`.
5. **Confirm**:
   ```
   pnpm --filter whatsapp-worker waapi-status
   curl https://<railway>/health
   curl https://<railway>/webhook/whatsapp/<token>   # 200, hint
   curl https://<railway>/webhook/whatsapp/wrong     # 401
   ```
6. **Test 1 — recognized vendor, first contact**: from a phone
   already on `user.phone_number` in E.164, message the paired
   business number. Expect inbound row + welcome+echo reply.
7. **Test 2 — same vendor, second message**: echo only.
8. **Test 3 — unknown phone**: "We don't recognize this number"
   reply, row visible at `/admin/whatsapp-unrecognized`.

### Gaps & flags (post-migration)

- **Bus and outage risk.** waapi.app has no SLA; whatsapp-web
  protocol changes can dark the bot. Treat the trial as a learning
  surface, not a production foundation.
- **Account ban risk.** Plan to migrate to an official BSP
  (Interakt Advanced, AiSensy, 360Dialog, Gupshup, Twilio) before
  load grows. The `whatsapp-core` package is the only swap point —
  everything else is BSP-agnostic.
- **Webhook events the worker silently ignores.** `ready`, `qr`,
  `disconnected`, `authenticated`. Phase 6 may want to surface
  `disconnected` to the admin panel as an alert.
- **No outside-24h-window detection.** Removed because waapi has
  no such concept. If we migrate back to an official BSP, restore
  this in the outbound consumer.
