'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent } from '@repo/ui/components/card';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const displayId = searchParams.get('displayId');

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16">
      <div className="bg-green-100 flex size-20 items-center justify-center rounded-full">
        <CheckCircle2 className="size-10 text-green-600" />
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight">
        Order Placed Successfully!
      </h1>

      <p className="text-muted-foreground mt-2 text-center">
        Thank you for your order. We&apos;ll process it right away.
      </p>

      {displayId && (
        <Card className="mt-6 w-full">
          <CardContent className="flex items-center gap-3 p-4">
            <Package className="text-muted-foreground size-5" />
            <div>
              <p className="text-muted-foreground text-xs">Order ID</p>
              <p className="font-mono text-lg font-bold">{displayId}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
