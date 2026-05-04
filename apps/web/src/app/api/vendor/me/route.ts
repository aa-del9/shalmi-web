import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, vendors } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireVendor } from '@/modules/auth/server/guards/require-role';
import { getVendorIdFromSession } from '@/modules/auth/server/get-vendor-id-from-session';

/**
 * Vendor self-profile read used by the dashboard header + payouts callout.
 *
 * Returns the small slice of `vendors` the chrome / dashboard needs:
 * shopName + fullName + hub + city + bankName + masked IBAN last-4.
 *
 * TODO(post-v1): expand to include logo / displayId / address / pendingOrders
 * count once the vendor-enrichment scope-cut feature lands and the chrome
 * top-bar revamp is wired.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    requireVendor(session);

    const vendorId = await getVendorIdFromSession(session);
    if (!vendorId) {
      return jsonError('Vendor record not found', 403);
    }

    const [row] = await db
      .select({
        id: vendors.id,
        shopName: vendors.shopName,
        fullName: vendors.fullName,
        hub: vendors.hub,
        city: vendors.city,
        bankName: vendors.bankName,
        iban: vendors.iban,
      })
      .from(vendors)
      .where(eq(vendors.id, vendorId))
      .limit(1);

    if (!row) {
      return jsonError('Vendor record not found', 404);
    }

    const ibanLast4 = (row.iban ?? '').replace(/\s+/g, '').slice(-4);

    return jsonSuccess({
      id: row.id,
      shopName: row.shopName,
      fullName: row.fullName,
      hub: row.hub,
      city: row.city,
      bankName: row.bankName,
      ibanLast4,
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
    console.error('GET /api/vendor/me error:', err);
    return jsonError('Failed to load vendor profile.', 500);
  }
}
