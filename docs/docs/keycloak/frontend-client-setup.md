# Frontend Client Configuration

This guide explains how to configure the `authentication-test-frontend` client in Keycloak for the Next.js frontend application.

## Overview

The frontend application requires its own OAuth 2.0 client in Keycloak, separate from the API server client. This client handles user authentication via the Authorization Code Flow with PKCE.

## Prerequisites

- Keycloak installed and running
- `secure-test` realm created
- Access to Keycloak Admin Console
- Admin credentials for Keycloak

## Client Configuration

### Step 1: Create Frontend Client

=== "Admin Console (Manual)"

    1. **Log into Keycloak Admin Console**
        - URL: `https://keycloak.lab.home/admin`
        - Select realm: **secure-test**

    2. **Navigate to Clients**
        - Click **Clients** in the left sidebar
        - Click **Create client** button

    3. **General Settings**
        - **Client type**: `OpenID Connect`
        - **Client ID**: `authentication-test-frontend`
        - Click **Next**

    4. **Capability Config**
        - **Client authentication**: ✓ ON (Confidential client)
        - **Authorization**: ✗ OFF
        - **Authentication flow**:
            - ✓ **Standard flow** (Authorization Code Flow)
            - ✓ **Direct access grants** (Optional, for testing)
            - ✗ Implicit flow
            - ✗ Service account roles
        - Click **Next**

    5. **Login Settings**
        - **Root URL**: `http://localhost:3000`
        - **Home URL**: `http://localhost:3000`
        - **Valid redirect URIs**:
            ```
            http://localhost:3000/*
            http://localhost:3000/api/auth/callback/keycloak
            https://app.lab.home/*
            https://app.lab.home/api/auth/callback/keycloak
            ```
        - **Valid post logout redirect URIs**:
            ```
            http://localhost:3000
            https://app.lab.home
            ```
        - **Web origins** (for CORS):
            ```
            http://localhost:3000
            https://app.lab.home
            ```
        - Click **Save**

    6. **Get Client Secret**
        - Go to **Credentials** tab
        - Copy the **Client Secret** value
        - Save this securely for the frontend `.env.local` file

=== "REST API (Automated)"

    ```bash
    # Step 1: Get admin access token
    TOKEN=$(curl -s -X POST "https://keycloak.lab.home/realms/master/protocol/openid-connect/token" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "username=admin" \
      -d "password=your-admin-password" \
      -d "grant_type=password" \
      -d "client_id=admin-cli" \
      | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

    # Step 2: Create frontend client
    curl -X POST "https://keycloak.lab.home/admin/realms/secure-test/clients" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "clientId": "authentication-test-frontend",
        "name": "Authentication Test Frontend",
        "description": "Next.js frontend application for TaskFlow",
        "enabled": true,
        "protocol": "openid-connect",
        "publicClient": false,
        "clientAuthenticatorType": "client-secret",
        "standardFlowEnabled": true,
        "directAccessGrantsEnabled": true,
        "serviceAccountsEnabled": false,
        "authorizationServicesEnabled": false,
        "rootUrl": "http://localhost:3000",
        "baseUrl": "http://localhost:3000",
        "redirectUris": [
          "http://localhost:3000/*",
          "http://localhost:3000/api/auth/callback/keycloak",
          "https://app.lab.home/*",
          "https://app.lab.home/api/auth/callback/keycloak"
        ],
        "webOrigins": [
          "http://localhost:3000",
          "https://app.lab.home"
        ],
        "attributes": {
          "pkce.code.challenge.method": "S256"
        }
      }'

    # Step 3: Get the client details including secret
    CLIENT_UUID=$(curl -s "https://keycloak.lab.home/admin/realms/secure-test/clients?clientId=authentication-test-frontend" \
      -H "Authorization: Bearer $TOKEN" \
      | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['id'])")

    # Step 4: Retrieve client secret
    curl -s "https://keycloak.lab.home/admin/realms/secure-test/clients/$CLIENT_UUID/client-secret" \
      -H "Authorization: Bearer $TOKEN" \
      | python3 -c "import sys, json; print('Client Secret:', json.load(sys.stdin)['value'])"
    ```

    !!! success "Automated Setup Complete"
        The client has been created and configured. Copy the client secret from the output for use in your `.env.local` file.

### Step 2: Configure Environment Variables

After creating the client and obtaining the secret, configure your frontend application:

