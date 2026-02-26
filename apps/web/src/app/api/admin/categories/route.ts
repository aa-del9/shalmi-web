import type { NextRequest } from 'next/server';
import { db, categories } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { POSTGRES_UNIQUE_VIOLATION } from '@repo/constants/postgres';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireAdmin } from '@/modules/auth/server/guards/require-role';
import { createCategorySchema } from '@/modules/admin/admin-categories/schemas';
import { slugForCategory } from '@/modules/core/utils/slug';

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

  const { name, imageUrl } = parsed.data;
  const slug = slugForCategory(name);
  const imageUrlValue = imageUrl && imageUrl !== '' ? imageUrl : undefined;

  try {
    await db.insert(categories).values({
      name,
      slug,
      imageUrl: imageUrlValue,
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
