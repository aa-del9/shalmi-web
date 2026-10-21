'use client';

import { cn } from '@repo/ui/lib/utils';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';

interface ComparisonCardProps {
  originalTotalCents: number;
  reorderTotalCents: number;
}

/**
 * Pencil klOB3 (desktop only) — VS. ORIGINAL ORDER comparison card.
 *
 * Per gap-analysis Q28 / Q29: desktop only; difference colored
 * green-700 when cheaper (− Rs. X) / red when more expensive (+ Rs. X).
 */
export function ComparisonCard({
  originalTotalCents,
  reorderTotalCents,
}: ComparisonCardProps) {
  const diffCents = reorderTotalCents - originalTotalCents;
  const cheaper = diffCents < 0;
  const sameValue = diffCents === 0;
  const sign = cheaper ? '−' : '+';
  const absFormatted = formatRupeesFromCents(Math.abs(diffCents));

  return (
    <div className="rounded-md border border-rule bg-white px-4 py-3.5">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink-3">
        VS. original order
      </p>
      <div className="mt-2 space-y-1.5">
        <div className="flex justify-between text-[13px]">
          <span className="text-ink-3">Original total</span>
          <span className="font-mono text-ink-3">
            {formatRupeesFromCents(originalTotalCents)}
          </span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="font-semibold text-ink">This reorder</span>
          <span className="font-mono font-bold text-ink">
            {formatRupeesFromCents(reorderTotalCents)}
          </span>
        </div>
      </div>
      <div className="mt-2 flex justify-between border-t border-rule pt-2">
        <span
          className={cn(
            'font-sans text-[13px] font-bold',
            sameValue ? 'text-ink' : cheaper ? 'text-green-700' : 'text-red'
          )}
        >
          Difference
        </span>
        <span
          className={cn(
            'font-mono text-[13px] font-bold',
            sameValue ? 'text-ink' : cheaper ? 'text-green-700' : 'text-red'
          )}
        >
          {sameValue ? '—' : `${sign} ${absFormatted}`}
        </span>
      </div>
    </div>
  );
}
