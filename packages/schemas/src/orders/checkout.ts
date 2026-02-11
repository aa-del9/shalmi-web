/**
 * Checkout/cart payload validation before order creation.
 */

import { z } from "zod";
import { lineItemSchema } from "../cart/line-item";

export const checkoutCartPayloadSchema = z.object({
  items: z.array(lineItemSchema).min(1),
});

export type CheckoutCartPayload = z.infer<typeof checkoutCartPayloadSchema>;
