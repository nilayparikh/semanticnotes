/**
 * Converts a timestamp to a relative time string.
 * Examples: "just now", "5 minutes ago", "2 hours ago", "3 days ago"
 */
export function getRelativeTime(timestamp: number | string): string {
  // Convert to seconds if needed
  const ts =
    typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;
  const seconds = Math.floor((Date.now() - ts) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
