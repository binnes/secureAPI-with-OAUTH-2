package com.example.api.model;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Response model for the hello endpoint.
 */
@Schema(description = "Health check response")
public class HelloResponse {

    @Schema(description = "Server hostname", example = "server-hostname.local", required = true)
    private String hostname;

    @Schema(description = "Current server time in ISO 8601 UTC format", example = "2026-01-27T16:47:00Z", required = true)
    private String serverTime;

    @Schema(description = "API version", example = "1.0.0", required = true)
    private String apiVersion;

    @Schema(description = "Server status", example = "healthy", required = true)
    private String status;

    public HelloResponse() {
    }

    public HelloResponse(String hostname, String serverTime, String apiVersion, String status) {
        this.hostname = hostname;
        this.serverTime = serverTime;
        this.apiVersion = apiVersion;
        this.status = status;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public String getServerTime() {
        return serverTime;
    }

    public void setServerTime(String serverTime) {
        this.serverTime = serverTime;
    }

    public String getApiVersion() {
        return apiVersion;
    }

    public void setApiVersion(String apiVersion) {
        this.apiVersion = apiVersion;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

// Made with Bob
