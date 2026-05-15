/**
 * Database Type Definitions
 *
 * Types matching the wa-sqlite SQLite schema for the storage layer.
 * Cross-compiled from `docs/architecture/02_storage_layer_spec.md`.
 */

// ── Row Types ─────────────────────────────────────────────────────────────

export interface NoteRow {
  id: number;
  title: string;
  content: string;
  note_version: number;
  created_at: string;
  updated_at: string;
  updated_ts: number;
}

export interface NoteEmbeddingRow {
  id: number;
  note_id: number;
  chunk_index: number;
  chunk_text: string | null;
  embedding: BufferSource; // BLOB stored as ArrayBuffer/Uint8Array
  model_version: string;
  dim: number;
  created_at: string;
  updated_at: string;
  updated_ts: number;
}

// ── Lock Types ────────────────────────────────────────────────────────────

export type DbLockMode = "exclusive" | "shared";

export interface LockOptions {
  mode: DbLockMode;
  timeoutMs?: number;
}

// ── Quota Types ───────────────────────────────────────────────────────────

export interface QuotaStatus {
  usageBytes: number;
  quotaBytes: number;
  usagePercent: number;
  isPersistent: boolean;
}

// ── Database Service Interface ────────────────────────────────────────────

export interface DbServiceInterface {
  initialize(): Promise<void>;
  query(sql: string, params?: any[]): Promise<any>;
  ready: Promise<void>;
}

// ── Schema SQL Constants ──────────────────────────────────────────────────

export const NOTES_TABLE_SQL = `CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  note_version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_ts INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
)`;

export const EMBEDDINGS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS note_embeddings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id INTEGER NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  chunk_text TEXT,
  embedding BLOB NOT NULL,
  model_version TEXT NOT NULL DEFAULT 'all-MiniLM-L6-v2',
  dim INTEGER NOT NULL DEFAULT 384,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_ts INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (note_id) REFERENCES notes(id),
  UNIQUE(note_id, chunk_index)
)`;

export const INDEXES_SQL = [
  `CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC)`,
  `CREATE INDEX idx_embeddings_note_id ON note_embeddings(note_id)`,
  `CREATE INDEX idx_embeddings_model ON note_embeddings(model_version)`,
];
