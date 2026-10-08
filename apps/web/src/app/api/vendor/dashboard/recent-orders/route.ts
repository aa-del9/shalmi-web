import type { NextRequest } from 'next/server';
import { eq, desc, inArray, sql } from 'drizzle-orm';
import {
  db,
  subOrders,
  orders,
  orderItems,
  user,
  addresses,
} from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireVendor } from '@/modules/auth/server/guards/require-role';
import { getVendorIdFromSession } from '@/modules/auth/server/get-vendor-id-from-session';

/**
 * Recent vendor sub-orders for the dashboard's "RECENT ORDERS · Last 5
 * orders today" panel. Per gap-analysis:
 *  - Q14: keep `ORD-` displayId prefix as-is (Pencil `SH-` is decorative).
 *  - Q15: buyer "shop name" STUBBED — fall back to `user.name` until
 *    `user.businessName` lands in Batch 5 (buyer-settings).
 *  - Q23: viewport-driven row count (5 desktop, 3 mobile). API returns
 *    up to 5; client trims for mobile.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    requireVendor(session);

    const vendorId = await getVendorIdFromSession(session);
    if (!vendorId) return jsonError('Vendor record not found', 403);

    const rows = await db
      .select({
        id: subOrders.id,
        orderId: subOrders.orderId,
        status: subOrders.status,
        codAmount: subOrders.codAmount,
        weightGrams: subOrders.weightGrams,
        createdAt: subOrders.createdAt,
        orderDisplayId: orders.displayId,
        userName: user.name,
        shippingCity: orders.shippingCity,
        defaultAddressCity: addresses.city,
      })
      .from(subOrders)
      .innerJoin(orders, eq(subOrders.orderId, orders.id))
      .leftJoin(user, eq(orders.userId, user.id))
      .leftJoin(addresses, eq(orders.addressId, addresses.id))
      .where(eq(subOrders.vendorId, vendorId))
      .orderBy(desc(subOrders.createdAt))
      .limit(5);

    if (rows.length === 0) {
      return jsonSuccess([]);
    }

    const subOrderIds = rows.map((r) => r.id);

    const itemCountRows = await db
      .select({
        subOrderId: orderItems.subOrderId,
        qty: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)::int`,
      })
      .from(orderItems)
      .where(inArray(orderItems.subOrderId, subOrderIds))
      .groupBy(orderItems.subOrderId);

    const itemCountBy = new Map<string, number>();
    for (const r of itemCountRows) {
      itemCountBy.set(r.subOrderId, Number(r.qty ?? 0));
    }

    const data = rows.map((row) => ({
      id: row.id,
      orderDisplayId: row.orderDisplayId,
      status: row.status,
      codAmount: row.codAmount,
      weightGrams: row.weightGrams,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : row.createdAt,
      // STUBBED — see 06-scope-cut.md feature: Buyer business name
      // (`user.businessName`). Fall back to `user.name` until Batch 5.
      // TODO(post-v1): prefer `user.businessName` once landed.
      buyerLabel: row.userName ?? 'Customer',
      buyerCity: row.shippingCity || row.defaultAddressCity || '',
      itemCount: itemCountBy.get(row.id) ?? 0,
    }));

    return jsonSuccess(data);
  } catch (err) {
    if (err instanceof Error) {
      const message = err.message;
      if (
        message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ||
        message === AUTH_GUARD_ERRORS.SESSION_REQUIRED
      ) {
        const status = message === AUTH_GUARD_ERRORS.SESSION_REQUIRED ? 401 : 403;
        return jsonError(message, status);
      }
    }
    console.error('GET /api/vendor/dashboard/recent-orders error:', err);
    return jsonError('Failed to load recent orders.', 500);
  }
}
