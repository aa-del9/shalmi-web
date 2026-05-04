'use client';

import { ChevronLeft, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { LanguageToggle } from '@repo/ui/components/language-toggle';

interface SettingsAppBarProps {
  title: string;
  /** Where the chevron-left routes back to (gap-analysis Q27). */
  backHref: string;
}

/**
 * Mobile Settings app bar (Pencil F5tgKi) — replaces the storefront header
 * inside `/profile/settings/*` per gap-analysis Q27.
 *
 * Per gap-analysis Q28 STUBBED: LanguageToggle renders visible-but-inert.
 * TODO(post-v1): wire LanguageToggle to global state once i18n ships.
 */
export function SettingsAppBar({ title, backHref }: SettingsAppBarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-rule bg-paper px-4 py-3.5 lg:hidden">
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          aria-label="Back"
          className="flex size-8 items-center justify-center rounded-sm text-ink hover:bg-paper-2"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
        <h1 className="font-sans text-[18px] font-bold text-ink">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <LanguageToggle value="en" onValueChange={() => {}} />
        <span
          aria-hidden
          className="flex size-10 items-center justify-center rounded-full bg-paper-2 text-ink-2"
        >
          <UserIcon className="size-5" />
        </span>
      </div>
    </header>
  );
}
