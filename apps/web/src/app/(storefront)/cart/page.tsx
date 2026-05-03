'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import {
  useCartStore,
  getCartTotalItems,
  getCartTotalPrice,
  getCartTotalWeightGrams,
} from '@/modules/cart/stores/cart-store';
import { useSession } from '@/modules/auth/client/auth-client';
import { useModalStore } from '@/modules/core/stores/modal-store';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import { CartItemRow } from '@/modules/cart/components/cart-item-row';
import { CartSummary } from '@/modules/cart/components/cart-summary';
import { WeightGauge } from '@/modules/cart/components/weight-gauge';
import { HelpBanner } from '@/modules/cart/components/help-banner';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalItems = getCartTotalItems(items);
  const totalPrice = getCartTotalPrice(items);
  const totalWeightGrams = getCartTotalWeightGrams(items);
  const { data: session, isPending: sessionLoading } = useSession();
  const openAuthModal = useModalStore((s) => s.openAuthModal);

  function handleMobileCheckout() {
    if (session?.user) {
      router.push(ABSOLUTE_ROUTES.CHECKOUT);
    } else {
      openAuthModal(ABSOLUTE_ROUTES.CHECKOUT);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1360px] px-4 py-8 md:px-10">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <ShoppingCart className="text-ink-3 size-16" aria-hidden />
          <h2 className="text-xl font-bold text-ink">Your cart is empty</h2>
          <p className="text-center text-ink-3">
            Explore our products and add items to your cart.
          </p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 size-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-[1360px] px-4 py-6 md:px-10 md:py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-ink md:text-3xl">
            Your cart
            <span className="ml-2 font-mono text-sm font-normal text-ink-3 md:text-base">
              · {totalItems} <span className="hidden md:inline">items</span>
            </span>
          </h1>
          <button
            type="button"
            className="hidden items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink md:inline-flex"
            onClick={clearCart}
          >
            <Trash2 className="size-3.5" aria-hidden />
            Clear cart
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-3">
          <WeightGauge weightGrams={totalWeightGrams} />
          <HelpBanner weightGrams={totalWeightGrams} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-md border border-rule bg-white">
            <div className="px-5">
              {items.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <CartSummary />
          </div>
        </div>

        {/* Mobile: stacked summary card without inline CTA — sticky bar covers it. */}
        <div className="mt-6 lg:hidden">
          <CartSummary hideCta />
        </div>

        {/* Reserve room for mobile sticky bar */}
        <div aria-hidden className="h-20 lg:hidden" />
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-rule bg-paper px-4 py-3 lg:hidden">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-3">
            TOTAL
          </p>
          <p className="font-mono text-base font-extrabold text-ink">
            {formatRupeesFromCents(totalPrice)}
          </p>
        </div>
        <Button
          type="button"
          className="h-11 px-5"
          onClick={handleMobileCheckout}
          disabled={sessionLoading}
        >
          Checkout
          <ArrowRight className="ml-1 size-4" aria-hidden />
        </Button>
      </div>
    </>
  );
}
