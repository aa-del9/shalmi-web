/**
 * Standardized cookie key names for consistent usage across the app
 */
export const COOKIE_KEYS = {
  // User preferences
  THEME: 'theme',
  LOCALE: 'locale',
  CURRENCY: 'currency',
  COUNTRY_CODE: 'country_code',

  // Analytics & tracking
  AFFILIATE_ID: 'affiliate_id',
  LANDING_SOURCE: 'landing_source',
  UTM_SOURCE: 'utm_source',
  UTM_MEDIUM: 'utm_medium',
  UTM_CAMPAIGN: 'utm_campaign',

  // Consent
  COOKIE_CONSENT: 'cookie_consent',
} as const;

export type CookieKey = (typeof COOKIE_KEYS)[keyof typeof COOKIE_KEYS];
