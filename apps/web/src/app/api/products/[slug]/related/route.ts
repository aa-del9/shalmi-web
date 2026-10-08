import type { NextRequest } from 'next/server';
import { and, asc, desc, eq, ne } from 'drizzle-orm';
import {
  db,
  products,
  productCategories,
  productPackTiers,
} from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';

type RouteContext = { params: Promise<{ slug: string }> };

const TAKE = 8;

/**
 * Related products for the PDP "you may also like" rail
 * (per buyer-product gap-analysis Q21): same primary category, exclude
 * self, ordered by stock descending then createdAt descending.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    if (!slug) return jsonError('Slug is required', 400);

    const [self] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (!self) return jsonError('Product not found', 404);

    const [primaryCategoryRow] = await db
      .select({ categoryId: productCategories.categoryId })
      .from(productCategories)
      .where(eq(productCategories.productId, self.id))
      .limit(1);

    if (!primaryCategoryRow) {
      return jsonSuccess({ items: [] });
    }

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        vendorId: products.vendorId,
        images: products.images,
        packWeightGrams: products.packWeightGrams,
        packSize: products.packSize,
        unitLabel: products.unitLabel,
        packMrpCents: products.packMrpCents,
        packWholesalePriceCents: products.packWholesalePriceCents,
        pricePerUnitCents: products.pricePerUnitCents,
        stock: products.stock,
      })
      .from(productCategories)
      .innerJoin(products, eq(productCategories.productId, products.id))
      .where(
        and(
          eq(productCategories.categoryId, primaryCategoryRow.categoryId),
          ne(products.id, self.id)
        )
      )
      .orderBy(desc(products.stock), desc(products.createdAt))
      .limit(TAKE);

    if (rows.length === 0) return jsonSuccess({ items: [] });

    const productIds = rows.map((r) => r.id);
    const tiers = await db
      .select({
        productId: productPackTiers.productId,
        pricePerPackCents: productPackTiers.pricePerPackCents,
      })
      .from(productPackTiers)
      .where(eq(productPackTiers.productId, productIds[0] ?? ''));

    // Lowest per-pack price per product.
    const lowestByProduct = new Map<string, number>();
    if (productIds.length > 1) {
      const allTiers = await db
        .select({
          productId: productPackTiers.productId,
          pricePerPackCents: productPackTiers.pricePerPackCents,
        })
        .from(productPackTiers)
        .orderBy(asc(productPackTiers.pricePerPackCents));
      for (const t of allTiers) {
        if (!productIds.includes(t.productId)) continue;
        if (!lowestByProduct.has(t.productId)) {
          lowestByProduct.set(t.productId, t.pricePerPackCents);
        }
      }
    } else {
      for (const t of tiers) {
        if (!lowestByProduct.has(t.productId)) {
          lowestByProduct.set(t.productId, t.pricePerPackCents);
        }
      }
    }

    return jsonSuccess({
      items: rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        vendorId: r.vendorId,
        images: r.images,
        packWeightGrams: r.packWeightGrams,
        packSize: r.packSize,
        unitLabel: r.unitLabel,
        packMrpCents: r.packMrpCents,
        packWholesalePriceCents: r.packWholesalePriceCents,
        pricePerUnitCents: r.pricePerUnitCents,
        stock: r.stock,
        lowestPriceCents:
          lowestByProduct.get(r.id) ?? r.packWholesalePriceCents,
      })),
    });
  } catch (err) {
    console.error('GET /api/products/[slug]/related error:', err);
    return jsonError('Failed to load related products.', 500);
  }
}
