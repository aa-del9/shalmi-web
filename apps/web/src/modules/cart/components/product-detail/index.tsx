'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';

import { useCartStore } from '@/modules/cart/stores/cart-store';
import {
  computeSavings,
  findDefaultTier,
  resolvePerPackPrice,
  sortPackTiers,
} from '@/modules/cart/utils/pack-pricing';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';

import { AddToCartButton } from '../add-to-cart-button';
import { QuantitySelector } from '../quantity-selector';

import { PdpBreadcrumb } from '../pdp/pdp-breadcrumb';
import { BundleSelector } from '../pdp/bundle-selector';
import { PdpDeliveryCard } from '../pdp/pdp-delivery-card';
import { PdpSpecSection } from '../pdp/pdp-spec-section';
import { PdpMobileStickyBar } from '../pdp/pdp-mobile-sticky-bar';
import { PdpYmalRail } from '../pdp/pdp-ymal-rail';

import type { ProductImageRecord } from '@repo/database';
import type { CartItemInput, PackTier } from '../../types';

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    vendorId: string;
    vendorName: string | null;
    images: ProductImageRecord[];
    packWeightGrams: number;
    packSize: number;
    unitWeightGrams: number | null;
    unitLabel: string | null;
    packMrpCents: number | null;
    packWholesalePriceCents: number;
    pricePerUnitCents: number | null;
    stock: number;
    packTiers: PackTier[];
    primaryCategory: { id: string; name: string; slug: string } | null;
  };
}

function formatTitleEyebrow(packSize: number, unitWeightGrams: number | null) {
  // Per gap-analysis Q2: computed at render from packSize + unitWeightGrams.
  if (packSize <= 1 || !unitWeightGrams) return null;
  return `(${packSize} × ${unitWeightGrams}g)`;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const sortedTiers = useMemo(
    () => sortPackTiers(product.packTiers),
    [product.packTiers]
  );

  const initialTier = useMemo(
    () => findDefaultTier(sortedTiers),
    [sortedTiers]
  );

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedPackQty, setSelectedPackQty] = useState(
    initialTier?.packQty ?? sortedTiers[0]?.packQty ?? 1
  );
  // Quantity is in PACKS of the selected bundle, per gap-analysis Q13.
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((s) => s.addItem);

  const currentImage = product.images[selectedImage];
  const pricePerPackCents = resolvePerPackPrice(sortedTiers, selectedPackQty);
  const savings = computeSavings(product.packMrpCents, pricePerPackCents);
  const titleEyebrow = formatTitleEyebrow(
    product.packSize,
    product.unitWeightGrams
  );
  const outOfStock = product.stock <= 0;

  const cartInput: CartItemInput = {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    image: product.images[0] ?? null,
    packWeightGrams: product.packWeightGrams,
    packSize: product.packSize,
    unitLabel: product.unitLabel,
    vendorId: product.vendorId,
    vendorName: product.vendorName ?? '',
    packTiers: product.packTiers,
    selectedPackQty,
  };

  function selectPackQty(packQty: number) {
    setSelectedPackQty(packQty);
    // Per gap-analysis Q13: changing the bundle resets quantity to 1.
    setQuantity(1);
  }

  function handleAddToCart() {
    if (outOfStock) return;
    addItem(cartInput, quantity);
    toast.success('Added to cart');
  }

  function handleWishlistClick() {
    // Per gap-analysis Q14 STUBBED: wishlist deferred. Click is a no-op
    // marker for the future feature.
    // TODO(post-v1): wire to /api/user/wishlist when wishlist ships.
    toast.info('Save to wishlist coming soon');
  }

  return (
    <>
      <PdpBreadcrumb
        category={product.primaryCategory}
        productName={product.name}
        className="mb-4"
      />

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Left: image gallery */}
        <div className="space-y-3">
          <div className="bg-paper-2 relative aspect-square overflow-hidden rounded-md">
            {currentImage ? (
              <Image
                src={currentImage.url}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                placeholder={currentImage.blurHash ? 'blur' : 'empty'}
                blurDataURL={currentImage.blurHash ?? undefined}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-ink-3">No image available</span>
              </div>
            )}
          </div>

          {/* Thumb strip — desktop only per gap-analysis Q22. */}
          {product.images.length > 1 && (
            <div className="hidden gap-2 overflow-x-auto md:flex">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    'bg-paper-2 relative size-16 shrink-0 overflow-hidden rounded-sm border-2 transition-colors',
                    idx === selectedImage
                      ? 'border-ink'
                      : 'border-rule hover:border-ink-3'
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

        {/* Right: info column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">
              {product.name}
              {titleEyebrow ? (
                <span className="ml-1 text-ink-3 font-normal">
                  {titleEyebrow}
                </span>
              ) : null}
            </h1>
          </div>

          {/* Price block */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-3xl font-extrabold text-ink md:text-4xl">
                {formatRupeesFromCents(pricePerPackCents)}
              </span>
              {product.packMrpCents ? (
                <span className="font-mono text-base text-ink-3 line-through">
                  {formatRupeesFromCents(product.packMrpCents)}
                </span>
              ) : null}
              {savings ? (
                <span className="rounded-xs bg-green-bg px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-green-700">
                  SAVE {formatRupeesFromCents(savings.saveCents)} ({savings.percent}%)
                </span>
              ) : null}
            </div>
            {product.pricePerUnitCents ? (
              <p className="text-sm text-ink-3">
                Per unit:{' '}
                <span className="font-mono text-ink-2">
                  {formatRupeesFromCents(product.pricePerUnitCents)}
                </span>
              </p>
            ) : null}
          </div>

          {/* Bundle selector */}
          <BundleSelector
            tiers={sortedTiers}
            selectedPackQty={selectedPackQty}
            onSelect={selectPackQty}
          />

          {/* Qty + Add-to-cart row (desktop). Hidden on mobile (sticky bar). */}
          <div className="hidden items-center gap-3 md:flex">
            <QuantitySelector
              quantity={quantity}
              min={1}
              max={product.stock > 0 ? product.stock : undefined}
              onChange={setQuantity}
              size="lg"
            />
            <AddToCartButton
              product={cartInput}
              packQuantity={quantity}
              stock={product.stock}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11"
              aria-label="Save to wishlist"
              onClick={handleWishlistClick}
            >
              <Heart className="size-5" aria-hidden />
            </Button>
          </div>

          {/* Spec + Delivery cards on desktop next to info; on mobile they
              flow below. */}
          <PdpDeliveryCard />
          <PdpSpecSection
            vendorName={product.vendorName}
            packSize={product.packSize}
            packWeightGrams={product.packWeightGrams}
            unitWeightGrams={product.unitWeightGrams}
            unitLabel={product.unitLabel}
          />
        </div>
      </div>

      <div className="mt-12 md:mt-16">
        <PdpYmalRail slug={product.slug} />
      </div>

      {/* Mobile sticky add-to-cart bar; reserve room with body padding. */}
      <div aria-hidden className="h-20 md:hidden" />
      <PdpMobileStickyBar
        quantity={quantity}
        min={1}
        max={product.stock > 0 ? product.stock : undefined}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        disabled={outOfStock}
        ctaLabel={outOfStock ? 'Out of Stock' : 'Add to cart'}
      />
    </>
  );
}
