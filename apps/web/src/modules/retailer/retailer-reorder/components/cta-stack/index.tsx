'use client';

import { ShoppingCart, Truck } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

interface CtaStackProps {
  selectedCount: number;
  onAddToCart: () => void;
  /** City pulled from the buyer's default address; null hides the pill. */
  deliveryCity: string | null;
}

/**
 * Pencil right-column CTA stack (desktop only).
 *
 * Per gap-analysis Q31: button copy "Add 1 item to cart" / "Add N items
 * to cart"; disabled with copy "Select items" when N=0. Per Q32 the
 * "Save as new list" CTA is DEFERRED — hidden. Per Q33 the delivery pill
 * shows ETA copy + city; "same MNP partner" claim is hidden.
 */
export function CtaStack({
  selectedCount,
  onAddToCart,
  deliveryCity,
}: CtaStackProps) {
  const disabled = selectedCount <= 0;
  const buttonCopy = disabled
    ? 'Select items'
    : `Add ${selectedCount} item${selectedCount === 1 ? '' : 's'} to cart`;

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onAddToCart}
        disabled={disabled}
        className={cn(
          'flex h-12 w-full items-center justify-center gap-2 rounded-md font-sans text-[16px] font-bold text-white transition-colors',
          disabled
            ? 'cursor-not-allowed bg-ink-4'
            : 'bg-green-700 hover:bg-green-700/90'
        )}
      >
        <ShoppingCart className="size-4" aria-hidden />
        {buttonCopy}
      </button>
      {deliveryCity ? (
        <div className="flex items-start gap-2 rounded-md bg-paper-2 px-3 py-2.5">
          <Truck className="mt-0.5 size-4 shrink-0 text-ink-2" aria-hidden />
          <div className="min-w-0">
            <p className="font-sans text-[12px] font-bold text-ink">
              MNP delivery to {deliveryCity}
            </p>
            <p className="font-sans text-[11px] text-ink-3">
              Estimated 2–3 days
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
