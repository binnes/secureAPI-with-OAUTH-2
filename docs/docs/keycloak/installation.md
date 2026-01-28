# Keycloak Installation

This guide covers installing and running Keycloak for the Authentication Test API.

## What is Keycloak?

Keycloak is an open-source Identity and Access Management solution that provides:

- OAuth 2.0 and OpenID Connect support
- User authentication and authorization
- Single Sign-On (SSO)
- User management
- Role-based access control

## Installation Options

=== "Container (Recommended)"

    The easiest way to run Keycloak for development and testing.

    === "Podman"
        ```bash
        podman run -d \
          --name keycloak \
          -p 8080:8080 \
          -e KEYCLOAK_ADMIN=admin \
          -e KEYCLOAK_ADMIN_PASSWORD=admin \
          quay.io/keycloak/keycloak:latest \
          start-dev
        ```

    === "Docker"
        ```bash
        docker run -d \
          --name keycloak \
          -p 8080:8080 \
          -e KEYCLOAK_ADMIN=admin \
          -e KEYCLOAK_ADMIN_PASSWORD=admin \
          quay.io/keycloak/keycloak:latest \
          start-dev
        ```

    Wait for Keycloak to start (about 30 seconds):

    ```bash
    # Check logs
    podman logs -f keycloak  # or docker logs -f keycloak
    ```

    Look for: `Keycloak 23.0.0 started`

    Access Keycloak:
    
    - **URL**: `http://localhost:8080`
    - **Admin Username**: `admin`
    - **Admin Password**: `admin`

=== "Standalone Server"

    Download and run Keycloak as a standalone server.

    **Download:**

    ```bash
    # Download Keycloak
    wget https://github.com/keycloak/keycloak/releases/download/23.0.0/keycloak-23.0.0.zip

    # Extract
    unzip keycloak-23.0.0.zip
    cd keycloak-23.0.0
    ```

    **Start Server:**

    ```bash
    # Set admin credentials
    export KEYCLOAK_ADMIN=admin
    export KEYCLOAK_ADMIN_PASSWORD=admin

    # Start in development mode
    bin/kc.sh start-dev
    ```

    Access at: `http://localhost:8080`

=== "Production with PostgreSQL"

    For production, use a proper database and HTTPS.

    === "Podman"
        ```bash
        # Create network
        podman network create keycloak-network
        
        # Start PostgreSQL
        podman run -d \
          --name postgres \
          --network keycloak-network \
          -e POSTGRES_DB=keycloak \
          -e POSTGRES_USER=keycloak \
          -e POSTGRES_PASSWORD=password \
          postgres:15
        
        # Start Keycloak
        podman run -d \
          --name keycloak \
          --network keycloak-network \
          -p 8443:8443 \
          -e KEYCLOAK_ADMIN=admin \
          -e KEYCLOAK_ADMIN_PASSWORD=admin \
          -e KC_DB=postgres \
          -e KC_DB_URL=jdbc:postgresql://postgres:5432/keycloak \
          -e KC_DB_USERNAME=keycloak \
          -e KC_DB_PASSWORD=password \
          -e KC_HOSTNAME=keycloak.example.com \
          quay.io/keycloak/keycloak:latest \
          start --optimized
        ```

    === "Docker"
        ```bash
        # Create network
        docker network create keycloak-network
        
        # Start PostgreSQL
        docker run -d \
          --name postgres \
          --network keycloak-network \
          -e POSTGRES_DB=keycloak \
          -e POSTGRES_USER=keycloak \
          -e POSTGRES_PASSWORD=password \
          postgres:15
        
        # Start Keycloak
        docker run -d \
          --name keycloak \
          --network keycloak-network \
          -p 8443:8443 \
          -e KEYCLOAK_ADMIN=admin \
          -e KEYCLOAK_ADMIN_PASSWORD=admin \
          -e KC_DB=postgres \
          -e KC_DB_URL=jdbc:postgresql://postgres:5432/keycloak \
          -e KC_DB_USERNAME=keycloak \
          -e KC_DB_PASSWORD=password \
          -e KC_HOSTNAME=keycloak.example.com \
          quay.io/keycloak/keycloak:latest \
          start --optimized
        ```

## Verifying Installation

### Check Keycloak is Running

```bash
curl http://localhost:8080
```

You should see the Keycloak welcome page HTML.

### Access Admin Console

