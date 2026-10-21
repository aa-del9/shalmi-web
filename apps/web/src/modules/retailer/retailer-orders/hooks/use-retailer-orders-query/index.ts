'use client';

import { useQuery } from '@tanstack/react-query';
import {
  RetailerOrdersQueryKeys,
  type RetailerOrdersListParams,
} from '../retailer-orders-query-keys';
import type { RetailerOrdersResponse } from '../../types';

async function fetchRetailerOrders(
  params: RetailerOrdersListParams
): Promise<RetailerOrdersResponse> {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.sort && params.sort !== 'newest') search.set('sort', params.sort);

  const qs = search.toString();
  const res = await fetch(`/api/retailer/orders${qs ? `?${qs}` : ''}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error ?? 'Failed to load orders');
  }
  return data.data as RetailerOrdersResponse;
}

export function useRetailerOrdersQuery(params: RetailerOrdersListParams) {
  return useQuery({
    queryKey: RetailerOrdersQueryKeys.list(params),
    queryFn: () => fetchRetailerOrders(params),
  });
}
