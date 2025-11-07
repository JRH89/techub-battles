'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Swords, Trophy, Users, Info, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition"
            onClick={closeMobileMenu}
          >
            <Swords className="h-6 w-6" />
            <span className="hidden sm:inline">TecHub Battles</span>
            <span className="sm:hidden">TecHub</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
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

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                onClick={closeMobileMenu}
              >
                <Swords className="h-5 w-5" />
                <span>Battle</span>
              </Link>

              <Link
                href="/leaderboard"
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                onClick={closeMobileMenu}
              >
                <Trophy className="h-5 w-5" />
                <span>Leaderboard</span>
              </Link>

              <Link
                href="/directory"
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                onClick={closeMobileMenu}
              >
                <Users className="h-5 w-5" />
                <span>Directory</span>
              </Link>

              <Link
                href="/about"
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                onClick={closeMobileMenu}
              >
                <Info className="h-5 w-5" />
                <span>About</span>
              </Link>

              {/* TecHub Link Mobile */}
              <a
                href="https://techub.life"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mx-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-base font-bold text-white hover:from-blue-700 hover:to-purple-700 transition shadow-md"
                onClick={closeMobileMenu}
              >
                <span>Visit TecHub</span>
                <span>→</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
