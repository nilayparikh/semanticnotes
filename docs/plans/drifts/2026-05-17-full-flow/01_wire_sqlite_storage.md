---
title: "Group 1 — Wire SQLite Storage to Note CRUD"
plan_id: "drift-2026-05-17-full-flow-01_sqlite_storage"
status: "Complete"
author: "Planning Agent"
created: "2026-05-17"
updated: "2026-05-17"
completed: "2026-05-17"
priority: "Critical"
story_points: 4
effort_days: 0.5
depends_on: []
depends_on_external: ["@vscode/sqlite3"]
phase: null
parent_drift_index: "docs/plans/drifts/2026-05-17-full-flow/README.md"
source_drifts: ["drift-2026-05-17-assessment#critical-1"]
archived_date: null
archive_log: null
---

## 1. Objective

Replace the in-memory `DbService` mock in `App.tsx` with the real `DbService` class from `useDbService.ts`. Route all note CRUD (create, update, delete, list) through SQLite and hydrate notes at startup from persisted store.

## 2. Scope

### In Scope

- [ ] Instantiate `sqlite.worker.ts` via `useDbService` hook in `App.tsx`
- [ ] Replace `InMemoryDbService` class with `DbService` from `useDbService`
- [ ] Wire `useNoteManager` to persist notes to SQLite on every mutation
- [ ] Hydrate notes from SQLite on app startup (SELECT \* FROM notes)
- [ ] Persist note embeddings to `note_embeddings` table on update
- [ ] Debounced save (1000ms) to SQLite (reuse `useNoteSaveDebounce`)

### Out of Scope

- New component creation
- UI styling changes
- Search or chat wiring (Group 2, 3)

## 3. Acceptance Criteria

| #   | Criterion                                                    | Verification Method | Status |
| --- | ------------------------------------------------------------ | ------------------- | ------ |
| 1   | `App.tsx` uses `useDbService` instead of `InMemoryDbService` | Code Review         | `[ ]`  |
| 2   | Notes created via `useNoteManager` are INSERTed into SQLite  | Integration Test    | `[ ]`  |
| 3   | Notes updated via `useNoteManager` are UPDATEd in SQLite     | Integration Test    | `[ ]`  |
| 4   | Notes survive page reload (SELECT \* FROM notes on mount)    | Manual              | `[ ]`  |
| 5   | Embeddings are stored in `note_embeddings` table             | Integration Test    | `[ ]`  |

## 4. Current Code Analysis

### `src/App.tsx` (lines 20-45)

```typescript
// In-memory mock — needs to be replaced
class InMemoryDbService implements DbServiceInterface {
  // ...
}
```

### `src/hooks/useDbService.ts` (lines 1-60)

Real `DbService` class exists, accepts a `DedicatedWorker`. Worker messages are handled (`MOUNT`, `QUERY`, `RESULT`, `COMMIT`).

### `src/hooks/useNoteManager.ts`

Pure reducer, no DB interaction. Needs to accept a `DbService` and dispatch writes.

### `src/hooks/useNoteSaveDebounce.ts`

Debounce hook exists, can be wired to trigger SQLite writes.

## 5. Technical Approach

### 5.1 Instantiate Worker in App

```typescript
// src/App.tsx
import { DbService } from "@/hooks/useDbService";
import SqliteWorker from "@/workers/sqlite.worker.ts";

export default function App() {
  const sqliteWorker = useMemo(() => new SqliteWorker(), []);
  const dbService = useRef(new DbService(sqliteWorker));

  useEffect(() => {
    dbService.current.initialize();
  }, [dbService]);
```

### 5.2 Wire NoteManager to DbService

Modify `useNoteManager` to accept `DbService`:

```typescript
export function useNoteManager(dbService: DbServiceInterface) {
  // On CREATE_NOTE: INSERT INTO notes (id, title, content, updated_at) VALUES (...)
  // On UPDATE_NOTE: UPDATE notes SET content = ?, updated_at = ? WHERE id = ?
  // On DELETE_NOTE: DELETE FROM notes WHERE id = ?
  // On mount: SELECT * FROM notes ORDER BY updated_at DESC
```

### 5.3 Hydrate on Startup

```typescript
// On component mount, after dbService.ready resolves:
const existingNotes = await dbService.query(
  "SELECT * FROM notes ORDER BY updated_at DESC",
);
existingNotes.forEach((note) => dispatch({ type: "CREATE_NOTE", note }));
```

## 6. TDD Test Cases

```typescript
// tests/hooks/useNoteManager.integration.test.ts
describe("useNoteManager with DbService", () => {
  it("should INSERT notes into SQLite on create", () => {});
  it("should UPDATE notes in SQLite on change", () => {});
  it("should DELETE notes from SQLite on delete", () => {});
  it("should hydrate notes from SQLite on mount", () => {});
});
```

## 7. Files to Modify

| File                               | Change                                          |
| ---------------------------------- | ----------------------------------------------- |
| `src/App.tsx`                      | Replace `InMemoryDbService`, instantiate worker |
| `src/hooks/useNoteManager.ts`      | Accept `DbService`, wire CRUD to SQL            |
| `src/hooks/useNoteSaveDebounce.ts` | Wire to SQLite write                            |
