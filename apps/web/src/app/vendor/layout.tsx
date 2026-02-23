import { VendorLayout } from '@/modules/vendor/vendor-layout';
import { WithChildren } from '@repo/types/common';

export default function Layout({ children }: WithChildren) {
  return <VendorLayout>{children}</VendorLayout>;
}
