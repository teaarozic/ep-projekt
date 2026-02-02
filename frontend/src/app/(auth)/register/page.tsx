'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/authService';
import { mapApiError } from '@/constants/apiMessages';
import { useRouter } from 'next/navigation';
import { MESSAGES } from '@/constants/uiMessages';
import { logger } from '@/utils/logger';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    setLoading(true);

    try {
      await authService.register({ email, password });
      toast.success(MESSAGES.auth.registerSuccess);

      await new Promise((resolve) => setTimeout(resolve, 800));
      router.replace('/login');
    } catch (err: unknown) {
      let message: string = MESSAGES.common.unknownError;

      if (err instanceof Error) {
        message = mapApiError(err.message);
        logger.error('[Registration Error]', err);
      } else {
        logger.error('[Registration Error]', 'Unknown error');
      }

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      {/* Logo i tekst */}
      <div className="mb-8 flex flex-col items-center text-center">
        <img
          src="/logo-taskflow.png"
          alt="TaskFlow Logo"
          className="mb-3 h-40 w-40"
        />
        <h1 className="text-3xl font-bold text-white">Create Account</h1>
        <p className="mt-1 text-sm text-gray-400">
          Register to start managing your projects
        </p>
      </div>

      {/* Bijeli panel */}
      <div className="w-full max-w-md rounded-2xl border-2 border-lime-500 bg-white p-8 shadow-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleRegister();
          }}
          autoComplete="on"
          className="space-y-4"
        >
          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-lime-500" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-300"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-lime-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-lg bg-lime-500 py-2.5 font-semibold text-white transition hover:bg-lime-600 disabled:opacity-60"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <span className="absolute bg-white px-3 text-sm text-gray-400">
              Or continue with
            </span>
            <hr className="w-full border-gray-300" />
          </div>

          {/* Social buttons */}
          <div className="flex w-full items-center justify-center gap-3">
            {/* Google button */}
            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  'http://localhost:4000/api/v1/auth/google')
              }
              disabled={loading}
              className="flex h-10 w-1/2 items-center justify-center rounded-md border border-gray-300 bg-white transition hover:bg-gray-50"
            >
              <img
                src="/google-icon.png"
                alt="Google"
                className="w-15 mx-auto h-14 object-contain"
              />
            </button>
          </div>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-lime-400 hover:underline"
            >
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
