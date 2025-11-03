'use client';

import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';

interface BattleControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

export default function BattleControls({
  isPlaying,
  onPlay,
  onPause,
  onReset,
  speed,
  onSpeedChange,
  disabled = false,
}: BattleControlsProps) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Play/Pause/Reset */}
        <div className="flex items-center gap-3">
          {!isPlaying ? (
            <button
              onClick={onPlay}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 text-white font-bold shadow-lg hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={20} />
              <span>Play Battle</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-white font-bold shadow-lg hover:from-amber-700 hover:to-orange-700 transition-all"
            >
              <Pause size={20} />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={onReset}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-3 text-white font-bold shadow-lg hover:from-slate-700 hover:to-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw size={20} />
            <span>Reset</span>
          </button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-3">
          <FastForward size={20} className="text-slate-600 dark:text-slate-400" />
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Speed:
          </label>
          <div className="flex items-center gap-2">
            {[0.5, 1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  speed === s
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
