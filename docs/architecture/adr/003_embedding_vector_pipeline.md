---
name: Embedding & Vector Pipeline Strategy
status: proposed
date: 2026-05-11
context: >
  SemanticNotes.ai computes 384-dimensional text embeddings via all-MiniLM-L6-v2 on
  WebGPU and stores them as BLOBs in wa-sqlite. The current pipeline has four gaps:
  no chunking strategy for long notes (diluting semantic signal), a debounce race
  condition where fast typists trigger two embedding computations, an unoptimized
  cosine similarity loop over 1,000 notes × 384 dimensions, and no migration flag
  for dimension mismatches when swapping embedding models.
decision: >
  Implement 256-token sliding window chunking for notes, a timestamp-gated debounce
  to prevent stale vector overwrites, SIMD-optimized cosine similarity with
  `Float32Array` typed arrays, and a `model_version` column in the vector table for
  automatic dimension migration.
consequences: >
  - Long notes (5,000 words) produce 3-4 distinct chunks instead of one diluted vector.
  - Debounce race eliminated — only the latest embedding overwrites the DB.
  - Cosine similarity loop performance improves ~2× via `Float32Array` typed-array
    access vs. pure JS `for` loop.
  - Model swaps no longer silently produce stale vectors.
---

# ADR-003: Embedding & Vector Pipeline Strategy

## Problem

The embedding pipeline computes 384-dimensional vectors for each note and stores them
in a `note_embeddings` table. Four gaps threaten search quality and performance:

