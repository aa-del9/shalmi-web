'use client';

import { CheckSquare } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

interface ItemsToolbarProps {
  itemCount: number;
  changesCount: number;
  allSelected: boolean;
  onToggleSelectAll: () => void;
}

/**
 * Pencil Ck8x8 (desktop) / Q4qL8 (mobile) — items toolbar above the list.
 *
 * Per gap-analysis Q9: "M quantity changes" segment hides when count = 0.
 * Per Q10: select-all toggles all (skipping out-of-stock); button copy
 * flips Select all → Deselect all.
 */
export function ItemsToolbar({
  itemCount,
  changesCount,
  allSelected,
  onToggleSelectAll,
}: ItemsToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <span className="font-sans text-[16px] font-bold text-ink md:text-[18px]">
          {itemCount} item{itemCount === 1 ? '' : 's'}
        </span>
        {changesCount > 0 ? (
          <span className="font-sans text-[12px] text-ink-3 md:text-[13px]">
            · {changesCount} quantity change{changesCount === 1 ? '' : 's'}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onToggleSelectAll}
        className={cn(
          'inline-flex items-center gap-1.5 font-sans text-[12px] font-semibold text-ink transition-colors hover:bg-paper-2 md:rounded-md md:border-[1.5px] md:border-rule-2 md:px-3 md:py-1.5 md:text-[13px]'
        )}
      >
        <CheckSquare className="size-3.5" aria-hidden />
        {allSelected ? 'Deselect all' : 'Select all'}
      </button>
    </div>
  );
}
