'use client';

import { Download, Trophy } from 'lucide-react';
import { Stamp } from '@repo/ui/components/stamp';
import { Skeleton } from '@repo/ui/components/skeleton';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import {
  formatHistoryWeek,
  formatPaidOn,
} from '../../utils/cycle-format';
import type { PayoutsHistoryResponse } from '../../hooks/use-payouts-history-query';

interface HistoryCardProps {
  history: PayoutsHistoryResponse | undefined;
  isLoading: boolean;
}

/**
 * Pencil `SVyJR` (desktop table) / `j0xdc` (mobile card list) —
 * payout history.
 *
 * "Export all" button is STUBBED per gap-analysis Q6 (visible, no-op).
 * Per-row click-to-detail-modal is STUBBED per Q22 (no click target).
 * Lifetime totals (footer) STUBBED per Q19 — render `—`.
 */
export function HistoryCard({ history, isLoading }: HistoryCardProps) {
  const runs = history?.runs ?? [];

  return (
    <section className="overflow-hidden rounded-xl border border-rule bg-white">
      <header className="flex items-center justify-between border-b-[1.5px] border-rule-2 bg-paper-2 px-5 py-4 md:px-6 md:py-[18px]">
        <div className="min-w-0">
          <h2 className="text-[18px] font-bold text-ink">Payout history</h2>
          <p className="hidden text-[13px] text-ink-3 md:block">
            Last {Math.max(runs.length, 8)} weeks · download PDF anytime
          </p>
        </div>
        {/* TODO(post-v1): wire CSV/PDF export (gap-analysis Q6 STUBBED). */}
        <button
          type="button"
          onClick={() => {
            /* no-op */
          }}
          className="hidden items-center gap-2 rounded-md border border-ink/30 px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-paper-2 md:flex"
        >
          <Download className="size-4" aria-hidden />
          Export all
        </button>
        <button
          type="button"
          onClick={() => {
            /* no-op */
          }}
          className="text-[13px] font-semibold text-ink underline-offset-4 hover:underline md:hidden"
        >
          Export all
        </button>
      </header>

      {isLoading ? (
        <div className="space-y-2 p-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : runs.length === 0 ? (
        <div className="px-6 py-10 text-center text-[13px] text-ink-3">
          No payouts yet — your first cycle posts on the next Friday
          after a delivered order clears the 7-day return window.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[160px_130px_120px_160px_1fr_120px] border-b border-rule bg-paper-2 px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">
              <span>WEEK</span>
              <span>PAID ON</span>
              <span>COMPLETED</span>
              <span>NET PAYOUT</span>
              <span>TXN ID</span>
              <span>STATUS</span>
            </div>
            {runs.map((run) => {
              const isPending = run.status === 'pending';
              return (
                <div
                  key={run.id}
                  className={
                    'grid grid-cols-[160px_130px_120px_160px_1fr_120px] items-center border-b border-rule px-6 py-3.5 text-[13px] last:border-b-0' +
                    (isPending ? ' bg-amber-bg/40' : '')
                  }
                >
                  <span className="font-semibold text-ink">
                    {formatHistoryWeek(run.weekStart, run.weekEnd)}
                  </span>
                  <span className="font-mono text-ink-2">
                    {formatPaidOn(run.paidOn)}
                  </span>
                  <span className="font-mono font-semibold text-ink">
                    {run.completedOrdersCount}
                  </span>
                  <span className="font-mono font-bold text-ink">
                    {formatRupeesFromCents(run.netAmountCents)}
                  </span>
                  <span className="truncate font-mono text-[12px] text-ink-3">
                    {run.txnId ?? 'pending'}
                  </span>
                  <span>
                    {isPending ? (
                      <Stamp variant="warning" rotated={false}>
                        PENDING
                      </Stamp>
                    ) : (
                      <Stamp variant="success" rotated={false}>
                        PAID
                      </Stamp>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile card list */}
          <ul className="flex flex-col gap-2.5 px-4 py-4 md:hidden">
            {runs.map((run) => {
              const isPending = run.status === 'pending';
              return (
                <li
                  key={run.id}
                  className={
                    'rounded-xl border border-rule px-4 py-3' +
                    (isPending ? ' bg-amber-bg/30' : ' bg-white')
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-ink">
                        {formatHistoryWeek(run.weekStart, run.weekEnd)}
                      </p>
                      {isPending ? (
                        <p className="font-mono text-[11px] font-semibold text-amber">
                          Pays {formatPaidOn(run.weekEnd)}
                        </p>
                      ) : (
                        <p className="truncate font-mono text-[11px] font-semibold text-ink-3">
                          Paid {formatPaidOn(run.paidOn)}
                          {run.txnId ? ` · ${run.txnId}` : ''}
                        </p>
                      )}
                    </div>
                    {isPending ? (
                      <Stamp variant="warning">PENDING</Stamp>
                    ) : (
                      <Stamp variant="success">PAID</Stamp>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[13px]">
                    <span className="text-ink-3">
                      {run.completedOrdersCount} completed
                    </span>
                    <span className="font-mono text-[18px] font-extrabold text-ink">
                      {formatRupeesFromCents(run.netAmountCents)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* Footer: lifetime totals — STUBBED post-v1 (Q19) */}
      <footer className="hidden items-center justify-between border-t border-rule bg-paper-2 px-6 py-3.5 md:flex">
        <p className="font-mono text-[12px] text-ink-3">
          {/* TODO(post-v1): wire lifetime totals (gap-analysis Q19 STUBBED). */}
          Lifetime: — across — weeks
        </p>
        <button
          type="button"
          onClick={() => {
            /* no-op until pagination ships (Q20) */
          }}
          className="text-[13px] font-semibold text-ink hover:underline"
        >
          View older weeks
        </button>
      </footer>
      <div className="mx-4 mb-4 flex items-center gap-4 rounded-lg bg-paper-2 px-3.5 py-3 md:hidden">
        <Trophy className="size-4 shrink-0 text-ink-2" aria-hidden />
        <div className="min-w-0">
          <p className="font-mono text-[13px] font-bold text-ink">
            Lifetime: —
          </p>
          <p className="text-[11px] text-ink-3">
            Across — weeks of payouts
          </p>
        </div>
      </div>
    </section>
  );
}
