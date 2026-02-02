'use client';

import { useState } from 'react';
import { Users2, Network } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useRouter } from 'next/navigation';

interface Props {
  stats: {
    total: number;
    active: number;
    inactive: number;
    totalProjects: number;
  };
  onFilter?: (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
}

export default function ClientsStats({ stats, onFilter }: Props) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<
    'ALL' | 'ACTIVE' | 'INACTIVE'
  >('ALL');

  const items = [
    {
      label: 'Total clients',
      value: stats.total,
      icon: Users2,
      key: 'ALL' as const,
    },
    {
      label: 'Active',
      value: stats.active,
      icon: 'dot-green',
      key: 'ACTIVE' as const,
    },
    {
      label: 'Inactive',
      value: stats.inactive,
      icon: 'dot-gray',
      key: 'INACTIVE' as const,
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-6">
      <div className="flex flex-wrap gap-4">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              setActiveFilter(item.key);
              onFilter?.(item.key);
            }}
            className={cn(
              'group relative flex h-[90px] w-[200px] flex-col items-center justify-center rounded-xl px-6 py-4 shadow-sm transition-all',
              activeFilter === item.key
                ? 'border-lime-500 bg-lime-50'
                : 'border border-gray-300 bg-white hover:border-lime-500 hover:bg-lime-50'
            )}
          >
            <div className="absolute left-4 top-3">
              {item.icon === 'dot-green' ? (
                <div className="h-4 w-4 rounded-full bg-lime-500" />
              ) : item.icon === 'dot-gray' ? (
                <div className="h-4 w-4 rounded-full bg-gray-400" />
              ) : (
                <item.icon className="h-6 w-6 text-lime-600" />
              )}
            </div>

            <div className="mt-2 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold leading-none text-gray-800">
                {item.value}
              </h2>
              <p className="mt-1 text-sm font-medium leading-none text-gray-700">
                {item.label}
              </p>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => router.push('/projects')}
        className="relative flex h-[90px] w-[200px] flex-col items-center justify-center rounded-xl border border-lime-300 bg-white px-6 py-4 shadow-sm transition-all hover:border-lime-500 hover:bg-lime-50"
      >
        <div className="absolute left-4 top-3">
          <Network className="h-6 w-6 text-sky-600" />
        </div>

        <div className="mt-2 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold leading-none text-gray-800">
            {stats.totalProjects}
          </h2>
          <p className="mt-1 text-sm font-medium leading-none text-gray-700">
            No of projects
          </p>
        </div>
      </button>
    </div>
  );
}
