# OpenAPI Documentation

Interactive API documentation using OpenAPI 3.0 and Swagger UI.

## Accessing OpenAPI Documentation

Once the server is running, access the interactive documentation:

### Swagger UI

Interactive API explorer with try-it-out functionality:

```
http://localhost:9080/openapi/ui
```

### OpenAPI Specification

Raw OpenAPI 3.0 specification in JSON format:

```
http://localhost:9080/openapi
```

## Using Swagger UI

1. **Open Swagger UI** at `http://localhost:9080/openapi/ui`
2. **Explore Endpoints** - Click on any endpoint to see details
3. **Try It Out** - Click "Try it out" button
4. **Authenticate** - Click "Authorize" and enter your JWT token
5. **Execute** - Fill in parameters and click "Execute"

## Authentication in Swagger UI

1. Click the **"Authorize"** button (lock icon)
2. Enter your JWT token in the format: `Bearer YOUR_TOKEN`
3. Click **"Authorize"**
4. Click **"Close"**

Now you can test protected endpoints.

## Getting a Token for Testing

```bash
curl -X POST http://localhost:8080/realms/secure-test/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=authentication-test-api" \
  -d "client_secret=YOUR_SECRET" \
  -d "grant_type=password" \
  -d "username=testuser1" \
  -d "password=password123" \
  | jq -r '.access_token'
```

Copy the token and use it in Swagger UI.

## OpenAPI Annotations

The API uses MicroProfile OpenAPI annotations for documentation:

```java
@Operation(
    summary = "Get user schedule",
    description = "Retrieve the authenticated user's schedule"
)
@APIResponses({
    @APIResponse(
        responseCode = "200",
        description = "Schedule retrieved successfully"
    )
})
```

## Next Steps

- [API Endpoints](endpoints.md)
- [Authentication](authentication.md)