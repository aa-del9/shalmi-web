/**
 * Delivery-tier constants module (Batch 5 — buyer-reorder Q6 STUBBED).
 *
 * Pencil weight gauge breaks total cart weight into 4 tiers, each with
 * a fixed Rs. delivery fee. The table is in code (not DB) per scope-cut
 * "Weight gauge + delivery tier table".
 *
 * TODO(post-v1): promote to DB when admin-editable becomes a need.
 */

export interface DeliveryTier {
  id: 'tier1' | 'tier2' | 'tier3' | 'tier4';
  /** Inclusive lower bound in grams. */
  minWeightGrams: number;
  /** Exclusive upper bound in grams; `null` means open-ended (top tier). */
  maxWeightGrams: number | null;
  /** Display label, e.g. "0–10 kg". */
  label: string;
  /** Display label compact (mobile gauge legend), e.g. "0–10". */
  compactLabel: string;
  /** Rupees-from-paisa convention used elsewhere — store cents = paisa. */
  feeCents: number;
}

export const DELIVERY_TIERS: readonly DeliveryTier[] = [
  {
    id: 'tier1',
    minWeightGrams: 0,
    maxWeightGrams: 10_000,
    label: '0–10 kg',
    compactLabel: '0–10',
    feeCents: 28_000,
  },
  {
    id: 'tier2',
    minWeightGrams: 10_000,
    maxWeightGrams: 25_000,
    label: '10–25 kg',
    compactLabel: '10–25',
    feeCents: 18_000,
  },
  {
    id: 'tier3',
    minWeightGrams: 25_000,
    maxWeightGrams: 50_000,
    label: '25–50 kg',
    compactLabel: '25–50',
    feeCents: 12_000,
  },
  {
    id: 'tier4',
    minWeightGrams: 50_000,
    maxWeightGrams: null,
    label: '50+ kg',
    compactLabel: '50+',
    feeCents: 8_000,
  },
];

export function resolveDeliveryTier(weightGrams: number): DeliveryTier {
  for (const tier of DELIVERY_TIERS) {
    if (weightGrams < tier.minWeightGrams) continue;
    if (tier.maxWeightGrams === null) return tier;
    if (weightGrams < tier.maxWeightGrams) return tier;
  }
  return DELIVERY_TIERS[DELIVERY_TIERS.length - 1] as DeliveryTier;
}

export function findNextTier(current: DeliveryTier): DeliveryTier | null {
  const idx = DELIVERY_TIERS.findIndex((t) => t.id === current.id);
  if (idx === -1) return null;
  return DELIVERY_TIERS[idx + 1] ?? null;
}
