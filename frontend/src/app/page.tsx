'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    if (!token) {
      setIsChecking(false);
      return;
    }

    try {
      const decoded = jwtDecode<{ exp?: number }>(token);

      if (!decoded?.exp || decoded.exp * 1000 <= Date.now()) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        setIsChecking(false);
        return;
      }

      router.replace('/dashboard');
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      {/* Logo i naslov */}
      <div className="mb-8 flex flex-col items-center text-center">
        <img
          src="/logo-taskflow.png"
          alt="TaskFlow Logo"
          className="mb-3 h-40 w-40"
        />
        <h1 className="text-3xl font-bold text-white">Welcome to Task Flow</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your projects and tasks with ease.
        </p>
      </div>

      {/* Bijeli panel */}
      <div className="w-full max-w-md rounded-2xl border-2 border-lime-500 bg-white p-8 text-center shadow-2xl">
        <p className="mb-6 text-sm text-gray-600">
          Plan. Collaborate. Track your progress.
        </p>

        {/* Gumbi */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="w-full rounded-lg bg-lime-500 py-2.5 text-center font-semibold text-white transition hover:bg-lime-600 sm:w-1/2"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="w-full rounded-lg border border-lime-500 py-2.5 text-center font-semibold text-lime-600 transition hover:bg-lime-50 sm:w-1/2"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
