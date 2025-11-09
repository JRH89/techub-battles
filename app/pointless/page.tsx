'use client';

import { useState } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';

interface ExcuseResponse {
  excuse: string;
  confidence: number;
  timestamp: string;
  blame: string;
  willFixIn: string;
}

export default function PointlessPage() {
  const [excuse, setExcuse] = useState<ExcuseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateExcuse = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pointless/developer-excuse');
      const data = await response.json();
      setExcuse(data);
    } catch (error) {
      console.error('Failed to generate excuse:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (excuse) {
      navigator.clipboard.writeText(excuse.excuse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 py-12 px-4 min-h-screen h-full">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 mb-3 sm:mb-4 px-2">
            <span className="hidden sm:inline">🎭 </span>Developer Excuse Generator
            <span className="hidden sm:inline"> 🎭</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 px-4">
            For when your code doesn&apos;t work and you need a good reason
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-2xl">
          {!excuse ? (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
                Click the button below to generate your excuse
              </p>
              <button
                onClick={generateExcuse}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 px-8 py-4 text-white font-bold text-xl shadow-2xl hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={24} />
                    Generating...
                  </>
                ) : (
                  'Generate Excuse'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Excuse Text */}
              <div className="rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 p-6 border-2 border-slate-200 dark:border-slate-700">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 text-center leading-relaxed">
                  &quot;{excuse.excuse}&quot;
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 p-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Confidence
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {excuse.confidence}%
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 p-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Blame
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 capitalize">
                    {excuse.blame}
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-200 dark:border-orange-800 p-4 sm:col-span-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Will Fix In
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {excuse.willFixIn}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={generateExcuse}
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 px-6 py-3 text-white font-bold shadow-2xl hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    className={loading ? 'animate-spin' : ''}
                    size={20}
                  />
                  New Excuse
                </button>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-6 py-3 text-slate-900 dark:text-slate-100 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  {copied ? (
                    <>
                      <Check size={20} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={20} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* API Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Powered by the Pointless API™
          </p>
          <div className="flex gap-4 justify-center text-xs">
            <a
              href="/api/pointless"
              target="_blank"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
            >
              API Directory
            </a>
            <a
              href="/api/pointless/developer-excuse"
              target="_blank"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
            >
              Raw JSON
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
