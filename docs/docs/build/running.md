# Running the Server

Guide for running the Authentication Test API server in different environments.

## Development Mode

### Using Maven Liberty Plugin

The easiest way to run during development:

```bash
mvn liberty:dev
```

Features:
- Hot reload on code changes
- Automatic test execution
- Debug port on 7777
- Interactive mode

Access the API at:
- HTTP: `http://localhost:9080`
- HTTPS: `https://localhost:9443`

Press `Ctrl+C` to stop.

## Production Mode

### Using Maven

Start the server in background:

```bash
mvn liberty:start
```

Stop the server:

```bash
mvn liberty:stop
```

### Using Container

See [Containerization Guide](containers.md) for running in containers.

## Configuration

Set environment variables before starting:

```bash
export JWT_JWKS_URI=https://keycloak.lab.home/realms/secure-test/protocol/openid-connect/certs
export JWT_ISSUER=https://keycloak.lab.home/realms/secure-test
mvn liberty:dev
```

## Verification

Test the server is running:

```bash
curl http://localhost:9080/api/v1/hello
```

## Next Steps

- [API Endpoints](../api/endpoints.md)
- [Configuration](../config/environment.md)
- [Troubleshooting](../troubleshooting/common-issues.md)