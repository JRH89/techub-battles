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
          : 'none'
      }}
      transition={{ 
        duration: isUsingSpecialMove ? 0.8 : 0.5
      }}
      className={`rounded-xl sm:rounded-2xl border-2 sm:border-4 ${borderColor} bg-white dark:bg-slate-900 p-2 sm:p-4 lg:p-6 shadow-2xl relative`}
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
      <div className="flex flex-col items-center space-y-2 sm:space-y-3 lg:space-y-4">
        {/* Avatar */}
        <div className="relative">
          <img
            src={`https://github.com/${fighter.profile.login}.png?size=200`}
            alt={fighter.profile.login}
            className={`h-12 w-12 sm:h-16 sm:w-16 lg:h-24 lg:w-24 rounded-full ring-2 sm:ring-4 ${ringColor} shadow-lg`}
            onError={(e) => {
              // Final fallback to a placeholder if GitHub avatar also fails
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fighter.profile.login)}&size=200&background=random`;
            }}
          />
          {isWinner && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-2xl sm:text-3xl lg:text-4xl"
            >
              👑
            </motion.div>
          )}
        </div>

        {/* Name */}
        <div className="text-center">
          <h2 className="text-sm sm:text-lg lg:text-2xl font-bold text-slate-900 dark:text-slate-100">
            @{fighter.profile.login}
          </h2>
          {fighter.profile.name && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {fighter.profile.name}
            </p>
          )}
        </div>

        {/* Archetype & Spirit Animal */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1 sm:gap-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1">
            <span className="text-xs sm:text-sm font-semibold text-purple-800 dark:text-purple-300">
              {fighter.card.archetype}
            </span>
          </div>
          <div className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
            🦘 {fighter.card.spirit_animal}
          </div>
        </div>

        {/* HP Bar */}
        <HPBar hp={hp} maxHp={maxHp} label="HP" className="w-full" />

        {/* Stats */}
        <div className="w-full grid grid-cols-3 gap-1 sm:gap-2 lg:gap-3 pt-1 sm:pt-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-red-600 dark:text-red-400 mb-0.5 sm:mb-1">
              <Swords size={12} className="sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs font-bold">ATK</span>
            </div>
            <div className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100">
              {fighter.card.attack}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-blue-600 dark:text-blue-400 mb-0.5 sm:mb-1">
              <Shield size={12} className="sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs font-bold">DEF</span>
            </div>
            <div className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100">
              {fighter.card.defense}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-yellow-600 dark:text-yellow-400 mb-0.5 sm:mb-1">
              <Zap size={12} className="sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs font-bold">SPD</span>
            </div>
            <div className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100">
              {fighter.card.speed}
            </div>
          </div>
        </div>

        {/* Player Traits - 2x2 Grid - Hidden on mobile and landscape */}
        <div className="hidden lg:grid w-full grid-cols-2 gap-2 pt-2">
          {/* Buff */}
          <div className="border border-green-200 dark:border-green-800 rounded-md sm:rounded-lg p-1 sm:p-2">
            <div className="text-[9px] sm:text-xs font-bold text-green-700 dark:text-green-400 mb-0.5 sm:mb-1 uppercase tracking-wide">
              Buff
            </div>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {fighter.card.buff || "—"}
            </p>
          </div>

          {/* Weakness */}
          <div className="border border-red-200 dark:border-red-800 rounded-md sm:rounded-lg p-1 sm:p-2">
            <div className="text-[9px] sm:text-xs font-bold text-red-700 dark:text-red-400 mb-0.5 sm:mb-1 uppercase tracking-wide">
              Weakness
            </div>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {fighter.card.weakness || "—"}
            </p>
          </div>

          {/* Vibe */}
          <div className="border border-teal-200 dark:border-teal-800 rounded-md sm:rounded-lg p-1 sm:p-2">
            <div className="text-[9px] sm:text-xs font-bold text-teal-700 dark:text-teal-400 mb-0.5 sm:mb-1 uppercase tracking-wide">
              Vibe
            </div>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {fighter.card.vibe || "—"}
            </p>
          </div>

          {/* Special Move */}
          <div className="border border-indigo-200 sm:border-2 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-teal-50 dark:from-indigo-950/20 dark:to-teal-950/20 rounded-md sm:rounded-lg p-1 sm:p-2 relative overflow-hidden">
            <div className="text-[9px] sm:text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-0.5 sm:mb-1 uppercase tracking-wide">
              Special
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-indigo-900 dark:text-indigo-100 mb-0.5 sm:mb-1 truncate">
              {fighter.card.special_move || "—"}
            </p>
            {/* Charge Bar */}
            <div className="h-1 sm:h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
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
