# syntax=docker/dockerfile:1.7

# ---------- Stage 1: install full workspace deps (dev + prod) ----------
FROM node:22-alpine AS deps
WORKDIR /repo

RUN apk add --no-cache libc6-compat && corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY turbo.json ./

# Copy only manifests so this layer caches across source-only changes
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

# ---------- Stage 3: prod-only deps ----------
# Separate install with --prod so the runtime image doesn't carry tsx,
# typescript, @types/*, etc. (`pnpm prune` doesn't support --filter, so
# we re-resolve from manifests with --prod instead.)
FROM node:22-alpine AS prod-deps
WORKDIR /repo

RUN apk add --no-cache libc6-compat && corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY turbo.json ./

COPY apps/whatsapp-worker/package.json apps/whatsapp-worker/package.json
COPY packages/whatsapp-core/package.json packages/whatsapp-core/package.json
COPY packages/mcp-server/package.json packages/mcp-server/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json

RUN pnpm install --frozen-lockfile --prod --filter=whatsapp-worker...

# ---------- Stage 4: runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /repo

ENV NODE_ENV=production

RUN addgroup -S app && adduser -S app -G app

# prod-only node_modules from the prod-deps stage
COPY --from=prod-deps --chown=app:app /repo/node_modules /repo/node_modules
COPY --from=prod-deps --chown=app:app /repo/package.json /repo/package.json
COPY --from=prod-deps --chown=app:app /repo/pnpm-workspace.yaml /repo/pnpm-workspace.yaml
COPY --from=prod-deps --chown=app:app /repo/apps/whatsapp-worker/node_modules /repo/apps/whatsapp-worker/node_modules

# manifests + built JS from the build stage
COPY --from=build --chown=app:app /repo/apps/whatsapp-worker/package.json /repo/apps/whatsapp-worker/package.json
COPY --from=build --chown=app:app /repo/apps/whatsapp-worker/dist /repo/apps/whatsapp-worker/dist

# workspace package sources (entry points are .ts; resolved via pnpm symlinks)
COPY --from=build --chown=app:app /repo/packages/whatsapp-core /repo/packages/whatsapp-core
COPY --from=build --chown=app:app /repo/packages/mcp-server /repo/packages/mcp-server

USER app

EXPOSE 3000

CMD ["node", "apps/whatsapp-worker/dist/index.js"]
