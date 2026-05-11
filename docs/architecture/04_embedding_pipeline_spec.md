# Embedding Pipeline Specification

## 1. Overview

The embedding pipeline computes 384-dimensional text embeddings via **all-MiniLM-L6-v2** on WebGPU. Notes are chunked using a 256-token sliding window, embeddings are debounced to prevent race conditions, and similarity is computed using Float32Array typed arrays.

## 2. Text Chunking

### 2.1 Sliding Window Strategy

```typescript
const CHUNK_SIZE = 256;
const OVERLAP = 64;

export interface Chunk {
  index: number;
  text: string;
  startToken: number;
  endToken: number;
}

export function chunkText(text: string): Chunk[] {
  const words = text.split(/\s+/);
  const chunks: Chunk[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + CHUNK_SIZE, words.length);
    const chunk = words.slice(start, end);
    chunks.push({
      index: chunks.length,
      text: chunk.join(" "),
      startToken: start,
      endToken: end,
    });
    start += CHUNK_SIZE - OVERLAP; // Slide by 192 tokens
  }

  return chunks;
}
```

### 2.2 Chunking Output

| Note Length  | Chunks    | Storage Overhead |
| ------------ | --------- | ---------------- |
| 500 words    | 3 chunks  | ~4,608 bytes     |
| 5,000 words  | 28 chunks | ~43,008 bytes    |
| 10,000 words | 53 chunks | ~81,408 bytes    |

## 3. Debounce Strategy

### 3.1 Timestamp-Gated Debounce

```typescript
export class EmbeddingDebouncer {
  #state = { lastSavedAt: 0, currentDebounceId: 0 };
  #db: DbService;

  constructor(db: DbService) {
    this.#db = db;
  }

  async debounce(
    noteId: number,
    text: string,
    intervalMs = 1000,
  ): Promise<void> {
    const debounceId = ++this.#state.currentDebounceId;
    const currentUpdatedAt = Date.now();

    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    if (debounceId !== this.#state.currentDebounceId) {
      return; // Stale debounce
    }

    const chunks = chunkText(text);
    for (const chunk of chunks) {
      const vector = await computeEmbedding(chunk.text);
      await this.#db.run(
        `INSERT OR REPLACE INTO note_embeddings 
         (note_id, chunk_index, chunk_text, embedding, model_version, updated_at, updated_ts)
         VALUES (?, ?, ?, ?, ?, datetime('now'), strftime('%s', 'now'))`,
        [
          noteId,
          chunk.index,
          chunk.text,
          vectorToBlob(vector),
          "all-MiniLM-L6-v2",
        ],
      );
    }
  }
}
```

### 3.2 Debounce Timeline

```
Typist types: "Hello, world!" (12 chars)
│
├──> t=0: Keystroke 1 → debounce starts (id=1)
├──> t=500ms: Keystroke 2 → debounce resets (id=2)
├──> t=1000ms: Keystroke 3 → debounce resets (id=3)
├──> t=1500ms: Keystroke 4 → debounce resets (id=4)
├──> t=2000ms: Pause → debounce id=4 completes
└──> t=2000ms: Embedding computed, saved to DB
```

## 4. Cosine Similarity

### 4.1 Float32Array Implementation

```typescript
const DIM = 384;

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < DIM; i++) {
    const ai = a[i];
    const bi = b[i];
    dot += ai * bi;
    magA += ai * ai;
    magB += bi * bi;
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
```

### 4.2 Performance

| Method                  | Ops (1,000 notes × 384 dims) | Time (Chrome 114+) |
| ----------------------- | ---------------------------- | ------------------ |
| Pure JS `for` loop      | 384,000                      | ~15 ms             |
| Float32Array typed loop | 384,000                      | ~8 ms              |
| Math.fsum with reduce   | 384,000                      | ~12 ms             |
| SIMD WASM (future)      | 384,000                      | ~4 ms              |

### 4.3 Batch Search

```typescript
interface SearchResult {
  noteId: number;
  score: number;
  chunkIndex: number;
}

export function searchVectors(
  target: Float32Array,
  vectors: Map<number, Float32Array>,
  topN: number,
): SearchResult[] {
  const scores: SearchResult[] = [];

  for (const [noteId, vector] of vectors) {
    const score = cosineSimilarity(target, vector);
    scores.push({ noteId, score, chunkIndex: 0 });
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topN);
}
```

## 5. Model Version Migration

```typescript
const CURRENT_MODEL = "all-MiniLM-L6-v2";
const CURRENT_DIM = 384;

export async function checkMigration(db: DbService): Promise<boolean> {
  const result = await db.get(
    "SELECT COUNT(*) as count FROM note_embeddings WHERE model_version != ?",
    [CURRENT_MODEL],
  );
  return result.count > 0;
}

export async function migrateVectors(db: DbService): Promise<void> {
  const staleCount = await db.get(
    "SELECT COUNT(*) as count FROM note_embeddings WHERE model_version != ?",
    [CURRENT_MODEL],
  );

  if (staleCount.count > 0) {
    const staleNotes = await db.all(
      "SELECT note_id FROM notes WHERE note_id IN (SELECT note_id FROM note_embeddings WHERE model_version != ?)",
      [CURRENT_MODEL],
    );

    for (const note of staleNotes) {
      const text = await db.get("SELECT content FROM notes WHERE id = ?", [
        note.note_id,
      ]);
      const chunks = chunkText(text.content);
      for (const chunk of chunks) {
        const vector = await computeEmbedding(chunk.text);
        await db.run(
          "INSERT OR REPLACE INTO note_embeddings (note_id, chunk_index, chunk_text, embedding, model_version, dim) VALUES (?, ?, ?, ?, ?, ?)",
          [
            note.note_id,
            chunk.index,
            chunk.text,
            vectorToBlob(vector),
            CURRENT_MODEL,
            CURRENT_DIM,
          ],
        );
      }
    }
  }
}
```

## 6. Vector Index Strategy

### 6.1 Flat Index (100% Recall)

For the initial release, use a flat index over all vectors. This provides 100% recall without hot caching.

```
Search Flow:
1. User types query → compute embedding
2. Fetch all vectors from DB
3. Compute cosine similarity for each vector
4. Sort by score descending
5. Return top-N results
```

### 6.2 Future: SIMD WASM

```typescript
// Future optimization path
// SIMD WASM module for cosine similarity
// ~4× faster on 64-bit CPUs
// Fallback to Float32Array for browsers without WASM
```

## 7. Error Handling

| Error                           | Recovery                    |
| ------------------------------- | --------------------------- |
| Stale embedding (debounce race) | Timestamp-gated overwrite   |
| Dimension mismatch              | model_version column filter |
| Chunk exceeds model window      | 256-token sliding window    |
| Empty note                      | Skip embedding computation  |
| Model not loaded                | Lazy load via ModelManager  |

## 8. References

- ADR-003: Embedding & Vector Pipeline Strategy
- [Hugging Face: Text Chunking Strategies](https://huggingface.co/docs/transformers.js/chunking)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)
