import z from 'zod';

const internalPathSchema = z
  .string()
  .regex(/^\/[a-zA-Z0-9/_-]*$/)
  .optional()
  .or(z.literal(''));

const positionSchema = z.enum(['hero', 'promo_top', 'strip', 'sidebar']);
const statusSchema = z.enum(['live', 'paused']);

export const createBannerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  internalName: z.string().optional().or(z.literal('')),
  eyebrow: z.string().optional().or(z.literal('')),
  ctaLabel: z.string().optional().or(z.literal('')),
  imageUrl: z.string().min(1, 'Image is required'),
  targetUrl: internalPathSchema,
  position: positionSchema.optional(),
  status: statusSchema.optional(),
  startsAt: z.string().datetime().optional().or(z.literal('')),
  endsAt: z.string().datetime().optional().or(z.literal('')),
  displayOrder: z.number().int().nonnegative().optional(),
});

export const updateBannerSchema = createBannerSchema.partial();

export const bulkUpdateBannerSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
  displayOrder: z.number(),
});
export const bulkUpdateBannersPayloadSchema = z.array(bulkUpdateBannerSchema);

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
export type BulkUpdateBannerInput = z.infer<typeof bulkUpdateBannerSchema>;
