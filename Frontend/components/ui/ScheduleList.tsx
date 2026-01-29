/**
 * ScheduleList Component
 * Displays a list of schedule items with loading and empty states
 */

import { ScheduleListProps } from "@/types";
import ScheduleItem from "./ScheduleItem";
import Spinner from "./Spinner";

export default function ScheduleList({
  items,
  loading = false,
  error,
}: ScheduleListProps) {
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 font-semibold mb-2">Error Loading Schedule</div>
        <p className="text-gray-600 text-sm">{error}</p>
      </div>
    );
  }

  // Empty state
  if (!items || items.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No schedule items found.</p>
      </div>
    );
  }

  // List of schedule items
  return (
    <div className="divide-y divide-gray-200">
      {items.map((item, index) => (
        <ScheduleItem key={`${item.date}-${item.time}-${index}`} item={item} />
      ))}
    </div>
  );
}

// Made with Bob
