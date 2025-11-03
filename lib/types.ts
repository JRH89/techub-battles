// Core Types for TecHub Battle System

export interface Profile {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
}

export interface ProfileCard {
  archetype: string;
  spirit_animal: string;
  attack: number;
  defense: number;
  speed: number;
  vibe?: string;
  special_move?: string; // Rails has singular special_move
}

export interface Fighter {
  profile: Profile;
  card: ProfileCard;
}

export interface SpiritAnimalModifiers {
  attack: number;
  defense: number;
  speed: number;
}

export interface SpecialMove {
  name: string;
  description: string;
  damage_bonus?: number;
  defense_bonus?: number;
  speed_bonus?: number;
  special?: boolean;
}

export interface ArchetypeAbility {
  special_moves: SpecialMove[];
  passive: string;
  description: string;
  playstyle: string;
}

export interface TypeAdvantage {
  strong_against: string[];
  weak_against: string[];
}

export interface BattleMechanics {
  max_hp: number;
  max_turns: number;
  base_damage_multiplier: number;
  random_variance: {
    min: number;
    max: number;
  };
  type_multipliers: {
    strong: number;
    neutral: number;
    weak: number;
  };
  minimum_damage: number;
}

export interface GameData {
  archetypes: string[];
  type_chart: Record<string, TypeAdvantage>;
  spirit_animals: Record<string, SpiritAnimalModifiers>;
  archetype_abilities: Record<string, ArchetypeAbility>;
  mechanics: BattleMechanics;
}

export type BattleEventType =
  | 'battle_start'
  | 'type_advantage'
  | 'speed_check'
  | 'attack'
  | 'special_move'
  | 'passive_trigger'
  | 'knockout'
  | 'battle_end';

export interface BattleEvent {
  type: BattleEventType;
  turn?: number;
  message?: string;
  attacker?: string;
  defender?: string;
  damage?: number;
  attacker_hp?: number;
  defender_hp?: number;
  type_multiplier?: number; // 1.5 = strong, 1.0 = neutral, 0.75 = weak
  special_move?: string;
}

export interface BattleResult {
  winner: Fighter;
  loser: Fighter;
  battle_log: BattleEvent[];
  total_turns: number;
  final_hp: {
    challenger: number;
    opponent: number;
  };
}

export interface FighterStats {
  attack: number;
  defense: number;
  speed: number;
  hp: number;
  maxHp: number;
}
