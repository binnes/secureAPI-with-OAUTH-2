# IBM watsonx Orchestrate Integration Guide

## Overview

The frontend application integrates IBM watsonx Orchestrate through an embedded Watson Assistant Chat widget. This widget provides AI-powered schedule management capabilities without requiring direct API calls from the frontend.

## Architecture

### Integration Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend Application                       │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Application Page (/app)                   │  │
│  │                                                         │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │         OrchestrateWidget Component              │  │  │
│  │  │                                                   │  │  │
│  │  │  1. Loads Watson Assistant Chat script           │  │  │
│  │  │  2. Initializes widget with user context         │  │  │
│  │  │  3. Passes JWT via token exchange                │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                          │
                          │ Token Exchange
                          ▼
┌──────────────────────────────────────────────────────────────┐
│              /api/token-exchange Endpoint                     │
│                                                               │
│  - Validates user session                                     │
│  - Returns JWT access token                                   │
│  - Implements RFC 8693                                        │
└──────────────────────────────────────────────────────────────┘
                          │
                          │ JWT Bearer Token
                          ▼
┌──────────────────────────────────────────────────────────────┐
│              IBM watsonx Orchestrate                          │
│                                                               │
│  - Receives user JWT                                          │
│  - Calls API server on behalf of user                         │
│  - Returns schedule data                                      │
│  - Provides conversational interface                          │
└──────────────────────────────────────────────────────────────┘
```

## Configuration

### Required Environment Variables

```bash
# Integration ID from Orchestrate console
NEXT_PUBLIC_ORCHESTRATE_INTEGRATION_ID=12345678-1234-1234-1234-123456789abc

# IBM Cloud region
NEXT_PUBLIC_ORCHESTRATE_REGION=us-south

# Service instance ID
NEXT_PUBLIC_ORCHESTRATE_SERVICE_INSTANCE_ID=abcdef12-3456-7890-abcd-ef1234567890
```

### Obtaining Configuration Values

1. **Log in to IBM Cloud**
   - Navigate to https://cloud.ibm.com
   - Sign in with your IBM ID

2. **Access watsonx Orchestrate**
   - Go to Resource List
   - Find your Orchestrate instance
   - Click to open

3. **Get Integration ID**
   - Navigate to Integrations
   - Find your integration
   - Copy the Integration ID

4. **Get Region**
   - Check your instance details
   - Note the region (e.g., us-south, eu-gb)

5. **Get Service Instance ID**
   - In instance details
   - Copy the Service Instance ID

## Widget Component

### Implementation

The `OrchestrateWidget` component handles all Orchestrate integration:

```typescript
// components/orchestrate/OrchestrateWidget.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

export default function OrchestrateWidget() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const widgetInitialized = useRef(false);

  useEffect(() => {
    if (!session?.user || widgetInitialized.current) return;

    // Check configuration
    const integrationId = process.env.NEXT_PUBLIC_ORCHESTRATE_INTEGRATION_ID;
    const region = process.env.NEXT_PUBLIC_ORCHESTRATE_REGION;
    const serviceInstanceId = process.env.NEXT_PUBLIC_ORCHESTRATE_SERVICE_INSTANCE_ID;

    if (!integrationId || !region || !serviceInstanceId) {
      setError('Orchestrate configuration missing');
      return;
    }

    // Load Watson Assistant Chat widget
    const script = document.createElement('script');
    script.src = `https://web-chat.global.assistant.watson.appdomain.cloud/versions/${
      process.env.NEXT_PUBLIC_WA_VERSION || 'latest'
    }/WatsonAssistantChatEntry.js`;
    
    script.onload = () => {
      window.watsonAssistantChatOptions = {
        integrationID: integrationId,
        region: region,
        serviceInstanceID: serviceInstanceId,
        onLoad: async (instance: any) => {
          // Get user's JWT token via token exchange
          const tokenResponse = await fetch('/api/token-exchange', {
            method: 'POST',
          });
          
          if (tokenResponse.ok) {
            const { access_token } = await tokenResponse.json();
            
            // Pass token to Orchestrate
            instance.updateUserPayload({
              context: {
                skills: {
                  'main skill': {
                    user_defined: {
                      jwt_token: access_token,
                      user_id: session.user.email,
                    },
                  },
                },
              },
            });
          }
          
          await instance.render();
        },
      };
      
      window.loadWatsonAssistantChat();
      widgetInitialized.current = true;
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [session]);

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return <div id="watson-assistant-chat-container" />;
}
```

### Key Features

1. **Automatic Token Management**
   - Fetches JWT via token exchange endpoint
   - Passes token to Orchestrate securely
   - No token exposure in client code

2. **User Context**
   - Passes user email/ID to Orchestrate
   - Enables personalized responses
   - Maintains user session

3. **Error Handling**
   - Validates configuration
   - Shows user-friendly error messages
   - Graceful degradation

4. **Lifecycle Management**
   - Loads widget only when authenticated
   - Prevents duplicate initialization
   - Cleans up on unmount

## Widget Customization

### Appearance

Customize widget appearance in Orchestrate console:

- **Theme**: Light or dark
- **Colors**: Primary, secondary, accent
- **Position**: Bottom right, bottom left, etc.
- **Size**: Compact, medium, large
- **Avatar**: Custom avatar image

### Behavior

Configure widget behavior:

- **Auto-open**: Open automatically on page load
- **Greeting**: Custom greeting message
- **Suggestions**: Quick action buttons
- **Language**: Supported languages

### Advanced Options

```typescript
window.watsonAssistantChatOptions = {
  integrationID: integrationId,
  region: region,
  serviceInstanceID: serviceInstanceId,
  
  // Appearance
  carbonTheme: 'g10', // or 'g90', 'g100'
  hideCloseButton: false,
  showLauncher: true,
  
  // Behavior
  openChatByDefault: false,
  namespaceClassPrefix: 'my-app',
  
  // Callbacks
  onLoad: async (instance) => {
    // Initialize
  },
  onError: (error) => {
    console.error('Widget error:', error);
  },
};
```

## Token Exchange

### Endpoint Implementation

The `/api/token-exchange` endpoint securely provides the user's JWT to Orchestrate:

```typescript
// app/api/token-exchange/route.ts
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json(
      { error: 'unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    access_token: session.accessToken,
    issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
    token_type: 'Bearer',
    expires_in: session.expiresAt
      ? Math.floor((session.expiresAt - Date.now()) / 1000)
      : 3600,
  });
}
```

### Security

- **Server-side only**: Token never exposed to client
- **Session validation**: Ensures user is authenticated
- **CORS protection**: Same-origin requests only
- **No caching**: Tokens not cached in browser

## Usage in Application

### Application Page

```typescript
// app/app/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import OrchestrateWidget from '@/components/orchestrate/OrchestrateWidget';

