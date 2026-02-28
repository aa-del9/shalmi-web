import type { NextRequest } from 'next/server';
import { eq, asc, min, countDistinct } from 'drizzle-orm';
import {
  db,
  products,
  productPriceTiers,
  productCategories,
  categories,
} from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import {
  normalizePagination,
  buildPaginationMeta,
} from '@/modules/core/server-actions/pagination';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) return jsonError('Category ID is required', 400);

    const [category] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!category) return jsonError('Category not found', 404);

    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = normalizePagination({
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    });

    const [countResult, rows] = await Promise.all([
      db
        .select({ total: countDistinct(products.id) })
        .from(productCategories)
        .innerJoin(products, eq(productCategories.productId, products.id))
        .where(eq(productCategories.categoryId, id)),

      db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          images: products.images,
          weightGrams: products.weightGrams,
          lowestPriceCents: min(productPriceTiers.priceCents),
        })
        .from(productCategories)
        .innerJoin(products, eq(productCategories.productId, products.id))
        .innerJoin(productPriceTiers, eq(products.id, productPriceTiers.productId))
        .where(eq(productCategories.categoryId, id))
        .groupBy(products.id)
        .orderBy(asc(products.name))
        .limit(limit)
        .offset(offset),
    ]);

    const totalCount = Number(countResult[0]?.total ?? 0);
    const meta = buildPaginationMeta(totalCount, page, limit);

    const data = rows.map((r) => ({
      ...r,
      lowestPriceCents: r.lowestPriceCents ?? 0,
    }));

    return jsonSuccess(data, meta);
  } catch (err) {
    console.error('GET /api/categories/[id]/products error:', err);
    return jsonError('Failed to load products.', 500);
  }
}
