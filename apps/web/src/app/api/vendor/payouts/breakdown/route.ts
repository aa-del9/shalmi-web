import type { NextRequest } from 'next/server';
import { and, asc, eq } from 'drizzle-orm';
import { db, payoutRuns } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireVendor } from '@/modules/auth/server/guards/require-role';
import { getVendorIdFromSession } from '@/modules/auth/server/get-vendor-id-from-session';

/**
 * Vendor active-cycle breakdown for the ledger Breakdown card.
 *
 * Reads the active pending `payout_runs` row for this vendor and
 * returns its snapshotted columns (gross / returns / mnp / net /
 * completed orders count). Per gap-analysis Q4 the active week is a
 * draft row that the cycle-roll job upserts continuously — this batch
 * just reads what's there.
 *
 * `itemsPackedCount` and `weightShippedGrams` are STUBBED post-v1 per
 * Q4 (live aggregation off `order_items` / `sub_orders` is the
 * cycle-roll job's responsibility, not this read endpoint).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    requireVendor(session);

    const vendorId = await getVendorIdFromSession(session);
    if (!vendorId) return jsonError('Vendor record not found', 403);

    const [pending] = await db
      .select({
        id: payoutRuns.id,
        weekStart: payoutRuns.weekStart,
        weekEnd: payoutRuns.weekEnd,
        completedOrdersCount: payoutRuns.completedOrdersCount,
        grossAmountCents: payoutRuns.grossAmountCents,
        returnsAmountCents: payoutRuns.returnsAmountCents,
        mnpReimbursementCents: payoutRuns.mnpReimbursementCents,
        netAmountCents: payoutRuns.netAmountCents,
      })
      .from(payoutRuns)
      .where(
        and(eq(payoutRuns.vendorId, vendorId), eq(payoutRuns.status, 'pending'))
      )
      .orderBy(asc(payoutRuns.weekStart))
      .limit(1);

    return jsonSuccess({
      breakdown: pending
        ? {
            id: pending.id,
            weekStart: pending.weekStart,
            weekEnd: pending.weekEnd,
            completedOrdersCount: pending.completedOrdersCount,
            grossAmountCents: pending.grossAmountCents,
            returnsAmountCents: pending.returnsAmountCents,
            mnpReimbursementCents: pending.mnpReimbursementCents,
            netAmountCents: pending.netAmountCents,
            // TODO(post-v1): derive from delivered sub_orders (gap-analysis Q4 STUBBED).
            itemsPackedCount: null as number | null,
            weightShippedGrams: null as number | null,
          }
        : null,
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
    console.error('GET /api/vendor/payouts/breakdown error:', err);
    return jsonError('Failed to load payout breakdown.', 500);
  }
}
