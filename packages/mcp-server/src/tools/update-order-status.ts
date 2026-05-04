/**
 * Vendor write tool: update-order-status.
 *
 * Advances a sub-order's status. The vendor surface only allows two
 * transitions (mirrors the existing PATCH route + service layer):
 *   - pending → packed
 *   - packed → handed_to_courier
 *
 * `delivered` and `cancelled` are owned by other systems (courier
 * webhook / admin) and are not exposed here.
 *
 * `orderId` accepts the sub-order UUID. Display ids like `ORD-…`
 * surfaced by `list_orders` are NOT yet resolvable here — see the
 * codebase-map open question §6 and Phase 4 log; resolver is a
 * follow-up.
 *
 * Wrapped with `requiresConfirmation: true`.
 */

import { z } from 'zod';
import {
  getOrderDetails,
  updateOrderStatus,
  type VendorSubOrderDetail,
} from '@repo/services/vendor/orders';
import { registerTool } from '../registry';
import { wrapWithIdempotency } from '../idempotency';
import type { ToolDefinition } from '../types';

const VENDOR_TRANSITION_TARGETS = ['packed', 'handed_to_courier'] as const;
type VendorTransitionTarget = (typeof VENDOR_TRANSITION_TARGETS)[number];

const inputSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(VENDOR_TRANSITION_TARGETS),
});

const outputSchema = z.object({
  success: z.boolean(),
  orderId: z.string(),
  oldStatus: z.string(),
  newStatus: z.string(),
});

type Input = z.infer<typeof inputSchema>;
type Output = z.infer<typeof outputSchema>;

export interface UpdateOrderStatusPreview {
  subOrderId: string;
  orderDisplayId: string;
  oldStatus: string;
  newStatus: VendorTransitionTarget;
  customerName: string;
}

export async function previewUpdateOrderStatus(
  input: Input,
  ctx: { subjectId: string }
): Promise<UpdateOrderStatusPreview> {
  const detail: VendorSubOrderDetail = await getOrderDetails({
    vendorId: ctx.subjectId,
    subOrderId: input.orderId,
  });
  return {
    subOrderId: detail.id,
    orderDisplayId: detail.orderDisplayId,
    oldStatus: detail.status,
    newStatus: input.status,
    customerName: detail.shippingName,
  };
}

const tool: ToolDefinition<Input, Output> = {
  name: 'update_order_status',
  description:
    'Advance a sub-order to "packed" or "handed_to_courier". Pass the sub-order UUID in `orderId` (NOT the ORD-… display id). Use for "mark <id> as packed" or Roman Urdu equivalents. The system will confirm with the user separately — do not pre-confirm in your reply.',
  inputSchema,
  outputSchema,
  roles: ['vendor'],
  requiresConfirmation: true,
  handler: async (input, ctx) => {
    const before = await getOrderDetails({
      vendorId: ctx.subjectId,
      subOrderId: input.orderId,
    });

    const result = await updateOrderStatus({
      vendorId: ctx.subjectId,
      subOrderId: input.orderId,
      status: input.status,
    });

    return {
      success: true,
      orderId: input.orderId,
      oldStatus: before.status,
      newStatus: result.status,
    };
  },
};

const wrappedTool = wrapWithIdempotency(tool);
registerTool(wrappedTool);

export default wrappedTool;
