import type { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: { login: string } }): Promise<Metadata> {
  const login = params.login;
  
  // For dynamic metadata, we'd ideally fetch the fighter data here
  // But since we're using Firestore client-side, we'll use a generic template
  return createMetadata({
    title: `@${login} - Player Profile`,
    description: `View @${login}'s battle stats, win rate, recent battles, and fighter card on TecHub Battles. Check out their archetype, special moves, and leaderboard ranking!`,
    path: `/player/${login}`,
  });
}
