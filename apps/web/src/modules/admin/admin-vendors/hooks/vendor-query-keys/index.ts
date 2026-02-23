export const VendorQueryKeys = {
  all: ['vendors'] as const,
  list: (page: number, limit: number) =>
    [...VendorQueryKeys.all, page, limit] as const,
};
