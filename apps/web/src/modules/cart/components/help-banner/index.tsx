'use client';

import { Info } from 'lucide-react';
import {
  resolveDeliveryTier,
  findNextTier,
} from '@/modules/cart/utils/delivery-tiers';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';

interface HelpBannerProps {
  weightGrams: number;
  /** Mobile uses a shorter copy variant (Q7). */
  compact?: boolean;
}

/**
 * Pencil tX5NA (desktop) / g8hyrx (mobile) — amber help banner.
 *
 * Per gap-analysis Q7: hides at the top tier; otherwise composes the
 * delta + savings copy. Shared by `/cart` and reorder.
 */
export function HelpBanner({ weightGrams, compact = false }: HelpBannerProps) {
  const current = resolveDeliveryTier(weightGrams);
  const next = findNextTier(current);
  if (!next) return null;
  const remainingGrams = Math.max(0, next.minWeightGrams - weightGrams);
  if (remainingGrams <= 0) return null;
  const remainingKg = (remainingGrams / 1000).toFixed(1).replace(/\.0$/, '');
  const savings = current.feeCents - next.feeCents;

  const copy = compact
    ? `Add ${remainingKg} kg more — save ${formatRupeesFromCents(savings)} on delivery.`
    : `Add ${remainingKg} kg more to cross into the ${next.label} tier — save ${formatRupeesFromCents(savings)} on delivery.`;

  return (
    <div className="flex items-center gap-2 rounded-md border border-amber bg-amber-bg px-3 py-2 text-amber">
      <Info className="size-4 shrink-0" aria-hidden />
      <p className="font-sans text-[12px] font-semibold leading-tight md:text-[13px]">
        {copy}
      </p>
    </div>
  );
}
