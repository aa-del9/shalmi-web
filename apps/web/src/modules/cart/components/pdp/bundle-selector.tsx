'use client';

import { cn } from '@repo/ui/lib/utils';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import type { PackTier } from '../../types';

interface BundleSelectorProps {
  tiers: PackTier[];
  selectedPackQty: number;
  onSelect: (packQty: number) => void;
}

const BADGE_COPY: Record<NonNullable<PackTier['badge']>, string> = {
  save: 'SAVE',
  best: 'BEST',
};

function perUnit(tier: PackTier): string {
  const perUnitCents = Math.round(tier.pricePerPackCents / Math.max(1, tier.packQty));
  return `${formatRupeesFromCents(perUnitCents)}/unit`;
}

export function BundleSelector({
  tiers,
  selectedPackQty,
  onSelect,
}: BundleSelectorProps) {
  if (tiers.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink-3">
        CHOOSE BUNDLE SIZE
      </h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiers.map((tier) => {
          const isSelected = tier.packQty === selectedPackQty;
          return (
            <button
              key={tier.packQty}
              type="button"
              onClick={() => onSelect(tier.packQty)}
              className={cn(
                'relative flex flex-col items-start gap-1 rounded-md border-[1.5px] p-3 text-left transition-colors',
                isSelected
                  ? 'border-ink bg-ink text-white'
                  : 'border-rule-2 bg-white text-ink hover:border-ink'
              )}
              aria-pressed={isSelected}
            >
              {tier.badge ? (
                <span
                  className={cn(
                    'absolute -top-2 right-2 rounded-xs px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.12em]',
                    'bg-green-2 text-white'
                  )}
                >
                  {BADGE_COPY[tier.badge]}
                </span>
              ) : null}
              <span className="font-mono text-[22px] font-extrabold leading-none">
                {tier.packQty}
              </span>
              <span
                className={cn(
                  'text-xs',
                  isSelected ? 'text-white/80' : 'text-ink-3'
                )}
              >
                pack
              </span>
              <span
                className={cn(
                  'mt-1 font-mono text-[13px] font-bold',
                  isSelected ? 'text-white' : 'text-ink'
                )}
              >
                {formatRupeesFromCents(tier.pricePerPackCents)}
              </span>
              <span
                className={cn(
                  'font-mono text-[10px] tracking-wide',
                  isSelected ? 'text-white/70' : 'text-ink-3'
                )}
              >
                {perUnit(tier)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
