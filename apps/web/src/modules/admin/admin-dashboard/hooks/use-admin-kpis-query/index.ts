'use client';

import { useQuery } from '@tanstack/react-query';

export type AdminKpis = {
  totalSalesCents: number;
  totalProducts: number;
  totalOrders: number;
  activeVendors: number;
  orderStatus: {
    pending: number;
    delivered: number;
    cancelled: number;
    avgFulfillmentDays: number;
    slaTargetDays: number;
  };
};

export function useAdminKpisQuery() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'kpis'] as const,
    queryFn: async (): Promise<AdminKpis> => {
      const res = await fetch('/api/admin/dashboard/kpis');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to load KPIs');
      }
      return data.data as AdminKpis;
    },
    staleTime: 30_000,
  });
}
