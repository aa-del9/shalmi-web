'use client';

import { useQuery } from '@tanstack/react-query';
import { RetailerOrdersQueryKeys } from '@/modules/retailer/retailer-orders/hooks/retailer-orders-query-keys';
import type { OrderDetail } from '../../types';

async function fetchOrderDetail(orderId: string) {
  const res = await fetch(`/api/retailer/orders/${orderId}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error ?? 'Failed to load order details');
  }
  return data.data as OrderDetail;
}

export function useRetailerOrderDetailQuery(orderId: string) {
  return useQuery({
    queryKey: RetailerOrdersQueryKeys.detail(orderId),
    queryFn: () => fetchOrderDetail(orderId),
    enabled: !!orderId,
  });
}