```bash
# Navigate to frontend directory
cd Frontend

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your values
```

Update `.env.local` with the following:

```bash
# Keycloak Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Keycloak OAuth Provider
KEYCLOAK_ID=authentication-test-frontend
KEYCLOAK_SECRET=<client-secret-from-keycloak>
KEYCLOAK_ISSUER=https://keycloak.lab.home/realms/secure-test

# API Server Configuration
NEXT_PUBLIC_API_URL=http://localhost:9080
```

### Step 3: Generate NextAuth Secret

Generate a secure random secret for NextAuth:

```bash
openssl rand -base64 32
```

Copy the output and set it as `NEXTAUTH_SECRET` in `.env.local`.

## Client Configuration Details

### Authentication Flow

The frontend uses the **Authorization Code Flow** with PKCE (Proof Key for Code Exchange):

1. User clicks "Sign In"
2. Frontend redirects to Keycloak login page
3. User enters credentials
4. Keycloak validates and redirects back with authorization code
5. Frontend exchanges code for access token (with PKCE verification)
6. Session created with user info and tokens

### PKCE (Proof Key for Code Exchange)

PKCE adds security to the Authorization Code Flow:

- **Code Challenge**: Generated by frontend before redirect
- **Code Verifier**: Sent when exchanging authorization code
- **Method**: S256 (SHA-256 hash)
- **Purpose**: Prevents authorization code interception attacks

### Token Storage

- **Access Token**: Stored in HTTP-only cookie (not accessible to JavaScript)
- **Refresh Token**: Stored in HTTP-only cookie
- **ID Token**: Stored in HTTP-only cookie
- **Session**: Managed by NextAuth.js

## Redirect URIs Explained

### Valid Redirect URIs

These URIs are where Keycloak can redirect after authentication:

```
http://localhost:3000/*                              # Development (wildcard)
http://localhost:3000/api/auth/callback/keycloak   # NextAuth callback (specific)
https://app.lab.home/*                              # Production (wildcard)
https://app.lab.home/api/auth/callback/keycloak    # Production callback (specific)
```

!!! warning "Exact Match Required"
    The callback URI must match exactly. NextAuth uses `/api/auth/callback/keycloak` by default.

### Web Origins (CORS)

These origins are allowed to make cross-origin requests:

```
http://localhost:3000    # Development
https://app.lab.home     # Production
```

## Verification Steps

### 1. Verify Client Creation

=== "Admin Console"

    1. Navigate to **Clients**
    2. Find `authentication-test-frontend` in the list
    3. Verify **Enabled** is ON
    4. Check **Client authentication** is ON

=== "REST API"

    ```bash
    # Get client details
    curl -s "https://keycloak.lab.home/admin/realms/secure-test/clients?clientId=authentication-test-frontend" \
      -H "Authorization: Bearer $TOKEN" \
      | python3 -m json.tool
    ```

### 2. Test Authentication Flow

1. **Start frontend application**:
   ```bash
   cd Frontend
   npm run dev
   ```

2. **Open browser**: http://localhost:3000

3. **Click "Sign In"**:
    - Should redirect to Keycloak login page
    - URL should be: `https://keycloak.lab.home/realms/secure-test/protocol/openid-connect/auth?...`

4. **Enter credentials**:
    - Use a test user with `schedule-user` role
    - Should redirect back to application

5. **Verify success**:
    - Username should appear in header
    - Session should be active
    - Can access `/app` page

### 3. Verify Token Contents

After successful login, check the token:

