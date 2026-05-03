import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  createProduct,
  listVendorProducts,
  VENDOR_PRODUCT_SORTS,
  VENDOR_PRODUCT_STATUS_FILTERS,
  type VendorProductSort,
  type VendorProductStatusFilter,
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

const PAGE_SIZE_DEFAULT = 8;

/**
 * Vendor product list — paginated + filterable + sortable.
 *
 * Per gap-analysis Q1/Q3: stats segments (ALL / ACTIVE / LOW STOCK /
 * DRAFTS) are real filters; the GET response includes both the page rows
 * AND a stats payload of category-wide counts so the segments + chip row
 * stay in sync without a second round-trip.
 *
 * Query params:
 *   page    — 1-based page number (default 1).
 *   pageSize— rows per page (default 8, max 30).
 *   q       — case-insensitive search across name + sku + brand.
 *   status  — `all|active|low-stock|drafts`.
 *   categoryId — filter rows that belong to this category (M2M).
 *   sort    — `newest|oldest|stock-asc|stock-desc` (default `newest`).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    requireVendor(session);

    const vendorId = await getVendorIdFromSession(session);
    if (!vendorId) {
      return jsonError('Vendor record not found', 403);
    }

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
    const pageSize = Math.max(
      1,
      Number(url.searchParams.get('pageSize') ?? PAGE_SIZE_DEFAULT) ||
        PAGE_SIZE_DEFAULT
    );
    const q = url.searchParams.get('q') ?? undefined;
    const rawStatus = url.searchParams.get('status');
    const statusFilter: VendorProductStatusFilter | undefined =
      rawStatus !== null &&
      (VENDOR_PRODUCT_STATUS_FILTERS as readonly string[]).includes(rawStatus)
        ? (rawStatus as VendorProductStatusFilter)
        : undefined;
    const categoryId = url.searchParams.get('categoryId') ?? undefined;
    const rawSort = url.searchParams.get('sort');
    const sort: VendorProductSort | undefined =
      rawSort !== null &&
      (VENDOR_PRODUCT_SORTS as readonly string[]).includes(rawSort)
        ? (rawSort as VendorProductSort)
        : undefined;

    const result = await listVendorProducts({
      vendorId,
      filter: {
        page,
        pageSize,
        q,
        status: statusFilter,
        categoryId,
        sort,
      },
    });

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
    if (err instanceof ValidationError) {
      return jsonError(err.message, 400);
    }
    if (err instanceof NotFoundError) {
      return jsonError(err.message, 404);
    }
    console.error('GET /api/vendor/products error:', err);
    return jsonError('Failed to load products.', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    requireVendor(session);

    const vendorId = await getVendorIdFromSession(session);
    if (!vendorId) {
      return jsonError('Vendor record not found', 403);
    }

    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return jsonError('Invalid JSON body', 400);
    }

    const result = await createProduct({
      vendorId,
      ...((payload as Record<string, unknown>) ?? {}),
    } as Parameters<typeof createProduct>[0]);

    revalidatePath(ABSOLUTE_ROUTES.VENDOR_PRODUCTS);
    return jsonSuccess({ productId: result.productId }, undefined, 201);
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
    if (err instanceof ValidationError) {
      return jsonError(err.message, 400);
    }
    if (err instanceof ConflictError) {
      return jsonError(err.message, 409);
    }

    console.error('POST /api/vendor/products error:', err);
    return jsonError('Failed to create product. Please try again.', 500);
  }
}
