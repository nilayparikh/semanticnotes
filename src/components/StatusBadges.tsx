import React from "react";

export interface StatusBadge {
  label: string;
  status: "ready" | "syncing" | "processing";
}

/**
 * Status badge component for displaying WebGPU/SQLite indicators.
 */
export function StatusBadges({ badges }: { badges: StatusBadge[] }) {
  const getStatusColor = (status: StatusBadge["status"]) => {
    switch (status) {
      case "ready":
        return "text-secondary";
      case "syncing":
        return "text-primary";
      case "processing":
        return "text-primary animate-pulse";
    }
  };

  return (
    <div className="flex gap-2">
      {badges.map((badge) => (
        <span
          key={badge.label}
          className={`glass-panel px-2 py-1 text-xs ${getStatusColor(badge.status)}`}
        >
          ● {badge.label}
        </span>
      ))}
    </div>
  );
}
