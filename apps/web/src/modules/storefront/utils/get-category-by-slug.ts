import { unstable_cache } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db, categories } from '@repo/database';

export async function getCategoryBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const [category] = await db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        })
        .from(categories)
        .where(eq(categories.slug, slug))
        .limit(1);

      return category ?? null;
    },
    [`category-by-slug-${slug}`],
    { tags: ['categories'] }
  )();
}
