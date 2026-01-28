# API Server Specification

## 1. Overview

A RESTful API server providing user schedule management with OAuth 2.0 authentication via Keycloak.

**Project Name:** Authentication Test API  
**Version:** 1.0.0  
**Base Path:** `/api/v1`

## 2. Technical Stack

- **Language:** Java 21+
- **Application Server:** OpenLiberty 24.0.0.1+ (latest stable)
- **Framework:** Jakarta EE 10
- **MicroProfile:** 6.1+
  - MP JWT 2.1 (JWT token validation)
  - MP OpenAPI 3.1 (API documentation)
  - MP Config 3.1 (configuration management)
  - MP Rest Client 3.0 (Keycloak integration)
- **Build Tool:** Maven 3.9+
- **Authentication:** Keycloak OAuth 2.0

## 3. Authentication & Authorization

### 3.1 Keycloak Configuration

- **Keycloak URL:** `https://keycloak.lab.home`
- **Realm:** `secure-test`
- **Protocol:** OAuth 2.0 with JWT tokens
- **Flow Type:** Authorization Code Flow (for user authentication)
- **Token Type:** Bearer JWT

### 3.2 Required Keycloak Setup

- Client ID: `authentication-test-api` (or as configured)
- Client Authentication: Enabled
- Valid Redirect URIs: Configure based on deployment
- Web Origins: Configure for CORS support

### 3.3 Security Requirements

- **Token Validation:** JWT signature validation using Keycloak's public key (JWKS endpoint)
- **Required Claims:**
  - `sub` (subject/user identifier)
  - `preferred_username` (username)
  - `realm_access.roles` or `resource_access` (user roles)
- **Required Role:** `schedule-user` (for `/schedule` endpoint)
- **Token Expiration:** Respect token exp claim
- **HTTPS:** Required for production (TLS 1.2+)

## 4. API Endpoints

### 4.1 Health Check Endpoint

**Endpoint:** `GET /api/v1/hello`  
**Authentication:** None (public endpoint)  
**Purpose:** Server health check and basic information

#### Request
```http
GET /api/v1/hello HTTP/1.1
Host: localhost:9080
Accept: application/json
```

#### Success Response (200 OK)
```json
{
  "hostname": "server-hostname.local",
  "serverTime": "2026-01-27T16:47:00Z",
  "apiVersion": "1.0.0",
  "status": "healthy"
}
```

#### Response Fields
- `hostname` (string): Server hostname
- `serverTime` (string): Current server time in ISO 8601 UTC format
- `apiVersion` (string): API version
- `status` (string): Server status ("healthy")

#### Error Responses
- **500 Internal Server Error**
```json
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred",
  "timestamp": "2026-01-27T16:47:00Z"
}
```

---

### 4.2 User Schedule Endpoint

**Endpoint:** `GET /api/v1/schedule`  
**Authentication:** Required (Bearer JWT token)  
**Authorization:** Requires `schedule-user` role  
**Purpose:** Retrieve authenticated user's schedule

#### Request
```http
GET /api/v1/schedule HTTP/1.1
Host: localhost:9080
Accept: application/json
Authorization: Bearer <JWT_TOKEN>
```

#### Success Response (200 OK)
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
    },
    {
      "date": "2026-01-29",
      "time": "10:00",
      "description": "Sprint planning"
    }
  ]
}
```

#### Response Fields
- `user` (string): Username from JWT token (`preferred_username` claim)
- `schedule` (array): Array of schedule items
  - `date` (string): Date in ISO 8601 format (YYYY-MM-DD)
  - `time` (string): Time in 24-hour format (HH:mm)
  - `description` (string): Activity description (max 200 characters)

#### Test Data Generation Rules
- Generate 5-10 random schedule items per user
- Date range: Current date + 7 days
- Time range: 08:00 - 18:00 (business hours)
- Sample descriptions:
  - "Team standup meeting"
  - "Code review session"
  - "Sprint planning"
  - "Client presentation"
  - "Technical discussion"
  - "Project retrospective"
  - "One-on-one meeting"
  - "Training session"

#### Error Responses

**401 Unauthorized** (Missing or invalid token)
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required",
  "timestamp": "2026-01-27T16:47:00Z"
}
```

**403 Forbidden** (Valid token but insufficient permissions)
```json
{
  "error": "FORBIDDEN",
  "message": "Insufficient permissions. Required role: schedule-user",
  "timestamp": "2026-01-27T16:47:00Z"
}
```

**500 Internal Server Error**
```json
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred",
  "timestamp": "2026-01-27T16:47:00Z"
}
```

## 5. Configuration

### 5.1 Environment Variables

```properties
# Server Configuration
SERVER_PORT=9080
SERVER_HOST=0.0.0.0

# Keycloak Configuration
KEYCLOAK_URL=https://keycloak.lab.home
KEYCLOAK_REALM=secure-test
KEYCLOAK_CLIENT_ID=authentication-test-api
KEYCLOAK_CLIENT_SECRET=<secret>

# JWT Configuration
JWT_ISSUER=https://keycloak.lab.home/realms/secure-test
JWT_JWKS_URI=https://keycloak.lab.home/realms/secure-test/protocol/openid-connect/certs

# CORS Configuration (if needed)
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://app.lab.home
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Authorization,Content-Type

# Logging
LOG_LEVEL=INFO
```

### 5.2 MicroProfile Config

Use `microprofile-config.properties` for default values and environment variables for overrides.

## 6. OpenAPI Documentation

### 6.1 Requirements

- Enable MicroProfile OpenAPI
- Endpoint: `/openapi` (OpenAPI 3.0 JSON/YAML)
- UI Endpoint: `/openapi/ui` (Swagger UI)
- Include all endpoints with full documentation
- Add security scheme definitions
- Include example requests/responses

