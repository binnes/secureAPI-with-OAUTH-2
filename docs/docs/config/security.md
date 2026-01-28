# Security Settings

Security configuration and best practices for the Authentication Test API.

## JWT Token Validation

- Tokens validated using Keycloak's public key (JWKS)
- Signature verification on every request
- Token expiration checked automatically

## Role-Based Access Control

- `schedule-user` role required for `/schedule` endpoint
- Roles extracted from JWT token claims
- Authorization enforced by `@RolesAllowed` annotation

## HTTPS Configuration

For production, always use HTTPS:

1. Generate or obtain SSL certificate
2. Configure in `server.xml`
3. Redirect HTTP to HTTPS

## Security Best Practices

- Never log JWT tokens or passwords
- Use environment variables for secrets
- Enable CORS only for trusted origins
- Keep dependencies updated
- Use strong passwords in Keycloak

## Next Steps

- [Environment Variables](environment.md)
- [Keycloak Setup](../keycloak/realm-setup.md)
