import { CreateProductInput } from '@repo/schemas/catalog/product';
import { VendorProductDetail } from '../../../types';

export function mapDetailToForm(
  detail: VendorProductDetail
): CreateProductInput {
  return {
    name: detail.name,
    packWeightGrams: detail.packWeightGrams,
    packSize: detail.packSize,
    unitWeightGrams: detail.unitWeightGrams ?? null,
    unitLabel: detail.unitLabel ?? null,
    packMrpCents: detail.packMrpCents ?? null,
    packWholesalePriceCents: detail.packWholesalePriceCents,
    pricePerUnitCents: detail.pricePerUnitCents ?? null,
    stock: detail.stock,
    images: detail.images ?? [],
    packTiers: (detail.packTiers ?? []).map((t) => ({
      packQty: t.packQty,
      pricePerPackCents: t.pricePerPackCents,
      badge: t.badge,
      isDefault: t.isDefault,
    })),
    categoryIds: detail.categoryIds ?? [],
    sku: detail.sku ?? null,
    brand: detail.brand ?? null,
    lowStockThreshold: detail.lowStockThreshold ?? 10,
    status: detail.status ?? 'active',
  };
}
