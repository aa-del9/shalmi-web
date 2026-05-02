import type { ProductImageRecord } from '@repo/database';
import type { PackTierBadge } from '@repo/schemas/catalog/product';

export interface PackTier {
  id?: string;
  packQty: number;
  pricePerPackCents: number;
  badge: PackTierBadge | null;
  isDefault: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: ProductImageRecord | null;
  /** Per-pack net weight (was the legacy `weightGrams` field). */
  packWeightGrams: number;
  packSize: number;
  unitLabel: string | null;
  vendorId: string;
  vendorName: string;
  /** Snapshot of available pack tiers when the line was added. */
  packTiers: PackTier[];
  /** Pack qty of the currently-selected tier (e.g. 6/12/24). */
  selectedPackQty: number;
  /** Quantity in PACKS of the selected pack qty. */
  quantity: number;
}

export interface CartItemInput {
  productId: string;
  name: string;
  slug: string;
  image: ProductImageRecord | null;
  packWeightGrams: number;
  packSize: number;
  unitLabel: string | null;
  vendorId: string;
  vendorName: string;
  packTiers: PackTier[];
  selectedPackQty: number;
}
