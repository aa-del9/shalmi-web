'use client';

import Link from 'next/link';
import { Search, ShoppingCart } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { useSession } from '@/modules/auth/client/auth-client';
import {
  useCartStore,
  getCartTotalItems,
} from '@/modules/cart/stores/cart-store';
import { APP_NAME } from '@/modules/core/constants/app-info';
import { AccountDrawer } from '@/modules/buyer-account-drawer';
import { AccountDrawerTrigger } from '@/modules/buyer-account-drawer/components/account-drawer-trigger';

export function StorefrontHeader() {
  const { data: session, isPending } = useSession();
  const items = useCartStore((s) => s.items);
  const totalItems = getCartTotalItems(items);

  const userName = session?.user?.name ?? '';

  return (
    <header className="bg-sidebar supports-backdrop-filter:bg-sidebar sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          {APP_NAME}
        </Link>

        <form action="/search" className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input name="q" placeholder="Search products..." className="pl-9" />
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart">
              <ShoppingCart className="size-5" />
              {totalItems > 0 && (
                <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>

          {isPending ? (
            <div className="bg-muted size-9 animate-pulse rounded-full" />
          ) : session?.user ? (
            <>
              <AccountDrawerTrigger userName={userName} />
              <AccountDrawer />
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
