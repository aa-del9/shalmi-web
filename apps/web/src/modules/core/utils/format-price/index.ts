/**
 * Pencil currency formatter — South-Asian (en-IN) digit grouping.
 *
 * Pencil shows prices like "Rs. 1,16,380" (lakh grouping) instead of
 * Western "Rs. 116,380". Use this helper everywhere the design renders
 * a "Rs." figure.
 *
 * STUBBED scope (per `06-scope-cut.md` "Currency formatter"): only the
 * full-grouped style ships in batch 1. Compact lakh/crore notation
 * ("Rs. 18.4 L" / "Rs. 1.2 Cr") will land in a follow-up — every
 * KPI/abbreviation surface that needs it is already DEFERRED in its
 * own gap-analysis answer.
 *
 * Inputs are always **integer cents** (the DB stores priceCents). The
 * formatter divides by 100 and rounds to whole rupees because every
 * Pencil sample shows whole-rupee figures.
 */

const RUPEE_FORMATTER = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

export function formatRupeesFromCents(cents: number): string {
  const rupees = Math.round(cents / 100);
  return `Rs. ${RUPEE_FORMATTER.format(rupees)}`;
}

export function formatRupees(rupees: number): string {
  return `Rs. ${RUPEE_FORMATTER.format(Math.round(rupees))}`;
}
