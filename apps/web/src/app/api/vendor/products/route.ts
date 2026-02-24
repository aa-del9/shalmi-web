import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { eq, desc } from 'drizzle-orm';
import { db, products, productPriceTiers } from '@repo/database';
import { createProductSchema } from '@repo/schemas/catalog/product';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireVendor } from '@/modules/auth/server/guards/require-role';
import { getVendorIdFromSession } from '@/modules/auth/server/get-vendor-id-from-session';
import { slugForProduct } from '@/modules/core/utils/slug';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import { POSTGRES_UNIQUE_VIOLATION } from '@repo/constants/postgres';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    requireVendor(session);

    const vendorId = await getVendorIdFromSession(session);
    if (!vendorId) {
      return jsonError('Vendor record not found', 403);
    }

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        weightGrams: products.weightGrams,
        images: products.images,
        stock: products.stock,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(eq(products.vendorId, vendorId))
      .orderBy(desc(products.createdAt));

    return jsonSuccess(rows);
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

    const parsed = createProductSchema.safeParse(payload);
    if (!parsed.success) {
      const message =
        parsed.error.flatten().formErrors[0] ?? 'Invalid input';
      return jsonError(message, 400);
    }

    const { name, weightGrams, images, stock, tiers } = parsed.data;
    const slug = slugForProduct(name);

    const [inserted] = await db.transaction(async (tx) => {
      const [product] = await tx
        .insert(products)
        .values({
          vendorId,
          name,
          slug,
          weightGrams,
          images: images as { url: string; blurHash: string | null }[],
          stock: stock ?? 0,
        })
        .returning({ id: products.id });

      if (!product) {
        throw new Error('Product insert did not return id');
      }

      const mappedTiers = tiers.map((tier) => ({
        productId: product.id,
        minQty: tier.minQty,
        maxQty: tier.maxQty,
        priceCents: tier.price,
      }));

      await tx.insert(productPriceTiers).values(mappedTiers);

      return [product];
    });

    revalidatePath(ABSOLUTE_ROUTES.VENDOR_PRODUCTS);

    return jsonSuccess({ productId: inserted.id }, undefined, 201);
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

    const pgErr = err as { code?: string };
    if (pgErr?.code === POSTGRES_UNIQUE_VIOLATION) {
      return jsonError('A product with this slug already exists.', 409);
    }

    console.error('POST /api/vendor/products error:', err);
    return jsonError('Failed to create product. Please try again.', 500);
  }
}
