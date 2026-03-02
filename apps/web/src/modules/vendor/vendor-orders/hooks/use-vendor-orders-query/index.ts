'use client';

import { useQuery } from '@tanstack/react-query';
import { VendorOrdersQueryKeys } from '../vendor-orders-query-keys';
import type { VendorSubOrder } from '../../types';

async function fetchVendorOrders() {
  const res = await fetch('/api/vendor/orders');
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error ?? 'Failed to load orders');
  }
  return data.data as VendorSubOrder[];
}

export function useVendorOrdersQuery() {
  return useQuery({
    queryKey: VendorOrdersQueryKeys.all,
    queryFn: fetchVendorOrders,
    refetchInterval: 5000,
  });
}
