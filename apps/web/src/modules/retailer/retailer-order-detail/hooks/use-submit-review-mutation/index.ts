'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RetailerOrdersQueryKeys } from '@/modules/retailer/retailer-orders/hooks/retailer-orders-query-keys';

type SubmitReviewPayload = {
  productId: string;
  rating: number;
  comment?: string;
};

async function submitReview(payload: SubmitReviewPayload) {
  const res = await fetch('/api/retailer/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error ?? 'Failed to submit review');
  }
  return data.data;
}

export function useSubmitReviewMutation(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: RetailerOrdersQueryKeys.detail(orderId),
      });
    },
  });
}
