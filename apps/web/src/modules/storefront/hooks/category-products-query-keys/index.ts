export const CategoryProductsQueryKeys = {
  all: ['category-products'] as const,
  list: (categoryId: string) =>
    [...CategoryProductsQueryKeys.all, categoryId] as const,
};
