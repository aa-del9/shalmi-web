import { z } from 'zod';

export const createAddressSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  recipientName: z.string().min(1, 'Recipient name is required'),
  recipientPhone: z.string().min(1, 'Recipient phone is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  isDefault: z.boolean().optional(),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
