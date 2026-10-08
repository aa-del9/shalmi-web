/**
 * Pakistan administrative regions used as the source of truth for
 * `addresses.province` and `orders.shippingProvince` (Batch 7).
 *
 * Stored as `text` in Postgres for forward flexibility (no enum
 * migration if a new territory is added) but constrained to this list
 * via zod at the API boundary. Per buyer-checkout one-time-addr Q4(a).
 */
export const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Kashmir',
  'Islamabad Capital Territory',
] as const;

export type PakistanProvince = (typeof PAKISTAN_PROVINCES)[number];
