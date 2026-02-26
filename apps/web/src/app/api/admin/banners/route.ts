import type { NextRequest } from 'next/server';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireAdmin } from '@/modules/auth/server/guards/require-role';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { getAllBannersAdmin } from '@/modules/promotions/utils/get-cached-banners';
import { db, promotionalBanners } from '@repo/database';
import { createBannerSchema } from '@/modules/admin/admin-promo-banners/schemas';

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
    const data = await getAllBannersAdmin();
    return jsonSuccess(data);
  } catch (err) {
    console.error('GET /api/admin/banners error:', err);
    return jsonError('Failed to load banners.', 500);
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

  const parsed = createBannerSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.flatten().formErrors[0] ?? 'Invalid input';
    return jsonError(message, 400);
  }

  const { title, imageUrl, targetUrl } = parsed.data;
  const targetUrlValue = targetUrl && targetUrl !== '' ? targetUrl : undefined;

  try {
    const existing = await getAllBannersAdmin();
    const maxOrder =
      existing.length > 0
        ? Math.max(...existing.map((b) => b.displayOrder), 0)
        : -1;
    const displayOrder = maxOrder + 1;

    const [inserted] = await db
      .insert(promotionalBanners)
      .values({
        title,
        imageUrl,
        targetUrl: targetUrlValue,
        isActive: false,
        displayOrder,
      })
      .returning();

    if (!inserted) {
      return jsonError('Failed to create banner', 500);
    }
    return jsonSuccess(inserted, undefined, 201);
  } catch (err) {
    console.error('POST /api/admin/banners error:', err);
    return jsonError('Failed to create banner. Please try again.', 500);
  }
}
