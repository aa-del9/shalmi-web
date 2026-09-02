import { AdminVendors } from '@/modules/admin/admin-vendors';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shalmi - Admin Vendors',
  description: 'Admin vendors',
};

// nuqs `useQueryState` requires the request URL at render time;
// keep this route dynamic so prerender doesn't trip on it.
export const dynamic = 'force-dynamic';

export default function Page() {
  return <AdminVendors />;
}
