import Link from 'next/link';
import { MapPin } from 'lucide-react';

import { getCachedCategories } from '@/modules/storefront/utils/get-cached-categories';

/**
 * Pencil bid1Y/sh0XD — paper subnav band between the util strip and
 * the page hero. Desktop only (gap-analysis answer Q14, mobile chrome
 * is purpose-built and deferred to Batch 6).
 *
 * Layout:
 *   left:  Home + 8 category links + "Today's lowest" highlight
 *   right: "Deliver to {city}" geo cluster (Q2: static, non-interactive)
 *
 * The category list is the first 8 categories from
 * `getCachedCategories()` (alphabetical). The Pencil design hard-codes
 * a specific subset (Drinks/Snacks/Cooking oil/Tea & coffee/Pulses &
 * rice/Dairy/Personal care/Electronics) — we render whatever the DB
 * gives us in order, capped to 8.
 */
export async function Subnav() {
  const categories = (await getCachedCategories()).slice(0, 8);

  return (
    <div className="hidden border-y border-rule bg-paper md:block">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-10 py-3 text-[13px]">
        <nav className="flex flex-wrap items-center gap-5" aria-label="Categories">
          <Link href="/" className="font-bold text-ink">
            Home
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="text-ink-2 transition-colors hover:text-ink"
            >
              {cat.name}
            </Link>
          ))}
          {/* TODO(post-v1): wire `/today` (or equivalent) once the
              "Today's lowest" landing page ships. Anchor to home for now. */}
          <Link href="#best-prices" className="font-bold text-green-700">
            Today&apos;s lowest
          </Link>
        </nav>

        {/* TODO(post-v1): wire interactive city/zip selector (Q2 STUBBED). */}
        <span className="inline-flex shrink-0 items-center gap-1.5 text-ink-3">
          <MapPin className="size-3.5" aria-hidden />
          <span>Deliver to </span>
          <span className="font-bold text-ink">Pakistan</span>
        </span>
      </div>
    </div>
  );
}
