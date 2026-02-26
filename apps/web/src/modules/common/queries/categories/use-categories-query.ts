'use client';

import { useQuery } from '@tanstack/react-query';
import { CategoryQueryKeys } from './category-query-keys';
import type { CategoryListItem } from './types';

export function useCategoriesQuery() {
  return useQuery({
    queryKey: CategoryQueryKeys.all,
    queryFn: async () => {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? 'Failed to load categories');
      }
      return data as { success: true; data: CategoryListItem[] };
    },
  });
}
