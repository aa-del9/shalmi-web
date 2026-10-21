'use client';

import { useRelatedProductsQuery } from '../../hooks/use-related-products-query';
import { Prod1Card } from '@/modules/storefront/components/home/prod1-card';

interface PdpYmalRailProps {
  slug: string;
}

export function PdpYmalRail({ slug }: PdpYmalRailProps) {
  const { data, isLoading } = useRelatedProductsQuery(slug);

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">You may also like</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[320px] animate-pulse rounded-[10px] border border-rule bg-paper-2"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-ink">You may also like</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {data.map((p) => (
          <Prod1Card
            key={p.id}
            product={{
              id: p.id,
              name: p.name,
              slug: p.slug,
              images: p.images,
              packWeightGrams: p.packWeightGrams,
              packSize: p.packSize,
              unitLabel: p.unitLabel,
              lowestPriceCents: p.lowestPriceCents,
            }}
          />
        ))}
      </div>
    </section>
  );
}
