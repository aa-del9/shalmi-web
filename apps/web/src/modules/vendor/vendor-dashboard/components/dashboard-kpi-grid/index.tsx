'use client';

import { HourglassIcon, TrendingUpIcon } from 'lucide-react';
import { Skeleton } from '@repo/ui/components/skeleton';
import { cn } from '@repo/ui/lib/utils';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import type { VendorKpis } from '../../hooks/use-vendor-kpis-query';
import type { VendorNextPayout } from '../../hooks/use-vendor-next-payout-query';

const NUMBER_FMT = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

const PAYOUT_RELEASE_FMT = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

type DashboardKpiGridProps = {
  kpis: VendorKpis | undefined;
  isLoading: boolean;
  nextPayout: VendorNextPayout;
  isPayoutLoading: boolean;
};

export function DashboardKpiGrid({
  kpis,
  isLoading,
  nextPayout,
  isPayoutLoading,
}: DashboardKpiGridProps) {
  const ordersLoading = isLoading || !kpis;
  const ordersHelp = ordersLoading
    ? null
    : `${kpis.newToday} NEW · ${kpis.packedToday} PACKED`;
  const lowStockHelp = ordersLoading
    ? null
    : kpis.lowStockCount > 0
      ? `${kpis.lowStockCount} LOW STOCK`
      : null;

  return (
    <section
      aria-label="Vendor KPIs"
      className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
    >
      <KpiCard
        tone="amberMobile"
        eyebrow="Orders today"
        value={ordersLoading ? null : NUMBER_FMT.format(kpis.ordersToday)}
        pill={
          ordersHelp
            ? { label: ordersHelp, tone: 'amber' as const }
            : null
        }
      />
      <KpiCard
        tone="white"
        eyebrow="Revenue · MTD"
        value={
          ordersLoading
            ? null
            : formatRupeesFromCents(kpis.revenueMtdCents).replace('Rs.', '₨')
        }
        pill={{
          label: 'Trend coming soon',
          tone: 'green' as const,
          icon: <TrendingUpIcon className="size-3" aria-hidden />,
        }}
      />
      <KpiCard
        tone="white"
        eyebrow="Active listings"
        value={ordersLoading ? null : NUMBER_FMT.format(kpis.activeListings)}
        pill={
          lowStockHelp
            ? { label: lowStockHelp, tone: 'red' as const }
            : null
        }
      />
      <KpiCard
        tone="ink"
        eyebrow="Payout · pending"
        value={
          isPayoutLoading
            ? null
            : nextPayout
              ? formatRupeesFromCents(nextPayout.netAmountCents).replace(
                  'Rs.',
                  '₨'
                )
              : '₨ 0'
        }
        pill={{
          label: nextPayout
            ? `Releases ${PAYOUT_RELEASE_FMT.format(
                addOneDay(new Date(nextPayout.weekEnd))
              ).toUpperCase()}`
            : 'Releases Friday — coming soon',
          tone: 'inkInverse' as const,
          icon: <HourglassIcon className="size-3" aria-hidden />,
        }}
      />
    </section>
  );
}

function addOneDay(d: Date): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + 1);
  return next;
}

type KpiCardProps = {
  tone: 'white' | 'amberMobile' | 'ink';
  eyebrow: string;
  value: string | null;
  pill: {
    label: string;
    tone: 'amber' | 'green' | 'red' | 'inkInverse';
    icon?: React.ReactNode;
  } | null;
};

function KpiCard({ tone, eyebrow, value, pill }: KpiCardProps) {
  const inverse = tone === 'ink';
  // Mobile-only amber tile per gap-analysis §1.2 (k1 amber on mobile).
  const wrapperClass =
    tone === 'amberMobile'
      ? 'bg-amber-bg border-amber md:bg-white md:border-rule'
      : tone === 'ink'
        ? 'bg-ink border-ink text-white'
        : 'bg-white border-rule';
  const eyebrowClass = inverse
    ? 'text-white/60'
    : tone === 'amberMobile'
      ? 'text-amber md:text-ink-3'
      : 'text-ink-3';
  const valueClass = inverse
    ? 'text-white'
    : tone === 'amberMobile'
      ? 'text-amber md:text-ink'
      : 'text-ink';
  return (
    <article
      className={cn(
        'flex flex-col gap-2.5 rounded-md border p-4 md:p-5',
        wrapperClass
      )}
    >
      <p
        className={cn(
          'font-mono text-[10px] font-bold tracking-[0.08em] uppercase md:text-[11px]',
          eyebrowClass
        )}
      >
        {eyebrow}
      </p>
      {value === null ? (
        <Skeleton className={cn('h-8 w-28', inverse && 'bg-white/15')} />
      ) : (
        <p
          className={cn(
            'font-mono text-2xl font-extrabold tabular-nums tracking-[-0.01em] md:text-3xl',
            valueClass
          )}
        >
          {value}
        </p>
      )}
      {pill ? <KpiPill {...pill} /> : <span aria-hidden className="h-5" />}
    </article>
  );
}

function KpiPill({
  label,
  tone,
  icon,
}: {
  label: string;
  tone: 'amber' | 'green' | 'red' | 'inkInverse';
  icon?: React.ReactNode;
}) {
  const className = cn(
    'inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.04em]',
    tone === 'amber' && 'bg-amber-bg text-amber',
    tone === 'green' && 'bg-green-bg text-green-700',
    tone === 'red' && 'bg-red-bg text-red',
    tone === 'inkInverse' && 'bg-white/15 text-white'
  );
  return (
    <span className={className}>
      {icon}
      {label}
    </span>
  );
}
