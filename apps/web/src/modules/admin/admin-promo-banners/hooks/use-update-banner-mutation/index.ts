'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BannerQueryKeys } from '../../constants/banner-query-keys';
import type { UpdateBannerInput } from '../../schemas';
import type { Banner } from '../../types';

export function useUpdateBannerMutation(bannerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateBannerInput) => {
      const res = await fetch(`/api/admin/banners/${bannerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to update banner');
      }
      return data.data as Banner;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BannerQueryKeys.all });
    },
  });
}
