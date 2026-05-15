/**
 * Context window management hook for the RAG pipeline.
 *
 * Manages a sliding window of scored notes, enforcing token budgets
 * and note count limits to fit within the LLM's context window.
 */

import { useState, useCallback, useMemo } from "react";
import {
  countTokens,
  truncateToTokens,
  DEFAULT_BUDGET,
  TokenBudget,
} from "@/utils/token-budgeting";

export interface ScoredNote {
  id: string;
  title: string;
  content: string;
  score: number; // cosine similarity score
}

export interface ContextWindow {
  notes: ScoredNote[];
  usedTokens: number;
  budget: number;
}

interface UseContextWindowOptions {
  maxNotes?: number; // default 128
  tokensPerNote?: number; // default 256
  budget?: TokenBudget;
}

/**
 * React hook that manages the context window for RAG.
 *
 * @param options - Configuration for max notes, tokens per note, and token budget.
 * @returns Context window state and methods to update/build it.
 */
export function useContextWindow(options?: UseContextWindowOptions) {
  // State for scored notes
  const [scoredNotes, setScoredNotes] = useState<ScoredNote[]>([]);

  // Method to update scored notes (called by RAG pipeline)
  const updateNotes = useCallback((notes: ScoredNote[]) => {
    setScoredNotes(notes);
  }, []);

  // Method to build context window from scored notes
  const buildContext = useCallback(
    (notes: ScoredNote[], maxTokens?: number) => {
      const maxT = maxTokens ?? options?.budget?.context ?? DEFAULT_BUDGET.context;
      const maxN = options?.maxNotes ?? 128;

      // Sort by score descending
      const sorted = [...notes]
        .sort((a, b) => b.score - a.score)
        .slice(0, maxN);

      // Build context with token budgeting
      let usedTokens = 0;
      const contextNotes: ScoredNote[] = [];

      for (const note of sorted) {
        const noteTokens = countTokens(note.content);
        if (usedTokens + noteTokens <= maxT) {
          contextNotes.push(note);
          usedTokens += noteTokens;
        } else {
          const remaining = maxT - usedTokens;
          if (remaining > 0) {
            const truncated = truncateToTokens(note.content, remaining);
            contextNotes.push({ ...note, content: truncated });
            usedTokens += remaining;
          }
          break;
        }
      }

      return { notes: contextNotes, usedTokens, budget: maxT };
    },
    [options],
  );

  // Memoized context from current scored notes
  const context = useMemo(() => {
    return buildContext(scoredNotes);
  }, [scoredNotes, buildContext]);

  return {
    context,
    updateNotes,
    buildContext,
    usedTokens: context.usedTokens,
    budget: context.budget,
  };
}
