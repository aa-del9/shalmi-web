'use client';

import Link from 'next/link';
import {
  CalendarIcon,
  ChevronDownIcon,
  DownloadIcon,
  PlusIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@repo/ui/components/button';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

const MONTH_FORMAT = new Intl.DateTimeFormat('en-IN', {
  month: 'long',
  year: 'numeric',
});

export function DashboardHeader() {
  const monthLabel = MONTH_FORMAT.format(new Date());
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-ink text-3xl font-extrabold tracking-tight md:text-[32px]">
          Dashboard
        </h1>
        <p className="text-ink-3 text-sm">
          Performance for {monthLabel}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => toast('Range presets coming soon')}
        >
          <CalendarIcon className="size-4" aria-hidden /> Last 30 days
          <ChevronDownIcon className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => toast('Export CSV — coming soon')}
        >
          <DownloadIcon className="size-4" aria-hidden /> Export CSV
        </Button>
        <Button asChild>
          <Link href={`${ABSOLUTE_ROUTES.ADMIN_SALES_REPORTS}/new`}>
            <PlusIcon className="size-4" aria-hidden /> New report
          </Link>
        </Button>
      </div>
    </div>
  );
}
