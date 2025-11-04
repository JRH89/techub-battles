'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { simulateBattle } from '@/lib/battle-engine';
import { saveBattleResult } from '@/lib/battle-storage';
import type { Fighter, GameData, BattleEvent, BattleResult } from '@/lib/types';
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

  // Simulate battle on mount
  useEffect(() => {
    try {
      const result = simulateBattle(challenger, opponent, gameData);
      setBattleResult(result);
    } catch (error) {
      console.error('Battle simulation error:', error);
    }
  }, [challenger, opponent, gameData]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !battleResult) return;

    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => {
        if (prev >= battleResult.battle_log.length - 1) {
          setIsPlaying(false);
          
          // Clear messages when battle ends
          setChallengerMessage('');
          setOpponentMessage('');
          
          // Save battle result to Firebase when complete
          saveBattleResult(battleResult, challenger, opponent).then((battleId) => {
            if (battleId) {
              console.log('Battle saved with ID:', battleId);
            }
          });
          
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
        } else if ((nextEvent.type === 'attack' || nextEvent.type === 'special_move') && nextEvent.damage) {
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
              setChallengerCharge(prev => Math.min(prev + 1, 3));
            } else {
              setOpponentCharge(prev => Math.min(prev + 1, 3));
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
          const attackerArchetype = nextEvent.attacker === challenger.profile.login 
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
            const affectedPlayer = nextEvent.message?.includes(challenger.profile.login) 
              ? 'challenger' 
              : 'opponent';
            
            if (affectedPlayer === 'challenger') {
              setChallengerMessage('✨ DODGED! (Jester)');
            } else {
              setOpponentMessage('✨ DODGED! (Jester)');
            }
          } else if (nextEvent.message?.includes('regenerated')) {
            const affectedPlayer = nextEvent.message?.includes(challenger.profile.login) 
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
  }, [isPlaying, speed, battleResult, challenger, opponent]);

  const handlePlay = () => {
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

  const visibleEvents = battleResult.battle_log.slice(0, currentEventIndex + 1);
  const isChallengerWinner = battleResult.winner.profile.id === challenger.profile.id;
  const isOpponentWinner = battleResult.winner.profile.id === opponent.profile.id;
  const battleComplete = currentEventIndex >= battleResult.battle_log.length - 1;

  return (
    <div className="min-h-screen h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Controls with Header in Center */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Play/Pause/Reset */}
            <div className="flex items-center gap-3">
              {!isPlaying ? (
                <button
                  onClick={handlePlay}
                  disabled={!battleResult}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 text-white font-bold shadow-lg hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={20} />
                  <span>Play Battle</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-white font-bold shadow-lg hover:from-amber-700 hover:to-orange-700 transition-all"
                >
                  <Pause size={20} />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={handleReset}
                disabled={!battleResult}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-3 text-white font-bold shadow-lg hover:from-slate-700 hover:to-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={20} />
                <span>Reset</span>
              </button>
            </div>

            {/* Header - Center */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center flex-1 min-w-[200px]"
            >
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 mb-1">
                ⚔️ Battle Arena ⚔️
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Turn {Math.min(currentEventIndex, battleResult.total_turns)} of{' '}
                {battleResult.total_turns}
              </p>
            </motion.div>

            {/* Speed Control */}
            <div className="flex items-center gap-3">
              <FastForward size={20} className="text-slate-600 dark:text-slate-400" />
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Speed:
              </label>
              <div className="flex items-center gap-2">
                {[0.5, 1, 2, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <div className="flex flex-col items-center gap-4">
              {/* Challenger's Move (Above center) */}
              {challengerMessage && (
                <motion.div
                  key={`challenger-${challengerMessage}`}
                  initial={{ opacity: 0, x: -20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl bg-blue-500 px-6 py-3 text-white font-bold shadow-xl border-4 border-blue-400 whitespace-nowrap flex items-center gap-2 max-w-md text-center"
                >
                  <span className="text-2xl">←</span>
                  <span className="text-sm">{challengerMessage}</span>
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
                      '0 0 20px 5px rgba(251, 191, 36, 0.4)'
                    ]
                  }}
                  transition={{ 
                    delay: 0.5, 
                    type: 'spring', 
                    bounce: 0.4,
                    boxShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="inline-flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 px-8 py-4 text-white font-bold shadow-2xl border-4 border-yellow-300 mb-4"
                >
                  <span className="text-4xl">🏆</span>
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase tracking-wider opacity-90">Winner</span>
                    <span className="text-xl font-black">@{isChallengerWinner ? challenger.profile.login : opponent.profile.login}</span>
                  </div>
                </motion.div>
              )}


              {/* VS Symbol (only show before battle starts) */}
              {!isPlaying && !battleComplete && (
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 p-8 text-white shadow-2xl"
                >
                  <div className="text-4xl font-bold">VS</div>
                </motion.div>
              )}

              {/* Opponent's Move (Below center) */}
              {opponentMessage && (
                <motion.div
                  key={`opponent-${opponentMessage}`}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl bg-red-500 px-6 py-3 text-white font-bold shadow-xl border-4 border-red-400 whitespace-nowrap flex items-center gap-2 max-w-md text-center"
                >
                  <span className="text-sm">{opponentMessage}</span>
                  <span className="text-2xl">→</span>
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
