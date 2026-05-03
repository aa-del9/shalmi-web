'use client';

import { cn } from '@repo/ui/lib/utils';
import {
  DELIVERY_TIERS,
  resolveDeliveryTier,
} from '@/modules/cart/utils/delivery-tiers';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';

interface WeightGaugeProps {
  weightGrams: number;
}

/**
 * Pencil B2ysb (desktop) / n76qv (mobile) — cart weight gauge.
 *
 * Per gap-analysis Q6 / Q8: 4 tier cells, mobile drops the Rs. labels.
 * Shared between `/cart` and the reorder screen.
 */
export function WeightGauge({ weightGrams }: WeightGaugeProps) {
  const currentTier = resolveDeliveryTier(weightGrams);
  const kg = weightGrams / 1000;
  const kgDisplay =
    kg < 100 ? kg.toFixed(1).replace(/\.0$/, '') : Math.round(kg);

  // Bar fill: scale weight against the top of tier3 (50kg) so the bar has
  // visible movement; tier4 sits at full.
  const maxBar = 50_000;
  const fillPct = Math.min(100, Math.round((weightGrams / maxBar) * 100));

  return (
    <div className="rounded-md border border-rule bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
            Cart weight
          </p>
          <p className="mt-1 font-sans text-[12px] text-ink-3">
            Tier {DELIVERY_TIERS.findIndex((t) => t.id === currentTier.id) + 1}{' '}
            · {currentTier.label} ·{' '}
            {formatRupeesFromCents(currentTier.feeCents)} delivery
          </p>
        </div>
        <p className="flex items-baseline gap-1">
          <span className="font-mono text-[28px] font-bold leading-none text-ink md:text-[32px]">
            {kgDisplay}
          </span>
          <span className="font-sans text-[13px] font-medium text-ink-3">
            kg
          </span>
        </p>
      </div>
      <div className="mt-3 h-[18px] overflow-hidden rounded-sm bg-paper-2 md:h-[22px]">
        <div
          className="h-full rounded-sm bg-ink transition-[width] duration-200"
          style={{ width: `${fillPct}%` }}
          aria-hidden
        />
      </div>
      {/* Desktop legend with Rs. labels */}
      <div className="mt-3 hidden grid-cols-4 divide-x divide-rule md:grid">
        {DELIVERY_TIERS.map((tier) => {
          const active = tier.id === currentTier.id;
          return (
            <div
              key={tier.id}
              className={cn(
                'px-3 py-1 text-center',
                active ? 'text-ink' : 'text-ink-3'
              )}
            >
              <p
                className={cn(
                  'font-mono text-[10px] uppercase tracking-[0.08em]',
                  active ? 'font-bold' : 'font-medium'
                )}
              >
                {tier.label}
              </p>
              <p className="font-mono text-[11px] text-ink-3">
                {formatRupeesFromCents(tier.feeCents)}
              </p>
            </div>
          );
        })}
      </div>
      {/* Mobile legend without Rs. labels */}
      <div className="mt-3 grid grid-cols-4 divide-x divide-rule md:hidden">
        {DELIVERY_TIERS.map((tier) => {
          const active = tier.id === currentTier.id;
          return (
            <div
              key={tier.id}
              className={cn(
                'px-2 py-1 text-center font-mono text-[9px] uppercase tracking-[0.08em]',
                active ? 'font-bold text-ink' : 'text-ink-3'
              )}
            >
              {tier.compactLabel}
            </div>
          );
        })}
      </div>
    </div>
  );
}
