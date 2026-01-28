# Authentication

Guide to authenticating with the Authentication Test API using OAuth 2.0 and JWT tokens.

## Overview

The API uses OAuth 2.0 with JWT (JSON Web Tokens) for authentication via Keycloak.

## Getting a Token

### Using Password Grant

```bash
curl -X POST http://localhost:8080/realms/secure-test/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=authentication-test-api" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=password" \
  -d "username=testuser1" \
  -d "password=password123"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 300,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

## Using the Token

Include the access token in the Authorization header:

```bash
curl http://localhost:9080/api/v1/schedule \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Token Structure

JWT tokens contain:
- `sub`: User ID
- `preferred_username`: Username
- `realm_access.roles`: User roles
- `exp`: Expiration time
- `iss`: Issuer (Keycloak)

## Next Steps

- [API Endpoints](endpoints.md)
- [Keycloak Setup](../keycloak/realm-setup.md)