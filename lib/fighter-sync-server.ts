import { getDocs, collection, query, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Fighter, GameData } from './types';

/**
 * Server-side function to get fighters and game data for ISR
 * This runs on the server and provides cached data to prevent cold starts
 */
export async function getFightersAndGameData(): Promise<{
  fighters: Fighter[];
  gameData: GameData;
} | null> {
  try {
    // Get game data from Firestore
    const gameDataSnapshot = await getDocs(
      query(collection(db, 'game_data'), limit(1))
    );

    if (gameDataSnapshot.empty) {
      console.warn('No game data found in Firestore');
      return null;
    }

    const gameDataDoc = gameDataSnapshot.docs[0].data();
    const gameData: GameData = {
      archetypes: gameDataDoc.archetypes,
      type_chart: gameDataDoc.type_chart,
      spirit_animals: gameDataDoc.spirit_animals,
      archetype_abilities: gameDataDoc.archetype_abilities,
      mechanics: gameDataDoc.mechanics,
    };

    // Get fighters from Firestore
    const fightersSnapshot = await getDocs(collection(db, 'fighters'));

    if (fightersSnapshot.empty) {
      console.warn('No fighters found in Firestore');
      return null;
    }

    const fighters = fightersSnapshot.docs.map((doc) => ({
      profile: doc.data().profile,
      card: doc.data().card,
    }));

    return {
      fighters,
      gameData,
    };
  } catch (error) {
    console.error('Error fetching fighters and game data:', error);
    return null;
  }
}
