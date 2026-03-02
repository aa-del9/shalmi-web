import type { NextRequest } from 'next/server';
import { eq, desc, inArray } from 'drizzle-orm';
import {
  db,
  orders,
  subOrders,
  orderItems,
  products,
} from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireSession } from '@/modules/auth/server/guards/require-session';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    requireSession(session);

    const userId = (session.user as { id: string }).id;

    const orderRows = await db
      .select({
        id: orders.id,
        displayId: orders.displayId,
        status: orders.status,
        totalItemsCost: orders.totalItemsCost,
        totalShippingCost: orders.totalShippingCost,
        grandTotal: orders.grandTotal,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    if (orderRows.length === 0) {
      return jsonSuccess([]);
    }

    const orderIds = orderRows.map((o) => o.id);

    const subOrderRows = await db
      .select({
        id: subOrders.id,
        orderId: subOrders.orderId,
        status: subOrders.status,
        codAmount: subOrders.codAmount,
        itemsTotal: subOrders.itemsTotal,
        shippingFeeCustomer: subOrders.shippingFeeCustomer,
        createdAt: subOrders.createdAt,
      })
      .from(subOrders)
      .where(inArray(subOrders.orderId, orderIds));

    const subOrderIds = subOrderRows.map((s) => s.id);

    let itemRows: {
      id: string;
      subOrderId: string;
      productId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      productName: string;
      productImages: unknown;
    }[] = [];

    if (subOrderIds.length > 0) {
      itemRows = await db
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
    }

    // Group items by sub_order
    const itemsBySubOrder = new Map<string, typeof itemRows>();
    for (const item of itemRows) {
      const list = itemsBySubOrder.get(item.subOrderId) ?? [];
      list.push(item);
      itemsBySubOrder.set(item.subOrderId, list);
    }

    // Group sub_orders by order
    const subsByOrder = new Map<string, typeof subOrderRows>();
    for (const sub of subOrderRows) {
      const list = subsByOrder.get(sub.orderId) ?? [];
      list.push(sub);
      subsByOrder.set(sub.orderId, list);
    }

    const data = orderRows.map((order) => ({
      ...order,
      subOrders: (subsByOrder.get(order.id) ?? []).map((sub) => ({
        ...sub,
        items: (itemsBySubOrder.get(sub.id) ?? []).map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          product: {
            name: item.productName,
            imageUrl:
              (item.productImages as { url: string }[])?.[0]?.url ?? null,
          },
        })),
      })),
    }));

    return jsonSuccess(data);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === AUTH_GUARD_ERRORS.SESSION_REQUIRED) {
        return jsonError(err.message, 401);
      }
    }
    console.error('GET /api/retailer/orders error:', err);
    return jsonError('Failed to load orders', 500);
  }
}
