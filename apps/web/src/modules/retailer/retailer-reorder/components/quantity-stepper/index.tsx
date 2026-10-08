'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

interface QuantityStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
  /** Mobile rows use a 32h stepper; desktop uses 36h. */
  size?: 'sm' | 'md';
}

/**
 * Pencil Bslux / IOoR7 — three-cell minus/value/plus stepper inside a
 * 1.5px rule-2 outline.
 */
export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  disabled = false,
  size = 'md',
}: QuantityStepperProps) {
  const cellHeight = size === 'sm' ? 'h-8' : 'h-9';
  const buttonSize = size === 'sm' ? 'w-8' : 'w-9';
  const valueSize = size === 'sm' ? 'w-10 text-[14px]' : 'w-12 text-[14px]';

  return (
    <div
      className={cn(
        'inline-flex items-stretch overflow-hidden rounded-md border-[1.5px] border-rule-2 bg-white',
        cellHeight,
        disabled && 'opacity-50'
      )}
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled}
        aria-label="Decrease quantity"
        className={cn(
          'flex items-center justify-center text-ink transition-colors hover:bg-paper-2 disabled:cursor-not-allowed',
          buttonSize
        )}
      >
        <Minus className="size-3.5" aria-hidden />
      </button>
      <span
        className={cn(
          'flex items-center justify-center font-mono font-bold text-ink',
          valueSize
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled}
        aria-label="Increase quantity"
        className={cn(
          'flex items-center justify-center text-ink transition-colors hover:bg-paper-2 disabled:cursor-not-allowed',
          buttonSize
        )}
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
