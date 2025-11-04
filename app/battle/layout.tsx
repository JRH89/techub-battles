import type { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
  title: 'Battle Arena - Watch Epic Battles',
  description: 'Watch TecHub developer profiles battle it out in real-time! Experience turn-based combat with special moves, type advantages, and strategic gameplay.',
  path: '/battle',
  noIndex: true, // Battle pages are dynamic and shouldn't be indexed
});

export default function BattleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
