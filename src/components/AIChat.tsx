import React, { useState, useCallback, useEffect } from "react";
import { ChatInput } from "./ChatInput";
import { ChatThread, ChatMessage } from "./ChatThread";
import { ModelSelector } from "./ModelSelector";
import { useChatStreaming } from "@/hooks/useChatStreaming";

// ── Constants ────────────────────────────────────────────────────────────

const CHAT_HISTORY_KEY = "semanticnotes-chat-history";
const MAX_HISTORY = 50;

// ── Helpers ──────────────────────────────────────────────────────────────

function loadChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveChatHistory(messages: ChatMessage[]) {
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
  } catch {
    // localStorage may be unavailable or full — silently ignore
  }
}

// ── Component ────────────────────────────────────────────────────────────

/**
 * Local AI Q&A chat interface.
 * Composes ChatThread, ChatInput, ModelSelector, and useChatStreaming.
 * Persists chat history to localStorage (last 50 messages).
 */
export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadChatHistory);
  const [selectedModel, setSelectedModel] = useState("Qwen2.5-Coder-0.5B");
  const streaming = useChatStreaming();

  // Persist messages to localStorage on every change (debounced via effect)
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  const handleSend = useCallback(
    (query: string) => {
      const userMessage: ChatMessage = {
        role: "user",
        content: query,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Simulate assistant response with streaming
      // In production this would call the RAG pipeline + LLM
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "I'm processing your query about your notes...",
        timestamp: new Date().toISOString(),
      };
      streaming.startStreaming(assistantMessage.content);

      // When streaming completes, commit the full response
      // This is handled by a separate effect watching isStreaming
    },
    [streaming],
  );

  // Commit streaming text as a full message when streaming finishes
  useEffect(() => {
    if (!streaming.isStreaming && streaming.displayText) {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: streaming.displayText,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      streaming.stop();
    }
  }, [streaming.isStreaming, streaming.displayText, streaming]);

  const models = [
    { name: "Qwen2.5-Coder-0.5B", state: "idle" as const },
    { name: "MiniLM", state: "idle" as const },
  ];

  return (
    <div className="flex flex-col h-full gap-2 p-3">
      {/* Model Selector */}
      <div className="flex justify-between items-center">
        <span className="text-on-surface text-xs font-geist">AI Chat</span>
        <ModelSelector
          models={models}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>

      {/* Chat Thread */}
      <div className="flex-1 min-h-0">
        <ChatThread messages={messages} streamingText={streaming.isStreaming ? streaming.displayText : undefined} />
      </div>

      {/* Chat Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
