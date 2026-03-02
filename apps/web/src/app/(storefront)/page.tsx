import type { Metadata } from 'next';
import { getCachedBanners } from '@/modules/promotions/utils/get-cached-banners';
import { getCachedCategories } from '@/modules/storefront/utils/get-cached-categories';
import { HeroCarousel } from '@/modules/storefront/components/hero-carousel';
import { BestPricesSection } from '@/modules/storefront/components/best-prices-section';
import { SuperSaversSection } from '@/modules/storefront/components/super-savers-section';
import { CategorySection } from '@/modules/storefront/components/category-section';

export const metadata: Metadata = {
  title: 'Shalmi Mart — Wholesale B2B Marketplace',
  description:
    'Shop thousands of wholesale products at the best bulk prices on Shalmi Mart.',
};

export default async function HomePage() {
  const [banners, categories] = await Promise.all([
    getCachedBanners(),
    getCachedCategories(),
  ]);

  const popularCategories = categories.slice(0, 5);
  const moreCategories = categories.slice(5);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-8">
      <HeroCarousel banners={banners} />
      <BestPricesSection />
      <CategorySection
        title="Popular Categories"
        categories={popularCategories}
      />
      <SuperSaversSection />
      {moreCategories.length > 0 && (
        <CategorySection title="Browse More" categories={moreCategories} />
      )}
    </div>
  );
}
