# API Integration Architecture

## Critical: No Direct API Access

**IMPORTANT**: The frontend application does NOT make direct API calls to the schedule API server. All schedule data access is through the IBM watsonx Orchestrate widget.

## Why No Direct API Access?

### Architectural Decision

The specification explicitly states:

> "There should be no direct integration with the schedule API. Instead, the frontend should provide access to the schedule through the Orchestrate embedded widget."

### Benefits of This Architecture

1. **Separation of Concerns**
   - Frontend: User interface and authentication
   - Orchestrate: Business logic and API integration
   - API Server: Data access and authorization

2. **Security**
   - No API credentials in frontend code
   - Token management handled by Orchestrate
   - Reduced attack surface

3. **Flexibility**
   - API changes don't require frontend updates
   - Orchestrate can aggregate multiple APIs
   - Easy to add new data sources

4. **AI-Powered Features**
   - Natural language interface
   - Intelligent data processing
   - Contextual responses

## Correct Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Application                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              User Interface                            │ │
│  │                                                         │ │
│  │  - Authentication (NextAuth + Keycloak)                │ │
│  │  - Page routing                                        │ │
│  │  - Orchestrate widget embedding                        │ │
│  │  - Token exchange endpoint                             │ │
│  │                                                         │ │
│  │  ❌ NO direct API calls                                │ │
│  │  ❌ NO fetch() to API server                           │ │
│  │  ❌ NO axios/HTTP client for schedule data             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Token Exchange (RFC 8693)
                          │ User JWT passed securely
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              IBM watsonx Orchestrate                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Watson Assistant Chat Widget                 │ │
│  │                                                         │ │
│  │  - Receives user JWT from frontend                     │ │
│  │  - Makes API calls on behalf of user                   │ │
│  │  - Processes schedule data                             │ │
│  │  - Provides conversational interface                   │ │
│  │                                                         │ │
│  │  ✅ ONLY component that calls API                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP + JWT Bearer Token
                          │ GET /api/v1/schedule
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Server                                │
│              http://localhost:9080                           │
│                                                              │
│  - Validates JWT tokens                                      │
│  - Enforces role-based access control                        │
│  - Returns user schedule data                                │
│  - Knows nothing about Orchestrate                           │
└─────────────────────────────────────────────────────────────┘
```

## What Was Removed

During implementation, the following files were created but then **removed** because they violated the specification:

### ❌ Removed: `lib/api.ts`

This file contained direct API client code:

```typescript
// ❌ INCORRECT - This was removed
export async function fetchSchedule(accessToken: string) {
  const response = await fetch(`${API_URL}/api/v1/schedule`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.json();
}
```

**Why removed**: Frontend should never call API directly.

### ❌ Removed: `components/ui/SchedulePanel.tsx`

This component made direct API calls:

```typescript
// ❌ INCORRECT - This was removed
useEffect(() => {
  if (session?.accessToken) {
    fetchSchedule(session.accessToken)
      .then(setSchedule)
      .catch(setError);
  }
}, [session]);
```

**Why removed**: Violated the "no direct API integration" requirement.

## Correct Implementation

### ✅ Token Exchange Endpoint

The ONLY API-related code in the frontend is the token exchange endpoint:

```typescript
// ✅ CORRECT - app/api/token-exchange/route.ts
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json(
      { error: 'unauthorized' },
      { status: 401 }
    );
  }

  // Return token to Orchestrate (not to browser)
  return NextResponse.json({
    access_token: session.accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
  });
}
```

**Purpose**: Securely provide user's JWT to Orchestrate widget.

**Note**: This endpoint does NOT call the API server. It only returns the token.

### ✅ Orchestrate Widget Component

The widget handles all schedule data access:

```typescript
// ✅ CORRECT - components/orchestrate/OrchestrateWidget.tsx
export default function OrchestrateWidget() {
  useEffect(() => {
    // Load Watson Assistant Chat widget
    const script = document.createElement('script');
    script.src = 'https://web-chat.global.assistant.watson.appdomain.cloud/...';
    
    script.onload = () => {
      window.watsonAssistantChatOptions = {
        integrationID: process.env.NEXT_PUBLIC_ORCHESTRATE_INTEGRATION_ID,
        region: process.env.NEXT_PUBLIC_ORCHESTRATE_REGION,
        serviceInstanceID: process.env.NEXT_PUBLIC_ORCHESTRATE_SERVICE_INSTANCE_ID,
        onLoad: async (instance: any) => {
          // Get token via token exchange
          const tokenResponse = await fetch('/api/token-exchange', {
            method: 'POST',
          });
          
          const { access_token } = await tokenResponse.json();
          
          // Pass token to Orchestrate
          instance.updateUserPayload({
            context: {
              skills: {
                'main skill': {
                  user_defined: {
                    jwt_token: access_token,
                  },
                },
              },
            },
          });
          
          await instance.render();
        },
      };
      
      window.loadWatsonAssistantChat();
    };

    document.body.appendChild(script);
  }, []);

  return <div id="watson-assistant-chat-container" />;
}
```

**Key points**:
- Widget loads from Orchestrate
- Token passed to widget, not used by frontend
- Widget makes API calls, not frontend

## Data Flow

### Schedule Data Request Flow

```
1. User asks widget: "Show my schedule"
   │
   ▼
