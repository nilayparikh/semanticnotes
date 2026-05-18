/**
 * Semantic Search Hook
 *
 * Provides semantic search via vector embeddings (WebGPU) with BM25 fallback.
 * Cross-compiled from `docs/architecture/04_embedding_pipeline_spec.md`.
 */

import { useState, useCallback } from "react";
import type { DbServiceInterface } from "@/types/database";
import { searchVectors } from "@/utils/cosine-similarity";
import { searchNotesFts5 } from "@/hooks/useBm25Fallback";
import { generateFallbackEmbedding } from "@/utils/fallbackEmbedding";

// ── Types ────────────────────────────────────────────────────────────────

export interface SemanticSearchResult {
  noteId: string;
  score: number;
  percentage: number; // score * 100 rounded to integer
}

// ── Constants ────────────────────────────────────────────────────────────

const WEBGPU_THRESHOLD = 31;
const TOP_N = 10;
const EMBEDDING_DIM = 384;
const EMBEDDING_MODEL = "all-MiniLM-L6-v2";

// Module-level embedder cache (shared across hook instances)
let embedderPromise: Promise<any> | null = null;

async function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = (async () => {
      const { pipeline } = await import("@xenova/transformers");
      return pipeline("feature-extraction", EMBEDDING_MODEL, { dtype: "float16" });
    })();
  }
  return embedderPromise;
}

// ── Hook ─────────────────────────────────────────────────────────────────

/**
 * React hook that manages semantic search state.
 * Uses vector embeddings when WebGPU capability is sufficient,
 * falls back to BM25 keyword search otherwise.
 *
 * @param dbService - The database service interface.
 * @param webGpuScore - WebGPU capability score (0-100).
 * @returns Object with search method, isSearching flag, and results array.
 */
export function useSemanticSearch(
  dbService: DbServiceInterface,
  webGpuScore: number,
) {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SemanticSearchResult[]>([]);

  // Generate query embedding via cached embedder (or fallback to TF hash)
  const generateQueryEmbedding = useCallback(async (query: string): Promise<Float32Array> => {
    try {
      const embedder = await getEmbedder();
      const output = await embedder(query, { pooling: "mean", normalize: true });
      // Transformers.js v3: output.data is a TypedArray
      const embedding = output.data instanceof Float32Array
        ? output.data
        : new Float32Array(output.data);
      return embedding;
    } catch {
      return generateFallbackEmbedding(query, EMBEDDING_DIM);
    }
  }, []);

  /**
   * Convert a BLOB value from SQLite to Float32Array.
   * wa-sqlite may return ArrayBuffer, Uint8Array, or a plain array.
   */
  function blobToFloat32Array(blob: any): Float32Array {
    if (blob instanceof Float32Array) return blob;
    if (blob instanceof ArrayBuffer) return new Float32Array(blob);
    if (blob instanceof Uint8Array) {
      return new Float32Array(blob.buffer, blob.byteOffset, blob.byteLength / 4);
    }
    if (Array.isArray(blob)) return new Float32Array(blob);
    // If it's some other object, try to extract data
    return new Float32Array(0);
  }

  const search = useCallback(
    async (query: string): Promise<SemanticSearchResult[]> => {
      if (!query.trim()) {
        setResults([]);
        return [];
      }

      setIsSearching(true);
      setResults([]);

      try {
        // Always try semantic search first (if WebGPU is available)
        let semanticResults: SemanticSearchResult[] = [];
        let hasEmbeddings = false;

        if (webGpuScore >= WEBGPU_THRESHOLD) {
          const rows = await dbService.query(
            `SELECT note_id, chunk_index, embedding FROM note_embeddings`,
          );

          if (rows && Array.isArray(rows) && rows.length > 0) {
            hasEmbeddings = true;

            // Convert BLOB embeddings to Float32Array
            const vectors = rows.map((row: any) => ({
              noteId: String(row.note_id),
              chunkIndex: row.chunk_index ?? 0,
              embedding: blobToFloat32Array(row.embedding),
            }));

            // Generate query embedding via Transformers.js
            const queryEmbedding = await generateQueryEmbedding(query);

            const hits = searchVectors(queryEmbedding, vectors, TOP_N);

            const semanticByNote = new Map<string, SemanticSearchResult>();

            for (const hit of hits.slice(0, TOP_N)) {
              const noteId = String(hit.noteId);
              const candidate = {
                noteId,
                score: hit.score,
                percentage: Math.min(99, Math.round(hit.score * 100)),
              };
              const existing = semanticByNote.get(noteId);
              if (!existing || candidate.score > existing.score) {
                semanticByNote.set(noteId, candidate);
              }
            }

            semanticResults = Array.from(semanticByNote.values()).sort(
              (left, right) => right.score - left.score,
            );
          }
        }

        // BM25 keyword search (always run for hybrid results)
        let bm25Hits: any[] = [];
        try {
          bm25Hits = (await searchNotesFts5(dbService, query)) ?? [];
        } catch {
          // FTS5 may not be available; silently ignore
          bm25Hits = [];
        }
        const bm25Results: SemanticSearchResult[] = bm25Hits.map((hit) => ({
          noteId: String(hit.noteId),
          score: Math.abs(hit.score),
          percentage: Math.min(99, Math.round(Math.abs(hit.score) * 100)),
        }));

        // Hybrid: merge semantic + BM25 results
        const merged = new Map<string, SemanticSearchResult>();

        // Add semantic results with higher weight
        for (const r of semanticResults) {
          merged.set(r.noteId, { ...r, score: r.score * 1.0 });
        }

        // Add BM25 results, boosting if also in semantic
        for (const r of bm25Results) {
          const existing = merged.get(r.noteId);
          if (existing) {
            // Boost hybrid score
            existing.score = Math.max(existing.score, r.score * 0.7);
            existing.percentage = Math.min(99, Math.round(existing.score * 100));
          } else {
            merged.set(r.noteId, { ...r, score: r.score * 0.7 });
          }
        }

        const combined = Array.from(merged.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, TOP_N);

        setResults(combined);
        return combined;
      } catch (err) {
        console.warn("useSemanticSearch: search failed", err);
        setResults([]);
        return [];
      } finally {
        setIsSearching(false);
      }
    },
    [dbService, webGpuScore, generateQueryEmbedding],
  );

  return { search, isSearching, results };
}
