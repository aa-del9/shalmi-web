import { unstable_cache } from 'next/cache';
import { asc, desc, eq } from 'drizzle-orm';
import { db, promotionalBanners } from '@repo/database';

export async function getCachedBanners() {
  return unstable_cache(
    async () => {
      const rows = await db
        .select()
        .from(promotionalBanners)
        .where(eq(promotionalBanners.isActive, true))
        .orderBy(asc(promotionalBanners.displayOrder));
      return rows;
    },
    ['public-banners'],
    { tags: ['banners'] }
  )();
}

export async function getAllBannersAdmin() {
  const rows = await db
    .select()
    .from(promotionalBanners)
    .orderBy(
      desc(promotionalBanners.isActive),
      asc(promotionalBanners.displayOrder)
    );
  return rows;
}
