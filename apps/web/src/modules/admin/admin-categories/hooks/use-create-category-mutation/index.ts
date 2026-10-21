'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateCategoryInput } from '../../schemas';
import { CategoryQueryKeys } from '@/modules/common/queries/categories';
import { AdminCategoriesQueryKeys } from '../use-admin-categories-query';

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCategoryInput) => {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to create category');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CategoryQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: AdminCategoriesQueryKeys.all,
      });
    },
  });
}
