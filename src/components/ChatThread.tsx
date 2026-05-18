import React, { useRef, useEffect } from "react";

/**
 * A single chat message in the thread.
 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

/**
 * Props for the ChatThread component.
 */
interface ChatThreadProps {
  messages: ChatMessage[];
  streamingText?: string;
}

const MAX_VISIBLE_MESSAGES = 50;

/**
 * ChatThread displays a scrollable list of chat messages.
 * - User messages are right-aligned with primary color accent.
 * - Assistant messages are left-aligned with secondary color.
 * - Streaming text shows with a pulsing cursor indicator.
 * - Automatically scrolls to bottom on new messages.
 * - Limits display to last 50 messages for performance.
 */
function ChatThreadInner({ messages, streamingText }: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  // Show only the last 50 messages
  const visibleMessages = messages.slice(-MAX_VISIBLE_MESSAGES);

  return (
    <div
      ref={scrollRef}
      className="glass-panel flex flex-col h-full overflow-y-auto p-3 gap-2"
      role="list"
      aria-label="Chat messages"
    >
      {visibleMessages.length === 0 && !streamingText ? (
        <div className="flex items-center justify-center h-full text-on-surface/50 text-xs font-geist">
          No messages yet
        </div>
      ) : (
        <>
          {visibleMessages.map((message, index) => (
            <div
              key={index}
              role="listitem"
              className={`flex flex-col ${
                message.role === "user" ? "items-end gap-1" : "items-start gap-1"
              }`}
            >
              <div
                className={`max-w-[90%] px-3 py-2 rounded-lg text-xs leading-relaxed ${
                  message.role === "user"
                    ? "bg-primary-fixed-dim/10 border border-primary-fixed-dim/20 text-on-surface"
                    : "bg-surface-container-high border border-white/5 text-on-surface-variant"
                }`}
              >
                {message.content}
              </div>
              <span className={`text-[9px] font-label-caps uppercase ${
                message.role === "user"
                  ? "text-on-surface-variant"
                  : "text-secondary"
              }`}>
                {message.role === "user" ? "User" : "Qwen"}
              </span>
            </div>
          ))}

          {streamingText && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-3 py-2 rounded-lg text-xs font-jetbrains bg-secondary/10 text-secondary border border-secondary/20">
                <div>{streamingText}</div>
                <span
                  data-testid="streaming-cursor"
                  className="inline-block w-1 h-4 bg-secondary ml-1 animate-pulse"
                  aria-hidden="true"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const ChatThread = React.memo(ChatThreadInner);
