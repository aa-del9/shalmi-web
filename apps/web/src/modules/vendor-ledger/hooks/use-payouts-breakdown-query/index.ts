'use client';

import { useQuery } from '@tanstack/react-query';

export type PayoutBreakdown = {
  id: string;
  weekStart: string;
  weekEnd: string;
  completedOrdersCount: number;
  grossAmountCents: number;
  returnsAmountCents: number;
  mnpReimbursementCents: number;
  netAmountCents: number;
  itemsPackedCount: number | null;
  weightShippedGrams: number | null;
};

export function usePayoutsBreakdownQuery() {
  return useQuery({
    queryKey: ['vendor', 'payouts', 'breakdown'] as const,
    queryFn: async (): Promise<PayoutBreakdown | null> => {
      const res = await fetch('/api/vendor/payouts/breakdown');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to load payout breakdown');
      }
      return (data.data?.breakdown ?? null) as PayoutBreakdown | null;
    },
    staleTime: 60_000,
  });
}
