# Phase 2 — schema + admin surface

Date: 2026-05-04 · Branch: `feat/whatsapp-bot`.

## What landed

### Migration

`packages/database/migrations/0013_whatsapp.sql` (additive only).

- Adds `user.whatsapp_first_seen_at` and `user.whatsapp_last_seen_at`
  (both `timestamp`, nullable).
- Creates `whatsapp_conversations` (one row per phone): phone unique,
  optional `user_id` fk → `user` (`ON DELETE SET NULL`), `role`
  (default `vendor`), short-term `recent_turns` jsonb buffer,
  `pending_action`, `state` machine, `state_data`, `last_message_at`.
- Creates `whatsapp_messages` (append-only): phone, optional
  `user_id` fk, `direction` (`inbound | outbound`),
  `meta_message_id` (for dedup), `body`, `message_type`,
  `parsed_intent` / `tool_calls` / `tool_results` jsonb, LLM token
  counters, `latency_ms`, `error`, `status` lifecycle. Indexes on
  `phone`, `meta_message_id`, `created_at`.
- Creates `whatsapp_idempotency` (key/tool_name/result/expires_at).
- Hand-written following the existing batch 4/5 pattern. The journal
  entries for 0009–0012 carry no `meta/*_snapshot.json` files, so
  `drizzle-kit generate` would otherwise treat the live DB as drift
  and try to recreate every table since 0008.

### Phone uniqueness

Already enforced. `migrations/0000_nasty_terrax.sql` declared
`CONSTRAINT user_phone_number_unique UNIQUE("phone_number")` and the
Drizzle definition keeps `.unique()` on the column — no new
constraint required.

### Schema package

- `packages/database/src/schema/auth.ts` — added the two timestamps
  to `user`.
- `packages/database/src/schema/whatsapp.ts` — new file declaring
  `whatsappConversations`, `whatsappMessages`, `whatsappIdempotency`.
- `packages/database/src/schema/index.ts` — re-export.
- `packages/database/migrations/meta/_journal.json` — entry 13 added.

No Zod schema package surface is added in this batch; runtime
validation of LLM inputs/outputs lands in phase 4 alongside the
worker, where the shapes are concrete.

### Admin form (E.164)

- `apps/web/src/modules/admin/admin-vendors/schemas/index.ts` — new
  `phoneNumberSchema` (transforms loose input → E.164 then refines
  against `^\+[1-9]\d{6,14}$`). Exports `normalizePhoneToE164` and
  `isE164` for client-side preview.
- `apps/web/src/modules/admin/admin-vendors/components/vendor-edit-panel/index.tsx`
  — bumps `maxLength` from 13 to 16; renders a live "Will save as
  +9230…" hint below the input whenever the parsed E.164 differs
  from raw input. Errors continue to render via `FieldError`.

### Vendor detail panel

- `apps/web/src/app/api/admin/vendors/[id]/route.ts` — `GET` now
  returns `whatsappFirstSeenAt` / `whatsappLastSeenAt`.
- `apps/web/src/modules/admin/admin-vendors/types.ts` — `VendorDetail`
  carries the two ISO timestamps.
- `apps/web/src/modules/admin/admin-vendors/components/vendor-edit-panel/index.tsx`
  — read-only "WhatsApp" section between Status and Bank details:
    - "Never used" when `whatsappFirstSeenAt` is null.
    - "Active — last seen <relative>" otherwise. Relative time uses
      `Intl.RelativeTimeFormat` (no new deps).

### Unrecognized queue

- `apps/web/src/app/api/admin/whatsapp-unrecognized/route.ts` — admin
  GET returns inbound `whatsapp_messages` with `user_id IS NULL`,
  last 30 days, ordered by `created_at desc`, capped at 200.
- `apps/web/src/modules/admin/admin-whatsapp-unrecognized/index.tsx`
  — TanStack Query view: phone (mono), truncated body / message-type
  fallback, formatted timestamp; empty state when there are no rows.
- `apps/web/src/app/admin/whatsapp-unrecognized/page.tsx` — wraps the
  module, marked `dynamic = 'force-dynamic'`.
- `apps/web/src/modules/core/constants/absolute-routes/index.ts` —
  new `ADMIN_WHATSAPP_UNRECOGNIZED` constant.
