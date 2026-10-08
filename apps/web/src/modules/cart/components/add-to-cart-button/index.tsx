'use client';

import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@repo/ui/components/button';
import { useCartStore } from '@/modules/cart/stores/cart-store';
import type { CartItemInput } from '../../types';

interface AddToCartButtonProps {
  product: CartItemInput;
  /** Number of packs to add (counts in packs of `selectedPackQty`). */
  packQuantity: number;
  /** Stock in packs. */
  stock: number;
  className?: string;
}

export function AddToCartButton({
  product,
  packQuantity,
  stock,
  className,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);

  const outOfStock = stock <= 0;

  function handleAdd() {
    addItem(product, packQuantity);
    toast.success('Added to cart');
  }

  return (
    <Button
      size="lg"
      className={className ?? 'w-full'}
      onClick={handleAdd}
      disabled={outOfStock}
    >
      {outOfStock ? (
        'Out of Stock'
      ) : (
        <>
          <ShoppingCart className="mr-2 size-4" />
          Add to cart
        </>
      )}
    </Button>
  );
}
