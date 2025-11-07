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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎭 Developer Excuse Generator
          </h1>
          <p className="text-xl text-purple-200">
            For when your code doesn't work and you need a good reason
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {!excuse ? (
            <div className="text-center py-12">
              <p className="text-white/80 text-lg mb-6">
                Click the button below to generate your excuse
              </p>
              <button
                onClick={generateExcuse}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="animate-spin" size={20} />
                    Generating...
                  </span>
                ) : (
                  'Generate Excuse'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Excuse Text */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <p className="text-3xl font-bold text-white text-center leading-relaxed">
                  "{excuse.excuse}"
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-purple-300 text-sm uppercase tracking-wide mb-1">
                    Confidence
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {excuse.confidence}%
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-purple-300 text-sm uppercase tracking-wide mb-1">
                    Blame
                  </p>
                  <p className="text-2xl font-bold text-white capitalize">
                    {excuse.blame}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 col-span-2">
                  <p className="text-purple-300 text-sm uppercase tracking-wide mb-1">
                    Will Fix In
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {excuse.willFixIn}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={generateExcuse}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                >
                  <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
                  New Excuse
                </button>
                <button
                  onClick={copyToClipboard}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all border border-white/20 flex items-center justify-center gap-2"
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
          <p className="text-white/60 text-sm mb-2">
            Powered by the Pointless API™
          </p>
          <div className="flex gap-4 justify-center text-xs">
            <a
              href="/api/pointless"
              target="_blank"
              className="text-purple-300 hover:text-purple-200 underline"
            >
              API Directory
            </a>
            <a
              href="/api/pointless/developer-excuse"
              target="_blank"
              className="text-purple-300 hover:text-purple-200 underline"
            >
              Raw JSON
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
