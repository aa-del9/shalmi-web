import { AdminPromoBanners } from '@/modules/admin/admin-promo-banners';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shalmi - Admin Promo Banners',
  description: 'Manage promotional banners',
};

export default function Page() {
  return <AdminPromoBanners />;
}
