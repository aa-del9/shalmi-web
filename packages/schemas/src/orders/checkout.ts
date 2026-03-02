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

export const checkoutCartPayloadSchema = z
  .object({
    items: z.array(lineItemSchema).min(1),
    addressId: z.string().uuid().optional(),
    shippingAddress: shippingAddressSchema.optional(),
  })
  .refine(
    (data) => data.addressId != null || data.shippingAddress != null,
    { message: 'Provide addressId or shippingAddress' }
  );

export type CheckoutCartPayload = z.infer<typeof checkoutCartPayloadSchema>;
