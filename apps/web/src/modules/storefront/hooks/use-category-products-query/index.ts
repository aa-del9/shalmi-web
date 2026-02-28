'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { CategoryProductsQueryKeys } from '../category-products-query-keys';
import type { StorefrontProduct } from '../../types';
import type { JsonPaginationMeta } from '@/modules/core/api/json-response';

interface CategoryProductsPage {
  products: StorefrontProduct[];
  meta: JsonPaginationMeta;
}

const PAGE_SIZE = 20;

async function fetchCategoryProducts(
  categoryId: string,
  page: number
): Promise<CategoryProductsPage> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });

  const res = await fetch(`/api/categories/${categoryId}/products?${params}`);
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json?.error ?? 'Failed to load products');
  }

  return {
    products: json.data ?? [],
    meta: json.meta,
  };
}

export function useCategoryProductsQuery(categoryId: string) {
  return useInfiniteQuery({
    queryKey: CategoryProductsQueryKeys.list(categoryId),
    queryFn: ({ pageParam }) => fetchCategoryProducts(categoryId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
}
