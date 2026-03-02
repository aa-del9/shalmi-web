import type { ProductImageRecord } from '@repo/database';

export type StorefrontProduct = {
  id: string;
  name: string;
  slug: string;
  images: ProductImageRecord[];
  weightGrams: number;
  lowestPriceCents: number;
};
