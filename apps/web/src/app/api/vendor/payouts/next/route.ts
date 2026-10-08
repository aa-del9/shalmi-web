import type { NextRequest } from 'next/server';
import { and, asc, eq } from 'drizzle-orm';
import { db, payoutRuns } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireVendor } from '@/modules/auth/server/guards/require-role';
import { getVendorIdFromSession } from '@/modules/auth/server/get-vendor-id-from-session';

/**
 * Next pending payout for the dashboard "Payout pending" tile + the
 * "Next payout" callout. Returns the earliest pending row for this
 * vendor, or null if none.
 *
 * Per `features/vendor-payouts/surface-map.md`: callout body composes
 * `${bankName} account ending ${ibanLast4}` from the vendors row; the
 * release date is `weekEnd + 1 day` (Friday after the cycle window).
 *
 * Cycle-roll job (Friday) lives outside this read endpoint — STUBBED in
 * this batch (see implementation log deviation).
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
        netAmountCents: payoutRuns.netAmountCents,
        status: payoutRuns.status,
      })
      .from(payoutRuns)
      .where(
        and(eq(payoutRuns.vendorId, vendorId), eq(payoutRuns.status, 'pending'))
      )
      .orderBy(asc(payoutRuns.weekStart))
      .limit(1);

    if (!pending) {
      return jsonSuccess({ nextPayout: null });
    }

    return jsonSuccess({
      nextPayout: {
        id: pending.id,
        weekStart: pending.weekStart,
        weekEnd: pending.weekEnd,
        netAmountCents: pending.netAmountCents,
        status: pending.status,
      },
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
    console.error('GET /api/vendor/payouts/next error:', err);
    return jsonError('Failed to load next payout.', 500);
  }
}
