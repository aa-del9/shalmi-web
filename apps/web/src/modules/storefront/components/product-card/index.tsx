'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { QuantitySelector } from '@/modules/cart/components/quantity-selector';
import { useCartStore } from '@/modules/cart/stores/cart-store';
import type { CartItemInput } from '@/modules/cart/types';
import type { StorefrontProduct } from '../../types';
import { formatPrice } from '@/modules/cart/utils/resolve-price';

interface ProductCardProps {
  product: StorefrontProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images[0];
  const priceDisplay = formatPrice(product.lowestPriceCents);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
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
      if (!json.success || !json.data) {
        return;
      }
      const p = json.data as {
        id: string;
        name: string;
        slug: string;
        vendorId: string;
        images: { url: string; blurHash: string | null }[];
        weightGrams: number;
        stock: number;
        priceTiers: {
          minQty: number;
          maxQty: number | null;
          priceCents: number;
        }[];
      };
      if (p.stock <= 0) {
        return;
      }
      const cartInput: CartItemInput = {
        productId: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images[0] ?? null,
        weightGrams: p.weightGrams,
        vendorId: p.vendorId,
        priceTiers: p.priceTiers,
      };
      const qty = Math.min(quantity, p.stock);
      addItem(cartInput, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
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
            {product.weightGrams} g
          </p>
          <p className="mt-1 text-sm font-semibold">From Rs. {priceDisplay}</p>
        </CardContent>
      </Link>
      <div
        className="border-t px-3 py-2"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="flex items-center gap-2">
          <QuantitySelector
            quantity={quantity}
            min={1}
            onChange={setQuantity}
          />
          <Button
            size="sm"
            className="flex-1 shrink-0"
            onClick={handleAddToCart}
            disabled={adding || added}
          >
            {adding ? '…' : added ? 'Added' : 'Add'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
