/**
 * Checkout/cart payload validation before order creation.
 */

import { z } from 'zod';
import { lineItemSchema } from '../cart/line-item';
import { PAKISTAN_PROVINCES } from '@repo/constants/geo';

export const POSTAL_CODE_REGEX = /^\d{5}$/;

export const shippingAddressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  // Per buyer-checkout one-time-addr Q12(a) — required on the inline
  // shipping path. Saved-address snapshots map onto these via the
  // `addresses` lookup in /api/checkout (postal/province carried
  // over from the row).
  postalCode: z
    .string()
    .regex(POSTAL_CODE_REGEX, 'Postal code must be 5 digits')
    .optional()
    .nullable(),
  province: z.enum(PAKISTAN_PROVINCES).optional().nullable(),
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
    // Per buyer-checkout one-time-addr Q11(b) — when the toggle is OFF on
    // the one-time card, the form sets saveAddress=true and the route
    // handler runs the address insert + order insert in one transaction.
    saveAddress: z.boolean().optional(),
    // Per OQ-G(b) — guest checkout identifier minted by the cart-store
    // when "Continue as Guest" is clicked on /auth.
    guestSessionId: z.string().optional(),
  })
  .refine(
    (data) => data.addressId != null || data.shippingAddress != null,
    { message: 'Provide addressId or shippingAddress' }
  );

export type CheckoutCartPayload = z.infer<typeof checkoutCartPayloadSchema>;
