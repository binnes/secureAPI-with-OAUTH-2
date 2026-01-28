# Debugging Guide

Tips and techniques for debugging the Authentication Test API.

## Enable Debug Logging

Set log level to DEBUG:

```bash
export LOG_LEVEL=DEBUG
mvn liberty:dev
```

## Debug with IDE

### IntelliJ IDEA / VS Code

1. Start server in debug mode: `mvn liberty:dev`
2. Attach debugger to port 7777
3. Set breakpoints in code
4. Make API request to trigger breakpoint

## View Logs

### Development Mode

Logs appear in console when running `mvn liberty:dev`

### Container Logs

```bash
podman logs -f auth-api
```

## Decode JWT Token

```bash
# Extract and decode token payload
echo "YOUR_TOKEN" | cut -d'.' -f2 | base64 -d | jq
```

## Test Keycloak Connectivity

```bash
# Test JWKS endpoint
curl https://keycloak.lab.home/realms/secure-test/protocol/openid-connect/certs | jq
```

## Next Steps

- [Common Issues](common-issues.md)
- [API Endpoints](../api/endpoints.md)
