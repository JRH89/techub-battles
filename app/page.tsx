import { Suspense } from 'react';
import { Swords } from 'lucide-react';
import HomeClient from './HomeClient';
import { getFightersAndGameData } from '@/lib/fighter-sync-server';

// Revalidate on every request to always get fresh data
export const revalidate = 0;

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12 min-h-screen h-full">
      <div className="text-center">
        <div className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full" />
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Loading battle data...
        </p>
      </div>
    </div>
  );
}

export default async function Home() {
  let initialData = null;

  try {
    // Pre-fetch data on server side
    initialData = await getFightersAndGameData();
  } catch (error) {
    console.error('Error loading initial data:', error);
    // Continue with null data - client will handle loading
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomeClient initialData={initialData} />
    </Suspense>
  );
}
