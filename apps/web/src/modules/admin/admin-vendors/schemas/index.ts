import z from 'zod';

export const bankDetailsSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountTitle: z.string().min(1, 'Account title is required'),
  iban: z.string().min(1, 'IBAN is required'),
});

export const createVendorSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .max(13, 'Phone number must be less than 13 characters'),
  shopName: z.string().min(1, 'Shop name is required'),
  marketHub: z.string().min(1, 'Market hub is required'),
  bankDetails: bankDetailsSchema,
});

export const updateVendorSchema = createVendorSchema.extend({
  isActive: z.boolean(),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
