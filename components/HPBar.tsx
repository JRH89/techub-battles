'use client';

import { motion } from 'framer-motion';

interface HPBarProps {
  hp: number;
  maxHp: number;
  label: string;
  className?: string;
}

export default function HPBar({
  hp,
  maxHp,
  label,
  className = '',
}: HPBarProps) {
  const percentage = Math.max(0, Math.min(100, (hp / maxHp) * 100));

  const getColor = () => {
    if (percentage > 60) return 'bg-emerald-500';
    if (percentage > 40) return 'bg-yellow-500';
    if (percentage > 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {Math.round(hp)} / {maxHp}
        </span>
      </div>
      <div className="h-8 bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700 shadow-inner">
        <motion.div
          className={`h-full ${getColor()} rounded-full shadow-lg`}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
