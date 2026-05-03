import z from 'zod';

const E164_PATTERN = /^\+[1-9]\d{6,14}$/;

/**
 * Strip spaces, dashes, parens, and a leading `00`. If the result is digits
 * only, prepend `+`. Returns the candidate E.164 string (may still fail the
 * pattern check — caller decides). Empty input maps to `''`.
 */
export function normalizePhoneToE164(input: string): string {
  const stripped = input.replace(/[\s\-()]/g, '');
  if (!stripped) return '';
  if (stripped.startsWith('+')) return stripped;
  if (stripped.startsWith('00')) return `+${stripped.slice(2)}`;
  if (/^\d+$/.test(stripped)) return `+${stripped}`;
  return stripped;
}

export function isE164(input: string): boolean {
  return E164_PATTERN.test(input);
}

const phoneNumberSchema = z
  .string()
  .min(1, 'Phone number is required')
  .max(16, 'Phone number is too long')
  .transform((value) => normalizePhoneToE164(value))
  .refine((value) => isE164(value), {
    message: 'Phone must be in E.164 format (e.g. +923001234567)',
  });

export const bankDetailsSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountTitle: z.string().min(1, 'Account title is required'),
  iban: z.string().min(1, 'IBAN is required'),
});

export const createVendorSchema = z.object({
  phoneNumber: phoneNumberSchema,
  fullName: z.string().min(1, 'Full name is required'),
  shopName: z.string().min(1, 'Shop name is required'),
  marketHub: z.string().min(1, 'Market hub is required'),
  address: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  bankDetails: bankDetailsSchema,
});

export const updateVendorSchema = z.object({
  phoneNumber: phoneNumberSchema.optional(),
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
