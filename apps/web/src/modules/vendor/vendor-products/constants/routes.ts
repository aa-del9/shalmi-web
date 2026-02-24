import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

export function getVendorProductEditPath(productId: string): string {
  return `${ABSOLUTE_ROUTES.VENDOR_PRODUCTS}/${productId}/edit`;
}
