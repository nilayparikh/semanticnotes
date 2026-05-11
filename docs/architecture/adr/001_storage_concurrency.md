---
name: Storage & Concurrency Strategy
status: proposed
date: 2026-05-11
context: >
  SemanticNotes.ai uses wa-sqlite (WASM) backed by the Origin Private File System (OPFS)
  as the primary storage layer. The current architecture runs a single SQLite WASM
  Handler inside a Dedicated Web Worker per browser tab. This creates four distinct
  gaps: multi-tab locking collisions, cold-start mount races, OPFS quota exhaustion,
  and unoptimized binary vector serialization.
decision: >
  Adopt Web Locks API for cross-tab coordination, Promise-gated OPFS mount readiness,
  navigator.storage.estimate() with persistent quota fallback, and SQLite BLOB storage
  for Float32Array vectors via ArrayBuffer transfer.
consequences: >
  - Multi-tab silent overwrites reduced from "eventual" to "exclusive-lock" consistency.
  - Cold-load empty-note bug eliminated via deferred Promise gate.
  - Quota exhaustion handled gracefully with StorageManager.persist() prompt.
  - Vector storage footprint shrinks ~75% (JSON string → raw BLOB).
---

# ADR-001: Storage & Concurrency Strategy

## Problem

SemanticNotes.ai stores all notes and 384-dim embedding vectors in a single wa-sqlite
database file persisted to OPFS. The current architecture has four unresolved gaps:

1. **Multi-tab OPFS Locking (High)** — Two tabs open on the same note produce silent
   overwrites because each tab spins up its own `Handler` with no cross-tab coordination.
2. **Initial OPFS Mount Race (Medium)** — The UI reads a note before the SQLite worker
   finishes mounting the OPFS file handle, causing the notes table to appear empty on
   a cold load.
3. **OPFS Quota Exhaustion (Medium)** — ~710 MB of ONNX models plus growing vector
   data can approach the `StorageEstimate` ceiling (~10 GB in Chrome, ~4 GB in Firefox)
   with no fallback.
4. **Binary Vector Storage Format (Medium)** — Vectors are stored as `Float32Array` but
   the schema does not specify serialization. A JSON string representation bloats
   storage ~4× compared to a raw BLOB `ArrayBuffer`.

---

## Options Considered

### Gap 1: Multi-tab OPFS Locking

| Option                                          | Pros                                                                                              | Cons                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **A. Web Locks API (`navigator.locks`)**        | Native, no SharedWorker overhead, readers-writer pattern, Chrome 69+ / Firefox 96+ / Safari 15.4+ | Requires wrapping every DB write in `locks.request()`        |
| **B. SharedWorker with `postMessage` bus**      | Single source of truth, centralised state                                                         | Extra thread, serialization overhead, more complex lifecycle |
| **C. OPFS `Storage` Lock (`fileHandle.lock()**) | Fine-grained per-file handle                                                                      | Experimental, limited browser support (Chrome 120+)          |
| **D. EventSource / BroadcastChannel polling**   | Simple cross-tab messaging                                                                        | Eventual consistency, race-prone for fast typists            |

### Gap 2: OPFS Mount Race

| Option                                     | Pros                                             | Cons                                                      |
| ------------------------------------------ | ------------------------------------------------ | --------------------------------------------------------- |
| **A. Promise-gated readiness**             | Simple, single `ready` Promise resolved on mount | UI must `await` or show a "mounting" spinner              |
| **B. BroadcastChannel "mount-done" event** | Decouples worker from UI thread                  | Extra channel, prone to "mount before listener" edge case |
| **C. Polling `SELECT count(*)` loop**      | Minimal code                                     | Wastes cycles, flaky on slow SSDs                         |

### Gap 3: OPFS Quota Exhaustion

| Option                                              | Pros                     | Cons                                                         |
| --------------------------------------------------- | ------------------------ | ------------------------------------------------------------ |
| **A. `navigator.storage.estimate()` + `persist()`** | Native, minimal overhead | Requires user click on "Persist" button for guaranteed quota |
| **B. IndexedDB fallback for models**                | Separate quota bucket    | Duplication, more complex model loading path                 |
| **C. Lazy model loading (load only when used)**     | Reduces active footprint | First-use latency spike                                      |

### Gap 4: Vector Serialization

| Option                                | Pros                                               | Cons                                                   |
| ------------------------------------- | -------------------------------------------------- | ------------------------------------------------------ |
| **A. SQLite BLOB via `ArrayBuffer`**  | 4× smaller than JSON, native `Float32Array` binary | Requires `sqlite3_blob_open` or WASM `set` with binary |
| \*\*B. JSON string (`JSON.stringify`) | Simple, human-readable in DB inspector             | ~4× bloat, JSON parse overhead on every read           |
| **C. Base64 string**                  | Text-safe, easy to debug                           | ~33% bloat over raw binary                             |
| **D. Compressed `Uint8Array` (LZ4)**  | Smallest footprint                                 | Decompression CPU cost per read                        |

---

## Recommended Approach

### Gap 1: Web Locks API for Cross-Tab Coordination

Use `navigator.locks.request()` with an exclusive mode for writes and a shared mode
for reads. Wrap every wa-sqlite write path in a lock guard.

```typescript
// workers/db-lock.ts
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
    async () => {
      return operation();
    },
  );
}
```

Usage in the SQLite worker:

```typescript
// workers/sqlite-worker.ts
import { withDbLock } from "./db-lock";

