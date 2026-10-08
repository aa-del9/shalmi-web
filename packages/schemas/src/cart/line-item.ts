/**
 * Cart line item Zod schemas.
 */

import { z } from 'zod';

export const lineItemSchema = z.object({
  productId: z.string().min(1),
  /** Number of packs ordered (counts in packs, not units). */
  quantity: z.number().int().positive(),
  /**
   * Pack qty of the bundle the buyer selected (e.g. 6, 12, 24). Looked up
   * server-side against `product_pack_tiers` to resolve the per-pack
   * price for this line.
   */
  selectedPackQty: z.number().int().positive(),
});

export type LineItem = z.infer<typeof lineItemSchema>;

export const lineItemsArraySchema = z.array(lineItemSchema);

export type LineItemsArray = z.infer<typeof lineItemsArraySchema>;
