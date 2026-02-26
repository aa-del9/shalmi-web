'use client';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@repo/ui/components/hover-card';
import type { CategoryListItem } from '@/modules/common/queries/categories';
import { useProductCategoriesCell } from './use-product-categories-cell';

type ProductCategoriesCellProps = {
  categoryIds: string[];
  categories: CategoryListItem[];
};

export function ProductCategoriesCell({
  categoryIds,
  categories,
}: ProductCategoriesCellProps) {
  const { names, label, hasCategories } = useProductCategoriesCell({
    categoryIds,
    categories,
  });

  if (!hasCategories) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground cursor-pointer text-left text-sm underline decoration-dotted underline-offset-2 transition-colors"
        >
          {label}
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="w-56">
        <div className="space-y-1">
          <p className="text-muted-foreground text-label-md font-bold">
            Categories
          </p>
          <ul className="text-sm">
            {names.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
