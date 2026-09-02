import { defineConfig } from 'drizzle-kit';

// drizzle-kit must use the session-mode (:5432) connection, not the
// transaction pooler (:6543) that the runtime client uses. Supabase's
// transaction mode does not support prepared statements or session
// state, which migrations / push / studio rely on.
// drizzle-kit auto-loads ./.env, so define DIRECT_URL there.
const directUrl = process.env.DIRECT_URL;

if (!directUrl) {
  throw new Error(
    'DIRECT_URL is not set. drizzle-kit needs the session-mode (:5432) URL; the runtime DATABASE_URL (:6543) is not a substitute.'
  );
}

export default defineConfig({
  out: './migrations-prod',
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  dbCredentials: {
    url: directUrl,
  },
});
