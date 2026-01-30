# watsonx Orchestrate Integration - Current Status

## Overview

This directory contains the watsonx Orchestrate agent and tool definitions for the authentication test project. The goal is to create an agent that can interact with the Schedule API using OAuth On-Behalf-Of (OBO) flow for authentication.

## Current Implementation Status

### ✅ Completed

1. **Agent Definition** (`schedule-agent.yaml`)
   - Native agent configured to interact with Schedule API
   - Includes tool and connection references
   - Ready for import into watsonx Orchestrate

2. **Tool Definition** (`schedule-api-tool.yaml`)
   - OpenAPI-based tool for Schedule API endpoints
   - Configured to use the schedule-api connection
   - Supports GET /api/schedule and POST /api/schedule operations

3. **Connection Configuration** (`schedule-api-connection.yaml`)
   - OAuth On-Behalf-Of flow configured
   - Points to API server at https://api-server.otterburn.home:9443
   - Identity provider configuration for Keycloak token exchange
   - **Note**: Identity provider URL must be set separately via CLI:
     ```bash
     orchestrate connection set-identity-provider \
       --app-id schedule-api \
       --environment draft \
       --url https://keycloak.otterburn.home/realms/secure-test/protocol/openid-connect/token \
       --client-id authentication-test-api \
       --client-secret <secret> \
       --scope openid \
       --grant-type urn:ietf:params:oauth:grant-type:token-exchange
     ```

4. **OpenAPI Specification** (`schedule-api-openapi.yaml`)
   - Complete API specification for the Schedule API
   - Includes security schemes and endpoint definitions

5. **Embedded Chat Security** (Developer Edition)
   - Security successfully enabled via `/v1/private/embed/config` API
   - RSA key pairs generated for JWT signing
   - IBM public key retrieved for encrypting user_payload
   - Configuration stored in `../keys/` directory

### ⚠️ Challenges & Blockers

1. **Embedded Web Chat Widget - NOT WORKING**
   - Attempted integration in both standalone test page (`Frontend/public/test-widget.html`) and Next.js app
   - Widget fails to load/initialize properly
   - Issues encountered:
     - CDN script loading problems
     - Configuration errors with orchestrationID and agentId
     - Security token generation complexity
   - **Status**: Unable to get working embedded chat widget in either location

2. **Agent Testing - NOT COMPLETED**
   - Agent and tool definitions created but not yet imported to Orchestrate
   - Cannot test OAuth OBO flow without working embedded chat
   - Unable to verify end-to-end integration

3. **OAuth Token Exchange Flow**
   - Configuration is in place but untested
   - Keycloak identity provider setup complete
   - Token exchange endpoint configured but not validated

### 📁 Key Files

#### Agent & Tool Definitions
- `schedule-agent.yaml` - Agent definition
- `schedule-api-tool.yaml` - Tool definition  
- `schedule-api-connection.yaml` - Connection with OAuth OBO configuration
- `schedule-api-openapi.yaml` - API specification

#### Scripts & Utilities
- `wxo-dev-edition-security-tool.sh` - Script to enable embedded chat security (Developer Edition)
- `setup-credentials.sh` - Helper script for credential setup
- `fix-keycloak-redirect.sh` - Keycloak redirect URI configuration

#### Configuration Files
- `.env` - Environment variables for local development
- `requirements.txt` - Python dependencies for ADK
- `agent-details.json` - Agent metadata

## Architecture

### OAuth On-Behalf-Of Flow

```
User (Frontend) 
    ↓ [Keycloak Access Token]
Orchestrate Embedded Chat
    ↓ [Token Exchange Request]
Keycloak Identity Provider
    ↓ [API Access Token]
Schedule API Server
```

**Key Points:**
- Frontend authenticates user with Keycloak
- User's access token passed to Orchestrate via embedded chat JWT
- Orchestrate exchanges token with Keycloak for API-specific token
- API token used to call Schedule API on behalf of user

### Two URLs in Configuration

1. **Token Exchange Server URL** (Keycloak)
   - Set via `orchestrate connection set-identity-provider` CLI command
   - Used by Orchestrate to exchange tokens
   - Example: `https://keycloak.otterburn.home/realms/secure-test/protocol/openid-connect/token`

