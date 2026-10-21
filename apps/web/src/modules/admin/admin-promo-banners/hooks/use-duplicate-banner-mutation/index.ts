'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BannerQueryKeys } from '../../constants/banner-query-keys';
import type { Banner } from '../../types';

export function useDuplicateBannerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bannerId: string) => {
      const res = await fetch(`/api/admin/banners/${bannerId}/duplicate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to duplicate banner');
      }
      return data.data as Banner;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BannerQueryKeys.all });
    },
  });
}
