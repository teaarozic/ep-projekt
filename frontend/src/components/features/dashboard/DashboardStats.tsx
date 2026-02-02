'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UsersRound, UserRound, BookCheck, Network } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Props {
  stats: {
    clients: number;
    projects: number;
    tasks: number;
    users: number;
  };
}

interface DashboardItem {
  label: string;
  value: number;
  icon: React.ElementType;
  href: string;
}

export default function DashboardStats({ stats }: Props) {
  const pathname = usePathname();
  const { user } = useAuth();

  const role = user?.role;
  const isUser = role === 'USER';

  const items: DashboardItem[] = [
    ...(isUser
      ? []
      : [
          {
            label: 'Clients',
            value: stats.clients,
            icon: UsersRound,
            href: '/clients',
          },
        ]),

    {
      label: 'Projects',
      value: stats.projects,
      icon: Network,
      href: '/projects',
    },

    {
      label: 'Tasks',
      value: stats.tasks,
      icon: BookCheck,
      href: '/tasks',
    },

    ...(isUser
      ? []
      : [
          {
            label: 'Users',
            value: stats.users,
            icon: UserRound,
            href: '/users',
          },
        ]),
  ];

  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {items.map((i) => {
        const isActive =
          pathname === i.href || pathname.startsWith(`${i.href}/`);

        return (
          <Link
            key={i.label}
            href={i.href}
            className={`group relative flex flex-col items-center justify-center rounded-xl border p-9 text-center shadow-sm transition-all duration-200 ${
              isActive
                ? 'border-lime-500 bg-lime-50'
                : 'border-gray-300 bg-white hover:border-lime-500 hover:bg-lime-50'
            }`}
          >
            <i.icon
              className={`absolute left-4 top-4 h-7 w-7 transition-colors ${
                isActive
                  ? 'text-lime-700'
                  : 'text-lime-600 group-hover:text-lime-700'
              }`}
            />

            <div>
              <h2 className="text-3xl font-bold text-gray-800">{i.value}</h2>
              <p
                className={`text-sm font-medium ${
                  isActive ? 'text-lime-700' : 'text-lime-600'
                }`}
              >
                {i.label}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
