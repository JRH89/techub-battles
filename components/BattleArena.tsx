'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Pause,
  RotateCcw,
  FastForward,
  Smartphone,
  ExternalLink,
  X,
} from 'lucide-react';
import { simulateBattle } from '@/lib/battle-engine';
import { saveBattleResult } from '@/lib/battle-storage';
import type { Fighter, GameData, BattleEvent, BattleResult } from '@/lib/types';
import { isFromTwitter } from '@/lib/twitter-detection';
import FighterCard from './FighterCard';
import BattleLog from './BattleLog';

interface BattleArenaProps {
  challenger: Fighter;
  opponent: Fighter;
  gameData: GameData;
}

export default function BattleArena({
  challenger,
  opponent,
  gameData,
}: BattleArenaProps) {
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.5); // Start at 0.5x speed (slower, easier to read)
  const [challengerHP, setChallengerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);
  const [challengerMessage, setChallengerMessage] = useState<string>('');
  const [opponentMessage, setOpponentMessage] = useState<string>('');
  const [centerMessage, setCenterMessage] = useState<string>(''); // For battle start, speed check, etc.
  const [challengerCharge, setChallengerCharge] = useState(0);
  const [opponentCharge, setOpponentCharge] = useState(0);
  const [challengerUsingSpecial, setChallengerUsingSpecial] = useState(false);
  const [opponentUsingSpecial, setOpponentUsingSpecial] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [battleStarted, setBattleStarted] = useState(false);
  const [showTwitterBanner, setShowTwitterBanner] = useState(false);
  const [dismissedTwitterBanner, setDismissedTwitterBanner] = useState(false);

  // Check orientation on mobile
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const checkOrientation = () => {
      // Only enforce landscape on mobile/tablet (< 1024px width)
      if (window.innerWidth < 1024) {
        setIsLandscape(window.innerHeight < window.innerWidth);
      } else {
        setIsLandscape(true); // Always show on desktop
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Check if user is coming from Twitter
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const checkTwitterSource = () => {
        if (isFromTwitter() && !dismissedTwitterBanner) {
          setShowTwitterBanner(true);
        }
      };

      // Use setTimeout to avoid synchronous setState in effect
      const timeoutId = setTimeout(checkTwitterSource, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [dismissedTwitterBanner]);

  // Simulate battle on mount
  useEffect(() => {
    const runBattleSimulation = () => {
      try {
        const result = simulateBattle(challenger, opponent, gameData);
        setBattleResult(result);

        // Start countdown immediately
        setCountdown(3);
      } catch (error) {
        console.error('Battle simulation failed:', error);
      }
    };

    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(runBattleSimulation, 0);

    return () => clearTimeout(timeoutId);
  }, [challenger, opponent, gameData]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          // Show speed advantage for 2 seconds after countdown
          setTimeout(() => {
            setBattleStarted(true);
            setIsPlaying(true);
          }, 2000);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [countdown]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !battleResult || !battleStarted) return;

    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => {
        if (prev >= battleResult.battle_log.length - 1) {
          setIsPlaying(false);

          // Clear messages when battle ends
          setChallengerMessage('');
          setOpponentMessage('');

          // Save battle result to Firebase when complete
          saveBattleResult(battleResult, challenger, opponent).then(
            (battleId) => {
              if (battleId) {
                // Battle saved with ID
              }
            }
          );

          return prev;
        }

        // Update HP and messages based on current event
        const nextEvent = battleResult.battle_log[prev + 1];

        // Handle different event types
        if (nextEvent.type === 'battle_start') {
          setCenterMessage('⚔️ Battle begins! ⚔️');
          setTimeout(() => setCenterMessage(''), 1500);
        } else if (nextEvent.type === 'speed_check') {
          setCenterMessage(nextEvent.message || '');
          setTimeout(() => setCenterMessage(''), 2000);
        } else if (nextEvent.type === 'type_advantage') {
          setCenterMessage(nextEvent.message || '');
          setTimeout(() => setCenterMessage(''), 1500);
        } else if (nextEvent.type === 'knockout') {
          setCenterMessage(`💥 ${nextEvent.message} 💥`);
        } else if (
          (nextEvent.type === 'attack' || nextEvent.type === 'special_move') &&
          nextEvent.damage
        ) {
          // Update charge bars (increment every turn, reset on special move)
          if (nextEvent.type === 'special_move') {
            // Reset charge and trigger special move animation
            if (nextEvent.attacker === challenger.profile.login) {
              setChallengerCharge(0);
              setChallengerUsingSpecial(true);
              setTimeout(() => setChallengerUsingSpecial(false), 800);
            } else {
              setOpponentCharge(0);
              setOpponentUsingSpecial(true);
              setTimeout(() => setOpponentUsingSpecial(false), 800);
            }
          } else {
            // Increment charge for normal attacks
            if (nextEvent.attacker === challenger.profile.login) {
              setChallengerCharge((prev) => Math.min(prev + 1, 3));
            } else {
              setOpponentCharge((prev) => Math.min(prev + 1, 3));
            }
          }

          // Update defender's HP
          if (nextEvent.defender === challenger.profile.login) {
            setChallengerHP(nextEvent.defender_hp || 0);
          } else if (nextEvent.defender === opponent.profile.login) {
            setOpponentHP(nextEvent.defender_hp || 0);
          }

          // Build detailed attack message with attacker and defender
          let attackMsg = '';

          // Check if it's a special move
          if (nextEvent.type === 'special_move' && nextEvent.special_move) {
            attackMsg = `✨ ${nextEvent.special_move}! ${nextEvent.damage} damage`;
          } else {
            attackMsg = `⚔️ ${nextEvent.damage} damage`;
          }

          // Check for type advantage using multiplier
          if (nextEvent.type_multiplier === 1.5) {
            attackMsg += ' 💥 SUPER EFFECTIVE!';
          } else if (nextEvent.type_multiplier === 0.75) {
            attackMsg += ' 🛡️ Not very effective...';
          }

          // Check for archetype (from attacker)
          const attackerArchetype =
            nextEvent.attacker === challenger.profile.login
              ? challenger.card.archetype
              : opponent.card.archetype;

          if (attackerArchetype === 'The Magician') {
            attackMsg += ' 🔮';
          } else if (attackerArchetype === 'The Rebel') {
            attackMsg += ' 🎲';
          } else if (attackerArchetype === 'The Lover') {
            attackMsg += ' 💔';
          } else if (attackerArchetype === 'The Hero') {
            attackMsg += ' 🛡️';
          } else if (attackerArchetype === 'The Explorer') {
            attackMsg += ' 🗺️';
          }

          // Show attacker's message (stays until next message)
          if (nextEvent.attacker === challenger.profile.login) {
            setChallengerMessage(attackMsg);
            setOpponentMessage(''); // Clear opponent's old message
            setCenterMessage(`@${nextEvent.attacker} → @${nextEvent.defender}`);
          } else if (nextEvent.attacker === opponent.profile.login) {
            setOpponentMessage(attackMsg);
            setChallengerMessage(''); // Clear challenger's old message
            setCenterMessage(`@${nextEvent.attacker} → @${nextEvent.defender}`);
          }
        } else if (nextEvent.type === 'passive_trigger') {
          // Show passive trigger message
          if (nextEvent.message?.includes('dodged')) {
            const affectedPlayer = nextEvent.message?.includes(
              challenger.profile.login
            )
              ? 'challenger'
              : 'opponent';

            if (affectedPlayer === 'challenger') {
              setChallengerMessage('✨ DODGED! (Jester)');
            } else {
              setOpponentMessage('✨ DODGED! (Jester)');
            }
          } else if (nextEvent.message?.includes('regenerated')) {
            const affectedPlayer = nextEvent.message?.includes(
              challenger.profile.login
            )
              ? 'challenger'
              : 'opponent';

            if (affectedPlayer === 'challenger') {
              setChallengerMessage('💚 +2 HP (Caregiver)');
            } else {
              setOpponentMessage('💚 +2 HP (Caregiver)');
            }
          }
        }

        return prev + 1;
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, battleResult, challenger, opponent, battleStarted]);

  const _handlePlay = () => {
    if (currentEventIndex >= (battleResult?.battle_log.length || 0) - 1) {
      handleReset();
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentEventIndex(0);
    setChallengerHP(100);
    setOpponentHP(100);
    setChallengerMessage('');
    setOpponentMessage('');
    setCountdown(null);
    setBattleStarted(false);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  if (!battleResult) {
    return (
      <div className="flex items-center justify-center min-h-screen h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Simulating battle...
          </p>
        </div>
      </div>
    );
  }

  // Show landscape prompt on mobile portrait mode
  if (!isLandscape) {
    return (
      <div className="flex items-center justify-center min-h-screen h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{ rotate: [0, -90, -90, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="mb-6"
          >
            <Smartphone size={80} className="mx-auto text-blue-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Rotate Your Device
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            For the best battle experience, please rotate your device to
            landscape mode.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            The battle arena needs more screen space to display both fighters
            properly.
          </p>
        </motion.div>
      </div>
    );
  }

  const visibleEvents = battleResult.battle_log.slice(0, currentEventIndex + 1);
  const isChallengerWinner =
    battleResult.winner.profile.id === challenger.profile.id;
  const _isOpponentWinner =
    battleResult.winner.profile.id === opponent.profile.id;
  const battleComplete =
    currentEventIndex >= battleResult.battle_log.length - 1;

  return (
    <div className="min-h-screen h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 py-8 px-4">
      {/* Twitter Banner */}
      {showTwitterBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-7xl mx-auto mb-4"
        >
          <div className="bg-black text-white rounded-xl p-4 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 rounded-full p-2">
                <X size={20} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-white">Coming from Twitter?</div>
                <div className="text-sm text-gray-300">
                  For the best experience, open this page in a new browser
                  window
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.open(window.location.href, '_blank');
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <ExternalLink size={16} />
                Open in Browser
              </button>
              <button
                onClick={() => {
                  setDismissedTwitterBanner(true);
                  setShowTwitterBanner(false);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Controls with Header in Center */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xl">
          {/* Header - Top on mobile, center on desktop */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 mb-1">
              Battle Arena
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
              Turn {Math.min(currentEventIndex, battleResult.total_turns)} of{' '}
              {battleResult.total_turns}
            </p>
          </motion.div>

          {/* Controls Row - Stacked on mobile, side-by-side on desktop */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-4">
            {/* Pause/Reset */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isPlaying && battleStarted ? (
                <button
                  onClick={handlePause}
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 sm:px-6 py-2 sm:py-3 text-white text-sm sm:text-base font-bold shadow-lg hover:from-amber-700 hover:to-orange-700 transition-all"
                >
                  <Pause size={18} className="sm:w-5 sm:h-5" />
                  <span>Pause</span>
                </button>
              ) : countdown ? (
                <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 sm:px-6 py-2 sm:py-3 text-white text-sm sm:text-base font-bold shadow-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Starting...</span>
                </div>
              ) : null}

              <button
                onClick={handleReset}
                disabled={!battleResult}
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 px-4 sm:px-6 py-2 sm:py-3 text-white text-sm sm:text-base font-bold shadow-lg hover:from-slate-700 hover:to-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={18} className="sm:w-5 sm:h-5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-2 sm:gap-3">
              <FastForward
                size={16}
                className="text-slate-600 dark:text-slate-400 sm:w-5 sm:h-5"
              />
              <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Speed:
              </label>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {[0.5, 1, 2, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                      speed === s
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Battle Arena */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
          {/* Challenger */}
          <FighterCard
            fighter={challenger}
            hp={challengerHP}
            maxHp={100}
            isWinner={battleComplete && isChallengerWinner}
            side="left"
            specialMoveCharge={challengerCharge}
            isUsingSpecialMove={challengerUsingSpecial}
          />

          {/* Battle Center - VS or Turn Info */}
          <div className="flex items-center justify-center relative">
            <div className="flex flex-col items-center gap-2 sm:gap-3 lg:gap-4">
              {/* Challenger's Move (Above center) */}
              {challengerMessage && (
                <motion.div
                  key={`challenger-${challengerMessage}`}
                  initial={{ opacity: 0, x: -20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-lg sm:rounded-xl bg-blue-500 px-2 py-1 sm:px-4 sm:py-2 lg:px-6 lg:py-3 text-white font-bold shadow-xl border-2 sm:border-4 border-blue-400 flex items-center gap-1 sm:gap-2 max-w-[200px] sm:max-w-md text-center"
                >
                  <span className="text-lg sm:text-xl lg:text-2xl">←</span>
                  <span className="text-[10px] sm:text-xs lg:text-sm truncate">
                    {challengerMessage}
                  </span>
                </motion.div>
              )}

              {/* Winner Badge (center, above VS) */}
              {battleComplete && (
                <motion.div
                  initial={{ scale: 0, rotate: -180, y: -50 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                    y: 0,
                    boxShadow: [
                      '0 0 20px 5px rgba(251, 191, 36, 0.4)',
                      '0 0 30px 8px rgba(251, 191, 36, 0.6)',
                      '0 0 20px 5px rgba(251, 191, 36, 0.4)',
                    ],
                  }}
                  transition={{
                    delay: 0.5,
                    type: 'spring',
                    bounce: 0.4,
                    boxShadow: {
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                  className="inline-flex flex-col items-center gap-1 sm:gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 text-white font-bold shadow-2xl border-2 sm:border-4 border-yellow-300 mb-2 sm:mb-4"
                >
                  <span className="text-2xl sm:text-3xl lg:text-4xl">🏆</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-90">
                      Winner
                    </span>
                    <span className="text-sm sm:text-lg lg:text-xl font-black truncate max-w-[150px] sm:max-w-none">
                      @
                      {isChallengerWinner
                        ? challenger.profile.login
                        : opponent.profile.login}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Countdown or Speed Advantage or VS */}
              {!battleStarted && battleResult && countdown === null ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6 text-white shadow-2xl text-center max-w-xs"
                >
                  <div className="text-sm sm:text-base lg:text-lg font-bold mb-1">
                    ⚡ SPEED ADVANTAGE ⚡
                  </div>
                  <div className="text-xs sm:text-sm lg:text-base">
                    {battleResult.first_attacker ===
                    challenger.profile.login ? (
                      <span>@{challenger.profile.login} attacks first!</span>
                    ) : (
                      <span>@{opponent.profile.login} attacks first!</span>
                    )}
                  </div>
                </motion.div>
              ) : countdown !== null ? (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 p-6 sm:p-8 lg:p-12 text-white shadow-2xl"
                >
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold animate-pulse">
                    {countdown}
                  </div>
                </motion.div>
              ) : !battleStarted && battleResult && !countdown ? (
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 p-4 sm:p-6 lg:p-8 text-white shadow-2xl"
                >
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    VS
                  </div>
                </motion.div>
              ) : null}

              {/* Opponent's Move (Below center) */}
              {opponentMessage && (
                <motion.div
                  key={`opponent-${opponentMessage}`}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-lg sm:rounded-xl bg-red-500 px-2 py-1 sm:px-4 sm:py-2 lg:px-6 lg:py-3 text-white font-bold shadow-xl border-2 sm:border-4 border-red-400 flex items-center gap-1 sm:gap-2 max-w-[200px] sm:max-w-md text-center"
                >
                  <span className="text-[10px] sm:text-xs lg:text-sm truncate">
                    {opponentMessage}
                  </span>
                  <span className="text-lg sm:text-xl lg:text-2xl">→</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Opponent */}
          <FighterCard
            fighter={opponent}
            hp={opponentHP}
            maxHp={100}
            isWinner={battleComplete && !isChallengerWinner}
            side="right"
            specialMoveCharge={opponentCharge}
            isUsingSpecialMove={opponentUsingSpecial}
          />
        </div>

        {/* Battle Log */}
        <BattleLog events={visibleEvents} />

        {/* Battle Complete Message */}
        {battleComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-8 py-4 text-white shadow-2xl">
              <span className="text-3xl">🏆</span>
              <span className="text-2xl font-bold">
                {battleResult.winner.profile.login} WINS!
              </span>
              <span className="text-3xl">🏆</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
