'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Zap,
  Gauge,
  Skull,
  Trophy,
  Flag,
  Sparkles,
} from 'lucide-react';
import type { BattleEvent } from '@/lib/types';

interface BattleLogProps {
  events: BattleEvent[];
  className?: string;
}

export default function BattleLog({ events, className = '' }: BattleLogProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'battle_start':
        return <Flag className="text-emerald-600 dark:text-emerald-400" size={20} />;
      case 'type_advantage':
        return <Zap className="text-yellow-600 dark:text-yellow-400" size={20} />;
      case 'speed_check':
        return <Gauge className="text-blue-600 dark:text-blue-400" size={20} />;
      case 'attack':
        return <Swords className="text-red-600 dark:text-red-400" size={20} />;
      case 'special_move':
        return <Sparkles className="text-purple-600 dark:text-purple-400" size={20} />;
      case 'passive_trigger':
        return <Sparkles className="text-cyan-600 dark:text-cyan-400" size={20} />;
      case 'knockout':
        return <Skull className="text-red-600 dark:text-red-400" size={20} />;
      case 'battle_end':
        return <Trophy className="text-yellow-500" size={20} />;
      default:
        return null;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'battle_start':
        return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800';
      case 'type_advantage':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'speed_check':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'attack':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'special_move':
      case 'passive_trigger':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800';
      case 'knockout':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'battle_end':
        return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700';
      default:
        return 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  const renderEvent = (event: BattleEvent, index: number) => {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`rounded-lg border-2 p-4 ${getEventColor(event.type)}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon(event.type)}</div>

          <div className="flex-1 min-w-0">
            {/* Turn number */}
            {event.turn && (
              <div className="inline-flex items-center gap-1 rounded-full bg-slate-900/10 dark:bg-slate-100/10 px-2 py-0.5 text-xs font-bold mb-2">
                <span>Turn {event.turn}</span>
              </div>
            )}

            {/* Message */}
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
              {event.message}
            </p>

            {/* Attack details */}
            {event.type === 'attack' && event.damage && (
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-bold text-red-600 dark:text-red-400">
                  -{event.damage} HP
                </span>
                {event.defender_hp !== undefined && (
                  <span>
                    {event.defender} HP: {Math.round(event.defender_hp * 10) / 10}
                  </span>
                )}
              </div>
            )}

            {/* Special move */}
            {event.special_move && (
              <div className="mt-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                ✨ {event.special_move}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl ${className}`}>
      {/* Header */}
      <div className="border-b-2 border-slate-200 dark:border-slate-700 p-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Swords size={24} />
          Battle Log
        </h2>
      </div>

      {/* Events */}
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        <AnimatePresence>
          {events.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-12">
              <Swords size={48} className="mx-auto mb-4 opacity-30" />
              <p>Battle log will appear here...</p>
            </div>
          ) : (
            events.map((event, index) => renderEvent(event, index))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
