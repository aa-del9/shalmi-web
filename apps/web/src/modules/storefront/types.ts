import type { ProductImageRecord } from '@repo/database';

export type StorefrontProduct = {
  id: string;
  name: string;
  slug: string;
  images: ProductImageRecord[];
  packWeightGrams: number;
  packSize: number;
  unitLabel: string | null;
  lowestPriceCents: number;
};
