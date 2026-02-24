'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateProductInput } from '@repo/schemas/catalog/product';
import { VendorProductQueryKeys } from '../vendor-product-query-keys';

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateProductInput) => {
      const res = await fetch('/api/vendor/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to create product');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VendorProductQueryKeys.all });
      toast.success('Product created successfully.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    },
  });
}
