import type { PriceTier } from '../types';

/**
 * Finds the applicable price tier for a given quantity.
 * Tiers are matched by minQty/maxQty range. Falls back to the
 * lowest-minQty tier if no exact match is found.
 */
export function resolvePrice(
  priceTiers: PriceTier[],
  quantity: number
): number {
  const sorted = [...priceTiers].sort((a, b) => a.minQty - b.minQty);

  for (let i = sorted.length - 1; i >= 0; i--) {
    const tier = sorted[i]!;
    if (quantity >= tier.minQty) {
      if (tier.maxQty === null || quantity <= tier.maxQty) {
        return tier.priceCents;
      }
    }
  }

  return sorted[0]?.priceCents ?? 0;
}

export function formatPrice(cents: number): string {
  return `Rs. ${(cents / 100).toLocaleString()}`;
}
