'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/features/AuthGuard';
import DashboardStats from '@/components/features/dashboard/DashboardStats';
import RecentActivities from '@/components/features/dashboard/RecentActivities';
import MyTasks from '@/components/features/dashboard/MyTasks';
import AiRequests from '@/components/features/dashboard/AiRequests';
import { clientsService } from '@/services/clientsService';
import { usersService } from '@/services/usersService';
import { projectsService } from '@/services/projectsService';
import { tasksService } from '@/services/tasksService';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clients: 0,
    projects: 0,
    tasks: 0,
    users: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const accessToken =
          localStorage.getItem('accessToken') ||
          sessionStorage.getItem('accessToken');
        if (!accessToken) return;

        if (user?.role === 'USER') {
          const [projects, tasks] = await Promise.all([
            projectsService.getAll(),
            tasksService.getAll(),
          ]);

          if (isMounted) {
            setStats({
              clients: 0,
              projects: projects.length,
              tasks: tasks.length,
              users: 0,
            });
          }
        } else {
          const [clients, projects, tasks, users] = await Promise.all([
            clientsService.getAll(),
            projectsService.getAll(),
            tasksService.getAll(),
            usersService.getAll(),
          ]);

          if (isMounted) {
            setStats({
              clients: clients.length,
              projects: projects.length,
              tasks: tasks.length,
              users: users.length,
            });
          }
        }
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, [user?.role]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading dashboard...
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={['USER', 'ADMIN', 'SA']}>
      <div className="min-h-screen space-y-8 bg-gray-50 p-6">
        {/* Top cards */}
        <DashboardStats stats={stats} />

        {/* Middle section: Activities + Tasks */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <RecentActivities />
          <MyTasks />
        </div>

        {/* Bottom section: AI Requests */}
        <AiRequests />
      </div>
    </AuthGuard>
  );
}
