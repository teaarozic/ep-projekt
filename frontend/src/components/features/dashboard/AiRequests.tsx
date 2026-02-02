'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Smile, FileSpreadsheet } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { logger } from '@/utils/logger';

interface AiRequestItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  href: string;
}

interface AiStatsResponse {
  summarize: number;
  sentiment: number;
  csv: number;
}

export default function AiRequests() {
  const [items, setItems] = useState<AiRequestItem[]>([
    {
      icon: FileText,
      label: 'Summarize',
      value: 0,
      href: '/ai/summarize',
    },
    {
      icon: Smile,
      label: 'Sentiment',
      value: 0,
      href: '/ai/sentiment',
    },
    {
      icon: FileSpreadsheet,
      label: 'CSV',
      value: 0,
      href: '/ai/csv',
    },
  ]);

  useEffect(() => {
    async function loadStats() {
      try {
        const stats =
          await apiClient.get<AiStatsResponse>('/api/core/ai/stats');

        setItems((prev) =>
          prev.map((item) => ({
            ...item,
            value:
              stats[item.label.toLowerCase() as keyof AiStatsResponse] ?? 0,
          }))
        );
      } catch (err) {
        logger.error('[AiRequests] Failed to load AI stats:', err);
      }
    }

    loadStats();
  }, []);

  return (
    <div>
      <h3 className="mb-2 font-semibold text-gray-800">
        <span className="text-lime-600">AI</span> Requests
      </h3>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {items.map((i, idx) => (
          <Link
            href={i.href}
            key={idx}
            className="rounded-xl border bg-white p-6 text-center shadow-sm transition hover:shadow-md"
          >
            <i.icon className="mx-auto mb-2 h-6 w-6 text-lime-600" />
            <p className="text-sm font-medium text-gray-700">{i.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {i.value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
