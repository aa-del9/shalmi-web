/**
 * General-purpose constants
 */

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const DEFAULT_LOCALE = "en-US";
export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_TIMEZONE = "UTC";

export const SUPPORTED_LOCALES = ["en-US", "ar-SA"] as const;
export const SUPPORTED_CURRENCIES = ["USD", "SAR", "AED", "EUR"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
