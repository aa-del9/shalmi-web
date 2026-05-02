import type { PackTierBadge } from '@repo/schemas/catalog/product';

export type ProductImageItem = {
  url: string;
  blurHash: string | null;
};

export type VendorProductListItem = {
  id: string;
  name: string;
  slug: string;
  packWeightGrams: number;
  packSize: number;
  unitLabel: string | null;
  images: ProductImageItem[];
  stock: number;
  createdAt: string;
  categoryIds: string[];
};

export type VendorProductPackTierItem = {
  id?: string;
  packQty: number;
  pricePerPackCents: number;
  badge: PackTierBadge | null;
  isDefault: boolean;
};

export type VendorProductDetail = VendorProductListItem & {
  unitWeightGrams: number | null;
  packMrpCents: number | null;
  packWholesalePriceCents: number;
  pricePerUnitCents: number | null;
  packTiers: VendorProductPackTierItem[];
  categoryIds: string[];
};
