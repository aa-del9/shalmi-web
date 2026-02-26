import { CreateProductInput } from '@repo/schemas/catalog/product';
import { VendorProductDetail } from '../../../types';

export function mapDetailToForm(
  detail: VendorProductDetail
): CreateProductInput {
  return {
    name: detail.name,
    weightGrams: detail.weightGrams,
    stock: detail.stock,
    images: detail.images ?? [],
    tiers: (detail.tiers ?? []).map((t) => ({
      minQty: t.minQty,
      maxQty: t.maxQty,
      price: t.price,
    })),
    categoryIds: detail.categoryIds ?? [],
  };
}
