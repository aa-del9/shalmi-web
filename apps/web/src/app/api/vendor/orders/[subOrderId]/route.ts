import type { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db, subOrders } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireVendor } from '@/modules/auth/server/guards/require-role';
import { getVendorIdFromSession } from '@/modules/auth/server/get-vendor-id-from-session';

const ALLOWED_TRANSITIONS: Record<string, string> = {
  pending: 'packed',
  packed: 'handed_to_courier',
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ subOrderId: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    requireVendor(session);

    const vendorId = await getVendorIdFromSession(session);
    if (!vendorId) {
      return jsonError('Vendor record not found', 403);
    }

    const { subOrderId } = await params;

    const [existing] = await db
      .select({ id: subOrders.id, status: subOrders.status })
      .from(subOrders)
      .where(
        and(eq(subOrders.id, subOrderId), eq(subOrders.vendorId, vendorId))
      )
      .limit(1);

    if (!existing) {
      return jsonError('Sub-order not found', 404);
    }

    const nextStatus = ALLOWED_TRANSITIONS[existing.status];
    if (!nextStatus) {
      return jsonError(
        `Cannot advance from status "${existing.status}"`,
        400
      );
    }

    const now = new Date();
    await db
      .update(subOrders)
      .set({
        status: nextStatus,
        updatedAt: now,
        ...(nextStatus === 'handed_to_courier' ? { handedAt: now } : {}),
      })
      .where(eq(subOrders.id, subOrderId));

    return jsonSuccess({ id: subOrderId, status: nextStatus });
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
    console.error('PATCH /api/vendor/orders/[subOrderId] error:', err);
    return jsonError('Failed to update order status.', 500);
  }
}
