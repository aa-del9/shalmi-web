import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { eq, and, asc } from 'drizzle-orm';
import {
  db,
  products,
  productPackTiers,
  productCategories,
} from '@repo/database';
import { updateProductSchema } from '@repo/schemas/catalog/product';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireVendor } from '@/modules/auth/server/guards/require-role';
import { getVendorIdFromSession } from '@/modules/auth/server/get-vendor-id-from-session';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import { POSTGRES_UNIQUE_VIOLATION } from '@repo/constants/postgres';

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

    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        packWeightGrams: products.packWeightGrams,
        packSize: products.packSize,
        unitWeightGrams: products.unitWeightGrams,
        unitLabel: products.unitLabel,
        packMrpCents: products.packMrpCents,
        packWholesalePriceCents: products.packWholesalePriceCents,
        pricePerUnitCents: products.pricePerUnitCents,
        images: products.images,
        stock: products.stock,
        sku: products.sku,
        brand: products.brand,
        lowStockThreshold: products.lowStockThreshold,
        status: products.status,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(and(eq(products.id, id), eq(products.vendorId, vendorId)))
      .limit(1);

    if (!product) {
      return jsonError('Product not found', 404);
    }

    const tiers = await db
      .select({
        id: productPackTiers.id,
        packQty: productPackTiers.packQty,
        pricePerPackCents: productPackTiers.pricePerPackCents,
        badge: productPackTiers.badge,
        isDefault: productPackTiers.isDefault,
      })
      .from(productPackTiers)
      .where(eq(productPackTiers.productId, id))
      .orderBy(asc(productPackTiers.packQty));

    const categoryRows = await db
      .select({ categoryId: productCategories.categoryId })
      .from(productCategories)
      .where(eq(productCategories.productId, id));
    const categoryIds = categoryRows.map((r) => r.categoryId);

    return jsonSuccess({
      ...product,
      categoryIds,
      packTiers: tiers,
    });
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

    const parsed = updateProductSchema.safeParse(payload);
    if (!parsed.success) {
      const message = parsed.error.flatten().formErrors[0] ?? 'Invalid input';
      return jsonError(message, 400);
    }

    const data = parsed.data;
    const updatePayload: {
      name?: string;
      packWeightGrams?: number;
      packSize?: number;
      unitWeightGrams?: number | null;
      unitLabel?: string | null;
      packMrpCents?: number | null;
      packWholesalePriceCents?: number;
      pricePerUnitCents?: number | null;
      images?: { url: string; blurHash: string | null }[];
      stock?: number;
      sku?: string | null;
      brand?: string | null;
      lowStockThreshold?: number;
      status?: 'active' | 'draft';
    } = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.packWeightGrams !== undefined)
      updatePayload.packWeightGrams = data.packWeightGrams;
    if (data.packSize !== undefined) updatePayload.packSize = data.packSize;
    if (data.unitWeightGrams !== undefined)
      updatePayload.unitWeightGrams = data.unitWeightGrams ?? null;
    if (data.unitLabel !== undefined)
      updatePayload.unitLabel = data.unitLabel ?? null;
    if (data.packMrpCents !== undefined)
      updatePayload.packMrpCents = data.packMrpCents ?? null;
    if (data.packWholesalePriceCents !== undefined)
      updatePayload.packWholesalePriceCents = data.packWholesalePriceCents;
    if (data.pricePerUnitCents !== undefined)
      updatePayload.pricePerUnitCents = data.pricePerUnitCents ?? null;
    if (data.images !== undefined)
      updatePayload.images = data.images as {
        url: string;
        blurHash: string | null;
      }[];
    if (data.stock !== undefined) updatePayload.stock = data.stock;
    if (data.sku !== undefined) updatePayload.sku = data.sku ?? null;
    if (data.brand !== undefined) updatePayload.brand = data.brand ?? null;
    if (data.lowStockThreshold !== undefined)
      updatePayload.lowStockThreshold = data.lowStockThreshold;
    if (data.status !== undefined) updatePayload.status = data.status;

    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.id, id), eq(products.vendorId, vendorId)))
        .limit(1);

      if (!existing) {
        throw new Error('NOT_FOUND');
      }

      if (Object.keys(updatePayload).length > 0) {
        await tx
          .update(products)
          .set({
            ...updatePayload,
            updatedAt: new Date(),
          })
          .where(eq(products.id, id));
      }

      if (data.packTiers !== undefined && data.packTiers.length > 0) {
        await tx
          .delete(productPackTiers)
          .where(eq(productPackTiers.productId, id));
        await tx.insert(productPackTiers).values(
          data.packTiers.map((tier) => ({
            productId: id,
            packQty: tier.packQty,
            pricePerPackCents: tier.pricePerPackCents,
            badge: tier.badge ?? null,
            isDefault: tier.isDefault ?? false,
          }))
        );
      }

      if (data.categoryIds !== undefined) {
        await tx
          .delete(productCategories)
          .where(eq(productCategories.productId, id));
        if (data.categoryIds.length > 0) {
          await tx.insert(productCategories).values(
            data.categoryIds.map((categoryId) => ({
              productId: id,
              categoryId,
            }))
          );
        }
      }
    });

    revalidatePath(ABSOLUTE_ROUTES.VENDOR_PRODUCTS);
    revalidatePath(`${ABSOLUTE_ROUTES.VENDOR_PRODUCTS}/${id}/edit`);

    return jsonSuccess({ productId: id });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'NOT_FOUND') {
        return jsonError('Product not found', 404);
      }
      const message = err.message;
      if (
        message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ||
        message === AUTH_GUARD_ERRORS.SESSION_REQUIRED
      ) {
        const status = message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ? 403 : 401;
        return jsonError(message, status);
      }
    }

    const pgErr = err as { code?: string };
    if (pgErr?.code === POSTGRES_UNIQUE_VIOLATION) {
      return jsonError('A product with this slug already exists.', 409);
    }

    console.error('PATCH /api/vendor/products/[id] error:', err);
    return jsonError('Failed to update product. Please try again.', 500);
  }
}
