import { AdminVendors } from '@/modules/admin/admin-vendors';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shalmi - Admin Vendors',
  description: 'Admin vendors',
};

export default function Page() {
  return <AdminVendors />;
}
