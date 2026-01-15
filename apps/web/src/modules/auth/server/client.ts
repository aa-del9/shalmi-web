import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, authSchema } from '@repo/database';
import { clientEnv, serverEnv } from '@/modules/core/env';

export const auth = betterAuth({
  appName: clientEnv.NEXT_PUBLIC_BRAND_NAME,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: clientEnv.NEXT_PUBLIC_APP_URL,
  basePath: '/api/auth',
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // TODO: add proper config here
    google: {
      clientId: 'your-client-id',
      clientSecret: 'your-client-secret',
      redirectURI: 'https://example.com/api/auth/callback/google',
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      console.log(user, url, token);

      // TODO: Send verification email to user
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 1 hour
  },
  // experimental: { joins: true },
  logger: {
    disabled: false,
    disableColors: false,
    level: 'error',
    log: (level, message, ...args) => {
      // TODO: add Custom logging implementation
      console.log(`[${level}] ${message}`, ...args);
    },
  },
});
