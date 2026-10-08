import type { LucideIcon } from 'lucide-react';
import {
  BookOpenIcon,
  LayoutDashboardIcon,
  PackageIcon,
  SettingsIcon,
  ShoppingBagIcon,
} from 'lucide-react';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

type VendorNavItem = {
  label: string;
  href: string;
  Icon: LucideIcon;
  /** When set, sidebar renders an amber pill with this count. */
  badgeKey?: 'pendingOrders';
};

type VendorNavSection = {
  /** Eyebrow label (mono uppercase). null = no eyebrow. */
  section: string | null;
  items: ReadonlyArray<VendorNavItem>;
};

// Per Pencil VqlnC sidebar (OVERVIEW / CATALOG / OPERATIONS / ACCOUNT).
// Per vendor-dashboard gap-analysis Q22 (label "Products" not "My Products"),
// Q24 (Add Product entry removed; collapse DEFERRED — `/vendor/products/new`
// route stays available but is no longer linked from the sidebar),
// Q3 (Settings → placeholder route), and the IN_SCOPE Orders badge.
export const VENDOR_NAV_SECTIONS: ReadonlyArray<VendorNavSection> = [
  {
    section: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: ABSOLUTE_ROUTES.VENDOR_DASHBOARD,
        Icon: LayoutDashboardIcon,
      },
    ],
  },
  {
    section: 'Catalog',
    items: [
      {
        label: 'Products',
        href: ABSOLUTE_ROUTES.VENDOR_PRODUCTS,
        Icon: PackageIcon,
      },
    ],
  },
  {
    section: 'Operations',
    items: [
      {
        label: 'Orders',
        href: ABSOLUTE_ROUTES.VENDOR_ORDERS,
        Icon: ShoppingBagIcon,
        badgeKey: 'pendingOrders',
      },
      {
        label: 'Ledger',
        href: ABSOLUTE_ROUTES.VENDOR_LEDGER,
        Icon: BookOpenIcon,
      },
    ],
  },
  {
    section: 'Account',
    items: [
      {
        label: 'Settings',
        href: ABSOLUTE_ROUTES.VENDOR_SETTINGS,
        Icon: SettingsIcon,
      },
    ],
  },
];

export type VendorBadgeCounts = {
  pendingOrders?: number;
};
