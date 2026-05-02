import { NextResponse, type NextRequest } from 'next/server';
import { asc, desc } from 'drizzle-orm';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireAdmin } from '@/modules/auth/server/guards/require-role';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { db, promotionalBanners } from '@repo/database';
import { createBannerSchema } from '@/modules/admin/admin-promo-banners/schemas';
import { rowToBanner } from '@/modules/admin/admin-promo-banners/utils';
import type { BannerListMeta } from '@/modules/admin/admin-promo-banners/types';

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
    const rows = await db
      .select()
      .from(promotionalBanners)
      .orderBy(
        desc(promotionalBanners.isActive),
        asc(promotionalBanners.displayOrder)
      );
    const data = rows.map(rowToBanner);

    const totals: BannerListMeta['totals'] = {
      all: data.length,
      live: 0,
      scheduled: 0,
      paused: 0,
      expired: 0,
    };
    for (const banner of data) {
      totals[banner.derivedState] += 1;
    }
    const meta: BannerListMeta = { totals };
    return NextResponse.json({ success: true, data, meta });
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

  const data = parsed.data;
  const targetUrlValue =
    data.targetUrl && data.targetUrl !== '' ? data.targetUrl : undefined;

  try {
    const existing = await db
      .select({ displayOrder: promotionalBanners.displayOrder })
      .from(promotionalBanners);
    const maxOrder =
      existing.length > 0
        ? Math.max(...existing.map((b) => b.displayOrder), 0)
        : -1;
    const nextOrder = maxOrder + 1;

    const startsAt =
      data.startsAt && data.startsAt !== '' ? new Date(data.startsAt) : null;
    const endsAt =
      data.endsAt && data.endsAt !== '' ? new Date(data.endsAt) : null;

    const [inserted] = await db
      .insert(promotionalBanners)
      .values({
        title: data.title,
        internalName: data.internalName || null,
        eyebrow: data.eyebrow || null,
        ctaLabel: data.ctaLabel || null,
        imageUrl: data.imageUrl,
        targetUrl: targetUrlValue,
        position: data.position ?? 'hero',
        status: data.status ?? 'paused',
        startsAt,
        endsAt,
        isActive: false,
        displayOrder: data.displayOrder ?? nextOrder,
      })
      .returning();

    if (!inserted) {
      return jsonError('Failed to create banner', 500);
    }
    return jsonSuccess(rowToBanner(inserted), undefined, 201);
  } catch (err) {
    console.error('POST /api/admin/banners error:', err);
    return jsonError('Failed to create banner. Please try again.', 500);
  }
}
