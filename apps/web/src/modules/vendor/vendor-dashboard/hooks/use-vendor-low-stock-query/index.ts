'use client';

import { useQuery } from '@tanstack/react-query';

export type VendorLowStockRow = {
  id: string;
  name: string;
  slug: string;
  stock: number;
};

export type VendorLowStockResponse = {
  threshold: number;
  rows: ReadonlyArray<VendorLowStockRow>;
};

export function useVendorLowStockQuery() {
  return useQuery({
    queryKey: ['vendor', 'dashboard', 'low-stock'] as const,
    queryFn: async (): Promise<VendorLowStockResponse> => {
      const res = await fetch('/api/vendor/dashboard/low-stock');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to load low-stock products');
      }
      return data.data as VendorLowStockResponse;
    },
    staleTime: 60_000,
  });
}
