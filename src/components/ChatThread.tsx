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
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg text-xs font-jetbrains ${
                  message.role === "user"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-secondary/10 text-secondary border border-secondary/20"
                }`}
              >
                <div>{message.content}</div>
                <div className="text-[10px] text-on-surface/40 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
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
