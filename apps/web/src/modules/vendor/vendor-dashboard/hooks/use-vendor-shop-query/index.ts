'use client';

import { useQuery } from '@tanstack/react-query';

export type VendorShop = {
  id: string;
  shopName: string;
  fullName: string | null;
  hub: string;
  city: string;
  bankName: string;
  ibanLast4: string;
};

export function useVendorShopQuery() {
  return useQuery({
    queryKey: ['vendor', 'me', 'shop'] as const,
    queryFn: async (): Promise<VendorShop> => {
      const res = await fetch('/api/vendor/me');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to load vendor profile');
      }
      return data.data as VendorShop;
    },
    staleTime: 60_000,
  });
}
