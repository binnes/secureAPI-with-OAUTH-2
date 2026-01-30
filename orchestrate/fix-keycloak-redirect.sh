#!/bin/bash

# Fix Keycloak Redirect URIs for Port 4000
# This script updates the authentication-test-frontend client to accept redirects from port 4000

set -e

echo "=========================================="
echo "Updating Keycloak Client Redirect URIs"
echo "=========================================="
echo ""

# Keycloak configuration
KEYCLOAK_URL="https://keycloak.otterburn.home"
REALM="secure-test"
CLIENT_ID="authentication-test-frontend"
ADMIN_USER="admin"
ADMIN_PASSWORD="szcz3c1n"

echo "Step 1: Getting admin access token..."
TOKEN=$(curl -k -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${ADMIN_USER}" \
  -d "password=${ADMIN_PASSWORD}" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get admin token"
    exit 1
fi
echo "✓ Admin token obtained"
echo ""

echo "Step 2: Getting client UUID..."
CLIENT_UUID=$(curl -k -s "${KEYCLOAK_URL}/admin/realms/${REALM}/clients?clientId=${CLIENT_ID}" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id'] if data else '')")

if [ -z "$CLIENT_UUID" ]; then
    echo "❌ Failed to find client: ${CLIENT_ID}"
    exit 1
fi
echo "✓ Client UUID: ${CLIENT_UUID}"
echo ""

echo "Step 3: Getting current client configuration..."
CURRENT_CONFIG=$(curl -k -s "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${CLIENT_UUID}" \
  -H "Authorization: Bearer $TOKEN")

echo "✓ Current configuration retrieved"
echo ""

echo "Step 4: Updating redirect URIs to include port 4000..."
UPDATED_CONFIG=$(echo "$CURRENT_CONFIG" | python3 -c "
import sys, json
config = json.load(sys.stdin)

# Update redirect URIs to include port 4000
redirect_uris = config.get('redirectUris', [])
new_uris = [
    'http://localhost:4000/*',
    'http://localhost:4000/api/auth/callback/keycloak',
    'http://localhost:3000/*',
    'http://localhost:3000/api/auth/callback/keycloak',
    'https://app.lab.home/*',
    'https://app.lab.home/api/auth/callback/keycloak'
]
config['redirectUris'] = new_uris

# Update web origins to include port 4000
web_origins = config.get('webOrigins', [])
new_origins = [
    'http://localhost:4000',
    'http://localhost:3000',
    'https://app.lab.home'
]
config['webOrigins'] = new_origins

# Update root and base URLs
config['rootUrl'] = 'http://localhost:4000'
config['baseUrl'] = 'http://localhost:4000'

print(json.dumps(config))
")

# Update the client
curl -k -s -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${CLIENT_UUID}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATED_CONFIG"

echo "✓ Client configuration updated"
echo ""

echo "Step 5: Verifying updated configuration..."
VERIFY_CONFIG=$(curl -k -s "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${CLIENT_UUID}" \
  -H "Authorization: Bearer $TOKEN")

echo "$VERIFY_CONFIG" | python3 -c "
import sys, json
config = json.load(sys.stdin)
print('Root URL:', config.get('rootUrl'))
print('Base URL:', config.get('baseUrl'))
print('Redirect URIs:')
for uri in config.get('redirectUris', []):
    print('  -', uri)
print('Web Origins:')
for origin in config.get('webOrigins', []):
    print('  -', origin)
"

echo ""
echo "=========================================="
echo "✓ Keycloak client updated successfully!"
echo "=========================================="
echo ""
echo "The frontend client now accepts redirects from:"
echo "  - http://localhost:4000 (NEW)"
echo "  - http://localhost:3000 (kept for compatibility)"
echo ""
echo "You can now test authentication at:"
echo "  http://localhost:4000"
echo ""

# Made with Bob
