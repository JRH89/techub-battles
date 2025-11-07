import { NextResponse } from 'next/server';

export async function GET() {
  const pointlessEndpoints = [
    {
      url: '/api/pointless/developer-excuse',
      name: 'Developer Excuse Generator',
      description:
        "Generates a random excuse for why your code isn't working. Includes confidence level, who to blame, and estimated fix time. Perfect for standup meetings! 🎲",
    },
  ];

  return NextResponse.json(pointlessEndpoints);
}
