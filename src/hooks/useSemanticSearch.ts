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

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      setResults([]);

      try {
        if (webGpuScore >= WEBGPU_THRESHOLD) {
          // Semantic search via vector embeddings
          const rows = await dbService.query(
            `SELECT note_id, chunk_index, embedding FROM note_embeddings`,
          );

          if (!rows || !Array.isArray(rows)) {
            setResults([]);
            return;
          }

          // Convert BLOB embeddings to Float32Array
          const vectors = rows.map((row: any) => ({
            noteId: row.note_id,
            chunkIndex: row.chunk_index,
            embedding: new Float32Array(row.embedding),
          }));

          // Generate query embedding (stubbed — real implementation
          // would call the embedding worker with the query text)
          const queryEmbedding = new Float32Array(EMBEDDING_DIM);

          const hits = searchVectors(queryEmbedding, vectors, TOP_N);

          const semanticResults: SemanticSearchResult[] = hits
            .slice(0, TOP_N)
            .map((hit) => ({
              noteId: String(hit.noteId),
              score: hit.score,
              percentage: Math.round(hit.score * 100),
            }));

          setResults(semanticResults);
        } else {
          // BM25 fallback
          const hits = await searchNotesFts5(dbService, query);

          const fallbackResults: SemanticSearchResult[] = hits.map((hit) => ({
            noteId: String(hit.noteId),
            score: hit.score,
            percentage: Math.round(hit.score * 100),
          }));

          setResults(fallbackResults);
        }
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [dbService, webGpuScore],
  );

  return { search, isSearching, results };
}
