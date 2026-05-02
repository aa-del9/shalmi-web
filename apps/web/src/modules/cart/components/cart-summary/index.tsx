'use client';

import Link from 'next/link';
import { ArrowRight, Truck } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import {
  useCartStore,
  getCartTotalPrice,
} from '@/modules/cart/stores/cart-store';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import { useSession } from '@/modules/auth/client/auth-client';
import { useModalStore } from '@/modules/core/stores/modal-store';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

interface CartSummaryProps {
  /** When true, omit the inline CTA + free-delivery hint (mobile uses sticky bar). */
  hideCta?: boolean;
}

/**
 * Order Summary card — Pencil receipt-style (paper-2 fill, 1.5px rule-2).
 *
 * Per buyer-cart gap-analysis:
 * - Q9 / Q27: rows are Subtotal / Delivery / TOTAL only ("Items (N)" removed).
 * - Q18 (GST DEFERRED): no GST row.
 * - Q19 (Delivery STUBBED): "Calculated at checkout" placeholder.
 * - Q17: three-piece composition — receipt card + standalone CTA + free-delivery caption.
 */
export function CartSummary({ hideCta = false }: CartSummaryProps) {
  const { data: session, isPending: sessionLoading } = useSession();
  const openAuthModal = useModalStore((s) => s.openAuthModal);
  const items = useCartStore((s) => s.items);
  const totalPrice = getCartTotalPrice(items);

  if (items.length === 0) return null;

  const isAuthenticated = Boolean(session?.user);

  return (
    <div className="space-y-4">
      <div className="rounded-md border-[1.5px] border-rule-2 bg-paper-2 p-5">
        <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink-3">
          ORDER SUMMARY
        </h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-3">Subtotal</span>
            <span className="font-mono text-ink">
              {formatRupeesFromCents(totalPrice)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-3">Delivery</span>
            <span className="text-ink-3">Calculated at checkout</span>
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t-[1.5px] border-rule-2 pt-4">
          <span className="font-mono text-sm font-bold uppercase tracking-[0.12em] text-ink">
            TOTAL
          </span>
          <span className="font-mono text-lg font-extrabold text-ink">
            {formatRupeesFromCents(totalPrice)}
          </span>
        </div>
      </div>

      {hideCta ? null : (
        <>
          {isAuthenticated ? (
            <Button className="h-12 w-full" size="lg" asChild>
              <Link href={ABSOLUTE_ROUTES.CHECKOUT}>
                Proceed to checkout
                <ArrowRight className="ml-1 size-4" aria-hidden />
              </Link>
            </Button>
          ) : (
            <Button
              className="h-12 w-full"
              size="lg"
              onClick={() => openAuthModal(ABSOLUTE_ROUTES.CHECKOUT)}
              disabled={sessionLoading}
            >
              Proceed to checkout
              <ArrowRight className="ml-1 size-4" aria-hidden />
            </Button>
          )}

          <p className="flex items-center justify-center gap-1.5 font-mono text-[11px] text-ink-3">
            <Truck className="size-3.5" aria-hidden />
            Free delivery on orders over Rs. 50,000
          </p>
        </>
      )}
    </div>
  );
}
