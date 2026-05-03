'use client';

import Link from 'next/link';
import { CalendarIcon, ChevronDownIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@repo/ui/components/button';
import { Skeleton } from '@repo/ui/components/skeleton';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import type { VendorShop } from '../../hooks/use-vendor-shop-query';

const DATE_FMT = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

type DashboardHeaderProps = {
  shop: VendorShop | undefined;
  isLoading: boolean;
};

export function DashboardHeader({ shop, isLoading }: DashboardHeaderProps) {
  const dateLabel = DATE_FMT.format(new Date()).toUpperCase();
  // Q4 binding: header eyebrow city = `vendors.hub`.
  const hubLabel = (shop?.hub ?? '').toUpperCase();
  const eyebrow = hubLabel ? `${dateLabel} · ${hubLabel}` : dateLabel;

  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <p className="text-amber font-mono text-[11px] font-bold tracking-[0.16em] uppercase">
          {eyebrow}
        </p>
        {isLoading || !shop ? (
          <Skeleton className="h-9 w-72" />
        ) : (
          <h1 className="text-ink text-[28px] font-extrabold tracking-[-0.02em] md:text-[32px]">
            {shop.shopName}
          </h1>
        )}
        <p className="text-ink-2 text-sm">
          Your shop at a glance — orders, stock, payouts.
        </p>
      </div>
      <div className="hidden flex-wrap items-center gap-2 md:flex">
        {/* Q1 binding: opens dropdown of preset windows. STUBBED to a
            toast for this batch — the real preset dropdown is filter-
            scope work owned by the analytics milestone (per scope-cut
            "Vendor sales analytics" STUBBED). */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => toast('Range presets coming soon')}
        >
          <CalendarIcon className="size-4" aria-hidden /> This month
          <ChevronDownIcon className="size-4" aria-hidden />
        </Button>
        <Button asChild size="sm">
          <Link href={ABSOLUTE_ROUTES.VENDOR_PRODUCTS_NEW} prefetch={false}>
            <PlusIcon className="size-4" aria-hidden /> Add product
          </Link>
        </Button>
      </div>
    </header>
  );
}
