import type { ProductImageRecord } from '@repo/database';

export interface PriceTier {
  minQty: number;
  maxQty: number | null;
  priceCents: number;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: ProductImageRecord | null;
  weightGrams: number;
  vendorId: string;
  quantity: number;
  priceTiers: PriceTier[];
}

export interface CartItemInput {
  productId: string;
  name: string;
  slug: string;
  image: ProductImageRecord | null;
  weightGrams: number;
  vendorId: string;
  priceTiers: PriceTier[];
}
