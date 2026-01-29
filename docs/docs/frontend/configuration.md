# Frontend Configuration Guide

## Environment Variables

The frontend application uses environment variables for configuration. These are stored in `.env.local` (for local development) and should never be committed to version control.

## Required Environment Variables

### Keycloak Configuration

#### `KEYCLOAK_CLIENT_ID`

- **Description**: The client ID registered in Keycloak for this application
- **Example**: `authentication-test-frontend`
- **Required**: Yes
- **Where to find**: Keycloak Admin Console → Clients → Your Client → Settings

#### `KEYCLOAK_CLIENT_SECRET`

- **Description**: The client secret for authenticating with Keycloak
- **Example**: `8u50V7iXkuibA4BvzKVoDcQ5aaAbUsTI`
- **Required**: Yes
- **Security**: Keep this secret! Never commit to version control
- **Where to find**: Keycloak Admin Console → Clients → Your Client → Credentials

#### `KEYCLOAK_ISSUER`

- **Description**: The Keycloak realm issuer URL
- **Format**: `https://{keycloak-host}/realms/{realm-name}`
- **Example**: `https://keycloak.lab.home/realms/secure-test`
- **Required**: Yes
- **Note**: Must match the issuer in JWT tokens

### NextAuth Configuration

#### `NEXTAUTH_URL`

- **Description**: The canonical URL of your application
- **Example**: `http://localhost:3000`
- **Required**: Yes
- **Production**: Use your production domain (e.g., `https://app.lab.home`)
- **Note**: Must match the redirect URI configured in Keycloak

#### `NEXTAUTH_SECRET`

- **Description**: Secret key for encrypting session tokens
- **Example**: `your-random-secret-here`
- **Required**: Yes
- **Security**: Must be a strong random string
- **Generate**: `openssl rand -base64 32`
- **Note**: Change this in production!

### IBM watsonx Orchestrate Configuration

#### `NEXT_PUBLIC_ORCHESTRATE_INTEGRATION_ID`

- **Description**: The integration ID for your Orchestrate instance
- **Example**: `12345678-1234-1234-1234-123456789abc`
- **Required**: Yes (for Orchestrate widget to work)
- **Where to find**: IBM watsonx Orchestrate console
- **Note**: Prefix `NEXT_PUBLIC_` makes it available in browser

#### `NEXT_PUBLIC_ORCHESTRATE_REGION`

- **Description**: The IBM Cloud region where Orchestrate is deployed
- **Example**: `us-south`
- **Required**: Yes
- **Valid values**: `us-south`, `us-east`, `eu-gb`, `eu-de`, `jp-tok`, `au-syd`
- **Where to find**: IBM watsonx Orchestrate console

#### `NEXT_PUBLIC_ORCHESTRATE_SERVICE_INSTANCE_ID`

- **Description**: The service instance ID for your Orchestrate deployment
- **Example**: `abcdef12-3456-7890-abcd-ef1234567890`
- **Required**: Yes
- **Where to find**: IBM watsonx Orchestrate console

## Complete .env.local Example

```bash
# =============================================================================
# Keycloak OAuth 2.0 Configuration
# =============================================================================
# Client ID registered in Keycloak for this frontend application
KEYCLOAK_CLIENT_ID=authentication-test-frontend

# Client secret for authenticating with Keycloak (keep secret!)
KEYCLOAK_CLIENT_SECRET=8u50V7iXkuibA4BvzKVoDcQ5aaAbUsTI

# Keycloak realm issuer URL
# Format: https://{keycloak-host}/realms/{realm-name}
KEYCLOAK_ISSUER=https://keycloak.lab.home/realms/secure-test

# =============================================================================
# NextAuth.js Configuration
# =============================================================================
# Canonical URL of your application
# Development: http://localhost:3000
# Production: https://app.lab.home
NEXTAUTH_URL=http://localhost:3000

# Secret key for encrypting session tokens
# Generate with: openssl rand -base64 32
# IMPORTANT: Change this in production!
NEXTAUTH_SECRET=your-random-secret-here

# =============================================================================
# IBM watsonx Orchestrate Configuration
# =============================================================================
# Integration ID from Orchestrate console
NEXT_PUBLIC_ORCHESTRATE_INTEGRATION_ID=12345678-1234-1234-1234-123456789abc

# IBM Cloud region where Orchestrate is deployed
# Valid values: us-south, us-east, eu-gb, eu-de, jp-tok, au-syd
NEXT_PUBLIC_ORCHESTRATE_REGION=us-south

# Service instance ID from Orchestrate console
NEXT_PUBLIC_ORCHESTRATE_SERVICE_INSTANCE_ID=abcdef12-3456-7890-abcd-ef1234567890
```

