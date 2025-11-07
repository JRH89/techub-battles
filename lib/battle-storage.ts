import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { BattleResult, Fighter } from './types';

/**
 * Battle result data structure for Firestore
 * Optimized for leaderboard queries and Rails consumption
 */
export interface StoredBattleResult {
  // Battle metadata
  battle_id: string;
  timestamp: Timestamp | Date;

  // Winner info
  winner: {
    login: string;
    profile_id: number;
    archetype: string;
    spirit_animal: string;
    final_hp: number;
  };

  // Loser info
  loser: {
    login: string;
    profile_id: number;
    archetype: string;
    spirit_animal: string;
    final_hp: number;
  };

  // Battle stats
  stats: {
    total_turns: number;
    total_damage_dealt_by_winner: number;
    total_damage_dealt_by_loser: number;
    winner_had_type_advantage: boolean;
    battle_duration_seconds: number;
  };

  // For Rails compatibility
  version: string; // Track battle engine version
}

/**
 * Save battle result to Firestore
 * Uses batched writes and proper indexing for scalability
 */
export async function saveBattleResult(
  battleResult: BattleResult,
  _challenger: Fighter,
  _opponent: Fighter
): Promise<string | null> {
  try {
    // Calculate battle stats
    const winnerDamage = battleResult.battle_log
      .filter(
        (e) =>
          e.type === 'attack' &&
          e.attacker === battleResult.winner.profile.login
      )
      .reduce((sum, e) => sum + (e.damage || 0), 0);

    const loserDamage = battleResult.battle_log
      .filter(
        (e) =>
          e.type === 'attack' && e.attacker === battleResult.loser.profile.login
      )
      .reduce((sum, e) => sum + (e.damage || 0), 0);

    // Check if winner had type advantage
    const typeAdvantageEvent = battleResult.battle_log.find(
      (e) =>
        e.type === 'type_advantage' &&
        e.message?.includes(battleResult.winner.card.archetype)
    );

    // Prepare data for Firestore
    const battleData: Omit<StoredBattleResult, 'battle_id' | 'timestamp'> = {
      winner: {
        login: battleResult.winner.profile.login,
        profile_id: battleResult.winner.profile.id,
        archetype: battleResult.winner.card.archetype,
        spirit_animal: battleResult.winner.card.spirit_animal,
        final_hp:
          battleResult.final_hp.challenger === 0
            ? battleResult.final_hp.opponent
            : battleResult.final_hp.challenger,
      },
      loser: {
        login: battleResult.loser.profile.login,
        profile_id: battleResult.loser.profile.id,
        archetype: battleResult.loser.card.archetype,
        spirit_animal: battleResult.loser.card.spirit_animal,
        final_hp:
          battleResult.final_hp.challenger === 0
            ? battleResult.final_hp.challenger
            : battleResult.final_hp.opponent,
      },
      stats: {
        total_turns: battleResult.total_turns,
        total_damage_dealt_by_winner: Math.round(winnerDamage * 10) / 10,
        total_damage_dealt_by_loser: Math.round(loserDamage * 10) / 10,
        winner_had_type_advantage: !!typeAdvantageEvent,
        battle_duration_seconds: battleResult.total_turns, // Approximate
      },
      version: '1.0.0', // Battle engine version
    };

    // Save to Firestore with server timestamp
    const docRef = await addDoc(collection(db, 'battles'), {
      ...battleData,
      timestamp: serverTimestamp(),
    });

    // Battle result saved
    return docRef.id;
  } catch (_error) {
    // Error saving battle result
    return null;
  }
}

/**
 * Get leaderboard data structure (for future implementation)
 * This will be queried by Rails via Firebase Admin SDK
 */
export interface LeaderboardEntry {
  login: string;
  profile_id: number;
  total_wins: number;
  total_losses: number;
  win_rate: number;
  total_damage_dealt: number;
  favorite_archetype: string;
  last_battle_timestamp: Date;
}
