import { NextResponse } from 'next/server';
import { addCorsHeaders } from '@/lib/cors';

// Force dynamic to prevent timeouts during cold starts
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Simple health check - always returns success
    // This helps keep the function warm and provides monitoring endpoint
    const response = NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
    
    // Add CORS headers
    const origin = request.headers.get('origin') || undefined;
    return addCorsHeaders(response, origin);
  } catch (error) {
    const response = NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
    
    // Add CORS headers to error responses too
    const origin = request.headers.get('origin') || undefined;
    return addCorsHeaders(response, origin);
  }
}
