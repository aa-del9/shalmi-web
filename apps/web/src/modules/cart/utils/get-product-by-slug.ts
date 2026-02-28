import { unstable_cache } from 'next/cache';
import { eq, asc } from 'drizzle-orm';
import { db, products, productPriceTiers } from '@repo/database';

export async function getProductBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.slug, slug))
        .limit(1);

      if (!product) return null;

      const tiers = await db
        .select({
          minQty: productPriceTiers.minQty,
          maxQty: productPriceTiers.maxQty,
          priceCents: productPriceTiers.priceCents,
        })
        .from(productPriceTiers)
        .where(eq(productPriceTiers.productId, product.id))
        .orderBy(asc(productPriceTiers.minQty));

      return { ...product, priceTiers: tiers };
    },
    [`product-${slug}`],
    { tags: ['products'] }
  )();
}
