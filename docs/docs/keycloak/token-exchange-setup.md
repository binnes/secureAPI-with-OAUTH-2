# Token Exchange Setup in Keycloak

This guide explains how to enable OAuth 2.0 Token Exchange (RFC 8693) in Keycloak, which allows one client to exchange a token for another client's token - the "act on behalf of" flow.

## What is Token Exchange?

Token Exchange allows a client application to exchange an access token issued for one client (e.g., frontend) for a new access token issued for a different client (e.g., API server), while maintaining the same user identity. This is useful for:

- Frontend applications calling backend APIs with different client credentials
- Microservices calling other microservices on behalf of a user
- Implementing proper security boundaries between services

## Prerequisites

- Keycloak installed and running
- `secure-test` realm created
- Two clients configured:
  - Source client (e.g., `authentication-test-frontend`)
  - Target client (e.g., `authentication-test-api`)

## Important: Token Exchange Cannot Be Configured via UI

!!! warning "UI Limitation"
    Token exchange permissions **cannot be configured through the Keycloak Admin Console UI**. The Authorization tab is for resource-based authorization, not token exchange. You must use either:
    
    1. **REST API** (recommended - automated script provided)
    2. **Keycloak Admin CLI** (kcadm.sh)

## Step 1: Verify Client Configuration

Ensure both clients are properly configured:

### Target Client (authentication-test-api)

1. **Go to "Clients" → "authentication-test-api"**
2. **Go to "Settings" tab**
3. **Verify**:
   - **Client authentication**: ✓ ON (confidential client)
   - **Standard flow**: ✓ ON
   - **Direct access grants**: ✓ ON
4. **Click "Save"**

### Source Client (authentication-test-frontend)

1. **Go to "Clients" → "authentication-test-frontend"**
2. **Go to "Settings" tab**
3. **Verify**:
   - **Client authentication**: ✓ ON (confidential client)
   - **Standard flow**: ✓ ON
   - **Direct access grants**: ✓ ON
4. **Click "Save"**

## Step 2: Enable Token Exchange

=== "Automated Script (Recommended)"

    Use the provided automated script:

    ```bash
    chmod +x orchestrate/enable-token-exchange.sh
    # Set admin password as environment variable (don't save in files)
    export KEYCLOAK_ADMIN_PASS=your-admin-password
    ./orchestrate/enable-token-exchange.sh
    ```

    ### What the Script Does

    The script uses Keycloak's REST API to perform the following operations:

    #### 1. Enable Authorization Services

    ```bash
    # Update target client to enable authorization services
    PUT /admin/realms/{realm}/clients/{target-client-id}
    {
      "authorizationServicesEnabled": true,
      "serviceAccountsEnabled": true
    }
    ```

    This is required before creating authorization scopes and permissions.

    #### 2. Enable Fine-Grained Permissions

    ```bash
    # Enable management permissions on target client
    PUT /admin/realms/{realm}/clients/{target-client-id}/management/permissions
    {"enabled": true}
    ```

    #### 3. Create Client Policy

    ```bash
    # Create client policy allowing source client to exchange tokens
    POST /admin/realms/{realm}/clients/{target-client-id}/authz/resource-server/policy/client
    {
      "name": "frontend-can-exchange",
      "clients": ["{source-client-id}"],
      "logic": "POSITIVE"
    }
    ```

    #### 4. Add Audience Mapper (Critical)

    ```bash
    # Add audience mapper to source client
    POST /admin/realms/{realm}/clients/{source-client-id}/protocol-mappers/models
    {
      "name": "api-audience-mapper",
      "protocol": "openid-connect",
      "protocolMapper": "oidc-audience-mapper",
      "config": {
        "included.client.audience": "{target-client}",
        "id.token.claim": "false",
        "access.token.claim": "true"
      }
    }
    ```

    This ensures the target client is included in the audience (`aud`) claim of tokens issued by the source client, which is required for token exchange to work.

    #### 5. Create Token Exchange Scope

    ```bash
    # Create the token-exchange scope
    POST /admin/realms/{realm}/clients/{target-client-id}/authz/resource-server/scope
    {
      "name": "token-exchange",
      "displayName": "Token Exchange"
    }
    ```

    #### 6. Create Token Exchange Permission

    ```bash
    # Create permission associating the scope with the policy
    POST /admin/realms/{realm}/clients/{target-client-id}/authz/resource-server/permission/scope
    {
      "name": "token-exchange.permission",
      "type": "scope",
      "logic": "POSITIVE",
      "decisionStrategy": "AFFIRMATIVE",
      "scopes": ["{scope-id}"],
      "policies": ["{policy-id}"]
    }
    ```

