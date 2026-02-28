'use client';

import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@repo/ui/components/carousel';
import { ProductCard } from '../product-card';
import type { StorefrontProduct } from '../../types';

interface ProductCarouselSectionProps {
  title: string;
  products: StorefrontProduct[];
}

export function ProductCarouselSection({
  title,
  products,
}: ProductCarouselSectionProps) {
  return (
    <section className="space-y-4">
      <Carousel
        opts={{ align: 'start', skipSnaps: true }}
        plugins={[WheelGesturesPlugin()]}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <div className="flex items-center gap-2">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </div>
        <CarouselContent className="mt-4">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-1/2 md:basis-1/3 lg:basis-1/5"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
