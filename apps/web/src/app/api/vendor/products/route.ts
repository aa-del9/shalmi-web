import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  eq,
  desc,
  asc,
  inArray,
  and,
  count,
  ilike,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import {
  db,
  products,
  productPackTiers,
  productCategories,
} from '@repo/database';
import { createProductSchema } from '@repo/schemas/catalog/product';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireVendor } from '@/modules/auth/server/guards/require-role';
import { getVendorIdFromSession } from '@/modules/auth/server/get-vendor-id-from-session';
import { slugForProduct } from '@/modules/core/utils/slug';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import { POSTGRES_UNIQUE_VIOLATION } from '@repo/constants/postgres';

const PAGE_SIZE_DEFAULT = 8;
const PAGE_SIZE_MAX = 30;

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
 *   status  — `all|active|low-stock|drafts` (filters rows; STUBBED low-stock
 *             uses constant threshold = 10 OR per-product threshold once
 *             the column is populated).
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
    const pageSize = Math.min(
      PAGE_SIZE_MAX,
      Math.max(
        1,
        Number(url.searchParams.get('pageSize') ?? PAGE_SIZE_DEFAULT) ||
          PAGE_SIZE_DEFAULT
      )
    );
    const q = (url.searchParams.get('q') ?? '').trim();
    const statusFilter = url.searchParams.get('status') ?? 'all';
    const categoryId = url.searchParams.get('categoryId') ?? '';
    const sort = url.searchParams.get('sort') ?? 'newest';

    const baseWhere: SQL[] = [eq(products.vendorId, vendorId)];

    if (q) {
      const like = `%${q}%`;
      const searchClause = or(
        ilike(products.name, like),
        ilike(products.sku, like),
        ilike(products.brand, like)
      );
      if (searchClause) baseWhere.push(searchClause);
    }

    if (statusFilter === 'active') {
      baseWhere.push(eq(products.status, 'active'));
      baseWhere.push(sql`${products.stock} > ${products.lowStockThreshold}`);
    } else if (statusFilter === 'drafts') {
      baseWhere.push(eq(products.status, 'draft'));
    } else if (statusFilter === 'low-stock') {
      baseWhere.push(eq(products.status, 'active'));
      baseWhere.push(sql`${products.stock} > 0`);
      baseWhere.push(sql`${products.stock} <= ${products.lowStockThreshold}`);
    }

    if (categoryId) {
      const ids = await db
        .select({ productId: productCategories.productId })
        .from(productCategories)
        .where(eq(productCategories.categoryId, categoryId));
      const productIds = ids.map((r) => r.productId);
      if (productIds.length === 0) {
        return jsonSuccess({
          rows: [],
          total: 0,
          page,
          pageSize,
          stats: await readStats(vendorId),
        });
      }
      baseWhere.push(inArray(products.id, productIds));
    }

    const orderClause =
      sort === 'oldest'
        ? asc(products.createdAt)
        : sort === 'stock-asc'
          ? asc(products.stock)
          : sort === 'stock-desc'
            ? desc(products.stock)
            : desc(products.createdAt);

    const whereExpr = baseWhere.length === 1 ? baseWhere[0] : and(...baseWhere);

    const [totalRow] = await db
      .select({ totalCount: count() })
      .from(products)
      .where(whereExpr);
    const total = Number(totalRow?.totalCount ?? 0);

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        brand: products.brand,
        packWeightGrams: products.packWeightGrams,
        packSize: products.packSize,
        unitLabel: products.unitLabel,
        packWholesalePriceCents: products.packWholesalePriceCents,
        images: products.images,
        stock: products.stock,
        lowStockThreshold: products.lowStockThreshold,
        status: products.status,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(whereExpr)
      .orderBy(orderClause)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const productIds = rows.map((r) => r.id);
    const categoryLinks =
      productIds.length > 0
        ? await db
            .select({
              productId: productCategories.productId,
              categoryId: productCategories.categoryId,
            })
            .from(productCategories)
            .where(inArray(productCategories.productId, productIds))
        : [];

    const categoryIdsByProductId = categoryLinks.reduce(
      (acc, { productId, categoryId: linkCategoryId }) => {
        if (!acc[productId]) acc[productId] = [];
        acc[productId].push(linkCategoryId);
        return acc;
      },
      {} as Record<string, string[]>
    );

    const data = rows.map((row) => ({
      ...row,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : row.createdAt,
      categoryIds: categoryIdsByProductId[row.id] ?? [],
    }));

    return jsonSuccess({
      rows: data,
      total,
      page,
      pageSize,
      stats: await readStats(vendorId),
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
    console.error('GET /api/vendor/products error:', err);
    return jsonError('Failed to load products.', 500);
  }
}

