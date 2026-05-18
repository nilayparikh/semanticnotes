/**
 * Database Service Hook
 *
 * Manages wa-sqlite WASM worker with OPFS persistence.
 * Cross-compiled from `docs/architecture/02_storage_layer_spec.md`.
 */

import { useEffect, useRef, useCallback } from "react";
import {
  NOTES_TABLE_SQL,
  EMBEDDINGS_TABLE_SQL,
  INDEXES_SQL,
  DbServiceInterface,
  type NoteRow,
} from "@/types/database";

const FALLBACK_STORAGE_KEY = "semanticnotes.db.fallback";
const FALLBACK_TIMEOUT_MS = 1500;

interface FallbackFtsRow {
  note_id: string;
  title: string;
  content: string;
}

interface FallbackEmbeddingRow {
  note_id: string;
  chunk_index: number;
  chunk_text: string;
  embedding: number[];
  model_version: string;
  dim: number;
  updated_at: string;
  updated_ts: number;
}

interface FallbackDbState {
  notes: NoteRow[];
  notesFts: FallbackFtsRow[];
  noteEmbeddings: FallbackEmbeddingRow[];
}

class BrowserFallbackDbService {
  #load(): FallbackDbState {
    if (typeof localStorage === "undefined") {
      return { notes: [], notesFts: [], noteEmbeddings: [] };
    }

    const raw = localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (!raw) {
      return { notes: [], notesFts: [], noteEmbeddings: [] };
    }

