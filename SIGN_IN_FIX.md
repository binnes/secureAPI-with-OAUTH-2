# Sign In Button Fix

## Problem
The "Sign In" button on the frontend was not working - clicking it did nothing and no redirect to Keycloak occurred.

## Root Cause
The environment variables in `Frontend/.env.local` were using incorrect names:
- Used: `KEYCLOAK_ID` and `KEYCLOAK_SECRET`
- Expected by NextAuth: `KEYCLOAK_CLIENT_ID` and `KEYCLOAK_CLIENT_SECRET`

This caused NextAuth to fail silently because it couldn't find the required Keycloak configuration.

## Solution
Updated the environment variable names in both files:

### 1. `Frontend/.env.local`
```bash
# Before:
KEYCLOAK_ID=authentication-test-frontend
KEYCLOAK_SECRET=AaRWJq6MxfgFFNnCzi7jdoLlt5yHzzXJ

# After:
KEYCLOAK_CLIENT_ID=authentication-test-frontend
KEYCLOAK_CLIENT_SECRET=AaRWJq6MxfgFFNnCzi7jdoLlt5yHzzXJ
```

### 2. `Frontend/.env.local.example`
Updated the example file to match the correct variable names for future reference.

## Testing
After restarting the frontend server with the corrected environment variables:

1. Navigate to http://localhost:3000
2. Click the "Sign In" button
3. You should now be redirected to the Keycloak login page at:
   `https://keycloak.otterburn.home/realms/secure-test/protocol/openid-connect/auth`
4. Enter credentials: `testuser2` / `Passw0rd12£`
5. After successful authentication, you'll be redirected back to `/app`

## Files Modified
- `Frontend/.env.local` - Fixed environment variable names
- `Frontend/.env.local.example` - Updated example to match correct names
- Frontend server restarted to pick up new configuration

## Next Steps
The Sign In button should now work correctly. You can test the complete OAuth flow:
1. Sign in via Keycloak
2. Access the `/app` page
3. Use the chat widget to interact with the Orchestrate agent
4. The agent will use OAuth Token Exchange to access your schedule from the API Server