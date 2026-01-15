import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, authSchema } from '@repo/database';
import { clientEnv } from '@/modules/core/env/client';
import { serverEnv } from '@/modules/core/env/server';
import { getBaseUrl } from '@/modules/core/utils/url';

export const auth = betterAuth({
  appName: clientEnv.NEXT_PUBLIC_BRAND_NAME,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: getBaseUrl(),
  basePath: '/api/auth',
  trustedOrigins: [
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],
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
