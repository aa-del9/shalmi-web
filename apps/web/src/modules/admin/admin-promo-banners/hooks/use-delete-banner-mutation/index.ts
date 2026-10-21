'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BannerQueryKeys } from '../../constants/banner-query-keys';

export function useDeleteBannerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bannerId: string) => {
      const res = await fetch(`/api/admin/banners/${bannerId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to delete banner');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BannerQueryKeys.all });
    },
  });
}
