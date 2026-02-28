'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { useCartStore } from '@/modules/cart/stores/cart-store';
import type { CartItemInput } from '../../types';

interface AddToCartButtonProps {
  product: CartItemInput;
  quantity: number;
  stock: number;
}

export function AddToCartButton({
  product,
  quantity,
  stock,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const outOfStock = stock <= 0;

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleAdd}
      disabled={outOfStock || added}
    >
      {outOfStock ? (
        'Out of Stock'
      ) : added ? (
        <>
          <Check className="mr-2 size-4" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 size-4" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
