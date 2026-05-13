import React from "react";

export interface AIContextBarProps {
  isProcessing: boolean;
  onSummarize: () => void;
  onFinishLinks: () => void;
}

/**
 * Floating pill-shaped AI context bar with status indicator and action buttons.
 * Uses glass-panel and ai-glow utility classes.
 */
export function AIContextBar({
  isProcessing,
  onSummarize,
  onFinishLinks,
}: AIContextBarProps) {
  return (
    <div className="glass-panel ai-glow px-4 py-2 rounded-full flex items-center gap-3">
      <div
        className={`w-2 h-2 rounded-full ${
          isProcessing ? "bg-primary animate-pulse" : "bg-secondary"
        }`}
      />
      <span className="text-on-surface text-xs font-geist">
        {isProcessing ? "AI Processing..." : "AI Ready"}
      </span>
      <button
        onClick={onSummarize}
        className="glass-panel px-2 py-1 text-xs text-primary hover:bg-white/5 transition-colors"
      >
        Summarize
      </button>
      <button
        onClick={onFinishLinks}
        className="glass-panel px-2 py-1 text-xs text-primary hover:bg-white/5 transition-colors"
      >
        Find Links
      </button>
    </div>
  );
}
