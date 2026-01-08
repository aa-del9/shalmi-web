/**
 * HTTP header key constants for Vercel, custom headers, etc.
 */
export const HEADERS = {
  // Vercel headers
  X_VERCEL_IP_COUNTRY: "x-vercel-ip-country",
  X_VERCEL_IP_CITY: "x-vercel-ip-city",
  X_VERCEL_IP_TIMEZONE: "x-vercel-ip-timezone",
  X_FORWARDED_FOR: "x-forwarded-for",

  // Custom headers
  X_REQUEST_ID: "x-request-id",
  X_CORRELATION_ID: "x-correlation-id",
  X_API_KEY: "x-api-key",

  // Auth headers
  AUTHORIZATION: "authorization",
  X_REFRESH_TOKEN: "x-refresh-token",
} as const;

export type HeaderKey = (typeof HEADERS)[keyof typeof HEADERS];
