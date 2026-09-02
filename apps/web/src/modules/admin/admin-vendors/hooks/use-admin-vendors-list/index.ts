'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
  VendorListItem,
  VendorListMeta,
} from '@/modules/admin/admin-vendors/types';
import { VendorQueryKeys } from '../vendor-query-keys';

export type AdminVendorsStatusFilter = 'all' | 'active' | 'inactive';
export type AdminVendorsSortKey = 'createdAt' | 'shopName';
export type AdminVendorsSortDir = 'asc' | 'desc';

export type AdminVendorsListParams = {
  page: number;
  limit: number;
  q: string;
  status: AdminVendorsStatusFilter;
  hub: string;
  sort: AdminVendorsSortKey;
  dir: AdminVendorsSortDir;
};

type AdminVendorsResponse = {
  success: true;
  data: VendorListItem[];
  meta: VendorListMeta;
};

function buildSearchParams(params: AdminVendorsListParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('limit', String(params.limit));
  if (params.q.length > 0) search.set('q', params.q);
  if (params.status !== 'all') search.set('status', params.status);
  if (params.hub.length > 0) search.set('hub', params.hub);
  search.set('sort', params.sort);
  search.set('dir', params.dir);
  return search.toString();
}

export function useAdminVendorsList(params: AdminVendorsListParams) {
  return useQuery({
    queryKey: [...VendorQueryKeys.all, 'list', params] as const,
    queryFn: async (): Promise<AdminVendorsResponse> => {
      const res = await fetch(`/api/admin/vendors?${buildSearchParams(params)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to load vendors');
      }
      return data as AdminVendorsResponse;
    },
    placeholderData: keepPreviousData,
  });
}
