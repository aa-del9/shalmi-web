/**
 * Vendor write tool: update-product-stock.
 *
 * Sets `products.stock` to the requested integer count. Stock is
 * stored as a plain integer (number of packs); no unit conversion.
 *
 * Wrapped with `requiresConfirmation: true` — the inbound consumer
 * routes through the YES/NO state machine before applying.
 */

import { z } from 'zod';
import {
  getVendorProductByIdOrSku,
  updateProductStock,
  type VendorProductSummary,
} from '@repo/services/vendor/products';
import { registerTool } from '../registry';
import { wrapWithIdempotency } from '../idempotency';
import type { ToolDefinition } from '../types';

const inputSchema = z.object({
  productIdOrSku: z.string().min(1),
  newCount: z.number().int().min(0),
});

const outputSchema = z.object({
  success: z.boolean(),
  sku: z.string().nullable(),
  productName: z.string(),
  oldStock: z.number(),
  newStock: z.number(),
});

type Input = z.infer<typeof inputSchema>;
type Output = z.infer<typeof outputSchema>;

export interface UpdateProductStockPreview {
  productId: string;
  productName: string;
  sku: string | null;
  oldStock: number;
  newStock: number;
}

export async function previewUpdateProductStock(
  input: Input,
  ctx: { subjectId: string }
): Promise<UpdateProductStockPreview> {
  const summary: VendorProductSummary = await getVendorProductByIdOrSku({
    vendorId: ctx.subjectId,
    productIdOrSku: input.productIdOrSku,
  });
  return {
    productId: summary.id,
    productName: summary.name,
    sku: summary.sku,
    oldStock: summary.stock,
    newStock: input.newCount,
  };
}

const tool: ToolDefinition<Input, Output> = {
  name: 'update_product_stock',
  description:
    'Update a product\'s stock count. Identify the product by SKU, product id, or a unique fragment of the product name (case-insensitive substring match within the vendor\'s catalog). Pass `newCount` as a non-negative integer (number of packs). If the name fragment matches multiple products, the system will ask the vendor to disambiguate by SKU. The system will confirm with the user separately — do not pre-confirm in your reply.',
  inputSchema,
  outputSchema,
  roles: ['vendor'],
  requiresConfirmation: true,
  handler: async (input, ctx) => {
    const before = await getVendorProductByIdOrSku({
      vendorId: ctx.subjectId,
      productIdOrSku: input.productIdOrSku,
    });

    await updateProductStock({
      vendorId: ctx.subjectId,
      productIdOrSku: input.productIdOrSku,
      newCount: input.newCount,
    });

    return {
      success: true,
      sku: before.sku,
      productName: before.name,
      oldStock: before.stock,
      newStock: input.newCount,
    };
  },
};

const wrappedTool = wrapWithIdempotency(tool);
registerTool(wrappedTool);

export default wrappedTool;
