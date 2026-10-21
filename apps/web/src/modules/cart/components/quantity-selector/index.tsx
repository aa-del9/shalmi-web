'use client';

import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

interface QuantitySelectorProps {
  quantity: number;
  min?: number;
  max?: number;
  onChange: (quantity: number) => void;
  /** "lg" = PDP / 44h. Default ("md") = 36h cart row variant. */
  size?: 'md' | 'lg' | 'sm';
  className?: string;
}

function clamp(value: number, lo: number, hi?: number): number {
  const clamped = Math.max(lo, value);
  return hi !== undefined ? Math.min(hi, clamped) : clamped;
}

const SIZE_STYLES: Record<
  NonNullable<QuantitySelectorProps['size']>,
  { frame: string; cell: string; icon: string }
> = {
  sm: { frame: 'h-7 w-[88px]', cell: 'w-8 text-xs', icon: 'size-3' },
  md: { frame: 'h-9 w-[112px]', cell: 'w-10 text-sm', icon: 'size-3.5' },
  lg: { frame: 'h-11 w-[136px]', cell: 'w-12 text-base', icon: 'size-4' },
};

/**
 * Pencil cart-line + PDP qty stepper (single segmented control,
 * radius 6, 1.5px rule-2 stroke). Per buyer-cart Q5 the central cell
 * stays editable.
 */
export function QuantitySelector({
  quantity,
  min = 1,
  max,
  onChange,
  size = 'md',
  className,
}: QuantitySelectorProps) {
  const [draft, setDraft] = useState(String(quantity));
  const styles = SIZE_STYLES[size];

  useEffect(() => {
    setDraft(String(quantity));
  }, [quantity]);

  function commitValue(raw: string) {
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) {
      setDraft(String(quantity));
      return;
    }
    const valid = clamp(parsed, min, max);
    setDraft(String(valid));
    onChange(valid);
  }

  function handleButtonChange(next: number) {
    const valid = clamp(next, min, max);
    setDraft(String(valid));
    onChange(valid);
  }

  return (
    <div
      className={cn(
        'inline-flex items-stretch overflow-hidden rounded-sm border-[1.5px] border-rule-2 bg-white text-ink',
        styles.frame,
        className
      )}
    >
      <button
        type="button"
        className="flex flex-1 items-center justify-center text-ink-3 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => handleButtonChange(quantity - 1)}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
      >
        <Minus className={styles.icon} aria-hidden />
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
        onBlur={(e) => commitValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commitValue(draft);
        }}
        className={cn(
          'border-x-[1.5px] border-rule-2 bg-white text-center font-mono font-bold tabular-nums text-ink focus:outline-none focus:ring-0',
          styles.cell
        )}
        aria-label="Quantity"
      />
      <button
        type="button"
        className="flex flex-1 items-center justify-center text-ink-3 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => handleButtonChange(quantity + 1)}
        disabled={max !== undefined && quantity >= max}
        aria-label="Increase quantity"
      >
        <Plus className={styles.icon} aria-hidden />
      </button>
    </div>
  );
}
