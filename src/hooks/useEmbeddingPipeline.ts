import { useCallback, useRef } from "react";
import { chunkText } from "@/utils/text-chunking";

export interface EmbeddingResult {
  noteId: string;
  chunks: number;
  modelVersion: string;
}

interface UseEmbeddingPipelineOptions {
  onEmbeddingComplete?: (result: EmbeddingResult) => void;
  debounceMs?: number;
}

interface UseEmbeddingPipelineReturn {
  embedNote: (noteId: string, text: string) => void;
  isEmbedding: boolean;
  lastResult: EmbeddingResult | undefined;
}

const DEFAULT_DEBOUNCE_MS = 1000;

export function useEmbeddingPipeline(
  options: UseEmbeddingPipelineOptions = {},
): UseEmbeddingPipelineReturn {
  const { onEmbeddingComplete, debounceMs = DEFAULT_DEBOUNCE_MS } = options;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isEmbeddingRef = useRef(false);
  const lastResultRef = useRef<EmbeddingResult | undefined>(undefined);
  const currentDebounceIdRef = useRef(0);

  const embedNote = useCallback(
    (noteId: string, text: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      const debounceId = ++currentDebounceIdRef.current;
      isEmbeddingRef.current = true;

      debounceRef.current = setTimeout(() => {
        // Stale debounce check
        if (debounceId !== currentDebounceIdRef.current) {
          isEmbeddingRef.current = false;
          return;
        }

        const chunks = chunkText(text);
        const result: EmbeddingResult = {
          noteId,
          chunks: chunks.length,
          modelVersion: "all-MiniLM-L6-v2",
        };

        lastResultRef.current = result;
        isEmbeddingRef.current = false;
        onEmbeddingComplete?.(result);
      }, debounceMs);
    },
    [debounceMs, onEmbeddingComplete],
  );

  return {
    embedNote,
    isEmbedding: isEmbeddingRef.current,
    lastResult: lastResultRef.current,
  };
}
