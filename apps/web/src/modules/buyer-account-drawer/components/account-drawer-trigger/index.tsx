'use client';

import { User } from 'lucide-react';
import { useAccountDrawerStore } from '../../store';
import { computeInitials } from '../../utils/initials';

interface AccountDrawerTriggerProps {
  userName: string;
}

/**
 * Pencil `actAccount` (desktop) / `mAcct` (mobile) — header button that
 * opens the account drawer. Replaces the legacy DropdownMenu trigger.
 *
 * Per gap-analysis Q12 the avatar shows initials of the first two name
 * parts (e.g. "Tariq Ahmed" → "TA").
 */
export function AccountDrawerTrigger({ userName }: AccountDrawerTriggerProps) {
  const open = useAccountDrawerStore((s) => s.open);
  const initials = computeInitials(userName);

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open account drawer"
      className="bg-primary text-primary-foreground ring-offset-background focus-visible:ring-ring flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      {initials || <User className="size-4" />}
    </button>
  );
}
