import { useCallback, useEffect, useRef, useState } from "react";
import { chunkText } from "@/utils/text-chunking";
import { generateFallbackEmbedding } from "@/utils/fallbackEmbedding";
import type { DbServiceInterface } from "@/types/database";
import EmbeddingWorker from "@/workers/embedding.worker?worker";

export interface EmbeddingResult {
  noteId: string;
  chunks: number;
  modelVersion: string;
}

interface UseEmbeddingPipelineOptions {
  dbService?: DbServiceInterface;
  onEmbeddingComplete?: (result: EmbeddingResult) => void;
  debounceMs?: number;
}

interface UseEmbeddingPipelineReturn {
  embedNote: (noteId: string, text: string) => void;
  isEmbedding: boolean;
  isModelReady: boolean;
  isModelLoading: boolean;
  modelError: string | null;
  lastResult: EmbeddingResult | undefined;
}

const DEFAULT_DEBOUNCE_MS = 1500;
const EMBEDDING_MODEL = "all-MiniLM-L6-v2";
const EMBEDDING_DIM = 384;
const FALLBACK_MODEL = "deterministic-semantic-fallback";
const SHOULD_USE_BROWSER_FALLBACK = !import.meta.env.VITEST;

export function useEmbeddingPipeline(
  options: UseEmbeddingPipelineOptions = {},
): UseEmbeddingPipelineReturn {
  const { dbService, onEmbeddingComplete, debounceMs = DEFAULT_DEBOUNCE_MS } = options;

  const workerRef = useRef<Worker | null>(null);
  const fallbackModeRef = useRef(false);
  const pendingRef = useRef<Set<string>>(new Set());
  const chunkTextRef = useRef<Map<string, string>>(new Map());
  const noteBatchRef = useRef<Map<string, number>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentDebounceIdRef = useRef(0);

  const [isEmbedding, setIsEmbedding] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<EmbeddingResult | undefined>(undefined);

  const persistEmbedding = useCallback(
    async (noteId: string, chunkIndex: number, chunk: string, embedding: Float32Array, modelVersion: string) => {
      if (!dbService) return;

      const embeddingBytes = new Uint8Array(embedding.buffer.slice(0));
      await dbService.query(
        `INSERT OR REPLACE INTO note_embeddings
         (note_id, chunk_index, chunk_text, embedding, model_version, dim, updated_at, updated_ts)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), strftime('%s', 'now'))`,
        [noteId, chunkIndex, chunk, embeddingBytes, modelVersion, EMBEDDING_DIM],
      );
    },
    [dbService],
  );

  // Initialize worker and model on mount
  useEffect(() => {
    const worker = new EmbeddingWorker();
    workerRef.current = worker;

    const enableFallbackMode = () => {
      fallbackModeRef.current = true;
      setIsModelReady(true);
      setIsModelLoading(false);
      setModelError(null);
    };

    const handleMessage = (e: MessageEvent) => {
      const { type } = e.data;
      switch (type) {
        case "MODEL_READY":
          setIsModelReady(true);
          setIsModelLoading(false);
          setModelError(null);
          break;
        case "MODEL_ERROR":
          if (SHOULD_USE_BROWSER_FALLBACK) {
            enableFallbackMode();
            break;
          }
          setIsModelReady(false);
          setIsModelLoading(false);
          setModelError(e.data.error?.message || "Model init failed");
          break;
        case "EMBEDDING_READY": {
          const { id, embeddings } = e.data;
          pendingRef.current.delete(id);
          const [noteId, batchIdStr, chunkIndexStr] = String(id).split("::");
          const batchId = parseInt(batchIdStr, 10);
          const chunkIndex = parseInt(chunkIndexStr, 10);
          const chunkText = chunkTextRef.current.get(id) ?? "";
          chunkTextRef.current.delete(id);

          if ((noteBatchRef.current.get(noteId) ?? 0) !== batchId) {
            if (pendingRef.current.size === 0) {
              setIsEmbedding(false);
            }
            break;
          }

          if (pendingRef.current.size === 0) {
            setIsEmbedding(false);
          }
          // Store embedding in DB
          void persistEmbedding(noteId, chunkIndex, chunkText, embeddings, EMBEDDING_MODEL).catch((err) => {
            console.warn("useEmbeddingPipeline: failed to store embedding", err);
          });
          break;
        }
        case "EMBEDDING_ERROR": {
          const { id } = e.data;
          pendingRef.current.delete(id);
          chunkTextRef.current.delete(id);
          if (pendingRef.current.size === 0) {
            setIsEmbedding(false);
          }
          console.warn("useEmbeddingPipeline: embedding error", e.data.error);
          break;
        }
      }
    };

    const handleWorkerError = () => {
      if (SHOULD_USE_BROWSER_FALLBACK) {
        enableFallbackMode();
      }
    };

    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleWorkerError);

    // Init model
    setIsModelLoading(true);
    worker.postMessage({
      type: "INIT_MODEL",
      model: EMBEDDING_MODEL,
      dtype: "float16",
      device: "webgpu",
    });

    return () => {
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleWorkerError);
      worker.terminate();
      workerRef.current = null;
    };
  }, [persistEmbedding]);

  const embedNote = useCallback(
    (noteId: string, text: string) => {
      if (!isModelReady) return;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      const debounceId = ++currentDebounceIdRef.current;

      debounceRef.current = setTimeout(() => {
        if (debounceId !== currentDebounceIdRef.current) return;

        const chunks = chunkText(text);
        const nextBatchId = (noteBatchRef.current.get(noteId) ?? 0) + 1;
        noteBatchRef.current.set(noteId, nextBatchId);

        void (async () => {
          if (dbService) {
            try {
              await dbService.query("DELETE FROM note_embeddings WHERE note_id = ?", [noteId]);
            } catch (err) {
              console.warn("useEmbeddingPipeline: failed to clear stale embeddings", err);
            }
          }

          if (chunks.length === 0) {
            setIsEmbedding(false);
            return;
          }

          setIsEmbedding(true);

          const useFallbackMode = fallbackModeRef.current || !workerRef.current;

          for (const chunk of chunks) {
            const id = `${noteId}::${nextBatchId}::${chunk.index}`;
            if (useFallbackMode) {
              const embedding = generateFallbackEmbedding(chunk.text, EMBEDDING_DIM);
              void persistEmbedding(noteId, chunk.index, chunk.text, embedding, FALLBACK_MODEL).catch((err) => {
                console.warn("useEmbeddingPipeline: failed to store fallback embedding", err);
              });
              continue;
            }

            pendingRef.current.add(id);
            chunkTextRef.current.set(id, chunk.text);
            workerRef.current!.postMessage({
              type: "EMBED",
              id,
              text: chunk.text,
            });
          }

          if (useFallbackMode) {
            setIsEmbedding(false);
          }

          const result: EmbeddingResult = {
            noteId,
            chunks: chunks.length,
            modelVersion: useFallbackMode ? FALLBACK_MODEL : EMBEDDING_MODEL,
          };
          setLastResult(result);
          onEmbeddingComplete?.(result);
        })();
      }, debounceMs);
    },
    [dbService, debounceMs, isModelReady, onEmbeddingComplete, persistEmbedding],
  );

  return {
    embedNote,
    isEmbedding,
    isModelReady,
    isModelLoading,
    modelError,
    lastResult,
  };
}
