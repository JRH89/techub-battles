'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Swords, Loader, Trophy, Users, Shield, Zap, Info } from 'lucide-react';
import type { Fighter, GameData } from '@/lib/types';

interface HomeClientProps {
  initialData?: {
    fighters: Fighter[];
    gameData: GameData;
  } | null;
}

export default function HomeClient({ initialData }: HomeClientProps) {
  const router = useRouter();
  const [fighters, setFighters] = useState<Fighter[]>(
    initialData?.fighters || []
  );
  const [gameData, setGameData] = useState<GameData | null>(
    initialData?.gameData || null
  );
  const [loading, setLoading] = useState(!initialData);
  const [challengerId, setChallengerId] = useState('');
  const [opponentId, setOpponentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);

  useEffect(() => {
    // If we have initial data, set the default fighters
    if (initialData?.fighters && initialData.fighters.length >= 2) {
      setChallengerId(initialData.fighters[0].profile.id.toString());
      setOpponentId(initialData.fighters[1].profile.id.toString());
      return;
    }

    // Only load data on client if we don't have initial data
    if (!initialData) {
      loadData();
    }
  }, [initialData]);

  async function loadData() {
    try {
      setLoading(true);

      const {
        shouldSyncFighters,
        getFightersFromFirestore,
        syncFightersFromRails,
        getGameDataFromFirestore,
        syncGameDataFromRails,
      } = await import('@/lib/fighter-sync');

      // Check if we need to sync from Rails
      const needsSync = await shouldSyncFighters();

      if (needsSync) {
        // Syncing data from Rails (first time or >24hrs old)...
        // Sync both fighters and game data
        const [fightersSuccess, gameDataSuccess] = await Promise.all([
          syncFightersFromRails(),
          syncGameDataFromRails(),
        ]);

        // Show warning if sync failed but don't block the app
        if (!fightersSuccess || !gameDataSuccess) {
          setSyncWarning(
            'Unable to sync from Rails server. Using cached data from Firestore.'
          );
          // Rails sync failed - continuing with Firestore data
        }
      }

      // Get everything from Firestore (fast, no Rails calls)
      const [profilesData, gameDataResponse] = await Promise.all([
        getFightersFromFirestore(),
        getGameDataFromFirestore(),
      ]);

      // Check if we have data in Firestore
      if (!profilesData || profilesData.length === 0) {
        setError(
          'No fighters found in database. Please ensure the Rails server is running and data has been synced at least once.'
        );
        return;
      }

      if (!gameDataResponse) {
        setError(
          'No game data found in database. Please ensure the Rails server is running and data has been synced at least once.'
        );
        return;
      }

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
      <div className="flex items-center justify-center py-12 min-h-screen h-full">
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
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 py-12 px-4 min-h-screen h-full">
      <div className="max-w-5xl mx-auto">
        {/* Header / Hero */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 mb-3 sm:mb-4 px-2">
            <span className="hidden sm:inline">⚔️ </span>TecHub Battles
            <span className="hidden sm:inline"> ⚔️</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 px-4 max-w-3xl mx-auto">
            Turn your TecHub profile into a battle-ready fighter card and watch GitHub-powered devs clash in fully simulated, turn-based battles.
          </p>
        </div>

        {/* Hero CTA */}
        <div className="mb-10">
          <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-slate-900/80 shadow-xl p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                Join TecHub to unlock your fighter card
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-2">
                Your TecHub profile is where your archetype, spirit animal, and battle stats are created. Stats are generated from your public GitHub activity — followers, stars, active repos, commits, gists, and pinned/featured projects.
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500">
                Having detailed READMEs about you and your projects helps the AI generate better summaries, images, and abilities for your fighter.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-3 w-full">
              <a
                href="https://techub.life"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white font-bold text-base shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <Users className="h-5 w-5" />
                Sign up at techub.life
              </a>
              <p className="text-[11px] text-slate-500 dark:text-slate-500 text-center">
                Connect with the lightest possible GitHub app permissions — public profile and featured repos only.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border-2 border-red-200 p-4 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Warning */}
        {syncWarning && !error && (
          <div className="mb-6 rounded-xl bg-yellow-50 border-2 border-yellow-200 p-4 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
            ⚠️ {syncWarning}
          </div>
        )}

        {/* How stats and battles work */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                How your stats are generated
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Each TecHub fighter card is built from your TecHub profile, which pulls from your public GitHub activity:
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1">
              <li>Followers and stars</li>
              <li>Number of public, active repos and recent commits</li>
              <li>Public gists and pinned/featured repos</li>
              <li>Quality READMEs and profile details</li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Being active on GitHub with multiple active repos, recent commits, followers, and stars will generally boost your stats.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-5 w-5 text-yellow-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Turn-based, auto-simulated battles
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Battles are fully simulated in your browser, using a turn-based engine:
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1">
              <li>Attack, Defense, and Speed decide who hits how hard, and who goes first.</li>
              <li>Archetypes and spirit animals add type advantages and passive effects.</li>
              <li>Fighters charge up special moves and unleash big attacks every few turns.</li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              You can adjust battle speed from 0.5x to 4x while watching — slow and cinematic or fast-forwarded chaos.
            </p>
          </div>
        </div>

        {/* Archetypes & Spirit Animals */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Swords className="h-5 w-5 text-orange-600" />
            Archetypes & Spirit Animals
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Every fighter gets an archetype and a spirit animal from TecHub that shape their style in battle. These come from the same game data used on{' '}
            <a
              href="https://techub.life/archetypes"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted underline-offset-2"
            >
              archetypes
            </a>{' '}
            and{' '}
            <a
              href="https://techub.life/spirit-animals"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted underline-offset-2"
            >
              spirit animals
            </a>
            , and the battle engine uses that data directly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Archetypes
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <span className="font-semibold">The Innocent</span> – optimistic beginner’s mind; values simplicity and sincerity.
                </li>
                <li>
                  <span className="font-semibold">The Everyman</span> – grounded, relatable collaborator who keeps teams steady.
                </li>
                <li>
                  <span className="font-semibold">The Hero</span> – steps up under pressure; ships ambitious work against odds and gets a little tougher when their HP drops.
                </li>
                <li>
                  <span className="font-semibold">The Outlaw</span> – breaks conventions to unlock bold new approaches.
                </li>
                <li>
                  <span className="font-semibold">The Explorer</span> – curious pathfinder; thrives on discovery and breadth.
                </li>
                <li>
                  <span className="font-semibold">The Creator</span> – imagination and craft; turns ideas into polished systems.
                </li>
                <li>
                  <span className="font-semibold">The Ruler</span> – sets direction and standards; creates clarity for others and gains a bonus while staying healthy.
                </li>
                <li>
                  <span className="font-semibold">The Magician</span> – translates complexity into seamless experiences; hits extra hard when they have type advantage.
                </li>
                <li>
                  <span className="font-semibold">The Lover</span> – designs for people first; warmth, care, and resonance, with damage ramping up as HP drops.
                </li>
                <li>
                  <span className="font-semibold">The Caregiver</span> – stability and support; invests in docs, tests, and teams and has a small regeneration effect each turn.
                </li>
                <li>
                  <span className="font-semibold">The Jester</span> – playful energy; energizes teams and occasionally dodges incoming attacks entirely.
                </li>
                <li>
                  <span className="font-semibold">The Sage</span> – seeks truth and signal; mentors with hard-won insight.
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Spirit animals
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <span className="font-semibold">Danger Noodle</span> – playful serpent spirit; quick, clever, and a little chaotic.
                </li>
                <li>
                  <span className="font-semibold">Wedge-tailed Eagle</span> – high vantage and precision; surveys systems end-to-end.
                </li>
                <li>
                  <span className="font-semibold">Platypus</span> – unorthodox but effective; thrives across disciplines.
                </li>
                <li>
                  <span className="font-semibold">Kangaroo</span> – powerful bursts; leaps milestones with momentum and favors speedy, aggressive play.
                </li>
                <li>
                  <span className="font-semibold">Dingo</span> – adaptable problem-solver; strong in a pack or solo.
                </li>
                <li>
                  <span className="font-semibold">Saltwater Crocodile</span> – patient strategist; strikes decisively when timing is right.
                </li>
                <li>
                  <span className="font-semibold">Redback Spider</span> – elegant webs; builds resilient networks and edge cases.
                </li>
                <li>
                  <span className="font-semibold">Cassowary</span> – bold guardian; protects boundaries and performance budgets.
                </li>
                <li>
                  <span className="font-semibold">Koala</span> – calm focus; steady craftsmanship and reliability for more tanky, sustained fights.
                </li>
                <li>
                  <span className="font-semibold">Quokka</span> – delight-forward; lifts team morale and UX polish, great for playful, feel-good profiles.
                </li>
                <li>
                  <span className="font-semibold">Great White Shark</span> – relentless finisher; excels at closing out opponents on critical paths.
                </li>
                <li>
                  <span className="font-semibold">Tasmanian Devil</span> – scrappy executor; unblocks gnarly issues fast.
                </li>
              </ul>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                Different combinations of archetype and spirit animal use TecHub&apos;s real type chart and stat modifiers to create unique matchups, with subtle strengths and weaknesses that mirror how these profiles are modeled on techub.life.
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard & Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Leaderboard
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The leaderboard shows which TecHub fighters are winning the most battles. Track overall performance, discover top players, and see how your card stacks up.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Fighter directory
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Browse all battle-ready TecHub profiles, discover new developers, and pick interesting matchups for your next fight.
            </p>
          </div>
        </div>

        {/* FAQ / Privacy */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            FAQ & privacy
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                What data do you use?
              </p>
              <p>
                We only look at <span className="font-semibold">public GitHub profiles</span> and <span className="font-semibold">public repos</span> that you feature or pin in TecHub. No private code is scanned.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                What GitHub permissions are required?
              </p>
              <p>
                The GitHub app uses the lightest possible access — basic profile and repo metadata needed to compute stats. We don&apos;t request email access or write permissions.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Where are battles simulated?
              </p>
              <p>
                All battle simulations run directly in your browser. That means no per-battle server cost — it&apos;s completely free to watch as many battles as you like.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                How can I get better results for my card?
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Fill out your TecHub profile with a clear bio and skills.</li>
                <li>Have a detailed README on your GitHub profile.</li>
                <li>Pin / feature repos with good READMEs and recent commits.</li>
                <li>Stay active on GitHub with multiple projects, commits, stars, and followers.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Fighter Selection (bottom of page) */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Swords size={28} />
            Select Fighters
          </h2>

          <div className="space-y-6">
            {/* Challenger */}
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

            {/* VS */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white font-bold text-2xl shadow-lg">
                VS
              </div>
            </div>

            {/* Opponent */}
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
              Battles use type advantages, spirit animal bonuses, and turn-based
              combat. All simulation happens client-side - completely free! 🎉
            </p>
          </div>

          {/* Call to Action */}
          <div className="mt-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 p-6 text-center">
            <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Want to see your name on the list and start fighting?
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Join the TecHub community today!
            </p>
            <a
              href="https://techub.life"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white font-bold text-base shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Sign up at techub.life
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