=== "Manual REST API"

    === "Complete Script"

        Run all commands in sequence:

        ```bash
        # Get admin token
        ADMIN_TOKEN=$(curl -k -X POST https://keycloak.otterburn.home/realms/master/protocol/openid-connect/token \
          -H "Content-Type: application/x-www-form-urlencoded" \
          -d "username=admin" \
          -d "password=your-admin-password" \
          -d "grant_type=password" \
          -d "client_id=admin-cli" \
          | jq -r '.access_token')

        # Get client IDs
        TARGET_CLIENT_ID=$(curl -k -X GET https://keycloak.otterburn.home/admin/realms/secure-test/clients \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          | jq -r '.[] | select(.clientId=="authentication-test-api") | .id')

        SOURCE_CLIENT_ID=$(curl -k -X GET https://keycloak.otterburn.home/admin/realms/secure-test/clients \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          | jq -r '.[] | select(.clientId=="authentication-test-frontend") | .id')

        # Enable Authorization Services on target client
        CLIENT_CONFIG=$(curl -k -s -X GET "https://keycloak.otterburn.home/admin/realms/secure-test/clients/${TARGET_CLIENT_ID}" \
          -H "Authorization: Bearer $ADMIN_TOKEN")

        curl -k -X PUT "https://keycloak.otterburn.home/admin/realms/secure-test/clients/${TARGET_CLIENT_ID}" \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          -H "Content-Type: application/json" \
          -d "$(echo "$CLIENT_CONFIG" | jq '. + {
            "authorizationServicesEnabled": true,
            "serviceAccountsEnabled": true
          }')"

        # Enable fine-grained permissions
        curl -k -X PUT "https://keycloak.otterburn.home/admin/realms/secure-test/clients/${TARGET_CLIENT_ID}/management/permissions" \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{"enabled": true}'

        # Create client policy
        POLICY_RESPONSE=$(curl -k -X POST "https://keycloak.otterburn.home/admin/realms/secure-test/clients/${TARGET_CLIENT_ID}/authz/resource-server/policy/client" \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          -H "Content-Type: application/json" \
          -d "{
            \"name\": \"frontend-can-exchange\",
            \"description\": \"Allow frontend to exchange tokens\",
            \"clients\": [\"${SOURCE_CLIENT_ID}\"],
            \"logic\": \"POSITIVE\"
          }")

        POLICY_ID=$(echo "$POLICY_RESPONSE" | jq -r '.id')

        # Add audience mapper to source client
        curl -k -X POST "https://keycloak.otterburn.home/admin/realms/secure-test/clients/${SOURCE_CLIENT_ID}/protocol-mappers/models" \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          -H "Content-Type: application/json" \
          -d "{
            \"name\": \"api-audience-mapper\",
            \"protocol\": \"openid-connect\",
            \"protocolMapper\": \"oidc-audience-mapper\",
            \"config\": {
              \"included.client.audience\": \"authentication-test-api\",
              \"id.token.claim\": \"false\",
              \"access.token.claim\": \"true\"
            }
          }"

        # Create token-exchange scope
        SCOPE_RESPONSE=$(curl -k -X POST "https://keycloak.otterburn.home/admin/realms/secure-test/clients/${TARGET_CLIENT_ID}/authz/resource-server/scope" \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "token-exchange",
            "displayName": "Token Exchange"
          }')

        SCOPE_ID=$(echo "$SCOPE_RESPONSE" | jq -r '.id')

        # Create token-exchange permission
        curl -k -X POST "https://keycloak.otterburn.home/admin/realms/secure-test/clients/${TARGET_CLIENT_ID}/authz/resource-server/permission/scope" \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          -H "Content-Type: application/json" \
          -d "{
            \"name\": \"token-exchange.permission\",
            \"description\": \"Permission for token exchange\",
            \"type\": \"scope\",
            \"logic\": \"POSITIVE\",
            \"decisionStrategy\": \"AFFIRMATIVE\",
            \"scopes\": [\"${SCOPE_ID}\"],
            \"policies\": [\"${POLICY_ID}\"]
          }"
        ```

    === "Step by Step"

        ### 1. Get Admin Token and Client IDs

        ```bash
        # Get admin token
        ADMIN_TOKEN=$(curl -k -X POST https://keycloak.otterburn.home/realms/master/protocol/openid-connect/token \
          -H "Content-Type: application/x-www-form-urlencoded" \
          -d "username=admin" \
          -d "password=your-admin-password" \
          -d "grant_type=password" \
          -d "client_id=admin-cli" \
          | jq -r '.access_token')

        # Get client IDs
        TARGET_CLIENT_ID=$(curl -k -X GET https://keycloak.otterburn.home/admin/realms/secure-test/clients \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          | jq -r '.[] | select(.clientId=="authentication-test-api") | .id')

        SOURCE_CLIENT_ID=$(curl -k -X GET https://keycloak.otterburn.home/admin/realms/secure-test/clients \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          | jq -r '.[] | select(.clientId=="authentication-test-frontend") | .id')

        echo "Target Client ID: $TARGET_CLIENT_ID"
        echo "Source Client ID: $SOURCE_CLIENT_ID"
        ```

        ### 2. Enable Authorization Services on Target Client

        ```bash
        # Get current client configuration
        CLIENT_CONFIG=$(curl -k -s -X GET "https://keycloak.otterburn.home/admin/realms/secure-test/clients/${TARGET_CLIENT_ID}" \
          -H "Authorization: Bearer $ADMIN_TOKEN")

        # Update to enable authorization services
        curl -k -X PUT "https://keycloak.otterburn.home/admin/realms/secure-test/clients/${TARGET_CLIENT_ID}" \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          -H "Content-Type: application/json" \
          -d "$(echo "$CLIENT_CONFIG" | jq '. + {
            "authorizationServicesEnabled": true,
            "serviceAccountsEnabled": true
          }')"
        ```

        ### 3. Enable Fine-Grained Permissions

        ```bash
        # Enable management permissions on target client
        curl -k -X PUT "https://keycloak.otterburn.home/admin/realms/secure-test/clients/${TARGET_CLIENT_ID}/management/permissions" \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{"enabled": true}'
        ```

        ### 4. Create Client Policy

        ```bash
        # Create client policy for token exchange
        POLICY_RESPONSE=$(curl -k -X POST "https://keycloak.otterburn.home/admin/realms/secure-test/clients/${TARGET_CLIENT_ID}/authz/resource-server/policy/client" \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          -H "Content-Type: application/json" \
          -d "{
            \"name\": \"frontend-can-exchange\",
            \"description\": \"Allow frontend to exchange tokens\",
            \"clients\": [\"${SOURCE_CLIENT_ID}\"],
            \"logic\": \"POSITIVE\"
          }")

        POLICY_ID=$(echo "$POLICY_RESPONSE" | jq -r '.id')
        echo "Policy ID: $POLICY_ID"
        ```

        ### 5. Add Audience Mapper to Source Client

        ```bash
        # Add audience mapper to include target client in token audience
        curl -k -X POST "https://keycloak.otterburn.home/admin/realms/secure-test/clients/${SOURCE_CLIENT_ID}/protocol-mappers/models" \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          -H "Content-Type: application/json" \
          -d "{
            \"name\": \"api-audience-mapper\",
            \"protocol\": \"openid-connect\",
            \"protocolMapper\": \"oidc-audience-mapper\",
            \"config\": {
              \"included.client.audience\": \"authentication-test-api\",
              \"id.token.claim\": \"false\",
              \"access.token.claim\": \"true\"
            }
          }"
        ```

        ### 6. Create Token Exchange Scope

        ```bash
        # Create the token-exchange scope
        SCOPE_RESPONSE=$(curl -k -X POST "https://keycloak.otterburn.home/admin/realms/secure-test/clients/${TARGET_CLIENT_ID}/authz/resource-server/scope" \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "name": "token-exchange",
            "displayName": "Token Exchange"
          }')

        SCOPE_ID=$(echo "$SCOPE_RESPONSE" | jq -r '.id')
        echo "Scope ID: $SCOPE_ID"
        ```

        ### 7. Create Token Exchange Permission

        ```bash
        # Create permission with scope and policy
        curl -k -X POST "https://keycloak.otterburn.home/admin/realms/secure-test/clients/${TARGET_CLIENT_ID}/authz/resource-server/permission/scope" \
          -H "Authorization: Bearer $ADMIN_TOKEN" \
          -H "Content-Type: application/json" \
          -d "{
            \"name\": \"token-exchange.permission\",
            \"description\": \"Permission for token exchange\",
            \"type\": \"scope\",
            \"logic\": \"POSITIVE\",
            \"decisionStrategy\": \"AFFIRMATIVE\",
            \"scopes\": [\"${SCOPE_ID}\"],
            \"policies\": [\"${POLICY_ID}\"]
          }"
        ```

