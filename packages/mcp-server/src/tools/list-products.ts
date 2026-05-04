import { z } from 'zod';
import { listVendorProducts } from '@repo/services/vendor/products';
import { registerTool } from '../registry';
import type { ToolDefinition } from '../types';

const PRODUCT_FILTERS = ['low_stock', 'out_of_stock', 'all'] as const;
const PAGE_SIZE = 20;

const inputSchema = z.object({
  query: z.string().optional(),
  filter: z.enum(PRODUCT_FILTERS).optional(),
});

const productSchema = z.object({
  id: z.string(),
  sku: z.string().nullable(),
  name: z.string(),
  price: z.number(),
  stock: z.number(),
});

const outputSchema = z.object({
  count: z.number(),
  products: z.array(productSchema),
});

type Input = z.infer<typeof inputSchema>;
type Output = z.infer<typeof outputSchema>;

const tool: ToolDefinition<Input, Output> = {
  name: 'list_products',
  description:
    'List the vendor\'s products, capped at 20. Optional `query` searches by name, SKU, or brand. Optional `filter`: "low_stock" (active products at or below the low-stock threshold), "out_of_stock" (stock = 0), "all" (default).',
  inputSchema,
  outputSchema,
  roles: ['vendor'],
  handler: async (input, ctx) => {
    const useService = !input.filter || input.filter === 'low_stock';

    if (useService) {
      const result = await listVendorProducts({
        vendorId: ctx.subjectId,
        filter: {
          q: input.query,
          status: input.filter === 'low_stock' ? 'low-stock' : undefined,
          pageSize: PAGE_SIZE,
        },
      });

      return {
        count: result.total,
        products: result.rows.map((row) => ({
          id: row.id,
          sku: row.sku,
          name: row.name,
          price: row.packWholesalePriceCents,
          stock: row.stock,
        })),
      };
    }

    // out_of_stock — `listVendorProducts` has no native filter for it,
    // so fetch a wider page and post-filter. Capped at PAGE_SIZE after
    // the filter is applied. This keeps the service-layer rule
    // ("thin wrappers only") intact: we're composing existing reads,
    // not inventing new business logic.
    const all = await listVendorProducts({
      vendorId: ctx.subjectId,
      filter: { q: input.query, pageSize: 30 },
    });
    const zeroStock = all.rows.filter((row) => row.stock === 0);
    return {
      count: zeroStock.length,
      products: zeroStock.slice(0, PAGE_SIZE).map((row) => ({
        id: row.id,
        sku: row.sku,
        name: row.name,
        price: row.packWholesalePriceCents,
        stock: row.stock,
      })),
    };
  },
};

registerTool(tool);

export default tool;
