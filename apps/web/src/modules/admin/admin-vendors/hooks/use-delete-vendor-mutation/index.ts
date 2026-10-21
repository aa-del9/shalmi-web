'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VendorQueryKeys } from '../vendor-query-keys';

export function useDeleteVendorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vendorId: string) => {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to remove vendor');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VendorQueryKeys.all });
    },
  });
}
