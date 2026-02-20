/**
 * Product create/update Zod schemas (catalog).
 */

import { z } from 'zod';
import { slugSchema } from '../metadata';
import {
  productPriceTiersFormSchema,
  type ProductPriceTiersForm,
} from './product-price-tiers';

const weightGramsSchema = z.number().int().positive();
const optionalUrlSchema = z.string().url().optional();

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  slug: slugSchema.optional(),
  weightGrams: weightGramsSchema.default(500),
  imageUrl: optionalUrlSchema.optional(),
  stock: z.number().int().min(0).optional().default(0),
  tiers: productPriceTiersFormSchema,
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid().optional(),
  slug: slugSchema.optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type { ProductPriceTiersForm };
