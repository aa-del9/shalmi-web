'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShoppingBag } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

interface AuthMobileAppBarProps {
  /** Show the back chevron tile on the left. Default true. */
  showBack?: boolean;
  /** Hide the brand wordmark (some screens swap it for a different label). */
  hideBrand?: boolean;
  className?: string;
}

/**
 * 56h mobile app-bar shown on every auth surface (per buyer-signin gap-
 * analysis §0a `RaHHO`). Back chevron uses `router.back()` (Q13(a)).
 * EN/اردو language toggle is intentionally omitted — Urdu deferred per
 * OQ-I (Q3 (a)).
 */
export function AuthMobileAppBar({
  showBack = true,
  hideBrand = false,
  className,
}: AuthMobileAppBarProps) {
  const router = useRouter();
  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between border-b border-rule bg-paper px-3 md:hidden',
        className
      )}
    >
      <div className="flex w-12 items-center justify-start">
        {showBack ? (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="flex size-10 items-center justify-center rounded-sm border border-rule-2 bg-white text-ink hover:bg-paper-2"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
        ) : null}
      </div>
      {!hideBrand ? (
        <span className="font-sans text-base font-extrabold tracking-[-0.02em] text-ink">
          Shalmi
        </span>
      ) : (
        <span aria-hidden />
      )}
      <div className="flex w-12 items-center justify-end">
        <Link
          href="/cart"
          aria-label="Cart"
          prefetch={false}
          className="flex size-10 items-center justify-center rounded-sm border border-rule-2 bg-white text-ink hover:bg-paper-2"
        >
          <ShoppingBag className="size-5" aria-hidden />
        </Link>
      </div>
    </header>
  );
}
