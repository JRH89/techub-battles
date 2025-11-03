import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Fighter, GameData } from './types';
import { techubAPI } from './techub-api';

/**
 * Sync game data from Rails to Firestore
 * This includes archetypes, type chart, spirit animals, abilities, mechanics
 */
export async function syncGameDataFromRails(): Promise<void> {
  try {
    console.log('Syncing game data from Rails...');
    
    // Fetch game data from Rails
    const gameData = await techubAPI.getGameData();
    
    // Save to Firestore
    await setDoc(doc(db, 'game_data', 'current'), {
      ...gameData,
      last_synced: new Date(),
    });
    
    console.log('Game data synced to Firestore');
  } catch (error) {
    console.error('Error syncing game data:', error);
    throw error;
  }
}

/**
 * Sync fighters from Rails to Firestore
 * Call this once per day or when you want to update fighter data
 */
export async function syncFightersFromRails(): Promise<void> {
  try {
    console.log('Syncing fighters from Rails...');
    
    // Fetch from Rails
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
    
    console.log(`Synced ${fighters.length} fighters to Firestore`);
  } catch (error) {
    console.error('Error syncing fighters:', error);
    throw error;
  }
}

/**
 * Get game data from Firestore (fast, no Rails call)
 */
export async function getGameDataFromFirestore(): Promise<GameData | null> {
  try {
    const gameDataDoc = await getDocs(query(collection(db, 'game_data'), limit(1)));
    
    if (gameDataDoc.empty) {
      console.warn('No game data found in Firestore');
      return null;
    }
    
    const data = gameDataDoc.docs[0].data();
    
    console.log('Raw Firestore game data:', data);
    console.log('Archetype abilities keys:', Object.keys(data.archetype_abilities || {}));
    
    return {
      archetypes: data.archetypes,
      type_chart: data.type_chart,
      spirit_animals: data.spirit_animals,
      archetype_abilities: data.archetype_abilities,
      mechanics: data.mechanics,
    };
  } catch (error) {
    console.error('Error fetching game data from Firestore:', error);
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
    console.error('Error fetching fighters from Firestore:', error);
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
    console.error('Error checking sync status:', error);
    return true; // Sync on error to be safe
  }
}
