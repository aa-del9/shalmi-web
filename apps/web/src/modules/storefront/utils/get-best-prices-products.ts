import { unstable_cache } from 'next/cache';
import { asc, eq, min } from 'drizzle-orm';
import { db, products, productPackTiers } from '@repo/database';
import type { StorefrontProduct } from '../types';

export async function getBestPricesProducts(): Promise<StorefrontProduct[]> {
  return unstable_cache(
    async () => {
      const rows = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          images: products.images,
          packWeightGrams: products.packWeightGrams,
          packSize: products.packSize,
          unitLabel: products.unitLabel,
          lowestPriceCents: min(productPackTiers.pricePerPackCents),
        })
        .from(products)
        .innerJoin(
          productPackTiers,
          eq(products.id, productPackTiers.productId)
        )
        .groupBy(products.id)
        .orderBy(asc(min(productPackTiers.pricePerPackCents)))
        .limit(20);

      return rows.map((r) => ({
        ...r,
        lowestPriceCents: r.lowestPriceCents ?? 0,
      }));
    },
    ['best-prices-products'],
    { tags: ['products'] }
  )();
}
