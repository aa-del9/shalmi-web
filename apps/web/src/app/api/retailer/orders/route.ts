import type { NextRequest } from 'next/server';
import { eq, desc, asc, inArray, ilike, or, exists, and, sql } from 'drizzle-orm';
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

type SortKey = 'newest' | 'oldest';

function parseSort(value: string | null): SortKey {
  return value === 'oldest' ? 'oldest' : 'newest';
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    requireSession(session);

    const userId = (session.user as { id: string }).id;

    const url = new URL(req.url);
    const q = url.searchParams.get('q')?.trim() ?? '';
    const sort = parseSort(url.searchParams.get('sort'));

    // Lifetime aggregates (always over the user's full order set,
    // independent of `q` so the subtitle metric doesn't drop when the
    // user searches — see buyer-orders gap-analysis Q4).
    const summaryRows = await db
      .select({
        count: sql<number>`COUNT(*)::int`,
        lifetimeTotalCents: sql<number>`COALESCE(SUM(${orders.grandTotal}), 0)::int`,
      })
      .from(orders)
      .where(eq(orders.userId, userId));

    const summaryRow = summaryRows[0] ?? { count: 0, lifetimeTotalCents: 0 };
    const summary = {
      count: Number(summaryRow.count),
      lifetimeTotalCents: Number(summaryRow.lifetimeTotalCents),
    };

    // Filter clause: `q` matches displayId OR product name (via subquery
    // EXISTS so an order with multiple matching products doesn't
    // duplicate the row in the parent select).
    const matchesProductName = exists(
      db
        .select({ id: orderItems.id })
        .from(orderItems)
        .innerJoin(subOrders, eq(orderItems.subOrderId, subOrders.id))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(
          and(
            eq(subOrders.orderId, orders.id),
            ilike(products.name, `%${q}%`)
          )
        )
    );

    const whereClause = q
      ? and(
          eq(orders.userId, userId),
          or(ilike(orders.displayId, `%${q}%`), matchesProductName)
        )
      : eq(orders.userId, userId);

    const orderRows = await db
      .select({
        id: orders.id,
        displayId: orders.displayId,
        status: orders.status,
        totalItemsCost: orders.totalItemsCost,
        totalShippingCost: orders.totalShippingCost,
        grandTotal: orders.grandTotal,
        shippingCity: orders.shippingCity,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(whereClause)
      .orderBy(
        sort === 'oldest' ? asc(orders.createdAt) : desc(orders.createdAt)
      );

    if (orderRows.length === 0) {
      return jsonSuccess({ orders: [], summary });
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
        weightGrams: subOrders.weightGrams,
        handedAt: subOrders.handedAt,
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
        handedAt: sub.handedAt ? sub.handedAt.toISOString() : null,
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

    return jsonSuccess({ orders: data, summary });
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
