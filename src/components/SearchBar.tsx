import React from "react";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Glassmorphic search input for AI semantic search.
 */
export function SearchBar({
  value,
  onChange,
  placeholder = "AI Semantic Search...",
}: SearchBarProps) {
  return (
    <div className="p-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="glass-panel w-full px-3 py-2 text-sm text-on-surface border-none focus:outline-none focus:border-b focus:border-primary"
      />
    </div>
  );
}
