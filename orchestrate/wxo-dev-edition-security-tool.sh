#!/bin/bash

# watsonx Orchestrate Developer Edition - Embedded Chat Security Configuration Tool
# This script configures security for embedded chat in Developer Edition

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WXO_URL="http://localhost:4321"
KEYS_DIR="./keys"

echo "=================================================="
echo "watsonx Orchestrate Developer Edition"
echo "Embedded Chat Security Configuration"
echo "=================================================="
echo ""

# Extract Developer Edition token (last token in credentials file)
echo "Extracting Developer Edition authentication token..."
WXO_TOKEN=$(cat ~/.cache/orchestrate/credentials.yaml | grep "wxo_mcsp_token:" | tail -1 | awk '{print $2}')

if [ -z "$WXO_TOKEN" ]; then
    echo -e "${RED}Error: Could not extract Developer Edition token${NC}"
    echo "Make sure Developer Edition is running and you're authenticated"
    exit 1
fi

echo -e "${GREEN}✓ Token extracted successfully${NC}"
echo ""

# Create keys directory if it doesn't exist
mkdir -p "$KEYS_DIR"

# Check if client keys exist
if [ ! -f "$KEYS_DIR/jwtRS256.key" ] || [ ! -f "$KEYS_DIR/jwtRS256.key.pub" ]; then
    echo "Generating RSA key pair for JWT signing..."
    ssh-keygen -t rsa -b 4096 -m PEM -f "$KEYS_DIR/jwtRS256.key" -N "" -q
    openssl rsa -in "$KEYS_DIR/jwtRS256.key" -pubout -outform PEM -out "$KEYS_DIR/jwtRS256.key.pub" 2>/dev/null
    echo -e "${GREEN}✓ Client key pair generated${NC}"
else
    echo -e "${GREEN}✓ Client key pair already exists${NC}"
fi
echo ""

# Get current configuration
echo "Fetching current embedded chat configuration..."
CURRENT_CONFIG=$(curl -s -H "Authorization: Bearer ${WXO_TOKEN}" \
    -H "Accept: application/json" \
    "${WXO_URL}/v1/private/embed/config")

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to fetch configuration${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Configuration retrieved${NC}"
echo ""

# Extract and save IBM public key
IBM_PUBLIC_KEY=$(echo "$CURRENT_CONFIG" | jq -r '.public_key')
if [ "$IBM_PUBLIC_KEY" != "null" ] && [ -n "$IBM_PUBLIC_KEY" ]; then
    echo "$IBM_PUBLIC_KEY" > "$KEYS_DIR/ibmPublic.key.pub"
    echo -e "${GREEN}✓ IBM public key saved to $KEYS_DIR/ibmPublic.key.pub${NC}"
else
    echo -e "${YELLOW}⚠ IBM public key not found in configuration${NC}"
fi
echo ""

# Check if security is already enabled
IS_ENABLED=$(echo "$CURRENT_CONFIG" | jq -r '.is_security_enabled')
if [ "$IS_ENABLED" = "true" ]; then
    echo -e "${YELLOW}Security is already enabled${NC}"
    echo ""
    echo "Current configuration:"
    echo "$CURRENT_CONFIG" | jq '.'
    echo ""
    read -p "Do you want to update the configuration? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Configuration unchanged"
        exit 0
    fi
fi

# Enable security with client public key
echo "Enabling embedded chat security..."
CLIENT_PUBLIC_KEY=$(cat "$KEYS_DIR/jwtRS256.key.pub" | tr -d '\n')

RESPONSE=$(curl -s -X POST "${WXO_URL}/v1/private/embed/config" \
    -H "Authorization: Bearer ${WXO_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
        \"client_public_key\": \"${CLIENT_PUBLIC_KEY}\",
        \"is_security_enabled\": true
    }")

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to enable security${NC}"
    exit 1
fi

# Check if security was enabled successfully
NEW_IS_ENABLED=$(echo "$RESPONSE" | jq -r '.is_security_enabled')
if [ "$NEW_IS_ENABLED" = "true" ]; then
    echo -e "${GREEN}✓ Security enabled successfully!${NC}"
    echo ""
    echo "Configuration:"
    echo "$RESPONSE" | jq '.'
    echo ""
    echo -e "${GREEN}=================================================="
    echo "Security Configuration Complete!"
    echo "==================================================${NC}"
    echo ""
    echo "Key files saved in $KEYS_DIR/:"
    echo "  - jwtRS256.key (private key - keep secure!)"
    echo "  - jwtRS256.key.pub (public key - shared with Orchestrate)"
    echo "  - ibmPublic.key.pub (IBM's public key - for encrypting user_payload)"
    echo ""
    echo "Next steps:"
    echo "1. Use jwtRS256.key to sign JWTs in your application"
    echo "2. Use ibmPublic.key.pub to encrypt the user_payload in JWTs"
    echo "3. Include the signed JWT in all embedded chat requests"
else
    echo -e "${RED}Error: Security was not enabled${NC}"
    echo "Response:"
    echo "$RESPONSE" | jq '.'
    exit 1
fi

# Made with Bob
