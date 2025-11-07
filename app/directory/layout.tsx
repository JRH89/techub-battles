import type { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
  title: 'Fighter Directory - Browse All Fighters',
  description:
    'Browse all battle-ready TecHub fighters! Search through developer profiles, view their stats, archetypes, and special abilities. Find your next opponent!',
  path: '/directory',
  keywords: [
    'fighter directory',
    'developer profiles',
    'browse fighters',
    'search developers',
    'fighter stats',
    'developer archetypes',
    'battle roster',
    'player directory',
    'TecHub profiles',
    'fighter database',
  ],
});

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
