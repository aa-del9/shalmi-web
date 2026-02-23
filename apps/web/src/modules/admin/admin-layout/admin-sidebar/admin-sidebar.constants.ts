import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', href: ABSOLUTE_ROUTES.ADMIN_DASHBOARD },
  { label: 'Vendors', href: ABSOLUTE_ROUTES.ADMIN_VENDORS },
] as const;