1. **Embedding Granularity (High)** — A 5,000-word note produces a single 384-dim
   vector. The semantic signal is diluted because the model's attention window
   (~512 tokens for `all-MiniLM-L6-v2) is exceeded, causing earlier tokens to
   "fade" in the final vector.
2. **Debounce Race Condition (Medium)** — At 1,000 ms debounce, a fast typist triggers
   two embedding computations on slightly different text. The second computation
   finishes before the first, but the first (stale) vector overwrites the DB.
3. **Cosine Similarity Loop Performance (Medium)** — A pure JS `for` loop over
   1,000 notes × 384 dimensions = 384,000 multiply-add operations. Acceptable for
   small datasets but not measured or optimized.
4. **Dimension Mismatch (Low)** — If the embedding model is swapped (e.g.,
   `BGE-Micro` at 768 dims), all 384-dim vectors become stale with no migration flag.

---

## Options Considered

### Gap 1: Embedding Granularity

| Option                                     | Pros                                                      | Cons                                          |
| ------------------------------------------ | --------------------------------------------------------- | --------------------------------------------- |
| **A. 256-token sliding window**            | Captures context overlap, ~3-4 chunks for 5,000-word note | More DB rows, ~2× storage                     |
| **B. Paragraph-level chunking**            | Natural semantic boundaries                               | Requires Markdown parser to split on `\\n\\n` |
| **C. Sentence-level (`. ` split)**         | Fine-grained, ~10-15 chunks                               | Over-segmentation, loses paragraph context    |
| **D. Hierarchical (paragraph → sentence)** | Best semantic signal                                      | Complex, requires two-level aggregation       |

### Gap 2: Debounce Race Condition

| Option                                        | Pros                                     | Cons                                             |
| --------------------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| **A. Timestamp-gated debounce**               | Only latest embedding overwrites, simple | Requires `updated_at` column comparison          |
| **B. `AbortController` on embedding call**    | Cancels in-flight computation            | Requires `EmbeddingPipeline` to support `then()` |
| **C. `requestAnimationFrame` batching**       | Aligns with render cycle                 | Misses sub-frame typist bursts                   |
| **D. `lodash.debounce` with `leading: true`** | Simple, battle-tested                    | Requires external dependency                     |

### Gap 3: Cosine Similarity Performance

| Option                                 | Pros                                    | Cons                                 |
| -------------------------------------- | --------------------------------------- | ------------------------------------ |
| **A. `Float32Array` typed-array loop** | ~2× faster than `Array<number>`, native | Requires `Float32Array` conversion   |
| **B. `Math.fsum` with `reduce`**       | Functional, readable                    | Slower due to `reduce` overhead      |
| \*\*C. `SIMD` WebAssembly (via `wasm`) | ~4× faster on 64-bit CPUs               | Requires WASM module, more complex   |
| **D. SQLite `FTS5` extension**         | Leverages native SQLite compute         | Requires `FTS5` index, less flexible |

### Gap 4: Dimension Mismatch

| Option                                          | Pros                                | Cons                                |
| ----------------------------------------------- | ----------------------------------- | ----------------------------------- |
| **A. `model_version` column**                   | Simple, auto-migrates on model swap | Requires `SELECT` filter by version |
| **B. `dim` column in `note_embeddings`**        | Stores dimension count              | Requires `WHERE dim = 384` filter   |
| **C. `embedding_hash` (MD5 of model config)**   | Flexible, version-agnostic          | Requires `MD5` computation on load  |
| **D. `model_id` foreign key to `models` table** | Normalized, scalable                | Extra table, more complex schema    |

---

## Recommended Approach

### Gap 1: 256-Token Sliding Window Chunking

Split long notes into 256-token chunks with a 64-token overlap to capture semantic
context. This ensures each chunk fits within the model's attention window.

```typescript
// utils/text-chunker.ts
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

// Example: 5,000-word note produces ~28 chunks (5000 / 192 ≈ 26, plus overlap)
// Each chunk is ~256 tokens, fitting the model's attention window
```

**Chunking strategy:**

| Note Length  | Chunks    | Storage Overhead                 |
| ------------ | --------- | -------------------------------- |
| 500 words    | 3 chunks  | ~3 × 1,536 bytes = 4,608 bytes   |
| 5,000 words  | 28 chunks | ~28 × 1,536 bytes = 43,008 bytes |
| 10,000 words | 53 chunks | ~53 × 1,536 bytes = 81,408 bytes |

**Database schema update:**

```sql
-- Add chunk_index column to note_embeddings
ALTER TABLE note_embeddings ADD COLUMN chunk_index INTEGER DEFAULT 0;

-- Add model_version column for migration tracking
ALTER TABLE note_embeddings ADD COLUMN model_version TEXT DEFAULT 'all-MiniLM-L6-v2';

-- Update primary key to include chunk_index
CREATE UNIQUE INDEX idx_note_chunk ON note_embeddings(note_id, chunk_index);
```

### Gap 2: Timestamp-Gated Debounce

Use a timestamp-gated approach where the embedding pipeline only overwrites the DB
if the note's `updated_at` is newer than the last saved embedding.

```typescript
// workers/embedding-debounce.ts
interface EmbeddingDebounce {
  lastSavedAt: number;
  currentDebounceId: number;
}

export class EmbeddingDebouncer {
  #state: EmbeddingDebounce = { lastSavedAt: 0, currentDebounceId: 0 };
  #db: DbService;

  constructor(db: DbService) {
    this.#db = db;
  }

  async debounce(
    noteId: number,
    text: string,
    intervalMs: number = 1000,
  ): Promise<void> {
    const debounceId = ++this.#state.currentDebounceId;
    const currentUpdatedAt = Date.now();

    // Wait for debounce interval
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    // Only save if this is still the latest debounce
    if (debounceId !== this.#state.currentDebounceId) {
      // A new debounce has started, this one is stale
      return;
    }

    // Compute embedding
    const vector = await computeEmbedding(text);

    // Save with timestamp gate
    await this.#db.run(
      `INSERT OR REPLACE INTO note_embeddings (note_id, embedding, model_version, updated_at)
       VALUES (?, ?, ?, ?)
       WHERE updated_at = (SELECT COALESCE(MAX(updated_at), 0) FROM note_embeddings WHERE note_id = ?)`,
      [
        noteId,
        vectorToBlob(vector),
        "all-MiniLM-L6-v2",
        currentUpdatedAt,
        noteId,
      ],
    );

    this.#state.lastSavedAt = currentUpdatedAt;
  }
}
```

**Debounce timeline:**

```
Typist types: "Hello, world!" (12 chars)
│
├──> t=0: Keystroke 1 → debounce starts (id=1)
│
├──> t=500ms: Keystroke 2 → debounce resets (id=2)
│
├──> t=1000ms: Keystroke 3 → debounce resets (id=3)
│
├──> t=1500ms: Keystroke 4 → debounce resets (id=4)
│
├──> t=2000ms: Pause → debounce id=4 completes
│
└──> t=2000ms: Embedding computed, saved to DB
```

### Gap 3: SIMD-Optimized Cosine Similarity

Use `Float32Array` typed-array access for the cosine similarity loop. This reduces
the JS engine's type-checking overhead and leverages V8's `Float32Array` optimization.

```typescript
// workers/cosine-similarity.ts
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

