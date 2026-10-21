'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VendorQueryKeys } from '../vendor-query-keys';

type BulkPayload = {
  vendorIds: ReadonlyArray<string>;
  isActive: boolean;
};

/**
 * Q16 binding answer — bulk activate/deactivate via fan-out PATCH calls.
 * Backend has no dedicated bulk endpoint; client fans out per id and
 * waits for all to settle.
 */
export function useBulkUpdateVendorsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ vendorIds, isActive }: BulkPayload) => {
      const results = await Promise.allSettled(
        vendorIds.map(async (id) => {
          const res = await fetch(`/api/admin/vendors/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data?.error ?? `Failed for vendor ${id}`);
          }
          return id;
        })
      );
      const failed = results
        .map((r, idx) => (r.status === 'rejected' ? vendorIds[idx] : null))
        .filter((id): id is string => id !== null);
      if (failed.length > 0) {
        throw new Error(`${failed.length} vendor update(s) failed`);
      }
      return vendorIds.length;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: VendorQueryKeys.all });
    },
  });
}
