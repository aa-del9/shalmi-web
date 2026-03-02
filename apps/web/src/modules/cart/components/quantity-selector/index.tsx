'use client';

import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';

interface QuantitySelectorProps {
  quantity: number;
  min?: number;
  max?: number;
  onChange: (quantity: number) => void;
}

function clamp(value: number, lo: number, hi?: number): number {
  const clamped = Math.max(lo, value);
  return hi !== undefined ? Math.min(hi, clamped) : clamped;
}

export function QuantitySelector({
  quantity,
  min = 1,
  max,
  onChange,
}: QuantitySelectorProps) {
  const [draft, setDraft] = useState(String(quantity));

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
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => handleButtonChange(quantity - 1)}
        disabled={quantity <= min}
      >
        <Minus className="size-3.5" />
      </Button>
      <Input
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
        onBlur={(e) => commitValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commitValue(draft);
        }}
        className="h-8 w-14 [appearance:textfield] text-center text-sm font-medium tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => handleButtonChange(quantity + 1)}
        disabled={max !== undefined && quantity >= max}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