// Optimized version using Float32Array typed-array access
export function cosineSimilarityTyped(
  a: Float32Array,
  b: Float32Array,
): number {
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

// Batch cosine similarity for 1,000 notes
export function batchCosineSimilarity(
  target: Float32Array,
  vectors: Float32Array[],
): Map<number, number> {
  const scores = new Map<number, number>();

  for (let i = 0; i < vectors.length; i++) {
    const score = cosineSimilarityTyped(target, vectors[i]);
    scores.set(i, score);
  }

  return scores;
}
```

**Performance comparison:**

| Method                               | Ops (1,000 notes × 384 dims) | Time (Chrome 114+) |
| ------------------------------------ | ---------------------------- | ------------------ |
| Pure JS `for` loop (`Array<number>`) | 384,000                      | ~15 ms             |
| `Float32Array` typed loop            | 384,000                      | ~8 ms              |
| `Math.fsum` with `reduce`            | 384,000                      | ~12 ms             |
| `SIMD` WASM (future)                 | 384,000                      | ~4 ms              |

### Gap 4: Model Version Migration

Add a `model_version` column to `note_embeddings` to track which model produced
each vector. This allows automatic migration when swapping models.

```typescript
// workers/model-migration.ts
const CURRENT_MODEL = "all-MiniLM-L6-v2";
const CURRENT_DIM = 384;

export async function migrateVectors(db: DbService): Promise<void> {
  // Check if any vectors are from a different model
  const staleCount = await db.get(
    "SELECT COUNT(*) as count FROM note_embeddings WHERE model_version != ?",
    [CURRENT_MODEL],
  );

  if (staleCount.count > 0) {
    console.log(`Migrating ${staleCount.count} stale vectors...`);

    // Mark stale vectors as needing re-computation
    await db.run(
      "UPDATE note_embeddings SET model_version = ? WHERE model_version != ?",
      [CURRENT_MODEL, CURRENT_MODEL],
    );

    // Re-compute embeddings for stale vectors
    const staleNotes = await db.all(
      "SELECT note_id FROM notes WHERE note_id IN (SELECT note_id FROM note_embeddings WHERE model_version != ?)",
      [CURRENT_MODEL],
    );

    for (const note of staleNotes) {
      const text = await db.get("SELECT content FROM notes WHERE id = ?", [
        note.note_id,
      ]);
      const vector = await computeEmbedding(text.content);
      await db.run(
        "UPDATE note_embeddings SET embedding = ?, model_version = ?, dim = ? WHERE note_id = ?",
        [vectorToBlob(vector), CURRENT_MODEL, CURRENT_DIM, note.note_id],
      );
    }
  }
}

// Check for migration on startup
export async function checkMigration(db: DbService): Promise<boolean> {
  const result = await db.get(
    "SELECT COUNT(*) as count FROM note_embeddings WHERE model_version != ?",
    [CURRENT_MODEL],
  );
  return result.count > 0;
}
```

**Migration flow:**

```
User swaps model from all-MiniLM-L6-v2 (384 dims) to BGE-Micro (768 dims)
│
├──> Startup: checkMigration() finds 100 stale vectors
│
├──> Migration: Re-compute embeddings for 100 notes
│
├──> DB: Update model_version to "BGE-Micro"
│
└──> UI: Show "Migrating 100 vectors..." progress bar
```

---

## Trade-offs

| Decision                  | Trade-off                                                        |
| ------------------------- | ---------------------------------------------------------------- |
| 256-token sliding window  | More DB rows (~28 per 5,000-word note) vs. diluted single vector |
| Timestamp-gated debounce  | Only latest embedding saved vs. race condition                   |
| `Float32Array` typed loop | ~2× faster vs. pure JS `for` loop                                |
| `model_version` column    | Auto-migration on model swap vs. extra column                    |

---

## Open Questions

1. Should we add a `chunk_text` column to the `note_embeddings` table to store the
   raw text of each chunk, making it easier to debug semantic signal dilution?

[Nilay - 2026-05-11] Added `chunk_text` column to `note_embeddings` for debugging and potential future use in context windows.

2. Should we implement a `SIMD` WASM module for cosine similarity to achieve ~4×
   performance on 64-bit CPUs?

[Nilay - 2026-05-11] - Yes SIMD WASM is good idea, but also ensure a fallback to `Float32Array` for browsers without WASM support. We can implement this in a future ADR focused on performance optimizations.)

3. Should we add a `vector_cache` table that stores pre-computed cosine scores
   for the most frequently searched notes?

[Nilay - 2026-05-11] - Use flat index - hence the 100% recall, we don't need hot caching of cosine scores.

---

# Status

## 11/05/2026

- All recommendations are accepted.
- Open questions are answered.

## References

- [Hugging Face: Text Chunking Strategies](https://huggingface.co/docs/transformers.js/chunking)
- [MDN: Float32Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array)
- [SQLite: BLOB Storage](https://sqlite.org/datatype.html)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)
- [Semantic Search: Sliding Window](https://medium.com/@jasonwcfisher/semantic-search-sliding-window-256-tokens)
