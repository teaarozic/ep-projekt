'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { aiService } from '@/services/aiService';

export default function SummarizePage() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSummarize() {
    if (!text.trim()) {
      setError('Please enter text to summarize.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const data = await aiService.summarizeText(text);
      setSummary(data.summary);
    } catch {
      setError('Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-10">
      {/* ===== Header ===== */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Text Summary</h1>
        <p className="mt-1 text-sm text-gray-500">
          Condense your text to its essential ideas instantly.
        </p>
      </header>

      {/* ===== Layout (2 columns) ===== */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* === LEFT PANEL === */}
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            placeholder="Paste or type your text here..."
            className="min-h-[300px] w-full flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-lime-400"
            style={{
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
            }}
          />
          <div className="mt-2 text-xs text-gray-400">
            {text.length} / 1000 characters
          </div>

          <div className="mt-4 flex items-center gap-3">
            {/* Generate Summary */}
            <button
              onClick={handleSummarize}
              disabled={loading || !text.trim()}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                loading || !text.trim()
                  ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                  : 'border-lime-500 bg-lime-100 text-lime-700 hover:bg-lime-200'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate Summary
                </>
              )}
            </button>

            {/* Clear */}
            <button
              onClick={() => {
                setText('');
                setSummary('');
                setError(null);
              }}
              className="rounded-xl border border-lime-500 bg-white px-4 py-2 text-sm font-medium text-lime-700 transition-all duration-200 hover:bg-lime-50"
            >
              Clear
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        </div>

        {/* === RIGHT PANEL === */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-center text-sm font-semibold text-gray-700">
            Generated Summary
          </h2>
          <p className="mb-6 text-center text-xs text-gray-400">
            AI-generated concise version of your text
          </p>

          {summary ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {summary}
            </p>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center text-sm italic text-gray-400">
              <Sparkles className="mb-2 h-6 w-6 text-lime-400" />
              Your summary will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
