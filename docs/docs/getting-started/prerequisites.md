# Prerequisites

Before you begin, ensure you have the following tools and software installed on your system.

## Required Software

### Java Development Kit (JDK) 21+

The application requires Java 21 or later.

=== "macOS"
    ```bash
    # Using Homebrew
    brew install openjdk@21
    
    # Verify installation
    java -version
    ```

=== "Linux"
    ```bash
    # Ubuntu/Debian
    sudo apt update
    sudo apt install openjdk-21-jdk
    
    # RHEL/Fedora
    sudo dnf install java-21-openjdk-devel
    
    # Verify installation
    java -version
    ```

=== "Windows"
    Download and install from [Adoptium](https://adoptium.net/) or [Oracle](https://www.oracle.com/java/technologies/downloads/)
    
    Verify installation in PowerShell:
    ```powershell
    java -version
    ```

### Apache Maven 3.9+

Maven is required for building the application.

=== "macOS"
    ```bash
    # Using Homebrew
    brew install maven
    
    # Verify installation
    mvn -version
    ```

=== "Linux"
    ```bash
    # Ubuntu/Debian
    sudo apt update
    sudo apt install maven
    
    # RHEL/Fedora
    sudo dnf install maven
    
    # Verify installation
    mvn -version
    ```

=== "Windows"
    Download from [Apache Maven](https://maven.apache.org/download.cgi)
    
    1. Extract to `C:\Program Files\Maven`
    2. Add `C:\Program Files\Maven\bin` to PATH
    3. Verify in PowerShell:
    ```powershell
    mvn -version
    ```

### Container Runtime (Optional)

For containerized deployment, install either Podman or Docker.

=== "Podman (Recommended)"
    **macOS:**
    ```bash
    brew install podman
    podman machine init
    podman machine start
    ```
    
    **Linux:**
    ```bash
    # Ubuntu/Debian
    sudo apt update
    sudo apt install podman
    
    # RHEL/Fedora
    sudo dnf install podman
    ```
    
    **Verify:**
    ```bash
    podman --version
    ```

=== "Docker"
    **macOS/Windows:**
    Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
    
    **Linux:**
    ```bash
    # Ubuntu/Debian
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    ```
    
    **Verify:**
    ```bash
    docker --version
    ```

### Keycloak Server

You need access to a Keycloak server for authentication.

**Option 1: Use Existing Keycloak**
- URL: `https://keycloak.lab.home`
- Admin access required for realm configuration

**Option 2: Run Keycloak Locally**

=== "Using Podman"
    ```bash
    podman run -d \
      --name keycloak \
      -p 8080:8080 \
      -e KEYCLOAK_ADMIN=admin \
      -e KEYCLOAK_ADMIN_PASSWORD=admin \
      quay.io/keycloak/keycloak:latest \
      start-dev
    ```

=== "Using Docker"
    ```bash
    docker run -d \
      --name keycloak \
      -p 8080:8080 \
      -e KEYCLOAK_ADMIN=admin \
      -e KEYCLOAK_ADMIN_PASSWORD=admin \
      quay.io/keycloak/keycloak:latest \
      start-dev
    ```

Access Keycloak at: `http://localhost:8080`

## Optional Tools

### Git

For version control and cloning the repository.

=== "macOS"
    ```bash
    brew install git
    ```

=== "Linux"
    ```bash
    # Ubuntu/Debian
    sudo apt install git
    
    # RHEL/Fedora
    sudo dnf install git
    ```

=== "Windows"
    Download from [Git for Windows](https://git-scm.com/download/win)

### curl

For testing API endpoints.

=== "macOS/Linux"
    Usually pre-installed. Verify with:
    ```bash
    curl --version
    ```

=== "Windows"
    Included in Windows 10+ or download from [curl.se](https://curl.se/windows/)

### jq

For formatting JSON responses.

=== "macOS"
    ```bash
    brew install jq
    ```

=== "Linux"
    ```bash
    # Ubuntu/Debian
    sudo apt install jq
    
    # RHEL/Fedora
    sudo dnf install jq
    ```

=== "Windows"
    Download from [stedolan.github.io/jq](https://stedolan.github.io/jq/download/)

## System Requirements

### Minimum Requirements
- **CPU:** 2 cores
- **RAM:** 2 GB
- **Disk:** 1 GB free space
- **OS:** macOS 10.15+, Linux (any modern distro), Windows 10+

### Recommended Requirements
- **CPU:** 4 cores
- **RAM:** 4 GB
- **Disk:** 5 GB free space
- **Network:** Internet connection for downloading dependencies

## Verification Checklist

Before proceeding, verify all required tools are installed:

- [ ] Java 21+ installed (`java -version`)
- [ ] Maven 3.9+ installed (`mvn -version`)
- [ ] Container runtime installed (optional) (`podman --version` or `docker --version`)
- [ ] Keycloak server accessible
- [ ] Git installed (optional) (`git --version`)
- [ ] curl installed (optional) (`curl --version`)

## Next Steps

Once all prerequisites are met:

1. [Quick Start Guide](quick-start.md) - Get the API running quickly
2. [Building with Maven](../build/maven.md) - Learn the build process
3. [Keycloak Setup](../keycloak/realm-setup.md) - Configure authentication

## Troubleshooting

### Java Version Issues

If you have multiple Java versions installed:

```bash
# Check all installed versions
/usr/libexec/java_home -V  # macOS
update-alternatives --config java  # Linux

# Set JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home -v 21)  # macOS
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk  # Linux
```

### Maven Issues

If Maven can't find Java:

```bash
# Set JAVA_HOME before running Maven
export JAVA_HOME=/path/to/java21
mvn -version
```

### Container Runtime Issues

If Podman machine won't start:

```bash
podman machine stop
podman machine rm
podman machine init
podman machine start
```

For more help, see [Troubleshooting Guide](../troubleshooting/common-issues.md).