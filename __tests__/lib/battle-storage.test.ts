import { saveBattleResult } from '@/lib/battle-storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { Fighter, BattleResult, GameData } from '@/lib/types';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));

const mockGameData: GameData = {
  archetypes: {
    'Code Warrior': { strong_against: 'Bug Hunter', weak_against: 'Architect' },
  },
  spirit_animals: {},
};

const createMockFighter = (id: number, login: string): Fighter => ({
  profile: {
    id,
    login,
    name: `${login} Name`,
    avatar_url: `https://example.com/${login}.png`,
  },
  card: {
    attack: 75,
    defense: 60,
    speed: 80,
    archetype: 'Code Warrior',
    spirit_animal: 'Kangaroo',
  },
});

describe('Battle Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveBattleResult', () => {
    it('should save battle result to Firestore', async () => {
      const challenger = createMockFighter(1, 'challenger');
      const opponent = createMockFighter(2, 'opponent');
      
      const mockBattleResult: BattleResult = {
        winner: challenger,
        loser: opponent,
        battle_log: [
          { type: 'start', turn: 0, message: 'Battle begins!' },
          { type: 'attack', turn: 1, attacker: 'challenger', defender: 'opponent', damage: 25, message: 'Hit!' },
        ],
        total_turns: 5,
        final_hp: { challenger: 50, opponent: 0 },
      };

      (addDoc as jest.Mock).mockResolvedValue({ id: 'battle123' });

      const result = await saveBattleResult(mockBattleResult, challenger, opponent);

      expect(addDoc).toHaveBeenCalled();
      expect(result).toBe('battle123');
    });

    it('should calculate winner and loser stats correctly', async () => {
      const challenger = createMockFighter(1, 'challenger');
      const opponent = createMockFighter(2, 'opponent');
      
      const mockBattleResult: BattleResult = {
        winner: challenger,
        loser: opponent,
        battle_log: [
          { type: 'attack', turn: 1, attacker: 'challenger', defender: 'opponent', damage: 30, message: 'Hit!' },
          { type: 'attack', turn: 2, attacker: 'opponent', defender: 'challenger', damage: 15, message: 'Hit!' },
        ],
        total_turns: 3,
        final_hp: { challenger: 85, opponent: 0 },
      };

      (addDoc as jest.Mock).mockResolvedValue({ id: 'battle456' });

      await saveBattleResult(mockBattleResult, challenger, opponent);

      const savedData = (addDoc as jest.Mock).mock.calls[0][1];
      
      expect(savedData.winner.login).toBe('challenger');
      expect(savedData.loser.login).toBe('opponent');
      expect(savedData.stats.total_turns).toBe(3);
      expect(savedData.stats.total_damage_dealt_by_winner).toBeGreaterThan(0);
    });

    it('should handle Firestore save errors gracefully', async () => {
      const challenger = createMockFighter(1, 'challenger');
      const opponent = createMockFighter(2, 'opponent');
      
      const mockBattleResult: BattleResult = {
        winner: challenger,
        loser: opponent,
        battle_log: [],
        total_turns: 1,
        final_hp: { challenger: 100, opponent: 0 },
      };

      (addDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      const result = await saveBattleResult(mockBattleResult, challenger, opponent);

      // Should return null on error, not throw
      expect(result).toBeNull();
    });

    it('should include type advantage in stats', async () => {
      const challenger = createMockFighter(1, 'challenger');
      const opponent = createMockFighter(2, 'opponent');
      
      const mockBattleResult: BattleResult = {
        winner: challenger,
        loser: opponent,
        battle_log: [
          { type: 'type_advantage', turn: 0, message: 'Code Warrior has advantage!' },
          { type: 'attack', turn: 1, attacker: 'challenger', defender: 'opponent', damage: 40, message: 'Critical!' },
        ],
        total_turns: 2,
        final_hp: { challenger: 100, opponent: 0 },
      };

      (addDoc as jest.Mock).mockResolvedValue({ id: 'battle789' });

      await saveBattleResult(mockBattleResult, challenger, opponent);

      const savedData = (addDoc as jest.Mock).mock.calls[0][1];
      expect(savedData.stats.winner_had_type_advantage).toBe(true);
    });

    it('should save with server timestamp', async () => {
      const challenger = createMockFighter(1, 'challenger');
      const opponent = createMockFighter(2, 'opponent');
      
      const mockBattleResult: BattleResult = {
        winner: challenger,
        loser: opponent,
        battle_log: [],
        total_turns: 1,
        final_hp: { challenger: 100, opponent: 0 },
      };

      (addDoc as jest.Mock).mockResolvedValue({ id: 'battle999' });

      await saveBattleResult(mockBattleResult, challenger, opponent);

      expect(serverTimestamp).toHaveBeenCalled();
      
      const savedData = (addDoc as jest.Mock).mock.calls[0][1];
      expect(savedData).toHaveProperty('timestamp');
    });
  });
});
