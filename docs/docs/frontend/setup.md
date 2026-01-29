# Frontend Setup Guide

## Prerequisites

Before setting up the frontend application, ensure you have:

- **Node.js**: Version 18.17 or later
- **npm**: Version 9 or later (comes with Node.js)
- **Keycloak**: Running instance at `https://keycloak.lab.home`
- **API Server**: Running at `http://localhost:9080`
- **Git**: For cloning the repository

## Installation Steps

### 1. Navigate to Frontend Directory

```bash
cd Frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:

- Next.js 15
- React 19
- NextAuth.js 4.24
- Tailwind CSS
- TypeScript
- And all other dependencies

### 3. Configure Keycloak Client

Before configuring the frontend, you need to create a Keycloak client. Choose your preferred method:

=== "Manual Setup (UI)"

    Follow the [Frontend Client Setup Guide](../keycloak/frontend-client-setup.md) to create the client manually through the Keycloak Admin Console.

    **Time**: ~5 minutes

=== "Automated Setup (REST API)"

    Use the Keycloak REST API to create the client automatically:

    ```bash
    # Step 1: Get admin access token
    TOKEN=$(curl -s -X POST "https://keycloak.lab.home/realms/master/protocol/openid-connect/token" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "username=admin" \
      -d "password=your-admin-password" \
      -d "grant_type=password" \
      -d "client_id=admin-cli" \
      | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

    # Step 2: Create frontend client
    curl -X POST "https://keycloak.lab.home/admin/realms/secure-test/clients" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "clientId": "authentication-test-frontend",
        "name": "Authentication Test Frontend",
        "description": "Next.js frontend application",
        "enabled": true,
        "protocol": "openid-connect",
        "publicClient": false,
        "clientAuthenticatorType": "client-secret",
        "standardFlowEnabled": true,
        "directAccessGrantsEnabled": true,
        "rootUrl": "http://localhost:3000",
        "baseUrl": "http://localhost:3000",
        "redirectUris": [
          "http://localhost:3000/*",
          "http://localhost:3000/api/auth/callback/keycloak",
          "https://app.lab.home/*",
          "https://app.lab.home/api/auth/callback/keycloak"
        ],
        "webOrigins": [
          "http://localhost:3000",
          "https://app.lab.home"
        ],
        "attributes": {
          "pkce.code.challenge.method": "S256"
        }
      }'

    # Step 3: Get client secret
    CLIENT_UUID=$(curl -s "https://keycloak.lab.home/admin/realms/secure-test/clients?clientId=authentication-test-frontend" \
      -H "Authorization: Bearer $TOKEN" \
      | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['id'])")

    curl -s "https://keycloak.lab.home/admin/realms/secure-test/clients/$CLIENT_UUID/client-secret" \
      -H "Authorization: Bearer $TOKEN" \
      | python3 -c "import sys, json; print('Client Secret:', json.load(sys.stdin)['value'])"
    ```

    **Time**: ~2 minutes

    !!! success "Automated Setup"
        Copy the client secret from the output for the next step.

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```bash
# Keycloak Configuration
KEYCLOAK_ID=authentication-test-frontend
KEYCLOAK_SECRET=<client-secret-from-keycloak>
KEYCLOAK_ISSUER=https://keycloak.lab.home/realms/secure-test

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# API Server Configuration
NEXT_PUBLIC_API_URL=http://localhost:9080

# IBM watsonx Orchestrate Configuration (Optional)
# NEXT_PUBLIC_ORCHESTRATE_INTEGRATION_ID=your-integration-id
# NEXT_PUBLIC_ORCHESTRATE_REGION=us-south
# NEXT_PUBLIC_ORCHESTRATE_SERVICE_INSTANCE_ID=your-service-instance-id
```

See the [Configuration Guide](configuration.md) for detailed information about each variable.

### 5. Generate NextAuth Secret

Generate a secure random secret for NextAuth:

```bash
openssl rand -base64 32
```

Copy the output and set it as `NEXTAUTH_SECRET` in `.env.local`.

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

The application will be available at:

- **URL**: http://localhost:3000
- **Hot Reload**: Enabled
- **Source Maps**: Enabled

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## Verification Steps

### 1. Check Application Startup

After running `npm run dev`, you should see:

```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

### 2. Access Home Page

Navigate to http://localhost:3000

You should see:

- Application title and description
- "Sign In" button
- No errors in browser console

### 3. Test Authentication

Click "Sign In" button:

1. Should redirect to Keycloak login page
2. Enter valid credentials
3. Should redirect back to application
4. Should see user menu with your name
5. Should have access to `/app` page

### 4. Verify Orchestrate Widget

After signing in, navigate to http://localhost:3000/app

You should see:

- Orchestrate widget placeholder (if not configured)
- OR Watson Assistant Chat widget (if configured)
- No console errors

## Common Setup Issues

### Issue: "Module not found" errors

**Solution**: Delete `node_modules` and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 3000 already in use

**Solution**: Use a different port:

```bash
PORT=3001 npm run dev
```

Don't forget to update `NEXTAUTH_URL` and Keycloak redirect URIs.

### Issue: Keycloak connection refused

**Solution**: Verify Keycloak is running:

```bash
curl https://keycloak.lab.home/realms/secure-test/.well-known/openid-configuration
```

### Issue: NextAuth callback error

**Solution**: Verify redirect URI in Keycloak matches exactly:

- Keycloak: `http://localhost:3000/api/auth/callback/keycloak`
- Must include protocol, host, port, and full path

### Issue: Environment variables not loading

**Solution**: Ensure `.env.local` exists and restart dev server:

```bash
# Verify file exists
ls -la .env.local

# Restart server
npm run dev
```

## Project Structure After Setup

```
Frontend/
├── node_modules/              # Installed dependencies
├── .next/                     # Next.js build output
├── app/                       # Application code
├── components/                # React components
├── lib/                       # Utility libraries
├── types/                     # TypeScript types
├── public/                    # Static assets
├── .env.local                 # Local environment variables (gitignored)
├── .env.example               # Environment template
├── package.json               # Dependencies and scripts
├── package-lock.json          # Locked dependency versions
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

## Next Steps

After successful setup:

1. [Configure Environment Variables](configuration.md) - Detailed configuration guide
2. [Understand Authentication](authentication.md) - Learn about the auth flow
3. [Setup Orchestrate Integration](orchestrate-integration.md) - Configure the widget
4. [Development Guide](development.md) - Start developing

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Getting Help

If you encounter issues:

1. Check [Troubleshooting Guide](../troubleshooting/common-issues.md)
2. Review [Common Issues](../troubleshooting/debugging.md)
3. Check browser console for errors
4. Check terminal output for server errors
5. Verify all prerequisites are met