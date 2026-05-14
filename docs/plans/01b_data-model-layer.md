---
title: "Plan 01b — Data & Model Layer"
plan_id: "01b_data-model-layer"
status: "In-Progress"
author: "Planning Agent"
created: "2026-05-12"
updated: "2026-05-12"
completed: null
priority: "High"
story_points: 6
effort_days: 1.5
depends_on: [01a_worker-runtime]
depends_on_external: []
phase: 1
drift_of: null
archived_date: null
archive_log: null
---

> **Peer Review Note**: 0% of acceptance criteria are implemented. This plan is the critical path blocker for Plans 03a through 05b. The `Note` type exists (`src/types/note.ts`) but the SQLite worker, Web Locks wrapper, ModelManager, and loading state hooks are all pending.

## 1. Objective

Build the data persistence and model runtime layer: wa-sqlite WASM worker, Web Locks API concurrency, ModelManager class, and loading state orchestration. This layer manages the payload — the data that flows through the worker transport layer.

## 2. Scope

### In Scope

- [ ] wa-sqlite WASM worker with OPFS persistence
- [ ] Web Locks API concurrency management
- [ ] ModelManager class (sequential loading, Cache API)
- [ ] Loading state orchestration (useReducer pattern)
- [ ] Database schema creation
- [ ] Database service tests
- [ ] ModelManager tests
- [ ] Loading state tests

### Out of Scope

- [ ] Worker messaging (covered in Plan 01a)
- [ ] WebGPU detection (covered in Plan 01a)

## 3. Acceptance Criteria

| #   | Criterion                                                                     | Verification Method | Status |
| --- | ----------------------------------------------------------------------------- | ------------------- | ------ |
| 1   | wa-sqlite initializes and mounts OPFS database file                           | Unit Test           | `[ ]`  |
| 2   | Database schema creates `notes` and `note_embeddings` tables                  | Unit Test           | `[ ]`  |
| 3   | Web Locks API provides exclusive/shared lock modes                            | Unit Test           | `[ ]`  |
| 4   | ModelManager loads embedding model sequentially without exceeding VRAM budget | Integration Test    | `[ ]`  |
| 5   | Loading state reducer tracks all 4 component states correctly                 | Unit Test           | `[ ]`  |

## 4. TDD Test Cases

### Test Suite: Database Service

```typescript
// tests/workers/sqlite-service.test.ts
describe("DbService", () => {
  it("should initialize and mount OPFS database", () => {});
  it("should create notes table with correct schema", () => {});
  it("should create note_embeddings table with correct schema", () => {});
  it("should query notes by updated_at DESC", () => {});
  it("should handle MOUNTED and MOUNT_ERROR messages", () => {});
});

// tests/workers/web-locks.test.ts
describe("Web Locks API", () => {
  it("should acquire exclusive lock", () => {});
  it("should acquire shared lock", () => {});
  it("should timeout on lock acquisition", () => {});
  it("should support optimistic locking with note_version", () => {});
});
```

### Test Suite: Model Runtime

```typescript
// tests/workers/model-manager.test.ts
describe("ModelManager", () => {
  it("should load embedding model", () => {});
  it("should dispose previous model before loading next", () => {});
  it("should track model loading states independently", () => {});
  it("should cache model files via Cache API", () => {});
  it("should check cached model availability", () => {});
});
```

### Test Suite: Loading State

```typescript
// tests/hooks/loading-state.test.ts
describe("Loading State Reducer", () => {
  it("should start with all components idle", () => {});
  it("should transition component to loading", () => {});
  it("should transition component to ready", () => {});
  it("should transition component to error", () => {});
  it("should report fully ready when all components are ready", () => {});
  it("should report any error when at least one component errors", () => {});
});
```

## 5. Technical Approach

### 5.1 Database Schema

Create SQLite schema per `02_storage_layer_spec.md`. Tables: `notes`, `note_embeddings`, `notes_fts`.

### 5.2 Web Locks API

Implement Web Locks API wrapper for concurrency management. Use exclusive/shared lock modes.

### 5.3 Model Runtime

Implement ModelManager per `03_model_runtime_spec.md`. Sequential loading: dispose embedding model before loading LLM, and vice versa.

### 5.4 Loading State

Implement useReducer-based loading state orchestration per `07_ui_state_management_spec.md`. Track webgpu, sqlite, embeddingWorker, llmWorker states.

## 6. Dependencies

- Plan 01a (Worker Runtime) — WorkerManager, message contract
- `wa-sqlite` (WASM SQLite)
- `@xenova/transformers` (Transformers.js v3)

## 7. Risks & Mitigations

| Risk                                | Impact | Mitigation                                   |
| ----------------------------------- | ------ | -------------------------------------------- |
| OPFS not available in browser       | High   | Feature detection with fallback to IndexedDB |
| Model download timeout (cold start) | Medium | Cache API with progress indicator            |

## 8. Test Strategy

| Test Type | Scope                    | Location                               |
| --------- | ------------------------ | -------------------------------------- |
| Unit      | DbService initialization | `tests/workers/sqlite-service.test.ts` |
| Unit      | Web Locks API            | `tests/workers/web-locks.test.ts`      |
| Unit      | ModelManager             | `tests/workers/model-manager.test.ts`  |
| Unit      | Loading state reducer    | `tests/hooks/loading-state.test.ts`    |

## 9. Files to Create / Modify

| File                                   | Action | Description                    |
| -------------------------------------- | ------ | ------------------------------ |
| `src/types/database.ts`                | Create | Database type definitions      |
| `src/types/models.ts`                  | Create | Model runtime type definitions |
| `src/workers/sqlite.worker.ts`         | Create | SQLite WASM worker             |
| `src/workers/embedding.worker.ts`      | Create | Embedding pipeline worker      |
| `src/workers/llm.worker.ts`            | Create | LLM inference worker           |
| `src/hooks/useModelManager.ts`         | Create | Model loading hook             |
| `src/hooks/useLoadingState.ts`         | Create | Loading state hook             |
| `src/hooks/useDbService.ts`            | Create | Database service hook          |
| `src/utils/web-locks.ts`               | Create | Web Locks API wrapper          |
| `tests/workers/sqlite-service.test.ts` | Create | Database service tests         |
| `tests/workers/web-locks.test.ts`      | Create | Web Locks tests                |
| `tests/workers/model-manager.test.ts`  | Create | ModelManager tests             |
| `tests/hooks/loading-state.test.ts`    | Create | Loading state tests            |

## 10. Completion Checklist

- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No regressions in existing features
