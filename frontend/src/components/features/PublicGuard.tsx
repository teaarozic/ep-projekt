'use client';

import { Suspense } from 'react';
import PublicGuardInner from './PublicGuardInner';

export default function PublicGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PublicGuardInner>{children}</PublicGuardInner>
    </Suspense>
  );
}
