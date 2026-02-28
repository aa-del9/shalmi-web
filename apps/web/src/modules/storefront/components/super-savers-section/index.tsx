import { getSuperSaverProducts } from '@/modules/storefront/utils/get-super-saver-products';
import { ProductCarouselSection } from '../product-carousel-section';

export async function SuperSaversSection() {
  const products = await getSuperSaverProducts();

  if (products.length === 0) return null;

  return <ProductCarouselSection title="Super Savers" products={products} />;
}
