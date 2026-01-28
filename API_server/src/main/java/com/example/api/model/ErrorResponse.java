package com.example.api.model;

import java.util.Map;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Standard error response model for all API errors.
 */
@Schema(description = "Standard error response")
public class ErrorResponse {

    @Schema(description = "Error code", example = "UNAUTHORIZED", required = true)
    private String error;

    @Schema(description = "Human-readable error message", example = "Authentication required", required = true)
    private String message;

    @Schema(description = "Timestamp in ISO 8601 UTC format", example = "2026-01-27T16:47:00Z", required = true)
    private String timestamp;

    @Schema(description = "Request path", example = "/api/v1/schedule")
    private String path;

    @Schema(description = "Additional error details")
    private Map<String, Object> details;

    public ErrorResponse() {
    }

    public ErrorResponse(String error, String message, String timestamp) {
        this.error = error;
        this.message = message;
        this.timestamp = timestamp;
    }

    public ErrorResponse(String error, String message, String timestamp, String path) {
        this.error = error;
        this.message = message;
        this.timestamp = timestamp;
        this.path = path;
    }

    public ErrorResponse(String error, String message, String timestamp, String path, Map<String, Object> details) {
        this.error = error;
        this.message = message;
        this.timestamp = timestamp;
        this.path = path;
        this.details = details;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Map<String, Object> getDetails() {
        return details;
    }

    public void setDetails(Map<String, Object> details) {
        this.details = details;
    }
}

// Made with Bob
