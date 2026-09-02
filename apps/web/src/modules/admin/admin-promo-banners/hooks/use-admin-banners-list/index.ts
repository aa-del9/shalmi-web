'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { BannerQueryKeys } from '../../constants/banner-query-keys';
import type { Banner, BannerListMeta } from '../../types';

type AdminBannersResponse = {
  success: true;
  data: Banner[];
  meta: BannerListMeta;
};

export function useAdminBannersList() {
  return useQuery({
    queryKey: BannerQueryKeys.list(),
    queryFn: async (): Promise<AdminBannersResponse> => {
      const res = await fetch('/api/admin/banners');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to load banners');
      }
      return data as AdminBannersResponse;
    },
    placeholderData: keepPreviousData,
  });
}
