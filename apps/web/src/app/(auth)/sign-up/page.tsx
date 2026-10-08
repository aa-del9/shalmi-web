import { Suspense } from 'react';
import { Signup } from '@/modules/auth/components/signup';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="min-h-[40vh]" />}>
        <Signup />
      </Suspense>
    </div>
  );
}
