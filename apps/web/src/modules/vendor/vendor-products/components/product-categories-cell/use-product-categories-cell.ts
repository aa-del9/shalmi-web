'use client';

import type { CategoryListItem } from '@/modules/common/queries/categories';

type UseProductCategoriesCellParams = {
  categoryIds: string[];
  categories: CategoryListItem[];
};

export function useProductCategoriesCell({
  categoryIds,
  categories,
}: UseProductCategoriesCellParams) {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const names = categoryIds
    .map((id) => categoryMap.get(id))
    .filter(Boolean) as string[];
  const hasCategories = names.length > 0;
  const label = hasCategories
    ? names.length === 1
      ? names[0]
      : `${names.length} categories`
    : null;

  return { names, label, hasCategories };
}
