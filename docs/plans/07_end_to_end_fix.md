---
title: "Plan 07 — End-to-End Fix: Persistence, Embeddings, and Hybrid Search"
plan_id: "07_end-to-end-fix"
status: "Complete"
author: "Orchestrator Agent"
created: "2026-05-18"
updated: "2026-05-18"
completed: null
priority: "Critical"
story_points: 8
effort_days: 1.5
depends_on:
  [
    "01a_worker-runtime",
    "01b_data-model-layer",
    "02a_note-crud",
    "03a_embedding-pipeline",
    "03b_semantic-search",
  ]
depends_on_external: ["@xenova/transformers", "wa-sqlite"]
phase: 3
drift_of: null
archived_date: null
archive_log: null
---

# Plan 07 — End-to-End Fix: Persistence, Embeddings, and Hybrid Search

## 1. Problem Statement

The end-to-end user flow is broken in three critical areas:

1. **Note Persistence**: Notes appear to save (useNoteManager writes to SQLite on every keystroke), but there is no debounced autosave — the DB is hammered on every keystroke. There is no save status indicator. Tests fail because `Worker` is not defined in jsdom.

2. **Embedding Pipeline**: `useEmbeddingPipeline` is a stub — it chunks text but never calls the embedding worker, never computes embeddings, and never stores them in `note_embeddings`. The `embedding.worker.ts` exists but is completely unwired.

3. **Hybrid Search**: `useSemanticSearch` has the right structure but cannot function because no embeddings are stored in the database. The semantic path always reads an empty `note_embeddings` table. BM25 fallback exists but FTS5 content sync is untested.

4. **Test Infrastructure**: E2E test files have wrong extensions (`.ts` instead of `.tsx`). Component tests fail because `Worker` is not mocked. The test suite cannot validate the actual end-to-end flow.

## 2. Scope

### In Scope

- Wire `embedding.worker.ts` into `useEmbeddingPipeline`
- Store computed embeddings in `note_embeddings` table via SQLite worker
- Add debounced autosave to `NoteEditor` with save-status UI
- Fix hybrid search to work with stored embeddings
- Fix test infrastructure: mock Workers, fix file extensions
- Add integration tests for the full note → embedding → search flow

### Out of Scope

- Changing the UI layout or design system
- Adding new features beyond the existing spec
- LLM/chat pipeline fixes

## 3. Acceptance Criteria

| #   | Criterion                                                                                                                     | Verification Method                           | Status |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------ |
| 1   | `useEmbeddingPipeline` creates an EmbeddingWorker, sends INIT_MODEL + EMBED messages, and stores results in `note_embeddings` | Unit test + integration test                  | [ ]    |
| 2   | When a note is edited, embeddings are recomputed (debounced 1500ms) and stored in DB                                          | E2E test: edit note → query `note_embeddings` | [ ]    |
| 3   | Semantic search returns results with >0% similarity when matching notes exist                                                 | Unit test with mocked embeddings + E2E test   | [ ]    |
| 4   | BM25 fallback returns results when semantic search has no embeddings                                                          | Unit test for `useBm25Fallback`               | [ ]    |
| 5   | NoteEditor debounces saves (1000ms) and shows save status indicator                                                           | Unit test for debounce + UI test              | [ ]    |
| 6   | All tests pass (`npx vitest run`) with ≥80% line coverage                                                                     | `npx vitest run --coverage`                   | [ ]    |
| 7   | TypeScript compiles with no errors (`npx tsc --noEmit`)                                                                       | Build check                                   | [ ]    |
| 8   | E2E test files use `.tsx` extension where they contain JSX                                                                    | File inspection                               | [ ]    |

## 4. Implementation Tasks

### Task A: Fix Test Infrastructure

- Rename `tests/e2e/note-lifecycle.test.ts` → `.tsx`
- Rename `tests/e2e/search.test.ts` → `.tsx`
- Add `global.Worker` mock in `vitest.setup.ts` or test helpers
- Ensure `App.test.tsx` and E2E tests can render without `Worker is not defined`

### Task B: Wire Embedding Worker & Store Embeddings

- Update `useEmbeddingPipeline` to instantiate `EmbeddingWorker`
- Send `INIT_MODEL` on mount, `EMBED` on debounced note change
- On `EMBEDDING_READY`, insert/update `note_embeddings` row via `dbService.query`
- Handle `EMBEDDING_ERROR` gracefully (log, don't crash)
- Update `App.tsx` to pass `dbService` to `useEmbeddingPipeline`

### Task C: Debounced Autosave & Save Indicator

- Add 1000ms debounce to `NoteEditor` onChange → `onUpdate`
- Add visual save status ("Saving..." / "Saved" / "Unsaved changes") in `NoteEditor`
- Update `useNoteManager` to batch rapid updates

### Task D: Hybrid Search Integration

- Ensure `useSemanticSearch` reads from `note_embeddings` correctly
- Verify BM25 fallback path works when `webGpuScore < 31`
- Add combined hybrid scoring (semantic + BM25) in `App.tsx` search effect

### Task E: Integration Tests

- Add `tests/e2e/note-embedding-search.test.tsx` covering full flow
- Add `tests/hooks/useEmbeddingPipeline.integration.test.ts`

## 5. Files to Modify

| File                                       | Change                                              |
| ------------------------------------------ | --------------------------------------------------- |
| `src/hooks/useEmbeddingPipeline.ts`        | Wire worker, store embeddings                       |
| `src/App.tsx`                              | Pass dbService to embedding pipeline, handle search |
| `src/components/NoteEditor.tsx`            | Add debounce, save indicator                        |
| `src/hooks/useNoteManager.ts`              | Add save-status tracking                            |
| `tests/e2e/note-lifecycle.test.ts`         | Rename to `.tsx`, fix JSX                           |
| `tests/e2e/search.test.ts`                 | Rename to `.tsx`, fix JSX                           |
| `vitest.config.ts`                         | Add Worker mock setup                               |
| `tests/hooks/useEmbeddingPipeline.test.ts` | Add worker integration tests                        |
| `tests/e2e/note-embedding-search.test.tsx` | New: full flow test                                 |

## 6. Risks & Mitigations

| Risk                                        | Mitigation                                                           |
| ------------------------------------------- | -------------------------------------------------------------------- |
| Transformers.js model load is slow in tests | Mock the worker responses in unit tests; use real worker only in E2E |
| wa-sqlite FTS5 not compiled in              | Graceful fallback to keyword search already exists                   |
| Worker cross-origin issues in test env      | Mock Worker globally in vitest setup                                 |
| Embedding BLOB serialization issues         | Test Float32Array → Uint8Array → BLOB roundtrip                      |

## 7. References

- `docs/functional/01_note_management.md`
- `docs/functional/02_semantic_search.md`
- `docs/architecture/04_embedding_pipeline_spec.md`
- `docs/architecture/02_storage_layer_spec.md`
