import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, promotionalBanners } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireAdmin } from '@/modules/auth/server/guards/require-role';
import { rowToBanner } from '@/modules/admin/admin-promo-banners/utils';

type RouteContext = { params: Promise<{ id: string }> };

// Q14 binding: duplicate copies all fields except dates; status forced
// to `paused` on the clone.
export async function POST(request: NextRequest, context: RouteContext) {
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
    const [source] = await db
      .select()
      .from(promotionalBanners)
      .where(eq(promotionalBanners.id, id))
      .limit(1);

    if (!source) return jsonError('Banner not found', 404);

    const all = await db
      .select({ displayOrder: promotionalBanners.displayOrder })
      .from(promotionalBanners);
    const nextOrder =
      all.length > 0 ? Math.max(...all.map((b) => b.displayOrder), 0) + 1 : 0;

    const [inserted] = await db
      .insert(promotionalBanners)
      .values({
        title: `${source.title} (copy)`,
        internalName: source.internalName,
        eyebrow: source.eyebrow,
        ctaLabel: source.ctaLabel,
        imageUrl: source.imageUrl,
        targetUrl: source.targetUrl,
        position: source.position,
        status: 'paused',
        startsAt: null,
        endsAt: null,
        isActive: false,
        displayOrder: nextOrder,
      })
      .returning();

    if (!inserted) return jsonError('Failed to duplicate banner', 500);
    return jsonSuccess(rowToBanner(inserted), undefined, 201);
  } catch (err) {
    console.error('POST /api/admin/banners/[id]/duplicate error:', err);
    return jsonError('Failed to duplicate banner. Please try again.', 500);
  }
}
