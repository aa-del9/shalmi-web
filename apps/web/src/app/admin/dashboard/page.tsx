import { AdminDashboard } from '@/modules/admin/admin-dashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shalmi - Admin Dashboard',
  description: 'Admin dashboard',
};

export default function Page() {
  return <AdminDashboard />;
}
