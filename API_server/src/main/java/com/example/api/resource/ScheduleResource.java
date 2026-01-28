package com.example.api.resource;

import java.time.Instant;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import com.example.api.model.ErrorResponse;
import com.example.api.model.Schedule;
import com.example.api.service.ScheduleService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

/**
 * Schedule endpoint - requires authentication and schedule-user role.
 */
@Path("/api/v1/schedule")
@RequestScoped
@Tag(name = "Schedule", description = "User schedule management")
public class ScheduleResource {

    private static final Logger LOGGER = Logger.getLogger(ScheduleResource.class.getName());

    @Inject
    private JsonWebToken jwt;

    @Inject
    private ScheduleService scheduleService;

    @Context
    private SecurityContext securityContext;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("schedule-user")
    @Operation(
        summary = "Get user schedule",
        description = "Retrieve the authenticated user's schedule. Requires valid JWT token and schedule-user role."
    )
    @SecurityRequirement(name = "bearerAuth")
    @APIResponses({
        @APIResponse(
            responseCode = "200",
            description = "Schedule retrieved successfully",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON,
                schema = @Schema(implementation = Schedule.class)
            )
        ),
        @APIResponse(
            responseCode = "401",
            description = "Authentication required - missing or invalid token",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON,
                schema = @Schema(implementation = ErrorResponse.class)
            )
        ),
        @APIResponse(
            responseCode = "403",
            description = "Forbidden - insufficient permissions",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON,
                schema = @Schema(implementation = ErrorResponse.class)
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
    public Response getSchedule() {
        try {
            // Extract username from JWT token
            String username = jwt.getClaim("preferred_username");
            
            if (username == null || username.isEmpty()) {
                LOGGER.log(Level.WARNING, "JWT token missing preferred_username claim");
                
                ErrorResponse errorResponse = new ErrorResponse(
                    "UNAUTHORIZED",
                    "Invalid token: missing username claim",
                    Instant.now().toString(),
                    "/api/v1/schedule"
                );
                
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(errorResponse)
                    .build();
            }

            LOGGER.log(Level.INFO, "Retrieving schedule for user: {0}", username);

            // Generate schedule for the user
            Schedule schedule = scheduleService.generateSchedule(username);

            LOGGER.log(Level.INFO, "Schedule retrieved successfully for user: {0}", username);

            return Response.ok(schedule).build();

        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error retrieving schedule", e);
            
            ErrorResponse errorResponse = new ErrorResponse(
                "INTERNAL_ERROR",
                "An unexpected error occurred",
                Instant.now().toString(),
                "/api/v1/schedule"
            );
            
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(errorResponse)
                .build();
        }
    }
}

// Made with Bob
