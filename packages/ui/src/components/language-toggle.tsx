'use client';

import * as React from 'react';

import { cn } from '@repo/ui/lib/utils';

/**
 * Pencil §3.6 — language toggle (segmented control).
 *
 *   outer: white fill · 1.5px ink stroke · radius 6 · 2px inner padding
 *   children: "EN" mono 11/700 (white-on-ink when selected)
 *             "اردو" font-ar 13 (ink-on-transparent when selected)
 *
 * Per Q16 of 02-design-inventory the language toggle exists in the
 * design system today but Urdu translation is NOT in scope yet — the
 * component is purely presentational. Wire it to real i18n state when
 * translations land.
 *
 * NOTE: passing `value="ur"` will visually flip the selection, but there
 * is no font loaded for Urdu yet (Q12) — the `font-ar` CSS variable
 * falls back to a system serif. Avoid `ur` selection in shipped UI
 * until the font + translations are in.
 */
export type LanguageCode = 'en' | 'ur';

interface LanguageToggleProps extends React.ComponentProps<'div'> {
  value?: LanguageCode;
  onValueChange?: (next: LanguageCode) => void;
  disabled?: boolean;
}

function LanguageToggle({
  value = 'en',
  onValueChange,
  disabled,
  className,
  ...props
}: LanguageToggleProps) {
  const isEn = value === 'en';

  return (
    <div
      data-slot="language-toggle"
      role="group"
      aria-label="Language"
      className={cn(
        'inline-flex items-center gap-0 rounded-sm border-[1.5px] border-ink bg-white p-0.5',
        disabled && 'opacity-50',
        className
      )}
      {...props}
    >
      <button
        type="button"
        data-slot="language-toggle-option"
        data-active={isEn}
        aria-pressed={isEn}
        disabled={disabled}
        onClick={() => onValueChange?.('en')}
        className={cn(
          'rounded-xs px-2 py-1 font-mono text-[11px] font-bold leading-none uppercase tracking-[0.08em] transition-colors',
          isEn ? 'bg-ink text-white' : 'bg-transparent text-ink'
        )}
      >
        EN
      </button>
      <button
        type="button"
        data-slot="language-toggle-option"
        data-active={!isEn}
        aria-pressed={!isEn}
        disabled={disabled}
        onClick={() => onValueChange?.('ur')}
        className={cn(
          'rounded-xs px-2 py-1 leading-none transition-colors',
          // 13px font size + Pencil --font-ar (Noto Nastaliq Urdu).
          // fontFamily is set via inline style so the variable resolves
          // even before Tailwind generates a `font-ar` utility.
          'text-[13px]',
          !isEn ? 'bg-ink text-white' : 'bg-transparent text-ink'
        )}
        style={{ fontFamily: 'var(--font-ar)' }}
      >
        اردو
      </button>
    </div>
  );
}

export { LanguageToggle };
