'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BannerQueryKeys } from '../../constants/banner-query-keys';
import type { CreateBannerInput } from '../../schemas';

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
      if (!res.ok) {
        throw new Error(data?.error ?? 'Failed to create banner');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BannerQueryKeys.all });
      toast.success('Banner added. It appears in Available banners.');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong'
      );
    },
  });
}
