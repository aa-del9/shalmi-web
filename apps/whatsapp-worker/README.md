# whatsapp-worker

Hono Node server that handles the inbound WhatsApp webhook and drives the
vendor conversation loop (Gemini + MCP tools).

This app is intentionally **not** deployed to Vercel — webhook ingress
needs a long-lived process that can ack within 3 seconds and push heavy
work to a queue.

## Stack

- Runtime: Node 22 (`>=22.0.0 <25.0.0`)
- HTTP: [Hono](https://hono.dev) on `@hono/node-server`
- Build: `tsc` to `dist/`, ESM
- Workspace: `pnpm` + Turborepo

## Routes

| Method | Path     | Purpose                                         |
| ------ | -------- | ----------------------------------------------- |
| GET    | /health  | Liveness probe — returns `{ ok, service }`     |

More routes will land as the WhatsApp build progresses (webhook verify,
webhook receive, queue worker tick).

## Local development

From the repo root:

```bash
pnpm install
pnpm worker:dev
```

That runs `tsx watch src/index.ts` for the worker. Default port is
`3000` — override with `PORT=4000 pnpm worker:dev`.

Smoke test:

```bash
curl -s http://localhost:3000/health
# {"ok":true,"service":"whatsapp-worker"}
```

## Build & run

```bash
pnpm worker:build
pnpm worker:start
```

`worker:build` runs `turbo run build --filter=whatsapp-worker...` which
also builds the workspace deps (`@repo/whatsapp-core`,
`@repo/mcp-server`).

## Environment

Copy `.env.example` to `.env` and fill in the values you need locally.
See `.env.example` for the full list — the worker reads them via
`process.env`.

## Deployment target

**Railway** (Dockerfile build).

- `Dockerfile` is multi-stage: deps → build → minimal runtime image.
- `railway.json` declares the dockerfile path and the `/health`
  healthcheck.
- Set the same env vars as `.env.example` in the Railway service.
- Railway injects `PORT` at runtime; the worker reads it.

```bash
# from repo root, build the image locally to verify
docker build -f apps/whatsapp-worker/Dockerfile -t shalmi-whatsapp-worker .
docker run --rm -p 3000:3000 --env-file apps/whatsapp-worker/.env shalmi-whatsapp-worker
```

## Workspace deps

- `@repo/whatsapp-core` — phone normalization, Meta API client,
  conversation context builder, reply formatter, shared types.
- `@repo/mcp-server` — MCP tool registry the worker calls into.

Both are stub packages today; see their `src/index.ts` TODO blocks.
