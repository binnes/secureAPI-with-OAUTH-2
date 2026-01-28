# Groups Claim Mapper Configuration

This guide explains how to configure Keycloak to add a `groups` claim to JWT tokens, which is required for MicroProfile JWT role-based authorization.

## Why is This Needed?

The MicroProfile JWT specification expects roles to be in a `groups` claim in the JWT token. By default, Keycloak places roles in the `realm_access.roles` claim. OpenLiberty's `@RolesAllowed` annotation checks the `groups` claim for authorization decisions.

Without this mapper, you'll receive **403 Forbidden** errors even with a valid JWT token because the authorization system cannot find the required roles.

## Prerequisites

- Keycloak installed and running
- `secure-test` realm created
- `authentication-test-api` client configured
- Users created with `schedule-user` role assigned

## Understanding the Problem

When you obtain a JWT token from Keycloak, it contains roles in this structure:

```json
{
  "realm_access": {
    "roles": ["schedule-user", "offline_access", "uma_authorization"]
  }
}
```

But MicroProfile JWT expects:

```json
{
  "groups": ["schedule-user", "offline_access", "uma_authorization"]
}
```

## Solution: Add Groups Mapper

We need to add a Protocol Mapper to the Keycloak client that maps `realm_access.roles` to a `groups` claim.

## Step 1: Access Client Scopes

1. **Login to Keycloak Admin Console**: `https://keycloak.lab.home/admin` (or your Keycloak URL)
2. **Select the `secure-test` realm** from the dropdown
3. **Go to "Clients"** in the left menu
4. **Click on `authentication-test-api`**
5. **Go to the "Client scopes" tab**
6. **Click on `authentication-test-api-dedicated`** (the dedicated scope for this client)

## Step 2: Add the Mapper

=== "User Realm Role (Recommended)"

    This is the simplest approach for dynamic role assignment:

    1. **Click "Add mapper"** → **"By configuration"**
    2. **Select "User Realm Role"**
    3. **Configure the mapper**:
        - **Name**: `groups-mapper`
        - **Mapper Type**: `User Realm Role`
        - **Token Claim Name**: `groups`
        - **Claim JSON Type**: `String`
        - **Add to ID token**: ✓ **ON**
        - **Add to access token**: ✓ **ON**
        - **Add to userinfo**: ✓ **ON**
        - **Multivalued**: ✓ **ON**
    4. **Click "Save"**

=== "Hardcoded Claim"

    Use this if you want to assign specific roles to all users:

    1. **Click "Add mapper"** → **"By configuration"**
    2. **Select "Hardcoded claim"**
    3. **Configure**:
        - **Name**: `groups-hardcoded`
        - **Token Claim Name**: `groups`
        - **Claim value**: `schedule-user` (or comma-separated list)
        - **Claim JSON Type**: `String`
        - **Add to ID token**: ✓ ON
        - **Add to access token**: ✓ ON
        - **Add to userinfo**: ✓ ON
    4. **Click "Save"**

    !!! warning "Limitation"
        This approach gives all users the same roles. Use "User Realm Role" for dynamic role assignment based on actual user roles.

## Step 3: Verify the Configuration

### Get a New Token

After adding the mapper, obtain a new JWT token:

```bash
TOKEN=$(curl -s -k -X POST https://keycloak.lab.home/realms/secure-test/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=authentication-test-api" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=password" \
  -d "username=testuser2" \
  -d "password=YOUR_PASSWORD" | jq -r '.access_token')
```

### Decode and Check for Groups Claim

Decode the JWT token to verify it contains the `groups` claim:

=== "Command Line"

    ```bash
    # Decode the token payload
    python3 -c "import sys, json, base64; \
    payload = sys.argv[1].split('.')[1]; \
    payload += '=' * (4 - len(payload) % 4); \
    claims = json.loads(base64.b64decode(payload)); \
    print('Username:', claims.get('preferred_username')); \
    print('Groups:', json.dumps(claims.get('groups', []), indent=2))" "$TOKEN"
    ```

    **Expected output:**

    ```
    Username: testuser2
    Groups: [
      "schedule-user",
      "offline_access",
      "uma_authorization",
      "default-roles-secure-test"
    ]
    ```

