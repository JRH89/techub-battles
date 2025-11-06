'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';
import BattleArena from '@/components/BattleArena';
import type { Fighter, GameData } from '@/lib/types';

function BattleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [challenger, setChallenger] = useState<Fighter | null>(null);
  const [opponent, setOpponent] = useState<Fighter | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBattleData();
  }, []);

  const loadBattleData = async () => {
    try {
      setLoading(true);
      const challengerId = searchParams.get('challenger');
      const opponentId = searchParams.get('opponent');

      if (!challengerId || !opponentId) {
        setError('Missing fighter IDs');
        return;
      }

      // Load from Firestore (not Rails!)
      const { getFightersFromFirestore, getGameDataFromFirestore } = await import('@/lib/fighter-sync');
      
      const [gameDataResponse, fighters] = await Promise.all([
        getGameDataFromFirestore(),
        getFightersFromFirestore(),
      ]);

      const challengerData = fighters.find(
        (f) => f.profile.id.toString() === challengerId
      );
      const opponentData = fighters.find(
        (f) => f.profile.id.toString() === opponentId
      );

      if (!challengerData || !opponentData) {
        setError('Fighters not found');
        return;
      }

      setChallenger(challengerData);
      setOpponent(opponentData);
      setGameData(gameDataResponse);
    } catch (err) {
      setError('Failed to load battle data');
      // Error in battle page
    } finally {
      setLoading(false);
    }
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

  if (error || !challenger || !opponent || !gameData) {
    return (
      <div className="flex min-h-screen h-full items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Error Loading Battle
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error || 'Something went wrong'}
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

  return (
    <BattleArena
      challenger={challenger}
      opponent={opponent}
      gameData={gameData}
    />
  );
}

export default function BattlePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader className="animate-spin h-16 w-16 text-blue-600" />
        </div>
      }
    >
      <BattleContent />
    </Suspense>
  );
}
