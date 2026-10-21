'use client';

import { PencilIcon } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { Stamp } from '@repo/ui/components/stamp';
import type { CategoryListItem } from '@/modules/common/queries/categories';
import { CategoryIconSwatch } from '../category-icon-swatch';

type CategoryRowProps = {
  category: CategoryListItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

// Q3 binding: full-row click opens panel; pencil icon also opens (visual
// affordance only, identical handler). Q11/Q8/Q17 deferred — products,
// vendors, sort and bulk-select cells are not rendered.
export function CategoryRow({
  category,
  isSelected,
  onSelect,
}: CategoryRowProps) {
  const handleSelect = () => onSelect(category.id);

  return (
    <button
      type="button"
      onClick={handleSelect}
      aria-pressed={isSelected}
      className={cn(
        'border-rule grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0',
        'hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
        isSelected ? 'bg-paper-2' : 'bg-white'
      )}
    >
      <CategoryIconSwatch
        iconKey={category.iconKey}
        fallbackLetter={category.name}
      />
      <div className="min-w-0">
        <p className="text-ink truncate text-sm font-bold">{category.name}</p>
        <p className="text-ink-3 truncate font-mono text-[11px]">
          {category.slug}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Stamp variant={category.isActive ? 'success' : 'critical'}>
          {category.isActive ? 'Active' : 'Inactive'}
        </Stamp>
        <span
          aria-hidden
          className="text-ink-3 hover:text-ink hidden size-8 items-center justify-center sm:flex"
        >
          <PencilIcon className="size-4" />
        </span>
      </div>
    </button>
  );
}
