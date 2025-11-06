import axios from 'axios';
import type { GameData, Fighter } from './types';

const API_BASE_URL = 'https://techub.life/api/v2';
const API_BASE_URL_V1 = 'https://techub.life/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiV1 = axios.create({
  baseURL: API_BASE_URL_V1,
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
   * Tries new frozen endpoint first, falls back to old endpoint if not available
   */
  async getFighter(username: string): Promise<Fighter> {
    try {
      const response = await api.get(`/battles/profiles/${username}/card`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Fallback to v1 endpoint
        const response = await apiV1.get(`/profiles/${username}/card`);
        return response.data;
      }
      throw error;
    }
  },

  /**
   * Fetch all battle-ready profiles
   * Tries new frozen endpoint first, falls back to old endpoint if not available
   */
  async getBattleReadyProfiles(): Promise<Fighter[]> {
    try {
      const response = await api.get('/battles/profiles/battle-ready');
      return response.data.profiles;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Fallback to v1 endpoint
        const response = await apiV1.get('/profiles/battle-ready');
        return response.data.profiles;
      }
      throw error;
    }
  },

  /**
   * Optional: Record battle result to Rails (for leaderboards)
   */
  async recordBattle(challengerId: number, opponentId: number, winnerId: number) {
    // Skip DB calls in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('DEV MODE: Skipping battle recording to DB', {
        challengerId,
        opponentId,
        winnerId
      });
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
