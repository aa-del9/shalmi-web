import Link from 'next/link';
import { ChevronLeft, ChevronRight, Package as PackageIcon } from 'lucide-react';

import { getCachedCategories } from '@/modules/storefront/utils/get-cached-categories';

/**
 * Pencil bid1Y/rc5ew — "Most ordered" 4 horizontal cards.
 *
 * Per gap-analysis Q10 (binding): re-skin of existing first-N
 * categories. Drop "{N} SKUs" caption until aggregates land in a
 * future batch.
 *
 * The arrow buttons in the header are presentational only in Batch 1
 * — there's no scroll/carousel because the existing query returns at
 * most 10 categories (slicing first 4).
 *
 * Desktop only — Pencil mobile X0SzkF doesn't include a Popular
 * section, only categories grid + best-prices + hot products.
 *
 * TODO(post-v1): wire SKU aggregation when category counts ship.
 */
export async function HomePopularSection() {
  const categories = await getCachedCategories();
  const popular = categories.slice(0, 4);

  if (popular.length === 0) return null;

  return (
    <section className="mx-auto hidden w-full max-w-[1440px] px-10 py-6 md:block">
      <header className="mb-4 flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-ink-3">
            Popular this week
          </span>
          <h2 className="font-sans text-2xl font-extrabold tracking-[-0.01em] text-ink">
            Most ordered
          </h2>
        </div>
        {/* Presentational arrows — no carousel wired in Batch 1 since
            popular is capped to 4 visible items. */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous popular categories"
            disabled
            className="inline-flex size-9 items-center justify-center rounded-full border border-rule bg-white text-ink-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next popular categories"
            disabled
            className="inline-flex size-9 items-center justify-center rounded-full bg-ink text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-3.5">
        {popular.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="flex items-center gap-3 rounded-[10px] border border-rule bg-white p-4 transition-colors hover:border-ink/40"
          >
            <span className="inline-flex size-[52px] shrink-0 items-center justify-center rounded-md bg-paper-2 text-ink-2">
              <PackageIcon className="size-6" aria-hidden strokeWidth={1.5} />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-sm font-bold text-ink">
                {cat.name}
              </span>
              <span className="font-mono text-[11px] text-ink-3">
                Browse
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