    try {
      const parsed = JSON.parse(raw) as Partial<FallbackDbState>;
      return {
        notes: parsed.notes ?? [],
        notesFts: parsed.notesFts ?? [],
        noteEmbeddings: parsed.noteEmbeddings ?? [],
      };
    } catch {
      return { notes: [], notesFts: [], noteEmbeddings: [] };
    }
  }

  #save(state: FallbackDbState): void {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(state));
  }

  #normalize(sql: string): string {
    return sql.replace(/\s+/g, " ").trim().toUpperCase();
  }

  #toEmbeddingArray(embedding: unknown): number[] {
    if (embedding instanceof Uint8Array) {
      return Array.from(
        new Float32Array(
          embedding.buffer.slice(
            embedding.byteOffset,
            embedding.byteOffset + embedding.byteLength,
          ),
        ),
      );
    }

    if (embedding instanceof ArrayBuffer) {
      return Array.from(new Float32Array(embedding));
    }

    if (ArrayBuffer.isView(embedding)) {
      const view = embedding as ArrayBufferView;
      return Array.from(
        new Float32Array(
          view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength),
        ),
      );
    }

    if (Array.isArray(embedding)) {
      return embedding.map((value) => Number(value));
    }

    return [];
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const normalized = this.#normalize(sql);
    const state = this.#load();

    if (normalized === "SELECT * FROM NOTES") {
      return [...state.notes];
    }

    if (normalized.startsWith("INSERT INTO NOTES (")) {
      const [id, title, content, note_version, created_at, updated_at, updated_ts] = params;
      state.notes.push({ id, title, content, note_version, created_at, updated_at, updated_ts });
      this.#save(state);
      return [];
    }

    if (normalized.startsWith("UPDATE NOTES SET TITLE = ?, CONTENT = ?, NOTE_VERSION = NOTE_VERSION + 1")) {
      const [title, content, updated_at, updated_ts, id] = params;
      state.notes = state.notes.map((note) =>
        note.id === id
          ? {
              ...note,
              title,
              content,
              note_version: note.note_version + 1,
              updated_at,
              updated_ts,
            }
          : note,
      );
      this.#save(state);
      return [];
    }

    if (normalized.startsWith("DELETE FROM NOTES WHERE ID = ?")) {
      const [id] = params;
      state.notes = state.notes.filter((note) => note.id !== id);
      this.#save(state);
      return [];
    }

    if (normalized === "DELETE FROM NOTES_FTS") {
      state.notesFts = [];
      this.#save(state);
      return [];
    }

    if (normalized.includes("INSERT INTO NOTES_FTS (NOTE_ID, TITLE, CONTENT) SELECT ID, TITLE, CONTENT FROM NOTES")) {
      state.notesFts = state.notes.map((note) => ({
        note_id: note.id,
        title: note.title,
        content: note.content,
      }));
      this.#save(state);
      return [];
    }

    if (normalized.startsWith("INSERT INTO NOTES_FTS (NOTE_ID, TITLE, CONTENT) VALUES")) {
      const [noteId, title, content] = params;
      state.notesFts = state.notesFts.filter((row) => row.note_id !== noteId);
      state.notesFts.push({ note_id: noteId, title, content });
      this.#save(state);
      return [];
    }

    if (normalized.startsWith("UPDATE NOTES_FTS SET TITLE = ?, CONTENT = ? WHERE NOTE_ID = ?")) {
      const [title, content, noteId] = params;
      state.notesFts = state.notesFts.map((row) =>
        row.note_id === noteId ? { ...row, title, content } : row,
      );
      this.#save(state);
      return [];
    }

    if (normalized.startsWith("DELETE FROM NOTES_FTS WHERE NOTE_ID = ?")) {
      const [noteId] = params;
      state.notesFts = state.notesFts.filter((row) => row.note_id !== noteId);
      this.#save(state);
      return [];
    }

    if (normalized.startsWith("DELETE FROM NOTE_EMBEDDINGS WHERE NOTE_ID = ?")) {
      const [noteId] = params;
      state.noteEmbeddings = state.noteEmbeddings.filter((row) => row.note_id !== noteId);
      this.#save(state);
      return [];
    }

    if (normalized.includes("INSERT OR REPLACE INTO NOTE_EMBEDDINGS")) {
      const [noteId, chunkIndex, chunkText, embedding, modelVersion, dim] = params;
      const row: FallbackEmbeddingRow = {
        note_id: noteId,
        chunk_index: chunkIndex,
        chunk_text: chunkText,
        embedding: this.#toEmbeddingArray(embedding),
        model_version: modelVersion,
        dim,
        updated_at: new Date().toISOString(),
        updated_ts: Date.now(),
      };
      state.noteEmbeddings = state.noteEmbeddings.filter(
        (entry) => !(entry.note_id === noteId && entry.chunk_index === chunkIndex),
      );
      state.noteEmbeddings.push(row);
      this.#save(state);
      return [];
    }

    if (normalized.startsWith("SELECT NOTE_ID, CHUNK_INDEX, EMBEDDING FROM NOTE_EMBEDDINGS")) {
      return state.noteEmbeddings.map((row) => ({
        note_id: row.note_id,
        chunk_index: row.chunk_index,
        embedding: row.embedding,
      }));
    }

    if (normalized.startsWith("SELECT NOTE_ID, TITLE, BM25(NOTES_FTS) AS RANK FROM NOTES_FTS WHERE NOTES_FTS MATCH ?")) {
      const [query] = params;
      const terms = String(query)
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      return state.notesFts
        .map((row) => {
          const haystack = `${row.title} ${row.content}`.toLowerCase();
          const title = row.title.toLowerCase();
          const score = terms.reduce((total, term) => {
            let next = total;
            if (title.includes(term)) next += 4;
            if (haystack.includes(term)) next += 2;
            return next;
          }, 0);
          return {
            note_id: row.note_id,
            title: row.title,
            rank: score === 0 ? 0 : -score,
          };
        })
        .filter((row) => row.rank !== 0)
        .sort((left, right) => left.rank - right.rank)
        .slice(0, 50);
    }

    if (
      normalized.startsWith("CREATE TABLE") ||
      normalized.startsWith("CREATE VIRTUAL TABLE") ||
      normalized.startsWith("CREATE INDEX")
    ) {
      return [];
    }

    return [];
  }
}

