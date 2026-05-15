/**
 * Token budgeting utilities for the RAG pipeline.
 *
 * Uses a character-based heuristic (~4 chars/token) for approximate
 * token counting against the Qwen2.5-Coder-0.5B 2,048-token context window.
 */

export interface TokenBudget {
  system: number;
  context: number;
  question: number;
  answerReserve: number;
  total: number;
}

export const DEFAULT_BUDGET: TokenBudget = Object.freeze({
  system: 120,
  context: 1400,
  question: 300,
  answerReserve: 228,
  total: 2048,
});

/**
 * Approximate token count using a 4-chars-per-token heuristic.
 */
export function countTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text to fit within a maximum token budget, appending "..." when cut.
 */
export function truncateToTokens(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  return text.slice(0, maxChars) + (text.length > maxChars ? "..." : "");
}

/**
 * Process notes in order, including full notes until the next wouldn't fit,
 * then truncate the last one to fill remaining space.
 */
export function fitToBudget(notes: string[], maxTokens: number): string[] {
  if (notes.length === 0) {
    return [];
  }

  const result: string[] = [];
  let remaining = maxTokens;

  for (let i = 0; i < notes.length; i++) {
    const noteTokens = countTokens(notes[i]);

    // If this note fits fully, include it and move on
    if (noteTokens <= remaining) {
      result.push(notes[i]);
      remaining -= noteTokens;
    } else if (remaining > 0) {
      // Truncate this note to fill remaining space
      result.push(truncateToTokens(notes[i], remaining));
      break;
    } else {
      // No budget left
      break;
    }
  }

  return result;
}
