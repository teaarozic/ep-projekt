'use client';

import { useState } from 'react';
import { Loader2, Sparkles, Smile } from 'lucide-react';
import { aiService } from '@/services/aiService';

export default function SentimentPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<{
    polarity: number;
    tone: 'Positive' | 'Neutral' | 'Negative' | null;
  }>({ polarity: 0, tone: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!text.trim()) {
      setError('Please enter text to analyze.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const data = await aiService.analyzeSentiment(text);
      setResult({ polarity: data.polarity, tone: data.tone });
    } catch {
      setError('Failed to analyze sentiment.');
    } finally {
      setLoading(false);
    }
  }

  const getToneColor = (tone: string | null) => {
    switch (tone) {
      case 'Positive':
        return 'text-lime-600';
      case 'Negative':
        return 'text-red-600';
      case 'Neutral':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-10">
      {/* ===== Header ===== */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Sentiment Analysis
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Analyze the emotional tone and polarity of your text.
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
            placeholder="Enter a sentence or paragraph to analyze..."
            className="min-h-[300px] w-full flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-lime-400"
            style={{
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
            }}
          />
          <div className="mt-2 text-xs text-gray-400">
            {text.length} / 1000 characters
          </div>

          <div className="mt-4 flex items-center gap-3">
            {/* Analyze */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                loading || !text.trim()
                  ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                  : 'border-lime-500 bg-lime-100 text-lime-700 hover:bg-lime-200'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Smile className="h-4 w-4" /> Analyze Sentiment
                </>
              )}
            </button>

            {/* Clear */}
            <button
              onClick={() => {
                setText('');
                setResult({ polarity: 0, tone: null });
                setError(null);
              }}
              className="rounded-xl border border-lime-500 bg-white px-4 py-2 text-sm font-medium text-lime-700 transition-all duration-200 hover:bg-lime-50"
            >
              Clear
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <div className="mt-6 text-center text-xs text-gray-500">
            <p className="mb-1 font-semibold">Try these examples:</p>
            <p>
              <span className="font-medium text-lime-600">Positive:</span> “This
              product is amazing! Best purchase ever.”
            </p>
            <p>
              <span className="font-medium text-gray-600">Neutral:</span> “The
              service was okay, nothing special.”
            </p>
            <p>
              <span className="font-medium text-red-600">Negative:</span> “Very
              disappointed. Would not recommend.”
            </p>
          </div>
        </div>

        {/* === RIGHT PANEL === */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-center text-sm font-semibold text-gray-700">
            Analysis Results
          </h2>
          <p className="mb-6 text-center text-xs text-gray-400">
            Sentiment polarity and emotional tone detection
          </p>

          {result.tone ? (
            <div className="flex h-[300px] flex-col items-center justify-center text-center">
              <p
                className={`text-xl font-semibold ${getToneColor(result.tone)}`}
              >
                {result.tone}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Polarity: {result.polarity.toFixed(3)}
              </p>
            </div>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center text-sm italic text-gray-400">
              <Sparkles className="mb-2 h-6 w-6 text-lime-400" />
              Analysis results will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
