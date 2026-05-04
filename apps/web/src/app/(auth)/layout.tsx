import type { WithChildren } from '@repo/types/common';

// Per buyer-signin gap-analysis Q15(a) and buyer-signup-generic Q11(a),
// the (auth) route group only owns `/sign-in` (a redirect) and `/sign-up`
// (the new full-page signup). Both render their own page chrome — the
// previous centered-modal shell is no longer appropriate.
export default function AuthLayout({ children }: WithChildren) {
  return <>{children}</>;
}
