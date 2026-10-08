import { unstable_cache } from 'next/cache';
import { and, asc, desc, eq, gte, isNull, lte, or } from 'drizzle-orm';
import { db, promotionalBanners } from '@repo/database';

// Q6 binding: storefront feed shows only `status='live'` banners that are
// inside their scheduling window (open-ended dates allowed). Per Q4 binding,
// only the HERO position renders on the storefront in this revamp.
export async function getCachedBanners() {
  return unstable_cache(
    async () => {
      const now = new Date();
      const rows = await db
        .select()
        .from(promotionalBanners)
        .where(
          and(
            eq(promotionalBanners.status, 'live'),
            eq(promotionalBanners.position, 'hero'),
            or(
              isNull(promotionalBanners.startsAt),
              lte(promotionalBanners.startsAt, now)
            ),
            or(
              isNull(promotionalBanners.endsAt),
              gte(promotionalBanners.endsAt, now)
            )
          )
        )
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
