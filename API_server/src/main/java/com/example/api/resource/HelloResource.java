package com.example.api.resource;

import java.net.InetAddress;
import java.time.Instant;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import com.example.api.model.ErrorResponse;
import com.example.api.model.HelloResponse;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Health check endpoint - public access, no authentication required.
 */
@Path("/api/v1/hello")
@RequestScoped
@Tag(name = "Health Check", description = "Server health check and basic information")
public class HelloResource {

    private static final Logger LOGGER = Logger.getLogger(HelloResource.class.getName());

    @Inject
    @ConfigProperty(name = "api.version", defaultValue = "1.0.0")
    private String apiVersion;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(
        summary = "Health check endpoint",
        description = "Returns server health status and basic information. No authentication required."
    )
    @APIResponses({
        @APIResponse(
            responseCode = "200",
            description = "Server is healthy",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON,
                schema = @Schema(implementation = HelloResponse.class)
            )
        ),
        @APIResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON,
                schema = @Schema(implementation = ErrorResponse.class)
            )
        )
    })
    public Response hello() {
        try {
            String hostname = InetAddress.getLocalHost().getHostName();
            String serverTime = Instant.now().toString();
            
            HelloResponse response = new HelloResponse(
                hostname,
                serverTime,
                apiVersion,
                "healthy"
            );

            LOGGER.log(Level.INFO, "Health check successful - hostname: {0}, time: {1}", 
                new Object[]{hostname, serverTime});

            return Response.ok(response).build();

        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error in health check endpoint", e);
            
            ErrorResponse errorResponse = new ErrorResponse(
                "INTERNAL_ERROR",
                "An unexpected error occurred",
                Instant.now().toString()
            );
            
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(errorResponse)
                .build();
        }
    }
}

// Made with Bob
