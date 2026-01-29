# watsonx Orchestrate Integration Setup Guide

This guide provides step-by-step instructions for setting up the complete authentication flow between the Frontend, watsonx Orchestrate, and the API Server.

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│   Frontend      │────────▶│   Orchestrate        │────────▶│   API Server    │
│   (Next.js)     │  Token  │   (Schedule Agent)   │  Token  │   (Java/Liberty)│
│   Port: 3000    │         │   Port: 8080         │         │   Port: 9080    │
└─────────────────┘         └──────────────────────┘         └─────────────────┘
         │                            │                              │
         │                            │                              │
         └────────────────────────────┴──────────────────────────────┘
                    Keycloak OAuth Provider
                    https://keycloak.otterburn.home/realms/secure-test
```

## Authentication Flow

1. **User Login**: User authenticates with Keycloak via the Frontend
2. **Token Storage**: Frontend stores the Keycloak access token in NextAuth session
3. **Token Passing**: Frontend passes the token to Orchestrate via embedded webchat
4. **Token Exchange**: Orchestrate uses OAuth Token Exchange to pass the token to the API Server
5. **API Access**: API Server validates the JWT token and returns the user's schedule

## Prerequisites

- ✅ Keycloak running at `https://keycloak.otterburn.home/realms/secure-test`
- ✅ API Server running on port 9080
- ✅ Frontend running on port 3000
- ✅ Orchestrate Developer Edition installed
- ✅ watsonx.ai API key and Space ID

## Step 1: Start the API Server

The API Server must be running before testing the integration.

```bash
cd API_server
mvn liberty:dev
```

Verify it's running:
```bash
curl http://localhost:9080/api/v1/hello
```

Expected response:
```json
{
  "message": "Hello from the API Server!",
  "timestamp": "2026-01-29T14:30:00Z"
}
```

## Step 2: Start Orchestrate Server

Navigate to the orchestrate directory and start the server:

```bash
cd orchestrate
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
orchestrate server start --env-file .env --with-ai-builder
```

The server will:
1. Pull required Docker images (first time only, ~4.7GB)
2. Start the database container
3. Start the Orchestrate services
4. Be available at `http://localhost:8080`

Wait for the message: `Server started successfully`

## Step 3: Import Orchestrate Configurations

Once the server is running, import the connection, tool, and agent:

```bash
# Make sure you're in the orchestrate directory with venv activated
cd orchestrate
source .venv/bin/activate

# Import the connection (OAuth Token Exchange configuration)
orchestrate connections import -f schedule-api-connection.yaml

# Import the tool (OpenAPI tool for schedule API)
orchestrate tools import -k openapi -f schedule-api-tool.yaml -a schedule-api-connection

# Import the agent (Schedule Assistant)
orchestrate agents import -f schedule-agent.yaml
```

Verify the imports:
```bash
# List connections
orchestrate connections list

# List tools
orchestrate tools list

# List agents
orchestrate agents list
```

You should see:
- Connection: `schedule-api-connection`
- Tool: `get_user_schedule`
- Agent: `schedule_assistant`

## Step 4: Configure the Connection

The connection needs to be configured for both draft and live environments:

```bash
# Configure draft environment
orchestrate connections configure \
  -a schedule-api-connection \
  -e draft \
  -k oauth_auth_token_exchange \
  -t member \
  --sso true \
  --server-url http://localhost:9080

# Configure live environment
orchestrate connections configure \
  -a schedule-api-connection \
  -e live \
  -k oauth_auth_token_exchange \
  -t member \
  --sso true \
  --server-url http://localhost:9080
```

## Step 5: Test the Agent (CLI)

Before integrating with the Frontend, test the agent using the CLI:

```bash
orchestrate agents chat -n schedule_assistant
```

Try these queries:
- "What's on my schedule today?"
- "Do I have any meetings tomorrow?"
- "Show me my schedule for this week"

**Note**: CLI testing won't have the user's token, so it will test the agent's logic but not the full authentication flow.

## Step 6: Configure Frontend for Orchestrate

For Orchestrate Developer Edition (local), the Frontend needs to connect to the local server instead of the cloud service.

### Option A: Using Embedded Webchat (Recommended for Development)

Update `Frontend/components/orchestrate/OrchestrateWidget.tsx` to use the local Orchestrate server:

```typescript
// For Orchestrate Developer Edition (local)
const ORCHESTRATE_CONFIG = {
  serverUrl: "http://localhost:8080",
  agentName: "schedule_assistant",
};
```

### Option B: Using REST API (Alternative)

Create a new API route in the Frontend to call Orchestrate directly:

```typescript
// Frontend/app/api/orchestrate/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await request.json();

  const response = await fetch("http://localhost:8080/api/v1/agents/schedule_assistant/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({ message }),
  });

  return Response.json(await response.json());
}
```

## Step 7: Start the Frontend

```bash
cd Frontend
npm run dev
```

The Frontend will be available at `http://localhost:3000`

## Step 8: Test End-to-End Flow

