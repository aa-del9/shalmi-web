'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Package } from 'lucide-react';
import { Separator } from '@repo/ui/components/separator';
import { cn } from '@repo/ui/lib/utils';
import { AddToCartButton } from '../add-to-cart-button';
import { QuantitySelector } from '../quantity-selector';
import { resolvePrice, formatPrice } from '../../utils/resolve-price';
import type { ProductImageRecord } from '@repo/database';
import type { PriceTier, CartItemInput } from '../../types';

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    vendorId: string;
    images: ProductImageRecord[];
    weightGrams: number;
    stock: number;
    priceTiers: PriceTier[];
  };
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const sortedTiers = [...product.priceTiers].sort(
    (a, b) => a.minQty - b.minQty
  );
  const [selectedTierIdx, setSelectedTierIdx] = useState(0);
  const [quantity, setQuantity] = useState(sortedTiers[0]?.minQty ?? 1);

  const currentImage = product.images[selectedImage];
  const currentUnitPrice = resolvePrice(product.priceTiers, quantity);
  const lineTotal = currentUnitPrice * quantity;

  const lowestPrice = product.priceTiers.reduce(
    (min, t) => Math.min(min, t.priceCents),
    Infinity
  );

  const cartInput: CartItemInput = {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    image: product.images[0] ?? null,
    weightGrams: product.weightGrams,
    vendorId: product.vendorId,
    priceTiers: product.priceTiers,
  };

  function selectTier(idx: number) {
    const tier = sortedTiers[idx];
    if (!tier) return;
    setSelectedTierIdx(idx);
    setQuantity(tier.minQty);
  }

  function handleQuantityChange(qty: number) {
    setQuantity(qty);
    const matchIdx = sortedTiers.findIndex(
      (t) => qty >= t.minQty && (t.maxQty === null || qty <= t.maxQty)
    );
    if (matchIdx !== -1) setSelectedTierIdx(matchIdx);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Image gallery */}
      <div className="space-y-3">
        <div className="bg-muted relative aspect-square overflow-hidden rounded-xl">
          {currentImage ? (
            <Image
              src={currentImage.url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              placeholder={currentImage.blurHash ? 'blur' : 'empty'}
              blurDataURL={currentImage.blurHash ?? undefined}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground">No image available</span>
            </div>
          )}
        </div>

        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={cn(
                  'bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                  idx === selectedImage
                    ? 'border-primary'
                    : 'hover:border-muted-foreground/30 border-transparent'
                )}
              >
                <Image
                  src={img.url}
                  alt={`${product.name} ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {product.name}
          </h1>
          <p className="text-muted-foreground mt-1">{product.weightGrams}g</p>
          <p className="mt-3 text-2xl font-bold">
            {lowestPrice < Infinity ? (
              <>From {formatPrice(lowestPrice)}</>
            ) : (
              'Price unavailable'
            )}
          </p>
        </div>

        <Separator />

        {/* Bulk offerings */}
        {sortedTiers.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Package className="size-4" />
              <h3 className="text-sm font-semibold">Bulk Offerings</h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {sortedTiers.map((tier, idx) => {
                const isSelected = idx === selectedTierIdx;
                const totalForMin = tier.priceCents * tier.minQty;
                return (
                  <button
                    key={idx}
                    onClick={() => selectTier(idx)}
                    className={cn(
                      'flex flex-col rounded-lg border-2 p-3 text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5 ring-primary/20 ring-1'
                        : 'hover:border-muted-foreground/30 border-muted'
                    )}
                  >
                    <span className="text-sm font-semibold">
                      {tier.maxQty
                        ? `${tier.minQty} – ${tier.maxQty} pcs`
                        : `${tier.minQty}+ pcs`}
                    </span>
                    <span className="text-primary mt-1 text-lg font-bold">
                      {formatPrice(tier.priceCents)}
                      <span className="text-muted-foreground text-xs font-normal">
                        /pc
                      </span>
                    </span>
                    <span className="text-muted-foreground mt-0.5 text-xs">
                      {formatPrice(totalForMin)} for {tier.minQty} pcs
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity + total */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Qty:</span>
              <QuantitySelector
                quantity={quantity}
                min={1}
                max={product.stock > 0 ? product.stock : undefined}
                onChange={handleQuantityChange}
              />
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs">
                {formatPrice(currentUnitPrice)}/pc
              </p>
              <p className="text-lg font-bold">{formatPrice(lineTotal)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span
            className={cn(
              'size-2 rounded-full',
              product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
            )}
          />
          <span className="text-muted-foreground">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        <AddToCartButton
          product={cartInput}
          quantity={quantity}
          stock={product.stock}
        />
      </div>
    </div>
  );
}
