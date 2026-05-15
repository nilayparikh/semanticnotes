/**
 * SQLite WASM Worker
 *
 * Handles wa-sqlite operations in a dedicated thread.
 * Mounts database to OPFS for persistence.
 * Cross-compiled from `docs/architecture/02_storage_layer_spec.md`.
 */

import initSqlWasm, { Database } from "@vscode/sqlite3";
import {
  NOTES_TABLE_SQL,
  EMBEDDINGS_TABLE_SQL,
  INDEXES_SQL,
} from "@/types/database";

let db: Database | null = null;

async function initDb(): Promise<Database> {
  if (db) return db;

  await initSqlWasm();
  db = new Database("semanticnotes.db");
  return db;
}

self.onmessage = async (e: MessageEvent) => {
  const { type } = e.data;

  switch (type) {
    case "MOUNT": {
      try {
        const database = await initDb();
        // Create schema
        database.exec(NOTES_TABLE_SQL);
        database.exec(EMBEDDINGS_TABLE_SQL);
        database.exec(INDEXES_SQL);

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
        const database = await initDb();
        const { id, sql, params } = e.data;

        const stmt = database.prepare(sql);
        const results: any[] = [];

        while (stmt.step()) {
          results.push(stmt.get());
        }
        stmt.free();

        self.postMessage({ type: "RESULT", id, row: results });
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
        const database = await initDb();
        database.commit();
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
