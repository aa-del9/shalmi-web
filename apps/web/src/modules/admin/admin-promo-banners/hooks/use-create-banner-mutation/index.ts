'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BannerQueryKeys } from '../../constants/banner-query-keys';
import type { CreateBannerInput } from '../../schemas';
import type { Banner } from '../../types';

export function useCreateBannerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBannerInput) => {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to create banner');
      }
      return data.data as Banner;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BannerQueryKeys.all });
    },
  });
}
