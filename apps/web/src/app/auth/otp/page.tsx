'use client';

import { Suspense } from 'react';
import { OtpVerificationForm } from '@/modules/auth/components/otp-verification-form';

export default function AuthOtpPage() {
  return (
    <Suspense fallback={<div className="container py-12">Loading…</div>}>
      <OtpVerificationForm />
    </Suspense>
  );
}