## Step 3: Test Token Exchange

### Manual Test (Token Exchange Only)

You can verify token exchange is working without the API server:

```bash
# Get token from frontend client
FRONTEND_TOKEN=$(curl -k -X POST https://keycloak.otterburn.home/realms/secure-test/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=authentication-test-frontend" \
  -d "client_secret=YOUR_FRONTEND_SECRET" \
  -d "grant_type=password" \
  -d "username=testuser2" \
  -d "password=YOUR_PASSWORD" \
  | jq -r '.access_token')

# Exchange for API token
API_TOKEN=$(curl -k -X POST https://keycloak.otterburn.home/realms/secure-test/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=authentication-test-api" \
  -d "client_secret=YOUR_API_SECRET" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:token-exchange" \
  -d "subject_token=${FRONTEND_TOKEN}" \
  -d "subject_token_type=urn:ietf:params:oauth:token-type:access_token" \
  -d "requested_token_type=urn:ietf:params:oauth:token-type:access_token" \
  | jq -r '.access_token')

echo "Frontend Token: ${FRONTEND_TOKEN:0:50}..."
echo "API Token: ${API_TOKEN:0:50}..."
```

If both tokens are successfully obtained, token exchange is configured correctly.

### Full End-to-End Test (Requires API Server)

!!! warning "API Server Required"
    The `token-exchange-example.sh` script performs a complete test including calling the API server at `http://localhost:9080`.
    
    **This script will fail if the API server is not deployed and running.**
    
    If you're following the documentation in order, skip this script for now and return to it after completing the API server deployment steps.

