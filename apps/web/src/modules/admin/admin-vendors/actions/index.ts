'use server';

import { revalidatePath } from 'next/cache';
import { count, eq } from 'drizzle-orm';
import { db, user, vendors } from '@repo/database';
import {
  buildPaginationMeta,
  normalizePagination,
  type ActionResult,
  type PaginatedActionResult,
  type PaginationMeta,
  type PaginationParams,
} from '@/modules/core/server-actions';
import { USER_ROLES } from '@/modules/core/constants/user-roles';
import { POSTGRES_UNIQUE_VIOLATION } from '@repo/constants/postgres';
import { CreateVendorInput, createVendorSchema } from '../schemas';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { ensureAdminSession } from '@/modules/auth/server/guards/ensure-session';

/** Vendor list item: profile + phone from joined user */
export type VendorListItem = {
  id: string;
  phoneNumber: string | null;
  shopName: string;
  city: string;
  marketHub: string;
  isActive: boolean;
};

export async function createVendor(
  payload: CreateVendorInput
): Promise<ActionResult> {
  try {
    await ensureAdminSession();

    const parsed = createVendorSchema.safeParse(payload);
    if (!parsed.success) {
      const message = parsed.error.flatten().formErrors[0] ?? 'Invalid input';
      return { success: false, error: message };
    }

    const { phoneNumber, shopName, marketHub, bankDetails } = parsed.data;
    const userId = crypto.randomUUID();

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

    revalidatePath('/admin/vendors');
    return { success: true };
  } catch (err) {
    if (err instanceof Error) {
      if (
        err.message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ||
        err.message === AUTH_GUARD_ERRORS.SESSION_REQUIRED
      ) {
        return { success: false, error: err.message };
      }
    }

    const pgErr = err as { code?: string };
    if (pgErr?.code === POSTGRES_UNIQUE_VIOLATION) {
      return {
        success: false,
        error: 'This phone number is already registered.',
      };
    }

    console.error('createVendor error:', err);
    return {
      success: false,
      error: 'Failed to create vendor. Please try again.',
    };
  }
}

export async function getVendors(
  params: PaginationParams = {}
): Promise<PaginatedActionResult<VendorListItem>> {
  try {
    await ensureAdminSession();

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
    const meta: PaginationMeta = buildPaginationMeta(totalCount, page, limit);

    const data: VendorListItem[] = rows.map((row) => ({
      id: row.id,
      phoneNumber: row.phoneNumber,
      shopName: row.shopName,
      city: row.city,
      marketHub: row.marketHub,
      isActive: row.isActive,
    }));

    return { success: true, data, meta };
  } catch (err) {
    if (err instanceof Error) {
      if (
        err.message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ||
        err.message === AUTH_GUARD_ERRORS.SESSION_REQUIRED
      ) {
        return { success: false, error: err.message };
      }
    }
    console.error('getVendors error:', err);
    return {
      success: false,
      error: 'Failed to load vendors. Please try again.',
    };
  }
}
