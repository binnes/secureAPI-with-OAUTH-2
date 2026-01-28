# Containerization

Learn how to build and run the Authentication Test API in containers using Podman or Docker.

## Overview

The project includes a `Containerfile` in the `API_server/` directory (compatible with both Podman and Docker) that creates a production-ready container image.

## Container Image Details

- **Base Image**: OpenLiberty 24.0.0.1 with Java 21
- **Multi-stage Build**: Optimized for size and security
- **Non-root User**: Runs as user 1001 for security
- **Exposed Ports**: 9080 (HTTP), 9443 (HTTPS)

## Building Container Images

=== "Podman (Recommended)"

    Podman is a daemonless container engine that's compatible with Docker.

    **Build Image:**

    ```bash
    cd API_server
    podman build -t authentication-test-api:1.0.0 .
    ```

    **Build with Custom Tag:**

    ```bash
    cd API_server
    podman build -t authentication-test-api:latest .
    ```

    **Build with No Cache:**

    Force rebuild without using cache:

    ```bash
    cd API_server
    podman build --no-cache -t authentication-test-api:1.0.0 .
    ```

=== "Docker"

    **Build Image:**

    ```bash
    cd API_server
    docker build -t authentication-test-api:1.0.0 .
    ```

    **Build with Build Args:**

    Pass build-time variables:

    ```bash
    cd API_server
    docker build \
      --build-arg LIBERTY_VERSION=24.0.0.1 \
      -t authentication-test-api:1.0.0 .
    ```

## Running Containers

### Basic Run

=== "Podman"
    ```bash
    podman run -d \
      --name auth-api \
      -p 9080:9080 \
      -p 9443:9443 \
      authentication-test-api:1.0.0
    ```

=== "Docker"
    ```bash
    docker run -d \
      --name auth-api \
      -p 9080:9080 \
      -p 9443:9443 \
      authentication-test-api:1.0.0
    ```

### Run with Environment Variables

Configure the application using environment variables:

=== "Podman"
    ```bash
    podman run -d \
      --name auth-api \
      -p 9080:9080 \
      -p 9443:9443 \
      -e JWT_JWKS_URI=https://keycloak.lab.home/realms/secure-test/protocol/openid-connect/certs \
      -e JWT_ISSUER=https://keycloak.lab.home/realms/secure-test \
      -e LOG_LEVEL=DEBUG \
      -e CORS_ALLOWED_ORIGINS=http://localhost:3000 \
      authentication-test-api:1.0.0
    ```

=== "Docker"
    ```bash
    docker run -d \
      --name auth-api \
      -p 9080:9080 \
      -p 9443:9443 \
      -e JWT_JWKS_URI=https://keycloak.lab.home/realms/secure-test/protocol/openid-connect/certs \
      -e JWT_ISSUER=https://keycloak.lab.home/realms/secure-test \
      -e LOG_LEVEL=DEBUG \
      -e CORS_ALLOWED_ORIGINS=http://localhost:3000 \
      authentication-test-api:1.0.0
    ```

### Run with Environment File

Create an environment file:

```bash
# env.list
JWT_JWKS_URI=https://keycloak.lab.home/realms/secure-test/protocol/openid-connect/certs
JWT_ISSUER=https://keycloak.lab.home/realms/secure-test
LOG_LEVEL=INFO
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://app.lab.home
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Authorization,Content-Type
```

Run with environment file:

=== "Podman"
    ```bash
    podman run -d \
      --name auth-api \
      -p 9080:9080 \
      --env-file env.list \
      authentication-test-api:1.0.0
    ```

=== "Docker"
    ```bash
    docker run -d \
      --name auth-api \
      -p 9080:9080 \
      --env-file env.list \
      authentication-test-api:1.0.0
    ```

### Run in Foreground

Run with logs visible (useful for debugging):

=== "Podman"
    ```bash
    podman run --rm \
      --name auth-api \
      -p 9080:9080 \
      authentication-test-api:1.0.0
    ```

=== "Docker"
    ```bash
    docker run --rm \
      --name auth-api \
      -p 9080:9080 \
      authentication-test-api:1.0.0
    ```

Press `Ctrl+C` to stop.

## Container Management

### List Running Containers

=== "Podman"
    ```bash
    podman ps
    ```

=== "Docker"
    ```bash
    docker ps
    ```

