/**
 * IBAN masking helpers for the bank-info card.
 *
 * Per gap-analysis Q13: desktop uses 3 mask groups, mobile 2 — the
 * country/bank prefix and the last-4 digits stay visible.
 */

function getPrefixAndLast4(iban: string | null | undefined): {
  prefix: string;
  last4: string;
} {
  const cleaned = (iban ?? '').replace(/\s+/g, '');
  if (cleaned.length < 8) {
    return { prefix: cleaned, last4: '' };
  }
  // PK24MEZN... → "PK24 MEZN"
  const prefix = `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)}`;
  const last4 = cleaned.slice(-4);
  return { prefix, last4 };
}

/** "PK24 MEZN •••• •••• 4291" — desktop. */
export function maskIbanDesktop(iban: string | null | undefined): string {
  const { prefix, last4 } = getPrefixAndLast4(iban);
  if (!last4) return prefix;
  return `${prefix} •••• •••• ${last4}`;
}

/** "PK24 MEZN •••• 4291" — mobile. */
export function maskIbanMobile(iban: string | null | undefined): string {
  const { prefix, last4 } = getPrefixAndLast4(iban);
  if (!last4) return prefix;
  return `${prefix} •••• ${last4}`;
}
