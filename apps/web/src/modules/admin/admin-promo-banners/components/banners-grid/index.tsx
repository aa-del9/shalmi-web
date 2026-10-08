'use client';

import { Skeleton } from '@repo/ui/components/skeleton';
import type { Banner } from '../../types';
import { BannerCard } from '../banner-card';

type BannersGridProps = {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  banners: ReadonlyArray<Banner>;
  selectedBannerId: string | null;
  onSelect: (id: string) => void;
};

function GridSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading banners"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border-rule overflow-hidden rounded-md border">
          <Skeleton className="aspect-[16/7] w-full rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BannersGrid({
  isLoading,
  hasError,
  errorMessage,
  banners,
  selectedBannerId,
  onSelect,
}: BannersGridProps) {
  if (isLoading) return <GridSkeleton />;
  if (hasError)
    return (
      <div className="border-rule text-red rounded-md border bg-white px-4 py-12 text-center text-sm">
        {errorMessage}
      </div>
    );
  if (banners.length === 0)
    return (
      <div className="border-rule text-ink-3 rounded-md border bg-white px-4 py-12 text-center text-sm">
        No banners match your filters yet.
      </div>
    );
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {banners.map((banner) => (
        <BannerCard
          key={banner.id}
          banner={banner}
          isSelected={selectedBannerId === banner.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
