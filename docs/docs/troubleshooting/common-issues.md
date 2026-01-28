# Common Issues

Solutions to frequently encountered problems.

## Authentication Issues

### 401 Unauthorized Error

**Problem:** API returns 401 when calling `/schedule`

**Solutions:**
1. Verify JWT token is valid and not expired
2. Check token is sent in `Authorization: Bearer <token>` header
3. Ensure Keycloak JWKS URI is accessible from API server

### 403 Forbidden Error

**Problem:** Valid token but access denied

**Solutions:**
1. Verify user has `schedule-user` role in Keycloak
2. Check role mapping in client configuration
3. Ensure role appears in JWT token claims

## Connection Issues

### Can't Connect to Keycloak

**Solutions:**
1. Verify Keycloak is running: `curl http://localhost:8080`
2. Check network connectivity
3. Verify firewall settings
4. Check JWT_JWKS_URI environment variable

### Port Already in Use

**Problem:** Can't start server on port 9080

**Solutions:**
```bash
# Find process using port
lsof -i :9080

# Kill process or change port in server.xml
```

## Build Issues

### Maven Build Fails

**Solutions:**
```bash
# Clean and rebuild
mvn clean install -U

# Clear local repository
rm -rf ~/.m2/repository/com/example
mvn clean install
```

## Container Issues

### Container Won't Start

**Solutions:**
```bash
# Check logs
podman logs auth-api

# Verify image exists
podman images | grep authentication-test-api
```

## Next Steps

- [Debugging Guide](debugging.md)
- [API Endpoints](../api/endpoints.md)
