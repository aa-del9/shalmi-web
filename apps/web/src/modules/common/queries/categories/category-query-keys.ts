export const CategoryQueryKeys = {
  all: ['categories'] as const,
  detail: (id: string) => [...CategoryQueryKeys.all, 'detail', id] as const,
};
