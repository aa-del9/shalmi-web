'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Package as PackageIcon, X } from 'lucide-react';
import { useCartStore, getCartLineSubtotal } from '@/modules/cart/stores/cart-store';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import {
  buildSelectedPackBadge,
  formatPackWeightCaption,
  resolvePerPackPrice,
} from '@/modules/cart/utils/pack-pricing';
import { QuantitySelector } from '../quantity-selector';
import type { CartItem } from '../../types';

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const perPack = resolvePerPackPrice(item.packTiers, item.selectedPackQty);
  const lineTotal = getCartLineSubtotal(item);
  const packBadge = buildSelectedPackBadge(item.selectedPackQty);

  const eyebrowParts: string[] = [];
  if (item.vendorName) eyebrowParts.push(item.vendorName.toUpperCase());
  eyebrowParts.push(formatPackWeightCaption(item.packWeightGrams));
  const eyebrowDesktop = packBadge
    ? `${eyebrowParts.join(' · ')} · ${packBadge}`
    : eyebrowParts.join(' · ');
  const eyebrowMobile = eyebrowParts.join(' · ');

  return (
    <div className="flex gap-4 border-b border-rule py-4 last:border-b-0">
      {/* Image (inert per gap-analysis Q6) */}
      <div className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-paper-2 sm:size-20">
        {item.image ? (
          <Image
            src={item.image.url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <PackageIcon
              className="size-8 text-ink-4"
              aria-hidden
              strokeWidth={1.25}
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 space-y-1">
          <Link
            href={`/products/${item.slug}`}
            className="line-clamp-2 text-sm font-bold text-ink no-underline hover:no-underline sm:text-base"
            prefetch={false}
          >
            {item.name}
          </Link>
          <p className="hidden font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-ink-3 sm:block">
            {eyebrowDesktop}
          </p>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-ink-3 sm:hidden">
            {eyebrowMobile}
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <QuantitySelector
            quantity={item.quantity}
            min={1}
            onChange={(qty) => updateQuantity(item.productId, qty)}
            size="sm"
            className="sm:hidden"
          />
          <QuantitySelector
            quantity={item.quantity}
            min={1}
            onChange={(qty) => updateQuantity(item.productId, qty)}
            size="md"
            className="hidden sm:inline-flex"
          />

          {/* Per-pack price column — desktop only per gap-analysis Q23 */}
          <p className="hidden w-24 text-right font-mono text-[13px] text-ink-3 sm:block">
            {formatRupeesFromCents(perPack)}
          </p>

          <p className="w-24 text-right font-mono text-[15px] font-extrabold text-ink">
            {formatRupeesFromCents(lineTotal)}
          </p>

          {/* Remove icon — desktop only per gap-analysis Q24 + Q7 */}
          <button
            type="button"
            className="hidden size-8 items-center justify-center rounded-sm text-ink-3 hover:text-ink sm:inline-flex"
            onClick={() => removeItem(item.productId)}
            aria-label="Remove item"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
