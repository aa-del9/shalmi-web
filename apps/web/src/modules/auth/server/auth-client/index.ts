import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { phoneNumber } from 'better-auth/plugins';
import { db, authSchema } from '@repo/database';
import { clientEnv } from '@/modules/core/env/client';
import { serverEnv } from '@/modules/core/env/server';
import { getBaseUrl } from '@/modules/core/utils/url';
import { sendOtpSms } from '../services/otp';
import { USER_ROLES } from '@/modules/core/constants/user-roles';

export const auth = betterAuth({
  appName: clientEnv.NEXT_PUBLIC_BRAND_NAME,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: getBaseUrl(),
  basePath: '/api/auth',
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: USER_ROLES.RETAILER,
        input: false,
      },
      // Per OQ-R(a) — buyer sub-role written by the signup flow via the
      // post-signup hook (not by better-auth's signUpOnVerification path).
      retailerType: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },
  trustedOrigins: [
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    clientEnv.NEXT_PUBLIC_APP_URL,
    'http://localhost:5181',
  ],
  plugins: [
    phoneNumber({
      sendOTP: ({ phoneNumber: phone, code }) => {
        sendOtpSms(phone, code);
      },
      signUpOnVerification: {
        getTempEmail: (phone) =>
          `${phone.replace(/\D/g, '')}@phone.shalmi.local`,
        getTempName: (phone) => phone,
      },
      verifyOTP: () => {
        // TODO
        return true;
      },
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 3,
    }),
  ],
  emailAndPassword: {
    enabled: true,
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
