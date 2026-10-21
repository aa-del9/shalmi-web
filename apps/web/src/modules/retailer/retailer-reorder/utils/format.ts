/**
 * Reorder eyebrow date — UPPERCASE month per gap-analysis Q4.
 *
 * Pencil renders dates as "24 APR 2026" on this screen. Output a single
 * string suitable for inline composition with the eyebrow separator.
 */
export function formatEyebrowDate(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '';
  const day = date.getDate();
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}
