'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { UpdateProductInput } from '@repo/schemas/catalog/product';
import { VendorProductQueryKeys } from '../vendor-product-query-keys';
export function useUpdateProductMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProductInput) => {
      const res = await fetch(`/api/vendor/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to update product');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VendorProductQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: [...VendorProductQueryKeys.all, 'detail', productId],
      });
      toast.success('Product updated successfully.');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong'
      );
    },
  });
}
