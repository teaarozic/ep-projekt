'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { getToken, getRole, clearTokens } from '@/utils/auth';
import { roleToPath } from '@/utils/roleRedirect';

function PublicGuardLogic({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isChecking, setIsChecking] = useState(true);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;

    if (searchParams.get('from') === 'reset') {
      clearTokens();
      setIsChecking(false);
      return;
    }

    const token = getToken('accessToken');

    if (!token) {
      clearTokens();
      setIsChecking(false);
      return;
    }

    try {
      const decoded = jwtDecode<{ exp?: number }>(token);

      if (!decoded?.exp || decoded.exp * 1000 <= Date.now()) {
        clearTokens();
        setIsChecking(false);
        return;
      }

      const role = getRole();
      if (!role) {
        clearTokens();
        setIsChecking(false);
        return;
      }

      hasRedirected.current = true;
      router.replace(roleToPath(role));
    } catch {
      clearTokens();
      setIsChecking(false);
    }
  }, [router, searchParams]);

  if (isChecking) return null;
  return <>{children}</>;
}

export default function PublicGuardInner({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PublicGuardLogic>{children}</PublicGuardLogic>
    </Suspense>
  );
}
