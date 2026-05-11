# Plan 02a — Note CRUD

**Status**: `Draft`  
**Author**: Planning Agent  
**Created**: 2026-05-12  
**Last Updated**: 2026-05-12  
**Priority**: `High`  
**Estimated Effort**: 4 Story Points / 1 Day

## 1. Objective

Implement the note data model and CRUD operations: create, read, update, and delete notes with SQLite persistence via wa-sqlite worker. This is the data layer for note management — the foundation for all note-related features.

## 2. Scope

### In Scope

- [ ] Note type definitions (id, title, content, updated_at)
- [ ] Note creation with unique ID and metadata
- [ ] Note persistence to SQLite `notes` table
- [ ] Note update with optimistic locking (`note_version`)
- [ ] Note deletion by ID
- [ ] Note listing ordered by `updated_at` DESC
- [ ] Debounced auto-save (1000ms interval)
- [ ] Note CRUD tests
- [ ] Debounce save tests

### Out of Scope

- [ ] Markdown editor UI (covered in Plan 02b)
- [ ] Note list UI (covered in Plan 02b)
- [ ] Semantic search (covered in Plan 03b)

## 3. Acceptance Criteria

| #   | Criterion                                                                 | Status |
| --- | ------------------------------------------------------------------------- | ------ |
| 1   | User can create a new note with unique ID, title, content, and updated_at | `[ ]`  |
| 2   | Notes are persisted to SQLite `notes` table                               | `[ ]`  |
| 3   | Changes are saved to SQLite on 1000ms debounce                            | `[ ]`  |
| 4   | Note updates use optimistic locking with `note_version`                   | `[ ]`  |
| 5   | Notes can be deleted by ID                                                | `[ ]`  |

## 4. TDD Test Cases

### Test Suite: Note CRUD Operations

```typescript
// tests/hooks/useNoteManager.test.ts
describe("useNoteManager", () => {
  it("should create a new note with id, title, content, updated_at", () => {});
  it("should save note to SQLite notes table", () => {});
  it("should update note content with optimistic locking", () => {});
  it("should delete a note by ID", () => {});
  it("should list all notes ordered by updated_at DESC", () => {});
  it("should select a note by ID", () => {});
  it("should debounce saves at 1000ms interval", () => {});
});
```

### Test Suite: Note Save Service

```typescript
// tests/utils/note-save.test.ts
describe("NoteSaveService", () => {
  it("should debounce multiple keystrokes within 1000ms", () => {});
  it("should persist note to SQLite after debounce", () => {});
  it("should handle concurrent saves with note_version", () => {});
  it("should update updated_at and updated_ts on save", () => {});
});
```

## 5. Technical Approach

### 5.1 Note Data Model

Follow the schema from `02_storage_layer_spec.md`:

```sql
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  note_version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_ts INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

### 5.2 Debounce Strategy

Use a 1000ms debounce on the editor textarea. On each keystroke, reset the timer. When the timer fires, save to SQLite with optimistic locking (`note_version`).

### 5.3 State Management

Use `useReducer` for note state. Dispatch actions: `CREATE_NOTE`, `UPDATE_NOTE`, `SELECT_NOTE`, `DELETE_NOTE`.

## 6. Dependencies

- Plan 01b (Data & Model Layer) — wa-sqlite worker, DbService

## 7. Risks & Mitigations

| Risk                                    | Impact | Mitigation                                         |
| --------------------------------------- | ------ | -------------------------------------------------- |
| Debounce race conditions (rapid typing) | Medium | Timestamp-gated debounce with currentDebounceId    |
| SQLite write conflicts (multi-tab)      | Medium | Web Locks API with exclusive lock on INSERT/UPDATE |

## 8. Test Strategy

| Test Type | Scope                | Location                             |
| --------- | -------------------- | ------------------------------------ |
| Unit      | Note CRUD operations | `tests/hooks/useNoteManager.test.ts` |
| Unit      | Debounce save logic  | `tests/utils/note-save.test.ts`      |

## 9. Files to Create / Modify

| File                                 | Action | Description                            |
| ------------------------------------ | ------ | -------------------------------------- |
| `src/types/note.ts`                  | Create | Note type definitions                  |
| `src/hooks/useNoteManager.ts`        | Create | Note CRUD hook with SQLite persistence |
| `src/hooks/useNoteSaveDebounce.ts`   | Create | Debounced save hook                    |
| `src/utils/relative-time.ts`         | Create | Relative timestamp utility             |
| `tests/hooks/useNoteManager.test.ts` | Create | Note manager tests                     |
| `tests/utils/note-save.test.ts`      | Create | Debounce save tests                    |

## 10. Completion Checklist

- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No regressions in existing features
