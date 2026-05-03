'use client';

import { useQuery } from '@tanstack/react-query';

export type PayoutRunRow = {
  id: string;
  weekStart: string;
  weekEnd: string;
  paidOn: string | null;
  txnId: string | null;
  completedOrdersCount: number;
  netAmountCents: number;
  status: 'pending' | 'paid' | 'held' | 'failed';
};

export type PayoutsHistoryResponse = {
  runs: PayoutRunRow[];
  lifetime: {
    totalNetAmountCents: number;
    weeksCount: number;
  } | null;
};

export function usePayoutsHistoryQuery(limit = 8) {
  return useQuery({
    queryKey: ['vendor', 'payouts', 'history', limit] as const,
    queryFn: async (): Promise<PayoutsHistoryResponse> => {
      const res = await fetch(`/api/vendor/payouts?limit=${limit}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to load payout history');
      }
      return data.data as PayoutsHistoryResponse;
    },
    staleTime: 60_000,
  });
}
