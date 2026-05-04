/**
 * Vendor write tool: update-product-price.
 *
 * Sets `products.packWholesalePriceCents` to `newPrice * 100` (the
 * tool input is in rupees — the LLM will be asked things like
 * "update SH-1042 price to 450"; the underlying schema stores cents).
 *
 * Wrapped with `requiresConfirmation: true` so the inbound consumer
 * routes through the YES/NO state machine before applying. The
 * preview function does the read-only lookup to compose a "from Rs X
 * to Rs Y" confirmation prompt.
 */

import { z } from 'zod';
import {
  getVendorProductByIdOrSku,
  updateProductPrice,
  type VendorProductSummary,
} from '@repo/services/vendor/products';
import { registerTool } from '../registry';
import { wrapWithIdempotency } from '../idempotency';
import type { ToolDefinition } from '../types';

const inputSchema = z.object({
  productIdOrSku: z.string().min(1),
  newPrice: z.number().int().positive(),
});

const outputSchema = z.object({
  success: z.boolean(),
  sku: z.string().nullable(),
  productName: z.string(),
  oldPrice: z.number(),
  newPrice: z.number(),
});

type Input = z.infer<typeof inputSchema>;
type Output = z.infer<typeof outputSchema>;

export interface UpdateProductPricePreview {
  productId: string;
  productName: string;
  sku: string | null;
  oldPriceRupees: number;
  newPriceRupees: number;
}

/**
 * Read-only preview used by the confirmation flow. Throws if the
 * product is not found / not owned by the vendor — the inbound
 * consumer surfaces those errors via Gemini's normal tool-error path.
 */
export async function previewUpdateProductPrice(
  input: Input,
  ctx: { subjectId: string }
): Promise<UpdateProductPricePreview> {
  const summary: VendorProductSummary = await getVendorProductByIdOrSku({
    vendorId: ctx.subjectId,
    productIdOrSku: input.productIdOrSku,
  });
  return {
    productId: summary.id,
    productName: summary.name,
    sku: summary.sku,
    oldPriceRupees: Math.round(summary.packWholesalePriceCents / 100),
    newPriceRupees: input.newPrice,
  };
}

const tool: ToolDefinition<Input, Output> = {
  name: 'update_product_price',
  description:
    'Update a product\'s wholesale price (per pack). Identify the product by SKU, product id, or a unique fragment of the product name (case-insensitive substring match within the vendor\'s catalog). Pass `newPrice` in rupees. If the name fragment matches multiple products, the system will ask the vendor to disambiguate by SKU. The system will confirm with the user separately — do not pre-confirm in your reply.',
  inputSchema,
  outputSchema,
  roles: ['vendor'],
  requiresConfirmation: true,
  handler: async (input, ctx) => {
    const before = await getVendorProductByIdOrSku({
      vendorId: ctx.subjectId,
      productIdOrSku: input.productIdOrSku,
    });

    await updateProductPrice({
      vendorId: ctx.subjectId,
      productIdOrSku: input.productIdOrSku,
      newPrice: input.newPrice * 100, // rupees → cents
    });

    return {
      success: true,
      sku: before.sku,
      productName: before.name,
      oldPrice: Math.round(before.packWholesalePriceCents / 100),
      newPrice: input.newPrice,
    };
  },
};

const wrappedTool = wrapWithIdempotency(tool);
registerTool(wrappedTool);

export default wrappedTool;
