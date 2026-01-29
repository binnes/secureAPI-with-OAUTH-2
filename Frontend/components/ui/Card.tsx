/**
 * Card Component
 * Container component with optional title and padding
 */

import { CardProps } from "@/types";

export default function Card({
  children,
  title,
  className = "",
  padding = true,
}: CardProps) {
  return (
    <div className={`bg-dark-surface rounded-lg border border-dark-border ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-dark-border">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}
      <div className={padding ? "p-6" : ""}>
        {children}
      </div>
    </div>
  );
}

// Made with Bob
