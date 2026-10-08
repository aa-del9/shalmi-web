'use client';

import { useQuery } from '@tanstack/react-query';

export type RecentOrder = {
  id: string;
  displayId: string;
  customerName: string | null;
  grandTotal: number;
  orderStatus: string;
  subOrderStatuses: ReadonlyArray<string>;
  itemsCount: number;
  weightGrams: number;
  createdAt: string;
};

export function useAdminRecentOrdersQuery(limit = 7) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'recent-orders', limit] as const,
    queryFn: async (): Promise<RecentOrder[]> => {
      const res = await fetch(`/api/admin/orders/recent?limit=${limit}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to load recent orders');
      }
      return data.data as RecentOrder[];
    },
    staleTime: 30_000,
  });
}
