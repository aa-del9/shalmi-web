'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useCategoryProductsQuery } from '../../hooks/use-category-products-query';
import { ProductCard } from '../product-card';
import { ProductGridSkeleton } from '../product-grid-skeleton';

interface CategoryProductsGridProps {
  categoryId: string;
}

export function CategoryProductsGrid({
  categoryId,
}: CategoryProductsGridProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useCategoryProductsQuery(categoryId);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '200px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  if (isLoading) return <ProductGridSkeleton />;

  if (isError) {
    return (
      <p className="text-destructive py-10 text-center">
        {error?.message ?? 'Failed to load products.'}
      </p>
    );
  }

  const products = data?.pages.flatMap((p) => p.products) ?? [];
  const totalCount = data?.pages[0]?.meta.totalCount ?? 0;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground text-lg">
          No products in this category yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-muted-foreground mb-6">
        {totalCount} {totalCount === 1 ? 'product' : 'products'}
      </p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      )}

      {!hasNextPage && products.length > 0 && (
        <p className="text-muted-foreground py-8 text-center text-sm">
          You&apos;ve seen all products in this category.
        </p>
      )}
    </>
  );
}
