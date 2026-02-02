'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Clock,
  FileText,
  Smile,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import { aiService, AiResult } from '@/services/aiService';

export default function AiDashboardPage() {
  const [results, setResults] = useState<AiResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await aiService.getResults();
        setResults(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* === Header === */}
      <header className="mb-10">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          AI Tools Dashboard
          <Sparkles className="h-5 w-5 text-lime-400" />
        </h1>
        <p className="text-gray-600">
          Access powerful AI analysis tools: text summary, sentiment and CSV
          analysis.
        </p>
      </header>

      {/* === Tool Cards === */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Summarize */}
        <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <FileText className="mb-2 h-10 w-10 text-lime-500" />
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            SUMMARIZE TEXT
          </h2>
          <p className="mb-4 text-center text-sm text-gray-500">
            Generate concise summaries (up to 1000 characters)
          </p>
          <Link
            href="/ai/summarize"
            className="rounded-xl bg-lime-100 px-6 py-2 text-sm font-medium text-lime-700 transition hover:bg-lime-200"
          >
            Summarize
          </Link>
        </div>

        {/* Sentiment */}
        <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <Smile className="mb-2 h-10 w-10 text-lime-500" />
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            ANALYZE SENTIMENT
          </h2>
          <p className="mb-4 text-center text-sm text-gray-500">
            Detect the emotional tone and polarity of your text.
          </p>
          <Link
            href="/ai/sentiment"
            className="rounded-xl bg-lime-100 px-6 py-2 text-sm font-medium text-lime-700 transition hover:bg-lime-200"
          >
            Analyze Sentiment
          </Link>
        </div>

        {/* CSV */}
        <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <FileSpreadsheet className="mb-2 h-10 w-10 text-lime-500" />
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            ANALYZE CSV
          </h2>
          <p className="mb-4 text-center text-sm text-gray-500">
            Check your CSV’s stats, columns, and preview.
          </p>
          <Link
            href="/ai/csv"
            className="rounded-xl bg-lime-100 px-6 py-2 text-sm font-medium text-lime-700 transition hover:bg-lime-200"
          >
            Upload CSV
          </Link>
        </div>
      </div>

      {/* === Recent Analyses === */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-lime-600" />
          <h2 className="text-lg font-semibold text-gray-800">
            Recent Analyses
          </h2>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading results...
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600">
            Error loading results: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl bg-white p-4 shadow-sm">
            <table className="w-full border-collapse text-center text-sm">
              <thead className="border-b text-gray-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Preview</th>
                  <th className="px-4 py-3">Time Stamp</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center italic text-gray-500"
                    >
                      No recent analyses found
                    </td>
                  </tr>
                ) : (
                  results.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {r.id.toString().padStart(3, '0')}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.type === 'SUMMARIZE'
                          ? 'Text Summary'
                          : r.type === 'SENTIMENT'
                            ? 'Sentiment'
                            : 'CSV'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.preview}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(r.timeStamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            r.status === 'SUCCESS'
                              ? 'bg-lime-100 text-lime-700'
                              : r.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {r.status === 'SUCCESS'
                            ? 'Completed'
                            : r.status === 'PENDING'
                              ? 'Pending'
                              : 'Error'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
