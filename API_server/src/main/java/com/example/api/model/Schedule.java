package com.example.api.model;

import java.util.List;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Represents a user's schedule containing multiple schedule items.
 */
@Schema(description = "User schedule with list of schedule items")
public class Schedule {

    @Schema(description = "Username from JWT token", example = "john.doe", required = true)
    private String user;

    @Schema(description = "Array of schedule items", required = true)
    private List<ScheduleItem> schedule;

    public Schedule() {
    }

    public Schedule(String user, List<ScheduleItem> schedule) {
        this.user = user;
        this.schedule = schedule;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public List<ScheduleItem> getSchedule() {
        return schedule;
    }

    public void setSchedule(List<ScheduleItem> schedule) {
        this.schedule = schedule;
    }
}

// Made with Bob
