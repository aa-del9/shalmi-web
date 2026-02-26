'use client';

import { useQuery } from '@tanstack/react-query';
import { BannerQueryKeys } from '../../constants/banner-query-keys';
import type { Banner } from '../../types';

export function useBannersQuery() {
  return useQuery({
    queryKey: BannerQueryKeys.all,
    queryFn: async () => {
      const res = await fetch('/api/admin/banners');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? 'Failed to load banners');
      }
      return data as { success: true; data: Banner[] };
    },
  });
}
