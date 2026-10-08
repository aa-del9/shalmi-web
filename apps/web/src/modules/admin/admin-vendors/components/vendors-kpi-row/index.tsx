import { cn } from '@repo/ui/lib/utils';

type VendorsKpiRowProps = {
  totals: { all: number; active: number; inactive: number };
  isLoading: boolean;
};

const FORMAT = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

type Card = {
  key: string;
  label: string;
  value: number;
  helper: string;
  toneClass: string;
};

// Q4 binding: drop "12 pending review" — render Total / Active / Inactive only.
// Q16/Q24 (DEFERRED): no deltas, no monthly trends.
export function VendorsKpiRow({ totals, isLoading }: VendorsKpiRowProps) {
  const cards: ReadonlyArray<Card> = [
    {
      key: 'total',
      label: 'Total vendors',
      value: totals.all,
      helper: 'In your network',
      toneClass: 'border-rule bg-white',
    },
    {
      key: 'active',
      label: 'Active',
      value: totals.active,
      helper: 'Visible to buyers',
      toneClass: 'border-green-500 bg-green-bg',
    },
    {
      key: 'inactive',
      label: 'Inactive',
      value: totals.inactive,
      helper: 'Hidden from buyers',
      toneClass: 'border-red bg-red-bg',
    },
  ];

  return (
    <section
      aria-label="Vendor KPIs"
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      {cards.map((card) => (
        <article
          key={card.key}
          className={cn(
            'flex flex-col gap-2 rounded-md border p-4',
            card.toneClass
          )}
        >
          <p className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
            {card.label}
          </p>
          <p className="text-ink font-mono text-3xl font-extrabold tabular-nums">
            {isLoading ? '—' : FORMAT.format(card.value)}
          </p>
          <p className="text-ink-3 text-xs">{card.helper}</p>
        </article>
      ))}
    </section>
  );
}
