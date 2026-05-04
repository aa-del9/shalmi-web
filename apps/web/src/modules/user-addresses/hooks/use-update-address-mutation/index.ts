'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AddressQueryKeys } from '../address-query-keys';
import type { UpdateAddressInput } from '../../schemas';

interface UpdateAddressPayload {
  id: string;
  data: UpdateAddressInput;
}

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateAddressPayload) => {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error ?? 'Failed to update address');
      }
      if (!body.success) {
        throw new Error(body?.error ?? 'Failed to update address');
      }
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AddressQueryKeys.all });
      toast.success('Address updated');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong'
      );
    },
  });
}
