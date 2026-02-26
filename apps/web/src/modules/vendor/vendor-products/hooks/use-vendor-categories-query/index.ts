'use client';

import { CategoryQueryKeys } from '@/modules/common/queries/categories';
import { useQuery } from '@tanstack/react-query';

export type VendorCategoryOption = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
};

export function useVendorCategoriesQuery() {
  return useQuery({
    queryKey: CategoryQueryKeys.all,
    queryFn: async () => {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? 'Failed to load categories');
      }
      return (data.data ?? []) as VendorCategoryOption[];
    },
  });
}
