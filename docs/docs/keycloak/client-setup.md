# Client Configuration

This guide explains how to configure the `authentication-test-api` client in Keycloak for OAuth 2.0 authentication.

## What is a Client?

In Keycloak, a client represents an application that wants to use Keycloak for authentication. For our API, the client configuration defines:

- How the API validates JWT tokens
- Which authentication flows are allowed
- Token settings and lifespans
- Valid redirect URIs

## Prerequisites

- Keycloak installed and running
- `secure-test` realm created
- Access to Keycloak Admin Console

## Step 1: Create Client

=== "Admin Console"

    1. **Select "secure-test" realm** from dropdown
    2. **Go to "Clients"** in left menu
    3. **Click "Create client"**
    4. **Enter Client Details**:
        - **Client type**: `OpenID Connect`
        - **Client ID**: `authentication-test-api`
    5. **Click "Next"**

    6. **Configure Capability**:
        - **Client authentication**: ✓ ON (confidential client)
        - **Authorization**: ✗ OFF
        - **Authentication flow**:
          - ✓ Standard flow
          - ✓ Direct access grants
          - ✗ Implicit flow
          - ✗ Service accounts roles
    7. **Click "Next"**

    8. **Configure Login Settings**:
        - **Root URL**: `http://localhost:9080`
        - **Home URL**: `http://localhost:9080`
        - **Valid redirect URIs**:
          - `http://localhost:9080/*`
          - `https://localhost:9443/*`
        - **Valid post logout redirect URIs**: `+` (use root URL)
        - **Web origins**:
          - `http://localhost:9080`
          - `https://localhost:9443`
    9. **Click "Save"**

=== "REST API"

    ```bash
    # Get admin token
    TOKEN=$(curl -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "username=admin" \
      -d "password=admin" \
      -d "grant_type=password" \
      -d "client_id=admin-cli" \
      | jq -r '.access_token')

    # Create client
    curl -X POST http://localhost:8080/admin/realms/secure-test/clients \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "clientId": "authentication-test-api",
        "name": "Authentication Test API",
        "description": "RESTful API with OAuth 2.0 authentication",
        "enabled": true,
        "clientAuthenticatorType": "client-secret",
        "redirectUris": [
          "http://localhost:9080/*",
          "https://localhost:9443/*"
        ],
        "webOrigins": [
          "http://localhost:9080",
          "https://localhost:9443"
        ],
        "publicClient": false,
        "protocol": "openid-connect",
        "standardFlowEnabled": true,
        "directAccessGrantsEnabled": true,
        "serviceAccountsEnabled": false
      }'
    ```

## Step 2: Get Client Secret

The client secret is required for the API to validate tokens.

=== "Admin Console"

    1. **Go to "Clients"**
    2. **Click "authentication-test-api"**
    3. **Go to "Credentials" tab**
    4. **Copy the "Client secret"**

    Save this secret - you'll need it for the API configuration.

=== "REST API"

    ```bash
    # Get client secret
    curl -X GET "http://localhost:8080/admin/realms/secure-test/clients/$(curl -X GET http://localhost:8080/admin/realms/secure-test/clients \
      -H "Authorization: Bearer $TOKEN" \
      | jq -r '.[] | select(.clientId=="authentication-test-api") | .id')/client-secret" \
      -H "Authorization: Bearer $TOKEN" \
      | jq -r '.value'
    ```

## Step 3: Configure Client Settings

### Settings Tab

1. **Go to "Clients" → "authentication-test-api" → "Settings"**
2. **Configure**:
   - **Client ID**: `authentication-test-api` (read-only)
   - **Name**: `Authentication Test API`
   - **Description**: `RESTful API with OAuth 2.0 authentication`
   - **Always display in console**: ✗
   - **Consent required**: ✗
   - **Login theme**: (leave empty)
   - **Client authentication**: ✓ ON
   - **Authorization**: ✗ OFF

3. **Authentication flow**:
   - ✓ Standard flow (Authorization Code)
   - ✓ Direct access grants (Resource Owner Password)
   - ✗ Implicit flow
   - ✗ Service accounts roles
   - ✗ OAuth 2.0 Device Authorization Grant

4. **Click "Save"**

### Access Settings

1. **Still in "Settings" tab, scroll to "Access settings"**
2. **Configure**:
   - **Root URL**: `http://localhost:9080`
   - **Home URL**: `http://localhost:9080`
   - **Valid redirect URIs**:
     ```
     http://localhost:9080/*
     https://localhost:9443/*
     ```
   - **Valid post logout redirect URIs**: `+`
   - **Web origins**:
     ```
     http://localhost:9080
     https://localhost:9443
     ```
   - **Admin URL**: (leave empty)

