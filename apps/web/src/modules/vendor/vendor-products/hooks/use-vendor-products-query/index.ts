'use client';

import { useQuery } from '@tanstack/react-query';
import { VendorProductQueryKeys } from '../vendor-product-query-keys';

async function fetchVendorProductsApi() {
  const res = await fetch('/api/vendor/products');
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error ?? 'Failed to load products');
  }
  return data.data;
}

export function useVendorProductsQuery() {
  return useQuery({
    queryKey: VendorProductQueryKeys.all,
    queryFn: fetchVendorProductsApi,
  });
}
