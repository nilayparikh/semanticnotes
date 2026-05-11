# Plan 03b — Semantic Search

**Status**: `Draft`  
**Author**: Planning Agent  
**Created**: 2026-05-12  
**Last Updated**: 2026-05-12  
**Priority**: `High`  
**Estimated Effort**: 5 Story Points / 1 Day

## 1. Objective

Implement the semantic search hook and BM25 fallback: query embedding, similarity scoring, and search results display. This is the query layer for semantic search — the user-facing interface for finding notes by vector similarity.

## 2. Scope

### In Scope

- [ ] Semantic search input field in sidebar
- [ ] Query embedding via all-MiniLM-L6-v2 (384 dimensions)
- [ ] Search results display with percentage scores
- [ ] BM25 keyword search fallback (SQLite FTS5)
- [ ] Semantic search hook
- [ ] BM25 fallback implementation
- [ ] Search results component
- [ ] Semantic search tests
- [ ] BM25 fallback tests

### Out of Scope

- [ ] Text chunking (covered in Plan 03a)
- [ ] Cosine similarity (covered in Plan 03a)

## 3. Acceptance Criteria

| #   | Criterion                                                        | Status |
| --- | ---------------------------------------------------------------- | ------ |
| 1   | Sidebar contains search input labeled "🔍 AI Semantic Search..." | `[ ]`  |
| 2   | Query string is embedded to 384-dim vector on keystroke          | `[ ]`  |
| 3   | Search results display proximity percentages (e.g., "94%")       | `[ ]`  |
| 4   | BM25 fallback activates when WebGPU score < 31                   | `[ ]`  |
| 5   | Search results highlight matching notes in sidebar               | `[ ]`  |

## 4. TDD Test Cases

### Test Suite: Semantic Search

```typescript
// tests/hooks/useSemanticSearch.test.ts
describe("useSemanticSearch", () => {
  it("should embed query string on keystroke", () => {});
  it("should compute similarity scores for all notes", () => {});
  it("should return top-matching notes with percentages", () => {});
  it("should fall back to BM25 when WebGPU score is low", () => {});
  it("should display search results in sidebar", () => {});
});
```

### Test Suite: BM25 Fallback

```typescript
// tests/workers/bm25-fallback.test.ts
describe("BM25 Fallback", () => {
  it("should create FTS5 virtual table", () => {});
  it("should search notes_fts by title and content", () => {});
  it("should return BM25 scores for each note", () => {});
  it("should activate when GPU score < 31", () => {});
});
```

## 5. Technical Approach

### 5.1 BM25 Fallback

Follow `03_model_runtime_spec.md` Section 5.3:

- SQLite FTS5 virtual table
- Index `title` and `content` columns
- Activate when WebGPU capability score < 31

### 5.2 Search Results Display

Display results in sidebar with proximity percentages. Highlight matching notes with score badges.

## 6. Dependencies

- Plan 03a (Embedding Pipeline) — Text chunking, cosine similarity
- Plan 02a (Note CRUD) — Note data

## 7. Risks & Mitigations

| Risk                         | Impact | Mitigation                              |
| ---------------------------- | ------ | --------------------------------------- |
| WebGPU model loading timeout | Medium | Loading overlay with progress indicator |

## 8. Test Strategy

| Test Type | Scope                | Location                                |
| --------- | -------------------- | --------------------------------------- |
| Unit      | Semantic search hook | `tests/hooks/useSemanticSearch.test.ts` |
| Unit      | BM25 fallback        | `tests/workers/bm25-fallback.test.ts`   |

## 9. Files to Create / Modify

| File                                     | Action | Description                  |
| ---------------------------------------- | ------ | ---------------------------- |
| `src/hooks/useSemanticSearch.ts`         | Create | Semantic search hook         |
| `src/hooks/useBm25Fallback.ts`           | Create | BM25 keyword search fallback |
| `src/components/SemanticSearchInput.tsx` | Create | Sidebar search input         |
| `src/components/SearchResults.tsx`       | Create | Search results display       |
| `tests/hooks/useSemanticSearch.test.ts`  | Create | Semantic search tests        |
| `tests/workers/bm25-fallback.test.ts`    | Create | BM25 fallback tests          |

## 10. Completion Checklist

- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No regressions in existing features
