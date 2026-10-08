import {
  User as UserIcon,
  Package as PackageIcon,
  MapPin as MapPinIcon,
  CreditCard as CreditCardIcon,
  Bell as BellIcon,
  Settings as SettingsIcon,
  type LucideIcon,
} from 'lucide-react';

export interface SettingsNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** When false, the row renders disabled/greyed (gap-analysis Q5). */
  enabled: boolean;
  /** Optional one-line subtitle shown on the mobile index card. */
  subtitle?: string;
}

// Per gap-analysis Q5: un-implemented sub-pages render disabled.
// `enabled` controls whether the row is interactive — Profile / Payment
// methods / Notifications / Preferences are deferred per scope-cut.
// TODO(post-v1): flip `enabled` once each sub-page lands.
export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile/settings/profile',
    icon: UserIcon,
    enabled: false,
    subtitle: 'Coming soon',
  },
  {
    id: 'orders',
    label: 'Orders',
    // Per gap-analysis Q6: nav row points at the existing /profile/orders;
    // no route move.
    href: '/profile/orders',
    icon: PackageIcon,
    enabled: true,
  },
  {
    id: 'addresses',
    label: 'Saved addresses',
    href: '/profile/settings/addresses',
    icon: MapPinIcon,
    enabled: true,
  },
  {
    id: 'payments',
    label: 'Payment methods',
    href: '/profile/settings/payments',
    icon: CreditCardIcon,
    enabled: false,
    subtitle: 'Coming soon',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    href: '/profile/settings/notifications',
    icon: BellIcon,
    enabled: false,
    subtitle: 'Coming soon',
  },
  {
    id: 'preferences',
    label: 'Preferences',
    href: '/profile/settings/preferences',
    icon: SettingsIcon,
    enabled: false,
    subtitle: 'Coming soon',
  },
];
