import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, categories } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { POSTGRES_UNIQUE_VIOLATION } from '@repo/constants/postgres';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireAdmin } from '@/modules/auth/server/guards/require-role';
import { updateCategorySchema } from '@/modules/admin/admin-categories/schemas';
import { slugForCategory } from '@/modules/core/utils/slug';

type RouteContext = { params: Promise<{ id: string }> };

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
    return jsonError('Category ID is required', 400);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = updateCategorySchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.flatten().formErrors[0] ?? 'Invalid input';
    return jsonError(message, 400);
  }

  const data = parsed.data;
  const updatePayload: {
    name?: string;
    slug?: string;
    imageUrl?: string | null;
    iconKey?: string | null;
    isActive?: boolean;
    updatedAt: Date;
  } = { updatedAt: new Date() };

  if (data.name !== undefined) {
    updatePayload.name = data.name;
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    if (existingCategory[0] && existingCategory[0].name === data.name) {
      updatePayload.slug = existingCategory[0].slug;
    } else {
      updatePayload.slug = slugForCategory(data.name);
    }
  }
  if (data.imageUrl !== undefined) {
    updatePayload.imageUrl =
      data.imageUrl && data.imageUrl !== '' ? data.imageUrl : null;
  }
  if (data.iconKey !== undefined) {
    updatePayload.iconKey =
      data.iconKey && data.iconKey !== '' ? data.iconKey : null;
  }
  if (data.isActive !== undefined) {
    updatePayload.isActive = data.isActive;
  }

  if (Object.keys(updatePayload).length <= 1) {
    return jsonSuccess();
  }

  try {
    const [updated] = await db
      .update(categories)
      .set(updatePayload)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });

    if (!updated) {
      return jsonError('Category not found', 404);
    }

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
      return jsonError('A category with this slug already exists.', 409);
    }

    console.error('PATCH /api/admin/categories/[id] error:', err);
    return jsonError('Failed to update category. Please try again.', 500);
  }
}
