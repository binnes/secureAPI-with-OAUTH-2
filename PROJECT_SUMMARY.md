# Authentication Test Project - Implementation Summary

## Project Overview

This project demonstrates a complete OAuth 2.0 authentication flow integrating:
- **Frontend**: Next.js application with NextAuth.js and Keycloak OAuth
- **API Server**: Java/Liberty REST API with JWT authentication
- **watsonx Orchestrate**: AI agent platform with OAuth Token Exchange

## Current Status

### ✅ Completed Components

#### 1. API Server (Java/Liberty)
- **Location**: `API_server/`
- **Port**: 9080
- **Status**: ✅ Running
- **Features**:
  - REST API with JWT authentication
  - Schedule endpoint at `/api/v1/schedule`
  - User-specific data based on JWT claims
  - OpenAPI specification exported

#### 2. Frontend (Next.js)
- **Location**: `Frontend/`
- **Port**: 3000
- **Status**: ✅ Running
- **Features**:
  - NextAuth.js integration with Keycloak
  - OAuth 2.0 authentication flow
  - Token exchange endpoint at `/api/token-exchange`
  - Orchestrate widget component (ready for configuration)
  - Schedule display UI

#### 3. Orchestrate Configuration
- **Location**: `orchestrate/`
- **Port**: 8080 (when running)
- **Status**: ⏳ Starting (downloading Docker images - 60% complete)
- **Components Created**:
  - ✅ Connection YAML (`schedule-api-connection.yaml`)
  - ✅ Tool YAML (`schedule-api-tool.yaml`)
  - ✅ Agent YAML (`schedule-agent.yaml`)
  - ✅ OpenAPI Specification (`schedule-api-openapi.yaml`)
  - ✅ Environment configuration (`.env`)
  - ✅ Documentation (`README.md`)

### 🔄 In Progress

#### Orchestrate Server Startup
The Orchestrate Developer Edition server is currently downloading required Docker images:
- **Progress**: ~2.83GB of 4.695GB (60%)
- **Estimated Time**: 5-10 more minutes depending on network speed
- **Command**: `orchestrate server start --env-file .env --with-ai-builder`

### ⏳ Pending Tasks

1. **Import Orchestrate Configurations** (after server starts)
   - Import connection
   - Import tool
   - Import agent

2. **Test Agent via CLI**
   - Verify agent responds to queries
   - Test tool invocation

3. **Configure Frontend for Local Orchestrate**
   - Update widget to point to local server
   - Test token passing

4. **End-to-End Testing**
   - Login as testuser2
   - Query schedule via Orchestrate
   - Verify token exchange works

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Browser                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Frontend (Next.js)                          │ │
│  │                    Port: 3000                                  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐│ │
│  │  │   NextAuth   │  │  Schedule UI │  │  Orchestrate Widget  ││ │
│  │  │  (Keycloak)  │  │              │  │                      ││ │
│  │  └──────┬───────┘  └──────────────┘  └──────────┬───────────┘│ │
│  └─────────┼────────────────────────────────────────┼────────────┘ │
└────────────┼────────────────────────────────────────┼──────────────┘
             │                                         │
             │ OAuth 2.0                               │ JWT Token
             │ Login Flow                              │ + Query
             │                                         │
             ▼                                         ▼
    ┌────────────────┐                      ┌──────────────────────┐
    │   Keycloak     │                      │   watsonx Orchestrate│
    │   OAuth IdP    │                      │   (Developer Edition)│
    │                │                      │   Port: 8080         │
    │  Realm:        │                      │                      │
    │  secure-test   │                      │  ┌────────────────┐  │
    │                │                      │  │ Schedule Agent │  │
    │  Users:        │                      │  │                │  │
    │  - testuser1   │                      │  │ Tools:         │  │
    │  - testuser2   │                      │  │ - get_user_    │  │
    │                │                      │  │   schedule     │  │
    └────────────────┘                      │  └────────┬───────┘  │
                                            └───────────┼──────────┘
                                                        │
                                                        │ JWT Token
                                                        │ (OAuth Token
                                                        │  Exchange)
                                                        │
                                                        ▼
                                            ┌──────────────────────┐
                                            │   API Server         │
                                            │   (Java/Liberty)     │
                                            │   Port: 9080         │
                                            │                      │
                                            │  Endpoints:          │
                                            │  - /api/v1/hello     │
                                            │  - /api/v1/schedule  │
                                            │                      │
                                            │  Auth: JWT Bearer    │
                                            │  Validates: Keycloak │
                                            └──────────────────────┘
