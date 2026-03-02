export const RetailerOrdersQueryKeys = {
  all: ['retailer-orders'] as const,
  detail: (id: string) => ['retailer-orders', id] as const,
};
