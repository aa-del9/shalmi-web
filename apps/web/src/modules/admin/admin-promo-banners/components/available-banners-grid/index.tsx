'use client';

import Image from 'next/image';
import { Button } from '@repo/ui/components/button';
import { PlusCircleIcon } from 'lucide-react';
import type { Banner } from '../../types';

type AvailableBannersGridProps = {
  banners: Banner[];
  selectedActiveId: string | null;
  onAddToCarousel: (banner: Banner) => void;
  onReplaceWith: (banner: Banner) => void;
};

export function AvailableBannersGrid({
  banners,
  selectedActiveId,
  onAddToCarousel,
  onReplaceWith,
}: AvailableBannersGridProps) {
  if (banners.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No inactive banners. All banners are in the carousel.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="group bg-card relative overflow-hidden rounded-lg border"
        >
          <div className="relative aspect-740/320 md:aspect-1440/270">
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => onAddToCarousel(banner)}
              >
                <PlusCircleIcon className="mr-1 size-4" />
                Add to Carousel
              </Button>
              {selectedActiveId && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onReplaceWith(banner)}
                >
                  Replace
                </Button>
              )}
            </div>
          </div>
          <p className="truncate p-2 text-sm font-medium" title={banner.title}>
            {banner.title}
          </p>
        </div>
      ))}
    </div>
  );
}
