import { Suspense } from 'react';
import { OtpVerification } from '@/modules/auth/components/otp-verification';

export default function AuthOtpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="min-h-[40vh]" />}>
        <OtpVerification />
      </Suspense>
    </div>
  );
}
