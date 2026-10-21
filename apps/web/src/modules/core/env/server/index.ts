import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const serverEnv = createEnv({
  server: {
    DATABASE_URL: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    REVALIDATE_SECRET_TOKEN: z.string().optional(),
    // Optional — only the /api/cron/finalize-deliveries route reads it,
    // and that route already 500s gracefully when missing. Marking it
    // required here forced every dev/build invocation to set it; the
    // production cron remains protected by the runtime check.
    CRON_SECRET: z.string().optional(),
    // Optional: Twilio credentials for SMS OTP. If unset, OTP is logged in dev only.
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_MESSAGING_SERVICE_SID: z.string().optional(),
    TWILIO_PHONE_NUMBER: z.string().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    REVALIDATE_SECRET_TOKEN: process.env.REVALIDATE_SECRET_TOKEN,
    CRON_SECRET: process.env.CRON_SECRET,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_MESSAGING_SERVICE_SID: process.env.TWILIO_MESSAGING_SERVICE_SID,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  },
});
