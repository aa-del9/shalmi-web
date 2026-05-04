import Link from 'next/link';

import { getBestPricesProducts } from '@/modules/storefront/utils/get-best-prices-products';

import { Prod1Card } from '../prod1-card';

/**
 * Pencil bid1Y/fLhQz — "Today's lowest" 4-up `prod1` grid.
 * Mobile X0SzkF/TbBoZ — same eyebrow, 2-up grid.
 *
 * Replaces the prior `BestPricesSection` carousel with a static grid
 * (per buyer-home gap-analysis §2 "Best prices grid": "Becomes a 4-card
 * static grid, not a carousel").
 *
 * Per Q4: the section's name changes from "Best Prices" to
 * "Today's lowest"; eyebrow added; "See all deals →" replaces inline
 * arrows.
 */
export async function HomeBestPricesGrid() {
  const products = (await getBestPricesProducts()).slice(0, 4);

  if (products.length === 0) return null;

  return (
    <section
      id="best-prices"
      className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-10 md:py-6"
    >
      <header className="mb-4 flex items-end justify-between gap-3 md:mb-5">
        <div className="flex flex-col gap-1">
          <span className="text-red font-mono text-[10px] font-bold tracking-[0.14em] uppercase md:text-[11px] md:tracking-[0.16em]">
            Best prices · Super savers
          </span>
          <h2 className="text-ink font-sans text-xl font-extrabold tracking-[-0.01em] md:text-3xl">
            Today&apos;s lowest
          </h2>
        </div>
        {/* TODO(post-v1): wire `/today` (or equivalent) when the
            "See all deals" landing route ships (Q3.4). */}
        <Link
          href="#"
          prefetch={false}
          className="hidden text-[13px] font-bold text-green-700 md:inline"
        >
          See all deals <span aria-hidden>→</span>
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {products.map((p) => (
          <Prod1Card key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