- `apps/web/src/modules/admin/admin-layout/admin-sidebar/admin-sidebar.constants.ts`
  — added under "Operations" with `MessageSquareTextIcon`.

## Files touched

```
packages/database/migrations/0013_whatsapp.sql        (new)
packages/database/migrations/meta/_journal.json
packages/database/src/schema/auth.ts
packages/database/src/schema/index.ts
packages/database/src/schema/whatsapp.ts              (new)

apps/web/src/app/api/admin/vendors/[id]/route.ts
apps/web/src/app/api/admin/whatsapp-unrecognized/route.ts (new)
apps/web/src/app/admin/whatsapp-unrecognized/page.tsx     (new)

apps/web/src/modules/admin/admin-layout/admin-sidebar/admin-sidebar.constants.ts
apps/web/src/modules/admin/admin-vendors/components/vendor-edit-panel/index.tsx
apps/web/src/modules/admin/admin-vendors/schemas/index.ts
apps/web/src/modules/admin/admin-vendors/types.ts
apps/web/src/modules/admin/admin-whatsapp-unrecognized/index.tsx (new)
apps/web/src/modules/core/constants/absolute-routes/index.ts
```

## Verification

- `pnpm --filter web check-types` — clean.
- `pnpm --filter web lint` — clean (`No ESLint warnings or errors`).
- `pnpm --filter @repo/database lint` — clean.
- `pnpm --filter web build` — succeeded; both
  `/admin/whatsapp-unrecognized` and `/api/admin/whatsapp-unrecognized`
  appear in the route table.
- `pnpm --filter @repo/database check-types` — fails with a
  pre-existing `TS2688: Cannot find type definition file for
  'minimatch'` error that reproduces on `git stash` (i.e. unrelated to
  this batch). Flagged for separate cleanup.

## Migration status — needs operator action

`pnpm db:migrate:dev` aborted on replay: the dev database has every
table created (0000–0012 were hand-applied), but its
`drizzle.__drizzle_migrations` table is out of sync with the
`packages/database/migrations/` folder, so drizzle-kit attempts to
re-run 0000 onward and fails on `CREATE TABLE "categories"` —
`relation "categories" already exists` (`42P07`). This is a
pre-existing repo condition, not something this batch introduced.

The new SQL is small and additive. Recommended ways to apply it:

1. Sync drizzle's bookkeeping in dev (one-time fix), then re-run
   `pnpm db:migrate:dev` so the new migration runs and 0013 is
   recorded in `drizzle.__drizzle_migrations`. Same fix applies to
   staging/prod when those caught up to 0012.
2. Apply `0013_whatsapp.sql` directly via `psql $DATABASE_URL -f
   packages/database/migrations/0013_whatsapp.sql` and insert a row
   into `drizzle.__drizzle_migrations` so future migrations don't
   replay it.

Either path is safe — the file uses `IF NOT EXISTS` for the new
tables and indexes, and the two `ALTER TABLE … ADD COLUMN` statements
are idempotent only in the sense that they will fail loudly if run
twice, which is the correct signal.

I did not run option 2 myself: it requires DB credentials and is
outside the migration tool the user authorized.

## Manual verification (post-migration)

When 0013 is applied, the following should hold without any worker
running:

- `/admin/vendors` → click a vendor → "WhatsApp" section reads
  "Never used" (because `user.whatsapp_first_seen_at` is null for
  every existing row).
- `/admin/whatsapp-unrecognized` → empty state ("No unrecognized
  messages") because `whatsapp_messages` has zero rows.
- Admin vendor form: typing `03001234567` shows a "Will save as
  +923001234567" hint; submitting saves the E.164 form to
  `user.phone_number`. (The route handler accepts the transformed
  value because the Zod schema parses-then-transforms before the API
  payload is built.)

## Hard-rule check

- ✅ No new phone column. We use `users.phone_number`.
- ✅ Phone uniqueness enforced at DB level (`user_phone_number_unique`
  from migration 0000).
- ✅ No vendor-facing dashboard linking UI added.
- ✅ No OTP / link-code tables.

## Stop point

Stopping after this log per the phase instructions. Phase 3 (worker
plumbing / webhook ingress) picks up next.
