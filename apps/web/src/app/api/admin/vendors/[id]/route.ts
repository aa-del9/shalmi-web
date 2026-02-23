import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, user, vendors } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireAdmin } from '@/modules/auth/server/guards/require-role';
import { updateVendorSchema } from '@/modules/admin/admin-vendors/schemas';
import type { VendorDetail } from '@/modules/admin/admin-vendors/types';
import { POSTGRES_UNIQUE_VIOLATION } from '@repo/constants/postgres';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getSessionFromRequest(request);
    requireAdmin(session);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : AUTH_GUARD_ERRORS.SESSION_REQUIRED;
    const status = message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ? 403 : 401;
    return jsonError(message, status);
  }

  const { id } = await context.params;
  if (!id) {
    return jsonError('Vendor ID is required', 400);
  }

  try {
    const rows = await db
      .select({
        id: vendors.id,
        phoneNumber: user.phoneNumber,
        shopName: vendors.shopName,
        city: vendors.city,
        marketHub: vendors.hub,
        isActive: vendors.isActive,
        bankName: vendors.bankName,
        accountTitle: vendors.accountTitle,
        iban: vendors.iban,
      })
      .from(vendors)
      .innerJoin(user, eq(vendors.userId, user.id))
      .where(eq(vendors.id, id))
      .limit(1);

    const row = rows[0];
    if (!row) {
      return jsonError('Vendor not found', 404);
    }

    const data: VendorDetail = {
      id: row.id,
      phoneNumber: row.phoneNumber,
      shopName: row.shopName,
      city: row.city,
      marketHub: row.marketHub,
      isActive: row.isActive,
      bankDetails: {
        bankName: row.bankName,
        accountTitle: row.accountTitle,
        iban: row.iban,
      },
    };

    return jsonSuccess(data);
  } catch (err) {
    console.error('GET /api/admin/vendors/[id] error:', err);
    return jsonError('Failed to load vendor.', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getSessionFromRequest(request);
    requireAdmin(session);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : AUTH_GUARD_ERRORS.SESSION_REQUIRED;
    const status = message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ? 403 : 401;
    return jsonError(message, status);
  }

  const { id } = await context.params;
  if (!id) {
    return jsonError('Vendor ID is required', 400);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = updateVendorSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.flatten().formErrors[0] ?? 'Invalid input';
    return jsonError(message, 400);
  }

  const { phoneNumber, shopName, marketHub, bankDetails, isActive } =
    parsed.data;

  try {
    const [existing] = await db
      .select({ userId: vendors.userId })
      .from(vendors)
      .where(eq(vendors.id, id))
      .limit(1);

    if (!existing) {
      return jsonError('Vendor not found', 404);
    }

    await db.transaction(async (tx) => {
      await tx
        .update(user)
        .set({
          name: shopName,
          phoneNumber,
          updatedAt: new Date(),
        })
        .where(eq(user.id, existing.userId));

      await tx
        .update(vendors)
        .set({
          shopName,
          hub: marketHub,
          bankName: bankDetails.bankName,
          accountTitle: bankDetails.accountTitle,
          iban: bankDetails.iban,
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(vendors.id, id));
    });

    return jsonSuccess();
  } catch (err) {
    if (err instanceof Error) {
      if (
        err.message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ||
        err.message === AUTH_GUARD_ERRORS.SESSION_REQUIRED
      ) {
        return jsonError(err.message, 403);
      }
    }

    const pgErr = err as { code?: string };
    if (pgErr?.code === POSTGRES_UNIQUE_VIOLATION) {
      return jsonError('This phone number is already registered.', 409);
    }

    console.error('PATCH /api/admin/vendors/[id] error:', err);
    return jsonError('Failed to update vendor. Please try again.', 500);
  }
}