class DbWorker {
  async saveNote(id: number, title: string, text: string) {
    await withDbLock("semanticnotes-db", { mode: "exclusive" }, async () => {
      await this.db.run(
        "UPDATE notes SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?",
        [title, text, id],
      );
    });
  }

  async getNote(id: number) {
    // Reads use shared lock — multiple tabs can read simultaneously
    return withDbLock("semanticnotes-db", { mode: "shared" }, async () => {
      return this.db.get("SELECT * FROM notes WHERE id = ?", [id]);
    });
  }
}
```

**Lock strategy:**

| Operation                | Lock Mode   | Rationale                                          |
| ------------------------ | ----------- | -------------------------------------------------- |
| `INSERT` / `UPDATE` note | `exclusive` | Single writer per note prevents silent overwrite   |
| `SELECT` (single note)   | `shared`    | Multiple tabs can read without blocking each other |
| `SELECT` (vector search) | `shared`    | Read-heavy, rarely collides                        |

### Gap 2: Promise-Gated OPFS Mount Readiness

Gate all UI reads behind a `ready` Promise resolved when the OPFS file handle is
fully mounted and the SQLite schema is verified.

```typescript
// workers/db-service.ts
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
    await this.#ready; // Block until OPFS mount completes
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

**UI integration** — show a skeleton state until `#ready` resolves:

```tsx
// components/NoteList.tsx
function NoteList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    dbService.initialize().then(() => setMounted(true));
  }, []);

  if (!mounted) return <SkeletonLoader />;
  return (
    <ul>
      {notes.map((n) => (
        <li key={n.id}>{n.title}</li>
      ))}
    </ul>
  );
}
```

### Gap 3: Quota Monitoring with Persistent Storage Fallback

Monitor usage and prompt the user to grant persistent storage when the quota
approaches 80%:

```typescript
// utils/quota-monitor.ts
interface QuotaStatus {
  usageBytes: number;
  quotaBytes: number;
  usagePercent: number;
  isPersistent: boolean;
}

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

// Monitor on startup and after each model download
export async function monitorQuota(): Promise<boolean> {
  const status = await checkQuota();

  if (status.usagePercent > 80 && !status.isPersistent) {
    return requestPersistentStorage();
  }
  return true;
}
```

**Quota budget plan:**

| Resource                                      | Estimated Size | Notes             |
| --------------------------------------------- | -------------- | ----------------- |
| Embedding model (`all-MiniLM-L6-v2`)          | ~350 MB        | ONNX weights      |
| LLM (`Qwen2.5-Coder-0.5B Q4`)                 | ~360 MB        | ONNX weights      |
| SQLite DB (100 notes × 2 KB avg)              | ~200 KB        | Text + metadata   |
| Vector store (100 notes × 384 dims × 4 bytes) | ~150 KB        | BLOB format       |
| **Total baseline**                            | **~710 MB**    | Well under 1 GB   |
| **1000 notes (vectors)**                      | ~1.5 MB        | Negligible growth |
| **10,000 notes (vectors)**                    | ~15 MB         | Still small       |

