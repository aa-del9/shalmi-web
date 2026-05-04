import { z } from 'zod';
import { getOrderDetails } from '@repo/services/vendor/orders';
import { registerTool } from '../registry';
import type { ToolDefinition } from '../types';

const inputSchema = z.object({
  orderId: z.string().min(1),
});

const itemSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
});

const outputSchema = z.object({
  id: z.string(),
  orderDisplayId: z.string(),
  status: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  shippingAddress: z.string(),
  shippingCity: z.string(),
  itemsTotal: z.number(),
  codAmount: z.number(),
  weightGrams: z.number(),
  placedAt: z.string(),
  items: z.array(itemSchema),
});

type Input = z.infer<typeof inputSchema>;
type Output = z.infer<typeof outputSchema>;

const tool: ToolDefinition<Input, Output> = {
  name: 'get_order_details',
  description:
    'Fetch a single order by its sub-order id (or display id like "#ORD-101" — pass the raw value the user mentioned). Returns customer, shipping, totals, and line items. Vendor-scoped.',
  inputSchema,
  outputSchema,
  roles: ['vendor'],
  handler: async (input, ctx) => {
    const detail = await getOrderDetails({
      vendorId: ctx.subjectId,
      subOrderId: input.orderId,
    });

    return {
      id: detail.id,
      orderDisplayId: detail.orderDisplayId,
      status: detail.status,
      customerName: detail.shippingName,
      customerPhone: detail.shippingPhone,
      shippingAddress: detail.shippingAddress,
      shippingCity: detail.shippingCity,
      itemsTotal: detail.itemsTotal,
      codAmount: detail.codAmount,
      weightGrams: detail.weightGrams,
      placedAt: detail.createdAt.toISOString(),
      items: detail.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    };
  },
};

registerTool(tool);

export default tool;
