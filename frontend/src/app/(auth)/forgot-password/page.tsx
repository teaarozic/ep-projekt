'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      toast.success('If your email exists, a reset link has been sent.');
      setSubmitted(true);
    } catch {
      toast.error('Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      {/* Logo + Naslov */}
      <div className="mb-8 flex flex-col items-center text-center">
        <img
          src="/logo-taskflow.png"
          alt="TaskFlow Logo"
          className="mb-3 h-40 w-40"
        />
        <h1 className="text-3xl font-bold text-white">Forgot Password?</h1>
        <p className="mt-1 text-sm text-gray-400">
          Enter your email to receive a reset link
        </p>
      </div>

      {/* Bijeli panel */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-lime-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-300"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-lime-500 py-2.5 font-semibold text-white transition hover:bg-lime-600 disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Remembered your password?{' '}
              <Link href="/login" className="text-lime-500 hover:underline">
                Back to login
              </Link>
            </p>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Check your inbox
            </h2>
            <p className="text-sm text-gray-500">
              If your email exists, we’ve sent you a link to reset your
              password.
            </p>
            <Link
              href="/login"
              className="inline-block rounded-lg bg-lime-500 px-6 py-2 font-semibold text-white transition hover:bg-lime-600"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
