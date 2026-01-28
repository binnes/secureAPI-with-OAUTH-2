# API Endpoints

Complete reference for all Authentication Test API endpoints.

## Base URL

```
http://localhost:9080/api/v1
```

## Endpoints Overview

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/hello` | GET | No | Health check |
| `/schedule` | GET | Yes | User schedule |

## Health Check Endpoint

### GET /api/v1/hello

Public endpoint for health checks and server information.

**Authentication:** None required

**Request:**
```bash
curl -X GET http://localhost:9080/api/v1/hello
```

**Response (200 OK):**
```json
{
  "hostname": "server-hostname.local",
  "serverTime": "2026-01-28T10:30:00Z",
  "apiVersion": "1.0.0",
  "status": "healthy"
}
```

**Response Fields:**
- `hostname` (string): Server hostname
- `serverTime` (string): Current server time in ISO 8601 UTC format
- `apiVersion` (string): API version
- `status` (string): Server status

## Schedule Endpoint

### GET /api/v1/schedule

Retrieve the authenticated user's schedule.

**Authentication:** Required (Bearer JWT token)  
**Authorization:** Requires `schedule-user` role

**Request:**
```bash
curl -X GET http://localhost:9080/api/v1/schedule \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "user": "testuser1",
  "schedule": [
    {
      "date": "2026-01-28",
      "time": "09:00",
      "description": "Team standup meeting"
    },
    {
      "date": "2026-01-28",
      "time": "14:30",
      "description": "Code review session"
    },
    {
      "date": "2026-01-29",
      "time": "10:00",
      "description": "Sprint planning"
    }
  ]
}
```

**Response Fields:**
- `user` (string): Username from JWT token
- `schedule` (array): Array of schedule items
  - `date` (string): Date in ISO 8601 format (YYYY-MM-DD)
  - `time` (string): Time in 24-hour format (HH:mm)
  - `description` (string): Activity description

**Error Responses:**

**401 Unauthorized:**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required",
  "timestamp": "2026-01-28T10:30:00Z",
  "path": "/api/v1/schedule"
}
```

**403 Forbidden:**
```json
{
  "error": "FORBIDDEN",
  "message": "Insufficient permissions. Required role: schedule-user",
  "timestamp": "2026-01-28T10:30:00Z",
  "path": "/api/v1/schedule"
}
```

## Testing Endpoints

### Using curl

```bash
# Health check
curl http://localhost:9080/api/v1/hello | jq

# Get token
TOKEN=$(curl -X POST http://localhost:8080/realms/secure-test/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=authentication-test-api" \
  -d "client_secret=YOUR_SECRET" \
  -d "grant_type=password" \
  -d "username=testuser1" \
  -d "password=password123" \
  | jq -r '.access_token')

# Call schedule endpoint
curl http://localhost:9080/api/v1/schedule \
  -H "Authorization: Bearer $TOKEN" | jq
```

## Next Steps

- [Authentication Guide](authentication.md)
- [Error Handling](errors.md)
- [OpenAPI Documentation](openapi.md)