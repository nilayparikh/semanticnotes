---
title: "Drift Plan 01 — Real Note & Search Flow (E2E)"
plan_id: "drift-2026-05-18-11-24-01_real_note_search_flow"
status: "Draft"
author: "Default Subagent"
created: "2026-05-18"
updated: "2026-05-18"
completed: null
priority: "Critical"
story_points: 8
effort_days: 1.5
depends_on:
  - "drift-2026-05-17-full-flow-01_sqlite_storage"
  - "drift-2026-05-17-full-flow-02_semantic_search"
depends_on_external: []
phase: null
parent_drift_index: "docs/plans/drifts/README.md"
source_drifts: []
drift_of: null
archived_date: null
archive_log: null
---

## 1. Objective

Close the gap between stubbed/mock implementations and a real browser product flow. Ensure that creating, editing, persisting, and searching notes works end-to-end in the browser with:

- **SQLite/OPFS persistence** — notes survive page reloads via the real `wa-sqlite` worker.
- **BM25/FTS search** — full-text search stays in sync with persisted notes.
- **Embedding/vector persistence** — embeddings computed via the real worker/model pipeline and stored in SQLite.
- **Semantic search** — cosine-similarity search against persisted vectors.
- **UI readiness/save states** — expose loading and save indicators so E2E assertions are reliable.

Unit tests may remain stubbed where they already cover the logic; **E2E tests must be real** (headless browser, real workers, real models).

## 2. Scope

### In Scope

- [ ] Wire `NoteEditor` → `useNoteManager` → real SQLite worker for create/edit/delete
- [ ] Persist notes to OPFS via `wa-sqlite` (no in-memory fallback)
- [ ] Keep BM25/FTS index in sync on every note mutation
- [ ] Compute embeddings via real worker/model path and persist `Float32Array` vectors
- [ ] Query semantic search against persisted vectors (real cosine similarity)
- [ ] Expose `isSaving`, `isReady`, `isLoadingModel` states for E2E selectors
- [ ] E2E test: create note → reload → verify persistence → search (BM25 + semantic)

### Out of Scope

- [ ] Chat/RAG pipeline (covered by drift-03)
- [ ] Model download UI polish (covered by drift-05)
- [ ] Layout structure changes (covered by plan 05a/05b)
- [ ] Writing new unit tests (existing stubs are sufficient)

## 3. Acceptance Criteria

| #   | Criterion                                                | Verification Method | Status |
| --- | -------------------------------------------------------- | ------------------- | ------ |
| 1   | Creating a note in UI persists to SQLite/OPFS            | E2E Test            | `[ ]`  |
| 2   | Editing a note updates the persisted record              | E2E Test            | `[ ]`  |
| 3   | Deleting a note removes it from SQLite/OPFS              | E2E Test            | `[ ]`  |
| 4   | BM25/FTS search returns results matching persisted notes | E2E Test            | `[ ]`  |
| 5   | Embeddings are computed and stored as vectors            | E2E Test            | `[ ]`  |
| 6   | Semantic search returns semantically similar notes       | E2E Test            | `[ ]`  |
| 7   | Save/loading states are visible and queryable by E2E     | E2E Test            | `[ ]`  |
| 8   | Notes survive full page reload (F5)                      | E2E Test            | `[ ]`  |

> **Agent Note**: After implementation, run `npx vitest run tests/e2e --config vitest.config.ts --browser chrome --headless` to verify each criterion. Mark `[x]` only after evidence-based confirmation using `verification-before-completion` skill.

## 4. E2E Test Cases

### Test Suite: Real Note & Search Flow

```typescript
describe("Real Note & Search Flow", () => {
  it("should create a note and persist it to SQLite/OPFS", async () => {
    // Create note via UI → reload → verify note appears in list
  });

  it("should edit a note and persist the changes", async () => {
    // Edit note → reload → verify updated content
  });

  it("should delete a note and remove from storage", async () => {
    // Delete note → reload → verify note is gone
  });

  it("should search notes via BM25/FTS and return matches", async () => {
    // Create notes → search → verify results
  });

  it("should compute embeddings and support semantic search", async () => {
    // Create notes → wait for embeddings → semantic search → verify results
  });

  it("should expose save/readiness states for E2E assertions", async () => {
    // Verify data-testid attributes for loading/saving states
  });
});
```

## 5. Technical Approach

1. **Verify SQLite Worker** — Confirm `wa-sqlite` worker is loaded and connected on app init (no in-memory fallback).
2. **Wire Note CRUD** — Ensure `useNoteManager` hook dispatches to real worker, not mock.
3. **FTS Sync** — On every `INSERT`/`UPDATE`/`DELETE`, trigger FTS reindex.
4. **Embedding Pipeline** — On note save, dispatch to embedding worker → store `Float32Array` in SQLite `REAL[]` column.
5. **Semantic Search** — Query worker for cosine similarity against persisted vectors.
6. **UI State Indicators** — Add `data-testid="note-saving"` and `data-testid="model-ready"` attributes for E2E selectors.
7. **E2E Tests** — Write Playwright/Vitest tests in `tests/e2e/` using real browser.

## 6. Dependencies

- [ ] `drift-2026-05-17-full-flow-01_sqlite_storage` — SQLite storage must be wired first
- [ ] `drift-2026-05-17-full-flow-02_semantic_search` — Semantic search wiring must be in place

## 7. Risks & Mitigations

| Risk                                  | Impact | Mitigation                                               |
| ------------------------------------- | ------ | -------------------------------------------------------- |
| WebGPU model loading slow in E2E      | High   | Set timeout thresholds; use smaller model for CI         |
| OPFS not available in headless Chrome | Medium | Verify Chrome flags; fallback to localStorage            |
| Embedding worker hangs                | Medium | Add timeout + error state to `useEmbeddingPipeline` hook |
| FTS index out of sync                 | Medium | Use SQLite triggers for automatic reindex                |

## 8. Test Strategy

| Test Type | Scope                   | Location                            |
| --------- | ----------------------- | ----------------------------------- |
| E2E       | Note CRUD + persistence | `tests/e2e/note-lifecycle.test.tsx` |
| E2E       | BM25 + Semantic search  | `tests/e2e/search.test.tsx`         |

## 9. File Targets

| File                                | Change                            |
| ----------------------------------- | --------------------------------- |
| `src/hooks/useNoteManager.ts`       | Wire to real SQLite worker        |
| `src/hooks/useEmbeddingPipeline.ts` | Wire to real embedding worker     |
| `src/hooks/useSemanticSearch.ts`    | Query persisted vectors           |
| `src/components/NoteEditor.tsx`     | Expose save state via data-testid |
| `src/components/NoteList.tsx`       | Expose readiness state            |
| `tests/e2e/`                        | New E2E test files                |
