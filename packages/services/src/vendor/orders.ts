import { eq, asc, inArray, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db, subOrders, orderItems, products, orders } from '@repo/database';
import { InvalidStateError, NotFoundError, ValidationError } from '../errors';

const ALLOWED_TRANSITIONS: Record<string, string> = {
  pending: 'packed',
  packed: 'handed_to_courier',
};

const listVendorOrdersInputSchema = z.object({
  vendorId: z.string().min(1),
});

export type ListVendorOrdersInput = z.input<typeof listVendorOrdersInputSchema>;

export interface VendorSubOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    name: string;
    imageUrl: string | null;
  };
}

export interface VendorSubOrderRow {
  id: string;
  orderId: string;
  status: string;
  codAmount: number;
  itemsTotal: number;
  weightGrams: number;
  createdAt: Date;
  updatedAt: Date;
  orderDisplayId: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  items: VendorSubOrderItem[];
}

export interface ListVendorOrdersResult {
  subOrders: VendorSubOrderRow[];
  meta: { pendingCount: number };
}

export async function listVendorOrders(
  input: ListVendorOrdersInput
): Promise<ListVendorOrdersResult> {
  const parsed = listVendorOrdersInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.flatten().formErrors[0] ?? 'Invalid input'
    );
  }
  const { vendorId } = parsed.data;

  const subOrderRows = await db
    .select({
      id: subOrders.id,
      orderId: subOrders.orderId,
      status: subOrders.status,
      codAmount: subOrders.codAmount,
      itemsTotal: subOrders.itemsTotal,
      weightGrams: subOrders.weightGrams,
      createdAt: subOrders.createdAt,
      updatedAt: subOrders.updatedAt,
      orderDisplayId: orders.displayId,
      shippingName: orders.shippingName,
      shippingPhone: orders.shippingPhone,
      shippingAddress: orders.shippingAddress,
      shippingCity: orders.shippingCity,
    })
    .from(subOrders)
    .innerJoin(orders, eq(subOrders.orderId, orders.id))
    .where(eq(subOrders.vendorId, vendorId))
    // Pencil voSubHd reads "Oldest first · pack the items in order".
    .orderBy(asc(subOrders.createdAt));

  const pendingCountRows = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(subOrders)
    .where(
      and(eq(subOrders.vendorId, vendorId), eq(subOrders.status, 'pending'))
    );

  const meta = {
    pendingCount: Number(pendingCountRows[0]?.count ?? 0),
  };

  if (subOrderRows.length === 0) {
    return { subOrders: [], meta };
  }

  const subOrderIds = subOrderRows.map((r) => r.id);

  const itemRows = await db
    .select({
      id: orderItems.id,
      subOrderId: orderItems.subOrderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      totalPrice: orderItems.totalPrice,
      productName: products.name,
      productImages: products.images,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(inArray(orderItems.subOrderId, subOrderIds));

  const itemsBySubOrder = new Map<string, typeof itemRows>();
  for (const item of itemRows) {
    const list = itemsBySubOrder.get(item.subOrderId) ?? [];
    list.push(item);
    itemsBySubOrder.set(item.subOrderId, list);
  }

  const data: VendorSubOrderRow[] = subOrderRows.map((so) => ({
    ...so,
    items: (itemsBySubOrder.get(so.id) ?? []).map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      product: {
        name: item.productName,
        imageUrl: (item.productImages as { url: string }[])?.[0]?.url ?? null,
      },
    })),
  }));

  return { subOrders: data, meta };
}

// ----------------------------------------------------------------------------
// getOrderDetails — vendor-scoped sub-order detail with line items.
// Mirrors the projection used by `listVendorOrders`, but for a single
// sub-order. Used by the WhatsApp `get_order_details` tool.
// ----------------------------------------------------------------------------

const getOrderDetailsInputSchema = z.object({
  vendorId: z.string().min(1),
  subOrderId: z.string().min(1),
});

export type GetOrderDetailsInput = z.input<typeof getOrderDetailsInputSchema>;

