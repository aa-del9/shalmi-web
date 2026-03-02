import { unstable_cache } from 'next/cache';
import { asc } from 'drizzle-orm';
import { db, categories } from '@repo/database';

export async function getCachedCategories() {
  return unstable_cache(
    async () => {
      return db
        .select()
        .from(categories)
        .orderBy(asc(categories.name))
        .limit(10);
    },
    ['storefront-categories'],
    { tags: ['categories'] }
  )();
}
