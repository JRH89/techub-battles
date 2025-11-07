import type { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
  title: 'About TecHub Battles',
  description:
    'Learn about TecHub Battles - an epic turn-based battle system where developer profiles compete with unique stats, archetypes, spirit animals, and special moves. Discover how the battle mechanics work!',
  path: '/about',
  keywords: [
    'about TecHub Battles',
    'how it works',
    'battle mechanics',
    'game rules',
    'developer battle game',
    'turn-based combat',
    'special moves',
    'type advantages',
    'spirit animals',
    'archetype system',
  ],
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
