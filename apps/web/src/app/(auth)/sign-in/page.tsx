import { redirect } from 'next/navigation';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

// Per buyer-signin gap-analysis Q15(a) — `/auth` is the canonical sign-in
// URL. The legacy `(auth)/sign-in` stub redirects there for any deep links.
export default function SignInRedirect() {
  redirect(ABSOLUTE_ROUTES.AUTH);
}
