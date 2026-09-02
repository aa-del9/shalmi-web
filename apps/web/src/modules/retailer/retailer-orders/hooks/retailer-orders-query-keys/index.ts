import type { RetailerOrdersSort } from '../../types';

export type RetailerOrdersListParams = {
  q: string;
  sort: RetailerOrdersSort;
};

export const RetailerOrdersQueryKeys = {
  all: ['retailer-orders'] as const,
  list: (params: RetailerOrdersListParams) =>
    ['retailer-orders', 'list', params] as const,
  detail: (id: string) => ['retailer-orders', 'detail', id] as const,
};
