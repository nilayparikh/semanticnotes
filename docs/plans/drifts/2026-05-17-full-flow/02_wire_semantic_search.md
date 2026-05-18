---
title: "Group 2 — Wire Semantic Search Pipeline"
plan_id: "drift-2026-05-17-full-flow-02_semantic_search"
status: "Complete"
author: "Planning Agent"
created: "2026-05-17"
updated: "2026-05-17"
completed: "2026-05-17"6-05-17"
priority: "Critical"
story_points: 3
effort_days: 0.5
depends_on: ["drift-2026-05-17-full-flow-01_sqlite_storage"]
depends_on_external: ["@xenova/transformers"]
phase: null
parent_drift_index: "docs/plans/drifts/2026-05-17-full-flow/README.md"
source_drifts: ["drift-2026-05-17-assessment#critical-2"]
archived_date: null
archive_log: null
---

## 1. Objective

Replace the keyword-based `keywordSearch()` fallback in `App.tsx` with the real `useSemanticSearch` hook. Connect the sidebar search input to the embedding worker and vector search pipeline.

## 2. Scope

### In Scope

- [ ] Replace `keywordSearch()` with `useSemanticSearch.search()` in `App.tsx`
- [ ] Instantiate `embedding.worker.ts` for query embedding generation
- [ ] Wire sidebar search input to trigger `useSemanticSearch`
- [ ] Use real query embedding (not zero-filled `Float32Array`)
- [ ] Display search results with percentage scores from vector similarity
- [ ] BM25 fallback when WebGPU is unavailable

### Out of Scope

- Note CRUD wiring (Group 1)
- Chat or RAG pipeline (Group 3)
- UI styling changes

## 3. Acceptance Criteria

| #   | Criterion                                                       | Verification Method | Status |
| --- | --------------------------------------------------------------- | ------------------- | ------ |
| 1   | Sidebar search input triggers `useSemanticSearch.search()`      | Code Review         | `[ ]`  |
| 2   | Query string is embedded to 384-dim vector via embedding worker | Integration Test    | `[ ]`  |
| 3   | Search results are ranked by cosine similarity                  | Unit Test           | `[ ]`  |
| 4   | BM25 fallback activates when WebGPU score < 31                  | Integration Test    | `[ ]`  |
| 5   | Search results display proximity percentages in sidebar         | Manual              | `[ ]`  |

## 4. Current Code Analysis

### `src/App.tsx` (lines 58-75)

```typescript
function keywordSearch(query: string, notes: Note[]) { ... }
// Used directly, ignores semanticResults
```

### `src/hooks/useSemanticSearch.ts`

Hook exists with `search()` method. Uses `dbService.query()` to fetch vectors and `searchVectors()` for cosine similarity. Query embedding is zero-filled stub (line 70).

### `src/workers/embedding.worker.ts`

Worker handles `INIT_MODEL` and `EMBED` messages. Sends `EMBEDDING_READY` with `Float32Array` via transferable.

## 5. Technical Approach

### 5.1 Instantiate Embedding Worker

```typescript
// src/App.tsx
import EmbeddingWorker from "@/workers/embedding.worker.ts";

const embeddingWorker = useMemo(() => new EmbeddingWorker(), []);
// Initialize model
useEffect(() => {
  embeddingWorker.postMessage({
    type: "INIT_MODEL",
    model: "all-MiniLM-L6-v2",
    device: "webgpu",
  });
}, [embeddingWorker]);
```

### 5.2 Replace keywordSearch with Semantic Search

```typescript
// src/App.tsx
const {
  search,
  results: semanticResults,
  isSearching,
} = useSemanticSearch(dbService.current, webGpuScore);

// Replace keywordSearch call:
useEffect(() => {
  if (debouncedQuery.trim()) {
    search(debouncedQuery);
  }
}, [debouncedQuery, search]);

// Use semanticResults instead of keyword results
```

### 5.3 Wire Query Embedding

In `useSemanticSearch.ts`, replace zero-filled stub:

```typescript
// Instead of: const queryEmbedding = new Float32Array(EMBEDDING_DIM);
const queryEmbedding = await generateQueryEmbedding(query, embeddingWorker);
```

## 6. TDD Test Cases

```typescript
// tests/hooks/useSemanticSearch.integration.test.ts
describe("useSemanticSearch with embedding worker", () => {
  it("should embed query string via worker", () => {});
  it("should return results ranked by cosine similarity", () => {});
  it("should fall back to BM25 when WebGPU score is low", () => {});
  it("should display results in sidebar", () => {});
});
```

## 7. Files to Modify

| File                             | Change                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------- |
| `src/App.tsx`                    | Replace `keywordSearch`, instantiate embedding worker, use `semanticResults` |
| `src/hooks/useSemanticSearch.ts` | Replace zero-filled query embedding with worker call                         |
| `src/components/Sidebar.tsx`     | Ensure search results render from semanticResults                            |
