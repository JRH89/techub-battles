import { NextResponse } from 'next/server';
import { addCorsHeaders } from '@/lib/cors';

// Force dynamic to prevent timeouts during cold starts
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const pointlessEndpoints = [
    {
      url: '/api/pointless/developer-excuse',
      name: 'Developer Excuse Generator',
      description:
        "Generates a random excuse for why your code isn't working. Includes confidence level, who to blame, and estimated fix time. Perfect for standup meetings! 🎲",
    },
  ];

  const response = NextResponse.json(pointlessEndpoints);
  const origin = request.headers.get('origin') || undefined;
  return addCorsHeaders(response, origin);
}
