import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Fighter, GameData } from './types';
import { techubAPI } from './techub-api';

/**
 * Sync game data from Rails to Firestore
 * This includes archetypes, type chart, spirit animals, abilities, mechanics
 */
export async function syncGameDataFromRails(): Promise<boolean> {
  try {
    // Syncing game data from Rails...
    
    // Fetch game data from Rails
    const gameData = await techubAPI.getGameData();
    
    // Save to Firestore
    await setDoc(doc(db, 'game_data', 'current'), {
      ...gameData,
      last_synced: new Date(),
    });
    
    // Game data synced to Firestore
    return true;
  } catch (error) {
    // Error syncing game data from Rails
    if (error instanceof Error) {
      // Error details
    }
    // Don't throw - return false to indicate sync failed
    return false;
  }
}

/**
 * Sync fighters from Rails to Firestore
 * Fetches all battle-ready profiles and updates Firestore
 */
export async function syncFightersFromRails(): Promise<boolean> {
  try {
    // Syncing fighters from Rails...
    
    // Fetch all battle-ready profiles from Rails
    const fighters = await techubAPI.getBattleReadyProfiles();
    
    // Save each fighter to Firestore
    const fightersRef = collection(db, 'fighters');
    
    for (const fighter of fighters) {
      await setDoc(doc(fightersRef, fighter.profile.login), {
        profile: fighter.profile,
        card: fighter.card,
        last_synced: new Date(),
      });
    }
    
    // Synced fighters to Firestore
    return true;
  } catch (error) {
    // Error syncing fighters from Rails
    if (error instanceof Error) {
      // Error details
    }
    // Don't throw - return false to indicate sync failed
    return false;
  }
}

/**
 * Get game data from Firestore (fast, no Rails call)
 */
export async function getGameDataFromFirestore(): Promise<GameData | null> {
  try {
    const gameDataDoc = await getDocs(query(collection(db, 'game_data'), limit(1)));
    
    if (gameDataDoc.empty) {
      // No game data found in Firestore
      return null;
    }
    
    const data = gameDataDoc.docs[0].data();
    
    // Raw Firestore game data
    // Archetype abilities keys
    
    return {
      archetypes: data.archetypes,
      type_chart: data.type_chart,
      spirit_animals: data.spirit_animals,
      archetype_abilities: data.archetype_abilities,
      mechanics: data.mechanics,
    };
  } catch (error) {
    // Error fetching game data from Firestore
    throw error;
  }
}

/**
 * Get fighters from Firestore (fast, no Rails call)
 */
export async function getFightersFromFirestore(): Promise<Fighter[]> {
  try {
    const fightersRef = collection(db, 'fighters');
    const snapshot = await getDocs(fightersRef);
    
    return snapshot.docs.map(doc => ({
      profile: doc.data().profile,
      card: doc.data().card,
    }));
  } catch (error) {
    // Error fetching fighters from Firestore
    throw error;
  }
}

/**
 * Check if fighters need syncing (if collection is empty or old)
 */
export async function shouldSyncFighters(): Promise<boolean> {
  try {
    const fightersRef = collection(db, 'fighters');
    const q = query(fightersRef, limit(1));
    const snapshot = await getDocs(q);
    
    // If no fighters, need to sync
    if (snapshot.empty) {
      return true;
    }
    
    // Check if last sync was > 24 hours ago
    const firstDoc = snapshot.docs[0];
    const lastSynced = firstDoc.data().last_synced?.toDate();
    
    if (!lastSynced) return true;
    
    const hoursSinceSync = (Date.now() - lastSynced.getTime()) / (1000 * 60 * 60);
    return hoursSinceSync > 24;
    
  } catch (error) {
    // Error checking sync status
    return true; // Sync on error to be safe
  }
}
