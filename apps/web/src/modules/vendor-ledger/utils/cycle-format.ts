import dayjs from 'dayjs';

/**
 * Per gap-analysis Q2: ledger uses per-surface format helpers — long
 * form on desktop hero, short form on mobile, range form on cycle
 * eyebrows.
 */

/** "FRIDAY 26 APRIL 2026" — desktop hero eyebrow. */
export function formatHeroDateLong(weekEnd: string | Date): string {
  const friday = dayjs(weekEnd).add(1, 'day');
  return friday.format('dddd D MMMM YYYY').toUpperCase();
}

/** "FRIDAY 26 APR" — mobile hero eyebrow. */
export function formatHeroDateShort(weekEnd: string | Date): string {
  const friday = dayjs(weekEnd).add(1, 'day');
  return friday.format('dddd D MMM').toUpperCase();
}

/**
 * "22–26 APRIL" — desktop breakdown eyebrow (cycle window with
 * weekends stripped per gap-analysis Q7).
 */
export function formatCycleRangeLong(
  weekStart: string | Date,
  weekEnd: string | Date
): string {
  const start = dayjs(weekStart);
  const end = dayjs(weekEnd);
  return `${start.format('D')}–${end.format('D MMMM').toUpperCase()}`;
}

/** "22–26 APR" — mobile breakdown eyebrow. */
export function formatCycleRangeShort(
  weekStart: string | Date,
  weekEnd: string | Date
): string {
  const start = dayjs(weekStart);
  const end = dayjs(weekEnd);
  return `${start.format('D')}–${end.format('D MMM').toUpperCase()}`;
}

/** "22–26 Apr 2026" — history-row WEEK column. */
export function formatHistoryWeek(
  weekStart: string | Date,
  weekEnd: string | Date
): string {
  const start = dayjs(weekStart);
  const end = dayjs(weekEnd);
  return `${start.format('D')}–${end.format('D MMM YYYY')}`;
}

/** "Fri 26 Apr" — history-row PAID ON column. */
export function formatPaidOn(paidOn: string | Date | null): string {
  if (!paidOn) return '—';
  return dayjs(paidOn).format('ddd D MMM');
}

/**
 * Days remaining until Friday close-of-cycle. Per gap-analysis Q5:
 * coarse integer, no client-side ticking.
 */
export function daysUntilPayout(weekEnd: string | Date): number {
  const friday = dayjs(weekEnd).add(1, 'day').startOf('day');
  const now = dayjs().startOf('day');
  return Math.max(0, friday.diff(now, 'day'));
}
