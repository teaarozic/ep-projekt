'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getToken } from '@/utils/auth';
import { clearAllAuthData } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { roleToPath } from '@/utils/roleRedirect';

type Props = {
  children: ReactNode;
  allowedRoles?: ('USER' | 'ADMIN' | 'SA')[];
  fallback?: '403' | 'dashboard';
};

export default function AuthGuard({
  children,
  allowedRoles,
  fallback = '403',
}: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken('accessToken');

    if (!token) {
      router.replace('/login');
      return;
    }

    try {
      const decoded = jwtDecode<{ exp?: number }>(token);
      if (!decoded?.exp || decoded.exp * 1000 < Date.now()) {
        clearAllAuthData();
        router.replace('/login');
        return;
      }

      if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
        const safeRole = user?.role ?? 'USER';
        router.replace(fallback === '403' ? '/403' : roleToPath(safeRole));
        return;
      }

      setChecked(true);
    } catch {
      clearAllAuthData();
      router.replace('/login');
    }
  }, [router, allowedRoles, fallback, user]);

  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Checking authentication... Please wait.
      </div>
    );
  }

  return <>{children}</>;
}
