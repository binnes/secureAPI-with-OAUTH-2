# Authentication Test API

Welcome to the Authentication Test API documentation. This is a RESTful API server providing user schedule management with OAuth 2.0 authentication via Keycloak.

## Overview

The Authentication Test API is a production-ready Java application built with:

- **Java 21** - Modern Java features and performance
- **OpenLiberty 24.0.0.1** - Lightweight, cloud-native application server
- **Jakarta EE 10** - Enterprise Java standards
- **MicroProfile 6.1** - Microservices-optimized APIs
- **Keycloak OAuth 2.0** - Industry-standard authentication

## Key Features

✅ **Health Check Endpoint** - Public endpoint for monitoring server status  
✅ **Secured Schedule API** - JWT-protected user schedule management  
✅ **Role-Based Access Control** - Fine-grained authorization with Keycloak roles  
✅ **OpenAPI 3.0 Documentation** - Interactive API documentation with Swagger UI  
✅ **Comprehensive Error Handling** - Consistent error responses across all endpoints  
✅ **Container Support** - Ready for deployment with Podman or Docker  
✅ **Production Ready** - Logging, monitoring, and security best practices

## Quick Links

- [Quick Start Guide](getting-started/quick-start.md) - Get up and running in minutes
- [Building with Maven](build/maven.md) - Build and package the application
- [Keycloak Setup](keycloak/realm-setup.md) - Configure authentication
- [SSL Certificates](config/ssl-certificates.md) - Configure self-signed certificates
- [Groups Mapper](keycloak/groups-mapper.md) - Configure role-based authorization
- [API Reference](api/endpoints.md) - Complete API documentation
- [OpenAPI Export](api/openapi.md#exporting-the-openapi-specification) - Export spec for Orchestrate
- [watsonx Orchestrate Setup](orchestrate/installation.md) - Set up IBM watsonx Orchestrate
- [Troubleshooting](troubleshooting/common-issues.md) - Solutions to common problems

## Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Client    │────────▶│  Authentication  │────────▶│  Keycloak   │
│ Application │         │    Test API      │         │   Server    │
└─────────────┘         └──────────────────┘         └─────────────┘
                               │
                               │ JWT Validation
                               │
                        ┌──────▼──────┐
                        │  Schedule   │
                        │   Service   │
                        └─────────────┘
```

## API Endpoints

### Public Endpoints

- `GET /api/v1/hello` - Health check and server information

### Protected Endpoints

- `GET /api/v1/schedule` - Retrieve user schedule (requires JWT token and `schedule-user` role)

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Language | Java | 21+ |
| Application Server | OpenLiberty | 24.0.0.1 |
| Framework | Jakarta EE | 10 |
| Microservices | MicroProfile | 6.1 |
| Build Tool | Maven | 3.9+ |
| Authentication | Keycloak | Latest |
| Container Runtime | Podman/Docker | Latest |

## Getting Started

To get started with the Authentication Test API:

1. **[Check Prerequisites](getting-started/prerequisites.md)** - Ensure you have the required tools
2. **[Build the Application](build/maven.md)** - Compile and package the API
3. **[Configure SSL Certificates](config/ssl-certificates.md)** - Setup trust for self-signed certificates (if needed)
4. **[Setup Keycloak](keycloak/realm-setup.md)** - Configure authentication server
   - [Realm Configuration](keycloak/realm-setup.md)
   - [Client Configuration](keycloak/client-setup.md)
   - [User Management](keycloak/user-management.md)
   - [Groups Claim Mapper](keycloak/groups-mapper.md)
5. **[Run the Server](build/running.md)** - Start the API server
6. **[Test the API](api/endpoints.md)** - Make your first API calls

## Support

For issues, questions, or contributions:

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/authentication_test/issues)
- 📖 Documentation: This site

## License

This project is licensed under the Apache License 2.0. See the LICENSE file for details.