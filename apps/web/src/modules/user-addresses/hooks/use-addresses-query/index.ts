'use client';

import { useQuery } from '@tanstack/react-query';
import { AddressQueryKeys } from '../address-query-keys';
import type { Address } from '../../types';

export function useAddressesQuery() {
  return useQuery({
    queryKey: AddressQueryKeys.all,
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
