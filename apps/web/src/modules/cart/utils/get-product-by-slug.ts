import { unstable_cache } from 'next/cache';
import { eq, asc } from 'drizzle-orm';
import {
  db,
  products,
  productPackTiers,
  productCategories,
  categories,
  vendors,
} from '@repo/database';
import type { PackTierBadge } from '@repo/schemas/catalog/product';

export type ProductWithPackPricing = Awaited<
  ReturnType<typeof getProductBySlug>
>;

export async function getProductBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const [product] = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          vendorId: products.vendorId,
          packWeightGrams: products.packWeightGrams,
          packSize: products.packSize,
          unitWeightGrams: products.unitWeightGrams,
          unitLabel: products.unitLabel,
          packMrpCents: products.packMrpCents,
          packWholesalePriceCents: products.packWholesalePriceCents,
          pricePerUnitCents: products.pricePerUnitCents,
          images: products.images,
          stock: products.stock,
        })
        .from(products)
        .where(eq(products.slug, slug))
        .limit(1);

      if (!product) return null;

      const [vendor] = await db
        .select({ id: vendors.id, shopName: vendors.shopName })
        .from(vendors)
        .where(eq(vendors.id, product.vendorId))
        .limit(1);

      const tiers = await db
        .select({
          id: productPackTiers.id,
          packQty: productPackTiers.packQty,
          pricePerPackCents: productPackTiers.pricePerPackCents,
          badge: productPackTiers.badge,
          isDefault: productPackTiers.isDefault,
        })
        .from(productPackTiers)
        .where(eq(productPackTiers.productId, product.id))
        .orderBy(asc(productPackTiers.packQty));

      // Primary category (first by insert order — per gap-analysis Q1).
      const [primaryCategoryRow] = await db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        })
        .from(productCategories)
        .innerJoin(categories, eq(productCategories.categoryId, categories.id))
        .where(eq(productCategories.productId, product.id))
        .limit(1);

      const packTiers = tiers.map((t) => ({
        id: t.id,
        packQty: t.packQty,
        pricePerPackCents: t.pricePerPackCents,
        badge: (t.badge ?? null) as PackTierBadge | null,
        isDefault: t.isDefault,
      }));

      return {
        ...product,
        vendorName: vendor?.shopName ?? null,
        packTiers,
        primaryCategory: primaryCategoryRow ?? null,
      };
    },
    [`product-${slug}`],
    { tags: ['products'] }
  )();
}
