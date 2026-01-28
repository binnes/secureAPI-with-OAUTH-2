# Environment Variables

Configuration options for the Authentication Test API using environment variables.

## Required Variables

### JWT Configuration

```bash
# Keycloak JWKS endpoint for token validation
export JWT_JWKS_URI=https://keycloak.lab.home/realms/secure-test/protocol/openid-connect/certs

# JWT token issuer
export JWT_ISSUER=https://keycloak.lab.home/realms/secure-test
```

## Optional Variables

### CORS Configuration

```bash
# Allowed origins (comma-separated)
export CORS_ALLOWED_ORIGINS=http://localhost:3000,https://app.lab.home

# Allowed HTTP methods
export CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS

# Allowed headers
export CORS_ALLOWED_HEADERS=Authorization,Content-Type
```

### Logging

```bash
# Log level: TRACE, DEBUG, INFO, WARN, ERROR
export LOG_LEVEL=INFO
```

## Setting Variables

### Development (Local)

```bash
# Create .env file (don't commit!)
cat > .env << EOF
JWT_JWKS_URI=http://localhost:8080/realms/secure-test/protocol/openid-connect/certs
JWT_ISSUER=http://localhost:8080/realms/secure-test
LOG_LEVEL=DEBUG
EOF

# Load variables
source .env

# Run application
mvn liberty:dev
```

### Container Deployment

```bash
# Using environment file
podman run -d \
  --name auth-api \
  -p 9080:9080 \
  --env-file .env \
  authentication-test-api:1.0.0
```

### Production

Use secure secret management:
- Kubernetes Secrets
- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault

## Next Steps

- [Server Configuration](server.md)
- [Security Settings](security.md)