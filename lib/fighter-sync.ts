import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  limit, 
  writeBatch, 
  deleteDoc 
} from 'firebase/firestore';
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
 * Sync fighters from Rails to Firestore (timestamp-based incremental sync)
 * Uses existing API and compares timestamps to only update changed fighters
 */
export async function syncFightersFromRails(): Promise<boolean> {
  try {
    // Get all fighters from Rails (existing endpoint)
    const railsFighters = await techubAPI.getBattleReadyProfiles();
    
    if (railsFighters.length === 0) {
      return true; // No fighters to sync
    }
    
    // Get existing fighters from Firestore to compare
    const fightersRef = collection(db, 'fighters');
    const existingFightersSnapshot = await getDocs(fightersRef);
    
    // Create map of existing fighters for quick lookup
    const existingFighters = new Map();
    existingFightersSnapshot.forEach(doc => {
      const data = doc.data();
      existingFighters.set(doc.id, {
        last_updated: data.last_updated?.toDate(),
        data: data
      });
    });
    
    // Batch operations for efficiency
    const batch = writeBatch(db);
    let updatesCount = 0;
    
    for (const fighter of railsFighters) {
      const fighterId = fighter.profile.login;
      const existingFighter = existingFighters.get(fighterId);
      
      // Parse updated_at from Rails fighter (assuming it's included)
      const railsUpdatedAt = new Date(fighter.profile.updated_at || Date.now());
      
      // Check if fighter is new or updated
      const needsUpdate = !existingFighter || 
        !existingFighter.last_updated || 
        railsUpdatedAt > existingFighter.last_updated;
      
      if (needsUpdate) {
        const fighterDoc = doc(fightersRef, fighterId);
        batch.set(fighterDoc, {
          profile: fighter.profile,
          card: fighter.card,
          last_synced: new Date(),
          last_updated: railsUpdatedAt,
        }, { merge: true });
        updatesCount++;
      }
    }
    
    // Only execute batch if there are updates
    if (updatesCount > 0) {
      await batch.commit();
      // Update sync timestamp
      await updateLastSyncTimestamp();
    }
    
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
 * Get the last sync timestamp from Firestore
 */
async function getLastSyncTimestamp(): Promise<Date | null> {
  try {
    const syncDoc = await getDoc(doc(db, 'sync_status', 'fighters'));
    if (syncDoc.exists()) {
      return syncDoc.data()?.last_sync?.toDate() || null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Update the global last sync timestamp
 */
async function updateLastSyncTimestamp(): Promise<void> {
  try {
    await setDoc(doc(db, 'sync_status', 'fighters'), {
      last_sync: new Date(),
      last_sync_count: new Date(),
    }, { merge: true });
  } catch (error) {
    // Don't throw - sync can continue without updating timestamp
  }
}

/**
 * Force full sync (clears all cached fighters and resyncs)
 */
export async function forceFullSync(): Promise<boolean> {
  try {
    // Clear sync status to force full comparison
    await deleteDoc(doc(db, 'sync_status', 'fighters'));
    
    // Run normal sync - it will treat all fighters as "new"
    return await syncFightersFromRails();
  } catch (error) {
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
    // Check if we have any fighters at all
    const fightersRef = collection(db, 'fighters');
    const q = query(fightersRef, limit(1));
    const snapshot = await getDocs(q);
    
    // If no fighters, need to sync
    if (snapshot.empty) {
      return true;
    }
    
    // Check last sync time using our new tracking system
    const lastSync = await getLastSyncTimestamp();
    
    if (!lastSync) {
      return true; // Never synced before
    }
    
    // Sync if more than 1 hour ago for more frequent updates
    const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
    return hoursSinceSync > 1;
    
  } catch (error) {
    // Error checking sync status
    return true; // Sync on error to be safe
  }
}
