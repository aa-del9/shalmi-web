-- Mark the initial migration (0000_nasty_terrax) as already applied.
-- Run this when your DB already has the tables from that migration but
-- Drizzle's journal has no record of it (e.g. "relation already exists" on migrate).
--
-- Usage from repo root:
--   cd packages/database && psql "$DATABASE_URL" -f scripts/mark-initial-migration-applied.sql
-- Or with .env:  cd packages/database && source .env 2>/dev/null; psql "$DATABASE_URL" -f scripts/mark-initial-migration-applied.sql

INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
SELECT '0000_nasty_terrax', 1770839328044
WHERE NOT EXISTS (
  SELECT 1 FROM drizzle.__drizzle_migrations WHERE created_at = 1770839328044
);
