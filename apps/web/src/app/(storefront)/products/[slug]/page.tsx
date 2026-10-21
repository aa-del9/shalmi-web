import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/modules/cart/utils/get-product-by-slug';
import { ProductDetail } from '@/modules/cart/components/product-detail';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.name} — Shalmi Mart`,
    description: `Buy ${product.name} at wholesale prices on Shalmi Mart.`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-6 md:px-10 md:py-8">
      <ProductDetail product={product} />
    </div>
  );
}