```bash
# In browser console (F12)
# Note: Tokens are in HTTP-only cookies, so you can't access them directly
# But you can verify the session:
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

Expected session structure:
```json
{
  "user": {
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "expires": "2026-02-28T10:00:00.000Z"
}
```

## Troubleshooting

### Issue: "Invalid redirect URI"

**Cause**: Redirect URI mismatch between NextAuth and Keycloak

**Solution**:

1. Check the exact URI in browser when error occurs
2. Add that URI to **Valid redirect URIs** in Keycloak
3. Ensure it includes `/api/auth/callback/keycloak`
4. Restart frontend application

### Issue: "CORS error"

**Cause**: Frontend origin not in Web origins

**Solution**:

1. Add `http://localhost:3000` to **Web origins**
2. Ensure no trailing slash
3. Match protocol (http/https) exactly
4. Save and test again

### Issue: "Client authentication failed"

**Cause**: Client secret mismatch

**Solution**:

1. Go to Keycloak → Clients → authentication-test-frontend → Credentials
2. Copy the client secret
3. Update `KEYCLOAK_SECRET` in `.env.local`
4. Restart frontend: `npm run dev`

### Issue: "Session not persisting"

**Cause**: NEXTAUTH_SECRET not set or invalid

**Solution**:

1. Generate new secret: `openssl rand -base64 32`
2. Set `NEXTAUTH_SECRET` in `.env.local`
3. Clear browser cookies
4. Restart frontend
5. Try logging in again

### Issue: "Token expired" errors

**Cause**: Token lifespan too short

**Solution**:

1. Go to Keycloak → Realm Settings → Tokens
2. Increase **Access Token Lifespan** (default: 5 minutes)
3. Increase **SSO Session Idle** (default: 30 minutes)
4. Save and test again

## Advanced Configuration

### Custom Token Lifespan

To customize token lifespan for this client:

1. Go to **Clients** → **authentication-test-frontend** → **Advanced** tab
2. Set **Access Token Lifespan**: `15 Minutes`
3. Set **Client Session Idle**: `30 Minutes`
4. Set **Client Session Max**: `10 Hours`
5. Click **Save**

### Add Custom Claims

To add custom claims to tokens:

1. Go to **Clients** → **authentication-test-frontend** → **Client scopes**
2. Click **authentication-test-frontend-dedicated**
3. Go to **Mappers** tab
4. Click **Add mapper** → **By configuration**
5. Select mapper type (e.g., **User Attribute**)
6. Configure and save

### Audience Validation

To add audience claim:

1. Go to **Client scopes** → **authentication-test-frontend-dedicated** → **Mappers**
2. Click **Add mapper** → **By configuration**
3. Select **Audience**
4. Configure:
    - **Name**: `audience`
    - **Included Client Audience**: `authentication-test-frontend`
    - **Add to access token**: ✓ ON
5. Click **Save**

## Production Deployment

### Update for Production

When deploying to production:

1. **Update Keycloak client**:
    - Add production redirect URIs
    - Add production web origins
    - Update root/home URLs

2. **Update frontend environment**:
    ```bash
    NEXTAUTH_URL=https://app.lab.home
    KEYCLOAK_ISSUER=https://keycloak.lab.home/realms/secure-test
    ```

3. **Security checklist**:
    - [ ] Use HTTPS for all URLs
    - [ ] Generate new NEXTAUTH_SECRET for production
    - [ ] Use different client secret than development
    - [ ] Enable rate limiting
    - [ ] Monitor authentication logs
    - [ ] Set up session timeout alerts

### Environment-Specific Clients

Consider creating separate clients for each environment:

- `authentication-test-frontend-dev` - Development
- `authentication-test-frontend-staging` - Staging
- `authentication-test-frontend-prod` - Production

Benefits:
- Separate secrets per environment
- Different token lifespans
- Isolated configuration
- Better security

## Security Best Practices

### 1. Client Secret Management

- **Never commit** client secrets to version control
- Use environment variables or secret management systems
- Rotate secrets periodically (every 90 days)
- Use different secrets for dev/staging/production

### 2. Redirect URI Security

- Use specific URIs when possible (avoid wildcards in production)
- Always use HTTPS in production
- Validate redirect URIs on both client and server
- Never allow open redirects

### 3. Token Security

- Tokens stored in HTTP-only cookies (not accessible to JavaScript)
- Automatic token refresh before expiration
- Logout clears all session data
- Short token lifespans (5-15 minutes for access tokens)

### 4. CORS Configuration

- Restrict web origins to specific domains
- Never use wildcard (*) in production
- Match protocol and port exactly
- Review origins regularly

## Next Steps

After configuring the frontend client:

1. [Frontend Setup Guide](../frontend/setup.md) - Install and run the application
2. [Frontend Configuration](../frontend/configuration.md) - Detailed environment setup
3. [Authentication Flow](../frontend/authentication.md) - Understand the auth process
4. [API Integration](../frontend/api-integration.md) - Connect to backend API

## Additional Resources

- [Keycloak Client Configuration](https://www.keycloak.org/docs/latest/server_admin/#_clients)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)
- [PKCE Specification](https://oauth.net/2/pkce/)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [OpenID Connect Specification](https://openid.net/connect/)