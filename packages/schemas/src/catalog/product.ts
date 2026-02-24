/**
 * Product create/update Zod schemas (catalog).
 */

import { z } from 'zod';
import { slugSchema } from '../metadata';
import {
  createProductPriceTiersSchema,
  type ProductPriceTiersForm,
} from './product-price-tiers';

const weightGramsSchema = z.number().int().positive();
const urlSchema = z.string().url();

export const productImageSchema = z.object({
  url: urlSchema,
  blurHash: z.string().nullable(),
});

export const createProductSchema = z.object({
  name: z.string().min(3).max(255),
  slug: slugSchema.optional(),
  weightGrams: weightGramsSchema.default(500),
  images: z.array(productImageSchema).min(1),
  stock: z.number().int().min(0).optional().default(0),
  vendorId: z.string().uuid().optional(),
  tiers: createProductPriceTiersSchema,
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid().optional(),
  slug: slugSchema.optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type { ProductPriceTiersForm };
