import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  limit,
  writeBatch,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Fighter, GameData } from './types';
import { resilientTechubAPI } from './resilient-api';

/**
 * Sync game data from Rails to Firestore
 * This includes archetypes, type chart, spirit animals, abilities, mechanics
 */
export async function syncGameDataFromRails(): Promise<boolean> {
  try {
    // Syncing game data from Rails...

    // Fetch game data from Rails with retry logic
    const gameData = await resilientTechubAPI.getGameData();

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
    // Get all fighters from Rails (existing endpoint) with retry logic
    const railsFighters = await resilientTechubAPI.getBattleReadyProfiles();

    if (railsFighters.length === 0) {
      return true; // No fighters to sync
    }

    // Batch operations for efficiency
    const fightersRef = collection(db, 'fighters');
    const batch = writeBatch(db);

    // Update all fighters from the API
    for (const fighter of railsFighters) {
      const fighterId = fighter.profile.login;
      const fighterDoc = doc(fightersRef, fighterId);
      
      batch.set(
        fighterDoc,
        {
          profile: fighter.profile,
          card: fighter.card,
          last_synced: new Date(),
          last_updated: new Date(fighter.profile.updated_at || Date.now()),
        },
        { merge: true }
      );
    }

    // Commit all updates
    await batch.commit();
    // Update sync timestamp
    await updateLastSyncTimestamp();

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
async function _getLastSyncTimestamp(): Promise<Date | null> {
  try {
    const syncDoc = await getDoc(doc(db, 'sync_status', 'fighters'));
    if (syncDoc.exists()) {
      return syncDoc.data()?.last_sync?.toDate() || null;
    }
    return null;
  } catch (_error) {
    return null;
  }
}

/**
 * Update the global last sync timestamp
 */
async function updateLastSyncTimestamp(): Promise<void> {
  try {
    await setDoc(
      doc(db, 'sync_status', 'fighters'),
      {
        last_sync: new Date(),
        last_sync_count: new Date(),
      },
      { merge: true }
    );
  } catch (_error) {
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
  } catch (_error) {
    return false;
  }
}

/**
 * Get game data from Firestore (fast, no Rails call)
 */
export async function getGameDataFromFirestore(): Promise<GameData | null> {
  try {
    const gameDataDoc = await getDocs(
      query(collection(db, 'game_data'), limit(1))
    );

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

    return snapshot.docs.map((doc) => ({
      profile: doc.data().profile,
      card: doc.data().card,
    }));
  } catch (error) {
    // Error fetching fighters from Firestore
    throw error;
  }
}

/**
 * Check if fighters need syncing (if collection is empty)
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

    // Always sync if fighters exist - let API handle caching with 304 responses
    return true;
  } catch (_error) {
    // Error checking sync status
    return true; // Sync on error to be safe
  }
}
