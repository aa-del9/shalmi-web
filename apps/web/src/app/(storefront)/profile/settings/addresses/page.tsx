import { SettingsShell } from '@/modules/buyer-settings/components/settings-shell';
import { UserAddresses } from '@/modules/user-addresses';

export default function ProfileSettingsAddressesPage() {
  return (
    <SettingsShell
      mobileTitle="Saved addresses"
      mobileBackHref="/profile/settings"
      desktopTitle="Account & settings"
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'Account', href: '/profile' },
        { label: 'Settings', href: '/profile/settings' },
        { label: 'Saved addresses' },
      ]}
    >
      <UserAddresses />
    </SettingsShell>
  );
}
