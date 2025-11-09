'use client';

import { Swords, Zap, Trophy, Users, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 py-12 min-h-screen h-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 mb-3 sm:mb-4 px-2">
            <span className="hidden sm:inline">⚔️ </span>About TecHub Battles
            <span className="hidden sm:inline"> ⚔️</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 px-4">
            Epic battles between TecHub profiles
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* What is it */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Swords className="h-8 w-8 text-orange-600" />
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500">
                What is TecHub Battles?
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              TecHub Battles is a fun, interactive battle system where TecHub
              profiles compete against each other in epic showdowns. Each
              profile has unique stats, archetypes, spirit animals, and special
              moves that determine their fighting style and abilities.
            </p>
          </div>

          {/* How it works */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-8 w-8 text-yellow-600" />
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500">
                How It Works
              </h2>
            </div>
            <ul className="space-y-3 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-3">
                <span className="text-orange-600 font-bold">1.</span>
                <span>
                  <strong>Choose Your Fighters:</strong> Select two battle-ready
                  profiles from the TecHub community
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-600 font-bold">2.</span>
                <span>
                  <strong>Battle Simulation:</strong> Watch as fighters use
                  their unique stats, archetypes, and special moves
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-600 font-bold">3.</span>
                <span>
                  <strong>Special Moves:</strong> Every 3 turns, fighters
                  unleash powerful special attacks with damage bonuses
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-600 font-bold">4.</span>
                <span>
                  <strong>Type Advantages:</strong> Archetypes have strengths
                  and weaknesses against each other
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-600 font-bold">5.</span>
                <span>
                  <strong>Spirit Animals:</strong> Provide stat modifiers that
                  enhance fighter abilities
                </span>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500">
                Features
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚔️</div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Real-time Battles
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Watch battles unfold with animated attacks and special moves
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">📊</div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Detailed Stats
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Attack, Defense, Speed, and unique player traits
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">✨</div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Special Moves
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Unique abilities with charge bars and visual effects
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🏆</div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Leaderboard
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Track wins, losses, and climb the rankings
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TecHub */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8" />
              <h2 className="text-2xl font-bold text-white">Part of TecHub</h2>
            </div>
            <p className="mb-6 opacity-90">
              TecHub Battles is part of the TecHub ecosystem - a community
              platform for developers and tech enthusiasts. Visit TecHub to
              create your profile, customize your fighter card, and join the
              community!
            </p>
            <a
              href="https://techub.life"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white text-blue-600 px-6 py-3 font-bold hover:bg-slate-100 transition shadow-lg"
            >
              Visit TecHub →
            </a>
          </div>

          {/* Made with love */}
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
              Made with{' '}
              <Heart className="h-5 w-5 text-red-500" fill="currentColor" /> for
              the TecHub community
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
