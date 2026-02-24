'use client';

import { useQuery } from '@tanstack/react-query';
import { VendorProductQueryKeys } from '../vendor-product-query-keys';
import type { VendorProductDetail } from '../../types';

async function fetchVendorProductApi(productId: string): Promise<VendorProductDetail> {
  const res = await fetch(`/api/vendor/products/${productId}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error ?? 'Failed to load product');
  }
  return data.data;
}

export function useVendorProductQuery(productId: string | null) {
  return useQuery({
    queryKey: [...VendorProductQueryKeys.all, 'detail', productId],
    queryFn: () => fetchVendorProductApi(productId!),
    enabled: Boolean(productId),
  });
}
