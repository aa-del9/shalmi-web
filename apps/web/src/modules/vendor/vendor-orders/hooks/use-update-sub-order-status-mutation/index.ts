'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VendorOrdersQueryKeys } from '../vendor-orders-query-keys';

async function advanceSubOrderStatus(subOrderId: string) {
  const res = await fetch(`/api/vendor/orders/${subOrderId}`, {
    method: 'PATCH',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error ?? 'Failed to update status');
  }
  return data.data as { id: string; status: string };
}

export function useUpdateSubOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: advanceSubOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: VendorOrdersQueryKeys.all,
      });
    },
  });
}
