---
name: "Worker & WASM Storage Layer"
description: "Directives for wa-sqlite hooks, data chunking, and Float32Array computational pipelines."
applyTo: "src/workers/**/*.{ts,js}"
---

# Web Worker & WASM Storage Layer — Instruction Profile

## Scope

These instructions apply to all files under `src/workers/` — the Web Worker modules for SQLite, embeddings, and model inference.

## Core Constraints

### Worker Thread Isolation

- **One worker per responsibility**: SQLite, embedding, and inference each run in separate `Worker` instances.
- **MessageChannel communication**: Use `MessageChannel` with `Transferable` objects for zero-copy data passing.
- **Graceful fallback**: If `SharedArrayBuffer` is unavailable, fall back to `postMessage` with JSON serialization.

### wa-sqlite Hooks

```typescript
import { openDatabase } from "wa-sqlite";

// Open the OPFS-backed SQLite database
const db = await openDatabase({
  name: "semantic-notes.db",
  location: "opfs",
  version: 1,
  tables: [
    {
      name: "notes",
      columns: [
        { name: "id", type: "TEXT", primaryKey: true },
        { name: "title", type: "TEXT" },
        { name: "body", type: "TEXT" },
        { name: "embedding", type: "REAL[]", dimensions: 128 },
        { name: "created_at", type: "DATETIME" },
        { name: "updated_at", type: "DATETIME" },
      ],
    },
  ],
});
```

### Float32Array Computational Pipelines

```typescript
// Normalize a Float32Array for cosine similarity
function normalizeVector(vector: Float32Array): Float32Array {
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return new Float32Array(vector.map((v) => v / magnitude));
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dotProduct = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
  }
  return dotProduct;
}
```

### Data Chunking

- **Note text**: Chunk at 256 tokens for embedding generation.
- **Embedding dimensions**: 100–128 dimensions per note (configurable via `all-MiniLM-L6`).
- **SQLite REAL[] column**: Store embeddings as `REAL[]` arrays for efficient querying.

### Error Handling

- **Worker errors**: Catch and log errors in the worker, then post an error message to the main thread.
- **Database errors**: Wrap SQLite operations in try/catch blocks with retry logic.
- **Model inference errors**: Graceful fallback from WebGPU → WebGL → CPU.

## Worker File Structure

```typescript
// src/workers/sqlite.worker.ts
import { openDatabase } from "wa-sqlite";

self.onmessage = async (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case "QUERY": {
      const db = await openDatabase({
        name: "semantic-notes.db",
        location: "opfs",
      });
      const results = await db.query(payload.sql, payload.params);
      self.postMessage({ type: "QUERY_RESULT", payload: results });
      break;
    }
    case "COMMIT": {
      const db = await openDatabase({
        name: "semantic-notes.db",
        location: "opfs",
      });
      await db.commit();
      self.postMessage({ type: "COMMIT_RESULT", payload: true });
      break;
    }
  }
};
```

## Testing Requirements

- Mock `MessageChannel` for worker communication.
- Test database schema migrations and rollback.
- Verify Float32Array transferability across threads.
