import type { NextRequest } from 'next/server';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireAdmin } from '@/modules/auth/server/guards/require-role';
import { CATEGORIES_ASSETS_BUCKET } from '@repo/storage';
import { uploadImageToStorage } from '@/modules/core/services/upload-image';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    requireAdmin(session);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : AUTH_GUARD_ERRORS.SESSION_REQUIRED;
    const status = message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ? 403 : 401;
    return jsonError(message, status);
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonError('Invalid request body', 400);
  }

  const fileItems = formData.getAll('file');
  const files = fileItems.filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return jsonError('At least one file is required', 400);
  }

  try {
    const results = await Promise.all(
      files.map((file) => uploadImageToStorage(file, CATEGORIES_ASSETS_BUCKET))
    );
    return jsonSuccess({ results });
  } catch (err) {
    console.error('Admin categories upload error:', err);
    return jsonError('Upload failed', 500);
  }
}
