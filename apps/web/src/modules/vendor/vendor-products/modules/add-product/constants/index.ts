import { CreateProductInput } from '@repo/schemas/catalog/product';

export const createProductDefaultValues: CreateProductInput = {
  name: '',
  packWeightGrams: 500,
  packSize: 1,
  unitWeightGrams: null,
  unitLabel: null,
  packMrpCents: null,
  packWholesalePriceCents: 0,
  pricePerUnitCents: null,
  stock: 0,
  images: [],
  packTiers: [
    {
      packQty: 1,
      pricePerPackCents: 100,
      badge: null,
      isDefault: true,
    },
  ],
  categoryIds: [],
  sku: null,
  brand: null,
  lowStockThreshold: 10,
  status: 'active',
};
