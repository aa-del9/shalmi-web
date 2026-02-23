'use client';

import { useQuery } from '@tanstack/react-query';
import type { VendorDetail } from '../../types';
import { VendorQueryKeys } from '../vendor-query-keys';

export function useVendorQuery(vendorId: string | null) {
  return useQuery({
    queryKey: [...VendorQueryKeys.all, 'detail', vendorId],
    queryFn: async (): Promise<VendorDetail> => {
      const res = await fetch(`/api/admin/vendors/${vendorId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to load vendor');
      }
      return data.data;
    },
    enabled: Boolean(vendorId),
  });
}
