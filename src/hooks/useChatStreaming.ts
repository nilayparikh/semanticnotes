/**
 * Chat Streaming Hook
 *
 * Streams tokens word-by-word with a 50ms delay, supporting pause/resume/stop.
 * Cross-compiled from `docs/plans/04b_chat-ui.md`.
 */

import { useState, useCallback, useRef, useEffect } from "react";

// ── Types ────────────────────────────────────────────────────────────────

export interface UseChatStreamingReturn {
  displayText: string;
  isStreaming: boolean;
  isPaused: boolean;
  startStreaming: (fullText: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

const STREAM_INTERVAL_MS = 50;

// ── Hook ─────────────────────────────────────────────────────────────────

export function useChatStreaming(): UseChatStreamingReturn {
  const [displayText, setDisplayText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const wordsRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const tick = useCallback(() => {
    if (indexRef.current < wordsRef.current.length) {
      const newIndex = indexRef.current;
      indexRef.current = newIndex + 1;

      setDisplayText(
        wordsRef.current.slice(0, newIndex + 1).join(" "),
      );

      // If this was the last word, streaming is complete
      if (newIndex + 1 >= wordsRef.current.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsStreaming(false);
        setIsPaused(false);
      }
    }
  }, []);

  const startStreaming = useCallback((fullText: string) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const words = fullText.split(" ");

    // Handle empty string
    if (words.length === 0 || (words.length === 1 && words[0] === "")) {
      setDisplayText("");
      setIsStreaming(false);
      setIsPaused(false);
      return;
    }

    wordsRef.current = words;
    indexRef.current = 0;
    setDisplayText("");
    setIsStreaming(true);
    setIsPaused(false);

    intervalRef.current = setInterval(tick, STREAM_INTERVAL_MS);
  }, [tick]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (!isStreaming || !isPaused) return;

    setIsPaused(false);
    intervalRef.current = setInterval(tick, STREAM_INTERVAL_MS);
  }, [isStreaming, isPaused, tick]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDisplayText("");
    setIsStreaming(false);
    setIsPaused(false);
    indexRef.current = 0;
  }, []);

  return {
    displayText,
    isStreaming,
    isPaused,
    startStreaming,
    pause,
    resume,
    stop,
  };
}
