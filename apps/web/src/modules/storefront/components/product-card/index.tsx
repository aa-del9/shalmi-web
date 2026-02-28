import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@repo/ui/components/card';
import type { StorefrontProduct } from '../../types';

interface ProductCardProps {
  product: StorefrontProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images[0];
  const priceDisplay = (product.lowestPriceCents / 100).toLocaleString();

  return (
    <Link href={`/products/${product.slug}`} className="block">
      <Card className="gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
        <div className="bg-muted relative aspect-square w-full">
          {firstImage ? (
            <Image
              src={firstImage.url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="truncate text-sm font-medium">{product.name}</h3>
          <p className="text-muted-foreground text-xs">{product.weightGrams} g</p>
          <p className="mt-1 text-sm font-semibold">From Rs. {priceDisplay}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
