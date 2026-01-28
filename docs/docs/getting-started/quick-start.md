# Quick Start Guide

Get the Authentication Test API up and running in just a few minutes.

## Step 1: Clone or Download

If you have the source code, navigate to the project directory:

```bash
cd authentication_test/API_server
```

## Step 2: Build the Application

Build the application using Maven:

```bash
cd API_server
mvn clean package
```

This will:
- Compile the Java source code
- Run tests
- Package the application as a WAR file
- Output: `target/authentication-test-api.war`

Expected output:
```
[INFO] BUILD SUCCESS
[INFO] Total time: 45.123 s
```

## Step 3: Run with Maven (Development)

The fastest way to run the application for development:

```bash
cd API_server
mvn liberty:dev
```

This starts the server in development mode with:
- Hot reload on code changes
- Automatic test execution
- Debug port on 7777

Wait for:
```
[INFO] CWWKF0011I: The authTestServer server is ready to run a smarter planet.
```

The API is now available at:
- HTTP: `http://localhost:9080`
- HTTPS: `https://localhost:9443`

## Step 4: Test the Health Endpoint

Open a new terminal and test the public health endpoint:

```bash
curl http://localhost:9080/api/v1/hello
```

Expected response:
```json
{
  "hostname": "your-hostname",
  "serverTime": "2026-01-27T17:00:00Z",
  "apiVersion": "1.0.0",
  "status": "healthy"
}
```

✅ **Success!** The API is running.

## Step 5: Setup Keycloak (Required for Protected Endpoints)

To access the protected `/api/v1/schedule` endpoint, you need to configure Keycloak.

### Quick Keycloak Setup

1. **Start Keycloak** (if not already running):

=== "Podman"
    ```bash
    podman run -d \
      --name keycloak \
      -p 8080:8080 \
      -e KEYCLOAK_ADMIN=admin \
      -e KEYCLOAK_ADMIN_PASSWORD=admin \
      quay.io/keycloak/keycloak:latest \
      start-dev
    ```

=== "Docker"
    ```bash
    docker run -d \
      --name keycloak \
      -p 8080:8080 \
      -e KEYCLOAK_ADMIN=admin \
      -e KEYCLOAK_ADMIN_PASSWORD=admin \
      quay.io/keycloak/keycloak:latest \
      start-dev
    ```

2. **Access Keycloak Admin Console**:
   - URL: `http://localhost:8080`
   - Username: `admin`
   - Password: `admin`

3. **Follow the detailed setup**:
   - [Realm Configuration](../keycloak/realm-setup.md)
   - [Client Configuration](../keycloak/client-setup.md)
   - [User Management](../keycloak/user-management.md)

## Step 6: Get a JWT Token

Once Keycloak is configured, obtain a JWT token:

```bash
curl -X POST http://localhost:8080/realms/secure-test/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=authentication-test-api" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=password" \
  -d "username=testuser1" \
  -d "password=password123"
```

Extract the `access_token` from the response.

## Step 7: Test Protected Endpoint

Use the JWT token to access the schedule endpoint:

```bash
curl http://localhost:9080/api/v1/schedule \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
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
    }
  ]
}
```

✅ **Success!** You've made an authenticated API call.

## Alternative: Run with Container

Instead of Maven, you can run the application in a container:

### Build Container Image

=== "Podman"
    ```bash
    cd API_server
    podman build -t authentication-test-api:1.0.0 .
    ```

=== "Docker"
    ```bash
    cd API_server
    docker build -t authentication-test-api:1.0.0 .
    ```

### Run Container

=== "Podman"
    ```bash
    podman run -d \
      --name auth-api \
      -p 9080:9080 \
      -p 9443:9443 \
      -e JWT_JWKS_URI=http://localhost:8080/realms/secure-test/protocol/openid-connect/certs \
      -e JWT_ISSUER=http://localhost:8080/realms/secure-test \
      authentication-test-api:1.0.0
    ```

=== "Docker"
    ```bash
    docker run -d \
      --name auth-api \
      -p 9080:9080 \
      -p 9443:9443 \
      -e JWT_JWKS_URI=http://localhost:8080/realms/secure-test/protocol/openid-connect/certs \
      -e JWT_ISSUER=http://localhost:8080/realms/secure-test \
      authentication-test-api:1.0.0
    ```

## View OpenAPI Documentation

Access the interactive API documentation:

- **Swagger UI**: `http://localhost:9080/openapi/ui`
- **OpenAPI JSON**: `http://localhost:9080/openapi`

## Stopping the Application

### Maven Development Mode

Press `Ctrl+C` in the terminal running `mvn liberty:dev`

### Container

=== "Podman"
    ```bash
    podman stop auth-api
    podman rm auth-api
    ```

=== "Docker"
    ```bash
    docker stop auth-api
    docker rm auth-api
    ```

## Next Steps

Now that you have the API running:

1. [Explore API Endpoints](../api/endpoints.md) - Learn about all available endpoints
2. [Configure Keycloak](../keycloak/realm-setup.md) - Detailed authentication setup
3. [Build for Production](../build/maven.md) - Production build and deployment
4. [Troubleshooting](../troubleshooting/common-issues.md) - Solutions to common problems

## Common Issues

### Port Already in Use

If port 9080 is already in use:

```bash
# Find process using port 9080
lsof -i :9080  # macOS/Linux
netstat -ano | findstr :9080  # Windows

# Kill the process or change the port in server.xml
```

### Keycloak Connection Failed

Ensure Keycloak is running and accessible:

```bash
curl http://localhost:8080
```

### Build Failures

Clean and rebuild:

```bash
mvn clean install -U
```

For more help, see the [Troubleshooting Guide](../troubleshooting/common-issues.md).