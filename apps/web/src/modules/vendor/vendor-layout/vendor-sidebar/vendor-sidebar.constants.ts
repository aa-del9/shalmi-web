import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

export const VENDOR_NAV_ITEMS = [
  { label: 'Dashboard', href: ABSOLUTE_ROUTES.VENDOR_DASHBOARD },
  { label: 'My Products', href: ABSOLUTE_ROUTES.VENDOR_PRODUCTS },
  { label: 'Add Product', href: ABSOLUTE_ROUTES.VENDOR_PRODUCTS_NEW },
  { label: 'Orders', href: ABSOLUTE_ROUTES.VENDOR_ORDERS },
  { label: 'Ledger', href: ABSOLUTE_ROUTES.VENDOR_LEDGER },
] as const;
