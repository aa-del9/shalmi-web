'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CarouselApi } from '@repo/ui/components/carousel';
import { CarouselSlides } from './carousel-slides';
import { CarouselThumbnailsSortable } from './carousel-thumbnails-sortable';
import type { BannersCarouselProps } from './types';

export function BannersCarousel({
  banners,
  selectedId,
  onSelectBanner,
  onReorder,
  onRemoveFromActive,
}: BannersCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    api.on('select', handleSelect);
    return () => {
      api.off('select', handleSelect);
    };
  }, [api]);

  const handleScrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  return (
    <div className="w-full max-w-4xl self-center">
      <CarouselSlides
        banners={banners}
        selectedId={selectedId}
        onSelectBanner={onSelectBanner}
        onRemoveFromActive={onRemoveFromActive}
        setApi={setApi}
      />
      <CarouselThumbnailsSortable
        banners={banners}
        selectedId={selectedId}
        currentIndex={current}
        onScrollTo={handleScrollTo}
        onSelectBanner={onSelectBanner}
        onReorder={onReorder}
      />
    </div>
  );
}
