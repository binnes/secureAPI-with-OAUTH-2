# Authentication Guide

## Overview

The frontend application uses OAuth 2.0 Authorization Code Flow with Keycloak for user authentication. This guide explains how authentication works, the token flow, and how to implement authentication in your code.

## Authentication Flow

### Complete Authentication Sequence

```
┌─────────┐                                                          ┌──────────┐
│ Browser │                                                          │ Keycloak │
└────┬────┘                                                          └────┬─────┘
     │                                                                    │
     │ 1. User clicks "Sign In"                                          │
     │────────────────────────────────────────────────────────────────▶  │
     │                                                                    │
     │ 2. Redirect to Keycloak login page                                │
     │ ◀──────────────────────────────────────────────────────────────── │
     │                                                                    │
     │ 3. User enters credentials                                        │
     │────────────────────────────────────────────────────────────────▶  │
     │                                                                    │
     │ 4. Keycloak validates credentials                                 │
     │                                                                    │
     │ 5. Redirect back with authorization code                          │
     │ ◀──────────────────────────────────────────────────────────────── │
     │                                                                    │
┌────▼────┐                                                          ┌────┴─────┐
│ NextAuth│                                                          │ Keycloak │
└────┬────┘                                                          └────┬─────┘
     │                                                                    │
     │ 6. Exchange code for tokens (server-side)                         │
     │────────────────────────────────────────────────────────────────▶  │
     │                                                                    │
     │ 7. Return access_token, refresh_token, id_token                   │
     │ ◀──────────────────────────────────────────────────────────────── │
     │                                                                    │
     │ 8. Create encrypted session cookie                                │
     │                                                                    │
┌────▼────┐                                                               │
│ Browser │                                                               │
└────┬────┘                                                               │
     │                                                                    │
     │ 9. Redirect to application with session                           │
     │                                                                    │
     │ 10. Access protected pages                                        │
     │                                                                    │
```

### Step-by-Step Breakdown

#### 1. Initial Sign-In Request

User clicks the "Sign In" button, triggering NextAuth:

```typescript
// components/auth/LoginButton.tsx
import { signIn } from 'next-auth/react';

<button onClick={() => signIn('keycloak')}>
  Sign In
</button>
```

#### 2. Redirect to Keycloak

NextAuth redirects to Keycloak's authorization endpoint:

```
https://keycloak.lab.home/realms/secure-test/protocol/openid-connect/auth
  ?client_id=authentication-test-frontend
  &redirect_uri=http://localhost:3000/api/auth/callback/keycloak
  &response_type=code
  &scope=openid email profile
```

#### 3. User Authentication

User enters credentials on Keycloak's login page. Keycloak validates the credentials.

#### 4. Authorization Code

Keycloak redirects back with an authorization code:

```
http://localhost:3000/api/auth/callback/keycloak
  ?code=abc123...
  &state=xyz789...
```

#### 5. Token Exchange

NextAuth exchanges the code for tokens (server-side):

```http
POST https://keycloak.lab.home/realms/secure-test/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=abc123...
&redirect_uri=http://localhost:3000/api/auth/callback/keycloak
&client_id=authentication-test-frontend
&client_secret=8u50V7iXkuibA4BvzKVoDcQ5aaAbUsTI
```

#### 6. Token Response

Keycloak returns tokens:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "refresh_expires_in": 1800,
  "token_type": "Bearer"
}
```

#### 7. Session Creation

NextAuth creates an encrypted session cookie containing:

- User information
- Access token
- Refresh token
- Token expiration time

## Token Management

### Access Token

**Purpose**: Authenticate API requests

**Lifetime**: Typically 1 hour (3600 seconds)

**Storage**: Encrypted in session cookie (server-side)

**Usage**: Passed to Orchestrate via token exchange endpoint

### Refresh Token

**Purpose**: Obtain new access tokens without re-authentication

**Lifetime**: Typically 30 minutes (1800 seconds)

**Storage**: Encrypted in session cookie (server-side)

**Usage**: Automatically used by NextAuth when access token expires

### Token Refresh Flow

```
┌─────────┐                                                          ┌──────────┐
│ NextAuth│                                                          │ Keycloak │
└────┬────┘                                                          └────┬─────┘
     │                                                                    │
     │ 1. Access token expired                                           │
     │                                                                    │
     │ 2. Use refresh token to get new access token                      │
     │────────────────────────────────────────────────────────────────▶  │
     │                                                                    │
     │ 3. Return new access_token and refresh_token                      │
     │ ◀──────────────────────────────────────────────────────────────── │
     │                                                                    │
     │ 4. Update session with new tokens                                 │
     │                                                                    │
