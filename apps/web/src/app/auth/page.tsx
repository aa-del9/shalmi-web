'use client';

import { Suspense } from 'react';
import { AuthPageContent } from '@/modules/auth/components/auth-page-content';

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <AuthPageContent />
    </Suspense>
  );
}
