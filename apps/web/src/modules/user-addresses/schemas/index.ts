import { z } from 'zod';

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

export const createAddressSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  recipientName: z.string().min(1, 'Recipient name is required'),
  recipientPhone: z.string().min(1, 'Recipient phone is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  // STUBBED per gap-analysis Q13/Q14 — optional free-text, no validation.
  postalCode: optionalString,
  province: optionalString,
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
