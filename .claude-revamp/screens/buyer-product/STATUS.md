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

Operator applied migration `0009_pack_pricing.sql` to the dev DB and re-seeded with the new pack-pricing CSV. Smoke gate re-run on 2026-05-03:

- `/` — best-prices and hot-products grids render with pack eyebrows ("950 G · CARTON × 12", "475 G · CARTON × 24"). No console errors.
- `/products/lipton-yellow-label-950g-94e832` — breadcrumb (HOME › CARTON › product), title eyebrow `(12 × 79g)` computed, price block Rs. 18,000 + per-unit Rs. 1,500 caption, BundleSelector with `1 pack | 12 pack BEST` (selected ink), spec section, MNP delivery card, YMAL rail with 8 related Carton products. No console errors.
- `/cart` (after Add-to-cart from PDP) — pack eyebrow `ALIBABA · 950 G · 12 PACK`, multiplier caption `Rs. 18,000 × 1 pack`, ORDER SUMMARY card, Proceed to checkout CTA. After bumping qty to 2: `Rs. 18,000 × 2 packs` + `Rs. 36,000` line total + ORDER SUMMARY total in sync.
- `/cart` mobile (420×900) — title `Your cart · 2`, mobile eyebrow drops PACK segment, sticky bottom bar with TOTAL + Checkout button.
- `/checkout` — redirects to `/auth?redirect=/checkout` for signed-out user (expected). Auth-gated full smoke pending sign-in test.

Screenshots saved under each screen's `screenshots/` folder.
