'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { useCartStore } from '@/modules/cart/stores/cart-store';
import type { CartItemInput, PackTier } from '@/modules/cart/types';
import { findDefaultTier } from '@/modules/cart/utils/pack-pricing';
import type { StorefrontProduct } from '../../types';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';

interface ProductCardProps {
  product: StorefrontProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images[0];
  const priceDisplay = formatRupeesFromCents(product.lowestPriceCents);
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      const res = await fetch(
        `/api/products/${encodeURIComponent(product.slug)}`
      );
      const json = await res.json();
      if (!json.success || !json.data) return;
      const p = json.data as {
        id: string;
        name: string;
        slug: string;
        vendorId: string;
        vendorName: string | null;
        images: { url: string; blurHash: string | null }[];
        packWeightGrams: number;
        packSize: number;
        unitLabel: string | null;
        stock: number;
        packTiers: PackTier[];
      };
      if (p.stock <= 0) return;
      const defaultTier = findDefaultTier(p.packTiers);
      if (!defaultTier) return;
      const cartInput: CartItemInput = {
        productId: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images[0] ?? null,
        packWeightGrams: p.packWeightGrams,
        packSize: p.packSize,
        unitLabel: p.unitLabel,
        vendorId: p.vendorId,
        vendorName: p.vendorName ?? '',
        packTiers: p.packTiers,
        selectedPackQty: defaultTier.packQty,
      };
      addItem(cartInput, 1);
      toast.success('Added to cart');
    } finally {
      setAdding(false);
    }
  }

  return (
    <Card className="gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
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
          <p className="text-muted-foreground text-xs">
            {product.packWeightGrams} g
          </p>
          <p className="mt-1 text-sm font-semibold">{priceDisplay}</p>
        </CardContent>
      </Link>
      <div
        className="border-t px-3 py-2"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Button
          size="sm"
          className="w-full"
          onClick={handleAddToCart}
          disabled={adding}
        >
          {adding ? '…' : 'Add to cart'}
        </Button>
      </div>
    </Card>
  );
}
