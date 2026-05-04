'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Store, UserRound } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

type SignupType = 'generic' | 'shopkeeper';

interface SignupTypeSwitcherProps {
  active: SignupType;
}

/**
 * Generic ↔ Shopkeeper segmented switcher per buyer-signup-generic Q4(a).
 * Updates `?type=` on the same `/sign-up` route — in-page form swap.
 */
export function SignupTypeSwitcher({ active }: SignupTypeSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSelect(next: SignupType) {
    if (next === active) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', next);
    router.push(`/sign-up?${params.toString()}`);
  }

  return (
    <div
      role="tablist"
      aria-label="Signup type"
      className="flex h-11 items-center gap-1 rounded-md border-[1.5px] border-rule-2 bg-paper-2 p-1"
    >
      <SegmentButton
        label="Generic user"
        icon={<UserRound className="size-4" aria-hidden />}
        active={active === 'generic'}
        onClick={() => handleSelect('generic')}
      />
      <SegmentButton
        label="Shopkeeper"
        icon={<Store className="size-4" aria-hidden />}
        active={active === 'shopkeeper'}
        onClick={() => handleSelect('shopkeeper')}
      />
    </div>
  );
}

function SegmentButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex h-9 flex-1 items-center justify-center gap-2 rounded-sm text-[13px] font-bold transition-colors',
        active
          ? 'bg-green-2 text-white shadow-sm'
          : 'bg-transparent text-ink-2 hover:bg-paper-3'
      )}
    >
      {icon}
      {label}
    </button>
  );
}
