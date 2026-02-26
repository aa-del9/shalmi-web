'use client';

import { useQuery } from '@tanstack/react-query';
import { CategoryQueryKeys } from '@/modules/common/queries/categories';
import type { CategoryListItem } from '@/modules/common/queries/categories';

export function useCategoryQuery(categoryId: string | null) {
  return useQuery({
    queryKey: CategoryQueryKeys.detail(categoryId ?? ''),
    queryFn: async (): Promise<CategoryListItem> => {
      const res = await fetch(`/api/categories/${categoryId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to load category');
      }
      return data.data;
    },
    enabled: Boolean(categoryId),
  });
}
