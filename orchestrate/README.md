# Orchestrate Integration Setup

This directory contains the watsonx Orchestrate configuration for the Schedule Assistant agent.

## Overview

The Schedule Assistant is an AI-powered agent that helps users query their personal schedules through natural language. It integrates with the API Server using OAuth token exchange to securely access user data.

## Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Orchestrate    │────────▶│ API Server  │
│  (Next.js)  │  Token  │  (Schedule Agent)│  Token  │   (Java)    │
└─────────────┘         └──────────────────┘         └─────────────┘
      │                          │                          │
      │                          │                          │
      └──────────────────────────┴──────────────────────────┘
                        Keycloak (OAuth Provider)
```

### Authentication Flow

1. **User Login**: User authenticates with Keycloak via the Frontend
2. **Token Storage**: Frontend stores the Keycloak access token in the session
3. **Token Passing**: Frontend passes the token to Orchestrate via embedded webchat
4. **Token Exchange**: Orchestrate uses OAuth Token Exchange to pass the token to the API Server
5. **API Access**: API Server validates the token and returns the user's schedule

## Files

### Configuration Files

- **`schedule-api-connection.yaml`**: OAuth connection configuration for token exchange
- **`schedule-api-tool.yaml`**: OpenAPI tool definition for the schedule API
- **`schedule-agent.yaml`**: Agent specification with instructions and tool bindings
- **`schedule-api-openapi.yaml`**: OpenAPI specification exported from the API Server

### Environment Files

- **`.env`**: Environment variables for Orchestrate (watsonx credentials)
- **`.venv/`**: Python virtual environment with Orchestrate ADK

## Setup Instructions

### 1. Prerequisites

- Python 3.9 or higher
- watsonx Orchestrate Developer Edition entitlement key
- watsonx.ai API key and Space ID
- Running API Server (see `../API_server/`)
- Running Frontend (see `../Frontend/`)

### 2. Install Dependencies

```bash
cd orchestrate
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment

Create or update `.env` file with your credentials:

```bash
# watsonx.ai Credentials
WATSONX_APIKEY=your-watsonx-api-key
WATSONX_SPACE_ID=your-space-id

# Orchestrate Developer Edition
WO_ENTITLEMENT_KEY=your-entitlement-key
WO_DEVELOPER_EDITION_SOURCE=myibm
```

### 4. Start Orchestrate Server

```bash
source .venv/bin/activate
orchestrate server start --env-file .env --with-ai-builder
```

The server will start on `http://localhost:8080` by default.

### 5. Import Configurations

Import the connection, tool, and agent in order:

```bash
# Import the connection
orchestrate connections import -f schedule-api-connection.yaml

# Import the tool
orchestrate tools import -k openapi -f schedule-api-tool.yaml -a schedule-api-connection

# Import the agent
orchestrate agents import -f schedule-agent.yaml
```

### 6. Verify Setup

Check that everything was imported successfully:

```bash
# List connections
orchestrate connections list

# List tools
orchestrate tools list

# List agents
orchestrate agents list
```

## Usage

### Testing the Agent

You can test the agent using the Orchestrate CLI:

```bash
orchestrate agents chat -n schedule_assistant
```

Example queries:
- "What's on my schedule today?"
- "Do I have any meetings tomorrow?"
- "Show me my schedule for this week"
- "What time is my next appointment?"

### Integration with Frontend

The Frontend application embeds the Orchestrate webchat widget. To configure it:

1. Get your Orchestrate integration credentials from the Orchestrate UI
2. Update `Frontend/.env.local`:

```bash
NEXT_PUBLIC_ORCHESTRATE_INTEGRATION_ID=your-integration-id
NEXT_PUBLIC_ORCHESTRATE_REGION=us-south
NEXT_PUBLIC_ORCHESTRATE_SERVICE_INSTANCE_ID=your-service-instance-id
```

3. The widget will automatically pass the user's Keycloak token to Orchestrate

## Connection Configuration

The `schedule-api-connection.yaml` uses **OAuth Token Exchange** (`oauth_auth_token_exchange`):

- **Type**: `member` - Each user provides their own token
- **SSO**: `true` - Enables token passing from embedded webchat
- **Server URL**: Points to the API Server (`http://localhost:9080`)

This configuration allows Orchestrate to receive the user's token from the Frontend and pass it directly to the API Server without additional token exchange steps.

## Tool Configuration

The `schedule-api-tool.yaml` defines an OpenAPI tool:

- **Operation**: `get/api/v1/schedule` - Retrieves user schedule
- **Authentication**: Uses the `schedule-api-connection` for OAuth
- **OpenAPI Spec**: References the exported API specification

## Agent Configuration

The `schedule_assistant` agent:

- **LLM**: Uses `llama-3-2-90b-vision-instruct` for natural language understanding
- **Style**: `default` - Standard conversational agent
- **Tools**: Has access to `get_user_schedule` tool
- **Instructions**: Detailed guidelines for formatting and presenting schedule data

## Troubleshooting

### Connection Issues

If the agent can't connect to the API Server:

1. Verify the API Server is running: `curl http://localhost:9080/api/v1/hello`
2. Check the connection configuration has the correct `server_url`
3. Ensure the Frontend is passing the token correctly

### Authentication Errors

If you get 401/403 errors:

1. Verify the user has the `schedule-user` role in Keycloak
2. Check that the token is being passed from Frontend to Orchestrate
3. Verify the API Server's JWT configuration matches Keycloak

### Tool Not Found

If the agent says it can't find the tool:

1. Verify the tool was imported: `orchestrate tools list`
2. Check the tool name matches in both tool and agent YAML files
3. Ensure the connection is properly configured

## Development

### Updating the Agent

To update the agent after making changes:

```bash
orchestrate agents import -f schedule-agent.yaml
```

This will update the existing agent with the new configuration.

### Updating the Tool

To update the tool (e.g., after API changes):

```bash
# Re-export the OpenAPI spec from the API Server
curl http://localhost:9080/openapi -o schedule-api-openapi.yaml

# Re-import the tool
orchestrate tools import -k openapi -f schedule-api-tool.yaml -a schedule-api-connection
```

### Testing Changes

After making changes, test the agent:

```bash
orchestrate agents chat -n schedule_assistant
```

## Security Considerations

1. **Token Security**: Tokens are passed securely through HTTPS in production
2. **Token Lifetime**: Tokens expire based on Keycloak configuration
3. **User Isolation**: Each user's token only accesses their own data
4. **Connection Type**: Using `member` type ensures per-user authentication

## Production Deployment

For production deployment:

1. Update `server_url` in connection to use HTTPS
2. Configure proper CORS settings in the API Server
3. Use production Keycloak realm and credentials
4. Set up proper monitoring and logging
5. Configure rate limiting and security policies

## References

- [watsonx Orchestrate Documentation](https://developer.watson-orchestrate.ibm.com/)
- [OAuth Token Exchange](https://developer.watson-orchestrate.ibm.com/connections/build_connections)
- [Creating Agents](https://developer.watson-orchestrate.ibm.com/agents/build_agent)
- [OpenAPI Tools](https://developer.watson-orchestrate.ibm.com/tools/create_openapi_tool)