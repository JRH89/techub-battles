'use client';

import Link from 'next/link';
import { Swords, Trophy, Users, Info } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition">
            <Swords className="h-6 w-6" />
            <span>TecHub Battles</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <Swords className="h-4 w-4" />
              <span>Battle</span>
            </Link>
            
            <Link 
              href="/leaderboard" 
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </Link>
            
            <Link 
              href="/directory" 
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <Users className="h-4 w-4" />
              <span>Directory</span>
            </Link>
            
            <Link 
              href="/about" 
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <Info className="h-4 w-4" />
              <span>About</span>
            </Link>

            {/* TecHub Link */}
            <a 
              href="https://techub.life" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-bold text-white hover:from-blue-700 hover:to-purple-700 transition shadow-md"
            >
              <span>Visit TecHub</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
