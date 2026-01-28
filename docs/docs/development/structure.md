# Project Structure

Overview of the Authentication Test API project organization.

## Directory Layout

```
authentication_test/
├── .github/
│   └── workflows/
│       └── docs.yml              # GitHub Actions for docs deployment
├── docs/                         # MkDocs documentation
│   ├── mkdocs.yml               # MkDocs configuration
│   ├── requirements.txt         # Python dependencies for docs
│   └── docs/                    # Documentation source files
├── API_server/                   # API Server application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/api/
│   │   │   │   ├── config/      # Configuration classes
│   │   │   │   ├── model/       # Data models
│   │   │   │   ├── resource/    # JAX-RS endpoints
│   │   │   │   ├── service/     # Business logic
│   │   │   │   └── exception/   # Exception handlers
│   │   │   ├── resources/
│   │   │   │   └── META-INF/
│   │   │   │       └── microprofile-config.properties
│   │   │   └── liberty/
│   │   │       └── config/
│   │   │           └── server.xml   # OpenLiberty configuration
│   │   └── test/
│   │       └── java/            # Test classes
│   ├── pom.xml                  # Maven configuration
│   ├── Containerfile            # Container build file
│   └── spec.md                  # API specification
└── README.md                    # Project README
```

## Key Components

### Configuration (`config/`)
- `ApiApplication.java` - JAX-RS application and OpenAPI config

### Models (`model/`)
- `Schedule.java` - User schedule response
- `ScheduleItem.java` - Individual schedule entry
- `HelloResponse.java` - Health check response
- `ErrorResponse.java` - Standard error format

### Resources (`resource/`)
- `HelloResource.java` - Health check endpoint
- `ScheduleResource.java` - Schedule endpoint (secured)

### Services (`service/`)
- `ScheduleService.java` - Schedule generation logic

### Exception Handling (`exception/`)
- `GlobalExceptionMapper.java` - Centralized error handling

## Next Steps

- [Contributing Guide](contributing.md)
- [Building with Maven](../build/maven.md)
