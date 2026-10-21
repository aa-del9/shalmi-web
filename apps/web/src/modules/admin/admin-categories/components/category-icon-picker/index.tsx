'use client';

import { cn } from '@repo/ui/lib/utils';
import { CATEGORY_ICON_SET } from '../../constants/category-icons';
import { CategoryIconSwatch } from '../category-icon-swatch';

type CategoryIconPickerProps = {
  value: string | null;
  onChange: (next: string | null) => void;
  disabled?: boolean;
};

export function CategoryIconPicker({
  value,
  onChange,
  disabled = false,
}: CategoryIconPickerProps) {
  const selectedLabel =
    CATEGORY_ICON_SET.find((entry) => entry.key === value)?.label ?? null;

  return (
    <div className="bg-paper-2 border-rule-2 rounded-md border p-4">
      <div className="flex items-center gap-3">
        <CategoryIconSwatch iconKey={value} size="lg" />
        <div className="min-w-0">
          <p className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
            Category icon
          </p>
          <p className="text-ink-2 truncate text-sm font-semibold">
            {value ? `${value} (Lucide)` : 'No icon selected'}
          </p>
          <p className="text-ink-3 truncate text-xs">
            {selectedLabel
              ? `Suggested for: ${selectedLabel}`
              : 'Tap to choose a different icon'}
          </p>
        </div>
      </div>
      <div
        className="mt-3 grid grid-cols-7 gap-1.5 sm:grid-cols-9"
        role="radiogroup"
        aria-label="Category icon"
      >
        {CATEGORY_ICON_SET.map(({ key, label, Icon }) => {
          const isSelected = value === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${label} (${key})`}
              disabled={disabled}
              onClick={() => onChange(isSelected ? null : key)}
              className={cn(
                'flex aspect-square items-center justify-center rounded-md border transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isSelected
                  ? 'border-ink bg-white shadow-[inset_0_0_0_1px_var(--ink)]'
                  : 'border-rule-2 bg-white hover:border-ink'
              )}
            >
              <Icon
                className={cn(
                  'size-4',
                  isSelected ? 'text-ink' : 'text-ink-2'
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
