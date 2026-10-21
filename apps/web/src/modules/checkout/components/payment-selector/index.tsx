'use client';

import { Banknote, CreditCard, Smartphone } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { Stamp } from '@repo/ui/components/stamp';

/**
 * Payment selector — per buyer-checkout gap-analysis Q4 (DEFERRED): only
 * COD is enabled; the other two cards render disabled "Coming soon" per
 * Pencil. Q16: aria-disabled + non-interactive.
 */
type PaymentMethod = 'cod' | 'mobile_wallet' | 'card_or_bank';

interface PaymentSelectorProps {
  value: PaymentMethod;
  onChange: (next: PaymentMethod) => void;
}

const METHODS: {
  id: PaymentMethod;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  disabled: boolean;
  recommended?: boolean;
}[] = [
  {
    id: 'cod',
    title: 'Cash on Delivery (COD)',
    description: 'Pay the rider in cash on delivery. No advance payment required.',
    icon: Banknote,
    disabled: false,
    recommended: true,
  },
  {
    id: 'mobile_wallet',
    title: 'JazzCash / EasyPaisa',
    description: 'Mobile wallet payment. Coming soon.',
    icon: Smartphone,
    disabled: true,
  },
  {
    id: 'card_or_bank',
    title: 'Bank transfer / Card',
    description: 'Card payment or bank transfer. Coming soon.',
    icon: CreditCard,
    disabled: true,
  },
];

export function PaymentSelector({ value, onChange }: PaymentSelectorProps) {
  return (
    <section className="space-y-4">
      <h2 className="font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-ink">
        <span className="text-ink-3">03</span>{' '}
        <span className="ml-2">PAYMENT</span>
      </h2>
      <div className="space-y-3">
        {METHODS.map((m) => {
          const isSelected = value === m.id && !m.disabled;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => !m.disabled && onChange(m.id)}
              disabled={m.disabled}
              aria-pressed={isSelected}
              aria-disabled={m.disabled || undefined}
              className={cn(
                'flex w-full items-start gap-3 rounded-md border-[1.5px] p-4 text-left transition-colors',
                m.disabled
                  ? 'cursor-not-allowed border-rule-2 bg-white opacity-55'
                  : isSelected
                    ? 'border-green-700 bg-green-bg'
                    : 'border-rule-2 bg-white hover:border-ink-3'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px]',
                  isSelected
                    ? 'border-green-700'
                    : m.disabled
                      ? 'border-rule-2'
                      : 'border-rule-2'
                )}
                aria-hidden
              >
                {isSelected ? (
                  <span className="block size-2 rounded-full bg-green-700" />
                ) : null}
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Icon className="size-4 text-ink-2" aria-hidden />
                  <span className="text-sm font-extrabold text-ink">
                    {m.title}
                  </span>
                  {m.recommended ? (
                    <Stamp variant="success">RECOMMENDED</Stamp>
                  ) : null}
                </div>
                <p className="text-xs text-ink-2">{m.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export type { PaymentMethod };
