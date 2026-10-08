/**
 * Phone normalization helpers.
 *
 * `normalizeToE164` is the canonical form we store on
 * `user.phone_number` and key conversations by. `splitE164` is a
 * BSP-agnostic split into country-code + local digits — used by
 * outbound clients that want them as separate fields.
 *
 * Default country is Pakistan (+92) — Shalmi is a Pakistan business
 * and admin entry currently always defaults to a PK phone.
 */

const DEFAULT_COUNTRY_CODE = '92';

/**
 * Common country code prefixes ordered longest-first so longest-match
 * wins. Extend as the business expands. The list does not need to be
 * exhaustive — every WhatsApp number we send to today is +92.
 */
const KNOWN_COUNTRY_CODES = [
  '880', // Bangladesh
  '971', // UAE
  '966', // Saudi Arabia
  '92', // Pakistan
  '91', // India
  '90', // Turkey
  '49', // Germany
  '44', // United Kingdom
  '34', // Spain
  '33', // France
  '31', // Netherlands
  '1', // US/Canada
];

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

/**
 * Normalize a loosely-formatted phone string to E.164.
 *
 * Examples (PK default):
 *   '03001234567'      → '+923001234567'
 *   '923001234567'     → '+923001234567'
 *   '+923001234567'    → '+923001234567'
 *   '0092 300 1234567' → '+923001234567'
 *
 * Throws if the result does not validate as E.164.
 */
export function normalizeToE164(input: string): string {
  if (typeof input !== 'string') {
    throw new TypeError('normalizeToE164: input must be a string');
  }

  const stripped = input.replace(/[\s\-().]/g, '');
  if (stripped.length === 0) {
    throw new Error('normalizeToE164: empty input');
  }

  let candidate: string;
  if (stripped.startsWith('+')) {
    candidate = stripped;
  } else if (stripped.startsWith('00')) {
    candidate = `+${stripped.slice(2)}`;
  } else if (stripped.startsWith('0')) {
    candidate = `+${DEFAULT_COUNTRY_CODE}${stripped.slice(1)}`;
  } else if (stripped.startsWith(DEFAULT_COUNTRY_CODE)) {
    candidate = `+${stripped}`;
  } else {
    candidate = `+${stripped}`;
  }

  if (!E164_REGEX.test(candidate)) {
    throw new Error(`normalizeToE164: "${input}" does not yield E.164 (got "${candidate}")`);
  }
  return candidate;
}

export function isE164(value: string): boolean {
  return E164_REGEX.test(value);
}

/**
 * Split an E.164 phone into `{ countryCode, phoneNumber }`.
 * `countryCode` is digits-only (e.g. `'92'`); `phoneNumber` is the
 * remainder (e.g. `'3001234567'`).
 */
export function splitE164(e164: string): {
  countryCode: string;
  phoneNumber: string;
} {
  if (!isE164(e164)) {
    throw new Error(`splitE164: "${e164}" is not E.164`);
  }
  const digits = e164.slice(1);

  // Longest-match wins.
  const sorted = [...KNOWN_COUNTRY_CODES].sort((a, b) => b.length - a.length);
  for (const cc of sorted) {
    if (digits.startsWith(cc)) {
      return { countryCode: cc, phoneNumber: digits.slice(cc.length) };
    }
  }

  // Fallback: assume a 2-digit country code. Surfaces unknown CCs
  // rather than silently mis-routing.
  return {
    countryCode: digits.slice(0, 2),
    phoneNumber: digits.slice(2),
  };
}
