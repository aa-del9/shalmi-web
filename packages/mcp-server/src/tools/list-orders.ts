import { z } from 'zod';
import { listVendorOrders } from '@repo/services/vendor/orders';
import { registerTool } from '../registry';
import type { ToolDefinition } from '../types';

const SUB_ORDER_STATUSES = [
  'pending',
  'packed',
  'handed_to_courier',
  'delivered',
  'cancelled',
] as const;

const inputSchema = z.object({
  status: z.enum(SUB_ORDER_STATUSES).optional(),
  dateRange: z.enum(['today', 'week', 'month']).optional(),
});

const recentOrderSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  total: z.number(),
  status: z.string(),
  placedAt: z.string(),
});

const outputSchema = z.object({
  count: z.number(),
  summary: z.string(),
  recent: z.array(recentOrderSchema),
});

type Input = z.infer<typeof inputSchema>;
type Output = z.infer<typeof outputSchema>;

const STATUS_ORDER = [
  'pending',
  'packed',
  'handed_to_courier',
  'delivered',
  'cancelled',
] as const;

function dateFloor(range: 'today' | 'week' | 'month'): Date {
  const now = new Date();
  if (range === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (range === 'week') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
}

const tool: ToolDefinition<Input, Output> = {
  name: 'list_orders',
  description:
    'List the vendor\'s orders. Returns a count, a one-line status summary across all matching orders, and the five most recent orders. Use this for "how are my orders today" or "show me pending orders".',
  inputSchema,
  outputSchema,
  roles: ['vendor'],
  handler: async (input, ctx) => {
    const { subOrders } = await listVendorOrders({ vendorId: ctx.subjectId });

    const cutoff = input.dateRange ? dateFloor(input.dateRange) : null;

    const filtered = subOrders.filter((so) => {
      if (input.status && so.status !== input.status) return false;
      if (cutoff && so.createdAt < cutoff) return false;
      return true;
    });

    const counts: Record<string, number> = {};
    for (const so of filtered) {
      counts[so.status] = (counts[so.status] ?? 0) + 1;
    }
    const summary =
      filtered.length === 0
        ? 'No orders match.'
        : STATUS_ORDER.filter((s) => counts[s])
            .map((s) => `${counts[s]} ${s.replace(/_/g, ' ')}`)
            .join(', ');

    const recent = [...filtered]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((so) => ({
        id: so.orderDisplayId || so.id,
        customerName: so.shippingName,
        total: so.itemsTotal,
        status: so.status,
        placedAt: so.createdAt.toISOString(),
      }));

    return {
      count: filtered.length,
      summary,
      recent,
    };
  },
};

registerTool(tool);

export default tool;