```bash
# Only run this after API server is deployed
chmod +x orchestrate/token-exchange-example.sh
./orchestrate/token-exchange-example.sh
```

## Common Issues

### Error: "Client is not within the token audience"

**Cause**: The source client's tokens don't include the target client in the audience claim

**Solution**:
1. Verify the audience mapper is configured on the source client
2. Check the mapper includes the target client ID
3. Ensure `access.token.claim` is set to `true`
4. Get a new token after adding the mapper

### Error: "Client not allowed to exchange"

**Cause**: Token exchange permission not configured properly

**Solution**:
1. Verify Authorization Services are enabled on target client
2. Check "Permissions Enabled" is ON for target client
3. Verify client policy includes source client
4. Ensure policy is associated with token-exchange permission
5. Confirm token-exchange scope exists

### Error: "invalid_client"

**Cause**: Client credentials incorrect

**Solution**:
1. Verify client_id matches exactly
2. Check client_secret is correct
3. Ensure client authentication is enabled on both clients

### Error: "Token exchange not enabled"

**Cause**: Keycloak version too old or feature disabled

**Solution**:
1. Upgrade to Keycloak 18+ (token exchange is stable)
2. Check realm settings for any disabled features
3. Verify Authorization Services are enabled

### Error: "Scope not found"

