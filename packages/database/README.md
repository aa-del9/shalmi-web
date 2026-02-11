# @repo/database

Drizzle ORM schema and client for the Shalmi Mart database (PostgreSQL).

## Migrations

**Migrations must be run before app deploy.**

- Generate a new migration after schema changes:
  ```bash
  pnpm --filter @repo/database db:generate:dev
  ```
- Run pending migrations (dev):
  ```bash
  pnpm --filter @repo/database db:migrate:dev
  ```
- Run pending migrations (prod):
  ```bash
  pnpm --filter @repo/database db:migrate:prod
  ```

Migration files live in `./migrations`. Ensure `DATABASE_URL` is set when generating or running migrations.