// ── DbService Class ──────────────────────────────────────────────────────

export class DbService implements DbServiceInterface {
  #ready: Promise<void>;
  #resolveReady!: () => void;
  #rejectReady!: (reason: Error) => void;
  #worker: DedicatedWorker;
  #initialized: boolean = false;
  #fallback: BrowserFallbackDbService | null = null;
  #fallbackTimer: ReturnType<typeof setTimeout> | null = null;
  #readySettled: boolean = false;

  constructor(worker: DedicatedWorker) {
    this.#worker = worker;
    this.#ready = new Promise((resolve, reject) => {
      this.#resolveReady = () => {
        if (this.#readySettled) return;
        this.#readySettled = true;
        if (this.#fallbackTimer) {
          clearTimeout(this.#fallbackTimer);
          this.#fallbackTimer = null;
        }
        resolve();
      };
      this.#rejectReady = (reason: Error) => {
        if (this.#readySettled) return;
        this.#readySettled = true;
        if (this.#fallbackTimer) {
          clearTimeout(this.#fallbackTimer);
          this.#fallbackTimer = null;
        }
        reject(reason);
      };
    });

    // Wire up message handler
    this.#worker.addEventListener("message", (e: MessageEvent) => {
      if (e.data.type === "MOUNTED") {
        this.#resolveReady();
      }
      if (e.data.type === "MOUNT_ERROR") {
        this.#enableFallback(e.data.error?.message || "Mount failed");
      }
    });

    this.#worker.addEventListener("error", (event: ErrorEvent) => {
      this.#enableFallback(event.message || "SQLite worker failed");
    });

    this.#worker.addEventListener("messageerror", () => {
      this.#enableFallback("SQLite worker message error");
    });
  }

  #enableFallback(reason: string): void {
    if (this.#fallback) return;
    console.warn(`DbService: using browser fallback storage (${reason})`);
    this.#fallback = new BrowserFallbackDbService();
    this.#resolveReady();
  }

  /** Initialize the database by mounting the OPFS file. */
  initialize(): void {
    if (this.#initialized) return;
    this.#initialized = true;

    this.#worker.postMessage({ type: "MOUNT", path: "semanticnotes.db" });
    this.#fallbackTimer = setTimeout(() => {
      this.#enableFallback("mount timeout");
    }, FALLBACK_TIMEOUT_MS);
  }

  /** Execute a SQL query and return results. */
  async query(sql: string, params: any[] = []): Promise<any> {
    await this.#ready;

    if (this.#fallback) {
      return this.#fallback.query(sql, params);
    }

    return new Promise((resolve, reject) => {
      const id = Date.now();
      this.#worker.postMessage({ type: "QUERY", id, sql, params });

      const handler = (e: MessageEvent) => {
        if (e.data.id === id) {
          if (e.data.type === "RESULT") {
            resolve(e.data.row);
          } else {
            reject(new Error(e.data.error?.message || "Query failed"));
          }
          this.#worker.removeEventListener("message", handler);
        }
      };

      this.#worker.addEventListener("message", handler);
    });
  }

  /** Promise that resolves when database is mounted. */
  get ready(): Promise<void> {
    return this.#ready;
  }

  /** Terminate the worker. */
  terminate(): void {
    this.#worker.terminate();
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────

export function useDbService(worker: DedicatedWorker) {
  const dbRef = useRef<DbService | null>(null);

  useEffect(() => {
    if (!dbRef.current) {
      dbRef.current = new DbService(worker);
      dbRef.current.initialize();
    }

    return () => {
      dbRef.current?.terminate();
    };
  }, [worker]);

  const query = useCallback(
    (sql: string, params?: any[]) => {
      return dbRef.current?.query(sql, params);
    },
    [],
  );

  return { db: dbRef.current, query };
}
