import { unstable_cache } from 'next/cache';
import { desc, eq, max, min, sql } from 'drizzle-orm';
import { db, products, productPackTiers } from '@repo/database';
import type { StorefrontProduct } from '../types';

export async function getSuperSaverProducts(): Promise<StorefrontProduct[]> {
  return unstable_cache(
    async () => {
      const spread = sql<number>`(${max(productPackTiers.pricePerPackCents)} - ${min(productPackTiers.pricePerPackCents)})`;

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
          spread,
        })
        .from(products)
        .innerJoin(
          productPackTiers,
          eq(products.id, productPackTiers.productId)
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
