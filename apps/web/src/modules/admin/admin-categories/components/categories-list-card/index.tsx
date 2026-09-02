'use client';

import { Skeleton } from '@repo/ui/components/skeleton';
import type { CategoryListItem } from '@/modules/common/queries/categories';
import { CategoryRow } from '../category-row';

type CategoriesListCardProps = {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  categories: ReadonlyArray<CategoryListItem>;
  selectedCategoryId: string | null;
  onSelect: (id: string) => void;
};

function ListSkeleton() {
  return (
    <div role="status" aria-label="Loading categories">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="border-rule grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b px-4 py-3 last:border-b-0"
        >
          <Skeleton className="size-10 rounded-md" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-stamp" />
        </div>
      ))}
    </div>
  );
}

export function CategoriesListCard({
  isLoading,
  hasError,
  errorMessage,
  categories,
  selectedCategoryId,
  onSelect,
}: CategoriesListCardProps) {
  return (
    <section
      aria-label="Categories"
      className="border-rule overflow-hidden rounded-md border bg-white"
    >
      <header className="border-rule bg-paper-2 border-b px-4 py-2.5">
        <span className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
          Category
        </span>
      </header>
      {isLoading ? (
        <ListSkeleton />
      ) : hasError ? (
        <div className="text-red px-4 py-12 text-center text-sm">
          {errorMessage}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-ink-3 px-4 py-12 text-center text-sm">
          No categories yet.
        </div>
      ) : (
        <div>
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              isSelected={selectedCategoryId === category.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}