```

## Authentication Flow

### 1. User Login (Frontend → Keycloak)
```
User → Frontend → Keycloak
                    ↓
                  Login
                    ↓
              Access Token
                    ↓
Frontend ← Keycloak
```

### 2. Schedule Query (Frontend → Orchestrate → API Server)
```
User Query → Frontend Widget
                ↓
            JWT Token
                ↓
         Orchestrate Agent
                ↓
         get_user_schedule Tool
                ↓
         OAuth Token Exchange
                ↓
         API Server (/api/v1/schedule)
                ↓
         Validate JWT
                ↓
         Extract username from token
                ↓
         Return user-specific schedule
                ↓
         Orchestrate Agent
                ↓
         Format response
                ↓
         Frontend Widget
                ↓
         Display to User
```

## Key Files Created

### Orchestrate Configuration Files

1. **`orchestrate/schedule-api-connection.yaml`**
   - OAuth Token Exchange connection
   - Configured for SSO (token passing from Frontend)
   - Points to API Server at `http://localhost:9080`

2. **`orchestrate/schedule-api-tool.yaml`**
   - OpenAPI tool definition
   - References the connection for authentication
   - Calls `/api/v1/schedule` endpoint

3. **`orchestrate/schedule-agent.yaml`**
   - Native agent definition
   - Uses Llama 3.2 90B model
   - Has access to `get_user_schedule` tool
   - Detailed instructions for handling schedule queries

4. **`orchestrate/schedule-api-openapi.yaml`**
   - OpenAPI 3.0.3 specification
   - Exported from API Server
   - Defines schedule endpoint and schemas

### Documentation Files

1. **`orchestrate/README.md`**
   - Orchestrate-specific documentation
   - Setup instructions
   - Configuration details
   - Troubleshooting guide

2. **`ORCHESTRATE_SETUP.md`**
   - Complete step-by-step setup guide
   - Architecture overview
   - Testing scenarios
   - Production deployment notes

3. **`PROJECT_SUMMARY.md`** (this file)
   - Overall project status
   - Component overview
   - Next steps

## Test Credentials

### Keycloak Users
- **testuser1**: `Passw0rd12£`
- **testuser2**: `Passw0rd12£`

### Keycloak Admin
- **Username**: `admin`
- **Password**: `szcz3c1n`

### API Client Credentials
- **Client ID**: `authentication-test-api`
- **Client Secret**: `8u50V7iXkuibA4BvzKVoDcQ5aaAbUsTI`

## Next Steps

Once the Orchestrate server finishes starting:

### 1. Import Configurations
```bash
cd orchestrate
source .venv/bin/activate

# Import connection
orchestrate connections import -f schedule-api-connection.yaml

# Import tool
orchestrate tools import -k openapi -f schedule-api-tool.yaml -a schedule-api-connection

# Import agent
orchestrate agents import -f schedule-agent.yaml
```

### 2. Configure Connection
```bash
# Configure for draft environment
orchestrate connections configure \
  -a schedule-api-connection \
  -e draft \
  -k oauth_auth_token_exchange \
  -t member \
  --sso true \
  --server-url http://localhost:9080
```

### 3. Test Agent
```bash
# Test via CLI
orchestrate agents chat -n schedule_assistant

# Try queries:
# - "What's on my schedule today?"
# - "Do I have any meetings tomorrow?"
```

