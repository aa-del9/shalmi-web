import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  getVendorProduct,
  updateProduct,
} from '@repo/services/vendor/products';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@repo/services/errors';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireVendor } from '@/modules/auth/server/guards/require-role';
import { getVendorIdFromSession } from '@/modules/auth/server/get-vendor-id-from-session';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await getSessionFromRequest(req);
    requireVendor(session);

    const vendorId = await getVendorIdFromSession(session);
    if (!vendorId) {
      return jsonError('Vendor record not found', 403);
    }

    const { id } = await context.params;
    if (!id) {
      return jsonError('Product ID is required', 400);
    }

    const result = await getVendorProduct({ vendorId, productId: id });
    return jsonSuccess(result);
  } catch (err) {
    if (err instanceof Error) {
      const message = err.message;
      if (
        message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ||
        message === AUTH_GUARD_ERRORS.SESSION_REQUIRED
      ) {
        const status = message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ? 403 : 401;
        return jsonError(message, status);
      }
    }
    if (err instanceof NotFoundError) {
      return jsonError(err.message, 404);
    }
    if (err instanceof ValidationError) {
      return jsonError(err.message, 400);
    }
    console.error('GET /api/vendor/products/[id] error:', err);
    return jsonError('Failed to load product.', 500);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await getSessionFromRequest(req);
    requireVendor(session);

    const vendorId = await getVendorIdFromSession(session);
    if (!vendorId) {
      return jsonError('Vendor record not found', 403);
    }

    const { id } = await context.params;
    if (!id) {
      return jsonError('Product ID is required', 400);
    }

    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return jsonError('Invalid JSON body', 400);
    }

    const result = await updateProduct({
      vendorId,
      productId: id,
      ...((payload as Record<string, unknown>) ?? {}),
    } as Parameters<typeof updateProduct>[0]);

    revalidatePath(ABSOLUTE_ROUTES.VENDOR_PRODUCTS);
    revalidatePath(`${ABSOLUTE_ROUTES.VENDOR_PRODUCTS}/${id}/edit`);

    return jsonSuccess({ productId: result.productId });
  } catch (err) {
    if (err instanceof Error) {
      const message = err.message;
      if (
        message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ||
        message === AUTH_GUARD_ERRORS.SESSION_REQUIRED
      ) {
        const status = message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ? 403 : 401;
        return jsonError(message, status);
      }
    }
    if (err instanceof NotFoundError) {
      return jsonError('Product not found', 404);
    }
    if (err instanceof ValidationError) {
      return jsonError(err.message, 400);
    }
    if (err instanceof ConflictError) {
      return jsonError(err.message, 409);
    }

    console.error('PATCH /api/vendor/products/[id] error:', err);
    return jsonError('Failed to update product. Please try again.', 500);
  }
}
