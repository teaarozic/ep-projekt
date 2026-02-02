'use client';

import { useState } from 'react';
import { Upload, Loader2, FileSpreadsheet } from 'lucide-react';
import { aiService, type CsvResponse } from '@/services/aiService';

export default function CsvAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CsvResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) return;

    if (!selected.name.endsWith('.csv')) {
      setError('Only CSV files are allowed.');
      return;
    }

    setError(null);
    setFile(selected);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    if (!dropped.name.endsWith('.csv')) {
      setError('Only CSV files are allowed.');
      return;
    }

    setError(null);
    setFile(dropped);
  }

  async function handleAnalyze() {
    if (!file) {
      setError('Please select a CSV file.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await aiService.analyzeCsv(file);
      setResult(data);
    } catch {
      setError('Failed to analyze the CSV file.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-10">
      {/* HEADER */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          CSV Analysis Tool
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload a CSV file to analyze columns, numeric data, and structure.
        </p>
      </header>

      {/* UPLOAD CARD */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="csv-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border text-center transition ${isDragging ? 'border-lime-400 bg-lime-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'} `}
          style={{ boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.05)' }}
        >
          <Upload className="mb-2 h-8 w-8 text-lime-600" />

          {file ? (
            <p className="text-sm font-medium text-lime-700">{file.name}</p>
          ) : (
            <p className="text-sm text-gray-600">
              Click to upload or drag & drop
              <br />
              <span className="text-xs text-gray-400">CSV files only</span>
            </p>
          )}

          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>

        {/* ACTION BUTTONS */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              !file || loading
                ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                : 'border border-lime-500 bg-lime-100 text-lime-700 hover:bg-lime-200'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4 text-lime-700" />
                Analyze CSV
              </>
            )}
          </button>

          <button
            onClick={() => {
              setFile(null);
              setResult(null);
              setError(null);
            }}
            className="rounded-xl border border-lime-500 bg-white px-4 py-2 text-sm font-medium text-lime-700 transition hover:bg-lime-50"
          >
            Clear
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>

      {/* HOW IT WORKS */}
      <div className="mt-10 text-center">
        <FileSpreadsheet className="mx-auto h-5 w-5 text-lime-500" />

        <p className="mt-3 text-sm text-gray-500">
          Click <span className="font-medium">"Analyze CSV"</span> to get:
        </p>

        <div className="mt-2 text-xs leading-relaxed text-gray-400">
          <p>• Basic file statistics (rows, columns, file name)</p>
          <p>• Column names</p>
          <p>• Numeric summary (min, max, avg)</p>
        </div>
      </div>

      {/* RESULTS */}
      {result && (
        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* TITLE */}
          <h2 className="text-md text-center font-semibold text-gray-800">
            CSV File Statistics
          </h2>

          <p className="mb-6 text-center text-xs text-gray-400">
            Summary of structure and numeric data
          </p>

          {/* STATS CARDS */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-4 text-center shadow-sm">
              <p className="text-xs text-gray-500">Rows</p>
              <p className="text-xl font-semibold text-gray-700">
                {result.rows}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 text-center shadow-sm">
              <p className="text-xs text-gray-500">Columns</p>
              <p className="text-xl font-semibold text-gray-700">
                {result.columns}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 text-center shadow-sm">
              <p className="text-xs text-gray-500">File Name</p>
              <p className="text-sm font-medium text-gray-700">
                {result.fileName}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 text-center shadow-sm">
              <p className="text-xs text-gray-500">Result ID</p>
              <p className="text-sm font-medium text-gray-700">
                #{result.resultId}
              </p>
            </div>
          </div>

          {/* COLUMN NAMES */}
          <h3 className="text-md mb-2 font-semibold text-gray-800">
            Column Names
          </h3>

          <div className="mb-6 flex flex-wrap gap-2 rounded-lg bg-gray-50 p-4">
            {result.columnNames.map((col) => (
              <span
                key={col}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm"
              >
                {col}
              </span>
            ))}
          </div>

          {/* NUMERIC SUMMARY */}
          <h3 className="text-md mb-2 font-semibold text-gray-800">
            Numeric Column Summary
          </h3>

          <table className="w-full border-collapse overflow-hidden rounded-xl text-sm shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="px-3 py-2 text-left">Column</th>
                <th className="px-3 py-2 text-center">Min</th>
                <th className="px-3 py-2 text-center">Max</th>
                <th className="px-3 py-2 text-center">Avg</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result.numericSummary).map(
                ([name, stats], idx) => (
                  <tr
                    key={name}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-3 py-2 text-left font-medium text-gray-800">
                      {name}
                    </td>
                    <td className="px-3 py-2 text-center">{stats.min}</td>
                    <td className="px-3 py-2 text-center">{stats.max}</td>
                    <td className="px-3 py-2 text-center">
                      {stats.avg.toFixed(2)}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
