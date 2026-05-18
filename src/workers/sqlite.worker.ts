/**
 * SQLite WASM Worker
 *
 * Handles wa-sqlite operations in a dedicated thread.
 * Mounts database to OPFS for persistence.
 * Cross-compiled from `docs/architecture/02_storage_layer_spec.md`.
 */

import SQLiteESMFactory from "wa-sqlite/dist/wa-sqlite-async.mjs";
import * as SQLite from "wa-sqlite";
import { IDBMinimalVFS } from "wa-sqlite/src/examples/IDBMinimalVFS.js";
import {
  NOTES_TABLE_SQL,
  EMBEDDINGS_TABLE_SQL,
  NOTES_FTS_SQL,
  INDEXES_SQL,
} from "@/types/database";

let sqlite3: SQLite.SQLiteAPI | null = null;
let dbPtr: number = 0;

class WorkerIndexedDbVFS extends IDBMinimalVFS {
  constructor() {
    super("semanticnotes-idb");
  }

  handleAsync<T>(operation: () => Promise<T> | T): Promise<T> | T {
    return operation();
  }
}

async function initDb(): Promise<{ sqlite3: SQLite.SQLiteAPI; db: number }> {
  if (sqlite3 && dbPtr) {
    return { sqlite3, db: dbPtr };
  }

  const module = await SQLiteESMFactory();
  sqlite3 = SQLite.Factory(module);

  try {
    const vfs = new WorkerIndexedDbVFS();
    sqlite3.vfs_register(vfs, true);
    dbPtr = await sqlite3.open_v2("semanticnotes.db", undefined, vfs.name);
  } catch {
    dbPtr = await sqlite3.open_v2("semanticnotes.db");
  }

  return { sqlite3, db: dbPtr };
}

self.onmessage = async (e: MessageEvent) => {
  const { type } = e.data;

  switch (type) {
    case "MOUNT": {
      try {
        const { sqlite3: api, db } = await initDb();
        // Create schema
        await api.exec(db, NOTES_TABLE_SQL);
        await api.exec(db, EMBEDDINGS_TABLE_SQL);
        try {
          await api.exec(db, NOTES_FTS_SQL);
        } catch (error: any) {
          self.postMessage({
            type: "MOUNT_WARNING",
            warning: { message: error?.message || "FTS5 unavailable" },
          });
        }
        for (const idxSql of INDEXES_SQL) {
          await api.exec(db, idxSql);
        }

        self.postMessage({ type: "MOUNTED" });
      } catch (error: any) {
        self.postMessage({
          type: "MOUNT_ERROR",
          error: { message: error?.message || "Failed to mount database" },
        });
      }
      break;
    }

    case "QUERY": {
      try {
        const { sqlite3: api, db } = await initDb();
        const { id, sql, params } = e.data;

        let results;
        if (params && params.length > 0) {
          results = await api.execWithParams(db, sql, params);
        } else {
          results = await api.execWithParams(db, sql);
        }

        self.postMessage({ type: "RESULT", id, row: results.rows });
      } catch (error: any) {
        self.postMessage({
          type: "ERROR",
          id: e.data.id,
          error: { message: error?.message || "Query failed" },
        });
      }
      break;
    }

    case "COMMIT": {
      try {
        const { sqlite3: api, db } = await initDb();
        await api.run(db, "COMMIT");
        self.postMessage({ type: "COMMITTED", id: e.data.id });
      } catch (error: any) {
        self.postMessage({
          type: "ERROR",
          id: e.data.id,
          error: { message: error?.message || "Commit failed" },
        });
      }
      break;
    }
  }
};
