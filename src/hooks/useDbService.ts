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
} from "@/types/database";

// ── DbService Class ──────────────────────────────────────────────────────

export class DbService implements DbServiceInterface {
  #ready: Promise<void>;
  #resolveReady!: () => void;
  #rejectReady!: (reason: Error) => void;
  #worker: DedicatedWorker;
  #initialized: boolean = false;

  constructor(worker: DedicatedWorker) {
    this.#worker = worker;
    this.#ready = new Promise((resolve, reject) => {
      this.#resolveReady = resolve;
      this.#rejectReady = reject;
    });

    // Wire up message handler
    this.#worker.addEventListener("message", (e: MessageEvent) => {
      if (e.data.type === "MOUNTED") {
        this.#resolveReady();
      }
      if (e.data.type === "MOUNT_ERROR") {
        this.#rejectReady(new Error(e.data.error?.message || "Mount failed"));
      }
    });
  }

  /** Initialize the database by mounting the OPFS file. */
  initialize(): void {
    if (this.#initialized) return;
    this.#initialized = true;

    this.#worker.postMessage({ type: "MOUNT", path: "semanticnotes.db" });
  }

  /** Execute a SQL query and return results. */
  async query(sql: string, params: any[] = []): Promise<any> {
    await this.#ready;

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