1. **Login**: Navigate to `http://localhost:3000` and click "Sign In"
2. **Authenticate**: Login with Keycloak credentials:
   - Username: `testuser2`
   - Password: `Passw0rd12£`
3. **Access Dashboard**: You should be redirected to the dashboard
4. **Test Orchestrate Widget**: 
   - The Orchestrate widget should appear on the right side
   - Try asking: "What's on my schedule today?"
5. **Verify Response**: The agent should:
   - Receive your Keycloak token from the Frontend
   - Use the token to call the API Server
   - Return your personalized schedule

## Troubleshooting

### Connection Issues

**Problem**: Agent can't connect to API Server

**Solutions**:
1. Verify API Server is running: `curl http://localhost:9080/api/v1/hello`
2. Check connection configuration: `orchestrate connections list`
3. Verify server_url in connection: `http://localhost:9080`

### Authentication Errors (401/403)

**Problem**: Getting unauthorized errors

**Solutions**:
1. Verify user has `schedule-user` role in Keycloak
2. Check token is being passed from Frontend:
   - Open browser DevTools → Network tab
   - Look for Orchestrate requests
   - Verify Authorization header is present
3. Verify API Server JWT configuration matches Keycloak:
   - Check `API_server/src/main/liberty/config/server.xml`
   - Ensure `issuer` matches Keycloak realm URL

### Tool Not Found

**Problem**: Agent says it can't find the tool

**Solutions**:
1. Verify tool was imported: `orchestrate tools list`
2. Check tool name matches in agent YAML: `get_user_schedule`
3. Re-import the tool: `orchestrate tools import -k openapi -f schedule-api-tool.yaml -a schedule-api-connection`

### Widget Not Loading

**Problem**: Orchestrate widget doesn't appear in Frontend

**Solutions**:
1. Check browser console for errors
2. Verify Orchestrate server is running: `curl http://localhost:8080/health`
3. Check Frontend environment variables are set
4. Verify widget configuration in `OrchestrateWidget.tsx`

### Token Not Being Passed

**Problem**: Token isn't reaching the API Server

**Solutions**:
1. Verify Frontend has valid session: Check NextAuth session in browser
2. Check token exchange endpoint: `Frontend/app/api/token-exchange/route.ts`
3. Verify connection SSO is enabled: `sso: true` in connection YAML
4. Check Orchestrate logs for token exchange errors

## Verification Checklist

- [ ] API Server is running and responding to `/api/v1/hello`
- [ ] Orchestrate server is running on port 8080
- [ ] Connection `schedule-api-connection` is imported and configured
- [ ] Tool `get_user_schedule` is imported
- [ ] Agent `schedule_assistant` is imported
- [ ] Frontend is running on port 3000
- [ ] Can login with testuser2
- [ ] Orchestrate widget appears in dashboard
- [ ] Agent responds to schedule queries
- [ ] Agent successfully retrieves schedule from API Server

## Testing Scenarios

### Scenario 1: Basic Schedule Query

1. Login as testuser2
2. Ask: "What's on my schedule today?"
3. Expected: Agent returns schedule items for testuser2

### Scenario 2: Specific Time Query

1. Login as testuser2
2. Ask: "Do I have any meetings at 2pm?"
3. Expected: Agent checks schedule and responds with relevant meetings

### Scenario 3: Weekly Overview

1. Login as testuser2
2. Ask: "Show me my schedule for this week"
3. Expected: Agent returns all schedule items for the current week

### Scenario 4: Different User

1. Logout
2. Login as testuser1 (password: `Passw0rd12£`)
3. Ask: "What's on my schedule?"
4. Expected: Agent returns schedule items for testuser1 (different from testuser2)

## Security Considerations

1. **Token Security**: 
   - Tokens are passed securely through HTTPS in production
   - Never log tokens in production code
   - Tokens expire based on Keycloak configuration

2. **User Isolation**: 
   - Each user's token only accesses their own data
   - API Server validates token and extracts username
   - No cross-user data access is possible

3. **Connection Type**: 
   - Using `member` type ensures per-user authentication
   - Each user provides their own token
   - No shared credentials

## Production Deployment

For production deployment:

1. **Update URLs**:
   - Change `server_url` in connection to use HTTPS
   - Update Frontend environment variables for production Orchestrate
   - Configure proper CORS settings in API Server

2. **Security**:
   - Use production Keycloak realm
   - Enable HTTPS for all services
   - Set up proper monitoring and logging
   - Configure rate limiting

3. **Scaling**:
   - Consider using Orchestrate cloud service instead of Developer Edition
   - Set up load balancing for API Server
   - Configure database for production use

## Additional Resources

- [watsonx Orchestrate Documentation](https://developer.watson-orchestrate.ibm.com/)
- [OAuth Token Exchange (RFC 8693)](https://datatracker.ietf.org/doc/html/rfc8693)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [NextAuth.js Documentation](https://next-auth.js.org/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Orchestrate logs: `orchestrate server logs`
3. Check API Server logs in Liberty console
4. Review Frontend logs in browser DevTools console