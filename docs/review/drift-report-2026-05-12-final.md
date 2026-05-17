# Drift Report — 2026-05-12 (Final Verification)

## Drifts Identified

### 1. `Note.id` Type Mismatch (Code vs Functional Spec)

**Severity**: Medium
**Location**: `src/types/database.ts` (line 10)
**Evidence**:

- Functional spec (`docs/functional/01_note_management.md`): `id TEXT PRIMARY KEY`
- Implementation (`src/types/note.ts`): `id: string` (using `crypto.randomUUID()`)
- Database schema (`src/types/database.ts`): `id INTEGER PRIMARY KEY AUTOINCREMENT`
- Database row type (`src/types/database.ts`): `NoteRow.id: number`

**Impact**: Notes generated with UUID strings in the UI layer will need implicit type conversion when stored in SQLite INTEGER column.

**Fix**: Change `NoteRow.id` to `string` and update schema SQL to `id TEXT PRIMARY KEY`.

### 2. `@xenova/transformers` Version (Already Fixed)

**Severity**: Low
**Location**: `package.json`
**Evidence**:

- Architecture spec: Transformers.js v3 (WebGPU)
- `package.json`: `"@xenova/transformers": "^3.0.0"` ✅

**Status**: Resolved — package.json now correctly references v3.

### 3. Worker Message Types (Already Fixed)

**Severity**: Low
**Location**: `src/types/worker-messages.ts`
**Evidence**:

- Plan 01a spec: `llm:query`, `llm:token`, `llm:done`, `sqlite:ready`, `worker:error`
- Implementation: All 5 types present ✅

**Status**: Resolved.

### 4. FTS5 Table & Indexes (Already Verified)

**Severity**: Low
**Location**: `src/workers/sqlite.worker.ts`
**Evidence**:

- Schema includes `NOTES_FTS_SQL` for FTS5 table ✅
- Worker executes `NOTES_FTS_SQL` on MOUNT ✅
- `INDEXES_SQL` loop creates all 3 indexes ✅

**Status**: Resolved.

## Acceptance Criteria Status

| Plan                 | Scope Items | Acceptance Criteria | Status      |
| -------------------- | ----------- | ------------------- | ----------- |
| 00_project-setup     | All `[x]`   | All `[x]`           | ✅ Complete |
| 01a_worker-runtime   | All `[x]`   | All `[x]`           | ✅ Complete |
| 01b_data-model-layer | All `[x]`   | All `[x]`           | ✅ Complete |

## Remaining Work

- [x] Mark plan scope items as `[x]`
- [x] Mark acceptance criteria as `[x]`
- [x] Verify `@xenova/transformers` version in package.json
- [x] Verify worker message types
- [x] Verify FTS5 table creation in sqlite worker
- [x] Verify `INDEXES_SQL` loop in sqlite worker
- [ ] Fix `NoteRow.id` type drift (string vs number)

</content>
</function>
</tool_call>
<tool_call>
<function=replace_string_in_file>
<parameter=filePath>
y:\.sources\showcases\semanticnotes.ai\src\types\database.ts
