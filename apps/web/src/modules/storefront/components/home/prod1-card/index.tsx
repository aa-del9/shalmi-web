'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package as PackageIcon, Plus } from 'lucide-react';

import { cn } from '@repo/ui/lib/utils';

import { useCartStore } from '@/modules/cart/stores/cart-store';
import type { CartItemInput } from '@/modules/cart/types';

import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import type { StorefrontProduct } from '@/modules/storefront/types';

interface Prod1CardProps {
  product: StorefrontProduct;
  /** Optional pencil eyebrow override ("HOT", "-12%"). Hidden in Batch 1
   *  by default — schema for list/sale price + isTrending lands in Batch 3/4. */
  badgeText?: string | null;
  /** Override eyebrow above name ("TAPAL", "DALDA"). Until brand schema
   *  ships, vendors → eyebrow when supplied; otherwise "SHALMI WAREHOUSE". */
  vendorEyebrow?: string | null;
}

const DEFAULT_VENDOR_EYEBROW = 'SHALMI WAREHOUSE';

function buildPackEyebrow(weightGrams: number): string {
  // Pencil shows pack metadata like "950 G · CARTON × 12". The full pack
  // model lands with the Batch 3 pack-pricing migration (gap-analysis Q11
  // STUBBED). For Batch 1 we render only what we have today: weight in
  // grams or kg, with a generic "PACK" suffix.
  // TODO(post-v1): fold in pack size + packagingUnit once schema lands.
  if (weightGrams >= 1000) {
    const kg = Math.round((weightGrams / 1000) * 10) / 10;
    return `${kg} KG · PACK`;
  }
  return `${weightGrams} G · PACK`;
}

export function Prod1Card({
  product,
  badgeText = null,
  vendorEyebrow = null,
}: Prod1CardProps) {
  const firstImage = product.images[0];
  const addItem = useCartStore((s) => s.addItem);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (adding) return;
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
        images: { url: string; blurHash: string | null }[];
        weightGrams: number;
        stock: number;
        priceTiers: {
          minQty: number;
          maxQty: number | null;
          priceCents: number;
        }[];
      };
      if (p.stock <= 0) return;
      const cartInput: CartItemInput = {
        productId: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images[0] ?? null,
        weightGrams: p.weightGrams,
        vendorId: p.vendorId,
        priceTiers: p.priceTiers,
      };
      addItem(cartInput, 1);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1500);
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-[10px] border border-rule bg-white">
      <Link
        href={`/products/${product.slug}`}
        className="group flex flex-col"
        prefetch={false}
      >
        {/* Image / placeholder area */}
        <div className="relative flex h-[200px] flex-col justify-between overflow-hidden bg-paper-2 p-3.5">
          {/* Top row: discount badge (left) + heart (right). Both hidden
              in Batch 1 — wishlist DEFERRED (Q12), discount needs list-vs-
              sale price (Q11 → pack-pricing Batch 3). */}
          {badgeText ? (
            <div className="flex items-start justify-between">
              <span className="rounded-xs bg-red px-2 py-1 font-mono text-[11px] font-bold text-white">
                {badgeText}
              </span>
              <span aria-hidden />
            </div>
          ) : null}

          {/* Centered package glyph or product image */}
          <div className="flex flex-1 items-center justify-center">
            {firstImage ? (
              <div className="relative h-full w-full">
                <Image
                  src={firstImage.url}
                  alt={product.name}
                  fill
                  className="object-contain transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ) : (
              <PackageIcon
                className="size-16 text-ink-4"
                aria-hidden
                strokeWidth={1.25}
              />
            )}
          </div>

          {/* Bottom: vendor / brand eyebrow */}
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-ink-3">
            {vendorEyebrow ?? DEFAULT_VENDOR_EYEBROW}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-2 p-3.5">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink">
            {product.name}
          </h3>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink-3">
            {buildPackEyebrow(product.weightGrams)}
          </p>
          <div className="flex items-end gap-2">
            <span className="font-mono text-lg font-extrabold text-ink">
              {formatRupeesFromCents(product.lowestPriceCents)}
            </span>
            {/* TODO(post-v1): show strikethrough list price once pack
                pricing migration lands (gap-analysis Q11). */}
          </div>
        </div>
      </Link>

      {/* Add button */}
      <div className="px-3.5 pb-3.5">
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding}
          className={cn(
            'inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-sm font-sans text-[13px] font-bold text-white transition-colors',
            'bg-[#16A34A] hover:bg-green-700 active:bg-green-900',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
        >
          {added ? (
            'Added'
          ) : adding ? (
            '…'
          ) : (
            <>
              <Plus className="size-3.5" aria-hidden strokeWidth={3} />
              Add
            </>
          )}
        </button>
      </div>
    </article>
  );
}
