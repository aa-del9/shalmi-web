import { AdminCategories } from '@/modules/admin/admin-categories';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shalmi - Admin Categories',
  description: 'Admin categories',
};

export default function Page() {
  return <AdminCategories />;
}
