# User Management

This guide explains how to create and manage users in Keycloak for testing the Authentication Test API.

## Prerequisites

- Keycloak installed and running
- `secure-test` realm created
- `schedule-user` role created
- `authentication-test-api` client configured

## Creating Test Users

We'll create two test users as specified in the requirements:

1. **testuser1** - User with schedule-user role
2. **testuser2** - User with schedule-user role

## Step 1: Create First User (testuser1)

### Using Admin Console

1. **Select "secure-test" realm** from dropdown
2. **Go to "Users"** in left menu
3. **Click "Create new user"**
4. **Enter User Details**:
   - **Username**: `testuser1` (required)
   - **Email**: `testuser1@example.com`
   - **Email verified**: ✓ ON
   - **First name**: `Test`
   - **Last name**: `User One`
   - **Enabled**: ✓ ON (user can login)
   - **Required user actions**: (leave empty)

5. **Click "Create"**

### Set Password

1. **Go to "Credentials" tab**
2. **Click "Set password"**
3. **Enter Password Details**:
   - **Password**: `password123`
   - **Password confirmation**: `password123`
   - **Temporary**: ✗ OFF (user won't need to change password)
4. **Click "Save"**
5. **Confirm** by clicking "Save password"

### Assign Role

1. **Go to "Role mapping" tab**
2. **Click "Assign role"**
3. **Filter by realm roles**
4. **Select "schedule-user"**
5. **Click "Assign"**

You should see `schedule-user` in the "Assigned roles" list.

### Using REST API

```bash
# Get admin token
TOKEN=$(curl -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" \
  | jq -r '.access_token')

# Create user
curl -X POST http://localhost:8080/admin/realms/secure-test/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "email": "testuser1@example.com",
    "emailVerified": true,
    "firstName": "Test",
    "lastName": "User One",
    "enabled": true,
    "credentials": [{
      "type": "password",
      "value": "password123",
      "temporary": false
    }]
  }'

# Get user ID
USER_ID=$(curl -X GET "http://localhost:8080/admin/realms/secure-test/users?username=testuser1" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.[0].id')

# Get role ID
ROLE_ID=$(curl -X GET http://localhost:8080/admin/realms/secure-test/roles/schedule-user \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.id')

# Assign role to user
curl -X POST "http://localhost:8080/admin/realms/secure-test/users/$USER_ID/role-mappings/realm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "[{
    \"id\": \"$ROLE_ID\",
    \"name\": \"schedule-user\"
  }]"
```

## Step 2: Create Second User (testuser2)

### Using Admin Console

Repeat the same process for the second user:

1. **Go to "Users" → "Create new user"**
2. **Enter User Details**:
   - **Username**: `testuser2`
   - **Email**: `testuser2@example.com`
   - **Email verified**: ✓ ON
   - **First name**: `Test`
   - **Last name**: `User Two`
   - **Enabled**: ✓ ON
3. **Click "Create"**

4. **Set Password**:
   - Password: `password123`
   - Temporary: ✗ OFF

5. **Assign Role**:
   - Assign `schedule-user` role

### Using REST API

```bash
# Create second user
curl -X POST http://localhost:8080/admin/realms/secure-test/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "testuser2@example.com",
    "emailVerified": true,
    "firstName": "Test",
    "lastName": "User Two",
    "enabled": true,
    "credentials": [{
      "type": "password",
      "value": "password123",
      "temporary": false
    }]
  }'

# Get user ID and assign role (same as testuser1)
USER_ID=$(curl -X GET "http://localhost:8080/admin/realms/secure-test/users?username=testuser2" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.[0].id')

curl -X POST "http://localhost:8080/admin/realms/secure-test/users/$USER_ID/role-mappings/realm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "[{
    \"id\": \"$ROLE_ID\",
    \"name\": \"schedule-user\"
  }]"
```

## Step 3: Verify Users

### List All Users

=== "Admin Console"
    1. Go to "Users"
    2. You should see both testuser1 and testuser2

=== "REST API"
    ```bash
    curl -X GET http://localhost:8080/admin/realms/secure-test/users \
      -H "Authorization: Bearer $TOKEN" \
      | jq '.[] | {username, email, enabled}'
    ```

### Test User Login

Test that users can authenticate:

```bash
# Test testuser1
curl -X POST http://localhost:8080/realms/secure-test/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=authentication-test-api" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=password" \
  -d "username=testuser1" \
  -d "password=password123" \
  | jq

# Test testuser2
curl -X POST http://localhost:8080/realms/secure-test/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=authentication-test-api" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=password" \
  -d "username=testuser2" \
  -d "password=password123" \
  | jq
```

Both should return access tokens.

### Verify Role Assignment

Check that users have the schedule-user role:

```bash
# Get user's roles
USER_ID=$(curl -X GET "http://localhost:8080/admin/realms/secure-test/users?username=testuser1" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.[0].id')

curl -X GET "http://localhost:8080/admin/realms/secure-test/users/$USER_ID/role-mappings/realm" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.[] | {name, description}'
```

Should show `schedule-user` role.

## User Management Operations

### Update User Information

=== "Admin Console"
    1. Go to "Users"
    2. Click on username
    3. Edit fields
    4. Click "Save"

=== "REST API"
    ```bash
    curl -X PUT "http://localhost:8080/admin/realms/secure-test/users/$USER_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "firstName": "Updated",
        "lastName": "Name"
      }'
    ```

### Reset Password

=== "Admin Console"
    1. Go to "Users" → Select user
    2. Go to "Credentials" tab
    3. Click "Reset password"
    4. Enter new password
    5. Set "Temporary" if user should change it
    6. Click "Save"

=== "REST API"
    ```bash
    curl -X PUT "http://localhost:8080/admin/realms/secure-test/users/$USER_ID/reset-password" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "password",
        "value": "newpassword123",
        "temporary": false
      }'
    ```

### Disable User

=== "Admin Console"
    1. Go to "Users" → Select user
    2. Toggle "Enabled" to OFF
    3. Click "Save"

=== "REST API"
    ```bash
    curl -X PUT "http://localhost:8080/admin/realms/secure-test/users/$USER_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "enabled": false
      }'
    ```

### Delete User

=== "Admin Console"
    1. Go to "Users" → Select user
    2. Click "Delete"
    3. Confirm deletion

=== "REST API"
    ```bash
    curl -X DELETE "http://localhost:8080/admin/realms/secure-test/users/$USER_ID" \
      -H "Authorization: Bearer $TOKEN"
    ```

## User Attributes

### Add Custom Attributes

You can add custom attributes to users:

=== "Admin Console"
    1. Go to "Users" → Select user
    2. Go to "Attributes" tab
    3. Click "Add attribute"
    4. Enter key and value
    5. Click "Save"

=== "REST API"
    ```bash
    curl -X PUT "http://localhost:8080/admin/realms/secure-test/users/$USER_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "attributes": {
          "department": ["Engineering"],
          "employee_id": ["EMP001"]
        }
      }'
    ```

## Groups (Optional)

### Create Group

1. **Go to "Groups"**
2. **Click "Create group"**
3. **Enter**:
   - **Name**: `api-users`
4. **Click "Create"**

### Assign Users to Group

1. **Go to "Users" → Select user**
2. **Go to "Groups" tab**
3. **Click "Join group"**
4. **Select "api-users"**
5. **Click "Join"**

### Assign Role to Group

1. **Go to "Groups" → Select "api-users"**
2. **Go to "Role mapping" tab**
3. **Assign "schedule-user" role**

Now all users in the group automatically get the role.

## Testing with API

### Get Token for testuser1

```bash
TOKEN1=$(curl -X POST http://localhost:8080/realms/secure-test/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=authentication-test-api" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=password" \
  -d "username=testuser1" \
  -d "password=password123" \
  | jq -r '.access_token')
```

### Call API

```bash
curl http://localhost:9080/api/v1/schedule \
  -H "Authorization: Bearer $TOKEN1" \
  | jq
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
    }
  ]
}
```

### Test with testuser2

```bash
TOKEN2=$(curl -X POST http://localhost:8080/realms/secure-test/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=authentication-test-api" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=password" \
  -d "username=testuser2" \
  -d "password=password123" \
  | jq -r '.access_token')

curl http://localhost:9080/api/v1/schedule \
  -H "Authorization: Bearer $TOKEN2" \
  | jq
```

Each user should see their own schedule.

## Bulk User Creation

### Using Script

Create multiple users with a script:

```bash
#!/bin/bash

# Get admin token
TOKEN=$(curl -s -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" \
  | jq -r '.access_token')

# Get role ID
ROLE_ID=$(curl -s -X GET http://localhost:8080/admin/realms/secure-test/roles/schedule-user \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.id')

# Create users
for i in {3..10}; do
  echo "Creating testuser$i..."
  
  # Create user
  curl -s -X POST http://localhost:8080/admin/realms/secure-test/users \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"testuser$i\",
      \"email\": \"testuser$i@example.com\",
      \"emailVerified\": true,
      \"firstName\": \"Test\",
      \"lastName\": \"User $i\",
      \"enabled\": true,
      \"credentials\": [{
        \"type\": \"password\",
        \"value\": \"password123\",
        \"temporary\": false
      }]
    }"
  
  # Get user ID
  USER_ID=$(curl -s -X GET "http://localhost:8080/admin/realms/secure-test/users?username=testuser$i" \
    -H "Authorization: Bearer $TOKEN" \
    | jq -r '.[0].id')
  
  # Assign role
  curl -s -X POST "http://localhost:8080/admin/realms/secure-test/users/$USER_ID/role-mappings/realm" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "[{
      \"id\": \"$ROLE_ID\",
      \"name\": \"schedule-user\"
    }]"
  
  echo "Created testuser$i"
done

echo "Done!"
```

## Troubleshooting

### User Can't Login

1. Check user is enabled
2. Verify password is correct
3. Check user has required role
4. Verify client configuration

### Token Missing Username

Ensure `preferred_username` mapper is enabled:

1. Go to "Client scopes" → "profile"
2. Go to "Mappers" tab
3. Verify "username" mapper exists

### Role Not in Token

1. Verify user has the role assigned
2. Check role mapper configuration in client
3. Ensure mapper adds role to access token

## Next Steps

- [API Authentication](../api/authentication.md) - Use tokens with the API
- [API Endpoints](../api/endpoints.md) - Test all API endpoints
- [Troubleshooting](../troubleshooting/common-issues.md) - Common issues

## Additional Resources

- [Keycloak User Management](https://www.keycloak.org/docs/latest/server_admin/#user-management)
- [Keycloak REST API](https://www.keycloak.org/docs-api/latest/rest-api/)