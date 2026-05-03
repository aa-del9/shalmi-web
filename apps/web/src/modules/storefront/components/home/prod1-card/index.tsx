'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package as PackageIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@repo/ui/lib/utils';

import { useCartStore } from '@/modules/cart/stores/cart-store';
import type { CartItemInput, PackTier } from '@/modules/cart/types';
import {
  findDefaultTier,
  buildPackEyebrow,
} from '@/modules/cart/utils/pack-pricing';

import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import type { StorefrontProduct } from '@/modules/storefront/types';

interface Prod1CardProps {
  product: StorefrontProduct;
  badgeText?: string | null;
}

export function Prod1Card({ product, badgeText = null }: Prod1CardProps) {
  const firstImage = product.images[0];

  const addItem = useCartStore((s) => s.addItem);
  const [adding, setAdding] = useState(false);

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
    <article className="border-rule flex flex-col overflow-hidden rounded-[10px] border bg-white">
      <Link
        href={`/products/${product.slug}`}
        className="group flex flex-col"
        prefetch={false}
      >
        <div className="bg-paper-2 relative flex h-[200px] flex-col justify-between overflow-hidden p-3.5">
          {badgeText ? (
            <div className="flex items-start justify-between">
              <span className="bg-red rounded-xs px-2 py-1 font-mono text-[11px] font-bold text-white">
                {badgeText}
              </span>
              <span aria-hidden />
            </div>
          ) : null}

          <div className="flex flex-1 items-center justify-center">
            {firstImage ? (
              <div className="relative h-full w-full">
                <Image
                  src={firstImage.url}
                  alt={product.name}
                  fill
                  className="object-contain transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  {...(firstImage.blurHash
                    ? {
                        placeholder: 'blur',
                        blurDataURL: firstImage.blurHash,
                      }
                    : {})}
                />
              </div>
            ) : (
              <PackageIcon
                className="text-ink-4 size-16"
                aria-hidden
                strokeWidth={1.25}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 p-3.5">
          <h3 className="text-ink line-clamp-2 text-sm leading-snug font-bold">
            {product.name}
          </h3>
          <p className="text-ink-3 font-mono text-[10px] font-bold tracking-[0.08em] uppercase">
            {buildPackEyebrow({
              packWeightGrams: product.packWeightGrams,
              packSize: product.packSize,
              unitLabel: product.unitLabel,
            })}
          </p>
          <div className="flex items-end gap-2">
            <span className="text-ink font-mono text-lg font-extrabold">
              {formatRupeesFromCents(product.lowestPriceCents)}
            </span>
          </div>
        </div>
      </Link>

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
          {adding ? (
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