2. **API Server URL** (Schedule API)
   - Set in `schedule-api-connection.yaml` as `server_url`
   - Used by Orchestrate to call the actual API
   - Example: `https://api-server.otterburn.home:9443`

## Next Steps

### Immediate Priorities

1. **Resolve Embedded Chat Widget Issues**
   - Debug widget initialization problems
   - Verify CDN script loading
   - Test with minimal configuration
   - Consider alternative integration approaches

2. **Import and Test Agent**
   - Import agent definition to Orchestrate
   - Import tool and connection definitions
   - Configure identity provider via CLI
   - Test agent in Orchestrate UI (http://localhost:3000/chat-lite)

3. **Validate OAuth Flow**
   - Test token exchange with Keycloak
   - Verify API calls work with exchanged tokens
   - Confirm user context is preserved

### Future Enhancements

1. **Production Deployment**
   - Deploy to IBM Cloud or CPD for full embedded chat security features
   - Configure production Keycloak realm
   - Set up proper SSL certificates

2. **Additional Tools**
   - Add more Schedule API operations (UPDATE, DELETE)
   - Create tools for other API endpoints
   - Implement error handling and retry logic

3. **Enhanced Security**
   - Implement JWT refresh token handling
   - Add rate limiting and throttling
   - Configure proper CORS policies

## Testing Approach

### 1. CLI Testing Tool (Recommended) ✅

A TypeScript CLI application has been created to test the OAuth OBO flow end-to-end without the embedded chat widget complexity.

**Location:** `../test-orchestrate-cli/`

**What it does:**
1. Authenticates with Keycloak (simulates user login)
2. Creates a signed JWT with encrypted user payload (simulates embedded chat)
3. Calls Orchestrate API to send a message to the agent
4. Displays the response

**Usage:**
```bash
cd ../test-orchestrate-cli
cp .env.example .env
# Edit .env to add your agent ID and environment ID
npm install
npm start
```

See [`../test-orchestrate-cli/README.md`](../test-orchestrate-cli/README.md) for detailed documentation.

**Benefits:**
- Tests the complete OAuth OBO flow
- Validates JWT creation and signing
- Confirms token exchange works
- Provides detailed logging of each step
- Can be used as reference for custom chat UI implementation

### 2. Built-in Chat UI

```bash
orchestrate chat start
# Navigate to http://localhost:3000/chat-lite
```

### 3. VS Code Extension

- Use Orchestrate extension for in-editor testing
- Right-click agent file → "Open in Web Chat"

### 4. Embedded Chat Testing (Blocked)

- Standalone test page: `Frontend/public/test-widget.html` - NOT WORKING
- Next.js integration: `Frontend/components/orchestrate/OrchestrateWidget.tsx` - NOT WORKING

## Known Issues

1. **Embedded Chat Widget**
   - Widget fails to initialize in both test environments
   - CDN script loading issues
   - Configuration complexity with security enabled

2. **Token Extraction**
   - Multiple tokens in credentials file
   - Must use `tail -1` to get Developer Edition token
   - Fixed in `wxo-dev-edition-security-tool.sh`

3. **Documentation Gaps**
   - Limited Developer Edition embedded chat documentation
   - OAuth OBO flow examples scarce
   - Security configuration process unclear

## Resources

### Documentation
- [watsonx Orchestrate Developer Edition](https://developer.watson-orchestrate.ibm.com/developer_edition/wxOde_overview)
- [OAuth Flows Documentation](../docs/docs/architecture/oauth-flows.md)
- [Keycloak Setup Guide](../docs/docs/keycloak/)

### API Endpoints
- Developer Edition Server: http://localhost:4321
- Developer Edition UI: http://localhost:3000
- API Documentation: http://localhost:4321/docs
- Schedule API: https://api-server.otterburn.home:9443

### Keycloak
- Admin Console: https://keycloak.otterburn.home
- Realm: secure-test
- Client ID: authentication-test-api
- Test Users: testuser1, testuser2 (password: Passw0rd12£)

## Support

For issues or questions:
1. Check the [troubleshooting guide](../docs/docs/troubleshooting/)
2. Review [common issues](../docs/docs/troubleshooting/common-issues.md)
3. Consult watsonx Orchestrate documentation
4. Check Keycloak logs for authentication issues