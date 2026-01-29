/**
 * Schedule Types
 * Type definitions for schedule data from the API
 */

/**
 * A single schedule item
 */
export interface ScheduleItem {
  /** Date in ISO 8601 format (YYYY-MM-DD) */
  date: string;
  /** Time in 24-hour format (HH:mm) */
  time: string;
  /** Activity description (max 200 characters) */
  description: string;
}

/**
 * User schedule response from API
 */
export interface Schedule {
  /** Username from JWT token */
  user: string;
  /** Array of schedule items */
  schedule: ScheduleItem[];
}

/**
 * API error response
 */
export interface ApiError {
  /** Error code */
  error: string;
  /** Human-readable error message */
  message: string;
  /** Timestamp in ISO 8601 UTC format */
  timestamp: string;
  /** Request path */
  path?: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * API health check response
 */
export interface HealthResponse {
  /** Server hostname */
  hostname: string;
  /** Current server time in ISO 8601 UTC format */
  serverTime: string;
  /** API version */
  apiVersion: string;
  /** Server status */
  status: string;
}

// Made with Bob
