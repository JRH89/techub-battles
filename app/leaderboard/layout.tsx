import type { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
  title: 'Leaderboard - Top Fighters',
  description: 'View the TecHub Battles leaderboard! See top fighters ranked by wins and win rates. Check out battle statistics, player rankings, and compete for the #1 spot!',
  path: '/leaderboard',
});

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
