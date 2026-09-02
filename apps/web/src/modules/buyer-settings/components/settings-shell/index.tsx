import type { ReactNode } from 'react';
import { SettingsBreadcrumb } from '../settings-breadcrumb';
import { SettingsSidebarNav } from '../settings-sidebar-nav';
import { SettingsAppBar } from '../settings-app-bar';

interface BreadcrumbCrumb {
  label: string;
  href?: string;
}

interface SettingsShellProps {
  /** Mobile app-bar title (per Pencil F5tgKi). */
  mobileTitle: string;
  /** Mobile app-bar back href (gap-analysis Q27). */
  mobileBackHref: string;
  /** Desktop breadcrumb trail (Pencil pdIJF). */
  breadcrumb: BreadcrumbCrumb[];
  /** Desktop H1 (gap-analysis Q4 — "Account & settings"). */
  desktopTitle: string;
  /**
   * When true, hide the desktop sidebar+breadcrumb scaffolding and render
   * the children directly. Used by the mobile-index page so its full-screen
   * list owns the viewport.
   */
  bare?: boolean;
  children: ReactNode;
}

/**
 * Settings shell — wraps every `/profile/settings/*` sub-page.
 *
 * Per gap-analysis Q1: same layout on desktop and mobile, conditionally
 * showing the index card vs. the back-bar based on viewport.
 */
export function SettingsShell({
  mobileTitle,
  mobileBackHref,
  breadcrumb,
  desktopTitle,
  bare = false,
  children,
}: SettingsShellProps) {
  return (
    <>
      <SettingsAppBar title={mobileTitle} backHref={mobileBackHref} />
      <div className="lg:px-10 lg:py-10">
        <div className="mx-auto max-w-[1360px]">
          <div className="hidden lg:block">
            <SettingsBreadcrumb trail={breadcrumb} />
            <h1 className="mt-3 font-sans text-[36px] font-extrabold tracking-[-0.02em] text-ink">
              {desktopTitle}
            </h1>
          </div>
          <div className="mt-0 flex gap-8 lg:mt-8">
            {bare ? null : <SettingsSidebarNav />}
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
