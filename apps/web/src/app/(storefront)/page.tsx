import type { Metadata } from 'next';

import { HomeHeroSection } from '@/modules/storefront/components/home/hero-section';
import { HomeCategoriesGrid } from '@/modules/storefront/components/home/categories-grid';
import { HomePopularSection } from '@/modules/storefront/components/home/popular-section';
import { HomeBestPricesGrid } from '@/modules/storefront/components/home/best-prices-grid';
import { HomeHotProductsGrid } from '@/modules/storefront/components/home/hot-products-grid';
import { HomePromoStrip } from '@/modules/storefront/components/home/promo-strip';

export const metadata: Metadata = {
  title: 'Shalmi Mart — Wholesale B2B Marketplace',
  description:
    'Shop thousands of wholesale products at the best bulk prices on Shalmi Mart.',
};

export default function HomePage() {
  // Each section is a Server Component that fetches its own cached data.
  // Composition order matches Pencil bid1Y / X0SzkF.
  return (
    <div className="bg-paper flex flex-col">
      <HomeHeroSection />
      <HomeCategoriesGrid />
      <HomePopularSection />
      <HomeBestPricesGrid />
      <HomeHotProductsGrid />
      <HomePromoStrip />
    </div>
  );
}
