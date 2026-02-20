import { AdminLayout } from '@/modules/admin/admin-layout';
import { WithChildren } from '@repo/types/common';

export default function Layout({ children }: WithChildren) {
  return <AdminLayout>{children}</AdminLayout>;
}
