'use client';

import { useQuery } from '@tanstack/react-query';

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  vendorId: string;
  images: { url: string; blurHash: string | null }[];
  packWeightGrams: number;
  packSize: number;
  unitLabel: string | null;
  packMrpCents: number | null;
  packWholesalePriceCents: number;
  pricePerUnitCents: number | null;
  stock: number;
  lowestPriceCents: number;
}

export function useRelatedProductsQuery(slug: string) {
  return useQuery({
    queryKey: ['products', slug, 'related'],
    queryFn: async (): Promise<RelatedProduct[]> => {
      const res = await fetch(
        `/api/products/${encodeURIComponent(slug)}/related`
      );
      const json = await res.json();
      if (!json.success) return [];
      return (json.data?.items ?? []) as RelatedProduct[];
    },
    staleTime: 60_000,
    enabled: Boolean(slug),
  });
}
