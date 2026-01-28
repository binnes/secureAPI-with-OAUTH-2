package com.example.api.exception;

import java.time.Instant;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.example.api.model.ErrorResponse;

import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/**
 * Global exception mapper to handle all exceptions and return consistent error responses.
 */
@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Exception> {

    private static final Logger LOGGER = Logger.getLogger(GlobalExceptionMapper.class.getName());

    @Context
    private UriInfo uriInfo;

    @Override
    public Response toResponse(Exception exception) {
        String path = uriInfo != null ? uriInfo.getPath() : null;
        String timestamp = Instant.now().toString();

        // Handle authentication errors (401)
        if (exception instanceof NotAuthorizedException) {
            LOGGER.log(Level.WARNING, "Authentication failed for path: {0}", path);
            
            ErrorResponse errorResponse = new ErrorResponse(
                "UNAUTHORIZED",
                "Authentication required",
                timestamp,
                path
            );
            
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(errorResponse)
                .build();
        }

        // Handle authorization errors (403)
        if (exception instanceof ForbiddenException) {
            LOGGER.log(Level.WARNING, "Authorization failed for path: {0}", path);
            
            ErrorResponse errorResponse = new ErrorResponse(
                "FORBIDDEN",
                "Insufficient permissions. Required role: schedule-user",
                timestamp,
                path
            );
            
            return Response.status(Response.Status.FORBIDDEN)
                .entity(errorResponse)
                .build();
        }

        // Handle not found errors (404)
        if (exception instanceof NotFoundException) {
            LOGGER.log(Level.INFO, "Resource not found: {0}", path);
            
            ErrorResponse errorResponse = new ErrorResponse(
                "NOT_FOUND",
                "Resource not found",
                timestamp,
                path
            );
            
            return Response.status(Response.Status.NOT_FOUND)
                .entity(errorResponse)
                .build();
        }

        // Handle other WebApplicationExceptions
        if (exception instanceof WebApplicationException) {
            WebApplicationException webEx = (WebApplicationException) exception;
            int status = webEx.getResponse().getStatus();
            
            LOGGER.log(Level.WARNING, "WebApplicationException with status {0} for path: {1}", 
                new Object[]{status, path});
            
            ErrorResponse errorResponse = new ErrorResponse(
                "WEB_APPLICATION_ERROR",
                exception.getMessage() != null ? exception.getMessage() : "An error occurred",
                timestamp,
                path
            );
            
            return Response.status(status)
                .entity(errorResponse)
                .build();
        }

        // Handle all other exceptions as internal server errors (500)
        LOGGER.log(Level.SEVERE, "Unexpected error for path: " + path, exception);
        
        ErrorResponse errorResponse = new ErrorResponse(
            "INTERNAL_ERROR",
            "An unexpected error occurred",
            timestamp,
            path
        );
        
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
            .entity(errorResponse)
            .build();
    }
}

// Made with Bob
