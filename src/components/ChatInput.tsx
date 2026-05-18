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
    <div className="relative flex items-center">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Ask anything about your notes..."
        aria-label="Chat message input"
        className="w-full bg-surface-container border-0 rounded-lg pl-3 pr-10 py-2 text-[12px] placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary-fixed-dim focus:outline-none"
      />
      <button
        onClick={handleSend}
        disabled={!query.trim()}
        aria-label="Send"
        className="absolute right-2 text-primary-fixed-dim hover:text-primary-fixed transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined text-[20px]">send</span>
      </button>
    </div>
  );
}
