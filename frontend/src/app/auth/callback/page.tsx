'use client';

import { Suspense } from 'react';
import AuthCallbackInner from '@/app/auth/callback/AuthCallbackInner';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Signing you in...</div>}>
      <AuthCallbackInner />
    </Suspense>
  );
}
