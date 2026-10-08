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
  fullName: z.string().min(1, 'Full name is required'),
  shopName: z.string().min(1, 'Shop name is required'),
  marketHub: z.string().min(1, 'Market hub is required'),
  address: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  bankDetails: bankDetailsSchema,
});

export const updateVendorSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .max(13, 'Phone number must be less than 13 characters')
    .optional(),
  fullName: z.string().optional(),
  shopName: z.string().min(1, 'Shop name is required').optional(),
  marketHub: z.string().min(1, 'Market hub is required').optional(),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  bankDetails: bankDetailsSchema.partial().optional(),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
