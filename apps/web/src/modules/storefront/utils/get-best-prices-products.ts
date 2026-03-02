import { unstable_cache } from 'next/cache';
import { asc, eq, min } from 'drizzle-orm';
import { db, products, productPriceTiers } from '@repo/database';
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
          weightGrams: products.weightGrams,
          lowestPriceCents: min(productPriceTiers.priceCents),
        })
        .from(products)
        .innerJoin(
          productPriceTiers,
          eq(products.id, productPriceTiers.productId)
        )
        .groupBy(products.id)
        .orderBy(asc(min(productPriceTiers.priceCents)))
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
