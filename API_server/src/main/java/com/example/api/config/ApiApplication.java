package com.example.api.config;

import org.eclipse.microprofile.auth.LoginConfig;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.enums.SecuritySchemeType;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.info.License;
import org.eclipse.microprofile.openapi.annotations.security.SecurityScheme;
import org.eclipse.microprofile.openapi.annotations.servers.Server;

import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;

/**
 * JAX-RS Application configuration with OpenAPI and security definitions.
 */
@ApplicationPath("/")
@LoginConfig(authMethod = "MP-JWT")
@OpenAPIDefinition(
    info = @Info(
        title = "Authentication Test API",
        version = "1.0.0",
        description = "RESTful API server providing user schedule management with OAuth 2.0 authentication via Keycloak",
        license = @License(
            name = "Apache 2.0",
            url = "https://www.apache.org/licenses/LICENSE-2.0.html"
        )
    ),
    servers = {
        @Server(url = "http://localhost:9080", description = "Development server"),
        @Server(url = "https://localhost:9443", description = "Development server (HTTPS)")
    }
)
@SecurityScheme(
    securitySchemeName = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "JWT Bearer token authentication. Obtain token from Keycloak: https://keycloak.lab.home/realms/secure-test"
)
public class ApiApplication extends Application {
    // JAX-RS will automatically discover and register all @Path annotated classes
}

// Made with Bob
