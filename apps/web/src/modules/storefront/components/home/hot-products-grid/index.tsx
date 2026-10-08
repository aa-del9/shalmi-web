import Link from 'next/link';

import { getSuperSaverProducts } from '@/modules/storefront/utils/get-super-saver-products';

import { Prod1Card } from '../prod1-card';

/**
 * Pencil bid1Y/EvWCh — "Hot products this week" 4-up `prod1` grid.
 * Mobile X0SzkF/xiPQg — same eyebrow, 2-up grid.
 *
 * Per gap-analysis Q4 (binding STUBBED): re-skin of the existing
 * SuperSavers data with the eyebrow swapped to "TRENDING NOW". A
 * proper trending metric (admin curation or order-aggregation) lands
 * in a future batch.
 *
 * TODO(post-v1): swap to a real trending source when scope lands —
 * either `products.isTrending` admin flag, or a recent-orders
 * aggregation.
 */
export async function HomeHotProductsGrid() {
  const products = (await getSuperSaverProducts()).slice(0, 4);

  if (products.length === 0) return null;

  return (
    <section
      id="hot-products"
      className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-10 md:py-6"
    >
      <header className="mb-4 flex items-end justify-between gap-3 md:mb-5">
        <div className="flex flex-col gap-1">
          <span className="text-amber font-mono text-[10px] font-bold tracking-[0.14em] uppercase md:text-[11px] md:tracking-[0.16em]">
            Trending now
          </span>
          <h2 className="text-ink font-sans text-xl font-extrabold tracking-[-0.01em] md:text-3xl">
            Hot products this week
          </h2>
        </div>
        <Link
          href="#"
          prefetch={false}
          className="hidden text-[13px] font-bold text-green-700 md:inline"
        >
          View all <span aria-hidden>→</span>
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
