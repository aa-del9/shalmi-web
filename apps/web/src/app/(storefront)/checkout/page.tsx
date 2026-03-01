'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Card, CardContent } from '@repo/ui/components/card';
import { Separator } from '@repo/ui/components/separator';
import { useSession } from '@/modules/auth/client/auth-client';
import {
  useCartStore,
  getCartTotalItems,
  getCartTotalPrice,
} from '@/modules/cart/stores/cart-store';
import { resolvePrice, formatPrice } from '@/modules/cart/utils/resolve-price';

interface ShippingForm {
  name: string;
  phone: string;
  address: string;
  city: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalItems = getCartTotalItems(items);
  const totalPrice = getCartTotalPrice(items);

  const [form, setForm] = useState<ShippingForm>({
    name: '',
    phone: '',
    address: '',
    city: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || session.user.name || '',
      }));
    }
  }, [session?.user]);

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

  function updateField(field: keyof ShippingForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm(): boolean {
    if (!form.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (!form.phone.trim() || form.phone.trim().length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    if (!form.address.trim()) {
      toast.error('Please enter your address');
      return false;
    }
    if (!form.city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    return true;
  }

  async function handlePlaceOrder() {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: form,
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
        {/* Shipping form */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="size-5" />
                <h2 className="text-lg font-semibold">Shipping Address</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Enter your full address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order items review */}
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

        {/* Order summary */}
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
                <strong>Cash on Delivery</strong> — Pay when your order arrives.
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
