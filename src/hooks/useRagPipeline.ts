/**
 * RAG (Retrieval-Augmented Generation) pipeline hook.
 *
 * Orchestrates: query embedding → vector search → token-budgeted context assembly.
 */

import { useState, useCallback } from 'react';
import { searchVectors } from '@/utils/cosine-similarity';
import { countTokens, fitToBudget, DEFAULT_BUDGET } from '@/utils/token-budgeting';

export interface RagContextNote {
  id: string;
  title: string;
  content: string;
  score: number;
}

export interface RagResult {
  context: RagContextNote[];
  usedTokens: number;
  totalNotes: number;
}

export interface RagQuery {
  query: string;
  notes: Array<{
    id: string;
    title: string;
    content: string;
    embedding: Float32Array;
  }>;
  topN?: number;
  maxTokens?: number;
}

/**
 * Hook that provides a RAG pipeline: embed a query, search note vectors,
 * and assemble a token-budgeted context window for LLM consumption.
 */
export function useRagPipeline() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<RagResult | null>(null);

  const execute = useCallback(async (params: RagQuery): Promise<RagResult> => {
    const { query, notes, topN = 10, maxTokens = DEFAULT_BUDGET.context } = params;

    if (!query.trim() || notes.length === 0) {
      return { context: [], usedTokens: 0, totalNotes: 0 };
    }

    setIsProcessing(true);

    try {
      // Step 1: Generate query embedding (stubbed — deterministic hash for now)
      // In production this calls the embedding worker via useEmbeddingPipeline
      const queryEmbedding = new Float32Array(384);
      let hash = 0;
      for (let i = 0; i < query.length; i++) {
        hash = ((hash << 5) - hash) + query.charCodeAt(i);
      }
      for (let i = 0; i < 384; i++) {
        queryEmbedding[i] = Math.sin(hash + i) * 0.5;
      }

      // Step 2: Search vectors
      const vectors = notes.map(n => ({
        noteId: parseInt(n.id, 10) || 0,
        chunkIndex: 0,
        embedding: n.embedding,
      }));

      const hits = searchVectors(queryEmbedding, vectors, topN);

      // Step 3: Deduplicate by note ID, keeping the best score
      const noteMap = new Map(notes.map(n => [n.id, n]));
      const uniqueHits = new Map<string, number>();

      for (const hit of hits) {
        const noteId = String(hit.noteId);
        if (!uniqueHits.has(noteId)) {
          uniqueHits.set(noteId, hit.score);
        }
      }

      // Step 4: Sort unique notes by best score (descending)
      const scoredNotes: RagContextNote[] = Array.from(uniqueHits.entries())
        .map(([id, score]) => ({
          id,
          title: noteMap.get(id)?.title ?? '',
          content: noteMap.get(id)?.content ?? '',
          score,
        }))
        .sort((a, b) => b.score - a.score);

      // Step 5: Apply token budgeting
      const contents = scoredNotes.map(n => n.content);
      const budgetedContents = fitToBudget(contents, maxTokens);

      const context: RagContextNote[] = scoredNotes
        .slice(0, budgetedContents.length)
        .map((note, i) => ({
          ...note,
          content: budgetedContents[i],
        }));

      const usedTokens = context.reduce(
        (sum, n) => sum + countTokens(n.content),
        0,
      );

      const result: RagResult = {
        context,
        usedTokens,
        totalNotes: notes.length,
      };

      setLastResult(result);
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    execute,
    isProcessing,
    lastResult,
  };
}
