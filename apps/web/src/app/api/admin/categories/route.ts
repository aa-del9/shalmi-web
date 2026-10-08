import type { NextRequest } from 'next/server';
import { and, asc, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import { db, categories } from '@repo/database';
import {
  buildPaginationMeta,
  normalizePagination,
  type PaginationParams,
} from '@/modules/core/server-actions';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { POSTGRES_UNIQUE_VIOLATION } from '@repo/constants/postgres';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireAdmin } from '@/modules/auth/server/guards/require-role';
import { createCategorySchema } from '@/modules/admin/admin-categories/schemas';
import { slugForCategory } from '@/modules/core/utils/slug';
import type { CategoryListItem } from '@/modules/common/queries/categories';

const SORT_COLUMNS = {
  name: categories.name,
  createdAt: categories.createdAt,
  updatedAt: categories.updatedAt,
} as const;

type SortKey = keyof typeof SORT_COLUMNS;

function isSortKey(value: string | null): value is SortKey {
  return value !== null && value in SORT_COLUMNS;
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
    const sortParam = searchParams.get('sort');
    const dirParam = searchParams.get('dir');

    const filters: SQL[] = [];
    if (q.length > 0) {
      const pattern = `%${q}%`;
      const search = or(
        ilike(categories.name, pattern),
        ilike(categories.slug, pattern)
      );
      if (search) filters.push(search);
    }
    if (statusParam === 'active') {
      filters.push(eq(categories.isActive, true));
    } else if (statusParam === 'inactive') {
      filters.push(eq(categories.isActive, false));
    }

    const where = filters.length > 0 ? and(...filters) : undefined;

    const sortKey: SortKey = isSortKey(sortParam) ? sortParam : 'name';
    const direction = dirParam === 'desc' ? desc : asc;

    const [countResult, rows] = await Promise.all([
      db
        .select({ totalCount: count() })
        .from(categories)
        .where(where as SQL | undefined),
      db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          imageUrl: categories.imageUrl,
          iconKey: categories.iconKey,
          isActive: categories.isActive,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
        })
        .from(categories)
        .where(where as SQL | undefined)
        .orderBy(direction(SORT_COLUMNS[sortKey]))
        .limit(limit)
        .offset(offset),
    ]);

    const totalCount = Number(countResult[0]?.totalCount ?? 0);
    const meta = buildPaginationMeta(totalCount, page, limit);
    const data: CategoryListItem[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      imageUrl: row.imageUrl ?? null,
      iconKey: row.iconKey ?? null,
      isActive: row.isActive,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : (row.createdAt as unknown as string),
      updatedAt:
        row.updatedAt instanceof Date
          ? row.updatedAt.toISOString()
          : (row.updatedAt as unknown as string),
    }));

    return jsonSuccess(data, meta);
  } catch (err) {
    console.error('GET /api/admin/categories error:', err);
    return jsonError('Failed to load categories. Please try again.', 500);
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

  const parsed = createCategorySchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.flatten().formErrors[0] ?? 'Invalid input';
    return jsonError(message, 400);
  }

  const { name, imageUrl, iconKey, isActive } = parsed.data;
  const slug = slugForCategory(name);
  const imageUrlValue = imageUrl && imageUrl !== '' ? imageUrl : undefined;
  const iconKeyValue = iconKey && iconKey !== '' ? iconKey : undefined;

  try {
    await db.insert(categories).values({
      name,
      slug,
      imageUrl: imageUrlValue,
      iconKey: iconKeyValue,
      ...(isActive !== undefined ? { isActive } : {}),
    });
    return jsonSuccess(undefined, undefined, 201);
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
      return jsonError('A category with this slug already exists.', 409);
    }

    console.error('POST /api/admin/categories error:', err);
    return jsonError('Failed to create category. Please try again.', 500);
  }
}
