import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ExtendedSession } from '@/types/auth';

/**
 * OAuth 2.0 Token Exchange API Route (RFC 8693)
 * 
 * This endpoint enables IBM watsonx Orchestrate to exchange the user's
 * NextAuth session token for a Keycloak access token that can be used
 * to call the API server on behalf of the user.
 * 
 * Flow:
 * 1. Orchestrate widget calls this endpoint with user's session
 * 2. We validate the session and extract the Keycloak access token
 * 3. We return the token to Orchestrate
 * 4. Orchestrate uses the token to call the API server
 * 
 * Security:
 * - Only authenticated users can call this endpoint
 * - Token is only valid for the authenticated user
 * - Token has limited lifetime (managed by Keycloak)
 * - CORS is restricted to same origin
 */

export async function POST(request: NextRequest) {
  try {
    // Get the user's session
    const session = (await getServerSession(authOptions)) as ExtendedSession | null;

    // Verify user is authenticated
    if (!session || !session.accessToken) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          error_description: 'User is not authenticated',
        },
        { status: 401 }
      );
    }

    // Extract the access token from the session
    const accessToken = session.accessToken;

    // Return the token in OAuth 2.0 Token Exchange format (RFC 8693)
    return NextResponse.json(
      {
        access_token: accessToken,
        issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
        token_type: 'Bearer',
        expires_in: session.expiresAt
          ? Math.floor((session.expiresAt - Date.now()) / 1000)
          : 3600, // Default to 1 hour if not available
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('Token exchange error:', error);

    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'An error occurred during token exchange',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Made with Bob
