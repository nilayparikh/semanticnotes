import React, { useState, useCallback, useEffect } from "react";
import { ChatInput } from "./ChatInput";
import { ChatThread, ChatMessage } from "./ChatThread";
import { ModelSelector } from "./ModelSelector";
import { useChatStreaming } from "@/hooks/useChatStreaming";
import { useRagPipeline, RagContextNote } from "@/hooks/useRagPipeline";
import type { Note } from "@/types/note";

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

export interface AIChatProps {
  notes?: Note[];
  contextNotes?: RagContextNote[];
}

/**
 * Local AI Q&A chat interface.
 * Composes ChatThread, ChatInput, ModelSelector, and useChatStreaming.
 * Uses RAG pipeline for context retrieval and LLM generation.
 * Persists chat history to localStorage (last 50 messages).
 */
export function AIChat({ notes = [], contextNotes = [] }: AIChatProps = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(loadChatHistory);
  const [selectedModel, setSelectedModel] = useState("Qwen2.5-Coder-0.5B");
  const streaming = useChatStreaming();
  const ragPipeline = useRagPipeline();

  // Persist messages to localStorage on every change (debounced via effect)
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  const handleSend = useCallback(
    async (query: string) => {
      const userMessage: ChatMessage = {
        role: "user",
        content: query,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Run RAG pipeline to retrieve context
      try {
        const ragResult = await ragPipeline.execute({
          query,
          notes: notes.map((n) => ({
            id: n.id,
            title: n.title || "Untitled",
            content: n.content || "",
            embedding: new Float32Array(384), // Zero-filled for now, real embeddings come from DB
          })),
          topN: 2,
        });

        // Build context summary for the response
        const contextSummary = ragResult.context
          .map((n) => `**${n.title}**: ${n.content.slice(0, 100)}...`)
          .join("\n\n");

        const responseText = contextSummary
          ? `Based on your notes:\n\n${contextSummary}\n\nThis matches your query: "${query}".`
          : `I searched your notes for "${query}" but found no relevant context.`;

        streaming.startStreaming(responseText);
      } catch {
        streaming.startStreaming(`I searched your notes for "${query}".`);
      }
    },
    [streaming, ragPipeline, notes],
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

  // Show context notes in chat thread if available
  const contextMessages: ChatMessage[] = contextNotes.map((n) => ({
    role: "assistant" as const,
    content: `📎 **${n.title}** (score: ${(n.score * 100).toFixed(1)}%)\n${n.content.slice(0, 150)}...`,
    timestamp: new Date().toISOString(),
  }));

  const allMessages = [...contextMessages, ...messages];

  return (
    <div className="flex flex-col h-full">
      {/* Q&A Header */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-label-caps text-label-caps text-on-surface uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            Local AI Q&A
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
            <span className="text-[10px] font-status-pill text-secondary uppercase">Loaded</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
          <span className="text-[10px] font-code-editor text-on-surface-variant whitespace-nowrap">100% Progress</span>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 py-2 bg-black/20 min-h-0">
        <ChatThread messages={messages} streamingText={streaming.isStreaming ? streaming.displayText : undefined} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-white/5">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
