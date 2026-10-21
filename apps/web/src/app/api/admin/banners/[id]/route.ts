import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, promotionalBanners } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireAdmin } from '@/modules/auth/server/guards/require-role';
import { updateBannerSchema } from '@/modules/admin/admin-promo-banners/schemas';
import { rowToBanner } from '@/modules/admin/admin-promo-banners/utils';

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
  if (!id) return jsonError('Banner ID is required', 400);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = updateBannerSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.flatten().formErrors[0] ?? 'Invalid input';
    return jsonError(message, 400);
  }

  const data = parsed.data;
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) update.title = data.title;
  if (data.internalName !== undefined)
    update.internalName = data.internalName === '' ? null : data.internalName;
  if (data.eyebrow !== undefined)
    update.eyebrow = data.eyebrow === '' ? null : data.eyebrow;
  if (data.ctaLabel !== undefined)
    update.ctaLabel = data.ctaLabel === '' ? null : data.ctaLabel;
  if (data.imageUrl !== undefined) update.imageUrl = data.imageUrl;
  if (data.targetUrl !== undefined)
    update.targetUrl = data.targetUrl === '' ? null : data.targetUrl;
  if (data.position !== undefined) update.position = data.position;
  if (data.status !== undefined) {
    update.status = data.status;
    update.isActive = data.status === 'live';
  }
  if (data.startsAt !== undefined)
    update.startsAt =
      data.startsAt && data.startsAt !== '' ? new Date(data.startsAt) : null;
  if (data.endsAt !== undefined)
    update.endsAt =
      data.endsAt && data.endsAt !== '' ? new Date(data.endsAt) : null;
  if (data.displayOrder !== undefined) update.displayOrder = data.displayOrder;

  try {
    const [updated] = await db
      .update(promotionalBanners)
      .set(update)
      .where(eq(promotionalBanners.id, id))
      .returning();

    if (!updated) return jsonError('Banner not found', 404);
    return jsonSuccess(rowToBanner(updated));
  } catch (err) {
    console.error('PATCH /api/admin/banners/[id] error:', err);
    return jsonError('Failed to update banner. Please try again.', 500);
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
  if (!id) return jsonError('Banner ID is required', 400);

  try {
    const [removed] = await db
      .delete(promotionalBanners)
      .where(eq(promotionalBanners.id, id))
      .returning({ id: promotionalBanners.id });
    if (!removed) return jsonError('Banner not found', 404);
    return jsonSuccess();
  } catch (err) {
    console.error('DELETE /api/admin/banners/[id] error:', err);
    return jsonError('Failed to delete banner. Please try again.', 500);
  }
}
