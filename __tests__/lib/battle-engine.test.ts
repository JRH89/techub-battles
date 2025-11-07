import { simulateBattle } from '@/lib/battle-engine';
import type { Fighter, GameData } from '@/lib/types';

// Test fixtures - Match actual GameData structure
const mockGameData: GameData = {
  archetypes: ['Code Warrior', 'Bug Hunter', 'Architect'],
  type_chart: {
    'Code Warrior': {
      strong_against: ['Bug Hunter'],
      weak_against: ['Architect'],
    },
    'Bug Hunter': {
      strong_against: ['Architect'],
      weak_against: ['Code Warrior'],
    },
    Architect: {
      strong_against: ['Code Warrior'],
      weak_against: ['Bug Hunter'],
    },
  },
  spirit_animals: {
    Kangaroo: { attack: 1.0, defense: 1.0, speed: 1.1 },
    Eagle: { attack: 1.1, defense: 1.0, speed: 1.0 },
    Turtle: { attack: 1.0, defense: 1.1, speed: 1.0 },
  },
  archetype_abilities: {},
  mechanics: {
    max_hp: 100,
    max_turns: 100,
    base_damage_multiplier: 1.0,
    random_variance: { min: 0.8, max: 1.2 },
    type_multipliers: {
      strong: 1.5,
      weak: 0.75,
      neutral: 1.0,
    },
    minimum_damage: 1,
  },
};

const createMockFighter = (overrides: Partial<Fighter> = {}): Fighter => ({
  profile: {
    id: 1,
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://example.com/avatar.png',
    ...overrides.profile,
  },
  card: {
    attack: 50,
    defense: 50,
    speed: 50,
    archetype: 'Code Warrior',
    spirit_animal: 'Kangaroo',
    ...overrides.card,
  },
});

describe('Battle Engine', () => {
  describe('simulateBattle', () => {
    it('should return a complete battle result', () => {
      const challenger = createMockFighter({
        profile: {
          id: 1,
          login: 'challenger',
          name: 'Challenger',
          avatar_url: 'https://example.com/c.png',
        },
        card: {
          attack: 80,
          defense: 60,
          speed: 70,
          archetype: 'Code Warrior',
          spirit_animal: 'Kangaroo',
        },
      });
      const opponent = createMockFighter({
        profile: {
          id: 2,
          login: 'opponent',
          name: 'Opponent',
          avatar_url: 'https://example.com/o.png',
        },
        card: {
          attack: 60,
          defense: 80,
          speed: 50,
          archetype: 'Bug Hunter',
          spirit_animal: 'Eagle',
        },
      });

      const result = simulateBattle(challenger, opponent, mockGameData);

      expect(result).toBeDefined();
      expect(result.winner).toBeDefined();
      expect(result.loser).toBeDefined();
      expect(result.battle_log).toBeDefined();
      expect(result.total_turns).toBeGreaterThan(0);
      expect(result.final_hp).toBeDefined();
    });
    it('should have one fighter with 0 HP at the end', () => {
      const challenger = createMockFighter({
        profile: { id: 1, login: 'challenger', name: 'C', avatar_url: 'url' },
        card: {
          attack: 75,
          defense: 60,
          speed: 70,
          archetype: 'Code Warrior',
          spirit_animal: 'Kangaroo',
        },
      });
      const opponent = createMockFighter({
        profile: { id: 2, login: 'opponent', name: 'O', avatar_url: 'url' },
        card: {
          attack: 60,
          defense: 75,
          speed: 50,
          archetype: 'Bug Hunter',
          spirit_animal: 'Eagle',
        },
      });

      const result = simulateBattle(challenger, opponent, mockGameData);

      const finalHPs = [result.final_hp.challenger, result.final_hp.opponent];
      expect(finalHPs).toContain(0);
      expect(Math.min(...finalHPs)).toBe(0);
    });

    it('should generate battle log events', () => {
      const challenger = createMockFighter({
        profile: { id: 1, login: 'challenger', name: 'C', avatar_url: 'url' },
        card: {
          attack: 75,
          defense: 60,
          speed: 70,
          archetype: 'Code Warrior',
          spirit_animal: 'Kangaroo',
        },
      });
      const opponent = createMockFighter({
        profile: { id: 2, login: 'opponent', name: 'O', avatar_url: 'url' },
        card: {
          attack: 60,
          defense: 75,
          speed: 50,
          archetype: 'Bug Hunter',
          spirit_animal: 'Eagle',
        },
      });

      const result = simulateBattle(challenger, opponent, mockGameData);

      expect(result.battle_log.length).toBeGreaterThan(0);
      const hasAttackEvents = result.battle_log.some(
        (e) => e.type === 'attack'
      );
      expect(hasAttackEvents).toBe(true);
    });

    it('should complete within reasonable turn limit', () => {
      const challenger = createMockFighter({
        profile: { id: 1, login: 'challenger', name: 'C', avatar_url: 'url' },
        card: {
          attack: 75,
          defense: 60,
          speed: 70,
          archetype: 'Code Warrior',
          spirit_animal: 'Kangaroo',
        },
      });
      const opponent = createMockFighter({
        profile: { id: 2, login: 'opponent', name: 'O', avatar_url: 'url' },
        card: {
          attack: 60,
          defense: 75,
          speed: 50,
          archetype: 'Bug Hunter',
          spirit_animal: 'Eagle',
        },
      });

      const result = simulateBattle(challenger, opponent, mockGameData);

      expect(result.total_turns).toBeLessThan(1000);
    });

    it('should handle type advantages correctly', () => {
      const challenger = createMockFighter({
        profile: {
          id: 1,
          login: 'warrior',
          name: 'Warrior',
          avatar_url: 'url',
        },
        card: {
          attack: 70,
          defense: 60,
          speed: 70,
          archetype: 'Code Warrior',
          spirit_animal: 'Kangaroo',
        },
      });
      const opponent = createMockFighter({
        profile: { id: 2, login: 'hunter', name: 'Hunter', avatar_url: 'url' },
        card: {
          attack: 70,
          defense: 60,
          speed: 70,
          archetype: 'Bug Hunter',
          spirit_animal: 'Eagle',
        },
      });

      const result = simulateBattle(challenger, opponent, mockGameData);

      // Code Warrior is strong against Bug Hunter
      const typeAdvantageEvent = result.battle_log.find((e) =>
        e.message?.toLowerCase().includes('advantage')
      );
      expect(typeAdvantageEvent).toBeDefined();
    });
  });
});
