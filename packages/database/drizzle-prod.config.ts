import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './migrations-prod',
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
