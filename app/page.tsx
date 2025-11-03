'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Swords, Loader } from 'lucide-react';
import type { Fighter, GameData } from '@/lib/types';

export default function Home() {
  const router = useRouter();
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [challengerId, setChallengerId] = useState('');
  const [opponentId, setOpponentId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        const { 
          shouldSyncFighters, 
          getFightersFromFirestore, 
          syncFightersFromRails,
          getGameDataFromFirestore,
          syncGameDataFromRails
        } = await import('@/lib/fighter-sync');
        
        // Check if we need to sync from Rails
        const needsSync = await shouldSyncFighters();
        
        if (needsSync) {
          console.log('Syncing data from Rails (first time or >24hrs old)...');
          // Sync both fighters and game data
          await Promise.all([
            syncFightersFromRails(),
            syncGameDataFromRails()
          ]);
        }
        
        // Get everything from Firestore (fast, no Rails calls)
        const [profilesData, gameDataResponse] = await Promise.all([
          getFightersFromFirestore(),
          getGameDataFromFirestore()
        ]);
        
        setFighters(profilesData);
        setGameData(gameDataResponse);
        
        if (profilesData.length >= 2) {
          setChallengerId(profilesData[0].profile.id.toString());
          setOpponentId(profilesData[1].profile.id.toString());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleStartBattle = () => {
    if (!challengerId || !opponentId) {
      setError('Please select both fighters');
      return;
    }
    if (challengerId === opponentId) {
      setError('Cannot battle yourself!');
      return;
    }
    router.push(`/battle?challenger=${challengerId}&opponent=${opponentId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
        <div className="text-center">
          <Loader className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Loading battle data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 mb-4">
            ⚔️ TecHub Battles ⚔️
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Watch GitHub developer cards battle it out!
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border-2 border-red-200 p-4 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Fighter Selection */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Swords size={28} />
            Select Fighters
          </h2>

          <div className="space-y-6">
            {/* Challenger */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Challenger
              </label>
              <select
                value={challengerId}
                onChange={(e) => setChallengerId(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Challenger...</option>
                {fighters.map((fighter) => (
                  <option key={fighter.profile.id} value={fighter.profile.id}>
                    @{fighter.profile.login} - {fighter.card.archetype} ({fighter.card.attack}/
                    {fighter.card.defense}/{fighter.card.speed})
                  </option>
                ))}
              </select>
            </div>

            {/* VS */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white font-bold text-2xl shadow-lg">
                VS
              </div>
            </div>

            {/* Opponent */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Opponent
              </label>
              <select
                value={opponentId}
                onChange={(e) => setOpponentId(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Opponent...</option>
                {fighters.map((fighter) => (
                  <option key={fighter.profile.id} value={fighter.profile.id}>
                    @{fighter.profile.login} - {fighter.card.archetype} ({fighter.card.attack}/
                    {fighter.card.defense}/{fighter.card.speed})
                  </option>
                ))}
              </select>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartBattle}
              disabled={!challengerId || !opponentId}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 px-8 py-4 text-white font-bold text-xl shadow-2xl hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Swords size={24} />
              <span>Start Battle!</span>
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">
            <p className="font-semibold mb-2">
              Battle-Ready Profiles: {fighters.length}
            </p>
            <p className="text-xs">
              Battles use type advantages, spirit animal bonuses, and turn-based combat.
              All simulation happens client-side - completely free! 🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
