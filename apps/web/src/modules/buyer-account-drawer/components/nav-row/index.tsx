'use client';

import Link from 'next/link';
import { ChevronRight, type LucideIcon } from 'lucide-react';

interface NavRowProps {
  icon: LucideIcon;
  label: string;
  subtitle?: string | null;
  subtitleTone?: 'default' | 'amber';
  href: string;
  onNavigate?: () => void;
  hairline?: boolean;
}

/**
 * Pencil §3.10 nav row — left lucide icon (20 ink-2) + 2-line label
 * stack (title sans 15/600 ink, subtitle sans 12 ink-3) + chevron.
 *
 * `hairline` flag draws a 1px bottom rule (last row in a card omits it).
 */
export function NavRow({
  icon: Icon,
  label,
  subtitle,
  subtitleTone = 'default',
  href,
  onNavigate,
  hairline = true,
}: NavRowProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      prefetch={false}
      className={
        'flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-paper-2 ' +
        (hairline ? 'border-b border-rule' : '')
      }
    >
      <Icon className="size-5 shrink-0 text-ink-2" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-ink">{label}</p>
        {subtitle ? (
          <p
            className={
              subtitleTone === 'amber'
                ? 'truncate text-[12px] font-semibold text-amber'
                : 'truncate text-[12px] text-ink-3'
            }
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      <ChevronRight
        className="size-[18px] shrink-0 text-ink-3"
        aria-hidden
      />
    </Link>
  );
}
