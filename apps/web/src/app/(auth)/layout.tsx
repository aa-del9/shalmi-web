import type { WithChildren } from '@repo/types/common';

export default function AuthLayout({ children }: WithChildren) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      {children}
    </div>
  );
}
