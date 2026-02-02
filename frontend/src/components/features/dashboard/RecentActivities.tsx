'use client';

import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboardService';
import toast from 'react-hot-toast';
import { getDisplayName, getInitials } from '@/utils/userDisplay';
import { logger } from '@/utils/logger';

interface Activity {
  id: number;
  actor: string;
  action: string;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export default function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchActivities = async () => {
      try {
        if (typeof window === 'undefined') return;

        const token =
          localStorage.getItem('accessToken') ||
          sessionStorage.getItem('accessToken');

        if (!token) {
          logger.warn('[RecentActivities] No access token found');
          if (isMounted) {
            setError('Please login to view activities');
            setLoading(false);
          }
          return;
        }

        const data = await dashboardService.getRecentActivities();
        if (isMounted) {
          setActivities(data);
          setError(null);
        }
      } catch (err) {
        logger.error('[RecentActivities] Failed to fetch activities:', err);
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : 'Failed to load activities';
          setError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchActivities();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="col-span-2 rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-lime-600"></div>
          <span className="ml-3 text-gray-600">Loading activities...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-2 rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <h3 className="mb-2 font-semibold text-red-800">
          Recent <span className="text-red-600">Activities</span>
        </h3>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="col-span-2 rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-800">
          Recent <span className="text-lime-600">Activities</span>
        </h3>
        <p className="text-sm text-gray-500">No recent activities found.</p>
      </div>
    );
  }

  return (
    <div className="col-span-2 rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-gray-800">
        Recent <span className="text-lime-600">Activities</span>
      </h3>
      <ul className="space-y-3">
        {activities.map((a) => {
          const displayName = getDisplayName(a.user);
          const initials = getInitials(a.user);

          return (
            <li key={a.id} className="flex items-center gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-lime-500 text-sm font-semibold text-white">
                {initials}
              </div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{displayName}</span> {a.action}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