### 6.2 OpenAPI Annotations

Use Jakarta/MicroProfile OpenAPI annotations:
- `@OpenAPIDefinition` for API metadata
- `@Operation` for endpoint descriptions
- `@SecurityRequirement` for protected endpoints
- `@APIResponse` for response documentation
- `@Schema` for data models

## 7. Error Handling

### 7.1 Standard Error Response Format

All errors should return consistent JSON structure:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "timestamp": "2026-01-27T16:47:00Z",
  "path": "/api/v1/schedule",
  "details": {}
}
```

### 7.2 HTTP Status Codes

- **200 OK:** Successful request
- **400 Bad Request:** Invalid request format
- **401 Unauthorized:** Missing or invalid authentication
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server error
- **503 Service Unavailable:** Service temporarily unavailable

## 8. Security Best Practices

### 8.1 General Security

- Validate all JWT tokens on every protected request
- Use HTTPS in production (TLS 1.2+)
- Implement request rate limiting (consider future enhancement)
- Log security events (authentication failures, authorization denials)
- Never log sensitive data (tokens, passwords)

### 8.2 CORS Configuration

If frontend application will consume the API:
- Configure allowed origins explicitly
- Avoid wildcard (*) in production
- Include credentials support if needed

### 8.3 Token Handling

- Tokens should be sent in Authorization header only
- Never accept tokens from query parameters
- Implement token caching with TTL for performance
- Handle token expiration gracefully

## 9. Testing Requirements

### 9.1 Unit Tests

- Test business logic independently
- Mock external dependencies (Keycloak)
- Minimum 80% code coverage
- Use JUnit 5 and Mockito

### 9.2 Integration Tests

- Test with actual Keycloak instance (test realm)
- Test authentication flows
- Test authorization (role-based access)
- Test error scenarios
- Use Testcontainers for Keycloak if possible

### 9.3 Test Scenarios

**Hello Endpoint:**
- ✓ Returns correct hostname
- ✓ Returns valid ISO 8601 timestamp
- ✓ Returns 200 status code

**Schedule Endpoint:**
- ✓ Returns 401 without token
- ✓ Returns 401 with invalid token
- ✓ Returns 403 with valid token but no role
- ✓ Returns 200 with valid token and role
- ✓ Returns schedule for correct user
- ✓ Schedule contains valid date/time formats
- ✓ Handles Keycloak unavailability gracefully

## 10. Logging

### 10.1 Log Levels

- **ERROR:** Authentication/authorization failures, exceptions
- **WARN:** Token expiration, deprecated API usage
- **INFO:** Request/response logging (without sensitive data)
- **DEBUG:** Detailed flow information (development only)

### 10.2 Log Format

Use structured logging (JSON format recommended):

```json
{
  "timestamp": "2026-01-27T16:47:00Z",
  "level": "INFO",
  "logger": "com.example.api.ScheduleResource",
  "message": "Schedule retrieved",
  "user": "john.doe",
  "endpoint": "/api/v1/schedule",
  "duration_ms": 45
}
```

## 11. Deployment

### 11.1 Docker Support

Create Dockerfile for containerization:
- Base image: OpenLiberty official image
- Include application WAR/EAR
- Expose port 9080 (HTTP) and 9443 (HTTPS)
- Support environment variable configuration

### 11.2 Health Checks

- Liveness probe: `/api/v1/hello`
- Readiness probe: Check Keycloak connectivity
- Startup probe: Ensure server is fully initialized

### 11.3 Resource Requirements

**Minimum:**
- CPU: 0.5 cores
- Memory: 512 MB
- Disk: 100 MB

**Recommended:**
- CPU: 1 core
- Memory: 1 GB
- Disk: 500 MB

## 12. Monitoring & Observability

### 12.1 Metrics (Future Enhancement)

Consider adding MicroProfile Metrics:
- Request count per endpoint
- Response time percentiles
- Authentication success/failure rates
- Active user sessions

### 12.2 Tracing (Future Enhancement)

Consider MicroProfile OpenTracing for distributed tracing.

## 13. Development Guidelines

### 13.1 Code Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/example/api/
│   │       ├── config/          # Configuration classes
│   │       ├── model/           # Data models
│   │       ├── resource/        # JAX-RS resources (endpoints)
│   │       ├── security/        # Security filters, JWT handling
│   │       ├── service/         # Business logic
│   │       └── exception/       # Exception handlers
│   ├── resources/
│   │   └── META-INF/
│   │       └── microprofile-config.properties
│   └── liberty/
│       └── config/
│           └── server.xml       # OpenLiberty configuration
└── test/
    └── java/
        └── com/example/api/     # Test classes
```

### 13.2 Naming Conventions

- REST resources: `*Resource.java` (e.g., `ScheduleResource.java`)
- Services: `*Service.java`
- Models: Descriptive names (e.g., `Schedule.java`, `ScheduleItem.java`)
- Exceptions: `*Exception.java`

## 14. Future Enhancements

- Persistent storage for schedules (database)
- CRUD operations for schedule management
- User profile management
- Schedule sharing between users
- Calendar integration
- Email notifications
- Rate limiting
- API versioning strategy
- GraphQL support

## 15. References

- [OpenLiberty Documentation](https://openliberty.io/docs/)
- [MicroProfile Specifications](https://microprofile.io/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Jakarta EE Specifications](https://jakarta.ee/specifications/)
- [OAuth 2.0 RFC](https://datatracker.ietf.org/doc/html/rfc6749)
- [JWT RFC](https://datatracker.ietf.org/doc/html/rfc7519)
