import type { NextRequest } from 'next/server';
import { listVendorOrders } from '@repo/services/vendor/orders';
import { NotFoundError, ValidationError } from '@repo/services/errors';
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

    const result = await listVendorOrders({ vendorId });
    return jsonSuccess(result);
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
    if (err instanceof ValidationError) {
      return jsonError(err.message, 400);
    }
    if (err instanceof NotFoundError) {
      return jsonError(err.message, 404);
    }
    console.error('GET /api/vendor/orders error:', err);
    return jsonError('Failed to load orders.', 500);
  }
}
