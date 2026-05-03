'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@repo/ui/components/button';
import { Spinner } from '@repo/ui/components/spinner';
import { useSession } from '@/modules/auth/client/auth-client';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import {
  useCartStore,
  getCartTotalItems,
  getCartTotalPrice,
  getCartLineSubtotal,
} from '@/modules/cart/stores/cart-store';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import { resolvePerPackPrice } from '@/modules/cart/utils/pack-pricing';
import { DeliveryAddressSection } from '@/modules/checkout/components/delivery-address-section';
import { RiderInstructionsSection } from '@/modules/checkout/components/rider-instructions-section';
import {
  PaymentSelector,
  type PaymentMethod,
} from '@/modules/checkout/components/payment-selector';
import { useAddressesQuery } from '@/modules/user-addresses/hooks/use-addresses-query';
import { cn } from '@repo/ui/lib/utils';

const ITEM_PREVIEW_LIMIT = 3;

function StepIndicator({ active }: { active: 'cart' | 'checkout' | 'confirmation' }) {
  const steps: { id: typeof active; label: string }[] = [
    { id: 'cart', label: 'Cart' },
    { id: 'checkout', label: 'Checkout' },
    { id: 'confirmation', label: 'Confirmation' },
  ];
  return (
    <div className="hidden items-center gap-2 font-mono text-[13px] md:flex">
      {steps.map((s, i) => (
        <span key={s.id} className="inline-flex items-center gap-2">
          <span
            className={cn(
              s.id === active
                ? 'font-extrabold text-ink'
                : 'font-normal text-ink-3'
            )}
          >
            {s.label}
          </span>
          {i < steps.length - 1 ? (
            <ChevronRight className="size-3.5 text-ink-4" aria-hidden />
          ) : null}
        </span>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalItems = getCartTotalItems(items);
  const totalPrice = getCartTotalPrice(items);

  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [riderNotes, setRiderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  const { data: addressesList } = useAddressesQuery();
  const hasSavedAddresses = (addressesList?.length ?? 0) > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && hasSavedAddresses && !selectedAddressId) {
      const defaultAddr =
        addressesList?.find((a) => a.isDefault) ?? addressesList?.[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    }
  }, [mounted, hasSavedAddresses, selectedAddressId, addressesList]);

  useEffect(() => {
    if (mounted && !sessionLoading && !session?.user) {
      router.push(
        `${ABSOLUTE_ROUTES.AUTH}?redirect=${encodeURIComponent(ABSOLUTE_ROUTES.CHECKOUT)}`
      );
    }
  }, [mounted, sessionLoading, session?.user, router]);

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push('/cart');
    }
  }, [mounted, items.length, router]);

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedPackQty: item.selectedPackQty,
        })),
        addressId: selectedAddressId,
        riderNotes: riderNotes.trim() === '' ? null : riderNotes.trim(),
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to place order');
        return;
      }

      clearCart();
      router.push(
        `/checkout/success?orderId=${data.data.orderId}&displayId=${data.data.displayId}`
      );
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted || sessionLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!session?.user || items.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  const previewItems = items.slice(0, ITEM_PREVIEW_LIMIT);
  const overflowCount = items.length - previewItems.length;

  return (
    <>
      <div className="mx-auto max-w-[1360px] px-4 py-6 md:px-10 md:py-8">
        {/* Mobile chevron + step row */}
        <div className="mb-4 flex items-center justify-between md:mb-6">
          <Link
            href="/cart"
            className="inline-flex size-9 items-center justify-center rounded-sm text-ink-3 hover:text-ink md:hidden"
            aria-label="Back to cart"
            prefetch={false}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Link>
          <StepIndicator active="checkout" />
          <span aria-hidden className="md:hidden" />
        </div>

        <h1 className="mb-6 text-2xl font-extrabold text-ink md:text-3xl">
          Checkout
        </h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <DeliveryAddressSection
              selectedAddressId={selectedAddressId}
              onSelectAddress={setSelectedAddressId}
            />
            <RiderInstructionsSection
              value={riderNotes}
              onChange={setRiderNotes}
            />
            <PaymentSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
            />
          </div>

          {/* Right column: order summary + place order CTA */}
          <div className="space-y-4">
            <div className="rounded-md border-[1.5px] border-rule-2 bg-paper-2 p-5">
              <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink-3">
                ORDER SUMMARY · {totalItems} items
              </h2>

              {/* Compact item list (desktop only). */}
              <div className="mt-4 hidden space-y-3 lg:block">
                {previewItems.map((item) => {
                  const perPack = resolvePerPackPrice(
                    item.packTiers,
                    item.selectedPackQty
                  );
                  const packLabel = item.quantity === 1 ? 'pack' : 'packs';
                  return (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="bg-white relative size-10 shrink-0 overflow-hidden rounded-sm border border-rule">
                        {item.image ? (
                          <Image
                            src={item.image.url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <Package
                            className="absolute inset-0 m-auto size-5 text-ink-4"
                            aria-hidden
                            strokeWidth={1.5}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-xs font-bold text-ink">
                          {item.name}
                        </p>
                        <p className="font-mono text-[10px] text-ink-3">
                          {formatRupeesFromCents(perPack)} × {item.quantity}{' '}
                          {packLabel}
                        </p>
                      </div>
                      <p className="font-mono text-xs font-bold text-ink">
                        {formatRupeesFromCents(perPack * item.quantity)}
                      </p>
                    </div>
                  );
                })}
                {overflowCount > 0 ? (
                  <p className="font-mono text-[10px] text-ink-3">
                    + {overflowCount} more items
                  </p>
                ) : null}
              </div>

              {/* Mobile: per-line list with totals */}
              <div className="mt-4 space-y-2 lg:hidden">
                {items.map((item) => {
                  const perPack = resolvePerPackPrice(
                    item.packTiers,
                    item.selectedPackQty
                  );
                  const packLabel = item.quantity === 1 ? 'pack' : 'packs';
                  return (
                    <div
                      key={item.productId}
                      className="flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-ink-2">{item.name}</p>
                        <p className="font-mono text-[10px] text-ink-3">
                          {formatRupeesFromCents(perPack)} × {item.quantity}{' '}
                          {packLabel}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-ink">
                        {formatRupeesFromCents(getCartLineSubtotal(item))}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 space-y-2 text-sm">
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

            {/* Desktop CTA + secure note (mobile uses sticky bar) */}
            <div className="hidden space-y-2 lg:block">
              <Button
                className="h-[51px] w-full text-base font-bold"
                onClick={handlePlaceOrder}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Placing order…
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 size-4" aria-hidden />
                    Place order
                  </>
                )}
              </Button>
              <p className="flex items-center justify-center gap-1.5 font-mono text-[11px] text-ink-3">
                <ShieldCheck className="size-3.5" aria-hidden />
                Secure checkout · Order ID generated on confirm
              </p>
            </div>
          </div>
        </div>

        <div aria-hidden className="h-20 lg:hidden" />
      </div>

      {/* Mobile sticky CTA bar */}
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
          onClick={handlePlaceOrder}
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Lock className="mr-1.5 size-4" aria-hidden />
              Place order
            </>
          )}
        </Button>
      </div>
    </>
  );
}
