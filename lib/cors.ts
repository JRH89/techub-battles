import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS middleware for API routes
 * Allows cross-origin requests with configurable origins
 */
export function addCorsHeaders(response: NextResponse, origin?: string) {
  // Set CORS headers
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const allowOrigin = origin ?? '*';
  response.headers.set('Access-Control-Allow-Origin', allowOrigin);

  if (allowOrigin === '*') {
    response.headers.delete('Access-Control-Allow-Credentials');
  } else {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Preserve existing cache headers if they exist
  if (!response.headers.has('Cache-Control')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  }

  return response;
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export function handleOptions(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    return addCorsHeaders(response, request.headers.get('origin') || undefined);
  }
  return null;
}
