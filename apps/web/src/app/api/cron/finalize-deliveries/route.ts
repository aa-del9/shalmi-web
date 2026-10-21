import type { NextRequest } from 'next/server';
import { and, eq, inArray, lt, sql } from 'drizzle-orm';
import { db, orders, subOrders } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { serverEnv } from '@/modules/core/env/server';

/**
 * Auto-finalize deliveries.
 *
 * Since there is no courier-side delivery confirmation, we assume a
 * sub-order is delivered 24h after the vendor marks it
 * `handed_to_courier` (i.e. `handed_at < now() - 24h`).
 *
 * Pass 1: flip those sub-orders to `delivered`.
 * Pass 2: for any orders touched, if every sub-order is now `delivered`,
 * roll the parent `orders.status` up to `completed`.
 *
 * Triggered by Vercel Cron (see `apps/web/vercel.json`). Idempotent —
 * re-runs are no-ops.
 */

const DELIVERY_DELAY_HOURS = 24;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const expected = serverEnv.CRON_SECRET;
  if (expected == null || expected === '') {
    return jsonError('CRON_SECRET is not configured', 500);
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${expected}`) {
    return jsonError('Unauthorized', 401);
  }

  try {
    const cutoff = new Date(Date.now() - DELIVERY_DELAY_HOURS * 60 * 60 * 1000);
    const now = new Date();

    const flipped = await db
      .update(subOrders)
      .set({ status: 'delivered', updatedAt: now })
      .where(
        and(
          eq(subOrders.status, 'handed_to_courier'),
          lt(subOrders.handedAt, cutoff)
        )
      )
      .returning({ id: subOrders.id, orderId: subOrders.orderId });

    const touchedOrderIds = Array.from(new Set(flipped.map((s) => s.orderId)));

    let completedOrderCount = 0;
    if (touchedOrderIds.length > 0) {
      const completed = await db
        .update(orders)
        .set({ status: 'completed', updatedAt: now })
        .where(
          and(
            inArray(orders.id, touchedOrderIds),
            sql`NOT EXISTS (
              SELECT 1 FROM ${subOrders}
              WHERE ${subOrders.orderId} = ${orders.id}
                AND ${subOrders.status} <> 'delivered'
            )`
          )
        )
        .returning({ id: orders.id });

      completedOrderCount = completed.length;
    }

    return jsonSuccess({
      cutoff: cutoff.toISOString(),
      subOrdersDelivered: flipped.length,
      ordersCompleted: completedOrderCount,
    });
  } catch (err) {
    console.error('GET /api/cron/finalize-deliveries error:', err);
    return jsonError('Cron job failed', 500);
  }
}
