'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Package, MapPin, LogOut } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@repo/ui/components/dropdown-menu';
import { useSession, signOut } from '@/modules/auth/client/auth-client';
import {
  useCartStore,
  getCartTotalItems,
} from '@/modules/cart/stores/cart-store';
import { APP_NAME } from '@/modules/core/constants/app-info';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

export function StorefrontHeader() {
  const { data: session, isPending } = useSession();
  const items = useCartStore((s) => s.items);
  const totalItems = getCartTotalItems(items);
  const router = useRouter();

  const userName = session?.user?.name ?? '';
  const initial = userName.charAt(0).toUpperCase();

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-full text-sm font-semibold ring-offset-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  {initial || <User className="size-4" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold leading-none">{userName}</p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {(session.user as { phoneNumber?: string }).phoneNumber ?? ''}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => router.push(ABSOLUTE_ROUTES.PROFILE_ORDERS)}
                >
                  <Package className="mr-2 size-4" />
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => router.push(ABSOLUTE_ROUTES.PROFILE_ADDRESSES)}
                >
                  <MapPin className="mr-2 size-4" />
                  Addresses
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => signOut()}
                >
                  <LogOut className="mr-2 size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
