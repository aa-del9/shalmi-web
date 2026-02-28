'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { useCartStore } from '@/modules/cart/stores/cart-store';
import { resolvePrice, formatPrice } from '@/modules/cart/utils/resolve-price';
import { QuantitySelector } from '../quantity-selector';
import type { CartItem } from '../../types';

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const unitPrice = resolvePrice(item.priceTiers, item.quantity);
  const lineTotal = unitPrice * item.quantity;

  return (
    <div className="flex gap-4 py-4">
      <Link
        href={`/products/${item.slug}`}
        className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-lg sm:size-24"
      >
        {item.image ? (
          <Image
            src={item.image.url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-muted-foreground text-xs">No image</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-1">
          <Link
            href={`/products/${item.slug}`}
            className="text-sm font-medium hover:underline sm:text-base"
          >
            {item.name}
          </Link>
          <p className="text-muted-foreground text-xs">
            {item.weightGrams}g &middot; {formatPrice(unitPrice)}/pc
          </p>
        </div>

        <div className="flex items-center gap-4">
          <QuantitySelector
            quantity={item.quantity}
            min={1}
            onChange={(qty) => updateQuantity(item.productId, qty)}
          />

          <p className="w-24 text-right text-sm font-semibold">
            {formatPrice(lineTotal)}
          </p>

          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive size-8"
            onClick={() => removeItem(item.productId)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
