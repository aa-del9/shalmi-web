'use client';

import { ShoppingCart } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';

interface StickyBarProps {
  selectedCount: number;
  totalCents: number;
  onAddToCart: () => void;
}

/**
 * Pencil JNKsi — mobile sticky bottom CTA bar.
 *
 * Per gap-analysis Q34: mobile is intentionally minimal (no save-as-list,
 * no delivery pill). Disabled state mirrors the desktop primary CTA.
 */
export function StickyBar({
  selectedCount,
  totalCents,
  onAddToCart,
}: StickyBarProps) {
  const disabled = selectedCount <= 0;
  return (
    <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-rule bg-paper px-4 py-3 md:hidden">
      <div className="flex flex-col">
        <span className="font-sans text-[11px] text-ink-3">
          Total · {selectedCount} item{selectedCount === 1 ? '' : 's'}
        </span>
        <span className="font-mono text-[18px] font-extrabold text-ink">
          {formatRupeesFromCents(totalCents)}
        </span>
      </div>
      <button
        type="button"
        onClick={onAddToCart}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-2 rounded-md px-4 py-3 font-sans text-[14px] font-bold text-white transition-colors',
          disabled
            ? 'cursor-not-allowed bg-ink-4'
            : 'bg-green-700 hover:bg-green-700/90'
        )}
      >
        <ShoppingCart className="size-4" aria-hidden />
        Add to cart
      </button>
    </div>
  );
}
