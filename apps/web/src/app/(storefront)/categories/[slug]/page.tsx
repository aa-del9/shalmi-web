import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug } from '@/modules/storefront/utils/get-products-by-category';
import { CategoryProductsGrid } from '@/modules/storefront/components/category-products-grid';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: 'Category Not Found' };

  return {
    title: `${category.name} — Shaalmi`,
    description: `Browse ${category.name} products at wholesale prices on Shaalmi.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {category.name}
      </h1>
      <CategoryProductsGrid categoryId={category.id} />
    </div>
  );
}
