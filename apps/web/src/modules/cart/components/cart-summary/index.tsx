'use client';

import Link from 'next/link';
import { Button } from '@repo/ui/components/button';
import { Separator } from '@repo/ui/components/separator';
import {
  useCartStore,
  getCartTotalItems,
  getCartTotalPrice,
} from '@/modules/cart/stores/cart-store';
import { formatPrice } from '@/modules/cart/utils/resolve-price';
import { useSession } from '@/modules/auth/client/auth-client';
import { useModalStore } from '@/modules/core/stores/modal-store';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

export function CartSummary() {
  const { data: session, isPending: sessionLoading } = useSession();
  const openAuthModal = useModalStore((s) => s.openAuthModal);
  const items = useCartStore((s) => s.items);
  const totalItems = getCartTotalItems(items);
  const totalPrice = getCartTotalPrice(items);

  if (items.length === 0) return null;

  const isAuthenticated = Boolean(session?.user);

  return (
    <div className="bg-muted/50 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Order Summary</h2>
      <Separator className="my-4" />
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Items ({totalItems})</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-muted-foreground">Calculated at checkout</span>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex justify-between text-base font-semibold">
        <span>Subtotal</span>
        <span>{formatPrice(totalPrice)}</span>
      </div>
      {isAuthenticated ? (
        <Button className="mt-6 w-full" size="lg" asChild>
          <Link href={ABSOLUTE_ROUTES.CHECKOUT}>Proceed to Checkout</Link>
        </Button>
      ) : (
        <Button
          className="mt-6 w-full"
          size="lg"
          onClick={() => openAuthModal(ABSOLUTE_ROUTES.CHECKOUT)}
          disabled={sessionLoading}
        >
          Proceed to Checkout
        </Button>
      )}
    </div>
  );
}
