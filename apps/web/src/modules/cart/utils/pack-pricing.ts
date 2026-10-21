import type { PackTier } from '../types';

/**
 * Pack-pricing display + resolution helpers.
 *
 * The pack-pricing schema landed in Batch 3 (per
 * `02-design-inventory.md` §7 Q12). Helpers here replace the legacy
 * `resolvePrice` band-lookup with discrete pack-tier lookups, and
 * format the new "Per unit / Pack of N" eyebrows shown across PDP, cart,
 * checkout, and reorder.
 */

export function sortPackTiers(tiers: PackTier[]): PackTier[] {
  return [...tiers].sort((a, b) => a.packQty - b.packQty);
}

export function findDefaultTier(tiers: PackTier[]): PackTier | undefined {
  if (tiers.length === 0) return undefined;
  return tiers.find((t) => t.isDefault) ?? sortPackTiers(tiers)[0];
}

export function findTierByPackQty(
  tiers: PackTier[],
  packQty: number
): PackTier | undefined {
  return tiers.find((t) => t.packQty === packQty);
}

export function resolvePerPackPrice(
  tiers: PackTier[],
  packQty: number
): number {
  return findTierByPackQty(tiers, packQty)?.pricePerPackCents ?? 0;
}

export function computeSavings(
  packMrpCents: number | null | undefined,
  pricePerPackCents: number
): { saveCents: number; percent: number } | null {
  if (!packMrpCents || packMrpCents <= pricePerPackCents) return null;
  const saveCents = packMrpCents - pricePerPackCents;
  const percent = Math.round((saveCents / packMrpCents) * 100);
  return { saveCents, percent };
}

/**
 * Format a per-pack net weight (in grams) for cart-line eyebrows like
 * "1.008 KG" / "950 G".
 */
export function formatPackWeightCaption(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    // 3-decimal formatting matches Pencil samples ("1.008 KG").
    const trimmed = Number(kg.toFixed(3)).toString();
    return `${trimmed} KG`;
  }
  return `${grams} G`;
}

/**
 * Build the pack-eyebrow string for catalog cards: "5 L · CARTON" /
 * "950 G · PACK". Pack-unit label defaults to "PACK" when no
 * `unitLabel` is set on the product.
 */
export function buildPackEyebrow(input: {
  packWeightGrams: number;
  packSize: number;
  unitLabel: string | null;
}): string {
  const weight = formatPackWeightCaption(input.packWeightGrams);
  const label = (input.unitLabel ?? 'pack').toUpperCase();
  if (input.packSize > 1) {
    return `${weight} · ${label} × ${input.packSize}`;
  }
  return `${weight} · ${label}`;
}

/**
 * "12 PACK" cart-line eyebrow segment for the currently-selected bundle.
 * Returns null when packQty is 1 (single unit) — the design hides the
 * segment in that case.
 */
export function buildSelectedPackBadge(packQty: number): string | null {
  if (packQty <= 1) return null;
  return `${packQty} PACK`;
}
