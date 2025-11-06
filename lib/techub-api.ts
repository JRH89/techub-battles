import axios from 'axios';
import type { GameData, Fighter } from './types';

const API_BASE_URL = 'https://techub.life/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const techubAPI = {
  /**
   * Fetch all game data (archetypes, type chart, spirit animals, abilities, mechanics)
   */
  async getGameData(): Promise<GameData> {
    const response = await api.get('/game-data/all');
    return response.data;
  },

  /**
   * Fetch a specific fighter's card data
   */
  async getFighter(username: string): Promise<Fighter> {
    const response = await api.get(`/profiles/${username}/card`);
    return response.data;
  },

  /**
   * Fetch all battle-ready profiles
   */
  async getBattleReadyProfiles(): Promise<Fighter[]> {
    const response = await api.get('/profiles/battle-ready');
    return response.data.profiles;
  },

  /**
   * Optional: Record battle result to Rails (for leaderboards)
   */
  async recordBattle(challengerId: number, opponentId: number, winnerId: number) {
    // Skip DB calls in development mode
    if (process.env.NODE_ENV === 'development') {
      // DEV MODE: Skipping battle recording to DB
      return { success: true, message: 'Dev mode: Battle not saved to DB' };
    }
    
    const response = await api.post('/battles', {
      challenger_id: challengerId,
      opponent_id: opponentId,
      winner_id: winnerId,
    });
    return response.data;
  },
};

export default techubAPI;
