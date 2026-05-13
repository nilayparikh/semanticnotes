const DIM = 384;

/**
 * Computes cosine similarity between two Float32Array vectors.
 * Returns a value in [-1, 1] where 1 means identical direction.
 */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    const ai = a[i];
    const bi = b[i];
    dot += ai * bi;
    magA += ai * ai;
    magB += bi * bi;
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export interface SearchResult {
  noteId: number;
  score: number;
  chunkIndex: number;
}

/**
 * Searches a list of vectors against a query, returning the top-N results
 * sorted by descending cosine similarity score.
 */
export function searchVectors(
  query: Float32Array,
  vectors: Array<{
    noteId: number;
    chunkIndex: number;
    embedding: Float32Array;
  }>,
  topN: number,
): SearchResult[] {
  const scores: SearchResult[] = [];

  for (const { noteId, chunkIndex, embedding } of vectors) {
    const score = cosineSimilarity(query, embedding);
    scores.push({ noteId, score, chunkIndex });
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topN);
}
