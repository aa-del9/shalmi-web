'use client';

import { useQuery } from '@tanstack/react-query';
import { VendorQueryKeys } from '../vendor-query-keys';

type UseVendorsParams = {
  page?: number;
  limit?: number;
};

export function useVendorsQuery({
  page = 1,
  limit = 10,
}: UseVendorsParams = {}) {
  return useQuery({
    queryKey: VendorQueryKeys.list(page, limit),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const res = await fetch(`/api/admin/vendors?${params}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? 'Failed to load vendors');
      }
      return data;
    },
  });
}
