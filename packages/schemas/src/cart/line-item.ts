/**
 * Cart line item Zod schemas.
 */

import { z } from "zod";

export const lineItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export type LineItem = z.infer<typeof lineItemSchema>;

export const lineItemsArraySchema = z.array(lineItemSchema);

export type LineItemsArray = z.infer<typeof lineItemsArraySchema>;
