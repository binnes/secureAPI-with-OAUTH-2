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

## Exporting the OpenAPI Specification

To add this API to Orchestrate or other tools, you need to export the OpenAPI specification file.

=== "curl"

    Download the spec using curl (recommended):

    ```bash
    curl http://localhost:9080/openapi -o openapi.json
    ```

    This creates an `openapi.json` file in your current directory.

=== "wget"

    Download using wget:

    ```bash
    wget http://localhost:9080/openapi -O openapi.json
    ```

=== "Browser"

    Download via web browser:

    1. Start the server: `mvn liberty:dev`
    2. Open your browser to: `http://localhost:9080/openapi`
    3. Right-click and select "Save Page As..."
    4. Save as `openapi.json`

=== "Swagger UI"

    Export from Swagger UI:

    1. Navigate to `http://localhost:9080/openapi/ui`
    2. Look for the OpenAPI spec link at the top of the page
    3. Right-click and "Save Link As..."
    4. Save as `openapi.json`

=== "Automated Script"

    Create a script to export automatically:

    ```bash
    #!/bin/bash
    # export-openapi.sh

    # Wait for server to be ready
    echo "Waiting for server to start..."
    until curl -s http://localhost:9080/openapi > /dev/null; do
        sleep 2
    done

    # Export the spec
    echo "Exporting OpenAPI specification..."
    curl http://localhost:9080/openapi -o openapi.json

    echo "OpenAPI spec exported to openapi.json"
    ```

    Make it executable and run:

    ```bash
    chmod +x export-openapi.sh
    ./export-openapi.sh
    ```

### Verify the Export

Check that the file contains valid JSON:

```bash
cat openapi.json | jq '.'
```

Or view the OpenAPI version:

```bash
cat openapi.json | jq '.openapi'
```

Expected output: `"3.0.3"` or similar.

### Using the Spec with Orchestrate

Once exported, you can:

1. **Import to Orchestrate** - Use the `openapi.json` file to register your API
2. **Version Control** - Commit the spec to your repository for tracking changes
3. **API Documentation** - Share with team members or external consumers
4. **Code Generation** - Use tools like OpenAPI Generator to create client SDKs

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