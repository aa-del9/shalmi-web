'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import { AuthBrandCluster } from '@/modules/auth/components/auth-brand-cluster';
import { AuthMobileAppBar } from '@/modules/auth/components/auth-mobile-app-bar';
import { SignupTypeSwitcher } from '@/modules/auth/components/signup-type-switcher';
import { GenericSignupForm } from '@/modules/auth/components/signup/generic-form';
import { ShopkeeperSignupForm } from '@/modules/auth/components/signup/shopkeeper-form';
import { MartShelfStrip } from '@/modules/auth/components/signup/mart-shelf-strip';

type SignupType = 'generic' | 'shopkeeper';

const KNOWN_TYPES: SignupType[] = ['generic', 'shopkeeper'];

export function Signup() {
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone');
  const typeParam = searchParams.get('type');
  const activeType: SignupType =
    typeParam && KNOWN_TYPES.includes(typeParam as SignupType)
      ? (typeParam as SignupType)
      : 'generic';

  const isShopkeeper = activeType === 'shopkeeper';

  return (
    <>
      <AuthMobileAppBar showBack={false} />
      {isShopkeeper ? <MartShelfStrip /> : null}
      <div className="mx-auto flex w-full max-w-[520px] flex-col px-4 py-6 md:py-10">
        <div className="hidden md:block">
          <AuthBrandCluster />
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-ink-3">
            {isShopkeeper ? 'STEP 1 OF 2 · DETAILS' : 'GENERIC USER'}
          </p>
          {/* EN/اردو toggle hidden per OQ-I + Q3 (a). */}
        </div>

        <div className="mt-4">
          <SignupTypeSwitcher active={activeType} />
        </div>

        <h1 className="mt-6 font-sans text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-ink md:text-[30px]">
          {isShopkeeper ? 'Tell us about your shop' : 'Join Shalmi'}
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
          {isShopkeeper
            ? "Four quick fields. We'll send a 6-digit OTP to verify your shop."
            : 'For personal restocking. Takes 30 seconds.'}
        </p>

        {isShopkeeper ? (
          <ShopkeeperSignupForm phonePrefill={phoneParam} />
        ) : (
          <GenericSignupForm phonePrefill={phoneParam} />
        )}

        <p className="mt-6 text-center text-sm text-ink-3">
          Already have an account?{' '}
          <Link
            href={ABSOLUTE_ROUTES.AUTH}
            className="font-bold text-ink underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>

        <p className="mt-6 text-center text-[11px] text-ink-3">
          By continuing you agree to our Terms &amp; Privacy.
        </p>
      </div>
    </>
  );
}
