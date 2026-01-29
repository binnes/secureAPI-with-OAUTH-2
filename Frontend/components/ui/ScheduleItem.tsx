/**
 * ScheduleItem Component
 * Displays a single schedule item with date, time, and description
 */

import { ScheduleItemProps } from "@/types";

export default function ScheduleItem({ item }: ScheduleItemProps) {
  // Format date for display (e.g., "Jan 28, 2026")
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time for display (e.g., "9:00 AM")
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="flex items-start gap-4 p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0 w-24 text-sm">
        <div className="font-semibold text-gray-900">{formatDate(item.date)}</div>
        <div className="text-gray-600">{formatTime(item.time)}</div>
      </div>
      <div className="flex-1">
        <p className="text-gray-800">{item.description}</p>
      </div>
    </div>
  );
}

// Made with Bob
