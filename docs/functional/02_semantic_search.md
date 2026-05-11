# Functional Spec: Semantic Search

## Overview

SemanticNotes AI provides vector-based semantic search over note content. User queries are embedded using a local WebGPU text embedding model, and similarity is computed against stored note vectors.

## Features

### 2.1 Semantic Search Query

- The sidebar contains a search input field labeled "🔍 AI Semantic Search...".
- On keystroke, the user's query string is sent to the embedding worker.
- The worker computes a 384-dimensional vector for the query string.
- The vector is compared against all stored note vectors using cosine similarity.
- Top-matching notes are highlighted in the sidebar with percentage scores (e.g., "94%").

### 2.2 Search Results Display

- Search results appear in the note hierarchy list with proximity percentages.
- The "Semantic Proximity" module in the AI Insights panel displays close-match documents with scores.

### 2.3 Fallback: BM25 Keyword Search

- If WebGPU performance is insufficient or the GPU is basic (< 1 GB VRAM), the system falls back to SQLite FTS5 for BM25 keyword search.
- The FTS5 virtual table indexes `title` and `content` columns.

## Technical Details

- Embedding model: `all-MiniLM-L6-v2` (384 dimensions, ~350 MB)
- Vector comparison: Custom JavaScript cosine similarity loop in the database worker
- Vector storage: `Float32Array` BLOBs in `note_embeddings` table
- Chunking: 256-token sliding window for embedding

## Data Model

```sql
CREATE TABLE IF NOT EXISTS note_embeddings (
  note_id TEXT PRIMARY KEY,
  vector BLOB NOT NULL,
  updated_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (note_id) REFERENCES notes(id)
);

CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  title, content,
  content = 'notes',
  content_rowid = 'id'
);
```

## References

- [Embedding Pipeline Spec](../architecture/04_embedding_pipeline_spec.md)
- [Storage Layer Spec](../architecture/02_storage_layer_spec.md)
- [Model Runtime Spec](../architecture/03_model_runtime_spec.md)
