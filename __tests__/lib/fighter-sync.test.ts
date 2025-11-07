import { getFightersFromFirestore } from '@/lib/fighter-sync';
import { collection, getDocs } from 'firebase/firestore';
import axios from 'axios';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Fighter Sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFightersFromFirestore', () => {
    it('should fetch and return fighters from Firestore', async () => {
      const mockFighters = [
        {
          id: 'doc1',
          data: () => ({
            profile: {
              id: 1,
              login: 'testuser',
              name: 'Test User',
              avatar_url: 'https://example.com/avatar.png',
            },
            card: {
              attack: 75,
              defense: 60,
              speed: 80,
              archetype: 'Code Warrior',
              spirit_animal: 'Kangaroo',
            },
          }),
        },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockFighters,
      });

      const result = await getFightersFromFirestore();

      expect(result).toHaveLength(1);
      expect(result[0].profile.login).toBe('testuser');
      expect(result[0].card.archetype).toBe('Code Warrior');
    });

    it('should handle empty Firestore collection', async () => {
      (getDocs as jest.Mock).mockResolvedValue({
        docs: [],
      });

      const result = await getFightersFromFirestore();

      expect(result).toEqual([]);
    });

    it('should handle Firestore errors gracefully', async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(getFightersFromFirestore()).rejects.toThrow(
        'Firestore error'
      );
    });
  });

  // Note: syncFightersFromTecHub function not yet implemented
  // Tests would go here when the function is created
});
