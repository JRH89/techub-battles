import { Suspense } from 'react';
import { Loader } from 'lucide-react';
import BattleContent from './BattleContent';

// Revalidate every 5 minutes to prevent cold starts
export const revalidate = 300;

export default function BattlePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12 min-h-screen h-full">
          <div className="text-center">
            <Loader className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Loading battle arena...
            </p>
          </div>
        </div>
      }
    >
      <BattleContent />
    </Suspense>
  );
}
