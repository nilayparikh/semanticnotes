import React, { useState, useCallback } from "react";

export interface ChatInputProps {
  onSend: (query: string) => void;
}

/**
 * Chat input with textarea and Send button.
 * Enter sends; Shift+Enter for newline.
 * Uses glass-panel / ai-glow styling consistent with AIContextBar.
 */
export function ChatInput({ onSend }: ChatInputProps) {
  const [query, setQuery] = useState("");

  const handleSend = useCallback(() => {
    if (query.trim()) {
      onSend(query.trim());
      setQuery("");
    }
  }, [query, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass-panel ai-glow px-4 py-3 rounded-lg flex items-end gap-3">
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about your notes..."
        aria-label="Chat message input"
        rows={1}
        className="flex-1 bg-transparent border-none focus:outline-none text-sm text-on-surface resize-none"
      />
      <button
        onClick={handleSend}
        disabled={!query.trim()}
        aria-label="Send"
        className="px-3 py-1 text-sm text-primary bg-primary/10 rounded-md hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Send
      </button>
    </div>
  );
}