2. Widget (Orchestrate) receives request
   │
   ▼
3. Widget uses JWT token (from token exchange)
   │
   ▼
4. Widget calls: GET http://localhost:9080/api/v1/schedule
   │  Headers: Authorization: Bearer {JWT}
   ▼
5. API server validates JWT
   │
   ▼
6. API server returns schedule data
   │
   ▼
7. Widget processes and displays data
   │
   ▼
8. User sees schedule in chat interface
```

**Note**: Frontend is NOT involved in steps 3-7.

## Environment Variables

### ❌ Removed Variables

These were removed because they're not needed:

```bash
# ❌ REMOVED - Frontend doesn't call API
NEXT_PUBLIC_API_URL=http://localhost:9080
```

### ✅ Current Variables

Only Orchestrate configuration is needed:

```bash
# ✅ CORRECT - For Orchestrate widget
NEXT_PUBLIC_ORCHESTRATE_INTEGRATION_ID=...
NEXT_PUBLIC_ORCHESTRATE_REGION=us-south
NEXT_PUBLIC_ORCHESTRATE_SERVICE_INSTANCE_ID=...
```

## Common Misconceptions

### ❌ Misconception 1: "Frontend needs API URL"

**Wrong**: Frontend never calls API, so doesn't need API URL.

**Right**: Only Orchestrate needs API URL (configured in Orchestrate console).

### ❌ Misconception 2: "Need to handle API errors in frontend"

**Wrong**: Frontend doesn't make API calls, so no API errors to handle.

**Right**: Widget handles API errors and shows appropriate messages.

### ❌ Misconception 3: "Need loading states for API calls"

**Wrong**: Frontend doesn't make API calls, so no loading states needed.

**Right**: Widget has its own loading indicators.

### ❌ Misconception 4: "Need to cache schedule data"

**Wrong**: Frontend doesn't receive schedule data, so nothing to cache.

**Right**: Widget/Orchestrate handles caching if needed.

## Security Implications

### Benefits of No Direct API Access

1. **No API Credentials in Frontend**
   - No API URL in client code
   - No risk of credential exposure
   - Simpler security model

2. **Reduced Attack Surface**
   - Can't bypass Orchestrate
   - Can't manipulate API calls
   - Can't access unauthorized data

3. **Token Isolation**
   - Token only used by Orchestrate
   - Frontend never sees API responses
   - Cleaner separation of concerns

### Token Exchange Security

The token exchange endpoint is secure because:

1. **Server-side validation**: Session checked on server
2. **No token exposure**: Token not sent to browser
3. **Same-origin only**: CORS prevents external access
4. **No caching**: Fresh token on each request

## Testing

### What to Test

✅ **DO test**:
- Token exchange endpoint works
- Widget loads correctly
- User can interact with widget
- Authentication flow works

❌ **DON'T test**:
- Direct API calls (there are none)
- API error handling (widget handles it)
- Schedule data parsing (widget does it)

### Example Tests

```typescript
// ✅ CORRECT - Test token exchange
describe('Token Exchange', () => {
  it('returns token for authenticated user', async () => {
    const response = await fetch('/api/token-exchange', {
      method: 'POST',
      headers: { Cookie: 'session=...' },
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.access_token).toBeDefined();
  });
});

// ❌ INCORRECT - Don't test direct API calls
describe('Schedule API', () => {
  it('fetches schedule', async () => {
    // This test shouldn't exist!
    const response = await fetch('http://localhost:9080/api/v1/schedule');
    // ...
  });
});
```

## Migration Guide

If you have existing code that makes direct API calls, here's how to migrate:

### Before (Incorrect)

```typescript
// ❌ Direct API call
const schedule = await fetch(`${API_URL}/api/v1/schedule`, {
  headers: { Authorization: `Bearer ${token}` },
}).then(r => r.json());

setSchedule(schedule);
```

### After (Correct)

```typescript
// ✅ Use Orchestrate widget
<OrchestrateWidget />

// Widget handles all API calls
// No schedule state needed in frontend
```

## Summary

| Aspect | Frontend | Orchestrate | API Server |
|--------|----------|-------------|------------|
| **Makes API calls** | ❌ No | ✅ Yes | N/A |
| **Has API URL** | ❌ No | ✅ Yes | N/A |
| **Handles schedule data** | ❌ No | ✅ Yes | ✅ Yes |
| **Uses JWT token** | ✅ Yes (for auth) | ✅ Yes (for API) | ✅ Yes (validates) |
| **Shows schedule UI** | ❌ No | ✅ Yes | ❌ No |

## Next Steps

- [Orchestrate Integration](orchestrate-integration.md) - Setup the widget
- [Development Guide](development.md) - Start building
- [Authentication Guide](authentication.md) - Understand auth flow

## Related Documentation

- [Frontend Overview](overview.md)
- [Architecture Diagram](overview.md#architecture)
- [API Server Documentation](../api/endpoints.md)