export default async function ApplicationPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Schedule Management
      </h1>
      
      <div className="mb-8">
        <OrchestrateWidget />
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          How to Use
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Click the chat icon to open the assistant</li>
          <li>Ask about your schedule</li>
          <li>Request schedule updates</li>
          <li>Get schedule summaries</li>
        </ul>
      </div>
    </div>
  );
}
```

## Testing

### Manual Testing

1. **Widget Loads**
   ```
   ✓ Widget appears on page
   ✓ No console errors
   ✓ Chat icon visible
   ```

2. **Authentication**
   ```
   ✓ Token exchange succeeds
   ✓ User context passed
   ✓ Widget initializes
   ```

3. **Functionality**
   ```
   ✓ Can open/close widget
   ✓ Can send messages
   ✓ Receives responses
   ✓ Schedule data displays
   ```

### Debugging

Enable debug mode:

```typescript
window.watsonAssistantChatOptions = {
  // ... other options
  debug: true, // Enable debug logging
};
```

Check browser console for:
- Widget initialization logs
- Token exchange requests
- API calls from Orchestrate
- Error messages

## Troubleshooting

### Issue: Widget not loading

**Symptoms**: No chat icon appears

**Solutions**:
1. Check environment variables are set
2. Verify integration ID is correct
3. Check browser console for errors
4. Ensure user is authenticated

### Issue: "Configuration missing" error

**Symptoms**: Error message displayed instead of widget

**Solutions**:
1. Verify all `NEXT_PUBLIC_ORCHESTRATE_*` variables are set
2. Restart dev server (required for `NEXT_PUBLIC_` changes)
3. Check `.env.local` file exists

### Issue: Token exchange fails

**Symptoms**: Widget loads but doesn't work

**Solutions**:
1. Check user is authenticated
2. Verify `/api/token-exchange` endpoint works
3. Check browser network tab for 401 errors
4. Ensure session is valid

### Issue: Widget shows but no responses

**Symptoms**: Can send messages but no replies

**Solutions**:
1. Verify Orchestrate is configured correctly
2. Check Orchestrate has access to API server
3. Verify API server is running
4. Check API server logs for errors

## Best Practices

### 1. Error Handling

Always handle widget errors gracefully:

```typescript
onError: (error) => {
  console.error('Widget error:', error);
  // Show user-friendly message
  setError('Unable to load assistant. Please refresh.');
}
```

### 2. Loading States

Show loading indicator while widget initializes:

```typescript
const [loading, setLoading] = useState(true);

onLoad: async (instance) => {
  // Initialize...
  setLoading(false);
}
```

### 3. Cleanup

Always cleanup on component unmount:

```typescript
return () => {
  if (script.parentNode) {
    script.parentNode.removeChild(script);
  }
};
```

### 4. Token Refresh

Handle token expiration:

```typescript
// Refresh token before passing to widget
const tokenResponse = await fetch('/api/token-exchange', {
  method: 'POST',
});

if (!tokenResponse.ok) {
  // Token expired, user needs to re-authenticate
  signOut({ callbackUrl: '/' });
}
```

## Next Steps

- [API Integration](api-integration.md) - Understand the architecture
- [Development Guide](development.md) - Start building
- [Troubleshooting](../troubleshooting/common-issues.md) - Common issues

## Related Documentation

- [Watson Assistant Documentation](https://cloud.ibm.com/docs/watson-assistant)
- [watsonx Orchestrate Documentation](https://www.ibm.com/docs/en/watsonx/watson-orchestrate)
- [Authentication Guide](authentication.md)