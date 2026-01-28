# watsonx Orchestrate Developer Edition Setup

This guide explains how to set up the IBM watsonx Orchestrate Developer Edition for local development and testing.

## What is watsonx Orchestrate?

IBM watsonx Orchestrate is an AI-powered automation platform that enables you to:

- Build and deploy AI agents
- Create custom tools and skills
- Orchestrate complex workflows
- Integrate with external APIs and services

## Prerequisites

- **Operating System**: macOS, Windows, or Linux
- **Python**: 3.8 or higher
- **Package Manager**:
  - Homebrew (macOS)
  - Chocolatey or Scoop (Windows)
  - apt/yum (Linux)
- **IBM Cloud account** with watsonx access
- **watsonx Orchestrate entitlement key**

## Installation Options

=== "macOS (Lima)"

    Lima provides a lightweight VM environment for running watsonx Orchestrate on macOS.

    **Step 1: Install Lima**

    ```bash
    # Install Lima using Homebrew
    brew install lima
    ```

    **Step 2: Verify Installation**

    ```bash
    # Check Lima version
    lima --version
    ```

=== "Windows (WSL2)"

    Windows Subsystem for Linux 2 (WSL2) provides a Linux environment on Windows.

    **Step 1: Install WSL2**

    Open PowerShell as Administrator:

    ```powershell
    # Install WSL2
    wsl --install
    ```

    **Step 2: Install Ubuntu**

    ```powershell
    # Install Ubuntu distribution
    wsl --install -d Ubuntu
    ```

    **Step 3: Set WSL2 as Default**

    ```powershell
    wsl --set-default-version 2
    ```

    **Step 4: Launch Ubuntu**

    ```powershell
    # Start Ubuntu
    wsl
    ```

    Continue with the Linux setup instructions within WSL2.

=== "Windows (Docker Desktop)"

    Docker Desktop provides container support on Windows.

    **Step 1: Install Docker Desktop**

    1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
    2. Run the installer
    3. Enable WSL2 backend during installation
    4. Restart your computer

    **Step 2: Verify Installation**

    ```powershell
    # Check Docker version
    docker --version
    ```

