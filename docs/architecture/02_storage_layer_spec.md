# Storage Layer Specification

## 1. Overview

The storage layer uses **wa-sqlite** (WASM-backed SQLite) persisted to the **Origin Private File System (OPFS)** as the primary data store. All notes, metadata, and embedding vectors are stored in a single SQLite database file.

## 2. Database Schema

```sql
-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL DEFAULT '',
  content    TEXT NOT NULL DEFAULT '',
  note_version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_ts INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Embedding vectors table
CREATE TABLE IF NOT EXISTS note_embeddings (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id        INTEGER NOT NULL,
  chunk_index    INTEGER NOT NULL DEFAULT 0,
  chunk_text     TEXT,
  embedding      BLOB NOT NULL,
  model_version  TEXT NOT NULL DEFAULT 'all-MiniLM-L6-v2',
  dim            INTEGER NOT NULL DEFAULT 384,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_ts     INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (note_id) REFERENCES notes(id),
  UNIQUE(note_id, chunk_index)
);

-- Indexes
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX idx_embeddings_note_id ON note_embeddings(note_id);
CREATE INDEX idx_embeddings_model ON note_embeddings(model_version);
```

## 3. Concurrency Model

### 3.1 Web Locks API

```typescript
type DbLockMode = "exclusive" | "shared";

interface LockOptions {
  mode: DbLockMode;
  timeoutMs?: number;
}

export async function withDbLock<T>(
  lockName: string,
  options: LockOptions,
  operation: () => Promise<T>,
): Promise<T> {
  return navigator.locks.request(
    lockName,
    {
      mode: options.mode,
      ifAvailable: options.timeoutMs ? true : false,
    },
    async () => operation(),
  );
}
```

### 3.2 Lock Strategy

| Operation              | Lock Mode   | Rationale                   |
| ---------------------- | ----------- | --------------------------- |
| INSERT / UPDATE note   | `exclusive` | Single writer per note      |
| SELECT (single note)   | `shared`    | Multiple concurrent readers |
| SELECT (vector search) | `shared`    | Read-heavy, rarely collides |
| Embedding save         | `exclusive` | Prevents stale overwrites   |

### 3.3 Optimistic Locking (note_version)

```typescript
interface NoteVersion {
  version: number;
  updated_at: string;
}

export async function saveNoteWithVersion(
  db: DbService,
  id: number,
  title: string,
  content: string,
  currentVersion: number,
): Promise<{ success: boolean; newVersion: number }> {
  const result = await db.run(
    `UPDATE notes 
     SET title = ?, content = ?, note_version = note_version + 1,
         updated_at = datetime('now'), updated_ts = strftime('%s', 'now')
     WHERE id = ? AND note_version = ?`,
    [title, content, id, currentVersion],
  );
  return {
    success: result.changes > 0,
    newVersion: currentVersion + 1,
  };
}
```

## 4. OPFS Mount Readiness

```typescript
export class DbService {
  #ready: Promise<void>;
  #resolveReady!: () => void;
  #rejectReady!: (reason: Error) => void;
  #worker: DedicatedWorker;

  constructor(worker: DedicatedWorker) {
    this.#worker = worker;
    this.#ready = new Promise((resolve, reject) => {
      this.#resolveReady = resolve;
      this.#rejectReady = reject;
    });
  }

  async initialize(): Promise<void> {
    this.#worker.postMessage({ type: "MOUNT", path: "semanticnotes.db" });
    this.#worker.addEventListener("message", (e: MessageEvent) => {
      if (e.data.type === "MOUNTED") this.#resolveReady();
      if (e.data.type === "MOUNT_ERROR") this.#rejectReady(e.data.error);
    });
  }

  async query(sql: string, params: any[]) {
    await this.#ready;
    return new Promise<any>((resolve, reject) => {
      const id = Date.now();
      this.#worker.postMessage({ type: "QUERY", id, sql, params });
      this.#worker.addEventListener(
        "message",
        (e: MessageEvent) => {
          if (e.data.id === id) {
            if (e.data.type === "RESULT") resolve(e.data.row);
            else reject(e.data.error);
          }
        },
        { once: true },
      );
    });
  }
}
```

## 5. Quota Management

```typescript
export async function checkQuota(): Promise<QuotaStatus> {
  const estimate = await navigator.storage.estimate();
  const persisted = await navigator.storage.persisted();
  return {
    usageBytes: estimate.usage!,
    quotaBytes: estimate.quota!,
    usagePercent: (estimate.usage! / estimate.quota!) * 100,
    isPersistent: persisted,
  };
}

export async function requestPersistentStorage(): Promise<boolean> {
  return navigator.storage.persist();
}

export async function monitorQuota(): Promise<boolean> {
  const status = await checkQuota();
  if (status.usagePercent > 80 && !status.isPersistent) {
    return requestPersistentStorage();
  }
  return true;
}
```

### 5.1 Quota Budget

| Resource                                      | Estimated Size | Notes           |
| --------------------------------------------- | -------------- | --------------- |
| Embedding model (all-MiniLM-L6-v2)            | ~350 MB        | ONNX weights    |
| LLM (Qwen2.5-Coder-0.5B Q4)                   | ~360 MB        | ONNX weights    |
| SQLite DB (100 notes × 2 KB avg)              | ~200 KB        | Text + metadata |
| Vector store (100 notes × 384 dims × 4 bytes) | ~150 KB        | BLOB format     |
| **Total baseline**                            | **~710 MB**    | Well under 1 GB |

### 5.2 Quota Check Triggers

| Trigger                           | Frequency                |
| --------------------------------- | ------------------------ |
| `VisibilityChange` event          | When user returns to tab |
| After model download              | One-time spike           |
| After note save (every 10th save) | Periodic check           |

## 6. Vector Storage

```typescript
const VECTOR_DIM = 384;

export function vectorToBlob(vector: Float32Array): ArrayBuffer {
  return vector.buffer.slice(
    vector.byteOffset,
    vector.byteOffset + vector.byteLength,
  );
}

export function blobToVector(blob: ArrayBuffer): Float32Array {
  return new Float32Array(blob);
}

async function saveEmbedding(
  noteId: number,
  vector: Float32Array,
): Promise<void> {
  const blob = vectorToBlob(vector);
  await db.run(
    "INSERT OR REPLACE INTO note_embeddings (note_id, embedding, model_version, dim) VALUES (?, ?, ?, ?)",
    [noteId, blob, "all-MiniLM-L6-v2", VECTOR_DIM],
  );
}
```

### 6.1 Storage Comparison

| Format              | Size per 384-dim vector | 10,000 notes |
| ------------------- | ----------------------- | ------------ |
| JSON string         | ~3,500 bytes            | ~35 MB       |
| BLOB (Float32Array) | **1,536 bytes**         | **~15 MB**   |

## 7. Error Handling

| Error                     | Recovery Strategy                     |
| ------------------------- | ------------------------------------- |
| OPFS mount race           | Promise-gated readiness, skeleton UI  |
| Multi-tab collision       | Web Locks API + optimistic versioning |
| Quota exhaustion          | StorageManager.persist() prompt       |
| Vector corruption         | Re-compute from chunk_text            |
| SQLite WASM handler crash | Worker restart with state recovery    |

## 8. References

- ADR-001: Storage & Concurrency Strategy
- ADR-003: Embedding & Vector Pipeline Strategy
- [MDN: Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API)
- [MDN: Origin Private File System](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system)
- [wa-sqlite GitHub](https://github.com/nicholasgasior/wa-sqlite)