### List All Containers

=== "Podman"
    ```bash
    podman ps -a
    ```

=== "Docker"
    ```bash
    docker ps -a
    ```

### View Container Logs

=== "Podman"
    ```bash
    podman logs auth-api
    
    # Follow logs
    podman logs -f auth-api
    
    # Last 100 lines
    podman logs --tail 100 auth-api
    ```

=== "Docker"
    ```bash
    docker logs auth-api
    
    # Follow logs
    docker logs -f auth-api
    
    # Last 100 lines
    docker logs --tail 100 auth-api
    ```

### Stop Container

=== "Podman"
    ```bash
    podman stop auth-api
    ```

=== "Docker"
    ```bash
    docker stop auth-api
    ```

### Start Stopped Container

=== "Podman"
    ```bash
    podman start auth-api
    ```

=== "Docker"
    ```bash
    docker start auth-api
    ```

### Restart Container

=== "Podman"
    ```bash
    podman restart auth-api
    ```

=== "Docker"
    ```bash
    docker restart auth-api
    ```

### Remove Container

=== "Podman"
    ```bash
    podman rm auth-api
    
    # Force remove running container
    podman rm -f auth-api
    ```

=== "Docker"
    ```bash
    docker rm auth-api
    
    # Force remove running container
    docker rm -f auth-api
    ```

### Execute Commands in Container

=== "Podman"
    ```bash
    # Open shell
    podman exec -it auth-api /bin/bash
    
    # Run single command
    podman exec auth-api ls -la /config/apps
    ```

=== "Docker"
    ```bash
    # Open shell
    docker exec -it auth-api /bin/bash
    
    # Run single command
    docker exec auth-api ls -la /config/apps
    ```

## Image Management

### List Images

=== "Podman"
    ```bash
    podman images
    ```

=== "Docker"
    ```bash
    docker images
    ```

### Inspect Image

=== "Podman"
    ```bash
    podman inspect authentication-test-api:1.0.0
    ```

=== "Docker"
    ```bash
    docker inspect authentication-test-api:1.0.0
    ```

### Remove Image

=== "Podman"
    ```bash
    podman rmi authentication-test-api:1.0.0
    ```

=== "Docker"
    ```bash
    docker rmi authentication-test-api:1.0.0
    ```

### Tag Image

=== "Podman"
    ```bash
    podman tag authentication-test-api:1.0.0 authentication-test-api:latest
    ```

=== "Docker"
    ```bash
    docker tag authentication-test-api:1.0.0 authentication-test-api:latest
    ```

### Save Image to File

=== "Podman"
    ```bash
    podman save -o auth-api.tar authentication-test-api:1.0.0
    ```

=== "Docker"
    ```bash
    docker save -o auth-api.tar authentication-test-api:1.0.0
    ```

### Load Image from File

=== "Podman"
    ```bash
    podman load -i auth-api.tar
    ```

=== "Docker"
    ```bash
    docker load -i auth-api.tar
    ```

## Container Networking

### Connect to Keycloak Container

If running Keycloak in a container, create a network:

=== "Podman"
    ```bash
    # Create network
    podman network create auth-network
    
    # Run Keycloak
    podman run -d \
      --name keycloak \
      --network auth-network \
      -p 8080:8080 \
      -e KEYCLOAK_ADMIN=admin \
      -e KEYCLOAK_ADMIN_PASSWORD=admin \
      quay.io/keycloak/keycloak:latest start-dev
    
    # Run API
    podman run -d \
      --name auth-api \
      --network auth-network \
      -p 9080:9080 \
      -e JWT_JWKS_URI=http://keycloak:8080/realms/secure-test/protocol/openid-connect/certs \
      -e JWT_ISSUER=http://keycloak:8080/realms/secure-test \
      authentication-test-api:1.0.0
    ```

=== "Docker"
    ```bash
    # Create network
    docker network create auth-network
    
    # Run Keycloak
    docker run -d \
      --name keycloak \
      --network auth-network \
      -p 8080:8080 \
      -e KEYCLOAK_ADMIN=admin \
      -e KEYCLOAK_ADMIN_PASSWORD=admin \
      quay.io/keycloak/keycloak:latest start-dev
    
    # Run API
    docker run -d \
      --name auth-api \
      --network auth-network \
      -p 9080:9080 \
      -e JWT_JWKS_URI=http://keycloak:8080/realms/secure-test/protocol/openid-connect/certs \
      -e JWT_ISSUER=http://keycloak:8080/realms/secure-test \
      authentication-test-api:1.0.0
    ```

