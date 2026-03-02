'use client';

import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@repo/ui/components/carousel';
import { cn } from '@repo/ui/lib/utils';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string | null;
}

interface HeroCarouselProps {
  banners: Banner[];
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const interval = setInterval(scrollNext, 5000);
    return () => clearInterval(interval);
  }, [api, scrollNext]);

  if (banners.length === 0) return null;

  return (
    <div className="relative">
      <Carousel
        opts={{ loop: true }}
        setApi={setApi}
        plugins={[WheelGesturesPlugin()]}
      >
        <CarouselContent>
          {banners.map((banner) => {
            const imageContent = (
              <div className="relative aspect-3/1 w-full overflow-hidden rounded-lg">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              </div>
            );

            return (
              <CarouselItem key={banner.id}>
                {banner.targetUrl ? (
                  <Link href={banner.targetUrl}>{imageContent}</Link>
                ) : (
                  imageContent
                )}
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {count > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === current
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/30 w-1.5'
              )}
              onClick={() => api?.scrollTo(i)}
            >
              <span className="sr-only">Go to slide {i + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
