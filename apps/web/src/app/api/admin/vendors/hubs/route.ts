import type { NextRequest } from 'next/server';
import { asc, isNull } from 'drizzle-orm';
import { db, vendors } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireAdmin } from '@/modules/auth/server/guards/require-role';

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
      .selectDistinct({ hub: vendors.hub })
      .from(vendors)
      .where(isNull(vendors.deletedAt))
      .orderBy(asc(vendors.hub));
    const data = rows
      .map((row) => row.hub)
      .filter((hub): hub is string => Boolean(hub) && hub.length > 0);
    return jsonSuccess(data);
  } catch (err) {
    console.error('GET /api/admin/vendors/hubs error:', err);
    return jsonError('Failed to load bazaars.', 500);
  }
}
