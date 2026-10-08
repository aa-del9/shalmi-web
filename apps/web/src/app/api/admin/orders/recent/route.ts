import type { NextRequest } from 'next/server';
import { desc, eq, inArray, sum } from 'drizzle-orm';
import {
  db,
  orderItems,
  orders,
  subOrders,
  user,
} from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireAdmin } from '@/modules/auth/server/guards/require-role';

/**
 * Returns the N most recent orders with rolled-up sub-order status,
 * items count, weight and customer name. Per Q-RT-3 binding the rollup
 * helper lives client-side; the API returns sub-order rows so the
 * client can derive the display state.
 *
 * Q-RT-1 binding: customer cell uses `user.businessName` STUBBED. That
 * column lands in Batch 5 (`buyer-settings`); for now we return only
 * `user.name` and the client renders shop slot blank.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    requireAdmin(session);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : AUTH_GUARD_ERRORS.SESSION_REQUIRED;
    const status = message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ? 403 : 401;
    return jsonError(message, status);
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.max(
    1,
    Math.min(20, Number(searchParams.get('limit')) || 7)
  );

  try {
    const orderRows = await db
      .select({
        id: orders.id,
        displayId: orders.displayId,
        userId: orders.userId,
        grandTotal: orders.grandTotal,
        status: orders.status,
        createdAt: orders.createdAt,
        customerName: user.name,
      })
      .from(orders)
      .innerJoin(user, eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt))
      .limit(limit);

    if (orderRows.length === 0) {
      return jsonSuccess([]);
    }

    const orderIds = orderRows.map((row) => row.id);

    const subRows = await db
      .select({
        orderId: subOrders.orderId,
        status: subOrders.status,
        weightGrams: subOrders.weightGrams,
      })
      .from(subOrders)
      .where(inArray(subOrders.orderId, orderIds));

    const itemsRows = await db
      .select({
        orderId: subOrders.orderId,
        totalQty: sum(orderItems.quantity),
      })
      .from(orderItems)
      .innerJoin(subOrders, eq(orderItems.subOrderId, subOrders.id))
      .where(inArray(subOrders.orderId, orderIds))
      .groupBy(subOrders.orderId);

    const subStatusByOrder = new Map<string, string[]>();
    const weightByOrder = new Map<string, number>();
    for (const row of subRows) {
      const list = subStatusByOrder.get(row.orderId) ?? [];
      list.push(row.status);
      subStatusByOrder.set(row.orderId, list);
      weightByOrder.set(
        row.orderId,
        (weightByOrder.get(row.orderId) ?? 0) + (row.weightGrams ?? 0)
      );
    }

    const itemsByOrder = new Map<string, number>();
    for (const row of itemsRows) {
      itemsByOrder.set(row.orderId, Number(row.totalQty ?? 0));
    }

    const data = orderRows.map((row) => ({
      id: row.id,
      displayId: row.displayId,
      customerName: row.customerName,
      grandTotal: row.grandTotal,
      orderStatus: row.status,
      subOrderStatuses: subStatusByOrder.get(row.id) ?? [],
      itemsCount: itemsByOrder.get(row.id) ?? 0,
      weightGrams: weightByOrder.get(row.id) ?? 0,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : (row.createdAt as unknown as string),
    }));

    return jsonSuccess(data);
  } catch (err) {
    console.error('GET /api/admin/orders/recent error:', err);
    return jsonError('Failed to load recent orders.', 500);
  }
}
