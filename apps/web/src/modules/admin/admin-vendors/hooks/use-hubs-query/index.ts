'use client';

import { useQuery } from '@tanstack/react-query';
import { VendorQueryKeys } from '../vendor-query-keys';

export function useHubsQuery() {
  return useQuery({
    queryKey: [...VendorQueryKeys.all, 'hubs'] as const,
    queryFn: async (): Promise<string[]> => {
      const res = await fetch('/api/admin/vendors/hubs');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to load bazaars');
      }
      return data.data as string[];
    },
    staleTime: 60_000,
  });
}
