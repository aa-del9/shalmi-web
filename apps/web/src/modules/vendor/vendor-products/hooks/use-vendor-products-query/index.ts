'use client';

import { useQuery } from '@tanstack/react-query';
import { VendorProductQueryKeys } from '../vendor-product-query-keys';
import type {
  VendorProductsFilters,
  VendorProductsResponse,
} from '../../types';

async function fetchVendorProductsApi(
  filters: VendorProductsFilters
): Promise<VendorProductsResponse> {
  const params = new URLSearchParams();
  params.set('page', String(filters.page));
  if (filters.q) params.set('q', filters.q);
  if (filters.status && filters.status !== 'all')
    params.set('status', filters.status);
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.sort) params.set('sort', filters.sort);
  const res = await fetch(`/api/vendor/products?${params.toString()}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error ?? 'Failed to load products');
  }
  return data.data as VendorProductsResponse;
}

export function useVendorProductsQuery(filters: VendorProductsFilters) {
  return useQuery({
    queryKey: [...VendorProductQueryKeys.all, filters] as const,
    queryFn: () => fetchVendorProductsApi(filters),
    placeholderData: (prev) => prev,
  });
}
