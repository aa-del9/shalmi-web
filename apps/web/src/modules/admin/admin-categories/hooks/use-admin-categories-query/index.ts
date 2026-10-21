'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { CategoryListItem } from '@/modules/common/queries/categories';
import type { PaginationMeta } from '@/modules/core/server-actions';

export type AdminCategoriesStatusFilter = 'all' | 'active' | 'inactive';
export type AdminCategoriesSortKey = 'name' | 'createdAt' | 'updatedAt';
export type AdminCategoriesSortDir = 'asc' | 'desc';

export type AdminCategoriesQueryParams = {
  page: number;
  limit: number;
  q: string;
  status: AdminCategoriesStatusFilter;
  sort: AdminCategoriesSortKey;
  dir: AdminCategoriesSortDir;
};

type AdminCategoriesResponse = {
  success: true;
  data: CategoryListItem[];
  meta: PaginationMeta;
};

export const AdminCategoriesQueryKeys = {
  all: ['admin-categories'] as const,
  list: (params: AdminCategoriesQueryParams) =>
    [...AdminCategoriesQueryKeys.all, 'list', params] as const,
};

function buildSearchParams(params: AdminCategoriesQueryParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('limit', String(params.limit));
  if (params.q.length > 0) search.set('q', params.q);
  if (params.status !== 'all') search.set('status', params.status);
  search.set('sort', params.sort);
  search.set('dir', params.dir);
  return search.toString();
}

export function useAdminCategoriesQuery(params: AdminCategoriesQueryParams) {
  return useQuery({
    queryKey: AdminCategoriesQueryKeys.list(params),
    queryFn: async (): Promise<AdminCategoriesResponse> => {
      const res = await fetch(
        `/api/admin/categories?${buildSearchParams(params)}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to load categories');
      }
      return data as AdminCategoriesResponse;
    },
    placeholderData: keepPreviousData,
  });
}
