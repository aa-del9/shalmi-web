import z from 'zod';

export const createBannerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  imageUrl: z.string().min(1, 'Image is required'),
  targetUrl: z
    .string()
    .regex(/^\/[a-zA-Z0-9/_-]*$/)
    .optional()
    .or(z.literal('')),
});

export const bulkUpdateBannerSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
  displayOrder: z.number(),
});

export const bulkUpdateBannersPayloadSchema = z.array(bulkUpdateBannerSchema);

export type BulkUpdateBannerInput = z.infer<typeof bulkUpdateBannerSchema>;
export type CreateBannerInput = z.infer<typeof createBannerSchema>;
