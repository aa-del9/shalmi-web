import { Suspense } from 'react';
import { SignIn } from '@/modules/auth/components/sign-in';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="min-h-[40vh]" />}>
        <SignIn />
      </Suspense>
    </div>
  );
}
