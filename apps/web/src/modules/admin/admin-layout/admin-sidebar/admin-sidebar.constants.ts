import type { LucideIcon } from 'lucide-react';
import {
  ChartLineIcon,
  FolderTreeIcon,
  ImageIcon,
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  PackageIcon,
  ShoppingBagIcon,
  StoreIcon,
  UsersIcon,
} from 'lucide-react';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

type AdminNavItem = {
  label: string;
  href: string;
  Icon: LucideIcon;
  /** Optional badge count rendered as a stamp pill in the sidebar. */
  badge?: number;
};

type AdminNavSection = {
  /** Eyebrow label (mono uppercase). null = no eyebrow. */
  section: string | null;
  items: ReadonlyArray<AdminNavItem>;
};

// Per Pencil A0BZZx + AcB4v sidebar (OVERVIEW / CATALOG / OPERATIONS).
// TODO(post-v1): admin chrome revamp — see 06-scope-cut.md feature.
export const ADMIN_NAV_SECTIONS: ReadonlyArray<AdminNavSection> = [
  {
    section: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: ABSOLUTE_ROUTES.ADMIN_DASHBOARD,
        Icon: LayoutDashboardIcon,
      },
      {
        label: 'Sales reports',
        href: ABSOLUTE_ROUTES.ADMIN_SALES_REPORTS,
        Icon: ChartLineIcon,
      },
    ],
  },
  {
    section: 'Catalog',
    items: [
      {
        label: 'Vendors',
        href: ABSOLUTE_ROUTES.ADMIN_VENDORS,
        Icon: StoreIcon,
      },
      {
        label: 'Categories',
        href: ABSOLUTE_ROUTES.ADMIN_CATEGORIES,
        Icon: FolderTreeIcon,
      },
      {
        label: 'Banners',
        href: ABSOLUTE_ROUTES.ADMIN_PROMO_BANNERS,
        Icon: ImageIcon,
      },
      {
        label: 'Products',
        href: ABSOLUTE_ROUTES.ADMIN_PRODUCTS,
        Icon: PackageIcon,
      },
    ],
  },
  {
    section: 'Operations',
    items: [
      {
        label: 'Orders',
        href: ABSOLUTE_ROUTES.ADMIN_ORDERS,
        Icon: ShoppingBagIcon,
        // TODO(post-v1): polled badge count via a shared admin-layout hook
        // (Q-SB-6 binding answer). Not landed in this batch — see deviation.
      },
      {
        label: 'Customers',
        href: ABSOLUTE_ROUTES.ADMIN_USERS,
        Icon: UsersIcon,
      },
      {
        label: 'WhatsApp · Unrecognized',
        href: ABSOLUTE_ROUTES.ADMIN_WHATSAPP_UNRECOGNIZED,
        Icon: MessageSquareTextIcon,
      },
    ],
  },
];
