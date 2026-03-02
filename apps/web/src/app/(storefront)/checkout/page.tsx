'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent } from '@repo/ui/components/card';
import { Separator } from '@repo/ui/components/separator';
import { useSession } from '@/modules/auth/client/auth-client';
import {
  useCartStore,
  getCartTotalItems,
  getCartTotalPrice,
} from '@/modules/cart/stores/cart-store';
import { resolvePrice, formatPrice } from '@/modules/cart/utils/resolve-price';
import { DeliveryAddressSection } from '@/modules/checkout/components/delivery-address-section';
import {
  checkoutShippingFormSchema,
  type CheckoutShippingFormData,
} from '@/modules/checkout/schemas';
import { useAddressesQuery } from '@/modules/user-addresses/hooks/use-addresses-query';

const defaultShippingValues: CheckoutShippingFormData = {
  name: '',
  phone: '',
  address: '',
  city: '',
};

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
  const [useDifferentAddress, setUseDifferentAddress] = useState(false);

  const shippingForm = useForm<CheckoutShippingFormData>({
    resolver: zodResolver(checkoutShippingFormSchema),
    defaultValues: defaultShippingValues,
  });

  const { data: addressesList } = useAddressesQuery();
  const hasSavedAddresses = (addressesList?.length ?? 0) > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user?.name) {
      shippingForm.setValue('name', session.user.name);
    }
  }, [session?.user?.name, shippingForm]);

  useEffect(() => {
    if (
      mounted &&
      !sessionLoading &&
      hasSavedAddresses &&
      !useDifferentAddress
    ) {
      const defaultAddr =
        addressesList?.find((a) => a.isDefault) ?? addressesList?.[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
    }
  }, [
    mounted,
    sessionLoading,
    hasSavedAddresses,
    useDifferentAddress,
    addressesList,
  ]);

  useEffect(() => {
    if (mounted && !sessionLoading && !session?.user) {
      router.push('/auth?redirect=/checkout');
    }
  }, [mounted, sessionLoading, session?.user, router]);

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push('/cart');
    }
  }, [mounted, items.length, router]);

  const handlePlaceOrder = shippingForm.handleSubmit(async () => {
    const useManualForm = useDifferentAddress || !hasSavedAddresses;

    if (!useManualForm && !selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    setSubmitting(true);
    try {
      const payload = useManualForm
        ? {
            items: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
            shippingAddress: shippingForm.getValues(),
          }
        : {
            items: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
            addressId: selectedAddressId,
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
  });

  if (!mounted || sessionLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user || items.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/cart">
            <ArrowLeft className="mr-2 size-4" />
            Back to Cart
          </Link>
        </Button>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Checkout</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DeliveryAddressSection
            selectedAddressId={selectedAddressId}
            onSelectAddress={setSelectedAddressId}
            useDifferentAddress={useDifferentAddress}
            onUseDifferentAddress={setUseDifferentAddress}
            shippingForm={shippingForm}
          />

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">
                Order Items ({totalItems})
              </h2>
              <div className="divide-y">
                {items.map((item) => {
                  const unitPrice = resolvePrice(
                    item.priceTiers,
                    item.quantity
                  );
                  return (
                    <div key={item.productId} className="flex gap-3 py-3">
                      <div className="bg-muted relative size-14 shrink-0 overflow-hidden rounded-md">
                        {item.image ? (
                          <Image
                            src={item.image.url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-muted-foreground text-[10px]">
                              No img
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {item.quantity} × {formatPrice(unitPrice)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatPrice(unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Items ({totalItems})
                  </span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">TBD</span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              <div className="mt-4 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
                <strong>Cash on Delivery</strong> — Pay when your order
                arrives.
              </div>

              <Button
                className="mt-4 w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order (COD)'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
