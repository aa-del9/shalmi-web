import { cn } from '@repo/ui/lib/utils';
import { TagIcon } from 'lucide-react';
import { resolveCategoryIcon } from '../../constants/category-icons';

type Size = 'sm' | 'md' | 'lg';

type CategoryIconSwatchProps = {
  iconKey: string | null;
  /** First letter of category name when iconKey is unset. */
  fallbackLetter?: string;
  size?: Size;
  className?: string;
};

const SIZE_TO_CLASS: Record<Size, { box: string; icon: string }> = {
  sm: { box: 'size-8', icon: 'size-4' },
  md: { box: 'size-10', icon: 'size-5' },
  lg: { box: 'size-14', icon: 'size-7' },
};

/**
 * 40×40 (md) green-bg pill rendering a Lucide glyph in green-700.
 * Pencil row list draws an amber tint when "needs review" — that
 * predicate is DEFERRED per gap-analysis Q16, so this component
 * supports only the green/standard tint until the rich model lands.
 */
export function CategoryIconSwatch({
  iconKey,
  fallbackLetter,
  size = 'md',
  className,
}: CategoryIconSwatchProps) {
  const Icon = resolveCategoryIcon(iconKey) ?? TagIcon;
  const { box, icon } = SIZE_TO_CLASS[size];

  return (
    <span
      aria-hidden
      className={cn(
        'bg-green-bg flex shrink-0 items-center justify-center rounded-md',
        box,
        className
      )}
    >
      {iconKey ? (
        <Icon className={cn(icon, 'text-green-700')} />
      ) : fallbackLetter ? (
        <span className="text-green-700 font-semibold uppercase">
          {fallbackLetter.charAt(0)}
        </span>
      ) : (
        <Icon className={cn(icon, 'text-green-700')} />
      )}
    </span>
  );
}
