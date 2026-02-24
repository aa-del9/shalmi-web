import type { NextRequest } from 'next/server';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireVendor } from '@/modules/auth/server/guards/require-role';
import { PRODUCT_ASSETS_BUCKET } from '@repo/storage';
import { uploadImageToStorage } from '@/modules/core/services/upload-image';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    requireVendor(session);
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

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return jsonError('File is required', 400);
  }

  try {
    const { url, blurHash } = await uploadImageToStorage(
      file,
      PRODUCT_ASSETS_BUCKET
    );
    return jsonSuccess({ url, blurHash });
  } catch (err) {
    console.error('Vendor upload error:', err);
    return jsonError('Upload failed', 500);
  }
}
