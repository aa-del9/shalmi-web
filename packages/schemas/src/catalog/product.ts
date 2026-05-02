/**
 * Product create/update Zod schemas (catalog).
 *
 * Pack-pricing model (Batch 3): the create payload now carries pack
 * metadata + an array of `product_pack_tiers` rows.
 */

import { z } from 'zod';
import { slugSchema } from '../metadata';
import {
  productPackTiersSchema,
  type ProductPackTiersInput,
  type PackTierRow,
  type PackTierBadge,
  PACK_TIER_BADGES,
} from './product-pack-tiers';

const positiveInt = z.number().int().positive();
const nonNegativeInt = z.number().int().min(0);
const urlSchema = z.string().url();

export const productImageSchema = z.object({
  url: urlSchema,
  blurHash: z.string().nullable(),
});

export const createProductSchema = z.object({
  name: z.string().min(3).max(255),
  slug: slugSchema.optional(),
  // Per-pack net weight in grams (was `weightGrams` in the band model).
  packWeightGrams: positiveInt.default(500),
  // Units per pack (e.g. 30 sachets in a Carton). Defaults to 1 (= sold
  // as a single unit).
  packSize: positiveInt.default(1),
  unitWeightGrams: positiveInt.optional().nullable(),
  unitLabel: z.string().min(1).max(40).optional().nullable(),
  packMrpCents: positiveInt.optional().nullable(),
  packWholesalePriceCents: positiveInt,
  pricePerUnitCents: positiveInt.optional().nullable(),
  images: z.array(productImageSchema).min(1),
  stock: nonNegativeInt.optional().default(0),
  vendorId: z.string().uuid().optional(),
  packTiers: productPackTiersSchema,
  categoryIds: z.array(z.string().uuid()).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid().optional(),
  slug: slugSchema.optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type {
  ProductPackTiersInput,
  PackTierRow,
  PackTierBadge,
};
export { PACK_TIER_BADGES };
