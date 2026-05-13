import React from "react";

/**
 * Local AI Q&A chat interface component.
 * Provides a simple chat UI for interacting with the local AI model.
 */
export function AIChat() {
  return (
    <div className="glass-panel p-3">
      <div className="text-on-surface text-xs font-geist mb-2">
        Ask your local AI...
      </div>
      <textarea
        placeholder="Type your question..."
        className="w-full bg-transparent text-on-surface text-xs font-jetbrains border-none focus:outline-none resize-none h-16"
      />
      <button className="glass-panel ai-glow px-3 py-1 text-xs text-primary hover:bg-white/5 transition-colors rounded-full">
        Send
      </button>
    </div>
  );
}
