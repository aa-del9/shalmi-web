import { unstable_cache } from 'next/cache';
import { asc, eq } from 'drizzle-orm';
import { db, categories } from '@repo/database';

// TODO(post-v1): align with full Categories rich model — see
// 06-scope-cut.md "Categories rich model" feature.
export async function getCachedCategories() {
  return unstable_cache(
    async () => {
      return db
        .select()
        .from(categories)
        .where(eq(categories.isActive, true))
        .orderBy(asc(categories.name))
        .limit(10);
    },
    ['storefront-categories'],
    { tags: ['categories'] }
  )();
}
