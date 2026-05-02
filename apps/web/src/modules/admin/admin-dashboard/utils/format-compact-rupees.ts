// Q-FMT-1 binding: collapse to lakhs (`L`) at threshold ≥ 1,00,000.
// Crores (`Cr`) at ≥ 1,00,00,000. Below threshold use full
// `Intl.NumberFormat('en-IN')` grouping.

const FULL = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const ONE_DECIMAL = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 1,
});

const LAKH = 100_000;
const CRORE = 10_000_000;

export function formatCompactRupeesFromCents(cents: number): string {
  const rupees = Math.round(cents / 100);
  if (rupees >= CRORE) {
    return `Rs. ${ONE_DECIMAL.format(rupees / CRORE)} Cr`;
  }
  if (rupees >= LAKH) {
    return `Rs. ${ONE_DECIMAL.format(rupees / LAKH)} L`;
  }
  return `Rs. ${FULL.format(rupees)}`;
}
