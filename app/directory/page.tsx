'use client';

import { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';
import Link from 'next/link';
import type { Fighter } from '@/lib/types';
import { getFightersFromFirestore } from '@/lib/fighter-sync';

export default function DirectoryPage() {
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [filteredFighters, setFilteredFighters] = useState<Fighter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFighters();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = fighters.filter(
        (f) =>
          f.profile.login.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.profile.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.card.archetype.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFighters(filtered);
    } else {
      setFilteredFighters(fighters);
    }
  }, [searchQuery, fighters]);

  const loadFighters = async () => {
    try {
      const data = await getFightersFromFirestore();
      setFighters(data);
      setFilteredFighters(data);
    } catch (error) {
      // Error loading fighters
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 py-12 min-h-screen h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 mb-3 sm:mb-4 px-2">
            <span className="hidden sm:inline">👥 </span>Fighter Directory
            <span className="hidden sm:inline"> 👥</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 px-4">
            Browse all battle-ready fighters
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search fighters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Fighters Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Loading fighters...
            </p>
          </div>
        ) : filteredFighters.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
            <Users className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              No fighters found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchQuery
                ? 'Try a different search term'
                : 'No battle-ready fighters available'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
              Showing {filteredFighters.length} fighter
              {filteredFighters.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFighters.map((fighter) => (
                <Link
                  key={fighter.profile.id}
                  href={`/player/${fighter.profile.login}`}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-blue-500 dark:hover:border-blue-500 transition shadow-lg hover:shadow-xl cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <img
                      src={`https://github.com/${fighter.profile.login}.png?size=160`}
                      alt={fighter.profile.login}
                      className="h-20 w-20 rounded-full ring-4 ring-blue-500 shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fighter.profile.login)}&size=160&background=random`;
                      }}
                    />
                  </div>

                  {/* Name */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      @{fighter.profile.login}
                    </h3>
                    {fighter.profile.name && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {fighter.profile.name}
                      </p>
                    )}
                  </div>

                  {/* Archetype */}
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1">
                      <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">
                        {fighter.card.archetype}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-red-600 dark:text-red-400 font-bold">
                        ATK
                      </div>
                      <div className="text-slate-900 dark:text-slate-100 font-bold">
                        {fighter.card.attack}
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-600 dark:text-blue-400 font-bold">
                        DEF
                      </div>
                      <div className="text-slate-900 dark:text-slate-100 font-bold">
                        {fighter.card.defense}
                      </div>
                    </div>
                    <div>
                      <div className="text-yellow-600 dark:text-yellow-400 font-bold">
                        SPD
                      </div>
                      <div className="text-slate-900 dark:text-slate-100 font-bold">
                        {fighter.card.speed}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
