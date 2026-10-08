import type { NextRequest } from 'next/server';
import { eq, asc, inArray, and, sql } from 'drizzle-orm';
import {
  db,
  subOrders,
  orderItems,
  products,
  orders,
} from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireVendor } from '@/modules/auth/server/guards/require-role';
import { getVendorIdFromSession } from '@/modules/auth/server/get-vendor-id-from-session';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    requireVendor(session);

    const vendorId = await getVendorIdFromSession(session);
    if (!vendorId) {
      return jsonError('Vendor record not found', 403);
    }

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

    // TODO(post-v1): consume `meta.pendingCount` from the vendor sidebar
    // badge once the chrome revamp lands in Batch 4 (per buyer-orders
    // gap-analysis Q2).
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
      return jsonSuccess({ subOrders: [], meta });
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

    const data = subOrderRows.map((so) => ({
      ...so,
      items: (itemsBySubOrder.get(so.id) ?? []).map((item) => ({
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
    }));

    return jsonSuccess({ subOrders: data, meta });
  } catch (err) {
    if (err instanceof Error) {
      const message = err.message;
      if (
        message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ||
        message === AUTH_GUARD_ERRORS.SESSION_REQUIRED
      ) {
        const status =
          message === AUTH_GUARD_ERRORS.SESSION_REQUIRED ? 401 : 403;
        return jsonError(message, status);
      }
    }
    console.error('GET /api/vendor/orders error:', err);
    return jsonError('Failed to load orders.', 500);
  }
}
