import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, promotionalBanners } from '@repo/database';
import { revalidateTag } from 'next/cache';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireAdmin } from '@/modules/auth/server/guards/require-role';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { z } from 'zod';

const bulkUpdateBannerSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
  displayOrder: z.number(),
});

const bulkUpdatePayloadSchema = z.array(bulkUpdateBannerSchema);

export async function PUT(request: NextRequest) {
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

  const parsed = bulkUpdatePayloadSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.flatten().formErrors[0] ?? 'Invalid payload';
    return jsonError(message, 400);
  }

  const data = parsed.data;

  try {
    await db.transaction(async (tx) => {
      for (const { id, isActive, displayOrder } of data) {
        await tx
          .update(promotionalBanners)
          .set({
            isActive,
            displayOrder,
            updatedAt: new Date(),
          })
          .where(eq(promotionalBanners.id, id));
      }
    });
    revalidateTag('banners');
    return jsonSuccess();
  } catch (err) {
    console.error('PUT /api/admin/banners/bulk error:', err);
    return jsonError('Failed to update banners. Please try again.', 500);
  }
}
