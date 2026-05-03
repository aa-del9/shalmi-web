# syntax=docker/dockerfile:1.7

# ---------- Stage 1: install workspace deps ----------
FROM node:22-alpine AS deps
WORKDIR /repo

RUN apk add --no-cache libc6-compat && corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY turbo.json ./

# Copy only manifests so the deps layer caches across source-only changes
COPY apps/whatsapp-worker/package.json apps/whatsapp-worker/package.json
COPY packages/whatsapp-core/package.json packages/whatsapp-core/package.json
COPY packages/mcp-server/package.json packages/mcp-server/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json

RUN pnpm install --frozen-lockfile --filter=whatsapp-worker...

# ---------- Stage 2: build ----------
FROM node:22-alpine AS build
WORKDIR /repo

RUN apk add --no-cache libc6-compat && corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=deps /repo /repo

COPY packages/typescript-config packages/typescript-config
COPY packages/whatsapp-core packages/whatsapp-core
COPY packages/mcp-server packages/mcp-server
COPY apps/whatsapp-worker apps/whatsapp-worker

RUN pnpm turbo run build --filter=whatsapp-worker...

RUN pnpm prune --prod --filter=whatsapp-worker...

# ---------- Stage 3: runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /repo

ENV NODE_ENV=production

RUN addgroup -S app && adduser -S app -G app

COPY --from=build --chown=app:app /repo/node_modules /repo/node_modules
COPY --from=build --chown=app:app /repo/package.json /repo/package.json
COPY --from=build --chown=app:app /repo/pnpm-workspace.yaml /repo/pnpm-workspace.yaml

COPY --from=build --chown=app:app /repo/apps/whatsapp-worker/package.json /repo/apps/whatsapp-worker/package.json
COPY --from=build --chown=app:app /repo/apps/whatsapp-worker/dist /repo/apps/whatsapp-worker/dist
COPY --from=build --chown=app:app /repo/apps/whatsapp-worker/node_modules /repo/apps/whatsapp-worker/node_modules

COPY --from=build --chown=app:app /repo/packages/whatsapp-core /repo/packages/whatsapp-core
COPY --from=build --chown=app:app /repo/packages/mcp-server /repo/packages/mcp-server

USER app

EXPOSE 3000

CMD ["node", "apps/whatsapp-worker/dist/index.js"]
