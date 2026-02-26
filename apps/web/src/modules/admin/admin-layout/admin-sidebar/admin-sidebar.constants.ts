import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import { LayoutDashboardIcon, StoreIcon, TagIcon } from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: ABSOLUTE_ROUTES.ADMIN_DASHBOARD,
    Icon: LayoutDashboardIcon,
  },
  { label: 'Vendors', href: ABSOLUTE_ROUTES.ADMIN_VENDORS, Icon: StoreIcon },
  {
    label: 'Categories',
    href: ABSOLUTE_ROUTES.ADMIN_CATEGORIES,
    Icon: TagIcon,
  },
] as const;
