'use client';

import Link from 'next/link';
import { ArrowRightIcon, BanknoteIcon } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Skeleton } from '@repo/ui/components/skeleton';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import type { VendorNextPayout } from '../../hooks/use-vendor-next-payout-query';
import type { VendorShop } from '../../hooks/use-vendor-shop-query';

const RELEASE_FMT = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

type DashboardPayoutsCalloutProps = {
  nextPayout: VendorNextPayout;
  isPayoutLoading: boolean;
  shop: VendorShop | undefined;
};

export function DashboardPayoutsCallout({
  nextPayout,
  isPayoutLoading,
  shop,
}: DashboardPayoutsCalloutProps) {
  const releaseLabel = nextPayout
    ? RELEASE_FMT.format(addOneDay(new Date(nextPayout.weekEnd)))
    : null;
  const bankLine = buildBankLine(shop);
  return (
    <section
      aria-label="Next payout"
      className="bg-paper-2 border-rule flex flex-col gap-4 rounded-md border p-5 md:flex-row md:items-center md:justify-between md:px-7 md:py-6"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="bg-paper-3 text-ink inline-flex size-12 shrink-0 items-center justify-center rounded-full"
        >
          <BanknoteIcon className="size-5" />
        </span>
        <div className="min-w-0">
          {isPayoutLoading ? (
            <Skeleton className="h-5 w-56" />
          ) : nextPayout ? (
            <p className="text-ink text-base font-bold md:text-lg">
              Next payout ·{' '}
              <span className="font-mono tabular-nums">
                {formatRupeesFromCents(nextPayout.netAmountCents).replace(
                  'Rs.',
                  '₨'
                )}
              </span>
            </p>
          ) : (
            <p className="text-ink text-base font-bold md:text-lg">
              Releases Friday — coming soon
            </p>
          )}
          <p className="text-ink-2 mt-0.5 text-xs md:text-sm">
            {nextPayout && releaseLabel
              ? `Releases ${releaseLabel}${bankLine ? ` to your registered ${bankLine}` : ''}.`
              : 'Vendor payouts release every Friday once your first delivered orders clear the 7-day return window.'}
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href={ABSOLUTE_ROUTES.VENDOR_LEDGER} prefetch={false}>
          View ledger
          <ArrowRightIcon className="size-4" aria-hidden />
        </Link>
      </Button>
    </section>
  );
}

function buildBankLine(shop: VendorShop | undefined): string {
  if (!shop) return '';
  const bank = shop.bankName?.trim();
  const last4 = shop.ibanLast4?.trim();
  if (bank && last4) return `${bank} account ending ${last4}`;
  if (bank) return `${bank} account`;
  return '';
}

function addOneDay(d: Date): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + 1);
  return next;
}
