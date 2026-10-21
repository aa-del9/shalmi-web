/**
 * Legacy price helpers.
 *
 * The band-tier `resolvePrice` was removed when the pack-pricing schema
 * landed (Batch 3). Use `resolvePerPackPrice` from `./pack-pricing.ts`
 * instead.
 *
 * `formatPrice` is preserved here as a thin wrapper around the canonical
 * `formatRupeesFromCents` formatter so existing callers keep working
 * during the transition.
 */

import { formatRupeesFromCents } from '@/modules/core/utils/format-price';

export function formatPrice(cents: number): string {
  return formatRupeesFromCents(cents);
}
