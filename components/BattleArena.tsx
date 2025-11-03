'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Fighter, GameData, BattleEvent, BattleResult } from '@/lib/types';
import { simulateBattle } from '@/lib/battle-engine';
import FighterCard from './FighterCard';
import BattleLog from './BattleLog';
import BattleControls from './BattleControls';

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
  const [speed, setSpeed] = useState(1);
  const [challengerHP, setChallengerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);
  const [challengerMessage, setChallengerMessage] = useState<string>('');
  const [opponentMessage, setOpponentMessage] = useState<string>('');

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
          return prev;
        }

        // Update HP and messages based on current event
        const nextEvent = battleResult.battle_log[prev + 1];
        
        if (nextEvent.type === 'attack' && nextEvent.damage) {
          // Update defender's HP
          if (nextEvent.defender === challenger.profile.login) {
            setChallengerHP(nextEvent.defender_hp || 0);
          } else if (nextEvent.defender === opponent.profile.login) {
            setOpponentHP(nextEvent.defender_hp || 0);
          }
          
          // Build detailed attack message
          let attackMsg = `⚔️ ${nextEvent.damage} damage`;
          
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
            attackMsg += ' ✨';
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
          } else if (nextEvent.attacker === opponent.profile.login) {
            setOpponentMessage(attackMsg);
            setChallengerMessage(''); // Clear challenger's old message
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
      <div className="flex items-center justify-center min-h-screen">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 mb-2">
            ⚔️ Battle Arena ⚔️
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Turn {Math.min(currentEventIndex, battleResult.total_turns)} of{' '}
            {battleResult.total_turns}
          </p>
        </motion.div>

        {/* Controls */}
        <BattleControls
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onPause={handlePause}
          onReset={handleReset}
          speed={speed}
          onSpeedChange={handleSpeedChange}
          disabled={!battleResult}
        />

        {/* Battle Arena */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Challenger */}
          <FighterCard
            fighter={challenger}
            hp={challengerHP}
            maxHp={100}
            isWinner={battleComplete && isChallengerWinner}
            side="left"
          />

          {/* VS Badge with Battle Messages */}
          <div className="flex items-center justify-center relative">
            <div className="flex flex-col items-center gap-4">
              {/* Challenger's Move (Above VS) */}
              {challengerMessage && (
                <motion.div
                  key={`challenger-${challengerMessage}`}
                  initial={{ opacity: 0, x: -20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl bg-blue-500 px-6 py-3 text-white font-bold shadow-xl border-4 border-blue-400 whitespace-nowrap flex items-center gap-2"
                >
                  <span className="text-2xl">←</span>
                  {challengerMessage}
                </motion.div>
              )}

              {/* VS Symbol */}
              <motion.div
                animate={{
                  scale: isPlaying ? [1, 1.1, 1] : 1,
                  rotate: isPlaying ? [0, 5, -5, 0] : 0,
                }}
                transition={{
                  duration: 0.5,
                  repeat: isPlaying ? Infinity : 0,
                }}
                className="rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 p-8 text-white shadow-2xl"
              >
                <div className="text-4xl font-bold">VS</div>
              </motion.div>

              {/* Opponent's Move (Below VS) */}
              {opponentMessage && (
                <motion.div
                  key={`opponent-${opponentMessage}`}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl bg-red-500 px-6 py-3 text-white font-bold shadow-xl border-4 border-red-400 whitespace-nowrap flex items-center gap-2"
                >
                  {opponentMessage}
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
            isWinner={battleComplete && isOpponentWinner}
            side="right"
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
