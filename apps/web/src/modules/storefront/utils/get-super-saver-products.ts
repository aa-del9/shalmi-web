import { unstable_cache } from 'next/cache';
import { desc, eq, max, min, sql } from 'drizzle-orm';
import { db, products, productPriceTiers } from '@repo/database';
import type { StorefrontProduct } from '../types';

export async function getSuperSaverProducts(): Promise<StorefrontProduct[]> {
  return unstable_cache(
    async () => {
      const spread = sql<number>`(${max(productPriceTiers.priceCents)} - ${min(productPriceTiers.priceCents)})`;

      const rows = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          images: products.images,
          weightGrams: products.weightGrams,
          lowestPriceCents: min(productPriceTiers.priceCents),
          spread,
        })
        .from(products)
        .innerJoin(
          productPriceTiers,
          eq(products.id, productPriceTiers.productId)
        )
        .groupBy(products.id)
        .orderBy(desc(spread))
        .limit(20);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return rows.map(({ spread: _, ...r }) => ({
        ...r,
        lowestPriceCents: r.lowestPriceCents ?? 0,
      }));
    },
    ['super-saver-products'],
    { tags: ['products'] }
  )();
}
