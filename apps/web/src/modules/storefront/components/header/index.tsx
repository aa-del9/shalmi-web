'use client';

import Link from 'next/link';
import { Search, ShoppingCart, User } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { useSession } from '@/modules/auth/client/auth-client';
import {
  useCartStore,
  getCartTotalItems,
} from '@/modules/cart/stores/cart-store';
import { APP_NAME } from '@/modules/core/constants/app-info';
import { AccountDrawer } from '@/modules/buyer-account-drawer';
import { useAccountDrawerStore } from '@/modules/buyer-account-drawer/store';

const BRAND_EYEBROW = 'WHOLESALE';
const SEARCH_PLACEHOLDER_DESKTOP = 'Search 50,000+ items, vendors, or bazaars';
const SEARCH_PLACEHOLDER_MOBILE = 'Search Shalmi Mart';

/**
 * Pencil bid1Y `T9wgS` (desktop header) + `D2QeX` / `uonED` (mobile app
 * bar + search row). Replaces the legacy single-row header that ignored
 * mobile entirely.
 *
 * Buyer-home Q14 (single responsive header) is satisfied here in two
 * stacked layouts: a desktop row for `md+` and a mobile app bar + search
 * wrap below it.
 *
 * Out of scope per Batch-6 answer set:
 *   - "Saved" pill (Wishlist scope-cut also hides the Account-drawer row).
 *   - ⌘K command-palette hint and the mobile mic icon (no underlying
 *     features to wire).
 *   - Real language toggle — the mobile EN/اردو pill is visible-but-
 *     inert, identical to the existing `UtilStrip` desktop strip.
 */
export function StorefrontHeader() {
  const { data: session, isPending } = useSession();
  const items = useCartStore((s) => s.items);
  const totalItems = getCartTotalItems(items);
  const openAccountDrawer = useAccountDrawerStore((s) => s.open);
  const brandInitial = APP_NAME?.[0]?.toUpperCase() ?? 'S';

  return (
    <header className="border-rule bg-paper supports-backdrop-filter:bg-paper/95 sticky top-0 z-50 w-full border-b backdrop-blur">
      {/* ──────────── Desktop ──────────── */}
      <div className="mx-auto hidden max-w-[1440px] items-center gap-6 px-10 py-4 md:flex">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label={APP_NAME}
        >
          <span className="bg-ink text-paper flex size-9 items-center justify-center rounded-full text-base font-extrabold">
            {brandInitial}
          </span>
          <span className="flex flex-col gap-0.5 leading-none">
            <span className="text-ink text-[22px] font-semibold tracking-[-0.01em]">
              {APP_NAME}
            </span>
            <span className="text-ink-3 text-[9px] font-medium tracking-[0.16em]">
              {BRAND_EYEBROW}
            </span>
          </span>
        </Link>

        <form action="/search" role="search" className="relative flex-1">
          <Search
            className="text-ink-3 pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2"
            aria-hidden
          />
          <input
            type="search"
            name="q"
            placeholder={SEARCH_PLACEHOLDER_DESKTOP}
            aria-label="Search"
            className="border-rule-2 text-ink placeholder:text-ink-4 focus-visible:ring-ink/20 focus-visible:border-ink h-11 w-full rounded-md border-[1.5px] bg-white pr-3 pl-11 text-[15px] transition-colors outline-none focus-visible:ring-2"
          />
        </form>

        <nav
          className="flex items-center gap-1.5"
          aria-label="Account and cart"
        >
          {isPending ? (
            <div className="bg-ink-4/10 size-[60px] animate-pulse rounded-md" />
          ) : session?.user ? (
            <button
              type="button"
              onClick={openAccountDrawer}
              aria-label="Open account drawer"
              className="text-ink hover:bg-paper-2 focus-visible:ring-ink/20 inline-flex flex-col items-center gap-0.5 rounded-md px-3 py-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <User className="size-[22px]" aria-hidden />
              <span className="text-[11px] leading-none font-semibold">
                Account
              </span>
            </button>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth">Sign In</Link>
            </Button>
          )}

          <Link
            href="/cart"
            aria-label={`Cart${totalItems > 0 ? ` (${totalItems} items)` : ''}`}
            className="bg-ink text-paper focus-visible:ring-ink/40 relative inline-flex flex-row items-center gap-2 rounded-md px-3 py-2 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
          >
            <ShoppingCart className="size-[22px]" aria-hidden />
            <span className="text-[11px] leading-none font-semibold">Cart</span>
            {totalItems > 0 && (
              <span className="bg-green-2 text-paper absolute -top-1.5 -right-1.5 flex size-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>

      {/* ──────────── Mobile app bar ──────────── */}
      <div className="border-rule flex items-center justify-between gap-2.5 border-b px-4 py-3.5 md:hidden">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label={APP_NAME}
        >
          <span className="bg-ink text-paper flex size-8 items-center justify-center rounded-full text-sm font-extrabold">
            {brandInitial}
          </span>
          <span className="text-ink text-[17px] font-extrabold">
            {APP_NAME}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Visible-but-inert language toggle — mirrors UtilStrip on
              desktop. TODO(post-v1): wire to LanguageToggle global state. */}
          <span
            className="border-ink text-ink inline-flex items-center gap-1 rounded-md border-[1.5px] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.04em]"
            aria-hidden
          >
            <span className="bg-ink text-paper rounded-sm px-1 py-px">EN</span>
            <span
              className="text-ink/60 px-0.5"
              style={{ fontFamily: 'var(--font-ar)' }}
            >
              اردو
            </span>
          </span>

          {isPending ? (
            <div className="bg-paper-2 size-9 animate-pulse rounded-full" />
          ) : session?.user ? (
            <button
              type="button"
              onClick={openAccountDrawer}
              aria-label="Open account drawer"
              className="bg-paper-2 text-ink focus-visible:ring-ink/20 flex size-9 items-center justify-center rounded-full transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
            >
              <User className="size-[18px]" aria-hidden />
            </button>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth">Sign In</Link>
            </Button>
          )}

          <Link
            href="/cart"
            aria-label={`Cart${totalItems > 0 ? ` (${totalItems} items)` : ''}`}
            className="bg-paper-2 text-ink focus-visible:ring-ink/20 relative flex size-9 items-center justify-center rounded-full transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
          >
            <ShoppingCart className="size-[18px]" aria-hidden />
            {totalItems > 0 && (
              <span
                className="bg-green-2 absolute top-1 right-1 size-2 rounded-full"
                aria-hidden
              />
            )}
          </Link>
        </div>
      </div>

      {/* ──────────── Mobile search row ──────────── */}
      <form
        action="/search"
        role="search"
        className="bg-paper px-4 pt-3 pb-3 md:hidden"
      >
        <div className="border-rule-2 relative h-11 rounded-md border-[1.5px] bg-white">
          <Search
            className="text-ink-3 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <input
            type="search"
            name="q"
            placeholder={SEARCH_PLACEHOLDER_MOBILE}
            aria-label="Search"
            className="text-ink placeholder:text-ink-4 h-full w-full rounded-md bg-transparent pr-3 pl-9 text-[13px] outline-none"
          />
        </div>
      </form>

      {session?.user && <AccountDrawer />}
    </header>
  );
}
