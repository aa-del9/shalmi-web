'use client';

import { useQuery } from '@tanstack/react-query';
import { getVendors } from '../../actions';
import { VendorQueryKeys } from '../vendor-query-keys';

type UseVendorsParams = {
  page?: number;
  limit?: number;
};

export function useVendorsQuery({
  page = 1,
  limit = 10,
}: UseVendorsParams = {}) {
  return useQuery({
    queryKey: VendorQueryKeys.list(page, limit),
    queryFn: () => getVendors({ page, limit }),
  });
}
