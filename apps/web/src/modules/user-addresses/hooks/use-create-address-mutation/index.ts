'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AddressQueryKeys } from '../address-query-keys';
import type { CreateAddressInput } from '../../schemas';

export function useCreateAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAddressInput) => {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? 'Failed to create address');
      }
      if (!data.success) {
        throw new Error(data?.error ?? 'Failed to create address');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AddressQueryKeys.all });
      toast.success('Address added');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong'
      );
    },
  });
}
