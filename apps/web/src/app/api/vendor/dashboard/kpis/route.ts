import type { NextRequest } from 'next/server';
import { and, count, eq, gte, sum, lte, sql } from 'drizzle-orm';
import { db, products, subOrders } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireVendor } from '@/modules/auth/server/guards/require-role';
import { getVendorIdFromSession } from '@/modules/auth/server/get-vendor-id-from-session';

/**
 * Vendor dashboard KPI aggregates.
 *
 * Per gap-analysis Q11 binding ("gross order value for now") revenue is
 * `sum(sub_orders.codAmount)` for the current calendar month. Only
 * non-cancelled rows count.
 *
 * Per scope-cut "Vendor sales analytics" (STUBBED): KPI deltas + chart
 * series are DEFERRED. Only the visible counts ship.
 *
 * Low-stock pill count uses a constant threshold (10) per Batch 4
 * watchout: "vendor-dashboard low-stock card uses constant threshold per
 * scope-cut placeholder".
 *
 * TODO(post-v1): switch to per-product `lowStockThreshold` (lands with
 * vendor-products) + add WoW/MoM deltas.
 */
const LOW_STOCK_THRESHOLD = 10;

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    requireVendor(session);

    const vendorId = await getVendorIdFromSession(session);
    if (!vendorId) return jsonError('Vendor record not found', 403);

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Today's status counts (NEW = pending, PACKED = packed).
    const todayStatusRows = await db
      .select({
        status: subOrders.status,
        rowCount: count(),
      })
      .from(subOrders)
      .where(
        and(
          eq(subOrders.vendorId, vendorId),
          gte(subOrders.createdAt, startOfDay),
          lte(subOrders.createdAt, endOfDay)
        )
      )
      .groupBy(subOrders.status);

    const todayBuckets = todayStatusRows.reduce(
      (acc, row) => {
        acc[row.status as string] = Number(row.rowCount ?? 0);
        return acc;
      },
      {} as Record<string, number>
    );
    const ordersToday = Object.values(todayBuckets).reduce((s, n) => s + n, 0);
    const newToday = todayBuckets.pending ?? 0;
    const packedToday = todayBuckets.packed ?? 0;

    // Revenue MTD — gross COD value, exclude cancelled (Q11 binding).
    const [revRow] = await db
      .select({ totalCents: sum(subOrders.codAmount) })
      .from(subOrders)
      .where(
        and(
          eq(subOrders.vendorId, vendorId),
          gte(subOrders.createdAt, startOfMonth),
          sql`${subOrders.createdAt} < ${startOfNextMonth.toISOString()}`,
          sql`${subOrders.status} <> 'cancelled'`
        )
      );

    // Active listings + low-stock count.
    // Active = not draft (status enum lands with vendor-products this batch).
    // Until the column exists, treat all rows as "active" — the
    // `vendor-products` commit will add the predicate in the same batch.
    const [productsRow] = await db
      .select({ totalCount: count() })
      .from(products)
      .where(eq(products.vendorId, vendorId));

    const [lowStockRow] = await db
      .select({ totalCount: count() })
      .from(products)
      .where(
        and(
          eq(products.vendorId, vendorId),
          sql`${products.stock} > 0`,
          sql`${products.stock} <= ${LOW_STOCK_THRESHOLD}`
        )
      );

    return jsonSuccess({
      ordersToday,
      newToday,
      packedToday,
      revenueMtdCents: Number(revRow?.totalCents ?? 0),
      activeListings: Number(productsRow?.totalCount ?? 0),
      lowStockCount: Number(lowStockRow?.totalCount ?? 0),
    });
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
    console.error('GET /api/vendor/dashboard/kpis error:', err);
    return jsonError('Failed to load dashboard KPIs.', 500);
  }
}