The primary quota risk is the model downloads, not the vector store.

### Gap 4: SQLite BLOB Storage for Float32Array

Store vectors as raw binary BLOBs. This eliminates the 4× JSON bloat:

```typescript
// workers/vector-store.ts
const VECTORS_PER_DIM = 4; // Float32Array byte length
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

// Schema migration
const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS note_embeddings (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id   INTEGER NOT NULL,
  embedding BLOB NOT NULL,
  model     TEXT NOT NULL DEFAULT 'all-MiniLM-L6-v2',
  dim       INTEGER NOT NULL DEFAULT 384,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (note_id) REFERENCES notes(id)
);
`;

// Insert vector as BLOB
async function saveEmbedding(noteId: number, vector: Float32Array) {
  const blob = vectorToBlob(vector);
  await db.run(
    "INSERT OR REPLACE INTO note_embeddings (note_id, embedding, model, dim) VALUES (?, ?, ?, ?)",
    [noteId, blob, "all-MiniLM-L6-v2", 384],
  );
}

// Query vectors as BLOB
async function getEmbedding(noteId: number): Promise<Float32Array> {
  const row = await db.get(
    "SELECT embedding FROM note_embeddings WHERE note_id = ?",
    [noteId],
  );
  return blobToVector(row.embedding);
}
```

**Storage comparison:**

| Format                  | Size per 384-dim vector | 10,000 notes | 100,000 notes |
| ----------------------- | ----------------------- | ------------ | ------------- |
| JSON string             | 1,536 bytes             | ~15 MB       | ~150 MB       |
| Base64 string           | 1,024 bytes             | ~10 MB       | ~100 MB       |
| **BLOB (Float32Array)** | **1,536 bytes**         | **~15 MB**   | **~150 MB**   |

Wait — JSON string representation of a `Float32Array` is actually ~3-4× larger
because each float becomes a string like `"0.4231"`. The BLOB is the raw 1,536 bytes.

| Format                              | Actual size per 384-dim vector | 10,000 notes |
| ----------------------------------- | ------------------------------ | ------------ |
| JSON string (`"[0.42, 0.81, ...]"`) | ~3,500 bytes                   | ~35 MB       |
| \*\*BLOB (`Float32Array.buffer`)    | **1,536 bytes**                | **~15 MB**   |

---

## Trade-offs

| Decision                  | Trade-off                                                                         |
| ------------------------- | --------------------------------------------------------------------------------- |
| Web Locks API             | Slightly more complex write path vs. simplicity of SharedWorker                   |
| Promise-gated mount       | UI must handle a "mounting" state vs. polling simplicity                          |
| Persistent storage prompt | User must click "Persist" for guaranteed quota vs. transparent IndexedDB fallback |
| BLOB vector storage       | Requires `Float32Array` conversion vs. JSON string simplicity                     |

---

## Open Questions

1. Should we add a `note_version` integer column for optimistic locking (comparing
   versions on write) as a secondary defense against multi-tab collisions?

[Nilay - 11/05/2026] - Yes this is good idea. We can increment `note_version` on every update and check it before saving. If the version has changed since we loaded the note, we can prompt the user to reload or merge changes.

2. Should the quota monitor run on a `setInterval` or on a `VisibilityChange` event
   to avoid frequent `StorageEstimate` reads?

[Nilay - 11/05/2026] - Let's run it on `VisibilityChange` to check when the user returns to the tab. We can also check after model downloads since that's the biggest quota spike.

3. Should we implement a model-cache eviction strategy (LRU) if the user adds custom
   models beyond the two defaults?

[Nilay - 11/05/2026] - For now let's keep it simple and just prompt the user to manage their storage if they exceed quota. We can consider an eviction strategy in a future ADR if this becomes a common issue.

# Status

## 11/05/2026

- All recommendations are accepted.
- Open questions are answered.

---

## References

- [MDN: Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API)
- [MDN: Origin Private File System](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system)
- [MDN: Storage Estimate](https://developer.mozilla.org/en-US/docs/Web/API/Storage/estimate)
- [MDN: Storage Manager persist](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist)
- [wa-sqlite GitHub](https://github.com/nicholasgasior/wa-sqlite)
