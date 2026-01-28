package com.example.api.model;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

/**
 * Represents a single schedule item with date, time, and description.
 */
@Schema(description = "A single schedule item")
public class ScheduleItem {

    @Schema(description = "Date in ISO 8601 format (YYYY-MM-DD)", example = "2026-01-28", required = true)
    private String date;

    @Schema(description = "Time in 24-hour format (HH:mm)", example = "09:00", required = true)
    private String time;

    @Schema(description = "Activity description (max 200 characters)", example = "Team standup meeting", required = true)
    private String description;

    public ScheduleItem() {
    }

    public ScheduleItem(String date, String time, String description) {
        this.date = date;
        this.time = time;
        this.description = description;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

// Made with Bob