async function readStats(vendorId: string) {
  const [allRow] = await db
    .select({ rowCount: count() })
    .from(products)
    .where(eq(products.vendorId, vendorId));
  const [activeRow] = await db
    .select({ rowCount: count() })
    .from(products)
    .where(
      and(
        eq(products.vendorId, vendorId),
        eq(products.status, 'active'),
        sql`${products.stock} > ${products.lowStockThreshold}`
      )
    );
  const [lowRow] = await db
    .select({ rowCount: count() })
    .from(products)
    .where(
      and(
        eq(products.vendorId, vendorId),
        eq(products.status, 'active'),
        sql`${products.stock} > 0`,
        sql`${products.stock} <= ${products.lowStockThreshold}`
      )
    );
  const [draftRow] = await db
    .select({ rowCount: count() })
    .from(products)
    .where(and(eq(products.vendorId, vendorId), eq(products.status, 'draft')));
  return {
    all: Number(allRow?.rowCount ?? 0),
    active: Number(activeRow?.rowCount ?? 0),
    lowStock: Number(lowRow?.rowCount ?? 0),
    drafts: Number(draftRow?.rowCount ?? 0),
  };
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
      const message = parsed.error.flatten().formErrors[0] ?? 'Invalid input';
      return jsonError(message, 400);
    }

    const {
      name,
      packWeightGrams,
      packSize,
      unitWeightGrams,
      unitLabel,
      packMrpCents,
      packWholesalePriceCents,
      pricePerUnitCents,
      images,
      stock,
      packTiers,
      categoryIds,
      sku,
      brand,
      lowStockThreshold,
      status,
    } = parsed.data;
    const slug = slugForProduct(name);

    const [inserted] = await db.transaction(async (tx) => {
      const [product] = await tx
        .insert(products)
        .values({
          vendorId,
          name,
          slug,
          packWeightGrams,
          packSize,
          unitWeightGrams: unitWeightGrams ?? null,
          unitLabel: unitLabel ?? null,
          packMrpCents: packMrpCents ?? null,
          packWholesalePriceCents,
          pricePerUnitCents: pricePerUnitCents ?? null,
          images: images as { url: string; blurHash: string | null }[],
          stock: stock ?? 0,
          sku: sku ?? null,
          brand: brand ?? null,
          lowStockThreshold: lowStockThreshold ?? 10,
          status: status ?? 'active',
        })
        .returning({ id: products.id });

      if (!product) {
        throw new Error('Product insert did not return id');
      }

      await tx.insert(productPackTiers).values(
        packTiers.map((tier) => ({
          productId: product.id,
          packQty: tier.packQty,
          pricePerPackCents: tier.pricePerPackCents,
          badge: tier.badge ?? null,
          isDefault: tier.isDefault ?? false,
        }))
      );

      if (categoryIds && categoryIds.length > 0) {
        await tx.insert(productCategories).values(
          categoryIds.map((categoryId) => ({
            productId: product.id,
            categoryId,
          }))
        );
      }

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
      return jsonError(
        'A product with this slug or SKU already exists.',
        409
      );
    }

    console.error('POST /api/vendor/products error:', err);
    return jsonError('Failed to create product. Please try again.', 500);
  }
}
