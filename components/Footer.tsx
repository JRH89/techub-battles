'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">TecHub Battles</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Battle system for TecHub profiles. Choose your fighter, engage in epic battles, and climb the leaderboard!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Battle Arena
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/directory" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Fighter Directory
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* TecHub */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">TecHub</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Part of the TecHub ecosystem
            </p>
            <a 
              href="https://techub.life" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
            >
              Visit TecHub →
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
            Made with <Heart className="h-4 w-4 text-red-500" fill="currentColor" /> for the TecHub community
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} TecHub Battles
          </p>
        </div>
      </div>
    </footer>
  );
}
