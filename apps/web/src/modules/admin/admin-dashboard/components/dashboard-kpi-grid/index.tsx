'use client';

import { Skeleton } from '@repo/ui/components/skeleton';
import type { AdminKpis } from '../../hooks/use-admin-kpis-query';
import { formatCompactRupeesFromCents } from '../../utils/format-compact-rupees';

const NUMBER_FMT = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

type DashboardKpiGridProps = {
  data: AdminKpis | undefined;
  isLoading: boolean;
};

export function DashboardKpiGrid({ data, isLoading }: DashboardKpiGridProps) {
  return (
    <section
      aria-label="Dashboard KPIs"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
    >
      <KpiCard
        label="Total sales"
        value={
          isLoading || !data
            ? null
            : formatCompactRupeesFromCents(data.totalSalesCents)
        }
        helper="Across all vendors"
      />
      <KpiCard
        label="Items listed"
        value={
          isLoading || !data ? null : NUMBER_FMT.format(data.totalProducts)
        }
        helper="In active catalog"
      />
      <KpiCard
        label="Total orders"
        value={
          isLoading || !data ? null : NUMBER_FMT.format(data.totalOrders)
        }
        helper="Lifetime"
      />
      <KpiCard
        label="Active vendors"
        value={
          isLoading || !data ? null : NUMBER_FMT.format(data.activeVendors)
        }
        helper="Visible to buyers"
      />
    </section>
  );
}

function KpiCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | null;
  helper: string;
}) {
  return (
    <article className="border-rule flex flex-col gap-2 rounded-md border bg-white p-4 lg:p-5">
      <p className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
        {label}
      </p>
      {value === null ? (
        <Skeleton className="h-8 w-32" />
      ) : (
        <p className="text-ink font-mono text-2xl font-extrabold tabular-nums lg:text-[32px]">
          {value}
        </p>
      )}
      <p className="text-ink-3 text-xs">{helper}</p>
    </article>
  );
}
