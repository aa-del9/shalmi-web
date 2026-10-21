import z from 'zod';

const iconKeySchema = z
  .string()
  .regex(/^[a-z0-9-]+$/i, 'Icon key must be a kebab-case Lucide name')
  .max(64);

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  iconKey: iconKeySchema.optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be at least 1 character when provided')
    .optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  iconKey: iconKeySchema.optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
