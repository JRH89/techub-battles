import axios from 'axios';
import type { GameData, Fighter } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_TECHUB_API || 'https://techub.life/api/v1';

console.log(`TecHub API Base URL: ${API_BASE_URL}`);

// Create axios instance with retry and timeout configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Make a resilient API call with retries and better error handling
 */
async function resilientRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown API error');
      
      console.warn(`API attempt ${attempt}/${MAX_RETRIES} failed:`, lastError.message);
      
      // Don't retry on client errors (4xx)
      if (axios.isAxiosError(lastError) && lastError.response?.status && lastError.response.status < 500) {
        throw lastError;
      }
      
      // If this is the last attempt, throw the error
      if (attempt === MAX_RETRIES) {
        throw lastError;
      }
      
      // Wait before retrying with exponential backoff
      await sleep(RETRY_DELAY * attempt);
    }
  }
  
  throw lastError!;
}

export const resilientTechubAPI = {
  /**
   * Fetch all game data with retry logic
   */
  async getGameData(): Promise<GameData> {
    return resilientRequest(async () => {
      const response = await api.get('/game-data/all');
      return response.data;
    });
  },

  /**
   * Fetch a specific fighter's card data with retry logic
   */
  async getFighter(username: string): Promise<Fighter> {
    return resilientRequest(async () => {
      const response = await api.get(`/profiles/${username}/card`);
      return response.data;
    });
  },

  /**
   * Fetch all battle-ready profiles with retry logic
   */
  async getBattleReadyProfiles(): Promise<Fighter[]> {
    return resilientRequest(async () => {
      const response = await api.get('/profiles/battle-ready');
      return response.data.profiles;
    });
  },

  /**
   * Record battle result with retry logic
   */
  async recordBattle(
    challengerId: number,
    opponentId: number,
    winnerId: number
  ) {
    // Skip DB calls in development mode
    if (process.env.NODE_ENV === 'development') {
      return { success: true, message: 'Dev mode: Battle not saved to DB' };
    }

    return resilientRequest(async () => {
      const response = await api.post('/battles', {
        challenger_id: challengerId,
        opponent_id: opponentId,
        winner_id: winnerId,
      });
      return response.data;
    });
  },
};

export default resilientTechubAPI;
