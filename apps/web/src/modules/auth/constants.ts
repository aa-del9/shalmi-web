/**
 * Pakistan mobile number format: 3XX XXXXXXX (10 digits, leading 3).
 * Per buyer-signin gap-analysis Q11(a) — landlines can't receive SMS OTPs.
 */
export const PAKISTAN_MOBILE_REGEX = /^3\d{9}$/;

export const PHONE_DIAL_PREFIX = '+92';

/** Per buyer-otp gap-analysis Q2(a). */
export const OTP_RESEND_COUNTDOWN_SECONDS = 42;

/** Per buyer-otp gap-analysis Q3(b) — mirrors better-auth `allowedAttempts: 3`. */
export const OTP_RESEND_MAX_ATTEMPTS = 3;
