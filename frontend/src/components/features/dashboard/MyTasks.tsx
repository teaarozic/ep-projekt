'use client';

import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboardService';
import { CheckCircle, AlertCircle, MinusCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatusIcon {
  icon: LucideIcon;
  color: string;
}

interface Task {
  id: number;
  title: string;
  status: string;
  project?: {
    id: number;
    name: string;
  } | null;
}

const statusIcons: Record<string, StatusIcon> = {
  IN_PROGRESS: { icon: AlertCircle, color: 'text-orange-500' },
  DONE: { icon: CheckCircle, color: 'text-green-500' },
  BLOCKED: { icon: MinusCircle, color: 'text-red-500' },
};

export default function MyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getMyTasks()
      .then((data) => setTasks(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-800">My tasks</h3>
        <p className="text-sm text-gray-500">No assigned tasks yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-gray-800">My tasks</h3>
      <ul className="space-y-3">
        {tasks.map((t) => {
          const iconData = statusIcons[t.status?.toUpperCase()] || {
            icon: AlertCircle,
            color: 'text-gray-500',
          };
          const Icon = iconData.icon;
          return (
            <li key={t.id} className="flex items-center gap-3">
              <Icon className={`${iconData.color} h-5 w-5`} />
              <span className="font-medium text-gray-700">
                {t.title} {t.project ? `(${t.project.name})` : ''}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
