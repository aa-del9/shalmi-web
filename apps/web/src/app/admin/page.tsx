import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import { permanentRedirect } from 'next/navigation';

export default function Page() {
  permanentRedirect(ABSOLUTE_ROUTES.ADMIN_DASHBOARD);
}
