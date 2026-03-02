'use client';

import { useQuery } from '@tanstack/react-query';
import { RetailerOrdersQueryKeys } from '../retailer-orders-query-keys';
import type { RetailerOrder } from '../../types';

async function fetchRetailerOrders() {
  const res = await fetch('/api/retailer/orders');
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error ?? 'Failed to load orders');
  }
  return data.data as RetailerOrder[];
}

export function useRetailerOrdersQuery() {
  return useQuery({
    queryKey: RetailerOrdersQueryKeys.all,
    queryFn: fetchRetailerOrders,
  });
}
