import { PHONE_DIAL_PREFIX } from '@/modules/auth/constants';

/** Strip every non-digit. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Take the user's raw 10-digit input and produce a full E.164 string for
 * better-auth (`+923001234567`). Strips a leading `0` if pasted (legacy
 * `0300…` notation), trims to 10 chars.
 */
export function assemblePakistanE164(rawInput: string): string {
  let digits = digitsOnly(rawInput);
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.startsWith('92')) digits = digits.slice(2);
  return `${PHONE_DIAL_PREFIX}${digits.slice(0, 10)}`;
}

/**
 * Display-format an E.164 Pakistan mobile as `+92 NNN NNNNNNN` per
 * buyer-otp gap-analysis Q13(a). Falls back to the raw value if it doesn't
 * look like a Pakistan number.
 */
export function formatPakistanE164ForDisplay(e164: string): string {
  const match = /^\+92(\d{3})(\d{7})$/.exec(e164.trim());
  if (!match) return e164;
  return `${PHONE_DIAL_PREFIX} ${match[1]} ${match[2]}`;
}

/** Take 10 raw digits the user typed and return them clipped + cleaned. */
export function normalizeTenDigitInput(value: string): string {
  let d = digitsOnly(value);
  if (d.startsWith('0')) d = d.slice(1);
  if (d.startsWith('92')) d = d.slice(2);
  return d.slice(0, 10);
}
