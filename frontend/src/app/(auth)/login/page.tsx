'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { getRole } from '@/utils/auth';
import { roleToPath } from '@/utils/roleRedirect';
import { authService } from '@/services/authService';
import { clearAuthData } from '@/utils/navigationUtils';
import { MESSAGES } from '@/constants/uiMessages';
import { mapApiError } from '@/constants/apiMessages';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const { setUser } = useAuth();

  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    const savedRemember = localStorage.getItem('rememberMe') === 'true';

    if (savedEmail) setEmail(savedEmail);
    if (savedRemember) setRememberMe(true);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      clearAuthData();

      const data = await authService.login({ email, password });

      const decoded = JSON.parse(atob(data.accessToken.split('.')[1]));
      setUser(decoded);
      localStorage.setItem('user', JSON.stringify(decoded));

      if (rememberMe) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        sessionStorage.setItem('accessToken', data.accessToken);
        sessionStorage.setItem('refreshToken', data.refreshToken);
        sessionStorage.setItem('userEmail', email);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('rememberMe');
      }

      toast.success(MESSAGES.auth.loginSuccess);
      await new Promise((r) => setTimeout(r, 200));

      const role = getRole();
      const targetPath = roleToPath(role ?? 'USER');

      window.location.href = targetPath;
    } catch (err: unknown) {
      let message: string = MESSAGES.common.unknownError;
      if (err instanceof Error) message = mapApiError(err.message);
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      {/* Gornji dio - logo i tekst */}
      <div className="mb-8 flex flex-col items-center text-center">
        <img
          src="/logo-taskflow.png"
          alt="TaskFlow Logo"
          className="mb-3 h-40 w-40"
        />
        <h1 className="text-3xl font-bold text-white">Welcome</h1>
        <p className="mt-1 text-sm text-gray-400">
          Sign in to access your dashboard
        </p>
      </div>

      {/* Donji bijeli panel */}
      <div className="w-full max-w-md rounded-2xl border-2 border-lime-500 bg-white p-8 shadow-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleLogin();
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
                autoComplete="username"
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
                autoComplete="current-password"
                placeholder="Enter your password"
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

          {/* Remember / Forgot */}
          <div className="mt-2 flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="accent-lime-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-lime-600 hover:underline"
            >
              Forgot password?
            </Link>
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
            {loading ? 'Signing in...' : 'Sign in'}
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

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Don’t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-lime-400 hover:underline"
            >
              Register here
            </Link>
          </p>
        </form>
        <form
          method="POST"
          action="/"
          style={{ display: 'none' }}
          autoComplete="on"
        >
          <input type="email" name="email" autoComplete="username" />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}
