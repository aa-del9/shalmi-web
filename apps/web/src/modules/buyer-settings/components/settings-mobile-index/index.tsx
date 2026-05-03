'use client';

import { ChevronRight, LogOut } from 'lucide-react';
import Link from 'next/link';
import { signOut } from '@/modules/auth/client/auth-client';
import { SETTINGS_NAV_ITEMS } from '../../nav/items';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? 'v1.0.0';

interface SettingsMobileIndexProps {
  /**
   * Per gap-analysis Q5: un-implemented sub-pages render disabled.
   */
  hideOrders?: boolean;
}

/**
 * Mobile Settings index (Pencil ZETLe / Ki6pz) — 5-row nav card,
 * logout card, and version footer.
 *
 * Per gap-analysis Q29: this is what `/profile/settings` renders on
 * mobile; desktop redirects to `/profile/settings/addresses` from the
 * page server-component.
 *
 * Per gap-analysis Q30: version reads from `NEXT_PUBLIC_APP_VERSION`.
 */
export function SettingsMobileIndex({
  hideOrders = false,
}: SettingsMobileIndexProps) {
  const items = hideOrders
    ? SETTINGS_NAV_ITEMS.filter((i) => i.id !== 'orders')
    : SETTINGS_NAV_ITEMS;

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-4">
      <ul
        className="flex flex-col rounded-md border border-rule bg-white p-1.5"
        aria-label="Settings"
      >
        {items.map((item, idx) => {
          const last = idx === items.length - 1;
          const Icon = item.icon;
          if (!item.enabled) {
            return (
              <li
                key={item.id}
                className={
                  last ? '' : 'border-b border-rule/60'
                }
              >
                <span
                  aria-disabled="true"
                  className="flex items-center gap-3 px-3 py-3 text-ink-4"
                >
                  <Icon className="size-5 shrink-0 text-ink-4" aria-hidden />
                  <span className="flex-1">
                    <span className="block font-sans text-sm font-semibold">
                      {item.label}
                    </span>
                    {item.subtitle ? (
                      <span className="block font-mono text-[11px] text-ink-4">
                        {item.subtitle}
                      </span>
                    ) : null}
                  </span>
                </span>
              </li>
            );
          }

          return (
            <li
              key={item.id}
              className={last ? '' : 'border-b border-rule/60'}
            >
              <Link
                href={item.href}
                className="flex items-center gap-3 px-3 py-3 text-ink hover:bg-paper-2"
              >
                <Icon className="size-5 shrink-0 text-ink-2" aria-hidden />
                <span className="flex-1">
                  <span className="block font-sans text-sm font-semibold text-ink">
                    {item.label}
                  </span>
                  {item.subtitle ? (
                    <span className="block font-mono text-[11px] text-ink-3">
                      {item.subtitle}
                    </span>
                  ) : null}
                </span>
                <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => signOut()}
        className="flex w-full items-center gap-3 rounded-md border border-rule bg-white px-4 py-3 font-sans text-sm font-semibold text-red transition-colors hover:bg-red-bg"
      >
        <LogOut className="size-5 text-red" aria-hidden />
        Log out
      </button>
      <p className="text-center font-mono text-[11px] text-ink-4">
        Shalmi Mart · {APP_VERSION}
      </p>
    </div>
  );
}