export interface VendorSubOrderDetail extends VendorSubOrderRow {
  handedAt: Date | null;
  courierTrackingId: string | null;
  shippingPostalCode: string | null;
  shippingProvince: string | null;
  shippingFeeCustomer: number;
  coolieFeeReimbursement: number;
  courierCost: number;
  platformCommission: number;
}

export async function getOrderDetails(
  input: GetOrderDetailsInput
): Promise<VendorSubOrderDetail> {
  const parsed = getOrderDetailsInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.flatten().formErrors[0] ?? 'Invalid input'
    );
  }
  const { vendorId, subOrderId } = parsed.data;

  const [row] = await db
    .select({
      id: subOrders.id,
      orderId: subOrders.orderId,
      status: subOrders.status,
      codAmount: subOrders.codAmount,
      itemsTotal: subOrders.itemsTotal,
      weightGrams: subOrders.weightGrams,
      handedAt: subOrders.handedAt,
      courierTrackingId: subOrders.courierTrackingId,
      shippingFeeCustomer: subOrders.shippingFeeCustomer,
      coolieFeeReimbursement: subOrders.coolieFeeReimbursement,
      courierCost: subOrders.courierCost,
      platformCommission: subOrders.platformCommission,
      createdAt: subOrders.createdAt,
      updatedAt: subOrders.updatedAt,
      orderDisplayId: orders.displayId,
      shippingName: orders.shippingName,
      shippingPhone: orders.shippingPhone,
      shippingAddress: orders.shippingAddress,
      shippingCity: orders.shippingCity,
      shippingPostalCode: orders.shippingPostalCode,
      shippingProvince: orders.shippingProvince,
    })
    .from(subOrders)
    .innerJoin(orders, eq(subOrders.orderId, orders.id))
    .where(and(eq(subOrders.id, subOrderId), eq(subOrders.vendorId, vendorId)))
    .limit(1);

  if (!row) {
    throw new NotFoundError('Sub-order not found');
  }

  const itemRows = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      totalPrice: orderItems.totalPrice,
      productName: products.name,
      productImages: products.images,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.subOrderId, subOrderId));

  const items: VendorSubOrderItem[] = itemRows.map((item) => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    product: {
      name: item.productName,
      imageUrl: (item.productImages as { url: string }[])?.[0]?.url ?? null,
    },
  }));

  return { ...row, items };
}

const updateOrderStatusInputSchema = z.object({
  vendorId: z.string().min(1),
  subOrderId: z.string().min(1),
  // Optional: if provided, must equal the next allowed transition. The
  // existing PATCH route does not pass `status` and just advances, so
  // omitting this argument preserves that behavior.
  status: z.string().optional(),
});

export type UpdateOrderStatusInput = z.input<
  typeof updateOrderStatusInputSchema
>;

export interface UpdateOrderStatusResult {
  id: string;
  status: string;
}

export async function updateOrderStatus(
  input: UpdateOrderStatusInput
): Promise<UpdateOrderStatusResult> {
  const parsed = updateOrderStatusInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.flatten().formErrors[0] ?? 'Invalid input'
    );
  }
  const { vendorId, subOrderId, status: targetStatus } = parsed.data;

  const [existing] = await db
    .select({ id: subOrders.id, status: subOrders.status })
    .from(subOrders)
    .where(and(eq(subOrders.id, subOrderId), eq(subOrders.vendorId, vendorId)))
    .limit(1);

  if (!existing) {
    throw new NotFoundError('Sub-order not found');
  }

  const nextStatus = ALLOWED_TRANSITIONS[existing.status];
  if (!nextStatus) {
    throw new InvalidStateError(
      `Cannot advance from status "${existing.status}"`
    );
  }

  if (targetStatus !== undefined && targetStatus !== nextStatus) {
    throw new InvalidStateError(
      `Cannot transition from "${existing.status}" to "${targetStatus}"`
    );
  }

  const now = new Date();
  await db
    .update(subOrders)
    .set({
      status: nextStatus,
      updatedAt: now,
      ...(nextStatus === 'handed_to_courier' ? { handedAt: now } : {}),
    })
    .where(eq(subOrders.id, subOrderId));

  return { id: subOrderId, status: nextStatus };
}
