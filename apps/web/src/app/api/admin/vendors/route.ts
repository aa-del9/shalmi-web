import type { NextRequest } from 'next/server';
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNull,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
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
import type {
  VendorListItem,
  VendorListMeta,
} from '@/modules/admin/admin-vendors/types';

const SORT_COLUMNS = {
  createdAt: vendors.createdAt,
  shopName: vendors.shopName,
} as const;

type SortKey = keyof typeof SORT_COLUMNS;

function isSortKey(value: string | null): value is SortKey {
  return value !== null && value in SORT_COLUMNS;
}

async function generateNextDisplayId(): Promise<string> {
  const [row] = await db
    .select({
      maxId: sql<string | null>`MAX(NULLIF(REGEXP_REPLACE(${vendors.displayId}, '[^0-9]', '', 'g'), ''))`,
    })
    .from(vendors);
  const next = Number(row?.maxId ?? '0') + 1;
  return `VND-${String(next).padStart(4, '0')}`;
}

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

    const q = (searchParams.get('q') ?? '').trim();
    const statusParam = searchParams.get('status');
    const hubParam = (searchParams.get('hub') ?? '').trim();
    const sortParam = searchParams.get('sort');
    const dirParam = searchParams.get('dir');

    const baseFilters: SQL[] = [isNull(vendors.deletedAt) as SQL];
    if (q.length > 0) {
      const pattern = `%${q}%`;
      const search = or(
        ilike(vendors.shopName, pattern),
        ilike(vendors.fullName, pattern),
        ilike(user.phoneNumber, pattern)
      );
      if (search) baseFilters.push(search);
    }
    if (hubParam.length > 0) {
      baseFilters.push(eq(vendors.hub, hubParam));
    }

    const filteredFilters = [...baseFilters];
    if (statusParam === 'active') {
      filteredFilters.push(eq(vendors.isActive, true));
    } else if (statusParam === 'inactive') {
      filteredFilters.push(eq(vendors.isActive, false));
    }

    const where = filteredFilters.length > 0 ? and(...filteredFilters) : undefined;
    const baseWhere = baseFilters.length > 0 ? and(...baseFilters) : undefined;

    const sortKey: SortKey = isSortKey(sortParam) ? sortParam : 'createdAt';
    const direction = dirParam === 'asc' ? asc : desc;

    const [countResult, totalsResult, rows] = await Promise.all([
      db
        .select({ totalCount: count() })
        .from(vendors)
        .innerJoin(user, eq(vendors.userId, user.id))
        .where(where as SQL | undefined),
      db
        .select({
          total: count(),
          active: sql<number>`count(*) FILTER (WHERE ${vendors.isActive} = true)`,
          inactive: sql<number>`count(*) FILTER (WHERE ${vendors.isActive} = false)`,
        })
        .from(vendors)
        .innerJoin(user, eq(vendors.userId, user.id))
        .where(baseWhere as SQL | undefined),
      db
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
        })
        .from(vendors)
        .innerJoin(user, eq(vendors.userId, user.id))
        .where(where as SQL | undefined)
        .orderBy(direction(SORT_COLUMNS[sortKey]))
        .limit(limit)
        .offset(offset),
    ]);

    const totalCount = Number(countResult[0]?.totalCount ?? 0);
    const baseMeta = buildPaginationMeta(totalCount, page, limit);
    const totalsRow = totalsResult[0];
    const meta: VendorListMeta = {
      ...baseMeta,
      totals: {
        all: Number(totalsRow?.total ?? 0),
        active: Number(totalsRow?.active ?? 0),
        inactive: Number(totalsRow?.inactive ?? 0),
      },
    };
    const data: VendorListItem[] = rows.map((row) => ({
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

  const data = parsed.data;
  const userId = crypto.randomUUID();
  const displayId = await generateNextDisplayId();
  const emailValue =
    data.email && data.email !== '' ? data.email : undefined;
  const logoUrlValue =
    data.logoUrl && data.logoUrl !== '' ? data.logoUrl : undefined;
  const addressValue =
    data.address && data.address !== '' ? data.address : undefined;

  try {
    const insertedId = await db.transaction(async (tx) => {
      await tx.insert(user).values({
        id: userId,
        name: data.fullName,
        phoneNumber: data.phoneNumber,
        ...(emailValue ? { email: emailValue, emailVerified: false } : {}),
        role: USER_ROLES.VENDOR,
      });

      const [row] = await tx
        .insert(vendors)
        .values({
          userId,
          displayId,
          fullName: data.fullName,
          shopName: data.shopName,
          city: 'Lahore',
          address: addressValue,
          hub: data.marketHub,
          logoUrl: logoUrlValue,
          bankName: data.bankDetails.bankName,
          accountTitle: data.bankDetails.accountTitle,
          iban: data.bankDetails.iban,
        })
        .returning({ id: vendors.id });
      return row?.id ?? null;
    });

    return jsonSuccess({ id: insertedId, displayId }, undefined, 201);
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

    console.error('POST /api/admin/vendors error:', err);
    return jsonError('Failed to create vendor. Please try again.', 500);
  }
}