### 4. Update Frontend Widget
The Frontend widget needs to be updated to connect to the local Orchestrate server instead of the cloud service. This requires modifying `Frontend/components/orchestrate/OrchestrateWidget.tsx`.

### 5. End-to-End Test
1. Navigate to `http://localhost:3000`
2. Login as testuser2
3. Use the Orchestrate widget to ask about schedule
4. Verify the agent retrieves the correct schedule

## Technical Highlights

### OAuth Token Exchange (RFC 8693)
The project implements OAuth 2.0 Token Exchange for secure token passing:
- Frontend obtains token from Keycloak
- Frontend passes token to Orchestrate via embedded widget
- Orchestrate uses token to authenticate to API Server
- API Server validates token and returns user-specific data

### Security Features
- JWT-based authentication
- Per-user token isolation
- Role-based access control (schedule-user role)
- Secure token storage in NextAuth session
- HTTPS support (production)

### Scalability Considerations
- Stateless JWT authentication
- Microservices architecture
- Container-ready (Docker)
- Cloud-deployable

## Troubleshooting

### If Orchestrate Server Fails to Start
1. Check Docker is running
2. Verify entitlement key in `.env`
3. Check watsonx.ai credentials
4. Review logs: `orchestrate server logs`

### If API Server Connection Fails
1. Verify API Server is running: `curl http://localhost:9080/api/v1/hello`
2. Check connection configuration
3. Verify server_url in connection YAML

### If Authentication Fails
1. Verify user has `schedule-user` role in Keycloak
2. Check token is being passed from Frontend
3. Verify API Server JWT configuration matches Keycloak

## Resources

- **Orchestrate Documentation**: See `orchestrate/README.md`
- **Setup Guide**: See `ORCHESTRATE_SETUP.md`
- **API Documentation**: See `docs/` directory
- **Frontend Documentation**: See `Frontend/README.md`

## Project Structure

```
authentication_test/
├── API_server/              # Java/Liberty REST API
│   ├── src/
│   │   └── main/
│   │       ├── java/        # Java source code
│   │       ├── liberty/     # Liberty configuration
│   │       └── resources/   # Application resources
│   └── pom.xml             # Maven configuration
│
├── Frontend/               # Next.js application
│   ├── app/               # Next.js app directory
│   │   ├── api/          # API routes
│   │   └── app/          # Application pages
│   ├── components/       # React components
│   │   ├── auth/        # Authentication components
│   │   ├── orchestrate/ # Orchestrate widget
│   │   └── ui/          # UI components
│   └── lib/             # Utility libraries
│
├── orchestrate/           # Orchestrate configuration
│   ├── schedule-api-connection.yaml
│   ├── schedule-api-tool.yaml
│   ├── schedule-agent.yaml
│   ├── schedule-api-openapi.yaml
│   ├── .env             # Environment variables
│   ├── .venv/           # Python virtual environment
│   └── README.md        # Orchestrate documentation
│
├── docs/                 # Project documentation
│   └── docs/            # MkDocs documentation
│
├── ORCHESTRATE_SETUP.md  # Setup guide
└── PROJECT_SUMMARY.md    # This file
```

## Success Criteria

The project will be considered complete when:
- ✅ API Server is running and responding
- ✅ Frontend is running with Keycloak authentication
- ⏳ Orchestrate server is running
- ⏳ Agent, tool, and connection are imported
- ⏳ User can login and query schedule via Orchestrate
- ⏳ Token exchange works correctly
- ⏳ User receives personalized schedule data

## Conclusion

This project demonstrates a production-ready authentication architecture using modern OAuth 2.0 patterns. The integration of watsonx Orchestrate adds AI capabilities while maintaining security through proper token handling and user isolation.

The modular architecture allows each component to be developed, tested, and deployed independently while working together seamlessly through well-defined APIs and authentication flows.