**Cause**: Token exchange scope wasn't created

**Solution**:
1. Verify Authorization Services are enabled first
2. Manually create the token-exchange scope
3. Re-run the setup script

## Security Considerations

1. **Limit Token Exchange**: Only allow specific clients to exchange tokens
2. **Use Confidential Clients**: Both source and target should be confidential
3. **Audit Logs**: Monitor token exchange events in Keycloak logs
4. **Token Lifespan**: Consider shorter lifespans for exchanged tokens
5. **Scope Restrictions**: Exchanged tokens may have different scopes

## Advanced Configuration

### Multiple Source Clients

To allow multiple clients to exchange tokens:

1. Update the client policy to include multiple clients:
```bash
curl -k -X PUT "https://keycloak.otterburn.home/admin/realms/secure-test/clients/${TARGET_CLIENT_ID}/authz/resource-server/policy/client/${POLICY_ID}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"frontend-can-exchange\",
    \"clients\": [\"${SOURCE_CLIENT_ID_1}\", \"${SOURCE_CLIENT_ID_2}\"],
    \"logic\": \"POSITIVE\"
  }"
```

2. Add audience mapper to each source client

### Audience Validation

The audience mapper is critical for token exchange. To verify it's working:

```bash
# Get a token from source client
TOKEN=$(curl -k -X POST https://keycloak.otterburn.home/realms/secure-test/protocol/openid-connect/token \
  -d "client_id=authentication-test-frontend" \
  -d "client_secret=YOUR_SECRET" \
  -d "grant_type=password" \
  -d "username=testuser" \
  -d "password=password" \
  | jq -r '.access_token')

# Decode and check audience
echo $TOKEN | cut -d'.' -f2 | base64 -d | jq '.aud'
```

Expected output should include both clients:
```json
["authentication-test-api", "account"]
```

### Custom Token Exchange Policies

Create more complex policies based on:
- User roles
- Client roles
- Time-based restrictions
- IP address restrictions

## Testing

### Manual Test

```bash
# Run the complete example
source orchestrate/token-exchange-example.sh
```

### Verify Token Claims

```bash
# Decode and compare tokens
echo $FRONTEND_TOKEN | cut -d'.' -f2 | base64 -d | jq '.'
echo $API_TOKEN | cut -d'.' -f2 | base64 -d | jq '.'
```

Check that:
- Both tokens have same `sub` (subject/user ID)
- `azp` (authorized party) is different
- `aud` (audience) matches target client

## Next Steps

- [API Authentication](../api/authentication.md) - Use exchanged tokens with API
- [Frontend Integration](../frontend/authentication.md) - Implement in frontend
- [Troubleshooting](../troubleshooting/common-issues.md) - Common issues

## References

- [RFC 8693 - OAuth 2.0 Token Exchange](https://datatracker.ietf.org/doc/html/rfc8693)
- [Keycloak Token Exchange Documentation](https://www.keycloak.org/docs/latest/securing_apps/#_token-exchange)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)