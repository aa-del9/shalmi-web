'use client';

import { useQuery } from '@tanstack/react-query';

export type VendorNextPayout = {
  id: string;
  weekStart: string;
  weekEnd: string;
  netAmountCents: number;
  status: string;
} | null;

export function useVendorNextPayoutQuery() {
  return useQuery({
    queryKey: ['vendor', 'payouts', 'next'] as const,
    queryFn: async (): Promise<VendorNextPayout> => {
      const res = await fetch('/api/vendor/payouts/next');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to load next payout');
      }
      return (data.data?.nextPayout ?? null) as VendorNextPayout;
    },
    staleTime: 60_000,
  });
}
