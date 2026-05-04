'use client';

import { LogOut } from 'lucide-react';
import { LanguageToggle } from '@repo/ui/components/language-toggle';
import { APP_NAME, APP_VERSION } from '@/modules/core/constants/app-info';

interface FootProps {
  onLogout: () => void;
}

/**
 * Pencil `W72oM` / `m7ZU0K` — drawer foot with language row, logout
 * list-item card, and version string.
 *
 * The LanguageToggle is rendered visually inert per gap-analysis Q5
 * (i18n plumbing is STUBBED post-v1).
 */
export function Foot({ onLogout }: FootProps) {
  return (
    <div className="border-t border-rule px-4 pb-5 pt-4">
      <div className="flex items-center justify-between px-2">
        <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-ink-3">
          LANGUAGE
        </span>
        {/* TODO(post-v1): wire to global i18n state (gap-analysis Q5 STUBBED). */}
        <LanguageToggle value="en" disabled />
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-3 flex w-full items-center gap-3.5 rounded-lg border border-rule bg-white px-4 py-3.5 text-left transition-colors hover:bg-paper-2"
      >
        <LogOut className="size-5 shrink-0 text-red" aria-hidden />
        <span className="text-[15px] font-bold text-red">Log out</span>
      </button>

      <p className="mt-3 text-center font-mono text-[11px] tracking-[0.06em] text-ink-4">
        {APP_NAME} · v{APP_VERSION}
      </p>
    </div>
  );
}
