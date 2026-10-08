import { SettingsShell } from '@/modules/buyer-settings/components/settings-shell';
import { SettingsMobileIndex } from '@/modules/buyer-settings/components/settings-mobile-index';

/**
 * `/profile/settings` — mobile index (5-row nav card + logout + version).
 *
 * Per gap-analysis Q29: on desktop we render a "select a setting" hint
 * (the sidebar nav handles drill-in); mobile gets the full index card.
 * The desktop hint sits inside the shell so the breadcrumb + H1 still
 * read correctly.
 */
export default function SettingsIndexPage() {
  return (
    <SettingsShell
      mobileTitle="Account"
      mobileBackHref="/"
      desktopTitle="Account & settings"
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'Account', href: '/profile' },
        { label: 'Settings' },
      ]}
    >
      <div className="lg:hidden">
        <SettingsMobileIndex />
      </div>
      <div className="hidden lg:block">
        <div className="rounded-md border border-rule bg-white p-10 text-center">
          <p className="font-sans text-sm text-ink-3">
            Select a setting from the sidebar to continue.
          </p>
        </div>
      </div>
    </SettingsShell>
  );
}
