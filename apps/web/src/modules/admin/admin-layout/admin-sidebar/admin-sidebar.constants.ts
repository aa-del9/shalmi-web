import type { LucideIcon } from 'lucide-react';
import {
  ImageIcon,
  LayoutDashboardIcon,
  StoreIcon,
  TagIcon,
} from 'lucide-react';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

type AdminNavItem = {
  label: string;
  href: string;
  Icon: LucideIcon;
};

type AdminNavSection = {
  /** Eyebrow label (mono uppercase). null = no eyebrow. */
  section: string | null;
  items: ReadonlyArray<AdminNavItem>;
};

// Sections per Pencil A0BZZx sidebar (OVERVIEW / CATALOG / OPERATIONS).
// OPERATIONS / Orders / Customers / Settings / Sales reports drawn but
// DEFERRED per scope-cut — surfaced rows below are the implemented set.
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
        Icon: TagIcon,
      },
      {
        label: 'Banners',
        href: ABSOLUTE_ROUTES.ADMIN_PROMO_BANNERS,
        Icon: ImageIcon,
      },
    ],
  },
];
