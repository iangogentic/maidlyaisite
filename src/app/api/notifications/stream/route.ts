import { createSSEConnection } from '@/lib/push-notification-service';

export async function GET() {
  try {
    // Generate unique client ID
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`📡 New SSE connection established: ${clientId}`);
    
    // Create and return SSE connection
    return await createSSEConnection(clientId);
    
  } catch (error) {
    console.error('Error creating SSE connection:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to establish SSE connection',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cache-Control',
    },
  });
}