## Health Checks

### Container Health Check

Add health check to container:

=== "Podman"
    ```bash
    podman run -d \
      --name auth-api \
      -p 9080:9080 \
      --health-cmd "curl -f http://localhost:9080/api/v1/hello || exit 1" \
      --health-interval 30s \
      --health-timeout 10s \
      --health-retries 3 \
      authentication-test-api:1.0.0
    ```

=== "Docker"
    ```bash
    docker run -d \
      --name auth-api \
      -p 9080:9080 \
      --health-cmd "curl -f http://localhost:9080/api/v1/hello || exit 1" \
      --health-interval 30s \
      --health-timeout 10s \
      --health-retries 3 \
      authentication-test-api:1.0.0
    ```

### Check Container Health

=== "Podman"
    ```bash
    podman inspect --format='{{.State.Health.Status}}' auth-api
    ```

=== "Docker"
    ```bash
    docker inspect --format='{{.State.Health.Status}}' auth-api
    ```

## Volume Mounts

### Mount Configuration

Mount custom configuration:

=== "Podman"
    ```bash
    podman run -d \
      --name auth-api \
      -p 9080:9080 \
      -v ./custom-config:/config/configDropins/overrides:Z \
      authentication-test-api:1.0.0
    ```

=== "Docker"
    ```bash
    docker run -d \
      --name auth-api \
      -p 9080:9080 \
      -v ./custom-config:/config/configDropins/overrides \
      authentication-test-api:1.0.0
    ```

### Mount Logs

Persist logs outside container:

=== "Podman"
    ```bash
    podman run -d \
      --name auth-api \
      -p 9080:9080 \
      -v ./logs:/logs:Z \
      authentication-test-api:1.0.0
    ```

=== "Docker"
    ```bash
    docker run -d \
      --name auth-api \
      -p 9080:9080 \
      -v ./logs:/logs \
      authentication-test-api:1.0.0
    ```

## Production Deployment

### Resource Limits

Set CPU and memory limits:

=== "Podman"
    ```bash
    podman run -d \
      --name auth-api \
      -p 9080:9080 \
      --memory="1g" \
      --cpus="1.0" \
      authentication-test-api:1.0.0
    ```

=== "Docker"
    ```bash
    docker run -d \
      --name auth-api \
      -p 9080:9080 \
      --memory="1g" \
      --cpus="1.0" \
      authentication-test-api:1.0.0
    ```

### Restart Policy

Auto-restart on failure:

=== "Podman"
    ```bash
    podman run -d \
      --name auth-api \
      -p 9080:9080 \
      --restart=unless-stopped \
      authentication-test-api:1.0.0
    ```

=== "Docker"
    ```bash
    docker run -d \
      --name auth-api \
      -p 9080:9080 \
      --restart=unless-stopped \
      authentication-test-api:1.0.0
    ```

## Troubleshooting

### Container Won't Start

Check logs:

=== "Podman"
    ```bash
    podman logs auth-api
    ```

=== "Docker"
    ```bash
    docker logs auth-api
    ```

### Port Already in Use

Find and stop conflicting container:

=== "Podman"
    ```bash
    podman ps | grep 9080
    podman stop <container-id>
    ```

=== "Docker"
    ```bash
    docker ps | grep 9080
    docker stop <container-id>
    ```

### Image Build Fails

Build with verbose output:

=== "Podman"
    ```bash
    cd API_server
    podman build --no-cache --progress=plain -t authentication-test-api:1.0.0 .
    ```

=== "Docker"
    ```bash
    cd API_server
    docker build --no-cache --progress=plain -t authentication-test-api:1.0.0 .
    ```

## Next Steps

- [Running the Server](running.md) - Deploy and run the application
- [Configuration](../config/environment.md) - Configure environment variables
- [Keycloak Setup](../keycloak/installation.md) - Setup authentication server

## Additional Resources

- [Podman Documentation](https://docs.podman.io/)
- [Docker Documentation](https://docs.docker.com/)
- [OpenLiberty Container Images](https://openliberty.io/docs/latest/container-images.html)