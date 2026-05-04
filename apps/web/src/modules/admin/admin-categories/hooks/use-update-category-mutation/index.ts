'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateCategoryInput } from '../../schemas';
import { CategoryQueryKeys } from '@/modules/common/queries/categories';
import { AdminCategoriesQueryKeys } from '../use-admin-categories-query';

export function useUpdateCategoryMutation(categoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateCategoryInput) => {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to update category');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CategoryQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: CategoryQueryKeys.detail(categoryId),
      });
      queryClient.invalidateQueries({
        queryKey: AdminCategoriesQueryKeys.all,
      });
    },
  });
}
