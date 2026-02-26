'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import type { CarouselApi } from '@repo/ui/components/carousel';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@repo/ui/components/carousel';
import { Button } from '@repo/ui/components/button';
import { XIcon } from 'lucide-react';
import type { Banner } from '../../types';

type CarouselSlidesProps = {
  banners: Banner[];
  selectedId: string | null;
  onSelectBanner: (id: string | null) => void;
  onRemoveFromActive?: (bannerId: string) => void;
  setApi?: (api: CarouselApi) => void;
};

export function CarouselSlides({
  banners,
  selectedId,
  onSelectBanner,
  onRemoveFromActive,
  setApi,
}: CarouselSlidesProps) {
  const carouselPlugins = useMemo(() => [WheelGesturesPlugin()], []);

  if (banners.length === 0) {
    return (
      <div className="bg-muted/30 text-muted-foreground flex aspect-740/320 w-full items-center justify-center rounded-lg border border-dashed md:aspect-1440/270">
        No active banners. Add banners from below.
      </div>
    );
  }

  return (
    <Carousel
      setApi={setApi}
      plugins={carouselPlugins}
      className="w-full self-center"
    >
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id}>
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  onSelectBanner(selectedId === banner.id ? null : banner.id)
                }
                className="w-full text-left"
              >
                <figure
                  className={`overflow-hidden rounded-lg border-2 transition-all ${
                    selectedId === banner.id
                      ? 'border-primary ring-primary/30 ring-2'
                      : 'border-transparent'
                  }`}
                >
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    width={800}
                    height={600}
                    className="aspect-740/320 w-full object-cover md:aspect-1440/270"
                  />
                </figure>
              </button>
              {onRemoveFromActive && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 size-8 rounded-full opacity-90 hover:opacity-100"
                  aria-label="Remove from active"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromActive(banner.id);
                  }}
                >
                  <XIcon className="size-4" />
                </Button>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
}
