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
}

export default function FighterCard({
  fighter,
  hp,
  maxHp,
  isWinner = false,
  side,
  floatingMessage,
}: FighterCardProps) {
  const borderColor = side === 'left' ? 'border-blue-500' : 'border-red-500';
  const ringColor = side === 'left' ? 'ring-blue-500' : 'ring-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
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

        {/* Winner Badge */}
        {isWinner && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: 'spring', bounce: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-2 text-white font-bold shadow-lg"
          >
            <span>🏆</span>
            <span>WINNER</span>
          </motion.div>
        )}

        {/* HP Bar */}
        <HPBar hp={hp} maxHp={maxHp} label="HP" className="w-full" />

        {/* Stats */}
        <div className="w-full grid grid-cols-3 gap-3 pt-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400 mb-1">
              <Swords size={16} />
              <span className="text-xs font-medium">ATK</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {fighter.card.attack}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
              <Shield size={16} />
              <span className="text-xs font-medium">DEF</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {fighter.card.defense}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400 mb-1">
              <Zap size={16} />
              <span className="text-xs font-medium">SPD</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {fighter.card.speed}
            </div>
          </div>
        </div>

        {/* Vibe */}
        {fighter.card.vibe && (
          <div className="text-xs text-center text-slate-600 dark:text-slate-400 italic">
            "{fighter.card.vibe}"
          </div>
        )}
      </div>
    </motion.div>
  );
}