=== "jwt.io"

    1. Copy the token
    2. Go to [https://jwt.io](https://jwt.io)
    3. Paste the token in the "Encoded" section
    4. Check the "Payload" section for the `groups` claim

## Step 4: Update OpenLiberty Configuration

Ensure your [`server.xml`](../config/server.md) is configured to use the `groups` claim:

```xml
<mpJwt id="jwtConfig"
       jwksUri="${env.JWT_JWKS_URI}"
       issuer="${env.JWT_ISSUER}"
       audiences="authentication-test-api"
       groupNameAttribute="groups"
       userNameAttribute="preferred_username"
       sslRef="jwtSSLConfig"/>
```

The key setting is `groupNameAttribute="groups"`.

## Step 5: Test the API

Now test the API with the new token:

```bash
# Get token
TOKEN=$(curl -s -k -X POST https://keycloak.lab.home/realms/secure-test/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=authentication-test-api" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=password" \
  -d "username=testuser2" \
  -d "password=YOUR_PASSWORD" | jq -r '.access_token')

# Test API
curl -s http://localhost:9080/api/v1/schedule \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected result:** **200 OK** with schedule data

```json
{
  "user": "testuser2",
  "schedule": [
    {
      "date": "2026-01-28",
      "time": "12:00",
      "description": "Team standup meeting"
    }
  ]
}
```

## Troubleshooting

### Still Getting 403 Forbidden

**Possible causes:**

1. **Token doesn't have groups claim**
   - Clear browser cache and get a new token
   - Verify the mapper is enabled
   - Check that the mapper is in the correct client scope

2. **Groups claim is empty**
   - Verify the user has the `schedule-user` role assigned
   - Check realm roles vs client roles (use realm roles)
   - Verify the mapper is configured for realm roles

3. **OpenLiberty not reading groups**
   - Check `groupNameAttribute="groups"` in server.xml
   - Verify the role name matches exactly: `schedule-user`
   - Check server logs for role extraction messages

### Token Still Doesn't Have Groups Claim

1. **Restart Keycloak** (if needed):
   ```bash
   # If using Docker/Podman
   podman restart keycloak
   ```

2. **Clear token cache**:
   - Logout from all sessions
   - Get a completely new token
   - Don't reuse old tokens

3. **Verify mapper is in access token**:
   - Go to mapper configuration
   - Ensure "Add to access token" is checked
   - Save the configuration again

### Groups Claim Exists But Authorization Fails

Check OpenLiberty logs for detailed information:

```bash
tail -f target/liberty/wlp/usr/servers/authTestServer/logs/messages.log | grep -i "group\|role"
```

Look for messages like:
- `groupIds=[]` - Groups not being extracted
- `Authorization failed` - Role check failing

## Using REST API

You can also configure the mapper via Keycloak's REST API:

```bash
# Get admin token
ADMIN_TOKEN=$(curl -s -X POST https://keycloak.lab.home/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

# Get client scope ID
SCOPE_ID=$(curl -s -k -X GET "https://keycloak.lab.home/admin/realms/secure-test/client-scopes" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq -r '.[] | select(.name=="authentication-test-api-dedicated") | .id')

# Add mapper
curl -k -X POST "https://keycloak.lab.home/admin/realms/secure-test/client-scopes/$SCOPE_ID/protocol-mappers/models" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "groups-mapper",
    "protocol": "openid-connect",
    "protocolMapper": "oidc-usermodel-realm-role-mapper",
    "config": {
      "claim.name": "groups",
      "jsonType.label": "String",
      "id.token.claim": "true",
      "access.token.claim": "true",
      "userinfo.token.claim": "true",
      "multivalued": "true"
    }
  }'
```

## Next Steps

- [Test API Endpoints](../api/endpoints.md) - Test all API functionality
- [Troubleshooting](../troubleshooting/common-issues.md) - Common issues and solutions
- [API Authentication](../api/authentication.md) - Learn more about JWT authentication

## References

- [MicroProfile JWT Specification](https://github.com/eclipse/microprofile-jwt-auth/blob/master/spec/src/main/asciidoc/interoperability.asciidoc)
- [Keycloak Protocol Mappers](https://www.keycloak.org/docs/latest/server_admin/#_protocol-mappers)
- [OpenLiberty MicroProfile JWT](https://openliberty.io/docs/latest/reference/config/mpJwt.html)