## Environment-Specific Configuration

### Development Environment

For local development, use `.env.local`:

```bash
NEXTAUTH_URL=http://localhost:3000
KEYCLOAK_ISSUER=https://keycloak.lab.home/realms/secure-test
```

### Production Environment

For production deployment, set environment variables in your hosting platform:

```bash
NEXTAUTH_URL=https://app.lab.home
KEYCLOAK_ISSUER=https://keycloak.lab.home/realms/secure-test
```

**Important**: Never use `.env.local` in production. Use your platform's environment variable management.

## Variable Prefixes

### `NEXT_PUBLIC_` Prefix

Variables with this prefix are:

- **Exposed to the browser**: Available in client-side code
- **Embedded at build time**: Included in the JavaScript bundle
- **Use for**: Non-sensitive configuration that the browser needs

Example:
```typescript
// Available in browser
const region = process.env.NEXT_PUBLIC_ORCHESTRATE_REGION;
```

### No Prefix

Variables without prefix are:

- **Server-side only**: Not available in browser
- **Secure**: Never exposed to client
- **Use for**: Secrets, API keys, sensitive configuration

Example:
```typescript
// Only available on server
const secret = process.env.KEYCLOAK_CLIENT_SECRET;
```

## Validation

The application validates required environment variables at startup. If any are missing, you'll see an error:

```
Error: Missing required environment variable: KEYCLOAK_CLIENT_ID
```

## Security Best Practices

### 1. Never Commit Secrets

Add to `.gitignore`:

```
.env.local
.env*.local
```

### 2. Use Strong Secrets

Generate secure random strings:

```bash
# For NEXTAUTH_SECRET
openssl rand -base64 32

# For other secrets
openssl rand -hex 32
```

### 3. Rotate Secrets Regularly

- Change `NEXTAUTH_SECRET` periodically
- Rotate Keycloak client secrets
- Update all environments when rotating

### 4. Limit Secret Access

- Only share secrets with authorized team members
- Use secret management tools (e.g., HashiCorp Vault)
- Never send secrets via email or chat

### 5. Environment Separation

- Use different secrets for dev/staging/production
- Never use production secrets in development
- Test with non-production Keycloak realms

## Troubleshooting

### Issue: "Invalid client credentials"

**Cause**: `KEYCLOAK_CLIENT_SECRET` doesn't match Keycloak

**Solution**:
1. Go to Keycloak Admin Console
2. Navigate to Clients → Your Client → Credentials
3. Copy the secret
4. Update `.env.local`
5. Restart dev server

### Issue: "Redirect URI mismatch"

**Cause**: `NEXTAUTH_URL` doesn't match Keycloak redirect URI

**Solution**:
1. Check `NEXTAUTH_URL` in `.env.local`
2. Go to Keycloak Admin Console
3. Navigate to Clients → Your Client → Settings
4. Add to Valid Redirect URIs: `{NEXTAUTH_URL}/api/auth/callback/keycloak`
5. Save and restart

### Issue: "Orchestrate widget not loading"

**Cause**: Missing or incorrect Orchestrate configuration

**Solution**:
1. Verify all `NEXT_PUBLIC_ORCHESTRATE_*` variables are set
2. Check values in Orchestrate console
3. Ensure region is correct
4. Restart dev server (required for `NEXT_PUBLIC_` changes)

### Issue: "Environment variables not loading"

**Cause**: File not named correctly or server not restarted

**Solution**:
1. Ensure file is named `.env.local` (not `.env` or `.env.development`)
2. Restart dev server: `npm run dev`
3. Check for typos in variable names
4. Verify file is in `Frontend/` directory

## Advanced Configuration

### Custom Port

To run on a different port:

```bash
PORT=3001 npm run dev
```

Update configuration:
```bash
NEXTAUTH_URL=http://localhost:3001
```

Update Keycloak redirect URI:
```
http://localhost:3001/api/auth/callback/keycloak
```

### HTTPS in Development

For local HTTPS:

1. Generate self-signed certificate
2. Configure Next.js for HTTPS
3. Update `NEXTAUTH_URL` to use `https://`
4. Update Keycloak redirect URIs

### Multiple Environments

Create environment-specific files:

- `.env.local` - Local development
- `.env.development` - Development server
- `.env.staging` - Staging environment
- `.env.production` - Production (use platform variables instead)

## Next Steps

After configuration:

1. [Understand Authentication Flow](authentication.md)
2. [Setup Orchestrate Integration](orchestrate-integration.md)
3. [Start Development](development.md)

## Related Documentation

- [Setup Guide](setup.md)
- [Keycloak Client Setup](../keycloak/client-setup.md)
- [Orchestrate Installation](../orchestrate/installation.md)