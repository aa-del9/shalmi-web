'use client';

import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@repo/ui/lib/utils';
import { signOut } from '@/modules/auth/client/auth-client';
import { SETTINGS_NAV_ITEMS } from '../../nav/items';

/**
 * Settings desktop sidebar — paper card with 6 nav rows + divider + logout.
 *
 * Per gap-analysis Q1/Q5/Q7: rows for un-implemented sub-pages render
 * disabled (greyed, no hover); logout sits below a hairline divider and
 * coexists with the storefront header dropdown logout.
 */
export function SettingsSidebarNav() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Settings navigation"
      className="hidden h-fit w-[280px] shrink-0 flex-col rounded-md border border-rule bg-white p-2 lg:flex"
    >
      <ul className="flex flex-col gap-0.5">
        {SETTINGS_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.enabled &&
            (pathname === item.href ||
              pathname.startsWith(`${item.href}/`));

          if (!item.enabled) {
            return (
              <li key={item.id}>
                <span
                  aria-disabled="true"
                  className="flex items-center gap-3 rounded-sm px-3 py-2 font-sans text-sm font-medium text-ink-4"
                >
                  <Icon className="size-4 text-ink-4" aria-hidden />
                  {item.label}
                </span>
              </li>
            );
          }

          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-sm px-3 py-2 font-sans text-sm font-medium transition-colors',
                  active
                    ? 'bg-paper-2 text-ink font-bold'
                    : 'text-ink-2 hover:bg-paper-2 hover:text-ink'
                )}
              >
                <Icon
                  className={cn(
                    'size-4',
                    active ? 'text-ink' : 'text-ink-2'
                  )}
                  aria-hidden
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="my-2 h-px bg-rule" aria-hidden />
      <button
        type="button"
        onClick={() => signOut()}
        className="flex items-center gap-3 rounded-sm px-3 py-2 font-sans text-sm font-semibold text-red transition-colors hover:bg-red-bg"
      >
        <LogOut className="size-4 text-red" aria-hidden />
        Log out
      </button>
    </aside>
  );
}
