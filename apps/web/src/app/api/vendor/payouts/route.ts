import type { NextRequest } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db, payoutRuns } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireVendor } from '@/modules/auth/server/guards/require-role';
import { getVendorIdFromSession } from '@/modules/auth/server/get-vendor-id-from-session';

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 50;

/**
 * Vendor payout history feed for `/vendor/ledger`.
 *
 * Returns the most recent N payout_runs (active pending + paid) ordered
 * by weekEnd DESC. Pagination is page-of-N keyed by `?limit=`. Per
 * gap-analysis Q20: cursor-by-week-end is desktop-only; mobile drops
 * the "View older weeks" link.
 *
 * Lifetime totals (footer) are STUBBED post-v1 per gap-analysis Q19;
 * the response carries `null` for those fields.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    requireVendor(session);

    const vendorId = await getVendorIdFromSession(session);
    if (!vendorId) return jsonError('Vendor record not found', 403);

    const limitRaw = Number(request.nextUrl.searchParams.get('limit'));
    const limit = Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(limitRaw, MAX_LIMIT)
      : DEFAULT_LIMIT;

    const rows = await db
      .select({
        id: payoutRuns.id,
        weekStart: payoutRuns.weekStart,
        weekEnd: payoutRuns.weekEnd,
        paidOn: payoutRuns.paidOn,
        txnId: payoutRuns.txnId,
        completedOrdersCount: payoutRuns.completedOrdersCount,
        netAmountCents: payoutRuns.netAmountCents,
        status: payoutRuns.status,
      })
      .from(payoutRuns)
      .where(eq(payoutRuns.vendorId, vendorId))
      .orderBy(desc(payoutRuns.weekEnd))
      .limit(limit);

    return jsonSuccess({
      runs: rows,
      // TODO(post-v1): wire lifetime totals (gap-analysis Q19 STUBBED).
      lifetime: null as null | {
        totalNetAmountCents: number;
        weeksCount: number;
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
    console.error('GET /api/vendor/payouts error:', err);
    return jsonError('Failed to load payout history.', 500);
  }
}
