'use client';

import { Skeleton } from '@repo/ui/components/skeleton';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import {
  formatCycleRangeLong,
  formatCycleRangeShort,
} from '../../utils/cycle-format';
import type { PayoutBreakdown } from '../../hooks/use-payouts-breakdown-query';

interface BreakdownCardProps {
  breakdown: PayoutBreakdown | null | undefined;
  isLoading: boolean;
}

/**
 * Pencil `I3v4Q` (desktop) / `eIslg` (mobile) — paper-2 receipt-style
 * card. Mobile drops Items packed + Weight shipped per gap-analysis
 * Q12.
 *
 * `itemsPackedCount` and `weightShippedGrams` are server-side STUBBED
 * (Q4 — derivation lives in the cycle-roll job). When null, we hide
 * the row on desktop.
 */
export function BreakdownCard({ breakdown, isLoading }: BreakdownCardProps) {
  if (isLoading) {
    return (
      <section className="rounded-xl border-[1.5px] border-rule-2 bg-paper-2 p-6">
        <Skeleton className="h-3 w-32" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </section>
    );
  }

  if (!breakdown) {
    return (
      <section className="rounded-xl border-[1.5px] border-rule-2 bg-paper-2 p-5 md:p-6">
        <p className="text-center text-[13px] text-ink-3">
          No active payout cycle yet — your first cycle starts after
          your first delivered order.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border-[1.5px] border-rule-2 bg-paper-2 p-[18px] md:p-6">
      <p className="hidden text-center font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2 md:block">
        THIS WEEK · {formatCycleRangeLong(breakdown.weekStart, breakdown.weekEnd)}
      </p>
      <p className="text-center font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2 md:hidden">
        THIS WEEK · {formatCycleRangeShort(breakdown.weekStart, breakdown.weekEnd)}
      </p>

      <ul className="mt-4 flex flex-col gap-2.5 text-[14px]">
        <Row
          label="Completed orders (no return)"
          value={String(breakdown.completedOrdersCount)}
        />
        {breakdown.itemsPackedCount !== null ? (
          <Row
            label="Items packed"
            value={String(breakdown.itemsPackedCount)}
            className="hidden md:flex"
          />
        ) : null}
        {breakdown.weightShippedGrams !== null ? (
          <Row
            label="Weight shipped"
            value={`${(breakdown.weightShippedGrams / 1000).toFixed(1)} kg`}
            className="hidden md:flex"
          />
        ) : null}
        <Row
          label="Gross sales"
          value={formatRupeesFromCents(breakdown.grossAmountCents)}
        />
        <Row
          labelDesktop="− Returns"
          labelMobile="Returns"
          value={`− ${formatRupeesFromCents(breakdown.returnsAmountCents)}`}
          tone="red"
        />
        <Row
          labelDesktop="− MNP delivery fees"
          labelMobile="MNP fees"
          value={`− ${formatRupeesFromCents(breakdown.mnpReimbursementCents)}`}
          tone="red"
          divider
        />
      </ul>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[14px] font-bold text-ink">Net payout</span>
        <span className="font-mono text-[16px] font-extrabold text-green-700 md:text-[18px]">
          {formatRupeesFromCents(breakdown.netAmountCents)}
        </span>
      </div>
    </section>
  );
}

interface RowProps {
  label?: string;
  labelDesktop?: string;
  labelMobile?: string;
  value: string;
  tone?: 'default' | 'red';
  divider?: boolean;
  className?: string;
}

function Row({
  label,
  labelDesktop,
  labelMobile,
  value,
  tone = 'default',
  divider = false,
  className,
}: RowProps) {
  return (
    <li
      className={
        'flex items-center justify-between' +
        (divider ? ' border-b-[1.5px] border-ink/40 pb-2.5' : '') +
        (className ? ` ${className}` : '')
      }
    >
      <span className="text-ink-2">
        {label ?? (
          <>
            <span className="hidden md:inline">{labelDesktop}</span>
            <span className="md:hidden">{labelMobile}</span>
          </>
        )}
      </span>
      <span
        className={
          tone === 'red'
            ? 'font-mono font-semibold text-red'
            : 'font-mono font-semibold text-ink'
        }
      >
        {value}
      </span>
    </li>
  );
}
