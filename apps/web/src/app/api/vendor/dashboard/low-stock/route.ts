import type { NextRequest } from 'next/server';
import { and, asc, eq, sql } from 'drizzle-orm';
import { db, products } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireVendor } from '@/modules/auth/server/guards/require-role';
import { getVendorIdFromSession } from '@/modules/auth/server/get-vendor-id-from-session';

/**
 * Low-stock products for the dashboard "LOW STOCK · Reorder before
 * stock-out" card. Threshold is a constant (10) per Batch 4 watchout.
 *
 * TODO(post-v1): switch to per-product `lowStockThreshold` (lands with
 * vendor-products in this batch) once that screen ships.
 */
const LOW_STOCK_THRESHOLD = 10;
const ROW_LIMIT = 3;

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    requireVendor(session);

    const vendorId = await getVendorIdFromSession(session);
    if (!vendorId) return jsonError('Vendor record not found', 403);

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        stock: products.stock,
      })
      .from(products)
      .where(
        and(
          eq(products.vendorId, vendorId),
          sql`${products.stock} > 0`,
          sql`${products.stock} <= ${LOW_STOCK_THRESHOLD}`
        )
      )
      .orderBy(asc(products.stock))
      .limit(ROW_LIMIT);

    return jsonSuccess({
      threshold: LOW_STOCK_THRESHOLD,
      rows: rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        stock: r.stock,
      })),
    });
  } catch (err) {
    if (err instanceof Error) {
      const message = err.message;
      if (
        message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ||
        message === AUTH_GUARD_ERRORS.SESSION_REQUIRED
      ) {
        const status = message === AUTH_GUARD_ERRORS.SESSION_REQUIRED ? 401 : 403;
        return jsonError(message, status);
      }
    }
    console.error('GET /api/vendor/dashboard/low-stock error:', err);
    return jsonError('Failed to load low-stock products.', 500);
  }
}
