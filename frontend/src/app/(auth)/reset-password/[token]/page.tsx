'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Lock, CheckCircle } from 'lucide-react';
import { googleLogout } from '@react-oauth/google';
import { logger } from '@/utils/logger';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirm) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        'http://localhost:4000/api/v1/auth/reset-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');

      toast.success('Password reset successfully!');

      localStorage.clear();
      sessionStorage.clear();

      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });

      try {
        googleLogout();
      } catch (err) {
        logger.warn('[ResetPassword] Google logout failed', err);
      }

      setSuccess(true);

      setTimeout(() => {
        router.replace('/login?from=reset');
      }, 2000);
    } catch (err: unknown) {
      logger.error('[ResetPassword] Error resetting password', err);
      if (err instanceof Error) {
        toast.error(err.message || 'Error resetting password');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
        <CheckCircle className="mb-4 h-16 w-16 text-lime-500" />
        <h1 className="text-2xl font-bold">Password reset successful!</h1>
        <p className="mt-2 text-gray-400">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      {/* Logo + naslov */}
      <div className="mb-8 flex flex-col items-center text-center">
        <img
          src="/logo-taskflow.png"
          alt="TaskFlow Logo"
          className="mb-3 h-40 w-40"
        />
        <h1 className="text-3xl font-bold text-white">Reset Password</h1>
        <p className="mt-1 text-sm text-gray-400">
          Enter your new password below
        </p>
      </div>

      {/* Bijeli panel */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-lime-500" />
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-300"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-lime-500" />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-300"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-lime-500 py-2.5 font-semibold text-white transition hover:bg-lime-600 disabled:opacity-60"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Back to{' '}
            <Link href="/login" className="text-lime-500 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
