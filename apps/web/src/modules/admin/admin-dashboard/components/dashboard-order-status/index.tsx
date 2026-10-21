'use client';

import { AlarmClockIcon, CheckIcon, XIcon } from 'lucide-react';
import { Skeleton } from '@repo/ui/components/skeleton';
import { cn } from '@repo/ui/lib/utils';
import type { AdminKpis } from '../../hooks/use-admin-kpis-query';

const NUMBER_FMT = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

type DashboardOrderStatusProps = {
  data: AdminKpis['orderStatus'] | undefined;
  isLoading: boolean;
  totalOrders: number | undefined;
};

export function DashboardOrderStatus({
  data,
  isLoading,
  totalOrders,
}: DashboardOrderStatusProps) {
  return (
    <section
      aria-label="Order status"
      className="border-rule flex flex-col gap-4 rounded-md border bg-white p-5"
    >
      <header className="flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-ink text-base font-bold">Order status</h2>
          <p className="text-ink-3 text-xs">
            {totalOrders === undefined
              ? 'Snapshot of fulfillment'
              : `${NUMBER_FMT.format(totalOrders)} total orders`}
          </p>
        </div>
      </header>
      <div className="flex flex-col gap-2.5">
        <Tile
          tone="warning"
          icon={<AlarmClockIcon className="size-4" aria-hidden />}
          label="Pending"
          value={isLoading || !data ? null : data.pending}
          caption="Awaiting handover"
        />
        <Tile
          tone="success"
          icon={<CheckIcon className="size-4" aria-hidden />}
          label="Delivered"
          value={isLoading || !data ? null : data.delivered}
          caption="Completed"
        />
        <Tile
          tone="critical"
          icon={<XIcon className="size-4" aria-hidden />}
          label="Cancelled"
          value={isLoading || !data ? null : data.cancelled}
          caption="Refunded or unfulfilled"
        />
      </div>
      <footer className="border-rule text-ink-3 border-t pt-3 text-center font-mono text-[11px] tracking-[0.04em]">
        {isLoading || !data
          ? 'Avg fulfillment loading…'
          : `Avg fulfillment ${data.avgFulfillmentDays.toFixed(1)} days · SLA target ${data.slaTargetDays} days`}
      </footer>
    </section>
  );
}

function Tile({
  tone,
  icon,
  label,
  value,
  caption,
}: {
  tone: 'warning' | 'success' | 'critical';
  icon: React.ReactNode;
  label: string;
  value: number | null;
  caption: string;
}) {
  const toneClass =
    tone === 'warning'
      ? 'border-amber bg-amber-bg text-amber'
      : tone === 'success'
        ? 'border-green-500 bg-green-bg text-green-700'
        : 'border-red bg-red-bg text-red';
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border p-3.5',
        toneClass
      )}
    >
      <span aria-hidden className="text-current shrink-0">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
          {label}
        </p>
        {value === null ? (
          <Skeleton className="mt-1 h-6 w-12 bg-white/40" />
        ) : (
          <p className="text-ink font-mono text-2xl font-extrabold tabular-nums">
            {NUMBER_FMT.format(value)}
          </p>
        )}
        <p className="text-ink-3 text-xs">{caption}</p>
      </div>
    </div>
  );
}
