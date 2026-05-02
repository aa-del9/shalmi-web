# buyer-product — Batch 3 status

**Stop reason:** Playwright smoke gate blocked on dev DB schema migration apply.

The pack-pricing schema migration (`packages/database/migrations/0009_pack_pricing.sql`) is the binding spec for this batch (per `02-design-inventory.md` §7 Q12 + every gap-analysis question that references the schema). The migration file, journal entry, and matching Drizzle schema TypeScript files are all committed.

**What I tried**

1. `pnpm --filter @repo/database db:migrate:dev` — failed: dev DB does not have a populated `__drizzle_migrations` tracking table, so drizzle-kit attempts to re-apply migration 0000 and errors with `relation "categories" already exists`.
2. `pnpm --filter @repo/database db:push:dev` — denied (would auto-confirm a destructive schema sync against shared infrastructure without preview).
3. Direct SQL apply via a Node script — denied (custom-written script bypassing standard migration tooling against shared DB).

**Quality-gate state**

| Check | Status |
|---|---|
| `pnpm --filter web exec tsc --noEmit` | ✅ exit 0 |
| `pnpm --filter web lint` | ✅ "No ESLint warnings or errors" |
| `pnpm --filter web build` | ✅ "Compiled successfully", all 40 routes generated |
| Playwright smoke (cart empty state, viewport 1440×900) | ✅ mounts cleanly, no console errors, only baseline `/favicon.ico` 404 |
| Playwright smoke (PDP / storefront-home queries) | ❌ 500s on Drizzle SELECT — DB columns `pack_weight_grams`, `pack_size`, `unit_label` not present in the live dev DB |

**What I need to unblock**

Apply migration `0009_pack_pricing.sql` to the dev DB, then re-run the smoke gate on:
- `/products/<slug>` (any seeded product) — verify bundle selector, breadcrumb, mobile sticky bar, YMAL.
- `/` — verify best-prices + super-saver carousels still render.
- `/cart` (with seeded items) — verify pack eyebrow, vendor name, mobile sticky bar.
- `/checkout` — verify step indicator, sections, payment selector, rider notes, sticky bar.

The seed data path (`packages/database/src/seed-products.ts`) was updated to write the new pack-pricing fields, so a fresh `pnpm --filter @repo/database db:seed-products` after migration will hydrate the new columns.

**Gap-analysis question that should have covered this:** none — this is environmental (DB tracking-table state), not spec.

## Resolution

(none yet — operator will fill this in once unblocked)
