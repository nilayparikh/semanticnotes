# Plan 03a — Embedding Pipeline

**Status**: `Complete`  
**Author**: Planning Agent  
**Created**: 2026-05-12  
**Last Updated**: 2026-05-12  
**Priority**: `High`  
**Estimated Effort**: 5 Story Points / 1 Day

## 1. Objective

Build the embedding pipeline: text chunking, cosine similarity computation, and vector storage in SQLite. This is the computation layer for semantic search — the engine that transforms note text into 384-dim vectors.

## 2. Scope

### In Scope

- [x] Text chunking (256-token sliding window with 64-token overlap)
- [x] Cosine similarity computation between Float32Array vectors
- [x] Vector storage in `note_embeddings` table
- [x] Embedding debounce to prevent race conditions
- [x] Embedding pipeline tests
- [x] Cosine similarity tests

### Out of Scope

- [ ] Semantic search hook (covered in Plan 03b)
- [ ] BM25 fallback (covered in Plan 03b)

## 3. Acceptance Criteria

| #   | Criterion                                                    | Status |
| --- | ------------------------------------------------------------ | ------ |
| 1   | Text is chunked into 256-token windows with 64-token overlap | `[x]`  |
| 2   | 384-dim embedding is computed for each chunk                 | `[x]`  |
| 3   | Cosine similarity scores are computed correctly              | `[x]`  |
| 4   | Embeddings are stored as Float32Array BLOBs in SQLite        | `[x]`  |
| 5   | Embedding debounce prevents race conditions                  | `[x]`  |

## 4. TDD Test Cases

### Test Suite: Embedding Pipeline

```typescript
// tests/workers/embedding-pipeline.test.ts
describe("Embedding Pipeline", () => {
  it("should chunk text into 256-token windows with 64-token overlap", () => {});
  it("should compute 384-dim embedding for a chunk", () => {});
  it("should debounce embedding computation", () => {});
  it("should save embeddings to note_embeddings table", () => {});
  it("should handle model version migration", () => {});
});
```

### Test Suite: Cosine Similarity

```typescript
// tests/utils/cosine-similarity.test.ts
describe("Cosine Similarity", () => {
  it("should compute cosine similarity between two 384-dim vectors", () => {});
  it("should return 1.0 for identical vectors", () => {});
  it("should return 0.0 for orthogonal vectors", () => {});
  it("should search vectors and return top-N results", () => {});
  it("should handle Float32Array typed arrays", () => {});
});
```

## 5. Technical Approach

### 5.1 Text Chunking

Follow `04_embedding_pipeline_spec.md`:

- Chunk notes using 256-token sliding window with 64-token overlap
- Each chunk is a Float32Array of 384 dimensions

### 5.2 Cosine Similarity

Follow `04_embedding_pipeline_spec.md` Section 4:

- Pure JS `for` loop over Float32Array
- 384 dimensions per vector
- Batch search with top-N sorting

## 6. Dependencies

- Plan 01b (Data & Model Layer) — Embedding worker, ModelManager

## 7. Risks & Mitigations

| Risk                                   | Impact | Mitigation                                |
| -------------------------------------- | ------ | ----------------------------------------- |
| Embedding computation lag on basic GPU | Medium | BM25 fallback (Plan 03b)                  |
| Vector storage bloat (100+ notes)      | Low    | Chunk-level storage with model versioning |

## 8. Test Strategy

| Test Type | Scope             | Location                                   |
| --------- | ----------------- | ------------------------------------------ |
| Unit      | Text chunking     | `tests/workers/embedding-pipeline.test.ts` |
| Unit      | Cosine similarity | `tests/utils/cosine-similarity.test.ts`    |

## 9. Files to Create / Modify

| File                                       | Action | Description                       |
| ------------------------------------------ | ------ | --------------------------------- |
| `src/utils/cosine-similarity.ts`           | Create | Cosine similarity computation     |
| `src/utils/text-chunking.ts`               | Create | 256-token sliding window chunking |
| `src/hooks/useEmbeddingPipeline.ts`        | Create | Embedding pipeline hook           |
| `tests/workers/embedding-pipeline.test.ts` | Create | Embedding pipeline tests          |
| `tests/utils/cosine-similarity.test.ts`    | Create | Cosine similarity tests           |

## 10. Completion Checklist

- [x] All acceptance criteria met
- [x] Tests written and passing
- [x] Code reviewed
- [x] Documentation updated
- [x] No regressions in existing features

## 11. Implementation Summary

| File                                       | Status | Description                       |
| ------------------------------------------ | ------ | --------------------------------- |
| `src/utils/cosine-similarity.ts`           | ✅     | Cosine similarity computation     |
| `src/utils/text-chunking.ts`               | ✅     | 256-token sliding window chunking |
| `src/hooks/useEmbeddingPipeline.ts`        | ✅     | Embedding pipeline hook           |
| `tests/utils/cosine-similarity.test.ts`    | ✅     | Cosine similarity tests (9)       |
| `tests/utils/text-chunking.test.ts`        | ✅     | Text chunking tests (11)          |
| `tests/hooks/useEmbeddingPipeline.test.ts` | ✅     | Embedding pipeline tests (4)      |

**Total Tests**: 24 passed across 3 test suites.
