'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

interface PageStateProps {
  title: string;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  children?: React.ReactNode;
}

/**
 * Reusable wrapper for pages that share the same loading / error UI.
 */
export function PageState({
  title,
  loading,
  error,
  onRetry,
  children,
}: PageStateProps) {
  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="mb-4 text-3xl font-bold">{title}</h1>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-red-500">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2">Error: {error}</p>
        {onRetry && (
          <Button onClick={onRetry} className="mt-4" variant="outline">
            Try again
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
