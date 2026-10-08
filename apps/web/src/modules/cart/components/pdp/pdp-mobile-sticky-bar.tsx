'use client';

import { Button } from '@repo/ui/components/button';
import { QuantitySelector } from '../quantity-selector';

interface PdpMobileStickyBarProps {
  quantity: number;
  min?: number;
  max?: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  disabled?: boolean;
  ctaLabel: string;
}

export function PdpMobileStickyBar({
  quantity,
  min = 1,
  max,
  onQuantityChange,
  onAddToCart,
  disabled = false,
  ctaLabel,
}: PdpMobileStickyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-paper px-4 py-3 md:hidden">
      <div className="flex items-center gap-3">
        <QuantitySelector
          quantity={quantity}
          min={min}
          max={max}
          onChange={onQuantityChange}
          size="md"
        />
        <Button
          type="button"
          className="h-11 flex-1"
          onClick={onAddToCart}
          disabled={disabled}
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
