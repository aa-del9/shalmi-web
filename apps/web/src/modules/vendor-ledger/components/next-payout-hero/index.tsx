'use client';

import { FileText } from 'lucide-react';
import { Skeleton } from '@repo/ui/components/skeleton';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import {
  daysUntilPayout,
  formatHeroDateLong,
  formatHeroDateShort,
} from '../../utils/cycle-format';
import type { PayoutBreakdown } from '../../hooks/use-payouts-breakdown-query';

interface NextPayoutHeroProps {
  breakdown: PayoutBreakdown | null | undefined;
  isLoading: boolean;
}

/**
 * Pencil `TUZmG` (desktop) / `TDgju` (mobile) — ink hero card.
 *
 * Two-column on desktop (left amount + descriptor, right countdown +
 * Download CTA), single-column on mobile.
 *
 * "Download statement" CTA is STUBBED per gap-analysis Q6 — rendered
 * visible but click is no-op.
 */
export function NextPayoutHero({ breakdown, isLoading }: NextPayoutHeroProps) {
  if (isLoading) {
    return (
      <section className="rounded-2xl bg-ink p-8 text-white md:p-10">
        <Skeleton className="h-4 w-48 bg-white/10" />
        <Skeleton className="mt-4 h-12 w-64 bg-white/10" />
      </section>
    );
  }

  if (!breakdown) {
    return (
      <section className="rounded-2xl bg-ink p-8 text-white md:p-10">
        <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-green-200">
          NEXT PAYOUT · TBD
        </p>
        <p className="mt-3 text-[40px] font-extrabold tracking-tight text-white md:text-[64px]">
          {formatRupeesFromCents(0)}
        </p>
        <p className="mt-2 text-[14px] text-white/70">
          Your first payout will appear here once orders clear the
          7-day return window.
        </p>
      </section>
    );
  }

  const days = daysUntilPayout(breakdown.weekEnd);
  const heroEyebrowLong = `NEXT PAYOUT · ${formatHeroDateLong(breakdown.weekEnd)}`;
  const heroEyebrowShort = `NEXT PAYOUT · ${formatHeroDateShort(breakdown.weekEnd)}`;

  return (
    <section className="overflow-hidden rounded-2xl bg-ink p-6 text-white md:p-10">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-10">
        <div className="min-w-0 flex-1">
          <p className="hidden font-mono text-[11px] font-bold tracking-[0.16em] text-green-200 md:block">
            {heroEyebrowLong}
          </p>
          <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-green-200 md:hidden">
            {heroEyebrowShort}
          </p>
          <p className="mt-3 font-mono text-[42px] font-extrabold leading-none tracking-tight text-white md:text-[64px]">
            {formatRupeesFromCents(breakdown.netAmountCents)}
          </p>
          <p className="mt-3 text-[14px] text-white/70">
            Net of {formatRupeesFromCents(breakdown.returnsAmountCents)}{' '}
            returns and{' '}
            {formatRupeesFromCents(breakdown.mnpReimbursementCents)} MNP
            delivery fees
          </p>
          <p className="mt-1 text-[12px] text-amber md:hidden">
            Pays in {days} {days === 1 ? 'day' : 'days'} ·{' '}
            {breakdown.completedOrdersCount} completed orders
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 md:w-[280px]">
          <div className="hidden rounded-xl border border-white/20 bg-white/[0.07] p-[18px] md:block">
            <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-white/70">
              PAYS IN
            </p>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-[48px] font-extrabold leading-none text-white">
                {days}
              </span>
              <span className="text-[16px] font-semibold text-white/70">
                {days === 1 ? 'day' : 'days'}
              </span>
            </p>
          </div>

          {/* TODO(post-v1): wire statement download (gap-analysis Q6 STUBBED). */}
          <button
            type="button"
            onClick={() => {
              /* no-op until backend ships */
            }}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-2 px-[18px] py-3.5 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
          >
            <FileText className="size-4" aria-hidden />
            Download statement
          </button>
        </div>
      </div>
    </section>
  );
}
