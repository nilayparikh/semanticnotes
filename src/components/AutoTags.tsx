import React from "react";

export interface AutoTagsProps {
  tags: string[];
}

/**
 * Color-coded pill badge tags for auto-tagging notes.
 * Cycles through primary, secondary, and tertiary color schemes.
 */
export function AutoTags({ tags }: AutoTagsProps) {
  const tagColors = [
    "bg-primary/20 text-primary",
    "bg-secondary/20 text-secondary",
    "bg-tertiary/20 text-tertiary",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={tag}
          className={`${tagColors[index % tagColors.length]} px-2 py-1 rounded-full text-xs font-geist`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
