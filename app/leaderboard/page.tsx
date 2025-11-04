'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LeaderboardEntry {
  login: string;
  wins: number;
  losses: number;
  winRate: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const battlesRef = collection(db, 'battles');
      const snapshot = await getDocs(battlesRef);
      
      // Aggregate stats by player
      const stats: Record<string, { wins: number; losses: number }> = {};
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const winnerLogin = data.winner?.login;
        const loserLogin = data.loser?.login;
        
        if (winnerLogin) {
          if (!stats[winnerLogin]) {
            stats[winnerLogin] = { wins: 0, losses: 0 };
          }
          stats[winnerLogin].wins++;
        }
        
        if (loserLogin) {
          if (!stats[loserLogin]) {
            stats[loserLogin] = { wins: 0, losses: 0 };
          }
          stats[loserLogin].losses++;
        }
      });
      
      // Convert to leaderboard entries and sort
      const entries: LeaderboardEntry[] = Object.entries(stats)
        .map(([login, data]) => ({
          login,
          wins: data.wins,
          losses: data.losses,
          winRate: data.wins / (data.wins + data.losses),
        }))
        .sort((a, b) => {
          // Sort by wins first, then by win rate
          if (b.wins !== a.wins) {
            return b.wins - a.wins;
          }
          return b.winRate - a.winRate;
        });
      
      setLeaderboard(entries);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 py-12 min-h-screen h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-500 to-red-600 mb-4">
            🏆 Leaderboard 🏆
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Top fighters ranked by wins and win rate
          </p>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
            <Trophy className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              No battles yet!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Be the first to compete and claim your spot on the leaderboard.
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white font-bold hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
            >
              Start Battle →
            </a>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-slate-100">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-slate-100">Fighter</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-900 dark:text-slate-100">Wins</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-900 dark:text-slate-100">Losses</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-900 dark:text-slate-100">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {leaderboard.map((entry, index) => (
                  <tr key={entry.login} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                        {index === 1 && <Medal className="h-5 w-5 text-slate-400" />}
                        {index === 2 && <Award className="h-5 w-5 text-orange-600" />}
                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          #{index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/player/${entry.login}`}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        @{entry.login}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-green-600 dark:text-green-400 font-bold">
                        {entry.wins}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-red-600 dark:text-red-400 font-bold">
                        {entry.losses}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                        {(entry.winRate * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
