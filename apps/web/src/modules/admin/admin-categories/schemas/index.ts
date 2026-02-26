import z from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be at least 1 character when provided')
    .optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
