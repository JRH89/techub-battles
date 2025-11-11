import { getDocs, collection, query, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Fighter, GameData } from './types';
import { syncFightersFromRails, syncGameDataFromRails } from './fighter-sync';

/**
 * Server-side function to get fighters and game data for ISR
 * This runs on the server and syncs from Rails before reading from Firestore
 */
export async function getFightersAndGameData(): Promise<{
  fighters: Fighter[];
  gameData: GameData;
} | null> {
  try {
    // Sync from Rails first to get latest data
    console.log('Syncing data from Rails API...');
    await Promise.all([
      syncFightersFromRails(),
      syncGameDataFromRails(),
    ]);

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

    console.log(`Loaded ${fighters.length} fighters from Firestore`);

    return {
      fighters,
      gameData,
    };
  } catch (error) {
    console.error('Error fetching fighters and game data:', error);
    return null;
  }
}
