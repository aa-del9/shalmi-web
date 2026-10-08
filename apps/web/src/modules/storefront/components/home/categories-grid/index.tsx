import Link from 'next/link';

import { getCachedCategories } from '@/modules/storefront/utils/get-cached-categories';

/**
 * Pencil bid1Y/HKyta — desktop "Shop by category" 8-tile grid.
 * Mobile X0SzkF/JZtjX — 2 rows × 4 tiles, slightly more compact.
 *
 * Per gap-analysis Q9 (binding STUBBED): icon swatches use a
 * first-letter fallback. The lucide icon-per-category map is deferred
 * until the `categories.iconKey` migration lands in Batch 2.
 *
 * Per Q10 ("View all" CTA): we anchor to home for now until the
 * dedicated `/categories` index ships.
 *
 * TODO(post-v1): swap first-letter fallback for `category.iconKey`
 * lucide icons once Batch 2 schema lands.
 */
export async function HomeCategoriesGrid() {
  const categories = (await getCachedCategories()).slice(0, 8);

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-10 md:py-6">
      {/* Section header — desktop has eyebrow + h2 + "View all"; mobile
          drops the eyebrow per Pencil JZtjX/adLVM. */}
      <header className="mb-4 flex items-end justify-between gap-3 md:mb-4">
        <div className="flex flex-col gap-1">
          <span className="hidden font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-ink-3 md:inline">
            Browse categories
          </span>
          <h2 className="font-sans text-lg font-extrabold tracking-[-0.01em] text-ink md:text-2xl">
            Shop by category
          </h2>
        </div>
        <Link
          href="#"
          prefetch={false}
          className="text-[12px] font-bold text-green-700 md:text-[13px]"
        >
          View all <span aria-hidden>→</span>
        </Link>
      </header>

      <div className="grid grid-cols-4 gap-2.5 md:grid-cols-8 md:gap-3">
        {categories.map((cat) => {
          const initial = cat.name.charAt(0).toUpperCase();
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="flex flex-col items-center gap-1.5 rounded-md border border-rule bg-white p-3 text-center transition-colors hover:border-ink/40 md:gap-2.5 md:p-4"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-green-bg font-sans text-base font-bold text-green-700 md:size-12 md:text-lg">
                {initial}
              </span>
              <span className="line-clamp-1 text-[11px] font-bold leading-tight text-ink md:text-[13px]">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
