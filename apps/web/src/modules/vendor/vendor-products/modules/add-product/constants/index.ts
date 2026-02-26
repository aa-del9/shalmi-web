import { CreateProductInput } from '@repo/schemas/catalog/product';

export const createProductDefaultValues: CreateProductInput = {
  name: '',
  weightGrams: 500,
  stock: 0,
  images: [],
  tiers: [{ minQty: 1, maxQty: null, price: 0 }],
  categoryIds: [],
};
