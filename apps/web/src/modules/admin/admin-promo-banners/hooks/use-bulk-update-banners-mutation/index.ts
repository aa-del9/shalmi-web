'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BannerQueryKeys } from '../../constants/banner-query-keys';
import type { BulkUpdateBannerPayload } from '../../types';

export function useBulkUpdateBannersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkUpdateBannerPayload[]) => {
      const res = await fetch('/api/admin/banners/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? 'Failed to update banners');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BannerQueryKeys.all });
      toast.success('Banner layout saved!');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong'
      );
    },
  });
}