```

Implementation in `lib/auth.ts`:

```typescript
async function refreshAccessToken(token: ExtendedJWT): Promise<ExtendedJWT> {
  try {
    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken!,
      }),
    });

    const refreshedTokens = await response.json();

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
```

## OAuth 2.0 Token Exchange (RFC 8693)

### Purpose

Enable Orchestrate to access the API server on behalf of the authenticated user.

### Flow

```
┌────────────┐                  ┌──────────┐                  ┌────────────┐
│ Orchestrate│                  │ Frontend │                  │ API Server │
│   Widget   │                  │          │                  │            │
└─────┬──────┘                  └────┬─────┘                  └─────┬──────┘
      │                              │                              │
      │ 1. Request user's token      │                              │
      │──────────────────────────────▶                              │
      │                              │                              │
      │ 2. Validate session          │                              │
      │                              │                              │
      │ 3. Return access_token       │                              │
      │◀──────────────────────────────                              │
      │                              │                              │
      │ 4. Call API with token       │                              │
      │──────────────────────────────────────────────────────────────▶
      │                              │                              │
      │                              │ 5. Validate JWT              │
      │                              │                              │
      │ 6. Return schedule data      │                              │
      │◀──────────────────────────────────────────────────────────────
      │                              │                              │
```

### Implementation

Token exchange endpoint at `/api/token-exchange`:

```typescript
// app/api/token-exchange/route.ts
export async function POST(request: NextRequest) {
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

  // Return the token in OAuth 2.0 Token Exchange format (RFC 8693)
  return NextResponse.json({
    access_token: session.accessToken,
    issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
    token_type: 'Bearer',
    expires_in: session.expiresAt
      ? Math.floor((session.expiresAt - Date.now()) / 1000)
      : 3600,
  });
}
```

## Using Authentication in Code

### Client Components

Check authentication status:

```typescript
'use client';

import { useSession } from 'next-auth/react';

export default function MyComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, {session?.user?.name}!</div>;
}
```

### Server Components

Get session on server:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function MyPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return <div>Welcome, {session.user?.name}!</div>;
}
```

### API Routes

Protect API routes:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Process authenticated request
  return NextResponse.json({ data: 'Protected data' });
}
```

### Middleware (Route Protection)

Protect entire routes:

```typescript
// middleware.ts
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/app/:path*'], // Protect all /app routes
};
```

## Sign Out

### Client-Side Sign Out

```typescript
import { signOut } from 'next-auth/react';

<button onClick={() => signOut({ callbackUrl: '/' })}>
  Sign Out
</button>
```

### What Happens on Sign Out

1. NextAuth clears the session cookie
2. User is redirected to home page
3. Keycloak session remains active (single sign-out not implemented)

## Security Considerations

### Token Storage

- ✅ **DO**: Store tokens in HTTP-only cookies (NextAuth default)
- ❌ **DON'T**: Store tokens in localStorage or sessionStorage
- ❌ **DON'T**: Expose tokens in client-side code

### Token Transmission

- ✅ **DO**: Use HTTPS in production
- ✅ **DO**: Validate tokens on every request
- ❌ **DON'T**: Send tokens in URL parameters
- ❌ **DON'T**: Log tokens

### Session Management

- ✅ **DO**: Set appropriate session timeouts
- ✅ **DO**: Implement token refresh
- ✅ **DO**: Handle token expiration gracefully
- ❌ **DON'T**: Store sensitive data in session

## Troubleshooting

### Issue: "Callback URL mismatch"

**Cause**: Redirect URI not configured in Keycloak

**Solution**: Add to Keycloak Valid Redirect URIs:
```
http://localhost:3000/api/auth/callback/keycloak
```

### Issue: "Invalid client credentials"

**Cause**: Wrong client secret

**Solution**: Verify `KEYCLOAK_CLIENT_SECRET` matches Keycloak

### Issue: "Token expired"

**Cause**: Access token expired and refresh failed

**Solution**: User needs to sign in again

### Issue: "CORS error"

**Cause**: Keycloak not allowing frontend origin

**Solution**: Add to Keycloak Web Origins:
```
http://localhost:3000
```

## Next Steps

- [Orchestrate Integration](orchestrate-integration.md) - Setup the widget
- [Development Guide](development.md) - Start building
- [API Integration](api-integration.md) - Understand the architecture

## Related Documentation

- [NextAuth.js Documentation](https://next-auth.js.org)
- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [OAuth 2.0 Token Exchange RFC 8693](https://datatracker.ietf.org/doc/html/rfc8693)
- [Keycloak Documentation](https://www.keycloak.org/documentation)