1. Open browser: `http://localhost:8080`
2. Click "Administration Console"
3. Login with:
   - Username: `admin`
   - Password: `admin`

You should see the Keycloak admin dashboard.

## Initial Configuration

### Change Admin Password

!!! warning "Security"
    Change the default admin password immediately!

1. Click "Admin" in top-right corner
2. Select "Manage account"
3. Go to "Password" tab
4. Enter new password
5. Click "Save"

### Enable HTTPS (Production)

For production, always use HTTPS:

```bash
# Generate self-signed certificate (development only)
keytool -genkeypair -storepass password -storetype PKCS12 \
  -keyalg RSA -keysize 2048 -dname "CN=server" \
  -alias server -ext "SAN:c=DNS:localhost,IP:127.0.0.1" \
  -keystore conf/server.keystore
```

Start with HTTPS:

```bash
bin/kc.sh start-dev \
  --https-certificate-file=conf/server.crt \
  --https-certificate-key-file=conf/server.key
```

## Container Management

### Stop Keycloak

=== "Podman"
    ```bash
    podman stop keycloak
    ```

=== "Docker"
    ```bash
    docker stop keycloak
    ```

### Start Keycloak

=== "Podman"
    ```bash
    podman start keycloak
    ```

=== "Docker"
    ```bash
    docker start keycloak
    ```

### Restart Keycloak

=== "Podman"
    ```bash
    podman restart keycloak
    ```

=== "Docker"
    ```bash
    docker restart keycloak
    ```

### View Logs

=== "Podman"
    ```bash
    podman logs -f keycloak
    ```

=== "Docker"
    ```bash
    docker logs -f keycloak
    ```

### Remove Keycloak

=== "Podman"
    ```bash
    podman stop keycloak
    podman rm keycloak
    ```

=== "Docker"
    ```bash
    docker stop keycloak
    docker rm keycloak
    ```

## Persistent Data

### With Volume Mount

To persist Keycloak data across container restarts:

=== "Podman"
    ```bash
    # Create volume
    podman volume create keycloak-data
    
    # Run with volume
    podman run -d \
      --name keycloak \
      -p 8080:8080 \
      -v keycloak-data:/opt/keycloak/data:Z \
      -e KEYCLOAK_ADMIN=admin \
      -e KEYCLOAK_ADMIN_PASSWORD=admin \
      quay.io/keycloak/keycloak:latest \
      start-dev
    ```

=== "Docker"
    ```bash
    # Create volume
    docker volume create keycloak-data
    
    # Run with volume
    docker run -d \
      --name keycloak \
      -p 8080:8080 \
      -v keycloak-data:/opt/keycloak/data \
      -e KEYCLOAK_ADMIN=admin \
      -e KEYCLOAK_ADMIN_PASSWORD=admin \
      quay.io/keycloak/keycloak:latest \
      start-dev
    ```

## Troubleshooting

### Port 8080 Already in Use

Change the port:

=== "Podman"
    ```bash
    podman run -d \
      --name keycloak \
      -p 8081:8080 \
      -e KEYCLOAK_ADMIN=admin \
      -e KEYCLOAK_ADMIN_PASSWORD=admin \
      quay.io/keycloak/keycloak:latest \
      start-dev
    ```

=== "Docker"
    ```bash
    docker run -d \
      --name keycloak \
      -p 8081:8080 \
      -e KEYCLOAK_ADMIN=admin \
      -e KEYCLOAK_ADMIN_PASSWORD=admin \
      quay.io/keycloak/keycloak:latest \
      start-dev
    ```

Access at: `http://localhost:8081`

### Container Won't Start

Check logs for errors:

=== "Podman"
    ```bash
    podman logs keycloak
    ```

=== "Docker"
    ```bash
    docker logs keycloak
    ```

### Can't Access Admin Console

1. Verify Keycloak is running:
   ```bash
   curl http://localhost:8080
   ```

2. Check firewall settings

3. Try accessing from localhost only

### Database Connection Issues

If using external database, verify:

1. Database is running
2. Connection string is correct
3. Credentials are valid
4. Network connectivity

## Next Steps

Now that Keycloak is installed:

1. [Create Realm](realm-setup.md) - Setup the secure-test realm
2. [Configure Client](client-setup.md) - Setup the API client
3. [Add Users](user-management.md) - Create test users

## Additional Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Keycloak Server Installation](https://www.keycloak.org/server/installation)
- [Keycloak Container Images](https://www.keycloak.org/server/containers)