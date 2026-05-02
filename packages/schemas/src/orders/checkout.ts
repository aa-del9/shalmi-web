/**
 * Checkout/cart payload validation before order creation.
 */

import { z } from 'zod';
import { lineItemSchema } from '../cart/line-item';

export const shippingAddressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export const RIDER_NOTES_MAX_LENGTH = 500;

export const checkoutCartPayloadSchema = z
  .object({
    items: z.array(lineItemSchema).min(1),
    addressId: z.string().uuid().optional(),
    shippingAddress: shippingAddressSchema.optional(),
    riderNotes: z
      .string()
      .max(
        RIDER_NOTES_MAX_LENGTH,
        `Rider notes must be ${RIDER_NOTES_MAX_LENGTH} characters or fewer`
      )
      .optional()
      .nullable(),
  })
  .refine(
    (data) => data.addressId != null || data.shippingAddress != null,
    { message: 'Provide addressId or shippingAddress' }
  );

export type CheckoutCartPayload = z.infer<typeof checkoutCartPayloadSchema>;
