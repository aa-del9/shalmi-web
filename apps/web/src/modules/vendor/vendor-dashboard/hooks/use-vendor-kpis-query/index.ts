'use client';

import { useQuery } from '@tanstack/react-query';

export type VendorKpis = {
  ordersToday: number;
  newToday: number;
  packedToday: number;
  revenueMtdCents: number;
  activeListings: number;
  lowStockCount: number;
};

export function useVendorKpisQuery() {
  return useQuery({
    queryKey: ['vendor', 'dashboard', 'kpis'] as const,
    queryFn: async (): Promise<VendorKpis> => {
      const res = await fetch('/api/vendor/dashboard/kpis');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to load dashboard KPIs');
      }
      return data.data as VendorKpis;
    },
    staleTime: 30_000,
  });
}
