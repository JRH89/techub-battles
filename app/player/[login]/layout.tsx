import type { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ login: string }> 
}): Promise<Metadata> {
  const { login } = await params;
  
  // Use player's GitHub avatar as the favicon and OG image
  const avatarUrl = `https://github.com/${login}.png`;
  
  return createMetadata({
    title: `@${login} - Player Profile`,
    description: `View @${login}'s battle stats, win rate, recent battles, and fighter card on TecHub Battles. Check out their archetype, special moves, and leaderboard ranking!`,
    path: `/player/${login}`,
    type: 'profile',
    image: avatarUrl,
    keywords: [
      `${login} profile`,
      `${login} TecHub`,
      `${login} battle stats`,
      'player profile',
      'battle history',
      'win rate',
      'fighter stats',
      'developer profile',
      'battle record',
      'player statistics',
    ],
  });
}

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
