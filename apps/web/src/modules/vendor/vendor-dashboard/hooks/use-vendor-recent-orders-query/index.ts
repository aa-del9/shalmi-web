'use client';

import { useQuery } from '@tanstack/react-query';

export type VendorRecentOrder = {
  id: string;
  orderDisplayId: string;
  status: string;
  codAmount: number;
  weightGrams: number;
  createdAt: string;
  buyerLabel: string;
  buyerCity: string;
  itemCount: number;
};

export function useVendorRecentOrdersQuery() {
  return useQuery({
    queryKey: ['vendor', 'dashboard', 'recent-orders'] as const,
    queryFn: async (): Promise<ReadonlyArray<VendorRecentOrder>> => {
      const res = await fetch('/api/vendor/dashboard/recent-orders');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to load recent orders');
      }
      return data.data as VendorRecentOrder[];
    },
    staleTime: 30_000,
  });
}