=== "Docker (All Platforms)"

    For Docker-based installation on any platform, refer to the [official watsonx Orchestrate documentation](https://www.ibm.com/docs/en/watsonx/watson-orchestrate).

=== "Native Linux"

    For native Linux installation, refer to the [official watsonx Orchestrate documentation](https://www.ibm.com/docs/en/watsonx/watson-orchestrate).

## Configuration

### Step 1: Create Project Directory

Navigate to the orchestrate directory in your project:

```bash
cd orchestrate
```

### Step 2: Set Up Python Environment

Create and activate a virtual environment:

=== "macOS/Linux"

    ```bash
    # Create virtual environment
    python3 -m venv .venv

    # Activate virtual environment
    source .venv/bin/activate
    ```

=== "Windows (PowerShell)"

    ```powershell
    # Create virtual environment
    python -m venv .venv

    # Activate virtual environment
    .\.venv\Scripts\Activate.ps1
    ```

=== "Windows (Command Prompt)"

    ```cmd
    # Create virtual environment
    python -m venv .venv

    # Activate virtual environment
    .venv\Scripts\activate.bat
    ```

### Step 3: Install Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

The `requirements.txt` includes:

```txt
ibm-watsonx-orchestrate==2.2.0
```

### Step 4: Configure Environment Variables

Create or update the `.env` file with your credentials:

=== "macOS/Linux"

    Create `.env` file:

    ```bash
    cat > .env << EOF
    # watsonx API Configuration
    WATSONX_APIKEY=your_watsonx_api_key_here
    WATSONX_SPACE_ID=your_space_id_here

    # watsonx Orchestrate Configuration
    WO_ENTITLEMENT_KEY=your_entitlement_key_here
    WO_DEVELOPER_EDITION_SOURCE=myibm
    EOF
    ```

=== "Windows (PowerShell)"

    Create `.env` file:

    ```powershell
    @"
    # watsonx API Configuration
    WATSONX_APIKEY=your_watsonx_api_key_here
    WATSONX_SPACE_ID=your_space_id_here

    # watsonx Orchestrate Configuration
    WO_ENTITLEMENT_KEY=your_entitlement_key_here
    WO_DEVELOPER_EDITION_SOURCE=myibm
    "@ | Out-File -FilePath .env -Encoding UTF8
    ```

=== "Windows (Command Prompt)"

    Create `.env` file manually using Notepad:

    ```cmd
    notepad .env
    ```

    Add the following content:

    ```
    # watsonx API Configuration
    WATSONX_APIKEY=your_watsonx_api_key_here
    WATSONX_SPACE_ID=your_space_id_here

    # watsonx Orchestrate Configuration
    WO_ENTITLEMENT_KEY=your_entitlement_key_here
    WO_DEVELOPER_EDITION_SOURCE=myibm
    ```

!!! warning "Security"
    Never commit the `.env` file to version control. It contains sensitive credentials.

#### Getting Your Credentials

**watsonx API Key:**

1. Log in to [IBM Cloud](https://cloud.ibm.com)
2. Navigate to "Manage" → "Access (IAM)"
3. Select "API keys"
4. Click "Create an IBM Cloud API key"
5. Copy the API key

**watsonx Space ID:**

1. Log in to [watsonx.ai](https://watsonx.ai)
2. Navigate to your deployment space
3. Copy the Space ID from the URL or space settings

**Orchestrate Entitlement Key:**

1. Log in to [IBM Marketplace](https://myibm.ibm.com)
2. Navigate to your watsonx Orchestrate entitlement
3. Copy the entitlement key

### Step 5: Verify Configuration

Check that your environment is properly configured:

=== "macOS/Linux"

    ```bash
    # Load environment variables
    source .env

    # Verify variables are set
    echo $WATSONX_APIKEY
    echo $WATSONX_SPACE_ID
    echo $WO_ENTITLEMENT_KEY
    ```

=== "Windows (PowerShell)"

    ```powershell
    # Load environment variables
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
        }
    }

    # Verify variables are set
    $env:WATSONX_APIKEY
    $env:WATSONX_SPACE_ID
    $env:WO_ENTITLEMENT_KEY
    ```

=== "Windows (Command Prompt)"

    ```cmd
    # Load environment variables from .env file
    for /f "tokens=1,2 delims==" %%a in (.env) do set %%a=%%b

    # Verify variables are set
    echo %WATSONX_APIKEY%
    echo %WATSONX_SPACE_ID%
    echo %WO_ENTITLEMENT_KEY%
    ```

## Starting watsonx Orchestrate

### Start the Server

Start the watsonx Orchestrate Developer Edition server:

=== "macOS/Linux"

    ```bash
    # Ensure you're in the orchestrate directory
    cd orchestrate

    # Activate virtual environment
    source .venv/bin/activate

    # Start watsonx Orchestrate server
    orchestrate server start -e .env
    ```

=== "Windows (PowerShell)"

    ```powershell
    # Ensure you're in the orchestrate directory
    cd orchestrate

    # Activate virtual environment
    .\.venv\Scripts\Activate.ps1

    # Start watsonx Orchestrate server
    orchestrate server start -e .env
    ```

=== "Windows (Command Prompt)"

    ```cmd
    # Ensure you're in the orchestrate directory
    cd orchestrate

    # Activate virtual environment
    .venv\Scripts\activate.bat

    # Start watsonx Orchestrate server
    orchestrate server start -e .env
    ```

### Optional Features

Enable additional features when starting the server:

```bash
# Enable Langfuse for observability
orchestrate server start -e .env --with-langfuse

# Enable document processing
orchestrate server start -e .env --with-doc-processing

# Enable AI Builder
orchestrate server start -e .env --with-ai-builder

# Enable voice support
orchestrate server start -e .env --with-voice

# Enable multiple features
orchestrate server start -e .env --with-langfuse --with-ai-builder --with-doc-processing
```

### Access the Services

Once started, the following services are available:

- **API Base URL**: `http://localhost:4321/api/v1`
- **OpenAPI Docs**: `http://localhost:4321/docs`
- **UI**: `http://localhost:3000` (requires separate start command)

### Start the UI

The UI is not started automatically. To start it:

```bash
orchestrate chat start
```

## Managing the Server

### Stop the Server

```bash
orchestrate server stop
```

### Reset the Server

Reset the environment (removes containers and clears data):

```bash
orchestrate server reset
```

### View Logs

```bash
orchestrate server logs
```

### Check Server Status

```bash
orchestrate server status
```

## Project Structure

```
orchestrate/
├── .env                 # Environment variables (not in git)
├── .venv/              # Python virtual environment
└── requirements.txt    # Python dependencies
```

## Troubleshooting

### Port Already in Use

If port 8080 is already in use:

```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

### Environment Variables Not Loading

Ensure you're loading the `.env` file correctly:

=== "macOS/Linux"

    ```bash
    # Load environment variables
    set -a
    source .env
    set +a
    ```

=== "Windows (PowerShell)"

    ```powershell
    # Load environment variables
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
        }
    }
    ```

=== "Windows (Command Prompt)"

    ```cmd
    # Load environment variables
    for /f "tokens=1,2 delims==" %%a in (.env) do set %%a=%%b
    ```

### Lima VM Issues

If using Lima and experiencing issues:

```bash
# Stop Lima VM
limactl stop default

# Start Lima VM
limactl start default

# Check Lima status
limactl list
```

### Python Package Issues

If you encounter package installation issues:

```bash
# Upgrade pip
pip install --upgrade pip

# Reinstall requirements
pip install --force-reinstall -r requirements.txt
```

## Next Steps

- [Creating Agents](agents.md) - Build your first AI agent
- [Adding Tools](tools.md) - Extend functionality with custom tools
- [API Integration](api-integration.md) - Connect to external APIs

## Additional Resources

- [watsonx Orchestrate Documentation](https://www.ibm.com/docs/en/watsonx/watson-orchestrate)
- [watsonx Orchestrate Developer Guide](https://developer.watson-orchestrate.ibm.com)
- [IBM watsonx Platform](https://www.ibm.com/watsonx)