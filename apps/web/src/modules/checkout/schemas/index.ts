import { z } from 'zod';

/** Matches shipping address shape used at checkout (manual entry). */
export const checkoutShippingFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .min(10, 'Please enter a valid phone number'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
});

export type CheckoutShippingFormData = z.infer<
  typeof checkoutShippingFormSchema
>;