3. **Click "Save"**

### Advanced Settings

1. **Scroll to "Advanced" section**
2. **Configure Token Settings**:
   - **Access Token Lifespan**: (leave empty to use realm default)
   - **Client Session Idle**: (leave empty)
   - **Client Session Max**: (leave empty)
   - **Client Offline Session Idle**: (leave empty)
   - **Client Offline Session Max**: (leave empty)

3. **OAuth 2.0 Mutual TLS Certificate Bound Access Tokens**: ✗
4. **OIDC CIBA Grant**: ✗
5. **Click "Save"**

## Step 4: Configure Roles

Map the realm role to the client.

### Client Roles Mapping

1. **Go to "Clients" → "authentication-test-api" → "Client scopes"**
2. **Click "authentication-test-api-dedicated"**
3. **Go to "Mappers" tab**
4. **Click "Add mapper" → "By configuration"**
5. **Select "User Realm Role"**
6. **Configure**:
   - **Name**: `realm-roles`
   - **Mapper Type**: `User Realm Role`
   - **Multivalued**: ✓ ON
   - **Token Claim Name**: `realm_access.roles`
   - **Claim JSON Type**: `String`
   - **Add to ID token**: ✓ ON
   - **Add to access token**: ✓ ON
   - **Add to userinfo**: ✓ ON

7. **Click "Save"**

This ensures the `schedule-user` role appears in the JWT token.

!!! note "Testing Client Configuration"
    To test the client configuration with actual tokens, you'll need to create users first. See the [User Management](user-management.md) guide, then return to test token generation.

## Step 5: Configure API Environment

Update your API configuration with the client details:

### Environment Variables

```bash
export JWT_JWKS_URI=http://localhost:8080/realms/secure-test/protocol/openid-connect/certs
export JWT_ISSUER=http://localhost:8080/realms/secure-test
export KEYCLOAK_CLIENT_ID=authentication-test-api
export KEYCLOAK_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

### MicroProfile Config

Update `src/main/resources/META-INF/microprofile-config.properties`:

```properties
mp.jwt.verify.publickey.location=http://localhost:8080/realms/secure-test/protocol/openid-connect/certs
mp.jwt.verify.issuer=http://localhost:8080/realms/secure-test
keycloak.client.id=authentication-test-api
```

## Advanced Configuration

### CORS Configuration

If your API needs to handle CORS:

1. **Go to "Clients" → "authentication-test-api" → "Settings"**
2. **Scroll to "Web origins"**
3. **Add allowed origins**:
   ```
   http://localhost:3000
   https://app.example.com
   ```
4. **Click "Save"**

### Token Lifespan

Customize token lifespan for this client:

1. **Go to "Clients" → "authentication-test-api" → "Advanced" tab**
2. **Set "Access Token Lifespan"**: `10 Minutes`
3. **Click "Save"**

### Audience

Add audience claim to tokens:

1. **Go to "Clients" → "authentication-test-api" → "Client scopes"**
2. **Click "authentication-test-api-dedicated"**
3. **Go to "Mappers" tab**
4. **Click "Add mapper" → "By configuration"**
5. **Select "Audience"**
6. **Configure**:
   - **Name**: `audience`
   - **Included Client Audience**: `authentication-test-api`
   - **Add to access token**: ✓ ON
7. **Click "Save"**

## Troubleshooting

### Invalid Client Credentials

If you get "invalid_client" error:

1. Verify client ID is correct
2. Check client secret matches
3. Ensure client authentication is enabled

### Token Missing Roles

If JWT token doesn't contain roles:

1. Verify realm role mapper is configured
2. Check user has the `schedule-user` role
3. Ensure mapper is added to access token

### CORS Errors

If you get CORS errors:

1. Add frontend origin to "Web origins"
2. Ensure origin matches exactly (including protocol and port)
3. Check browser console for specific CORS error

## Next Steps

- [User Management](user-management.md) - Create test users
- [API Authentication](../api/authentication.md) - Use tokens with the API
- [Troubleshooting](../troubleshooting/common-issues.md) - Common issues

## Additional Resources

- [Keycloak Client Configuration](https://www.keycloak.org/docs/latest/server_admin/#_clients)
- [OAuth 2.0 Flows](https://oauth.net/2/grant-types/)
- [OpenID Connect](https://openid.net/connect/)