'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateVendorInput } from '../../schemas';
import { VendorQueryKeys } from '../vendor-query-keys';

export function useUpdateVendorMutation(vendorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateVendorInput) => {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to update vendor');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VendorQueryKeys.all });
    },
  });
}
