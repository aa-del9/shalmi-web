import type { NextRequest } from 'next/server';
import { count, eq } from 'drizzle-orm';
import { db, user, vendors } from '@repo/database';
import {
  buildPaginationMeta,
  normalizePagination,
  type PaginationParams,
} from '@/modules/core/server-actions';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { USER_ROLES } from '@/modules/core/constants/user-roles';
import { POSTGRES_UNIQUE_VIOLATION } from '@repo/constants/postgres';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireAdmin } from '@/modules/auth/server/guards/require-role';
import { createVendorSchema } from '@/modules/admin/admin-vendors/schemas';
import type { VendorListItem } from '@/modules/admin/admin-vendors/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    requireAdmin(session);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : AUTH_GUARD_ERRORS.SESSION_REQUIRED;
    const status = message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ? 403 : 401;
    return jsonError(message, status);
  }

  try {
    const { searchParams } = new URL(request.url);
    const params: PaginationParams = {
      page: searchParams.get('page')
        ? Number(searchParams.get('page'))
        : undefined,
      limit: searchParams.get('limit')
        ? Number(searchParams.get('limit'))
        : undefined,
    };
    const { page, limit, offset } = normalizePagination(params);

    const [countResult, rows] = await Promise.all([
      db.select({ totalCount: count() }).from(vendors),
      db
        .select({
          id: vendors.id,
          phoneNumber: user.phoneNumber,
          shopName: vendors.shopName,
          city: vendors.city,
          marketHub: vendors.hub,
          isActive: vendors.isActive,
        })
        .from(vendors)
        .innerJoin(user, eq(vendors.userId, user.id))
        .limit(limit)
        .offset(offset),
    ]);

    const totalCount = Number(countResult[0]?.totalCount ?? 0);
    const meta = buildPaginationMeta(totalCount, page, limit);
    const data: VendorListItem[] = rows.map((row) => ({
      id: row.id,
      phoneNumber: row.phoneNumber,
      shopName: row.shopName,
      city: row.city,
      marketHub: row.marketHub,
      isActive: row.isActive,
    }));

    return jsonSuccess(data, meta);
  } catch (err) {
    console.error('GET /api/admin/vendors error:', err);
    return jsonError('Failed to load vendors. Please try again.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    requireAdmin(session);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : AUTH_GUARD_ERRORS.SESSION_REQUIRED;
    const status = message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ? 403 : 401;
    return jsonError(message, status);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = createVendorSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.flatten().formErrors[0] ?? 'Invalid input';
    return jsonError(message, 400);
  }

  const { phoneNumber, shopName, marketHub, bankDetails } = parsed.data;
  const userId = crypto.randomUUID();

  try {
    await db.transaction(async (tx) => {
      await tx.insert(user).values({
        id: userId,
        name: shopName,
        phoneNumber,
        role: USER_ROLES.VENDOR,
      });

      await tx.insert(vendors).values({
        userId,
        shopName,
        city: 'Lahore',
        hub: marketHub,
        bankName: bankDetails.bankName,
        accountTitle: bankDetails.accountTitle,
        iban: bankDetails.iban,
      });
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

    console.error('POST /api/admin/vendors error:', err);
    return jsonError('Failed to create vendor. Please try again.', 500);
  }
}
