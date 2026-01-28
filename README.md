# Authentication Test API

A RESTful API server providing user schedule management with OAuth 2.0 authentication via Keycloak.

## Overview

- **Version:** 1.0.0
- **Base Path:** `/api/v1`
- **Technology Stack:** Java 21, OpenLiberty 24.0.0.1, Jakarta EE 10, MicroProfile 6.1
- **Authentication:** Keycloak OAuth 2.0 with JWT tokens

## Features

- ✅ Health check endpoint (public)
- ✅ User schedule endpoint (secured with JWT)
- ✅ Role-based access control (RBAC)
- ✅ OpenAPI 3.0 documentation
- ✅ Comprehensive error handling
- ✅ Container support

## Prerequisites

- Java 21+
- Maven 3.9+
- Podman or Docker (optional, for containerized deployment)
- Keycloak server (for authentication)

## Keycloak Configuration

### Required Setup

1. **Keycloak URL:** `https://keycloak.lab.home`
2. **Realm:** `secure-test`
3. **Client Configuration:**
   - Client ID: `authentication-test-api`
   - Client Authentication: Enabled
   - Valid Redirect URIs: Configure based on your deployment
   - Web Origins: Configure for CORS support

4. **User Roles:**
   - Create role: `schedule-user`
   - Assign role to users who need access to the schedule endpoint

### Environment Variables

```bash
# Keycloak Configuration
export JWT_JWKS_URI=https://keycloak.lab.home/realms/secure-test/protocol/openid-connect/certs
export JWT_ISSUER=https://keycloak.lab.home/realms/secure-test

# CORS Configuration (optional)
export CORS_ALLOWED_ORIGINS=http://localhost:3000,https://app.lab.home
export CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
export CORS_ALLOWED_HEADERS=Authorization,Content-Type

# Logging
export LOG_LEVEL=INFO
```

## Building the Application

### Using Maven

```bash
# Navigate to API server directory
cd API_server

# Build the application
mvn clean package

# Run with Liberty Maven Plugin
mvn liberty:dev
```

The application will be available at:
- HTTP: `http://localhost:9080`
- HTTPS: `https://localhost:9443`

### Using Containers (Podman/Docker)

```bash
# Navigate to API server directory
cd API_server

# Build container image
podman build -t authentication-test-api:1.0.0 .

# Run container
podman run -d \
  -p 9080:9080 \
  -p 9443:9443 \
  -e JWT_JWKS_URI=https://keycloak.lab.home/realms/secure-test/protocol/openid-connect/certs \
  -e JWT_ISSUER=https://keycloak.lab.home/realms/secure-test \
  --name auth-test-api \
  authentication-test-api:1.0.0
```

Note: Replace `podman` with `docker` if using Docker instead.

## API Endpoints

### 1. Health Check (Public)

**Endpoint:** `GET /api/v1/hello`

**Description:** Server health check and basic information. No authentication required.

**Example Request:**
```bash
curl -X GET http://localhost:9080/api/v1/hello
```

**Example Response:**
```json
{
  "hostname": "server-hostname.local",
  "serverTime": "2026-01-27T16:47:00Z",
  "apiVersion": "1.0.0",
  "status": "healthy"
}
```

### 2. User Schedule (Secured)

**Endpoint:** `GET /api/v1/schedule`

**Description:** Retrieve authenticated user's schedule. Requires valid JWT token and `schedule-user` role.

**Example Request:**
```bash
curl -X GET http://localhost:9080/api/v1/schedule \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

**Example Response:**
```json
{
  "user": "john.doe",
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
    }
  ]
}
```

## Obtaining a JWT Token

### Using Keycloak Direct Grant (Password Flow)

```bash
curl -X POST https://keycloak.lab.home/realms/secure-test/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=authentication-test-api" \
  -d "client_secret=<YOUR_CLIENT_SECRET>" \
  -d "grant_type=password" \
  -d "username=<USERNAME>" \
  -d "password=<PASSWORD>"
```

Extract the `access_token` from the response and use it in the `Authorization` header.

## OpenAPI Documentation

Once the application is running, access the OpenAPI documentation:

- **OpenAPI JSON:** `http://localhost:9080/openapi`
- **Swagger UI:** `http://localhost:9080/openapi/ui`

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "timestamp": "2026-01-27T16:47:00Z",
  "path": "/api/v1/schedule"
}
```

### Common Error Codes

- `401 UNAUTHORIZED` - Missing or invalid authentication token
- `403 FORBIDDEN` - Valid token but insufficient permissions
- `404 NOT_FOUND` - Resource not found
- `500 INTERNAL_ERROR` - Server error

## Project Structure

```
authentication_test/
├── .github/
│   └── workflows/
│       └── docs.yml             # GitHub Actions for docs deployment
├── docs/                        # MkDocs documentation
│   ├── mkdocs.yml              # MkDocs configuration
│   ├── requirements.txt        # Python dependencies for docs
│   └── docs/                   # Documentation source files
├── API_server/                  # API Server application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/api/
│   │   │   │   ├── config/     # Configuration classes
│   │   │   │   ├── model/      # Data models
│   │   │   │   ├── resource/   # JAX-RS resources (endpoints)
│   │   │   │   ├── service/    # Business logic
│   │   │   │   └── exception/  # Exception handlers
│   │   │   ├── resources/
│   │   │   │   └── META-INF/
│   │   │   │       └── microprofile-config.properties
│   │   │   └── liberty/
│   │   │       └── config/
│   │   │           └── server.xml   # OpenLiberty configuration
│   │   └── test/
│   │       └── java/           # Test classes
│   ├── pom.xml                 # Maven configuration
│   ├── Containerfile           # Container build configuration
│   └── spec.md                 # API specification
└── README.md                   # This file
```

## Development

### Running in Development Mode

```bash
cd API_server
mvn liberty:dev
```

This enables:
- Hot reload on code changes
- Automatic test execution
- Debug port on 7777

### Running Tests

```bash
cd API_server
mvn test
```

## Security Considerations

- ✅ JWT signature validation using Keycloak's public key (JWKS)
- ✅ Role-based access control
- ✅ Token expiration handling
- ✅ HTTPS support (configure certificates for production)
- ✅ CORS configuration
- ⚠️ Never log sensitive data (tokens, passwords)
- ⚠️ Use HTTPS in production (TLS 1.2+)

## Monitoring

### Health Checks

- **Liveness:** `GET /api/v1/hello`
- **Readiness:** Check Keycloak connectivity

### Logs

Logs are written to:
- Console output (containerized deployment)
- `${server.output.dir}/logs/` (local development)

Log level can be configured via `LOG_LEVEL` environment variable.

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error**
   - Verify JWT token is valid and not expired
   - Check token is sent in `Authorization: Bearer <token>` header
   - Verify Keycloak JWKS URI is accessible

2. **403 Forbidden Error**
   - Ensure user has `schedule-user` role in Keycloak
   - Check role mapping in Keycloak client configuration

3. **Connection to Keycloak Failed**
   - Verify Keycloak URL is accessible from the application
   - Check network/firewall settings
   - Verify SSL certificates if using HTTPS

4. **CORS Errors**
   - Configure `CORS_ALLOWED_ORIGINS` environment variable
   - Ensure frontend origin is included in allowed origins

## License

Apache 2.0

## Support

For issues and questions, please contact: support@example.com

## References

- [OpenLiberty Documentation](https://openliberty.io/docs/)
- [MicroProfile Specifications](https://microprofile.io/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Jakarta EE Specifications](https://jakarta.ee/specifications/)