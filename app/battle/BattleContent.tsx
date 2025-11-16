'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader, Swords } from 'lucide-react';
import BattleArena from '@/components/BattleArena';
import type { Fighter, GameData } from '@/lib/types';

export default function BattleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [challengerId, setChallengerId] = useState('');
  const [opponentId, setOpponentId] = useState('');
  const [challenger, setChallenger] = useState<Fighter | null>(null);
  const [opponent, setOpponent] = useState<Fighter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const {
        getFightersFromFirestore,
        getGameDataFromFirestore,
      } = await import('@/lib/fighter-sync');

      const [fightersResponse, gameDataResponse] = await Promise.all([
        getFightersFromFirestore(),
        getGameDataFromFirestore(),
      ]);

      if (!fightersResponse || fightersResponse.length === 0) {
        setError('No fighters found in database.');
        return;
      }

      if (!gameDataResponse) {
        setError('No game data found in database.');
        return;
      }

      setFighters(fightersResponse);
      setGameData(gameDataResponse);

      const urlChallengerId = searchParams.get('challenger');
      const urlOpponentId = searchParams.get('opponent');

      if (urlChallengerId && urlOpponentId) {
        const challengerData = fightersResponse.find(
          (f) => f.profile.id.toString() === urlChallengerId
        );
        const opponentData = fightersResponse.find(
          (f) => f.profile.id.toString() === urlOpponentId
        );

        if (challengerData && opponentData) {
          setChallenger(challengerData);
          setOpponent(opponentData);
          setChallengerId(urlChallengerId);
          setOpponentId(urlOpponentId);
          setStarted(true);
        } else {
          setError('Fighters not found for provided IDs');
        }
      } else if (fightersResponse.length >= 2) {
        setChallengerId(fightersResponse[0].profile.id.toString());
        setOpponentId(fightersResponse[1].profile.id.toString());
      }
    } catch (err) {
      setError('Failed to load battle data');
    } finally {
      setLoading(false);
    }
  }

  const handleStartBattle = () => {
    if (!challengerId || !opponentId) {
      setError('Please select both fighters');
      return;
    }
    if (challengerId === opponentId) {
      setError('Cannot battle yourself!');
      return;
    }

    const challengerData = fighters.find(
      (f) => f.profile.id.toString() === challengerId
    );
    const opponentData = fighters.find(
      (f) => f.profile.id.toString() === opponentId
    );

    if (!challengerData || !opponentData || !gameData) {
      setError('Unable to load selected fighters');
      return;
    }

    setChallenger(challengerData);
    setOpponent(opponentData);
    setStarted(true);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen h-full items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
        <div className="text-center">
          <Loader className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Preparing battle arena...
          </p>
        </div>
      </div>
    );
  }

  if (error && !started) {
    return (
      <div className="flex min-h-screen h-full items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Error Loading Battle
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white font-bold hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return null;
  }

  if (!started) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 py-12 px-4 min-h-screen h-full">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 mb-3 sm:mb-4 px-2">
              <span className="hidden sm:inline">⚔️ </span>Battle Arena
              <span className="hidden sm:inline"> ⚔️</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 px-4">
              Choose your fighters and start the battle.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border-2 border-red-200 p-4 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Swords size={28} />
              Select Fighters
            </h2>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="challenger-select"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Challenger
                </label>
                <select
                  id="challenger-select"
                  value={challengerId}
                  onChange={(e) => setChallengerId(e.target.value)}
                  aria-label="Select challenger fighter"
                  className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Challenger...</option>
                  {fighters.map((fighter) => (
                    <option key={fighter.profile.id} value={fighter.profile.id}>
                      @{fighter.profile.login} - {fighter.card.archetype} (
                      {fighter.card.attack}/{fighter.card.defense}/
                      {fighter.card.speed})
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white font-bold text-2xl shadow-lg">
                  VS
                </div>
              </div>

              <div>
                <label
                  htmlFor="opponent-select"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Opponent
                </label>
                <select
                  id="opponent-select"
                  value={opponentId}
                  onChange={(e) => setOpponentId(e.target.value)}
                  aria-label="Select opponent fighter"
                  className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Opponent...</option>
                  {fighters.map((fighter) => (
                    <option key={fighter.profile.id} value={fighter.profile.id}>
                      @{fighter.profile.login} - {fighter.card.archetype} (
                      {fighter.card.attack}/{fighter.card.defense}/
                      {fighter.card.speed})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleStartBattle}
                disabled={!challengerId || !opponentId}
                className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 px-8 py-4 text-white font-bold text-xl shadow-2xl hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Swords size={24} />
                <span>Start Battle!</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!challenger || !opponent) {
    return null;
  }

  return (
    <BattleArena
      challenger={challenger}
      opponent={opponent}
      gameData={gameData}
    />
  );
}
