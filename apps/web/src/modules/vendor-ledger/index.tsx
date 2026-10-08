'use client';

import { usePayoutsBreakdownQuery } from './hooks/use-payouts-breakdown-query';
import { usePayoutsHistoryQuery } from './hooks/use-payouts-history-query';
import { PageHeader } from './components/page-header';
import { NextPayoutHero } from './components/next-payout-hero';
import { BreakdownCard } from './components/breakdown-card';
import { BankInfoCard } from './components/bank-info-card';
import { HistoryCard } from './components/history-card';

/**
 * Pencil `S8BU3J` (desktop) / `u5iGd` (mobile) — Vendor Ledger screen.
 *
 * Page header + ink hero + breakdown + bank info + history. Lives at
 * `/vendor/ledger`; the route already exists in `VENDOR_NAV_ITEMS` and
 * is the destination of the dashboard "View ledger" CTA.
 */
export function VendorLedgerScreen() {
  const breakdown = usePayoutsBreakdownQuery();
  const history = usePayoutsHistoryQuery(8);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 py-6 md:gap-10 md:py-10">
      <PageHeader />

      <NextPayoutHero
        breakdown={breakdown.data}
        isLoading={breakdown.isLoading}
      />

      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr] md:gap-8">
        <BreakdownCard
          breakdown={breakdown.data}
          isLoading={breakdown.isLoading}
        />
        <BankInfoCard />
      </div>

      <HistoryCard history={history.data} isLoading={history.isLoading} />
    </div>
  );
}
