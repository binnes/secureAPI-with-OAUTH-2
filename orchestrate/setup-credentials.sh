#!/bin/bash
# Setup credentials for the schedule-api-connection
# This configures OAuth Token Exchange with Keycloak

cd "$(dirname "$0")"
source .venv/bin/activate

echo "Setting up credentials for schedule-api-connection..."

orchestrate connections set-credentials \
  --app-id "schedule-api-connection" \
  --env draft \
  --client-id "authentication-test-api" \
  --grant-type "urn:ietf:params:oauth:grant-type:token-exchange" \
  --token-url "https://keycloak.otterburn.home/realms/secure-test/protocol/openid-connect/token" \
  -t "body:client_secret=8u50V7iXkuibA4BvzKVoDcQ5aaAbUsTI" \
  -t "body:subject_token_type=urn:ietf:params:oauth:token-type:access_token" \
  -t "body:app_token_key=subject_token" \
  -t "body:requested_token_type=urn:ietf:params:oauth:token-type:access_token" \
  -t "header:content-type=application/x-www-form-urlencoded"

echo ""
echo "Credentials configured successfully!"
echo "Verifying connection status..."
echo ""

orchestrate connections list

echo ""
echo "✅ Setup complete! The schedule-api-connection is ready for OAuth Token Exchange."

# Made with Bob
