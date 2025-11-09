import { NextResponse } from 'next/server';
import { addCorsHeaders } from '@/lib/cors';
import { resilientTechubAPI } from '@/lib/resilient-api';

// Force dynamic to prevent timeouts during cold starts
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    // Test external API connectivity
    await resilientTechubAPI.getGameData();
    const responseTime = Date.now() - startTime;
    
    const response = NextResponse.json({
      status: 'healthy',
      external_api: {
        status: 'connected',
        response_time_ms: responseTime,
        url: 'https://techub.life/api/v1',
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
    
    const origin = request.headers.get('origin') || undefined;
    return addCorsHeaders(response, origin);
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    const response = NextResponse.json({
      status: 'degraded',
      external_api: {
        status: 'error',
        response_time_ms: responseTime,
        url: 'https://techub.life/api/v1',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: new Date().toISOString(),
      note: 'App will continue using cached Firestore data',
    }, { status: 503 }); // Service Unavailable but app still works
    
    const origin = request.headers.get('origin') || undefined;
    return addCorsHeaders(response, origin);
  }
}
