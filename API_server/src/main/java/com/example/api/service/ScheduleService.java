package com.example.api.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.example.api.model.Schedule;
import com.example.api.model.ScheduleItem;

import jakarta.enterprise.context.ApplicationScoped;

/**
 * Service for generating and managing user schedules.
 * Generates random test data for demonstration purposes.
 */
@ApplicationScoped
public class ScheduleService {

    private static final Logger LOGGER = Logger.getLogger(ScheduleService.class.getName());
    
    private static final String[] DESCRIPTIONS = {
        "Team standup meeting",
        "Code review session",
        "Sprint planning",
        "Client presentation",
        "Technical discussion",
        "Project retrospective",
        "One-on-one meeting",
        "Training session"
    };

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    
    private final Random random = new Random();

    /**
     * Generate a schedule for the given user.
     * Creates 5-10 random schedule items within the next 7 days during business hours (08:00-18:00).
     *
     * @param username the username to generate schedule for
     * @return Schedule object containing user's schedule items
     */
    public Schedule generateSchedule(String username) {
        LOGGER.log(Level.INFO, "Generating schedule for user: {0}", username);
        
        int itemCount = 5 + random.nextInt(6); // 5-10 items
        List<ScheduleItem> items = new ArrayList<>();
        
        LocalDate today = LocalDate.now();
        
        for (int i = 0; i < itemCount; i++) {
            // Random date within next 7 days
            int daysToAdd = random.nextInt(8); // 0-7 days
            LocalDate scheduleDate = today.plusDays(daysToAdd);
            
            // Random time between 08:00 and 18:00 (business hours)
            int hour = 8 + random.nextInt(11); // 8-18
            int minute = random.nextInt(2) * 30; // 0 or 30 minutes
            LocalTime scheduleTime = LocalTime.of(hour, minute);
            
            // Random description
            String description = DESCRIPTIONS[random.nextInt(DESCRIPTIONS.length)];
            
            ScheduleItem item = new ScheduleItem(
                scheduleDate.format(DATE_FORMATTER),
                scheduleTime.format(TIME_FORMATTER),
                description
            );
            
            items.add(item);
        }
        
        // Sort items by date and time
        items.sort((a, b) -> {
            int dateCompare = a.getDate().compareTo(b.getDate());
            if (dateCompare != 0) {
                return dateCompare;
            }
            return a.getTime().compareTo(b.getTime());
        });
        
        LOGGER.log(Level.INFO, "Generated {0} schedule items for user: {1}", 
            new Object[]{items.size(), username});
        
        return new Schedule(username, items);
    }
}

// Made with Bob
