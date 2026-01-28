
# Realm Configuration

This guide walks you through creating and configuring the `secure-test` realm in Keycloak for the Authentication Test API.

## What is a Realm?

A realm in Keycloak is an isolated space that manages:

- Users and groups
- Roles and permissions
- Clients (applications)
- Authentication settings

## Prerequisites

- Keycloak installed and running
- Access to Keycloak Admin Console
- Admin credentials

## Step 1: Access Admin Console

1. Open browser: `http://localhost:8080`
2. Click "Administration Console"
3. Login with admin credentials

## Step 2: Create Realm

=== "Admin Console"

    1. **Hover over "Master"** in the top-left corner
    2. **Click "Create Realm"**
    3. **Enter Realm Details**:
        - **Realm name**: `secure-test`
        - **Enabled**: ✓ (checked)
    4. **Click "Create"**

    You should now see "secure-test" in the realm selector.

=== "REST API"

    Create the realm via API:

    ```bash
    # Get admin token
    TOKEN=$(curl -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "username=admin" \
      -d "password=admin" \
      -d "grant_type=password" \
      -d "client_id=admin-cli" \
      | jq -r '.access_token')

    # Create realm
    curl -X POST http://localhost:8080/admin/realms \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "realm": "secure-test",
        "enabled": true,
        "displayName": "Secure Test Realm",
        "displayNameHtml": "<b>Secure Test</b>"
      }'
    ```

## Step 3: Configure Realm Settings

### General Settings

1. **Select "secure-test" realm** from dropdown
2. **Go to "Realm settings"**
3. **Configure General tab**:
   - **Display name**: `Secure Test Realm`
   - **HTML Display name**: `<b>Secure Test</b>`
   - **Frontend URL**: Leave empty for development
   - **Require SSL**: `none` (development) or `external requests` (production)

4. **Click "Save"**

### Login Settings

1. **Go to "Realm settings" → "Login" tab**
2. **Configure**:
   - **User registration**: ✗ (unchecked for security)
   - **Forgot password**: ✓ (optional)
   - **Remember me**: ✓ (optional)
   - **Email as username**: ✗ (use separate username)
   - **Login with email**: ✓ (allow email login)
   - **Duplicate emails**: ✗ (prevent duplicate emails)
   - **Verify email**: ✗ (disable for testing)

3. **Click "Save"**

### Token Settings

1. **Go to "Realm settings" → "Tokens" tab**
2. **Configure Token Lifespans**:
   - **Access Token Lifespan**: `5 Minutes` (default)
   - **Access Token Lifespan For Implicit Flow**: `15 Minutes`
   - **Client login timeout**: `1 Minutes`
   - **Login timeout**: `30 Minutes`
   - **Login action timeout**: `5 Minutes`

3. **Click "Save"**

!!! tip "Token Lifespan"
    For development, you can increase token lifespan to avoid frequent re-authentication.
    For production, keep tokens short-lived for security.

### Email Settings (Optional)

For password reset and email verification:

1. **Go to "Realm settings" → "Email" tab**
2. **Configure SMTP**:
   - **Host**: `smtp.gmail.com` (or your SMTP server)
   - **Port**: `587`
   - **From**: `noreply@example.com`
   - **Enable SSL**: ✗
   - **Enable StartTLS**: ✓
   - **Enable Authentication**: ✓
   - **Username**: Your email
   - **Password**: Your email password

3. **Click "Save"**
4. **Click "Test connection"** to verify

## Step 4: Create Realm Role

Create the `schedule-user` role required by the API.

=== "Admin Console"

    1. **Go to "Realm roles"** in left menu
    2. **Click "Create role"**
    3. **Enter Role Details**:
        - **Role name**: `schedule-user`
        - **Description**: `Role for accessing schedule API`
    4. **Click "Save"**

=== "REST API"

    ```bash
    # Get admin token (if not already set)
    TOKEN=$(curl -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "username=admin" \
      -d "password=admin" \
      -d "grant_type=password" \
      -d "client_id=admin-cli" \
      | jq -r '.access_token')

    # Create role
    curl -X POST http://localhost:8080/admin/realms/secure-test/roles \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "schedule-user",
        "description": "Role for accessing schedule API"
      }'
    ```

## Step 5: Configure Security Settings

### Brute Force Detection

Protect against brute force attacks:

1. **Go to "Realm settings" → "Security defenses" tab**
2. **Configure Brute Force Detection**:
   - **Enabled**: ✓
   - **Permanent Lockout**: ✗
   - **Max Login Failures**: `5`
   - **Wait Increment**: `60 Seconds`
   - **Quick Login Check Milli Seconds**: `1000`
   - **Minimum Quick Login Wait**: `60 Seconds`
   - **Max Wait**: `900 Seconds`
   - **Failure Reset Time**: `43200 Seconds` (12 hours)

3. **Click "Save"**

### Password Policy

Set password requirements:

1. **Go to "Realm settings" → "Security defenses" → "Password policy" tab**
2. **Add Policies**:
   - **Minimum Length**: `8`
   - **Not Username**: ✓
   - **Uppercase Characters**: `1`
   - **Lowercase Characters**: `1`
   - **Digits**: `1`
   - **Special Characters**: `1`

3. **Click "Save"**

## Step 6: Verify Realm Configuration

### Check Realm Endpoints

Get the OpenID Connect configuration:

```bash
curl http://localhost:8080/realms/secure-test/.well-known/openid-configuration | jq
```

You should see:

```json
{
  "issuer": "http://localhost:8080/realms/secure-test",
  "authorization_endpoint": "http://localhost:8080/realms/secure-test/protocol/openid-connect/auth",
  "token_endpoint": "http://localhost:8080/realms/secure-test/protocol/openid-connect/token",
  "jwks_uri": "http://localhost:8080/realms/secure-test/protocol/openid-connect/certs",
  ...
}
```

### Verify JWKS Endpoint

Check the JSON Web Key Set:

```bash
curl http://localhost:8080/realms/secure-test/protocol/openid-connect/certs | jq
```

You should see public keys used for JWT signature verification.

!!! note "Testing with Users"
    To test token generation, you'll need to create users first. See the [User Management](user-management.md) guide for creating test users.

## Export Realm Configuration

=== "Admin Console"

    1. **Go to "Realm settings"**
    2. **Click "Action" → "Partial export"**
    3. **Select what to export**:
        - ✓ Export groups and roles
        - ✓ Export clients
        - ✗ Export users (for security)
    4. **Click "Export"**

    Download: `secure-test-realm.json`

=== "CLI"

    ```bash
    # Export realm
