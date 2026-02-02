'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { getRole } from '@/utils/auth';
import { roleToPath } from '@/utils/roleRedirect';
import { logger } from '@/utils/logger';

interface DecodedToken {
  id?: number;
  sub?: number;
  email: string;
  name?: string;
  role?: 'USER' | 'ADMIN' | 'SA';
  exp?: number;
}

export default function AuthCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');

  useEffect(() => {
    async function handleAuth() {
      if (!token) {
        toast.error('Missing token. Please sign in again.');
        router.replace('/login');
        return;
      }

      try {
        localStorage.clear();
        sessionStorage.clear();

        localStorage.setItem('accessToken', token);

        const decoded = jwtDecode<DecodedToken>(token);

        if (decoded.sub && !decoded.id) {
          decoded.id = decoded.sub;
        }

        if (decoded.email) localStorage.setItem('userEmail', decoded.email);
        if (decoded.role) localStorage.setItem('userRole', decoded.role);
        localStorage.setItem('user', JSON.stringify(decoded));

        const refresh = params.get('refresh');
        if (refresh) {
          localStorage.setItem('refreshToken', refresh);
        }

        toast.success('Signed in with Google');

        const role = decoded.role || getRole() || 'USER';
        const path = roleToPath(role);
        window.location.replace(path);
      } catch (err: unknown) {
        if (err instanceof Error) {
          logger.error('[AuthCallback] Google callback error', err.message);
        } else {
          logger.error('[AuthCallback] Google callback unknown error');
        }
        toast.error('Google authentication failed');
        router.replace('/login');
      }
    }

    handleAuth();
  }, [token, router, params]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="animate-pulse text-gray-600">
        Signing you in with Google...
      </p>
    </div>
  );
}
