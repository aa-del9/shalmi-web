'use client';

import Link from 'next/link';
import { Search, ShoppingCart, LogOut, User } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { useSession, signOut } from '@/modules/auth/client/auth-client';
import {
  useCartStore,
  getCartTotalItems,
} from '@/modules/cart/stores/cart-store';
import { APP_NAME } from '@/modules/core/constants/app-info';

export function StorefrontHeader() {
  const { data: session, isPending } = useSession();
  const items = useCartStore((s) => s.items);
  const totalItems = getCartTotalItems(items);

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
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-full text-sm font-medium">
                {session.user.name?.charAt(0).toUpperCase() ?? (
                  <User className="size-4" />
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => signOut()}>
                <LogOut className="size-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </div>
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
