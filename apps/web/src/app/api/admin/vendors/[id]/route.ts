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

export async function GET(request: NextRequest, context: RouteContext) {
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
        displayId: vendors.displayId,
        fullName: vendors.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        shopName: vendors.shopName,
        city: vendors.city,
        address: vendors.address,
        marketHub: vendors.hub,
        logoUrl: vendors.logoUrl,
        isActive: vendors.isActive,
        createdAt: vendors.createdAt,
        bankName: vendors.bankName,
        accountTitle: vendors.accountTitle,
        iban: vendors.iban,
        whatsappFirstSeenAt: user.whatsappFirstSeenAt,
        whatsappLastSeenAt: user.whatsappLastSeenAt,
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
      displayId: row.displayId,
      fullName: row.fullName ?? null,
      phoneNumber: row.phoneNumber,
      email: row.email ?? null,
      shopName: row.shopName,
      city: row.city,
      address: row.address ?? null,
      marketHub: row.marketHub,
      logoUrl: row.logoUrl ?? null,
      isActive: row.isActive,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : (row.createdAt as unknown as string),
      bankDetails: {
        bankName: row.bankName,
        accountTitle: row.accountTitle,
        iban: row.iban,
      },
      whatsappFirstSeenAt:
        row.whatsappFirstSeenAt instanceof Date
          ? row.whatsappFirstSeenAt.toISOString()
          : (row.whatsappFirstSeenAt as unknown as string | null) ?? null,
      whatsappLastSeenAt:
        row.whatsappLastSeenAt instanceof Date
          ? row.whatsappLastSeenAt.toISOString()
          : (row.whatsappLastSeenAt as unknown as string | null) ?? null,
    };

    return jsonSuccess(data);
  } catch (err) {
    console.error('GET /api/admin/vendors/[id] error:', err);
    return jsonError('Failed to load vendor.', 500);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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

  const data = parsed.data;

  try {
    const [existing] = await db
      .select({ userId: vendors.userId })
      .from(vendors)
      .where(eq(vendors.id, id))
      .limit(1);

    if (!existing) {
      return jsonError('Vendor not found', 404);
    }

    const userPatch: {
      name?: string;
      phoneNumber?: string;
      email?: string;
      updatedAt: Date;
    } = { updatedAt: new Date() };

    const vendorPatch: {
      fullName?: string;
      shopName?: string;
      address?: string | null;
      hub?: string;
      logoUrl?: string | null;
      bankName?: string;
      accountTitle?: string;
      iban?: string;
      isActive?: boolean;
      updatedAt: Date;
    } = { updatedAt: new Date() };

    if (data.fullName !== undefined) {
      vendorPatch.fullName = data.fullName;
      userPatch.name = data.fullName;
    } else if (data.shopName !== undefined) {
      // legacy fallback: keep user.name in sync with shopName when fullName not edited
      userPatch.name = data.shopName;
    }
    if (data.shopName !== undefined) vendorPatch.shopName = data.shopName;
    if (data.marketHub !== undefined) vendorPatch.hub = data.marketHub;
    if (data.address !== undefined)
      vendorPatch.address = data.address === '' ? null : data.address;
    if (data.logoUrl !== undefined)
      vendorPatch.logoUrl = data.logoUrl === '' ? null : data.logoUrl;
    if (data.isActive !== undefined) vendorPatch.isActive = data.isActive;
    if (data.bankDetails) {
      if (data.bankDetails.bankName !== undefined)
        vendorPatch.bankName = data.bankDetails.bankName;
      if (data.bankDetails.accountTitle !== undefined)
        vendorPatch.accountTitle = data.bankDetails.accountTitle;
      if (data.bankDetails.iban !== undefined)
        vendorPatch.iban = data.bankDetails.iban;
    }

    if (data.phoneNumber !== undefined) userPatch.phoneNumber = data.phoneNumber;
    if (data.email !== undefined && data.email !== '') {
      userPatch.email = data.email;
    }

    await db.transaction(async (tx) => {
      const userKeys = Object.keys(userPatch);
      if (userKeys.length > 1) {
        await tx
          .update(user)
          .set(userPatch)
          .where(eq(user.id, existing.userId));
      }
      const vendorKeys = Object.keys(vendorPatch);
      if (vendorKeys.length > 1) {
        await tx.update(vendors).set(vendorPatch).where(eq(vendors.id, id));
      }
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
      return jsonError('This phone number or email is already registered.', 409);
    }

    console.error('PATCH /api/admin/vendors/[id] error:', err);
    return jsonError('Failed to update vendor. Please try again.', 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
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
    const [updated] = await db
      .update(vendors)
      .set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning({ id: vendors.id });

    if (!updated) {
      return jsonError('Vendor not found', 404);
    }
    return jsonSuccess();
  } catch (err) {
    console.error('DELETE /api/admin/vendors/[id] error:', err);
    return jsonError('Failed to remove vendor. Please try again.', 500);
  }
}
