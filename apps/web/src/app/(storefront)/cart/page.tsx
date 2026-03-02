'use client';

import Link from 'next/link';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Separator } from '@repo/ui/components/separator';
import { useCartStore } from '@/modules/cart/stores/cart-store';
import { CartItemRow } from '@/modules/cart/components/cart-item-row';
import { CartSummary } from '@/modules/cart/components/cart-summary';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Shopping Cart</h1>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCart}>
            Clear Cart
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <ShoppingCart className="text-muted-foreground size-16" />
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="text-muted-foreground text-center">
            Explore our products and add items to your cart.
          </p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 size-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="divide-y">
              {items.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))}
            </div>
            <Separator className="mt-4" />
            <div className="mt-4">
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 size-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
          <div>
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  );
}
