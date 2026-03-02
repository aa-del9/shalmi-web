import { getBestPricesProducts } from '@/modules/storefront/utils/get-best-prices-products';
import { ProductCarouselSection } from '../product-carousel-section';

export async function BestPricesSection() {
  const products = await getBestPricesProducts();

  if (products.length === 0) return null;

  return <ProductCarouselSection title="Best Prices" products={products} />;
}
