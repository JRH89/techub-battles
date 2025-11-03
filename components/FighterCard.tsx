'use client';

import { motion } from 'framer-motion';
import { Swords, Shield, Zap } from 'lucide-react';
import type { Fighter } from '@/lib/types';
import HPBar from './HPBar';

interface FighterCardProps {
  fighter: Fighter;
  hp: number;
  maxHp: number;
  isWinner?: boolean;
  side: 'left' | 'right';
  floatingMessage?: string;
  specialMoveCharge?: number; // 0-3, charges every turn, triggers at 3
  isUsingSpecialMove?: boolean; // True when special move is being used
}

export default function FighterCard({
  fighter,
  hp,
  maxHp,
  isWinner = false,
  side,
  floatingMessage,
  specialMoveCharge = 0,
  isUsingSpecialMove = false,
}: FighterCardProps) {
  const borderColor = side === 'left' ? 'border-blue-500' : 'border-red-500';
  const ringColor = side === 'left' ? 'ring-blue-500' : 'ring-red-500';
  const chargePercentage = (specialMoveCharge / 3) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        scale: isUsingSpecialMove ? [1, 1.05, 1] : 1,
        boxShadow: isUsingSpecialMove 
          ? ['0 0 0 0 rgba(99, 102, 241, 0)', '0 0 40px 10px rgba(99, 102, 241, 0.8)', '0 0 0 0 rgba(99, 102, 241, 0)']
          : undefined
      }}
      transition={{ 
        duration: isUsingSpecialMove ? 0.8 : 0.5,
        scale: { repeat: isUsingSpecialMove ? 1 : 0 }
      }}
      className={`rounded-2xl border-4 ${borderColor} bg-white dark:bg-slate-900 p-6 shadow-2xl relative`}
    >
      {/* Floating Battle Message */}
      {floatingMessage && (
        <motion.div
          key={floatingMessage}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: -40, scale: 1 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap"
        >
          <div className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 text-white font-bold text-xl shadow-2xl border-2 border-white">
            {floatingMessage}
          </div>
        </motion.div>
      )}
      <div className="flex flex-col items-center space-y-4">
        {/* Avatar */}
        <div className="relative">
          <img
            src={fighter.profile.avatar_url || `https://github.com/${fighter.profile.login}.png`}
            alt={fighter.profile.login}
            className={`h-24 w-24 rounded-full ring-4 ${ringColor} shadow-lg`}
            onError={(e) => {
              e.currentTarget.src = `https://github.com/${fighter.profile.login}.png`;
            }}
          />
          {isWinner && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="absolute -top-2 -right-2 text-4xl"
            >
              👑
            </motion.div>
          )}
        </div>

        {/* Name */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            @{fighter.profile.login}
          </h2>
          {fighter.profile.name && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {fighter.profile.name}
            </p>
          )}
        </div>

        {/* Archetype & Spirit Animal */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-4 py-1">
            <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">
              {fighter.card.archetype}
            </span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            🦘 {fighter.card.spirit_animal}
          </div>
        </div>

        {/* HP Bar */}
        <HPBar hp={hp} maxHp={maxHp} label="HP" className="w-full" />

        {/* Stats */}
        <div className="w-full grid grid-cols-3 gap-3 pt-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400 mb-1">
              <Swords size={16} />
              <span className="text-xs font-bold">ATK</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {fighter.card.attack}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
              <Shield size={16} />
              <span className="text-xs font-bold">DEF</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {fighter.card.defense}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400 mb-1">
              <Zap size={16} />
              <span className="text-xs font-bold">SPD</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {fighter.card.speed}
            </div>
          </div>
        </div>

        {/* Player Traits - 2x2 Grid */}
        <div className="w-full grid grid-cols-2 gap-2 pt-2">
          {/* Buff */}
          <div className="border border-green-200 dark:border-green-800 rounded-lg p-2">
            <div className="text-xs font-bold text-green-700 dark:text-green-400 mb-1 uppercase tracking-wide">
              Buff
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {fighter.card.buff || "—"}
            </p>
          </div>

          {/* Weakness */}
          <div className="border border-red-200 dark:border-red-800 rounded-lg p-2">
            <div className="text-xs font-bold text-red-700 dark:text-red-400 mb-1 uppercase tracking-wide">
              Weakness
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {fighter.card.weakness || "—"}
            </p>
          </div>

          {/* Vibe */}
          <div className="border border-teal-200 dark:border-teal-800 rounded-lg p-2">
            <div className="text-xs font-bold text-teal-700 dark:text-teal-400 mb-1 uppercase tracking-wide">
              Vibe
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {fighter.card.vibe || "—"}
            </p>
          </div>

          {/* Special Move */}
          <div className="border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-teal-50 dark:from-indigo-950/20 dark:to-teal-950/20 rounded-lg p-2 relative overflow-hidden">
            <div className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1 uppercase tracking-wide">
              Special
            </div>
            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-100 mb-1">
              {fighter.card.special_move || "—"}
            </p>
            {/* Charge Bar */}
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${chargePercentage}%`,
                  boxShadow: chargePercentage === 100 
                    ? ['0 0 0 0 rgba(99, 102, 241, 0.7)', '0 0 10px 2px rgba(99, 102, 241, 0.9)', '0 0 0 0 rgba(99, 102, 241, 0.7)']
                    : undefined
                }}
                transition={{ 
                  width: { duration: 0.3 },
                  boxShadow: { duration: 0.5, repeat: Infinity }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
