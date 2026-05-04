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
COPY packages/database/package.json packages/database/package.json
COPY packages/services/package.json packages/services/package.json
COPY packages/utils/package.json packages/utils/package.json
COPY packages/constants/package.json packages/constants/package.json
COPY packages/schemas/package.json packages/schemas/package.json
COPY packages/types/package.json packages/types/package.json

RUN pnpm install --frozen-lockfile --filter=whatsapp-worker...

# ---------- Stage 2: build ----------
FROM node:22-alpine AS build
WORKDIR /repo

RUN apk add --no-cache libc6-compat && corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=deps /repo /repo

COPY packages/typescript-config packages/typescript-config
COPY packages/whatsapp-core packages/whatsapp-core
COPY packages/mcp-server packages/mcp-server
COPY packages/database packages/database
COPY packages/services packages/services
COPY packages/utils packages/utils
COPY packages/constants packages/constants
COPY packages/schemas packages/schemas
COPY packages/types packages/types
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
COPY packages/database/package.json packages/database/package.json
COPY packages/services/package.json packages/services/package.json
COPY packages/utils/package.json packages/utils/package.json
COPY packages/constants/package.json packages/constants/package.json
COPY packages/schemas/package.json packages/schemas/package.json
COPY packages/types/package.json packages/types/package.json

RUN pnpm install --frozen-lockfile --prod --ignore-scripts --filter=whatsapp-worker...

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

# manifests + worker source (we run via tsx because every workspace
# dep exports its TypeScript source, not a compiled bundle)
COPY --from=build --chown=app:app /repo/apps/whatsapp-worker/package.json /repo/apps/whatsapp-worker/package.json
COPY --from=build --chown=app:app /repo/apps/whatsapp-worker/tsconfig.json /repo/apps/whatsapp-worker/tsconfig.json
COPY --from=build --chown=app:app /repo/apps/whatsapp-worker/src /repo/apps/whatsapp-worker/src

# workspace package sources (entry points are .ts; resolved via pnpm symlinks)
COPY --from=build --chown=app:app /repo/packages/typescript-config /repo/packages/typescript-config
COPY --from=build --chown=app:app /repo/packages/whatsapp-core /repo/packages/whatsapp-core
COPY --from=build --chown=app:app /repo/packages/mcp-server /repo/packages/mcp-server
COPY --from=build --chown=app:app /repo/packages/database /repo/packages/database
COPY --from=build --chown=app:app /repo/packages/services /repo/packages/services
COPY --from=build --chown=app:app /repo/packages/utils /repo/packages/utils
COPY --from=build --chown=app:app /repo/packages/constants /repo/packages/constants
COPY --from=build --chown=app:app /repo/packages/schemas /repo/packages/schemas
COPY --from=build --chown=app:app /repo/packages/types /repo/packages/types

USER app

EXPOSE 3000

# tsx ships its own ESM loader; we install it as a runtime dep so we
# can load the workspace TypeScript packages without a bundle step.
CMD ["node", "--import", "tsx/esm", "apps/whatsapp-worker/src/index.ts"]
