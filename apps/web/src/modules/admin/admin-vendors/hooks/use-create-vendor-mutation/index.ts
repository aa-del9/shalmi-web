'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVendor } from '../../actions';
import type { CreateVendorInput } from '../../schemas';
import { VendorQueryKeys } from '../vendor-query-keys';

export function useCreateVendorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVendorInput) => createVendor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VendorQueryKeys.all });
    },
  });
}
