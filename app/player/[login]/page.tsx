'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Trophy,
  Swords,
  TrendingUp,
  Calendar,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { collection, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getFightersFromFirestore } from '@/lib/fighter-sync';
import type { Fighter } from '@/lib/types';
import {
  generatePersonSchema,
  generateBreadcrumbSchema,
  siteConfig,
} from '@/lib/metadata';

interface BattleRecord {
  id: string;
  timestamp: Timestamp;
  opponent: string;
  result: 'win' | 'loss';
  finalHp: number;
  opponentFinalHp: number;
  turns: number;
  hadTypeAdvantage: boolean;
}

interface PlayerStats {
  wins: number;
  losses: number;
  winRate: number;
  totalDamageDealt: number;
  averageTurns: number;
  favoriteArchetype: string;
  recentBattles: BattleRecord[];
}

export default function PlayerProfilePage() {
  const params = useParams();
  const login = params.login as string;

  const [fighter, setFighter] = useState<Fighter | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayerData();
  }, [login]);

  // Dynamically update favicon with player's profile picture
  useEffect(() => {
    if (fighter) {
      const avatarUrl = `https://github.com/${fighter.profile.login}.png`;
      // Add cache-busting query param to force browser to refresh favicon
      const cacheBustedUrl = `${avatarUrl}?v=${Date.now()}`;

      // Update all favicon links
      const updateFavicon = (rel: string) => {
        let link = document.querySelector(
          `link[rel="${rel}"]`
        ) as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = rel;
          document.head.appendChild(link);
        }
        link.href = cacheBustedUrl;
      };

      updateFavicon('icon');
      updateFavicon('shortcut icon');
      updateFavicon('apple-touch-icon');

      // Cleanup: restore default favicon when leaving the page
      return () => {
        const restoreFavicon = (rel: string) => {
          const link = document.querySelector(
            `link[rel="${rel}"]`
          ) as HTMLLinkElement;
          if (link) {
            link.href = '/favicon.png';
          }
        };
        restoreFavicon('icon');
        restoreFavicon('shortcut icon');
        restoreFavicon('apple-touch-icon');
      };
    }
  }, [fighter]);

  const loadPlayerData = async () => {
    try {
      // Load fighter data
      const fighters = await getFightersFromFirestore();
      const fighterData = fighters.find((f) => f.profile.login === login);
      setFighter(fighterData || null);

      // Load battle history
      const battlesRef = collection(db, 'battles');
      const snapshot = await getDocs(battlesRef);

      const battles: BattleRecord[] = [];
      let wins = 0;
      let losses = 0;
      let totalDamage = 0;
      let totalTurns = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const isWinner = data.winner?.login === login;
        const isLoser = data.loser?.login === login;

        if (isWinner || isLoser) {
          battles.push({
            id: doc.id,
            timestamp: data.timestamp,
            opponent: isWinner ? data.loser?.login : data.winner?.login,
            result: isWinner ? 'win' : 'loss',
            finalHp: isWinner ? data.winner?.final_hp : data.loser?.final_hp,
            opponentFinalHp: isWinner
              ? data.loser?.final_hp
              : data.winner?.final_hp,
            turns: data.stats?.total_turns || 0,
            hadTypeAdvantage: isWinner
              ? data.stats?.winner_had_type_advantage
              : false,
          });

          if (isWinner) {
            wins++;
            totalDamage += data.stats?.total_damage_dealt_by_winner || 0;
          } else {
            losses++;
            totalDamage += data.stats?.total_damage_dealt_by_loser || 0;
          }
          totalTurns += data.stats?.total_turns || 0;
        }
      });

      // Sort battles by timestamp (most recent first)
      battles.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(0);
        const bTime = b.timestamp?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });

      setStats({
        wins,
        losses,
        winRate: wins / (wins + losses) || 0,
        totalDamageDealt: Math.round(totalDamage),
        averageTurns:
          battles.length > 0 ? Math.round(totalTurns / battles.length) : 0,
        favoriteArchetype: fighterData?.card.archetype || 'Unknown',
        recentBattles: battles.slice(0, 10), // Show last 10 battles
      });
    } catch (error) {
      // Error loading player data
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 min-h-screen h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading player profile...
          </p>
        </div>
      </div>
    );
  }

  if (!fighter || !stats) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 py-12 min-h-screen h-full">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Player Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Could not find battle data for @{login}
          </p>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white font-bold hover:bg-blue-700 transition"
          >
            <ArrowLeft size={20} />
            Back to Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  // Generate structured data
  const personSchema = fighter
    ? generatePersonSchema({
        login: fighter.profile.login,
        name: fighter.profile.name,
        avatarUrl: `https://github.com/${fighter.profile.login}.png`,
        profileUrl: `${siteConfig.url}/player/${fighter.profile.login}`,
      })
    : null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Leaderboard', url: `${siteConfig.url}/leaderboard` },
    { name: `@${login}`, url: `${siteConfig.url}/player/${login}` },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      {personSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 py-12 min-h-screen h-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition"
          >
            <ArrowLeft size={20} />
            Back to Leaderboard
          </Link>

          {/* Profile Header */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-8 mb-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <img
                src={`https://github.com/${fighter.profile.login}.png?size=256`}
                alt={fighter.profile.login}
                className="h-32 w-32 rounded-full ring-4 ring-blue-500 shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = `https://github.com/${fighter.profile.login}.png`;
                }}
              />

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  @{fighter.profile.login}
                </h1>
                {fighter.profile.name && (
                  <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-3">
                    {fighter.profile.name}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-4 py-2">
                    <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">
                      {fighter.card.archetype}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      🦘 {fighter.card.spirit_animal}
                    </span>
                  </div>
                  <a
                    href={`https://techub.life/profiles/${fighter.profile.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-white text-sm font-bold hover:bg-blue-700 transition"
                  >
                    <ExternalLink size={16} />
                    View on TecHub
                  </a>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-2">
                  {stats.wins}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Total Wins
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center">
              <Trophy className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {((stats.winRate || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Win Rate
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center">
              <Swords className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {stats.wins + stats.losses}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total Battles
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {stats.totalDamageDealt.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total Damage
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {stats.averageTurns}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Avg. Turns
              </div>
            </div>
          </div>

          {/* Fighter Stats */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Fighter Stats
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-red-600 dark:text-red-400 font-bold mb-1">
                  ATK
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {fighter.card.attack}
                </div>
              </div>
              <div>
                <div className="text-blue-600 dark:text-blue-400 font-bold mb-1">
                  DEF
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {fighter.card.defense}
                </div>
              </div>
              <div>
                <div className="text-yellow-600 dark:text-yellow-400 font-bold mb-1">
                  SPD
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {fighter.card.speed}
                </div>
              </div>
            </div>
          </div>

          {/* Battle History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Recent Battles
            </h2>
            {stats.recentBattles.length === 0 ? (
              <p className="text-center text-slate-600 dark:text-slate-400 py-8">
                No battles yet
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentBattles.map((battle) => (
                  <div
                    key={battle.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      battle.result === 'win'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`text-2xl font-bold ${
                          battle.result === 'win'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {battle.result === 'win' ? '✓' : '✗'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          vs @{battle.opponent}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {battle.turns} turns • HP: {battle.finalHp} vs{' '}
                          {battle.opponentFinalHp}
                          {battle.hadTypeAdvantage && ' • Type Advantage'}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-500">
                      {battle.timestamp?.toDate?.().toLocaleDateString() ||
                        'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
