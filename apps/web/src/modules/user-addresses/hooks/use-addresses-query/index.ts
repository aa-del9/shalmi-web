'use client';

import { useQuery } from '@tanstack/react-query';
import { AddressQueryKeys } from '../address-query-keys';
import type { Address } from '../../types';

interface UseAddressesQueryOptions {
  /** Skip the request when false (e.g., guest checkout per OQ-G(b)). */
  enabled?: boolean;
}

export function useAddressesQuery(options: UseAddressesQueryOptions = {}) {
  const enabled = options.enabled ?? true;
  return useQuery({
    queryKey: AddressQueryKeys.all,
    enabled,
    queryFn: async (): Promise<Address[]> => {
      const res = await fetch('/api/user/addresses');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? 'Failed to load addresses');
      }
      if (!data.success || data.data === undefined) {
        throw new Error('Invalid response');
      }
      return data.data as Address[];
    },
  });
}
