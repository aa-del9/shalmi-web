'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateVendorInput } from '../../schemas';
import { VendorQueryKeys } from '../vendor-query-keys';

export function useCreateVendorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateVendorInput) => {
      const res = await fetch('/api/admin/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to create vendor');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VendorQueryKeys.all });
    },
  });
}
