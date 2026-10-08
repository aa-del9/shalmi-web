import type { NextRequest } from 'next/server';
import { and, count, eq, isNull, sql, sum } from 'drizzle-orm';
import {
  db,
  orders,
  products,
  subOrders,
  vendors,
} from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireAdmin } from '@/modules/auth/server/guards/require-role';

/**
 * Cheap dashboard KPI aggregates. Per scope-cut "Admin analytics
 * dashboard" (STUBBED) only the visible counts are returned; deltas /
 * comparison periods are DEFERRED.
 *
 * TODO(post-v1): expand with month-over-month deltas + range filter
 * (Q-RNG-1, Q-KPI-3 binding answers) once the analytics subsystem
 * lands.
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

  try {
    const [salesRow] = await db
      .select({ totalCents: sum(orders.grandTotal) })
      .from(orders);
    const [productsRow] = await db
      .select({ totalCount: count() })
      .from(products);
    const [ordersRow] = await db
      .select({ totalCount: count() })
      .from(orders);
    const [vendorsRow] = await db
      .select({ totalCount: count() })
      .from(vendors)
      .where(and(eq(vendors.isActive, true), isNull(vendors.deletedAt)));

    // Order status buckets via sub_orders (cheapest source per Q-OS-1).
    const statusRows = await db
      .select({
        status: subOrders.status,
        rowCount: count(),
      })
      .from(subOrders)
      .groupBy(subOrders.status);
    const statusBuckets = statusRows.reduce(
      (acc, row) => {
        acc[row.status as string] = Number(row.rowCount ?? 0);
        return acc;
      },
      {} as Record<string, number>
    );

    const pending =
      (statusBuckets.pending ?? 0) +
      (statusBuckets.packed ?? 0) +
      (statusBuckets.handed_to_courier ?? 0);
    const delivered = statusBuckets.delivered ?? 0;
    const cancelled = statusBuckets.cancelled ?? 0;

    // Avg fulfillment days from `handedAt - createdAt` on handed sub-orders.
    const [fulfillmentRow] = await db
      .select({
        avgDays: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${subOrders.handedAt} - ${subOrders.createdAt})) / 86400.0), 0)`,
      })
      .from(subOrders)
      .where(sql`${subOrders.handedAt} IS NOT NULL`);

    return jsonSuccess({
      totalSalesCents: Number(salesRow?.totalCents ?? 0),
      totalProducts: Number(productsRow?.totalCount ?? 0),
      totalOrders: Number(ordersRow?.totalCount ?? 0),
      activeVendors: Number(vendorsRow?.totalCount ?? 0),
      orderStatus: {
        pending,
        delivered,
        cancelled,
        avgFulfillmentDays: Number(fulfillmentRow?.avgDays ?? 0),
        slaTargetDays: 2,
      },
    });
  } catch (err) {
    console.error('GET /api/admin/dashboard/kpis error:', err);
    return jsonError('Failed to load dashboard KPIs.', 500);
  }
}
